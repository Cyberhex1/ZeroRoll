/**
 * The setup menu's AI calls.
 *
 * - rollStory: the story and everything that depends on it (title, outline, opening moves,
 *   hero, hero sheet). 0.2: it runs the Story Forge (src/forge/forge.ts): a spread drawn from
 *   the category's deck, four pitches, one build, the gate and at most one repair. Used for
 *   Reroll Story, a picked story seed or pitch, the player's own story (adapt), a hand-written
 *   opener (built out around it) and Book Two (sequel).
 * - rollHeroPart: one small call for a title, name, class (with its sheet) or origin, written
 *   for the story as it stands.
 *
 * Failures throw a player-facing Error and change nothing; there is no silent stand-in.
 * Replies are structured (a Gemini response schema, JSON mode elsewhere), then checked in code.
 */
import type { CampaignInspiration, ExperienceCategory, ForgeRecord } from '../types';
import type { RulesMode } from '../dnd/rules';
import { styleCard } from '../content/injection';
import { freshnessLines, rememberRoll } from '../lib/rollFreshness';
import { executeJsonPrompt, getActiveProvider, reportFeatureFailure } from '../lib/geminiService';
import { AIError, classifyAIError } from '../lib/aiErrors';
import { AI_PROVIDERS } from '../lib/providersConfig';
import { parseRetryDelayMs } from '../ai/transport';
import { FixedParts, cleanTitle, fixName, normalizeSheet } from './normalize';
import type { StoryShape } from './storyShape';
import type { HeroDraft, HeroSheetDraft } from './types';
import { CLASS_RULE, HERO_FIT, ORIGIN_RULE, SHEET_EXAMPLE, SHEET_RULES } from './heroRules';
import { S, SHEET_SCHEMA } from './schemas';
import { ForgedPackage, forgeStory } from '../forge/forge';
import { drawSpread, Spread } from '../forge/spread';
import { Pitch, pitchStories } from '../forge/pitch';
import { namesOnHandFrom, traditionsFor } from '../forge/names';
import { buildPrompt } from '../forge/prompts';

export { STORY_SCHEMA } from './schemas';

export interface StoryRollInput {
  category: ExperienceCategory;
  /** The pronouns in force, e.g. "she/her". */
  pronouns: string;
  rulesMode: RulesMode;
  inspiration: CampaignInspiration;
  /**
   * fresh: a new story (optionally from a story seed or a picked pitch). adapt: the player's own
   * story, kept word for word, with the rest rebuilt around it. opener: a hand-written opener,
   * built out. sequel: the next book of a campaign, from its recap (src/dnd/nextBook.ts).
   */
  mode: 'fresh' | 'adapt' | 'opener' | 'sequel';
  /** sequel only (Book Two and later): what happened so far and who the hero is now. */
  continuation?: string;
  /** fresh only: the story seed the player picked. */
  seed?: string;
  /** fresh: where the player joins (used when the story family allows it). opener: the opener's own shape. */
  shape?: StoryShape;
  /** opener only: the opener's turning point, kept as written. */
  turningPoint?: string;
  fixed?: FixedParts;
  signal?: AbortSignal;
  /** sequel: the previous book's forge record (keeps its family and primary influence). */
  previous?: ForgeRecord;
  /** "More ideas": build this pitch from the spread it came from (no pitch call). */
  spread?: Spread;
  pitch?: Pitch;
  /** The eval's pitch-off arm. */
  noPitch?: boolean;
  noContinuity?: boolean;
}

/**
 * The build prompt for an input, with a freshly drawn spread (tests and the eval read it).
 * rollStory draws its own spread inside the forge.
 */
export function buildStoryPrompt(input: StoryRollInput & { rand?: () => number }): string {
  const spread = input.spread ?? drawSpread(input.category, { rand: input.rand, shape: input.shape, seed: input.mode === 'fresh' ? input.seed : undefined, pronouns: input.pronouns });
  const chooseShape = input.mode === 'adapt' || (input.mode === 'opener' && !input.shape);
  return buildPrompt({ mode: input.mode, spread, pitch: input.pitch, pronouns: input.pronouns, fixed: input.fixed, continuation: input.continuation, turningPoint: input.turningPoint, chooseShape });
}

/** A player-facing message for a failed setup call; a quota error says how long to wait. */
export function setupFailure(err: unknown, feature: string): Error & { retryAfterMs?: number; cancelled?: boolean } {
  const aiErr = err instanceof AIError ? err : classifyAIError(err, getActiveProvider());
  // The setup form shows the error with its own Try again; only key problems also get the
  // banner, which links to AI settings.
  const { message } = reportFeatureFailure(aiErr, feature, false, { banner: aiErr.kind === 'auth' || aiErr.kind === 'no_key' });
  const out = new Error(message) as Error & { retryAfterMs?: number; cancelled?: boolean };
  if (aiErr.kind === 'cancelled') out.cancelled = true;
  if (aiErr.kind === 'quota') {
    const wait = parseRetryDelayMs(aiErr.message);
    const provider = AI_PROVIDERS[getActiveProvider()]?.name || 'The AI provider';
    if (wait) {
      out.retryAfterMs = wait;
      out.message = `${provider}'s free limit was hit. Try again in ${Math.ceil(wait / 1000)} seconds.`;
    } else {
      out.message = `${provider}'s free limit was hit. Wait a minute, then try again.`;
    }
  }
  return out;
}

/** The story and everything that depends on it, through the Story Forge. */
export async function rollStory(input: StoryRollInput): Promise<ForgedPackage> {
  try {
    return await forgeStory({
      category: input.category,
      pronouns: input.pronouns,
      mode: input.mode,
      continuation: input.continuation,
      seed: input.seed,
      shape: input.shape,
      turningPoint: input.turningPoint,
      fixed: input.fixed,
      signal: input.signal,
      previous: input.previous ?? input.inspiration?.forge,
      spread: input.spread,
      pitch: input.pitch,
      noPitch: input.noPitch,
      noContinuity: input.noContinuity
    });
  } catch (err) {
    throw setupFailure(err, 'Story roll');
  }
}

/**
 * "New ideas" on the Seeds tab (0.2, plan 4.10): a fresh draw of the genre's deck and one pitch
 * call. Picking one builds it on the same spread (one more call).
 */
export async function newIdeas(input: { category: ExperienceCategory; pronouns: string; signal?: AbortSignal }): Promise<{ pitches: Pitch[]; spread: Spread }> {
  try {
    const spread = drawSpread(input.category, { pronouns: input.pronouns });
    return { pitches: await pitchStories(spread, input.signal), spread };
  } catch (err) {
    throw setupFailure(err, 'Story pitch');
  }
}

/* ------------------------------- hero parts -------------------------------- */

export type HeroPart = 'title' | 'name' | 'roleClass' | 'origin';

export interface HeroPartContext {
  category: ExperienceCategory;
  pronouns: string;
  rulesMode: RulesMode;
  title: string;
  premise: string;
  goal?: string;
  hero: HeroDraft;
  /** 0.2: the story family (from the forge record), for names from its traditions. */
  familyId?: string;
  signal?: AbortSignal;
}

export interface HeroPartResult {
  title?: string;
  name?: string;
  origin?: string;
  appearance?: string;
  roleClass?: string;
  sheet?: HeroSheetDraft;
}

const PART_SCHEMAS: Record<HeroPart, Record<string, unknown>> = {
  title: { type: 'OBJECT', properties: { title: S() }, required: ['title'] },
  name: { type: 'OBJECT', properties: { name: S() }, required: ['name'] },
  origin: { type: 'OBJECT', properties: { origin: S(), appearance: S() }, required: ['origin', 'appearance'] },
  roleClass: { type: 'OBJECT', properties: { roleClass: S(), sheet: SHEET_SCHEMA }, required: ['roleClass', 'sheet'] }
};

const PART_ASKS: Record<HeroPart, (ctx: HeroPartContext) => string> = {
  title: (ctx) => `Write a new title for this story (not "${ctx.title}"). Evocative, no chapter number.\nReply as JSON: { "title": "…" }`,
  name: (ctx) => {
    const n = namesOnHandFrom(traditionsFor(ctx.category, ctx.familyId), { pronouns: ctx.pronouns, exclude: ctx.hero.name.split(/\s+/) });
    const onHand = [...n.given, ...n.family];
    return `Give the hero a new first and last name (not "${ctx.hero.name}") that suits the pronouns ${ctx.pronouns} and this story's setting.${onHand.length ? ` Names that fit, if you want them: ${onHand.join(', ')}.` : ''}\nReply as JSON: { "name": "…" }`;
  },
  origin: (ctx) => `Give the hero a new origin (not "${ctx.hero.origin}"). ${ORIGIN_RULE} Then new looks to match (one or two sentences: build, face, what they wear or carry).\nReply as JSON: { "origin": "…", "appearance": "…" }`,
  roleClass: (ctx) => `Give the hero a new class (not "${ctx.hero.roleClass}") that still fits the premise, and the hero sheet that goes with it. ${CLASS_RULE}\n\n${SHEET_RULES}\n\n${HERO_FIT}\n\nReply as JSON: { "roleClass": "…", ${SHEET_EXAMPLE} }`
};

export function buildHeroPartPrompt(part: HeroPart, ctx: HeroPartContext): string {
  const freshness = part === 'name' ? freshnessLines(ctx.category, ['heroName']) : part === 'title' ? freshnessLines(ctx.category, ['title']) : [];
  return `You are helping a player set up a tabletop RPG campaign. Whatever you write must fit the story below.

${styleCard(ctx.category)}

THE STORY
Title: ${ctx.title}
Premise: ${ctx.premise.slice(0, 1200)}
${ctx.goal ? `First goal: ${ctx.goal}\n` : ''}
THE HERO NOW
Name: ${ctx.hero.name} (pronouns ${ctx.pronouns})
Class: ${ctx.hero.roleClass}
Origin: ${ctx.hero.origin}

${PART_ASKS[part](ctx)}${freshness.length ? `\n\n${freshness.join('\n')}` : ''}`;
}

/** One small call for a title, name, class (with its sheet) or origin (with looks). */
export async function rollHeroPart(part: HeroPart, ctx: HeroPartContext): Promise<HeroPartResult> {
  const feature = { title: 'Title roll', name: 'Name roll', roleClass: 'Class roll', origin: 'Origin roll' }[part];
  try {
    const raw = await executeJsonPrompt<Record<string, unknown>>(
      {
        userPrompt: buildHeroPartPrompt(part, ctx),
        temperature: 1,
        thinking: 'minimal',
        maxTokens: part === 'roleClass' ? 2048 : 512,
        tier: 'basic',
        schema: PART_SCHEMAS[part],
        signal: ctx.signal,
        feature
      },
      (v) => !!v && typeof v === 'object' && typeof v[part] === 'string' && !!(v[part] as string).trim()
    );
    const text = (k: string, max: number) => String(raw[k] ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
    if (part === 'title') {
      const title = cleanTitle(raw.title);
      rememberRoll(ctx.category, 'title', title);
      return { title };
    }
    if (part === 'name') {
      const name = fixName(raw.name, ctx.category, ctx.pronouns, ctx.familyId);
      rememberRoll(ctx.category, 'heroName', name);
      return { name };
    }
    if (part === 'origin') return { origin: text('origin', 60), appearance: text('appearance', 500) };
    const roleClass = text('roleClass', 60);
    return { roleClass, sheet: normalizeSheet(raw.sheet, roleClass) };
  } catch (err) {
    throw setupFailure(err, feature);
  }
}
