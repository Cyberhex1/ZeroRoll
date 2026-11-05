/**
 * The memory worker. Every SUMMARY_EVERY turns it runs on the basic tier (the cheapest;
 * the local model in the PC app) and rewrites the rolling summary to cover the turns that
 * are about to leave the recent window. It also proposes facts for the memory list, which
 * wait as pending entries until the player accepts them.
 */
import type { ChatMessage } from '../ai/transport';
import type { CompleteOptions, RouterReply, Tier } from '../ai/router';
import { MemoryState, applyMerge, propose, setSummary } from './memoryStore';

export const SUMMARY_EVERY = 10;
/** Turns kept verbatim after the summary point; the summary covers everything before. */
export const RECENT_WINDOW = 12;

export type Completer = (messages: ChatMessage[], tier: Tier, opts: CompleteOptions) => Promise<RouterReply>;

export interface Turn {
  role: 'user' | 'assistant';
  content: string;
}

/** True when enough new turns have passed the window since the last summary. */
export function shouldSummarize(memory: MemoryState, turnCount: number): boolean {
  const coverable = turnCount - RECENT_WINDOW;
  return coverable >= memory.summarizedThrough + SUMMARY_EVERY;
}

const SYSTEM = [
  'You keep the memory of an interactive story so the narrator never forgets what happened.',
  'Reply with JSON only: {"summary": "...", "facts": ["...", "..."]}.',
  '- summary: 300 to 600 words, past tense, covering the previous summary plus the new turns. Keep names, places, promises, items, injuries, relationships and unresolved threads. Drop moment-to-moment description.',
  '- facts: up to 8 short standalone facts that must stay true later (who someone is, what the player owns or owes, what was revealed). Do not repeat facts already listed.'
].join('\n');

export function summaryRequest(previous: string, turns: Turn[], knownFacts: string[]): ChatMessage[] {
  const log = turns.map((t) => `${t.role === 'user' ? 'PLAYER' : 'NARRATOR'}: ${t.content}`).join('\n\n');
  return [
    {
      role: 'user',
      content: [
        `PREVIOUS SUMMARY\n${previous || '(none yet)'}`,
        `FACTS ALREADY KNOWN\n${knownFacts.length ? knownFacts.map((f) => `- ${f}`).join('\n') : '(none)'}`,
        `NEW TURNS\n${log}`
      ].join('\n\n')
    }
  ];
}

export function parseSummary(text: string): { summary: string; facts: string[] } | null {
  const raw = text.match(/\{[\s\S]*\}/)?.[0];
  if (!raw) return parseMarkdownSummary(text);
  try {
    const v = JSON.parse(raw.replace(/,\s*([}\]])/g, '$1'));
    if (typeof v.summary !== 'string' || !v.summary.trim()) return null;
    const facts = Array.isArray(v.facts) ? v.facts.filter((f: unknown): f is string => typeof f === 'string' && f.trim().length > 3).slice(0, 8) : [];
    return { summary: v.summary.trim(), facts };
  } catch (_) {
    return null;
  }
}

/**
 * Local models often answer "**Summary:** ... **Facts:** - ..." instead of JSON (playtest
 * D10). The summary is the text under the summary heading; facts are its bullet lines.
 */
function parseMarkdownSummary(text: string): { summary: string; facts: string[] } | null {
  const clean = text.replace(/\r\n/g, '\n');
  const m = clean.match(/(?:^|\n)\s*(?:#+\s*|\*\*)?summary(?:\*\*)?\s*:?\s*(?:\*\*)?\s*([\s\S]*?)(?=\n\s*(?:#+\s*|\*\*)?(?:key\s+)?facts?\b|$)/i);
  const summary = (m?.[1] ?? '').replace(/\*\*/g, '').trim();
  if (summary.length < 20) return null;
  const factsAt = clean.search(/\n\s*(?:#+\s*|\*\*)?(?:key\s+)?facts?\b/i);
  const facts = factsAt === -1 ? [] : clean.slice(factsAt).split('\n').slice(1)
    .map((l) => l.match(/^\s*(?:[-*•]|\d+[.)])\s+(.+)$/)?.[1]?.replace(/\*\*/g, '').trim() ?? '')
    .filter((f) => f.length > 3)
    .slice(0, 8);
  return { summary, facts };
}

/**
 * Summarizes the turns between the last summary point and the recent window. Returns the
 * memory unchanged (and throws nothing) if the model's reply cannot be read, so a bad
 * summary never blocks play; the next run tries again with the same turns.
 */
export async function summarize(memory: MemoryState, turns: Turn[], complete: Completer, opts: { signal?: AbortSignal } = {}): Promise<{ memory: MemoryState; ok: boolean }> {
  const end = Math.max(0, turns.length - RECENT_WINDOW);
  const fresh = turns.slice(memory.summarizedThrough, end);
  if (!fresh.length) return { memory, ok: true };
  const reply = await complete(summaryRequest(memory.summary, fresh, memory.entries.map((e) => e.text)), 'basic', {
    system: SYSTEM,
    json: true,
    temperature: 0.3,
    maxTokens: 1400,
    signal: opts.signal,
    feature: 'Story memory'
  });
  const parsed = parseSummary(reply.text);
  if (!parsed) return { memory, ok: false };
  return { memory: propose(setSummary(memory, parsed.summary, end), parsed.facts, end), ok: true };
}

const MERGE_SYSTEM = [
  'You tidy the memory list of an interactive story.',
  'Merge duplicates and near-duplicates, drop facts that later facts contradict or replace, and keep every name and number exact.',
  'Reply with JSON only: {"facts": ["...", "..."]}, at most 40 facts.'
].join('\n');

/** The merge pass offered past 60 entries. Pinned entries are kept as they are. */
export async function mergeMemories(memory: MemoryState, turn: number, complete: Completer): Promise<{ memory: MemoryState; ok: boolean }> {
  const unpinned = memory.entries.filter((e) => !e.pinned).map((e) => e.text);
  if (unpinned.length < 2) return { memory, ok: true };
  const reply = await complete([{ role: 'user', content: unpinned.map((f) => `- ${f}`).join('\n') }], 'basic', {
    system: MERGE_SYSTEM,
    json: true,
    temperature: 0.2,
    maxTokens: 1600,
    feature: 'Memory merge'
  });
  const raw = reply.text.match(/\{[\s\S]*\}/)?.[0];
  try {
    const facts = raw ? JSON.parse(raw).facts : null;
    if (!Array.isArray(facts) || !facts.length) return { memory, ok: false };
    return { memory: applyMerge(memory, facts.filter((f: unknown): f is string => typeof f === 'string'), turn), ok: true };
  } catch (_) {
    return { memory, ok: false };
  }
}

/**
 * The summarizer runs in the background while the player may keep playing. This turns
 * its result into a patch for whatever the memory is by the time it finishes: the new
 * summary and newly proposed facts, unless a later run already covered more turns.
 */
export function summaryPatch(before: MemoryState, after: MemoryState): (current: MemoryState) => MemoryState {
  const known = new Set(before.pending.map((p) => p.id));
  const added = after.pending.filter((p) => !known.has(p.id));
  return (cur) =>
    cur.summarizedThrough >= after.summarizedThrough
      ? cur
      : { ...cur, summary: after.summary, summarizedThrough: after.summarizedThrough, pending: [...cur.pending, ...added] };
}
