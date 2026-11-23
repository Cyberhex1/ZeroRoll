/**
 * Checks the 0.2 story decks (src/content/forge/decks). Run by `npm run content:check` and the
 * content tests. Errors fail CI; warnings are printed.
 */
import { CARD_FAMILIES, HERO_CARDS, TaggedCardKind, cardFits } from './familyTags';
import type { CategoryContent } from '../types';
import type { StoryDeck } from './types';
import type { ExperienceCategory } from '../../types';
import { ENGINES } from './engines';
import { hasKeyword } from '../validate';
import { OVERUSED_NAMES, isFreshName, nameFitsPronouns } from '../names';
import { shapeById } from '../../setup/storyShape';

export interface DeckReport {
  errors: string[];
  warnings: string[];
}

const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

/** Every string in a deck except the DNA titles (those are real works and may contain any word). */
function deckText(d: StoryDeck, opts: { signature: boolean }): string {
  const fam = d.families.flatMap((f) => [f.name, f.hero, f.start, f.turn, f.payoff, f.palette, f.rule ?? '']);
  return [opts.signature ? d.signature : '', ...fam, ...d.dna.map((x) => x.dna), ...d.hooks, ...d.places, ...d.complications, ...d.setPieces].join(' \n ');
}

export function validateDecks(
  decks: Record<string, StoryDeck>,
  content: Record<string, CategoryContent>,
  expectedIds: readonly string[],
  names?: { traditions: Record<string, { feminine: string[]; masculine: string[]; neutral: string[]; family: string[] }>; familyMap: Record<string, string[]> }
): DeckReport {
  const errors: string[] = [];
  const warnings: string[] = [];
  for (const id of expectedIds) if (!decks[id]) errors.push(`${id}: no story deck.`);
  for (const [cat, d] of Object.entries(decks)) {
    if (!expectedIds.includes(cat)) errors.push(`${cat}: deck for an unknown category.`);
    if (!d.signature?.trim()) errors.push(`${cat}: deck has no signature.`);
    if ((d.families?.length ?? 0) < 3) errors.push(`${cat}: ${d.families?.length ?? 0} families (need 3 or more).`);
    const famIds = new Set<string>();
    const dnaIds = new Set<string>();
    for (const x of d.dna ?? []) {
      if (dnaIds.has(x.id)) errors.push(`${cat}: dna id "${x.id}" is used twice.`);
      dnaIds.add(x.id);
      if (!x.medium?.trim()) errors.push(`${cat}/${x.id}: dna card has no medium.`);
      const n = words(x.dna ?? '');
      if (n < 15 || n > 80) errors.push(`${cat}/${x.id}: dna text is ${n} words (allowed 15 to 80).`);
      else if (n < 18 || n > 70) warnings.push(`${cat}/${x.id}: dna text is ${n} words (aim for 18 to 70).`);
    }
    for (const f of d.families ?? []) {
      if (famIds.has(f.id)) errors.push(`${cat}: family id "${f.id}" is used twice.`);
      famIds.add(f.id);
      for (const k of ['name', 'hero', 'start', 'turn', 'payoff', 'palette'] as const) if (!f[k]?.trim()) errors.push(`${cat}/${f.id}: family has no ${k}.`);
      if (!f.sources?.length) errors.push(`${cat}/${f.id}: family has no sources.`);
      for (const s of f.sources ?? []) if (!dnaIds.has(s)) errors.push(`${cat}/${f.id}: source "${s}" is not a dna card in this deck.`);
      for (const s of f.shapes ?? []) if (!shapeById(s)) errors.push(`${cat}/${f.id}: unknown shape "${s}".`);
    }
    for (const e of d.engines ?? []) if (!(e in ENGINES)) errors.push(`${cat}: unknown engine "${e}".`);
    if ((d.engines?.length ?? 0) < 3) errors.push(`${cat}: ${d.engines?.length ?? 0} engines (need 3 or more).`);
    const min = { hooks: 6, places: 4, complications: 3, setPieces: 6 } as const;
    for (const [k, n] of Object.entries(min) as Array<[keyof typeof min, number]>) {
      if ((d[k]?.length ?? 0) < n) errors.push(`${cat}: ${d[k]?.length ?? 0} ${k} (need ${n} or more).`);
    }
    const all = deckText(d, { signature: true });
    for (const name of OVERUSED_NAMES) if (new RegExp(`\\b${name}\\b`).test(all)) errors.push(`${cat}: deck text uses the overused name "${name}".`);
    // Real Life's signature names "supernatural" on purpose, so the signature is left out here.
    const noSig = deckText(d, { signature: false });
    for (const kw of content[cat]?.profile?.avoidKeywords ?? []) {
      if (hasKeyword(noSig, kw)) errors.push(`${cat}: deck text mentions "${kw}", which ${content[cat]?.card?.name ?? cat} avoids.`);
    }
  }
  if (names) {
    for (const [key, list] of Object.entries(names.familyMap)) {
      const [cat, fam] = key.split('.');
      if (!decks[cat]?.families.some((f) => f.id === fam)) errors.push(`names: FAMILY_TRADITIONS key "${key}" is not a deck family.`);
      for (const t of list) if (!names.traditions[t]) errors.push(`names: "${key}" maps to unknown tradition "${t}".`);
    }
    for (const [cat, d] of Object.entries(decks)) for (const f of d.families) if (!names.familyMap[`${cat}.${f.id}`]) warnings.push(`names: family ${cat}.${f.id} has no naming tradition (the category's are used).`);
    for (const [id, t] of Object.entries(names.traditions)) {
      for (const n of [...t.feminine, ...t.masculine, ...t.neutral, ...t.family]) if (!isFreshName(n)) errors.push(`names/${id}: "${n}" is an overused name.`);
      for (const n of t.feminine) if (!nameFitsPronouns(n, 'she/her')) errors.push(`names/${id}: feminine "${n}" reads as masculine.`);
      for (const n of t.masculine) if (!nameFitsPronouns(n, 'he/him')) errors.push(`names/${id}: masculine "${n}" reads as feminine.`);
      if (t.feminine.length < 6 || t.masculine.length < 6 || t.family.length < 6) errors.push(`names/${id}: needs 6 or more feminine, masculine and family names.`);
    }
  }
  // Bug test M2: family-tagged cards and per-family hero cards.
  for (const [cat, kinds] of Object.entries(CARD_FAMILIES)) {
    const d = decks[cat];
    if (!d) continue;
    const ids = new Set(d.families.map((f) => f.id));
    for (const [kind, cards] of Object.entries(kinds ?? {})) {
      const list = d[kind as TaggedCardKind] as readonly string[];
      for (const [card, tags] of Object.entries(cards ?? {})) {
        if (!list.includes(card)) errors.push(`${cat}: tagged ${kind} card is not in the deck: "${card.slice(0, 60)}".`);
        for (const t of tags) if (!ids.has(t)) errors.push(`${cat}: tagged card uses unknown family "${t}".`);
      }
    }
  }
  for (const [cat, d] of Object.entries(decks)) {
    for (const f of d.families) {
      if (!HERO_CARDS[`${cat}.${f.id}`]?.length) errors.push(`${cat}.${f.id}: no hero cards.`);
      const n = (kind: TaggedCardKind) => d[kind].filter((c) => cardFits(cat as ExperienceCategory, kind, c, f.id)).length;
      if (n('hooks') < 3 || n('places') < 2 || n('setPieces') < 3) errors.push(`${cat}.${f.id}: after family filtering needs 3 hooks, 2 places and 3 set-pieces (has ${n('hooks')}/${n('places')}/${n('setPieces')}).`);
    }
  }
  return { errors, warnings };
}
