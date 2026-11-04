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

/** World and progress changes from one reply: location, chapter on receipt, conclusion. */
export function applyWorld(exp: Experience, delta: StateDelta | null | undefined, alerts: CourseChangeAlert[]): Pick<Experience, 'gameWorldState' | 'concluded'> {
  const chapters = exp.storyOutline?.chapters?.length ?? 0;
  let chapter = exp.gameWorldState.currentChapter ?? 1;
  for (const a of alerts) if (a.type === 'chapter_transition') chapter = chapters ? Math.min(chapters, chapter + 1) : chapter + 1;
  const concluded = alerts.some((a) => a.type === 'story_conclusion') ? { reason: 'story' as const, at: new Date().toISOString() } : exp.concluded ?? null;
  return {
    gameWorldState: {
      ...exp.gameWorldState,
      currentChapter: chapter,
      ...(delta?.locationUpdate ? { currentLocation: delta.locationUpdate } : {})
    },
    concluded
  };
}
