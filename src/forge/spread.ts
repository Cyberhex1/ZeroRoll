/**
 * The Spread (0.2, plan 4.2): one card from each part of the category's story deck, drawn in
 * code (free), avoiding what this player drew recently. The model fuses the spread into a story.
 */
import type { ExperienceCategory } from '../types';
import type { EngineId, SourceDna, StoryDeck, StoryFamily } from '../content/forge/types';
import { STORY_DECKS } from '../content/forge/decks';
import { ENGINES, PlotEngine } from '../content/forge/engines';
import { CLOSING_CARDS, OPENING_CARDS } from '../content/forge/cards';
import { StoryShape, StoryShapeId, pickShape } from '../setup/storyShape';
import { recent, remember } from './recent';
import { namesOnHandFrom, traditionsFor } from './names';
import { recentRolls } from '../lib/rollFreshness';

export interface Spread {
  category: ExperienceCategory;
  family: StoryFamily;
  primary: SourceDna;
  /** Second influence, for one idea only. Absent on local models. */
  spice?: SourceDna;
  engineId: EngineId;
  engine: PlotEngine;
  /** The offered hook; a picked story seed takes its place. */
  hook: string;
  /** True when `hook` is the player's picked seed, not a deck card. */
  hookIsSeed: boolean;
  place: string;
  complication: string;
  setPieces: string[];
  shape: StoryShape;
  opening: string;
  closing: string;
  names: { given: string[]; family: string[] };
}

export interface DrawOptions {
  rand?: () => number;
  /** Book Two: same family and primary influence as Book One. */
  keepFamily?: string;
  keepPrimary?: string;
  /** Prefer this shape when the family allows it (the setup menu's pick). */
  shape?: StoryShape;
  /** Never this shape (the previous roll's), unless it's the only one allowed. */
  notShape?: StoryShapeId;
  /** A story seed the player picked: it replaces the hook. */
  seed?: string;
  pronouns?: string;
  /** Local model: no second influence and two set-pieces (shorter prompt). */
  local?: boolean;
  /** Names to keep out of names on hand (used in this campaign already). */
  excludeNames?: string[];
}

export function deckFor(category: ExperienceCategory): StoryDeck {
  return (STORY_DECKS as Record<string, StoryDeck>)[category] ?? STORY_DECKS.fantasy;
}

/** Uniform pick avoiding `avoid`; repeats allowed only when everything is recent. */
function pickFresh<T>(items: readonly T[], avoid: readonly string[], key: (x: T) => string, rand: () => number): T {
  const fresh = items.filter((x) => !avoid.includes(key(x)));
  const pool = fresh.length ? fresh : items;
  return pool[Math.floor(rand() * pool.length)] ?? items[0];
}

function pickWeighted(families: readonly StoryFamily[], rand: () => number): StoryFamily {
  const total = families.reduce((n, f) => n + (f.weight ?? 1), 0);
  let r = rand() * total;
  for (const f of families) {
    r -= f.weight ?? 1;
    if (r < 0) return f;
  }
  return families[families.length - 1];
}

function pickMany(items: readonly string[], n: number, avoid: readonly string[], rand: () => number): string[] {
  const out: string[] = [];
  const left = [...items];
  while (out.length < n && left.length) {
    const fresh = left.filter((x) => !avoid.includes(x));
    const pool = fresh.length ? fresh : left;
    const x = pool[Math.floor(rand() * pool.length)];
    out.push(x);
    left.splice(left.indexOf(x), 1);
  }
  return out;
}

export function drawSpread(category: ExperienceCategory, opts: DrawOptions = {}): Spread {
  const rand = opts.rand ?? Math.random;
  const deck = deckFor(category);

  // Family: weighted, never the previous roll's when the deck has 3 or more.
  const kept = opts.keepFamily ? deck.families.find((f) => f.id === opts.keepFamily) : undefined;
  const lastFamily = recent(category, 'family')[0];
  const famPool = deck.families.length >= 3 ? deck.families.filter((f) => f.id !== lastFamily) : deck.families;
  const family = kept ?? pickWeighted(famPool.length ? famPool : deck.families, rand);

  // Primary DNA from the family's sources, avoiding the last 3; spice: any other card.
  const byId = new Map(deck.dna.map((d) => [d.id, d] as const));
  const keptPrimary = opts.keepPrimary ? byId.get(opts.keepPrimary) : undefined;
  const sources = family.sources.map((id) => byId.get(id)).filter((d): d is SourceDna => !!d);
  const primary = keptPrimary ?? pickFresh(sources.length ? sources : deck.dna, recent(category, 'primary'), (d) => d.id, rand);
  const others = deck.dna.filter((d) => d.id !== primary.id);
  const spice = opts.local || !others.length ? undefined : pickFresh(others, recent(category, 'spice'), (d) => d.id, rand);

  const engineId = pickFresh(deck.engines, recent(category, 'engine'), (e) => e, rand);
  const hook = opts.seed?.trim() || pickFresh(deck.hooks, recent(category, 'hook'), (h) => h, rand);
  const place = pickFresh(deck.places, recent(category, 'place'), (p) => p, rand);
  const complication = pickFresh(deck.complications, recent(category, 'complication'), (c) => c, rand);
  const setPieces = pickMany(deck.setPieces, opts.local ? 2 : 3, recent(category, 'setPiece'), rand);

  const allowed = family.shapes;
  const shape = opts.shape && (!allowed?.length || allowed.includes(opts.shape.id)) ? opts.shape : pickShape(opts.notShape ?? opts.shape?.id, rand, allowed);

  const opening = pickFresh(OPENING_CARDS, recent('*', 'opening'), (c) => c, rand);
  const closing = pickFresh(CLOSING_CARDS, recent('*', 'closing'), (c) => c, rand);

  const exclude = [...recentRolls(category, 'heroName').flatMap((n) => n.split(/\s+/)), ...recent(category, 'npcName'), ...(opts.excludeNames ?? [])];
  const names = namesOnHandFrom(traditionsFor(category, family.id), { pronouns: opts.pronouns, exclude, rand });

  return {
    category,
    family,
    primary,
    ...(spice ? { spice } : {}),
    engineId,
    engine: ENGINES[engineId],
    hook,
    hookIsSeed: !!opts.seed?.trim(),
    place,
    complication,
    setPieces,
    shape,
    opening,
    closing,
    names
  };
}

/** Records the spread as drawn (after a successful build only). */
export function rememberSpread(s: Spread, extra: { premise?: string; npcNames?: string[] } = {}): void {
  remember(s.category, 'family', s.family.id);
  remember(s.category, 'primary', s.primary.id);
  if (s.spice) remember(s.category, 'spice', s.spice.id);
  remember(s.category, 'engine', s.engineId);
  if (!s.hookIsSeed) remember(s.category, 'hook', s.hook);
  remember(s.category, 'place', s.place);
  remember(s.category, 'complication', s.complication);
  remember(s.category, 'setPiece', s.setPieces);
  remember('*', 'opening', s.opening);
  remember('*', 'closing', s.closing);
  if (extra.premise) remember(s.category, 'premise', extra.premise);
  if (extra.npcNames?.length) remember(s.category, 'npcName', extra.npcNames.flatMap((n) => n.split(/\s+/)).filter((w) => w.length > 2));
}

/** "Inspired by X and Y · family · engine": the player-facing line on the story card. */
export function inspiredByLine(s: Pick<Spread, 'primary' | 'spice' | 'family' | 'engine'>): string {
  const titles = [s.primary.title, s.spice?.title].filter(Boolean).join(' and ');
  return `Inspired by ${titles} · ${s.family.name} · ${s.engine.name}`;
}
