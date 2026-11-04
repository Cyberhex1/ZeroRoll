/**
 * The memory list for one story or campaign: facts the model must not forget, a rolling
 * summary of what has scrolled out of the recent window, and facts the summarizer
 * proposed that the player has not accepted yet. Pure functions over a plain object so it
 * saves with the rest of the game.
 */
export interface MemoryEntry {
  id: string;
  text: string;
  pinned: boolean;
  source: 'manual' | 'auto' | 'beat' | 'state';
  /** Turn number when the entry was made. */
  createdTurn: number;
}

export interface MemoryState {
  entries: MemoryEntry[];
  /** Proposed by the summarizer; shown with Accept and Dismiss. */
  pending: MemoryEntry[];
  /** 300 to 600 words covering everything before the recent window. */
  summary: string;
  /** How many turns the summary covers. */
  summarizedThrough: number;
}

export const MERGE_THRESHOLD = 60;

let seq = 0;
const newId = () => `mem-${Date.now().toString(36)}-${(seq++).toString(36)}`;

export function emptyMemory(): MemoryState {
  return { entries: [], pending: [], summary: '', summarizedThrough: 0 };
}

const clean = (t: string) => t.replace(/\s+/g, ' ').trim().slice(0, 400);
const same = (a: string, b: string) => clean(a).toLowerCase() === clean(b).toLowerCase();

export function addEntry(m: MemoryState, text: string, turn: number, source: MemoryEntry['source'] = 'manual', pinned = false): MemoryState {
  const t = clean(text);
  if (!t || m.entries.some((e) => same(e.text, t))) return m;
  return { ...m, entries: [...m.entries, { id: newId(), text: t, pinned, source, createdTurn: turn }] };
}

export function editEntry(m: MemoryState, id: string, text: string): MemoryState {
  const t = clean(text);
  if (!t) return deleteEntry(m, id);
  return { ...m, entries: m.entries.map((e) => (e.id === id ? { ...e, text: t } : e)) };
}

export function deleteEntry(m: MemoryState, id: string): MemoryState {
  return { ...m, entries: m.entries.filter((e) => e.id !== id), pending: m.pending.filter((e) => e.id !== id) };
}

export function togglePin(m: MemoryState, id: string): MemoryState {
  return { ...m, entries: m.entries.map((e) => (e.id === id ? { ...e, pinned: !e.pinned } : e)) };
}

export function propose(m: MemoryState, facts: string[], turn: number): MemoryState {
  const fresh = facts
    .map(clean)
    .filter((f) => f && !m.entries.some((e) => same(e.text, f)) && !m.pending.some((p) => same(p.text, f)));
  const unique = fresh.filter((f, i) => fresh.findIndex((g) => same(g, f)) === i);
  return { ...m, pending: [...m.pending, ...unique.map((text) => ({ id: newId(), text, pinned: false, source: 'auto' as const, createdTurn: turn }))] };
}

export function acceptPending(m: MemoryState, id: string): MemoryState {
  const p = m.pending.find((e) => e.id === id);
  if (!p) return m;
  return { ...addEntry({ ...m, pending: m.pending.filter((e) => e.id !== id) }, p.text, p.createdTurn, 'auto') };
}

export function dismissPending(m: MemoryState, id: string): MemoryState {
  return { ...m, pending: m.pending.filter((e) => e.id !== id) };
}

export function setSummary(m: MemoryState, summary: string, through?: number): MemoryState {
  return { ...m, summary: summary.trim(), summarizedThrough: through ?? m.summarizedThrough };
}

/** True once the list is long enough that a merge pass is worth offering. */
export function needsMerge(m: MemoryState): boolean {
  return m.entries.length > MERGE_THRESHOLD;
}

/** Replaces the unpinned entries with a merged list; pinned entries are never touched. */
export function applyMerge(m: MemoryState, merged: string[], turn: number): MemoryState {
  const pinned = m.entries.filter((e) => e.pinned);
  let next: MemoryState = { ...m, entries: pinned };
  for (const t of merged) next = addEntry(next, t, turn, 'auto');
  return next;
}
