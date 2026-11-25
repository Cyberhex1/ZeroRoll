/**
 * The Story Forge (0.2, plan section 4): Spread (code) -> Pitch (1 cheap call, cloud only)
 * -> pick (code) -> Build (1 call) -> names (code) -> Gate (code) -> Repair (at most 1 call).
 * rollStory (src/setup/storyRoll.ts) delegates here; failures throw a player-facing error from
 * there. No procedural stand-in: every story is still AI-written.
 */
import type { ExperienceCategory, ForgeRecord } from '../types';
import { activeLocalContext, executeJsonPrompt } from '../lib/geminiService';
import { AIError } from '../lib/aiErrors';
import { getCategoryProfile } from '../content';
import { rememberRoll } from '../lib/rollFreshness';
import { cleanTitle, normalizeStoryReply } from '../setup/normalize';
import type { FixedParts } from '../setup/normalize';
import { STORY_SCHEMA } from '../setup/schemas';
import { shapeById } from '../setup/storyShape';
import type { StoryShape } from '../setup/storyShape';
import type { StoryPackage } from '../setup/types';
import { Spread, drawSpread, rememberSpread } from './spread';
import { Pitch, pickPitch, pitchStories } from './pitch';
import { BuildMode, buildPrompt } from './prompts';
import { GateFailure, gatePremise, titleTics } from './gate';
import { repairPremise } from './repair';
import { fixNpcNames, traditionsFor } from './names';
import { recent } from './recent';
import { forgeDebug } from './debug';
import { checkContinuity } from './continuity';
import { deckFor } from './spread';

/** Plan section 3: the pitch stage can be switched off if Phase D's measurement shows no gain. */
export const PITCH_STAGE = true;

/** The continuity read (2026-11-25): one extra call per roll that fixes contradictions. */
export const CONTINUITY_STAGE = true;

export interface ForgeInput {
  category: ExperienceCategory;
  pronouns: string;
  mode: BuildMode;
  continuation?: string;
  seed?: string;
  shape?: StoryShape;
  turningPoint?: string;
  fixed?: FixedParts;
  signal?: AbortSignal;
  /** Book Two: keep Book One's family and primary influence. */
  previous?: ForgeRecord;
  /** "More ideas": build this pitch from this spread (no pitch call). */
  spread?: Spread;
  pitch?: Pitch;
  /** Testing and the eval: skip the pitch stage. */
  noPitch?: boolean;
  /** Testing and the eval: skip the continuity read. */
  noContinuity?: boolean;
  rand?: () => number;
}

export interface ForgeStats {
  pitchSkipped?: string;
  repaired: boolean;
  gateBefore: GateFailure[];
  gateAfter: GateFailure[];
  pitches: Pitch[];
  chosenIndex: number;
  /** What the continuity read found (empty when it passed or was skipped). */
  continuity?: string[];
  continuityFixed?: string[];
}

export type ForgedPackage = StoryPackage & { forge: ForgeRecord; alternates: Pitch[]; spread: Spread; stats: ForgeStats };


function isCancel(err: unknown): boolean {
  return (err instanceof AIError && err.kind === 'cancelled') || (err instanceof Error && err.name === 'AbortError');
}

/**
 * A turning point that came back as a bare chapter title ("Chapter 2: The Salt-Prison Horizon",
 * seen on Flash-Lite) takes the pitch's event, keeping the chapter.
 */
export function fullTurningPoint(tp: string | undefined, pitchTp: string): string | undefined {
  const t = (tp ?? '').trim();
  const m = t.match(/^((?:chapter|final chapter)\s*[\w]*\s*[:.\-–—]\s*)(.*)$/i);
  const body = m ? m[2] : t;
  if (body.split(/\s+/).filter(Boolean).length >= 6 || !pitchTp.trim()) return tp;
  return `${m ? m[1] : ''}${pitchTp.trim()}`.slice(0, 300);
}

export async function forgeStory(input: ForgeInput): Promise<ForgedPackage> {
  const { category, pronouns, mode, fixed = {} } = input;
  const local = !!activeLocalContext();
  const rand = input.rand ?? Math.random;
  const drawn =
    input.spread ??
    drawSpread(category, {
      rand,
      shape: input.shape,
      seed: mode === 'fresh' ? input.seed : undefined,
      pronouns,
      local,
      keepFamily: mode === 'sequel' ? input.previous?.family : undefined,
      keepPrimary: mode === 'sequel' ? input.previous?.dna?.[0] : undefined,
      excludeNames: fixed.name ? fixed.name.split(/\s+/) : []
    });
  // The offered hero is for fresh rolls; Book Two, adapt and openers keep their hero.
  const { heroCard: _unusedHero, ...rest } = drawn;
  const spread: Spread = mode === 'fresh' ? drawn : rest;
  const recentPremises = recent(category, 'premise');

  // 1. Pitch: fresh rolls on cloud models only. A failed pitch call never fails the roll.
  let pitch = input.pitch;
  let pitches: Pitch[] = [];
  let alternates: Pitch[] = [];
  let pitchSkipped: string | undefined;
  let chosenIndex = -1;
  if (!pitch && mode === 'fresh' && !local && PITCH_STAGE && !input.noPitch) {
    try {
      pitches = await pitchStories(spread, input.signal);
      const picked = pickPitch(pitches, { category, recentPremises, heroCard: spread.heroCard }, rand);
      pitch = picked.chosen;
      alternates = picked.others;
      chosenIndex = pitches.indexOf(picked.chosen);
    } catch (err) {
      if (isCancel(err)) throw err;
      pitchSkipped = err instanceof Error ? err.message : String(err);
      console.info(`[forge] pitch skipped: ${pitchSkipped}`);
    }
  } else if (local) {
    pitchSkipped = 'local model';
  }

  // 2. Build.
  const chooseShape = mode === 'adapt' || (mode === 'opener' && !input.shape);
  const raw = await executeJsonPrompt<Record<string, unknown>>(
    {
      userPrompt: buildPrompt({ mode, spread, pitch, pronouns, fixed, continuation: input.continuation, turningPoint: input.turningPoint, chooseShape }),
      temperature: mode === 'fresh' ? 0.95 : 0.85,
      thinking: 'low',
      tier: 'story',
      // A full story package is about 1,600 tokens; the cap stops a runaway reply early.
      maxTokens: 4096,
      schema: STORY_SCHEMA,
      signal: input.signal,
      feature: 'Story roll'
    },
    (v) => !!v && typeof v === 'object' && !!(fixed.premise || (typeof v.premise === 'string' && v.premise.trim())) && !!(fixed.title || (typeof v.title === 'string' && v.title.trim())) && typeof v.hero === 'object'
  );
  let pkg = normalizeStoryReply(raw, { category, pronouns, fixed, shape: chooseShape ? undefined : spread.shape.id, familyId: spread.family.id });
  if (mode === 'opener' && input.turningPoint) pkg.outline = { ...pkg.outline, turningPoint: input.turningPoint };
  else if (pitch) pkg.outline = { ...pkg.outline, turningPoint: fullTurningPoint(pkg.outline.turningPoint, pitch.turningPoint) };

  // 3. Names: stock NPC names get names from the family's traditions, everywhere they appear.
  const named = fixNpcNames({ title: pkg.title, premise: pkg.premise, outline: pkg.outline, actions: pkg.actions, heroName: pkg.hero.name }, traditionsFor(category, spread.family.id), rand);
  if (named.renamed.length) {
    forgeDebug('renamed', named.renamed);
    pkg = { ...pkg, title: fixed.title ?? named.title, premise: fixed.premise ?? named.premise, outline: named.outline, actions: fixed.actions?.length ? pkg.actions : named.actions };
  }

  // 4. Gate and at most one repair. A premise the player typed (or a hand-written opener's) is never touched.
  const gateCtx = {
    avoidKeywords: getCategoryProfile(category).avoidKeywords,
    recentPremises,
    turningPoint: pkg.outline.turningPoint,
    incitingIncident: pkg.outline.incitingIncident,
    startingCircumstances: pkg.outline.startingCircumstances,
    allowWords: [pkg.hero.name],
    heroName: pkg.hero.name
  };
  const gateBefore = fixed.premise ? [] : gatePremise(pkg.premise, gateCtx);
  let gateAfter = gateBefore;
  let repaired = false;
  // A title that leans on a worn word takes the pitch's title when that one is clean, else the repair writes one.
  if (!fixed.title && titleTics(pkg.title).length && pitch && !titleTics(pitch.title).length) pkg = { ...pkg, title: cleanTitle(pitch.title) };
  const badTitle = fixed.title ? [] : titleTics(pkg.title);
  if (gateBefore.length || badTitle.length) {
    try {
      const fix = await repairPremise({ premise: pkg.premise, title: pkg.title, titleTics: badTitle, outline: pkg.outline, failures: gateBefore, spread, signal: input.signal });
      const title = fix.title ? cleanTitle(fix.title) : '';
      if (title && !titleTics(title).length) pkg = { ...pkg, title };
      if (fix.premise) {
        const after = gatePremise(fix.premise, gateCtx);
        if (after.length <= gateBefore.length) {
          pkg = { ...pkg, premise: fix.premise };
          gateAfter = after;
          repaired = true;
        }
      }
    } catch (err) {
      if (isCancel(err)) throw err;
      console.info(`[forge] repair skipped: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  // 5. Continuity read: one call that reads the card as the player will and fixes what
  // contradicts itself. Never touches what the player typed. A failed call keeps the card.
  let continuity: string[] = [];
  const continuityFixed: string[] = [];
  if (CONTINUITY_STAGE && !input.noContinuity) {
    try {
      const card = { title: pkg.title, premise: pkg.premise, startingCircumstances: pkg.outline.startingCircumstances, immediateGoal: pkg.outline.immediateGoal ?? '', roleClass: pkg.hero.roleClass, origin: pkg.hero.origin };
      const res = await checkContinuity(card, { category, turningPoint: pkg.outline.turningPoint, signature: deckFor(category).signature, signal: input.signal });
      continuity = res.problems;
      const f = res.fixed;
      if (f.premise && !fixed.premise) {
        const after = gatePremise(f.premise, gateCtx);
        if (after.length <= gateAfter.length) {
          pkg = { ...pkg, premise: f.premise };
          gateAfter = after;
          continuityFixed.push('premise');
        }
      }
      if (f.title && !fixed.title && !titleTics(f.title).length) {
        pkg = { ...pkg, title: cleanTitle(f.title) };
        continuityFixed.push('title');
      }
      const outline = { ...pkg.outline };
      if (f.startingCircumstances) { outline.startingCircumstances = f.startingCircumstances; continuityFixed.push('startingCircumstances'); }
      if (f.immediateGoal) { outline.immediateGoal = f.immediateGoal; continuityFixed.push('immediateGoal'); }
      const hero = { ...pkg.hero };
      if (f.roleClass && !fixed.roleClass) { hero.roleClass = f.roleClass; continuityFixed.push('roleClass'); }
      if (f.origin && !fixed.origin) { hero.origin = f.origin; continuityFixed.push('origin'); }
      pkg = { ...pkg, outline, hero };
    } catch (err) {
      if (isCancel(err)) throw err;
      console.info(`[forge] continuity read skipped: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  forgeDebug({ spread, pitches, chosenIndex, gateBefore, gateAfter, continuity, continuityFixed });

  // 6. Remember what was drawn and rolled (only now that the build worked).
  rememberSpread(spread, { premise: fixed.premise ? undefined : pkg.premise, npcNames: (pkg.outline.keyNpcs ?? []).map((n) => n.name) });
  if (mode === 'fresh') {
    rememberRoll(category, 'title', pkg.title);
    rememberRoll(category, 'premise', pkg.premise);
  }
  if (!fixed.name) rememberRoll(category, 'heroName', pkg.hero.name);

  const forge: ForgeRecord = {
    v: 1,
    family: spread.family.id,
    familyName: spread.family.name,
    dna: [spread.primary.id, ...(spread.spice ? [spread.spice.id] : [])],
    dnaTitles: [spread.primary.title, ...(spread.spice ? [spread.spice.title] : [])],
    engine: spread.engineId,
    ...(spread.hookIsSeed ? {} : { hook: spread.hook }),
    place: spread.place,
    ...(pitch ? { pitchTitle: pitch.title } : {}),
    gate: { before: gateBefore.map((f) => f.kind), after: gateAfter.map((f) => f.kind) }
  };
  return { ...pkg, forge, alternates, spread, stats: { pitchSkipped, repaired, gateBefore, gateAfter, pitches, chosenIndex, continuity, continuityFixed } };
}

export { shapeById };
