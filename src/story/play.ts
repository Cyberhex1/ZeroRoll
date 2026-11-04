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

export type Completer = (messages: ChatMessage[], tier: Tier, opts: CompleteOptions) => Promise<RouterReply>;

export interface PlaySave extends StorySave {
  /** The state and message count just before the last narrator call, for reroll. */
  undo?: { state: StoryState; messageCount: number };
}

/** History sent to the model: the newest messages that fit, oldest first. */
const HISTORY_MESSAGES = 16;
const HISTORY_CHARS = 12_000;

let seq = 0;
const mid = () => `${Date.now().toString(36)}-${(seq++).toString(36)}`;

export function newSave(story: Story, tier: Tier = 'good'): PlaySave {
  return { version: 1, storyId: story.meta.id, state: newState(story), messages: [], length: ['short', 'medium', 'long'].indexOf(story.lengthTarget), tier, updatedAt: Date.now() };
}

/** Local 12B models (the basic tier) get the compact prompt. */
export function variantFor(tier: Tier): PromptVariant {
  return tier === 'basic' ? 'compact' : 'full';
}

export function buildPrompt(story: Story, save: PlaySave, tier: Tier): { system: string; messages: ChatMessage[] } {
  const variant = variantFor(tier);
  const system = `${storySystemPrompt(story, variant, targetWords(story, save.length))}\n\n${directorBlock(story, save.state, variant)}`;
  const convo: ChatMessage[] = [];
  let chars = 0;
  for (let i = save.messages.length - 1; i >= 0 && convo.length < HISTORY_MESSAGES; i--) {
    const m = save.messages[i];
    if ((m.kind !== 'player' && m.kind !== 'narrator') || !m.text) continue;
    chars += m.text.length;
    if (chars > HISTORY_CHARS && convo.length) break;
    convo.unshift({ role: m.kind === 'player' ? 'user' : 'assistant', content: m.text });
  }
  // Providers need the conversation to start with the player.
  while (convo.length && convo[0].role === 'assistant') convo.shift();
  if (!convo.length) convo.push({ role: 'user', content: save.messages.length ? 'Continue the story.' : 'Begin the story.' });
  return { system, messages: convo };
}

function artMessages(events: EngineEvent[], beat: string): StoryMessage[] {
  const seen = new Set<string>();
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
  messages.push(...artMessages(events, state.beat));
  return { save: { ...save, state, messages }, events };
}

/** Asks the narrator for the next reply and applies it. Throws the router's AIError on failure. */
export async function narrate(story: Story, save: PlaySave, complete: Completer, opts: { signal?: AbortSignal } = {}): Promise<{ save: PlaySave; events: EngineEvent[] }> {
  const undo = { state: save.state, messageCount: save.messages.length };
  const { system, messages } = buildPrompt(story, save, save.tier);
  const words = targetWords(story, save.length);
  const reply = await complete(messages, save.tier, {
    system,
    temperature: 0.85,
    maxTokens: Math.round(words * 2.2) + 220,
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
      answeredBy: `${providerName} (${reply.model}), ${reply.tier} tier`,
      chips: chipsFor(story, state, tail.choices),
      at: Date.now()
    },
    ...artMessages(events, state.beat)
  ];
  if (state.ending && !save.state.ending) {
    const end = beatOf(story, state.ending);
    out.push({ id: mid(), kind: 'note', text: `Ending reached: ${end.endingTitle ?? end.title}`, beat: state.beat, at: Date.now() });
  }
  return { save: { ...save, state, messages: out, undo }, events };
}

/** Reroll: back to the snapshot before the last narrator call. */
export function rewindForReroll(save: PlaySave): PlaySave | null {
  if (!save.undo) return null;
  return { ...save, state: save.undo.state, messages: save.messages.slice(0, save.undo.messageCount), undo: undefined };
}

/** The choice chips under the newest narrator message (the beat's authored ones before the first). */
export function currentChips(story: Story, save: PlaySave): Array<{ label: string; choiceId?: string }> {
  const lastNarrator = [...save.messages].reverse().find((m) => m.kind === 'narrator');
  return lastNarrator?.chips ?? chipsFor(story, save.state, []);
}
