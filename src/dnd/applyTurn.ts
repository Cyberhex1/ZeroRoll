/**
 * Applies a game master reply to the campaign, in one place: the hero sheet (HP, items,
 * gold, conditions, spells, XP), the world (location, chapter), the alert on screen and the
 * conclusion lock. Pure, so every rule here is tested.
 */
import { uid } from '../lib/ids';
import type { CharacterSheet, CourseChangeAlert, Experience, InventoryItem, StateDelta } from '../types';
import { RulesMode, gainXp } from './rules';

export const rulesModeOf = (exp: Pick<Experience, 'rulesMode'>): RulesMode => exp.rulesMode ?? 'narrative';

/** "Healing Potion x2", "2 Healing Potions", "Healing Potion (3)" → name and count. */
export function itemCount(raw: string): { name: string; qty: number; explicit: boolean } {
  let s = raw.trim();
  let qty = 1;
  const tail = s.match(/^(.*?)\s*(?:x\s*(\d+)|\((\d+)\))$/i);
  const head = s.match(/^(\d+)\s+(.*)$/);
  if (tail) {
    s = tail[1];
    qty = parseInt(tail[2] ?? tail[3], 10);
  } else if (head) {
    qty = parseInt(head[1], 10);
    s = head[2];
  }
  return { name: s.trim(), qty: Math.max(1, qty || 1), explicit: !!(tail || head) };
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
const singular = (s: string) => s.replace(/(ies)$/, 'y').replace(/(?<![s])s$/, '');

/** The inventory entry a name refers to: exact (case-insensitive) first, then singular/plural. Never a substring. */
export function findItem(inv: InventoryItem[], name: string): number {
  const n = norm(name);
  const exact = inv.findIndex((i) => norm(i.name) === n);
  if (exact !== -1) return exact;
  return inv.findIndex((i) => singular(norm(i.name)) === singular(n));
}

/** Gold mentioned as an item ("15 gold", "Gold Coins x3") becomes a gold delta. */
const GOLD_RE = /^(gold( coins?| pieces?)?|coins?|gp)$/i;

export function applyInventory(inv: InventoryItem[], gained: string[], lost: string[]): { inventory: InventoryItem[]; goldDelta: number } {
  let next = inv.map((i) => ({ ...i }));
  let goldDelta = 0;
  for (const raw of gained) {
    const { name, qty, explicit } = itemCount(raw);
    if (!name) continue;
    if (GOLD_RE.test(name)) {
      goldDelta += qty;
      continue;
    }
    const at = findItem(next, name);
    // The GM often restates items the hero already has; only an explicit count adds more.
    if (at !== -1) {
      if (explicit) next[at].quantity += qty;
    }
    else next.push({ id: `item_${uid()}`, name, type: guessType(name), quantity: qty, isEquipped: false });
  }
  for (const raw of lost) {
    const { name, qty } = itemCount(raw);
    if (GOLD_RE.test(name)) {
      goldDelta -= qty;
      continue;
    }
    const at = findItem(next, name);
    if (at === -1) continue;
    next[at].quantity -= qty;
    if (next[at].quantity <= 0) next = next.filter((_, i) => i !== at);
  }
  return { inventory: next, goldDelta };
}

const COIN_RE = /(\d+)\s*(?:gold|gp)(?:\s*(?:coins?|pieces?))?\b/i;

/**
 * Coins in the starting kit ("Pouch of 15 Gold Coins", "Explorer's Pack & 15 Gold") become
 * the gold count, so they aren't counted twice (playtest D23). A pure purse is removed and
 * a bundle keeps its other part.
 */
export function splitStartingGold(inv: InventoryItem[]): { inventory: InventoryItem[]; gold: number } {
  let gold = 0;
  const inventory: InventoryItem[] = [];
  for (const item of inv) {
    const m = item.name.match(COIN_RE);
    if (!m) {
      inventory.push(item);
      continue;
    }
    gold += parseInt(m[1], 10) * Math.max(1, item.quantity || 1);
    const rest = item.name.replace(COIN_RE, '').replace(/\b(pouch|purse|bag)\s+of\s*$/i, '').replace(/\s*(&|and|,|with)\s*$/i, '').replace(/^\s*(&|and|,)\s*/i, '').trim();
    if (rest && !/^(pouch|purse|bag)( of)?$/i.test(rest)) inventory.push({ ...item, name: rest });
  }
  return { inventory, gold };
}

function guessType(name: string): InventoryItem['type'] {
  const n = name.toLowerCase();
  if (/sword|axe|bow|dagger|blade|spear|mace|staff|hammer|pistol|rifle|knife|club/.test(n)) return 'weapon';
  if (/armou?r|shield|helm|mail|plate|cloak|vest/.test(n)) return 'armor';
  if (/potion|elixir|tonic|draught|vial/.test(n)) return 'potion';
  if (/scroll|tome|book|map|letter|note/.test(n)) return 'scroll';
  if (/amulet|ring|relic|idol|crown|orb|gem|shard/.test(n)) return 'relic';
  return 'misc';
}

export interface SheetChange {
  character: CharacterSheet;
  /** Plain lines for the log, e.g. "Level 4!" or "Down at 0 HP: death saves begin." */
  notes: string[];
  /** Full 5e: the hero just dropped to 0 HP. */
  downed: boolean;
}

export function applyDelta(c: CharacterSheet, delta: StateDelta | null | undefined, mode: RulesMode): SheetChange {
  if (!delta) return { character: c, notes: [], downed: false };
  let next: CharacterSheet = { ...c };
  const notes: string[] = [];
  const wasUp = c.hp > 0;
  if (delta.hpDelta) next.hp = Math.min(next.maxHp, Math.max(0, next.hp + delta.hpDelta));
  const inv = applyInventory(next.inventory ?? [], delta.itemsGained ?? [], delta.itemsLost ?? []);
  next.inventory = inv.inventory;
  const gold = (delta.goldDelta ?? 0) + inv.goldDelta;
  if (gold) next.gold = Math.max(0, (next.gold ?? 0) + gold);
  const removed = new Set((delta.conditionsRemoved ?? []).map(norm));
  next.statusEffects = [...new Set([...(next.statusEffects ?? []).filter((x) => !removed.has(norm(x))), ...(delta.conditionsAdded ?? [])])];
  if (delta.spellsGained?.length) next.spells = [...new Set([...(next.spells ?? []), ...delta.spellsGained])];
  if (mode === 'full5e' && delta.xpGained) {
    const r = gainXp(next, delta.xpGained);
    next = r.character;
    if (r.levelsGained) notes.push(`Level ${next.level}! Max HP is now ${next.maxHp}.`);
  }
  if (next.hp > 0 && next.deathSaves) next.deathSaves = undefined;
  const downed = mode === 'full5e' && wasUp && next.hp <= 0;
  if (downed) {
    next.deathSaves = { successes: 0, failures: 0 };
    notes.push('Down at 0 HP. Roll death saves: three successes stabilize, three failures and the hero dies.');
  }
  return { character: next, notes, downed };
}

/** A conclusion or chapter change on screen is not replaced by a lesser alert (S10). */
export function nextAlert(current: CourseChangeAlert | null | undefined, incoming: CourseChangeAlert | null): CourseChangeAlert | null {
  if (!incoming) return current ?? null;
  const rank = (a?: CourseChangeAlert | null) => (a?.type === 'story_conclusion' ? 2 : a?.type === 'chapter_transition' ? 1 : 0);
  return current && rank(current) > rank(incoming) ? current : incoming;
}

const PLACEHOLDER_CHAPTER = /<[^>]*>|opening crisis, investigation|rising complications, early confrontations|deepening mystery and shocking|the climax, major revelation/i;

/** The outline's chapters without schema placeholder text the model copied (playtest D8). */
export function cleanChapters(chapters: unknown): string[] {
  if (!Array.isArray(chapters)) return [];
  return chapters.filter((c): c is string => typeof c === 'string' && !!c.trim() && !PLACEHOLDER_CHAPTER.test(c)).slice(0, 6);
}

/** Campaigns without a written roadmap (offline drafts) still run in three chapters. */
export const DEFAULT_CHAPTERS = 3;
/** Player turns a chapter lasts at least before the game master may move on. */
export const MIN_CHAPTER_TURNS = 3;

export const chapterCount = (exp: Pick<Experience, 'storyOutline'>): number => exp.storyOutline?.chapters?.length || DEFAULT_CHAPTERS;

/**
 * The alerts a reply may act on. A chapter change on the chapter's first turns is dropped,
 * and an ending before the last chapter becomes a chapter change, so stories aren't
 * skipped or rushed (playtest D8, D15).
 */
export function gateAlerts(exp: Pick<Experience, 'storyOutline' | 'gameWorldState'>, alerts: CourseChangeAlert[], turn: number): CourseChangeAlert[] {
  const total = chapterCount(exp);
  const chapter = exp.gameWorldState.currentChapter ?? 1;
  const started = exp.gameWorldState.chapterStartedTurn ?? 0;
  const early = turn - started < MIN_CHAPTER_TURNS;
  const out: CourseChangeAlert[] = [];
  let moved = false;
  for (const a of alerts) {
    if (a.type === 'story_conclusion' && chapter < total) {
      if (early || moved) continue;
      out.push({ ...a, type: 'chapter_transition' });
      moved = true;
    } else if (a.type === 'chapter_transition') {
      if (early || moved || chapter >= total) continue;
      out.push(a);
      moved = true;
    } else out.push(a);
  }
  return out;
}

/** World and progress changes from one reply: location, chapter on receipt, conclusion. */
export function applyWorld(exp: Experience, delta: StateDelta | null | undefined, alerts: CourseChangeAlert[], turn?: number): Pick<Experience, 'gameWorldState' | 'concluded'> {
  const total = chapterCount(exp);
  const before = exp.gameWorldState.currentChapter ?? 1;
  let chapter = before;
  for (const a of alerts) if (a.type === 'chapter_transition') chapter = Math.min(total, chapter + 1);
  const concluded = alerts.some((a) => a.type === 'story_conclusion') ? { reason: 'story' as const, at: new Date().toISOString() } : exp.concluded ?? null;
  return {
    gameWorldState: {
      ...exp.gameWorldState,
      currentChapter: Math.min(total, chapter),
      ...(chapter !== before && turn !== undefined ? { chapterStartedTurn: turn } : {}),
      ...(delta?.locationUpdate ? { currentLocation: delta.locationUpdate } : {})
    },
    concluded
  };
}
