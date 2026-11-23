/**
 * What the forge drew recently, per category, so the next roll draws something else.
 * One localStorage key; every read and write is guarded (private mode still rolls).
 * Recorded after a successful build only.
 */
import type { ExperienceCategory } from '../types';

const KEY = 'zeroroll_forge_recent_v1';

export type RecentField = 'family' | 'primary' | 'spice' | 'engine' | 'hook' | 'place' | 'complication' | 'setPiece' | 'premise' | 'npcName';
/** Opening and closing cards rotate across all categories. */
export type GlobalField = 'opening' | 'closing' | 'heroRole';

/** How many of each to remember. */
export const KEEP: Record<RecentField | GlobalField, number> = {
  family: 2,
  primary: 3,
  spice: 3,
  engine: 3,
  hook: 6,
  place: 4,
  complication: 3,
  setPiece: 6,
  premise: 6,
  npcName: 16,
  opening: 2,
  closing: 2,
  /** Offered hero cards, across all categories (bug test M1). */
  heroRole: 12
};

type Store = Record<string, string[]>;

function read(): Store {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || '{}');
    return v && typeof v === 'object' && !Array.isArray(v) ? v : {};
  } catch {
    return {};
  }
}

function write(s: Store): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    // Storage full or blocked: rolls still work, with less variety memory.
  }
}

const keyOf = (category: ExperienceCategory | '*', field: RecentField | GlobalField) => `${category}:${field}`;

/** Newest first. */
export function recent(category: ExperienceCategory | '*', field: RecentField | GlobalField): string[] {
  const v = read()[keyOf(category, field)];
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
}

export function remember(category: ExperienceCategory | '*', field: RecentField | GlobalField, values: string | string[]): void {
  const list = (Array.isArray(values) ? values : [values]).map((v) => v?.trim().slice(0, 400)).filter((v): v is string => !!v);
  if (!list.length) return;
  const s = read();
  const k = keyOf(category, field);
  s[k] = [...list, ...(s[k] ?? []).filter((x) => !list.includes(x))].slice(0, KEEP[field]);
  write(s);
}

export function clearRecent(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
