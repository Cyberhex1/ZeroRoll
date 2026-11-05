/**
 * Read access to the category content table. Everything per category comes from here.
 */
import type { CategoryInfo, CampaignInspiration, ExperienceCategory, InventoryItem } from '../types';
import { uid } from '../lib/ids';
import { CATEGORY_CONTENT } from './categories';
import { CATEGORY_IDS } from './categoryIds';
import type { CategoryContent, GearItem, NarrativeProfile, Opener } from './types';

export { CATEGORY_CONTENT, CATEGORY_IDS };
export type { CategoryContent, NarrativeProfile, Opener };

export function getContent(category: string): CategoryContent {
  return (CATEGORY_CONTENT as Record<string, CategoryContent>)[category] ?? CATEGORY_CONTENT.fantasy;
}

/** Home-screen cards (what categoriesData.ts used to hold). */
export const CATEGORIES_DATA: CategoryInfo[] = CATEGORY_IDS.map((id) => ({ id, ...CATEGORY_CONTENT[id].card }));

export function getCategoryProfile(category: string): NarrativeProfile & { name: string } {
  const c = getContent(category);
  return { ...c.profile, name: c.card.name };
}

/** Unbiased Fisher-Yates shuffle (the old sort(() => 0.5 - Math.random()) was not). */
export function shuffle<T>(items: readonly T[], rand: () => number = Math.random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function gearToInventory(gear: GearItem[], prefix = 'item'): InventoryItem[] {
  return gear.map((g, i) => ({
    id: `${prefix}_${uid()}_${i}`,
    name: g.name,
    type: g.type,
    quantity: g.quantity ?? 1,
    isEquipped: !!g.isEquipped,
    ...(g.description ? { description: g.description } : {})
  }));
}

export function getCategoryDefaultInventory(category: ExperienceCategory): InventoryItem[] {
  return gearToInventory(getContent(category).starterInventory, `inv_${category}`);
}

export function getAmbientEvent(category: ExperienceCategory): string {
  const pool = getContent(category).ambient;
  return pool[Math.floor(Math.random() * pool.length)];
}

/** Chips shown when a turn came back without suggested actions: the category's own sample prompts. */
/**
 * Chips for a reply that suggested no actions. They name nothing specific: the category's
 * sample prompts named taverns and people that weren't in the story, and the model then
 * followed them (playtest D4).
 */
const NEUTRAL_ACTIONS = [
  'Take a careful look around.',
  'Talk to whoever is closest.',
  'Check what you are carrying.',
  'Press on toward your goal.',
  'Ask about what just happened.',
  'Wait and watch for a moment.',
  'Look for another way forward.'
];

export function getCategoryFallbackActions(_category: ExperienceCategory, count = 3): string[] {
  return shuffle(NEUTRAL_ACTIONS).slice(0, count);
}

/* --------------------------------- openers --------------------------------- */

const SEEN_KEY = 'zeroroll_seen_openers';

function readSeen(): Record<string, string[]> {
  try {
    return JSON.parse(localStorage.getItem(SEEN_KEY) || '{}') || {};
  } catch (_) {
    return {};
  }
}

export function markOpenersSeen(category: ExperienceCategory, ids: string[]): void {
  try {
    const all = readSeen();
    all[category] = [...new Set([...(all[category] || []), ...ids])];
    localStorage.setItem(SEEN_KEY, JSON.stringify(all));
  } catch (_) {}
}

export interface OpenerDraw {
  opener: Opener;
  /** True when the category has too few openers and this one was built from a procedural hook. */
  padded: boolean;
}

/**
 * Up to `count` openers from this category only, ones the player has not seen first.
 * Once every opener has been seen the cycle starts over. Short categories are padded from
 * the category's own procedural hooks, and those are labelled as such.
 */
export function drawOpeners(category: ExperienceCategory, count = 5, rand: () => number = Math.random): OpenerDraw[] {
  const c = getContent(category);
  const seen = new Set(readSeen()[category] || []);
  let fresh = c.openers.filter((o) => !seen.has(o.id));
  if (fresh.length === 0 && c.openers.length) {
    try {
      const all = readSeen();
      delete all[category];
      localStorage.setItem(SEEN_KEY, JSON.stringify(all));
    } catch (_) {}
    fresh = [...c.openers];
  }
  const picks: OpenerDraw[] = shuffle(fresh, rand).slice(0, count).map((opener) => ({ opener, padded: false }));
  if (picks.length < count) {
    const used = new Set(picks.map((p) => p.opener.id));
    const rest = shuffle(c.openers.filter((o) => !used.has(o.id)), rand);
    for (const o of rest) {
      if (picks.length >= count) break;
      picks.push({ opener: o, padded: false });
    }
  }
  c.procedural.hooks.forEach((h, i) => {
    if (picks.length >= count) return;
    const hero = c.card.defaultCharacter;
    picks.push({
      padded: true,
      opener: {
        id: `${category}_hook_${i + 1}`,
        title: c.procedural.titles[i % c.procedural.titles.length] || `${c.card.name} opening ${i + 1}`,
        tagline: 'A quick-start scene from the built-in generator.',
        premise: h.hook,
        hero: { name: hero.name || 'Wanderer', role: hero.roleClass || 'Adventurer', origin: hero.raceOrigin || 'Human' },
        actions: [h.actions[0] || '', h.actions[1] || '', h.actions[2] || ''],
        gear: h.gear,
        spells: h.spells,
        hp: h.hp
      }
    });
  });
  return picks;
}

export function getOpenerById(id: string): Opener | undefined {
  for (const cid of CATEGORY_IDS) {
    const o = CATEGORY_CONTENT[cid].openers.find((x) => x.id === id);
    if (o) return o;
  }
  return undefined;
}

/* ------------------------------- inspiration ------------------------------- */

/** Picked once when a campaign is created and stored on it (see injection.ts). */
export function pickInspiration(category: ExperienceCategory, openerId?: string, rand: () => number = Math.random): CampaignInspiration {
  const c = getContent(category);
  return {
    media: shuffle(c.media, rand).slice(0, 4).map((m) => `${m.title} (${m.medium})`),
    tropes: shuffle(c.tropes, rand).slice(0, 3).map((t) => (t.conflict ? `${t.premise} Conflict: ${t.conflict}` : t.premise)),
    ...(openerId ? { openerId } : {})
  };
}
