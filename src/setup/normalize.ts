/**
 * Deterministic checks on what the AI sends back for the setup menu (AGENTS.md 10): lengths,
 * names that fit the pronouns, skills from the real list, gear types, a legal point-buy spread.
 * Fixed parts (the player's own story, a hand-written opener) always win over the reply.
 */
import type { DMStoryOutline, ExperienceCategory, InventoryItem, StoryOutlineNPC } from '../types';
import { SKILLS, abilityPriorities, castsSpells, defaultProficiencies, roleTemplate } from '../dnd/rules';
import { cleanChapters, guessType } from '../dnd/applyTurn';
import { campaignTitle } from '../lib/titles';
import { uid } from '../lib/ids';
import { heroNameFor } from '../content/procedural';
import { isFreshName, nameFitsPronouns } from '../content/names';
import { getCategoryFallbackActions } from '../content';
import { fitPointBuy } from './pointBuy';
import type { HeroSheetDraft, StoryPackage } from './types';
import { StoryShapeId, shapeById } from './storyShape';

/** Input limits on the setup screen (PS10). The premise is re-sent with every turn, so it is capped. */
export const FIELD_LIMITS = {
  title: 100,
  heroName: 60,
  roleClass: 60,
  raceOrigin: 60,
  pronouns: 30,
  description: 500,
  premise: 2000,
  gearName: 60,
  spell: 60
} as const;

export const SKILL_PICKS = 4;
export const MAX_GEAR = 8;
export const MAX_SPELLS = 4;
const GEAR_TYPES: ReadonlyArray<InventoryItem['type']> = ['weapon', 'armor', 'potion', 'scroll', 'relic', 'misc'];

const str = (v: unknown, max: number): string => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, max) : '');
const strList = (v: unknown, max: number, count: number): string[] =>
  Array.isArray(v) ? [...new Set(v.map((x) => str(x, max)).filter(Boolean))].slice(0, count) : [];

const CHAPTER_PREFIX = /^(?:Chapter\s+(?:[IVXLC]+|\d+|One|Two|Three|Four|Five|Six)\s*[:.\-\u2013\u2014|]\s*)+/i;

/**
 * Chapter lines numbered once, in order. Models sometimes write "Chapter 4: Chapter 4: …"
 * or "Chapter Three:" on the fourth line (0.2 eval).
 */
export function numberChapters(chapters: string[]): string[] {
  return chapters
    .map((c) => c.replace(CHAPTER_PREFIX, '').replace(/^["'“”]+|["'“”]+$/g, '').trim())
    .filter(Boolean)
    .map((c, i) => `Chapter ${i + 1}: ${c}`);
}

/** A title without "Chapter I" and without wrapping quotes. */
export function cleanTitle(v: unknown): string {
  const bare = str(v, FIELD_LIMITS.title + 20)
    .replace(/^["'“”]+|["'“”]+$/g, '')
    .replace(/^Chapter\s+(?:[IVXLC]+|\d+|One)\s*[:\-\u2013\u2014|]\s*/i, '');
  return campaignTitle(bare).slice(0, FIELD_LIMITS.title);
}

/**
 * A hero name that fits the pronouns and is not a stock AI name. A name that fails either check
 * gets a new given name from the category's lists, keeping a fresh surname.
 */
export function fixName(v: unknown, category: ExperienceCategory, pronouns: string, familyId?: string): string {
  const name = str(v, FIELD_LIMITS.heroName).replace(/^["']+|["']+$/g, '');
  if (!name) return heroNameFor(category, pronouns, undefined, familyId);
  if (isFreshName(name) && nameFitsPronouns(name, pronouns)) return name;
  return heroNameFor(category, pronouns, name, familyId).slice(0, FIELD_LIMITS.heroName);
}

/** The skill from rules.SKILLS that a free-text name refers to, if any. */
export function matchSkill(v: unknown): string | undefined {
  const s = str(v, 40).toLowerCase().replace(/[-_]+/g, ' ');
  if (!s) return undefined;
  if (s in SKILLS) return s;
  return Object.keys(SKILLS).find((k) => s.includes(k));
}

/** Exactly SKILL_PICKS real skills: the reply's first, then the role's, then ones its best abilities use. */
export function normalizeSkills(v: unknown, roleClass: string): string[] {
  const picked = Array.isArray(v) ? v.map(matchSkill).filter((x): x is string => !!x) : [];
  const top = abilityPriorities(roleClass).slice(0, 2);
  const fill = [...defaultProficiencies(roleClass), ...Object.keys(SKILLS).filter((k) => top.includes(SKILLS[k])), ...Object.keys(SKILLS)];
  return [...new Set([...picked, ...fill])].slice(0, SKILL_PICKS);
}

/** Things a hero can sensibly carry several of under a singular name. */
const CONSUMABLE = /\b(torch|candle|ration|coin|arrow|bolt|dart|bandage|match|chalk|bead|nail|token|stake|herb|flare|cartridge|round|bullet|shell|seed|piece|bottle|stick|sheet|packet|pouch of)\b/i;

export function normalizeGear(v: unknown): InventoryItem[] {
  if (!Array.isArray(v)) return [];
  const out: InventoryItem[] = [];
  for (const raw of v) {
    const item = (typeof raw === 'string' ? { name: raw } : raw) as Record<string, unknown> | null;
    const name = str(item?.name, FIELD_LIMITS.gearName);
    if (!name || out.some((o) => o.name.toLowerCase() === name.toLowerCase())) continue;
    const type = GEAR_TYPES.includes(item?.type as InventoryItem['type']) ? (item!.type as InventoryItem['type']) : guessType(name);
    const asked = Number.isInteger(item?.quantity) && (item!.quantity as number) > 0 ? Math.min(item!.quantity as number, 99) : 1;
    // One harp, not ten (bug test N1): gear comes singly unless the name is plural or it is used up.
    const plural = /s\b/i.test(name.split(/\s+/).pop() ?? '');
    const single = type !== 'potion' && type !== 'scroll' && !plural && !CONSUMABLE.test(name);
    const quantity = single ? 1 : asked;
    const description = str(item?.description, 160);
    out.push({
      id: `item_${uid()}_${out.length}`,
      name,
      type,
      quantity,
      isEquipped: !!(item?.equipped ?? item?.isEquipped),
      ...(description ? { description } : {})
    });
    if (out.length >= MAX_GEAR) break;
  }
  return out;
}

/**
 * Up to MAX_SPELLS spells; a spellcasting role with none gets its usual ones. A role that would
 * not normally cast spells (a fighter, a thief, a nurse) gets none, whatever the reply says.
 */
export function normalizeSpells(v: unknown, roleClass: string): string[] {
  if (castsSpells(roleClass) === false) return [];
  const spells = strList(v, FIELD_LIMITS.spell, MAX_SPELLS);
  return spells.length ? spells : roleTemplate(roleClass).spells.slice(0, MAX_SPELLS);
}

export function normalizeSheet(v: unknown, roleClass: string): HeroSheetDraft {
  const s = (v && typeof v === 'object' ? v : {}) as Record<string, unknown>;
  return {
    stats: fitPointBuy(s.abilityScores ?? s.stats, roleClass),
    skills: normalizeSkills(s.skills, roleClass),
    gear: normalizeGear(s.gear ?? s.inventory),
    spells: normalizeSpells(s.spells, roleClass)
  };
}

export function normalizeOutline(v: unknown, premise: string, shape?: StoryShapeId): DMStoryOutline {
  const o = (v && typeof v === 'object' ? v : {}) as Record<string, unknown>;
  const npcs: StoryOutlineNPC[] = Array.isArray(o.keyNpcs)
    ? o.keyNpcs
        .map((n) => (n && typeof n === 'object' ? (n as Record<string, unknown>) : null))
        .filter((n): n is Record<string, unknown> => !!n && !!str(n.name, 60))
        .slice(0, 5)
        .map((n) => ({
          name: str(n.name, 60),
          role: str(n.role, 60),
          motivation: str(n.motivation, 240),
          ...(str(n.secret, 240) ? { secret: str(n.secret, 240) } : {}),
          ...(str(n.move, 240) ? { move: str(n.move, 240) } : {})
        }))
    : [];
  // 0.2: fronts (2 at most, 3 to 4 portents each) and set-pieces (4 to 6). Older replies have none.
  const fronts = Array.isArray(o.fronts)
    ? o.fronts
        .map((f) => (f && typeof f === 'object' ? (f as Record<string, unknown>) : null))
        .filter((f): f is Record<string, unknown> => !!f && !!str(f.name, 80))
        .map((f) => ({ name: str(f.name, 80), agenda: str(f.agenda, 240), portents: strList(f.portents, 240, 4) }))
        .filter((f) => f.portents.length >= 2)
        .slice(0, 2)
    : [];
  const setPieces = strList(o.setPieces, 300, 6);
  return {
    startingCircumstances: str(o.startingCircumstances, 600) || premise.slice(0, 600),
    backstory: str(o.backstory, 800),
    incitingIncident: str(o.incitingIncident, 600),
    immediateGoal: str(o.immediateGoal, 400),
    keyNpcs: npcs,
    majorConflicts: strList(o.majorConflicts, 300, 4),
    secretsAndReveals: strList(o.secretsAndReveals, 300, 4),
    chapters: numberChapters(cleanChapters(Array.isArray(o.chapters) ? o.chapters.map((c) => str(c, 300)) : [])),
    potentialEndings: strList(o.potentialEndings, 300, 4),
    ...((shape ?? shapeById(o.storyShape)?.id) ? { storyShape: shape ?? shapeById(o.storyShape)!.id } : {}),
    ...(str(o.turningPoint, 300) ? { turningPoint: str(o.turningPoint, 300) } : {}),
    ...(fronts.length ? { fronts } : {}),
    ...(setPieces.length ? { setPieces } : {})
  };
}

export interface FixedParts {
  title?: string;
  premise?: string;
  name?: string;
  roleClass?: string;
  origin?: string;
  actions?: string[];
}

/**
 * The checked story package from a raw JSON reply. Throws when the reply has no usable story.
 */
export function normalizeStoryReply(raw: unknown, ctx: { category: ExperienceCategory; pronouns: string; fixed?: FixedParts; shape?: StoryShapeId; familyId?: string }): StoryPackage {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const fixed = ctx.fixed ?? {};
  const heroRaw = (r.hero && typeof r.hero === 'object' ? r.hero : r) as Record<string, unknown>;

  const premise = (fixed.premise ?? str(r.premise ?? r.storyBlurb, FIELD_LIMITS.premise)).trim();
  const title = fixed.title ?? cleanTitle(r.title);
  if (!premise || !title) throw new Error('The reply had no story or no title.');

  const roleClass = fixed.roleClass ?? (str(heroRaw.roleClass ?? heroRaw.class, FIELD_LIMITS.roleClass) || 'Adventurer');
  const origin = fixed.origin ?? (str(heroRaw.origin ?? heroRaw.raceOrigin, FIELD_LIMITS.raceOrigin) || 'Human');
  const name = fixed.name ?? fixName(heroRaw.name ?? heroRaw.heroName, ctx.category, ctx.pronouns, ctx.familyId);
  const appearance = str(heroRaw.appearance ?? heroRaw.physicalDescription, FIELD_LIMITS.description);

  const actions = fixed.actions?.length ? fixed.actions.slice(0, 3) : strList(r.openingActions ?? r.suggestedActions, 160, 3);
  const filled = actions.length >= 3 ? actions : [...actions, ...getCategoryFallbackActions(ctx.category, 3)].slice(0, 3);

  return {
    title,
    premise,
    outline: normalizeOutline(r.outline ?? r.storyOutline, premise, ctx.shape),
    actions: filled,
    hero: { name, roleClass, origin, appearance },
    sheet: normalizeSheet(r.sheet ?? r, roleClass)
  };
}
