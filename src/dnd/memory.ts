/**
 * D&D mode's side of the memory layer: the CURRENT STATE sheet sent every turn, the
 * budgeted story context (memory, summary, recent log) and memory entries made from the
 * game master's STATE_UPDATE blocks and story alerts.
 */
import type { CharacterSheet, CourseChangeAlert, DMStoryOutline, Experience, GameWorldState, LogMessage, StateDelta } from '../types';
import type { ChatMessage } from '../ai/transport';
import { MemoryState, addEntry, deleteEntry, emptyMemory } from '../memory/memoryStore';
import { PromptMeter, buildPrompt } from '../memory/promptBuilder';
import { Completer, Turn, shouldSummarize, summarize, summaryPatch } from '../memory/summarizer';
import { DEFAULT_CHAPTERS } from './applyTurn';

/** Leaves room for the game master prompt, the genre corpus and the roadmap. */
const DND_CONTEXT_TOKENS = 24_000;
const DND_REPLY_TOKENS = 2_000;

/** Reply cap for a local model's D&D turn: about 650 words, plus the blocks. */
export const LOCAL_DND_REPLY_TOKENS = 1_000;
/** The short local game master prompt and roadmap, with room to spare. */
const LOCAL_DND_SYSTEM_TOKENS = 1_800;

/**
 * The story context's budget. A local model runs at its own context (8k by default), and
 * Ollama cuts an oversized prompt from the top, which is where the block formats are, so
 * the local budget leaves a fifth spare for tokenizer differences (playtest D2).
 */
export function dndContextBudget(localContext?: number): { contextTokens: number; replyReserve: number } {
  if (!localContext) return { contextTokens: DND_CONTEXT_TOKENS, replyReserve: DND_REPLY_TOKENS };
  return { contextTokens: Math.max(1_500, Math.floor(localContext * 0.8) - LOCAL_DND_SYSTEM_TOKENS), replyReserve: LOCAL_DND_REPLY_TOKENS };
}

const n = (v: unknown, fallback: number) => (typeof v === 'number' && Number.isFinite(v) ? v : fallback);
const mod = (score: number) => {
  const m = Math.floor((score - 10) / 2);
  return m >= 0 ? `+${m}` : String(m);
};

/**
 * Everything the model must treat as true about the hero right now. HP 0 is sent as 0
 * (the old prompt used `||` and turned it into 12), and inventory and conditions are sent.
 */
export function currentStateBlock(c: Partial<CharacterSheet> | undefined, world?: Partial<GameWorldState>, outline?: Partial<DMStoryOutline>): string {
  if (!c) return '';
  const hp = n(c.hp, 12);
  const maxHp = n(c.maxHp, Math.max(hp, 12));
  const s = c.stats;
  const items = (c.inventory ?? []).map((i) => `${i.name}${i.quantity > 1 ? ` x${i.quantity}` : ''}${i.isEquipped ? ' (equipped)' : ''}`);
  const lines = [
    'CURRENT STATE (true right now; do not contradict it)',
    `Hero: ${c.name || 'Hero'} (${c.gender || 'they/them'}), level ${n(c.level, 1)} ${c.raceOrigin || 'Human'} ${c.roleClass || 'Adventurer'}`,
    `HP: ${hp}/${maxHp}${c.tempHp ? ` (+${c.tempHp} temporary)` : ''}${hp <= 0 ? ' (down: unconscious or dying)' : ''}. AC ${n(c.armorClass, 10)}.`,
    s ? `Abilities: STR ${s.str} (${mod(s.str)}), DEX ${s.dex} (${mod(s.dex)}), CON ${s.con} (${mod(s.con)}), INT ${s.int} (${mod(s.int)}), WIS ${s.wis} (${mod(s.wis)}), CHA ${s.cha} (${mod(s.cha)})` : '',
    `Inventory: ${items.length ? items.join(', ') : 'nothing'}`,
    `Conditions: ${c.statusEffects?.length ? c.statusEffects.join(', ') : 'none'}`,
    c.spells?.length ? `Spells: ${c.spells.join(', ')}` : '',
    world?.currentLocation ? `Location: ${world.currentLocation}` : '',
    world?.activeQuest ? `Quest: ${world.activeQuest}` : '',
    chapterLine(world, outline),
    c.gold !== undefined ? `Gold: ${c.gold}` : '',
    c.xp !== undefined ? `XP: ${c.xp}` : '',
    c.deathSaves && hp <= 0 ? `Death saves: ${c.deathSaves.successes} successes, ${c.deathSaves.failures} failures` : ''
  ];
  return lines.filter(Boolean).join('\n');
}

/** CURRENT CHAPTER: N of M, with the chapter's roadmap text (S10). */
export function chapterLine(world?: Partial<GameWorldState>, outline?: Partial<DMStoryOutline>): string {
  const chapters = outline?.chapters ?? [];
  const total = chapters.length || DEFAULT_CHAPTERS;
  const n = Math.min(total, Math.max(1, world?.currentChapter ?? 1));
  const last = n === total ? ' This is the final chapter.' : '';
  if (!chapters.length) return `CURRENT CHAPTER: ${n} of ${total} (no written roadmap: shape this chapter from the premise).${last}`;
  return `CURRENT CHAPTER: ${n} of ${total}: ${chapters[n - 1]}${last}`;
}

/** Marks the player's questions to the Rules Referee, which stay out of the story transcript. */
export const REFEREE_PREFIX = '[Rules Referee Check]:';

/** Story log messages as turns: the player and the game master only. */
export function dndTurns(logs: LogMessage[]): Turn[] {
  return logs
    .filter((l) => (l.sender === 'player' || l.sender === 'dm') && l.text && !l.text.startsWith(REFEREE_PREFIX))
    .map((l) => ({ role: l.sender === 'player' ? ('user' as const) : ('assistant' as const), content: l.text }));
}

export function experienceMemory(exp: Pick<Experience, 'memory'>): MemoryState {
  return exp.memory ?? emptyMemory();
}

/**
 * The story context for a turn: memory list, summary and as much recent log as fits.
 * The CURRENT STATE sheet is counted in the budget; executeActionTurn sends it itself.
 */
export function buildDndContext(exp: Experience, logs: LogMessage[] = exp.logs, recallScores?: Record<string, number> | null, localContext?: number): { contents: string; meter: PromptMeter } {
  const memory = experienceMemory(exp);
  const sheet = currentStateBlock(exp.character, exp.gameWorldState);
  const built = buildPrompt({
    system: '',
    sheets: [sheet],
    memory,
    turns: dndTurns(logs).slice(memory.summarizedThrough),
    ...dndContextBudget(localContext),
    recallScores
  });
  const context = built.system.slice(sheet.length).trim();
  const log = built.messages.map((m: ChatMessage) => `${m.role === 'user' ? 'PLAYER' : 'DM'}: ${m.content}`).join('\n');
  const omitted = built.meter.droppedTurns ? `[${built.meter.droppedTurns} earlier messages are covered by the memory and summary above]\n` : '';
  return { contents: [context, `Recent Story Log:\n${omitted}${log}`].filter(Boolean).join('\n\n'), meter: built.meter };
}

const gotPrefix = 'The hero has ';

/**
 * Memory entries from one turn. Inventory and conditions already ride in CURRENT STATE,
 * so only what CURRENT STATE forgets is kept: places reached, notable items gained (and
 * dropped again when lost), and story alerts, which are pinned.
 */
export function memoryFromTurn(memory: MemoryState, turn: number, delta?: StateDelta | null, alert?: CourseChangeAlert | null): MemoryState {
  let m = memory;
  if (delta?.locationUpdate) m = addEntry(m, `Visited ${delta.locationUpdate}.`, turn, 'state');
  for (const item of delta?.itemsGained ?? []) {
    const name = typeof item === 'string' ? item : (item as { name?: string })?.name;
    if (name) m = addEntry(m, `${gotPrefix}${name} (found on turn ${turn}).`, turn, 'state');
  }
  for (const lost of delta?.itemsLost ?? []) {
    const l = String(lost).toLowerCase();
    for (const e of m.entries) if (e.source === 'state' && e.text.startsWith(gotPrefix) && e.text.toLowerCase().includes(l)) m = deleteEntry(m, e.id);
  }
  if (alert?.title) m = addEntry(m, `${alert.title}: ${alert.description || alert.subtitle || ''}`.trim(), turn, 'state', alert.type === 'chapter_transition' || alert.type === 'twist');
  return m;
}

/** Same contract as the Story mode worker: returns a function to apply to the newest campaign. */
export async function maybeSummarizeExperience(exp: Experience, complete: Completer): Promise<((latest: Experience) => Experience) | null> {
  const memory = experienceMemory(exp);
  const turns = dndTurns(exp.logs);
  if (!shouldSummarize(memory, turns.length)) return null;
  try {
    const r = await summarize(memory, turns, complete);
    if (!r.ok) return null;
    const patch = summaryPatch(memory, r.memory);
    return (latest) => ({ ...latest, memory: patch(experienceMemory(latest)) });
  } catch (_) {
    return null;
  }
}
