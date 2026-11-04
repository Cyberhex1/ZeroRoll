/**
 * One Story mode turn, from the player's input to the saved result:
 *   1. an authored choice applies its flags (and may move the beat through the gate),
 *   2. the prompt is built: story bible + director block + recent messages,
 *   3. the router answers (any tier; basic is the local model in the PC app),
 *   4. the reply is split into narration and its structured tail,
 *   5. the engine applies the tail: flags, the beat claim (checked), art cues,
 *   6. narration, art and choice chips become messages, and the save is written.
 * Reroll restores the snapshot taken before step 3 and asks again.
 */
import type { ChatMessage } from '../ai/transport';
import type { CompleteOptions, RouterReply, Tier } from '../ai/router';
import { AI_PROVIDERS } from '../lib/providersConfig';
import { AIError } from '../lib/aiErrors';
import { EngineEvent, StoryState, applyChoice, applyNarratorTail, beatOf, chipsFor, newState } from './engine';
import { PromptVariant, directorBlock, parseNarratorReply, storySystemPrompt, targetWords } from './prompt';
import type { Story } from './schema';
import type { StoryMessage, StorySave } from '../storage/storyRepository';
import { MemoryState, addEntry, emptyMemory } from '../memory/memoryStore';
import { PromptMeter, buildPrompt as buildBudgetedPrompt } from '../memory/promptBuilder';
import { Turn, shouldSummarize, summarize, summaryPatch } from '../memory/summarizer';
import { contextTokensFor } from '../memory/tokens';
import { localContextFor } from '../desktop/localModel';

export type Completer = (messages: ChatMessage[], tier: Tier, opts: CompleteOptions) => Promise<RouterReply>;

export interface PlaySave extends StorySave {
  /** The state and message count just before the last narrator call, for reroll. */
  undo?: { state: StoryState; messageCount: number };
}

let seq = 0;
const mid = () => `${Date.now().toString(36)}-${(seq++).toString(36)}`;

export function newSave(story: Story, tier: Tier = 'good'): PlaySave {
  return { version: 1, storyId: story.meta.id, state: newState(story), messages: [], memory: emptyMemory(), length: ['short', 'medium', 'long'].indexOf(story.lengthTarget), tier, updatedAt: Date.now() };
}

/** Saves from before the memory layer have none; they start with an empty one. */
export function memoryOf(save: StorySave): MemoryState {
  return save.memory ?? emptyMemory();
}

/** The player and narrator messages as conversation turns, oldest first. */
export function turnsOf(save: StorySave): Turn[] {
  return save.messages
    .filter((m) => (m.kind === 'player' || m.kind === 'narrator') && m.text)
    .map((m) => ({ role: m.kind === 'player' ? ('user' as const) : ('assistant' as const), content: m.text! }));
}

function replyTokens(story: Story, save: StorySave): number {
  // Narration plus the JSON block, with room to spare: a reply cut off before its JSON loses the turn's state.
  return Math.round(targetWords(story, save.length) * 2.2) + 500;
}

/** Local 12B models (the basic tier) get the compact prompt. */
export function variantFor(tier: Tier): PromptVariant {
  return tier === 'basic' ? 'compact' : 'full';
}

/**
 * The prompt for the next narrator reply: story bible and director block (never trimmed),
 * the memory list, the summary, then as many recent turns as the tier's context allows.
 */
export function buildPrompt(story: Story, save: PlaySave, tier: Tier, recallScores?: Record<string, number> | null): { system: string; messages: ChatMessage[]; meter: PromptMeter } {
  const variant = variantFor(tier);
  const memory = memoryOf(save);
  const built = buildBudgetedPrompt({
    system: storySystemPrompt(story, variant, targetWords(story, save.length)),
    sheets: [directorBlock(story, save.state, variant)],
    memory,
    // Turns the summary already covers are left to it.
    turns: turnsOf(save).slice(memory.summarizedThrough),
    contextTokens: contextTokensFor(tier, localContextFor(tier)),
    replyReserve: replyTokens(story, save),
    recallScores
  });
  const convo = [...built.messages];
  // Providers need the conversation to start with the player.
  while (convo.length && convo[0].role === 'assistant') convo.shift();
  if (!convo.length) convo.push({ role: 'user', content: save.messages.length ? 'Continue the story.' : 'Begin the story.' });
  return { system: built.system, messages: convo, meter: built.meter };
}

/** Pins each beat the story enters, so the model always knows the path so far. */
function pinBeats(story: Story, memory: MemoryState, events: EngineEvent[], turn: number): MemoryState {
  let m = memory;
  for (const e of events) {
    if (e.kind !== 'beat') continue;
    const b = beatOf(story, e.to);
    m = addEntry(m, `${b.isEnding ? 'The story ended' : 'The story reached'}: ${b.title}.`, turn, 'beat', true);
  }
  return m;
}

/** Art for these events, skipping any picture the chat already shows (the narrator may cue the same art turn after turn). */
function artMessages(events: EngineEvent[], beat: string, shown: StoryMessage[] = []): StoryMessage[] {
  const seen = new Set<string>(shown.filter((m) => m.kind === 'art').map((m) => (m as { art: string }).art));
  return events
    .filter((e): e is Extract<EngineEvent, { kind: 'art' }> => e.kind === 'art')
    .filter((e) => (seen.has(e.art) ? false : (seen.add(e.art), true)))
    .map((e) => ({ id: mid(), kind: 'art' as const, art: e.art, beat, at: Date.now() }));
}

/** Adds the player's input (free text or an authored choice) and applies the choice. */
export function addPlayerInput(story: Story, save: PlaySave, input: { text?: string; choiceId?: string }): { save: PlaySave; events: EngineEvent[] } {
  let state = save.state;
  let events: EngineEvent[] = [];
  let text = input.text?.trim() ?? '';
  if (input.choiceId) {
    const r = applyChoice(story, state, input.choiceId);
    state = r.state;
    events = r.events;
    text = r.choice?.label ?? text;
  }
  const messages = [...save.messages];
  if (text) messages.push({ id: mid(), kind: 'player', text, beat: save.state.beat, at: Date.now() });
  messages.push(...artMessages(events, state.beat, messages));
  return { save: { ...save, state, messages, memory: pinBeats(story, memoryOf(save), events, state.turns) }, events };
}

/** Asks the narrator for the next reply and applies it. Throws the router's AIError on failure. */
export async function narrate(
  story: Story,
  save: PlaySave,
  complete: Completer,
  opts: { signal?: AbortSignal; recall?: (memory: MemoryState, turns: ChatMessage[], signal?: AbortSignal) => Promise<Record<string, number> | null> } = {}
): Promise<{ save: PlaySave; events: EngineEvent[] }> {
  const undo = { state: save.state, messageCount: save.messages.length };
  const memory = memoryOf(save);
  const scores = opts.recall ? await opts.recall(memory, turnsOf(save).slice(memory.summarizedThrough), opts.signal) : null;
  const { system, messages } = buildPrompt(story, save, save.tier, scores);
  const startedAt = Date.now();
  const reply = await complete(messages, save.tier, {
    system,
    temperature: 0.85,
    maxTokens: replyTokens(story, save),
    signal: opts.signal,
    feature: 'Story mode'
  });
  const { narration, tail } = parseNarratorReply(reply.text);
  const { state, events } = applyNarratorTail(story, save.state, tail);
  const providerName = AI_PROVIDERS[reply.provider]?.name || reply.provider;
  if (!narration) throw new AIError('bad_output', `${reply.model} sent only the story data and no story text. Try Reroll.`);
  // The opening beat's "on enter" art shows before the first narration.
  const opening = save.messages.some((m) => m.kind === 'narrator')
    ? []
    : artMessages(beatOf(story, save.state.beat).artCues.filter((c) => c.on === 'enter' && save.state.beat === story.start).map((c) => ({ kind: 'art' as const, art: c.art })), save.state.beat);
  const out: StoryMessage[] = [
    ...save.messages,
    ...opening,
    {
      id: mid(),
      kind: 'narrator',
      text: narration,
      beat: save.state.beat,
      answeredBy: `${providerName} (${reply.model}), ${reply.tier} tier, ${Math.max(1, Math.round((Date.now() - startedAt) / 1000))} s`,
      chips: chipsFor(story, state, tail.choices),
      at: Date.now()
    },
    ...artMessages(events, state.beat, [...save.messages, ...opening])
  ];
  if (state.ending && !save.state.ending) {
    const end = beatOf(story, state.ending);
    out.push({ id: mid(), kind: 'note', text: `Ending reached: ${end.endingTitle ?? end.title}`, beat: state.beat, at: Date.now() });
  }
  return { save: { ...save, state, messages: out, memory: pinBeats(story, memoryOf(save), events, state.turns), undo }, events };
}

/**
 * Runs the memory worker when enough turns have left the recent window. Returns a function
 * that applies the new summary and proposed facts to whatever the save is by the time the
 * worker finishes (the player may have played on), or null when there is nothing to apply.
 * Never throws: a failed or unreadable summary changes nothing and the next turn tries again.
 */
export async function maybeSummarize(save: PlaySave, complete: Completer, opts: { signal?: AbortSignal } = {}): Promise<((latest: PlaySave) => PlaySave) | null> {
  const memory = memoryOf(save);
  const turns = turnsOf(save);
  if (!shouldSummarize(memory, turns.length)) return null;
  try {
    const r = await summarize(memory, turns, complete, opts);
    if (!r.ok) return null;
    const patch = summaryPatch(memory, r.memory);
    return (latest) => ({ ...latest, memory: patch(memoryOf(latest)) });
  } catch (_) {
    return null;
  }
}

/** Reroll: back to the snapshot before the last narrator call. */
export function rewindForReroll(save: PlaySave): PlaySave | null {
  if (!save.undo) return null;
  const turn = save.undo.state.turns;
  // Beat pins made by the rerolled reply go with it; everything else in memory stays.
  const memory = memoryOf(save);
  const kept = { ...memory, entries: memory.entries.filter((e) => !(e.source === 'beat' && e.createdTurn > turn)) };
  return { ...save, state: save.undo.state, messages: save.messages.slice(0, save.undo.messageCount), memory: kept, undo: undefined };
}

/** The choice chips under the newest narrator message (the beat's authored ones before the first). */
export function currentChips(story: Story, save: PlaySave): Array<{ label: string; choiceId?: string }> {
  const lastNarrator = [...save.messages].reverse().find((m) => m.kind === 'narrator');
  return lastNarrator?.chips ?? chipsFor(story, save.state, []);
}
