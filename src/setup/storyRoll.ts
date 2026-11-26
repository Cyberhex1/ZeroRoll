/**
 * The setup menu's AI calls (master prompt, ohnna 2026-11-26; see src/setup/masterPrompt.ts).
 *
 * - rollStory: the story and everything on the sheet that depends on it, from one prompt that
 *   holds only the genre (with a few seed-list titles as examples) and the fields to fill.
 *   A second call, the story check, reads that prompt and reply and says whether the reply
 *   followed the prompt and makes sense; when it does not, the writer gets one more try with
 *   the problems it named. Used for Reroll Story, a picked story seed, the player's own story
 *   (adapt), a hand-written opener (built out) and Book Two (sequel).
 * - rollHeroPart: one small call for a title, name, class (with its sheet) or origin, written
 *   for the story as it stands.
 *
 * Failures throw a player-facing Error and change nothing; there is no silent stand-in. A story
 * check that cannot run says so on the status line and keeps the story.
 */
import type { CampaignInspiration, ExperienceCategory } from '../types';
import type { RulesMode } from '../dnd/rules';
import { rememberRoll } from '../lib/rollFreshness';
import { executeJsonPrompt, getActiveProvider, getLastModelUsedLabel, reportFeatureFailure } from '../lib/geminiService';
import { AIError, classifyAIError } from '../lib/aiErrors';
import { reportAINotice } from '../lib/aiStatus';
import { AI_PROVIDERS } from '../lib/providersConfig';
import { parseRetryDelayMs } from '../ai/transport';
import { FixedParts, cleanTitle, fixName, normalizeSheet, normalizeStoryReply } from './normalize';
import type { StoryShape } from './storyShape';
import type { HeroDraft, HeroSheetDraft, StoryPackage } from './types';
import { S, SHEET_SCHEMA, STORY_SCHEMA } from './schemas';
import { CHECK_SCHEMA, MasterInput, RerollField, buildCheckPrompt, buildFixPrompt, buildMasterPrompt, buildRerollPrompt, mediaExamples, rememberStory } from './masterPrompt';

export { STORY_SCHEMA } from './schemas';

export interface StoryRollInput {
  category: ExperienceCategory;
  /** The pronouns in force, e.g. "she/her". */
  pronouns: string;
  rulesMode: RulesMode;
  inspiration: CampaignInspiration;
  /**
   * fresh: a new story (optionally from a story seed). adapt: the player's own story, kept word
   * for word, with the rest rebuilt around it. opener: a hand-written opener, built out.
   * sequel: the next book of a campaign, from its recap (src/dnd/nextBook.ts).
   */
  mode: 'fresh' | 'adapt' | 'opener' | 'sequel';
  /** sequel only (Book Two and later): what happened so far and who the hero is now. */
  continuation?: string;
  /** fresh only: the story seed the player picked. */
  seed?: string;
  /** opener only: the opener's own shape and turning point, kept as written. */
  shape?: StoryShape;
  turningPoint?: string;
  fixed?: FixedParts;
  signal?: AbortSignal;
  /** Testing and the eval: skip the story check. */
  noCheck?: boolean;
  /** Testing: the seed-list titles to show (else a fresh handful). */
  media?: string[];
}

/** What the story check found, for the debug log and the eval. */
export interface StoryCheck {
  ran: boolean;
  pass?: boolean;
  problems: string[];
  /** True when the writer rewrote the story after the check. */
  rewritten: boolean;
  /** Why the check could not run. */
  error?: string;
  writerModel?: string;
  checkModel?: string;
}

export type RolledStory = StoryPackage & { media: string[]; check: StoryCheck; prompt: string };

/** The writer's prompt for an input (tests and the eval read it). */
export function buildStoryPrompt(input: StoryRollInput): string {
  return buildMasterPrompt(masterInput(input, input.media ?? mediaExamples(input.category)));
}

function masterInput(input: StoryRollInput, media: string[]): MasterInput {
  return {
    category: input.category,
    pronouns: input.pronouns,
    mode: input.mode,
    media,
    fixed: input.fixed,
    seed: input.mode === 'fresh' ? input.seed : undefined,
    continuation: input.continuation,
    shape: input.mode === 'opener' ? input.shape : undefined,
    turningPoint: input.turningPoint
  };
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

function isCancel(err: unknown): boolean {
  return (err instanceof AIError && err.kind === 'cancelled') || (err instanceof Error && err.name === 'AbortError');
}

const hasStory = (fixed: FixedParts) => (v: any) =>
  !!v && typeof v === 'object' && !!(fixed.premise || (typeof v.premise === 'string' && v.premise.trim())) && !!(fixed.title || (typeof v.title === 'string' && v.title.trim())) && typeof v.hero === 'object';

/** The story and everything that depends on it: the writer, the story check, and at most one rewrite. */
export async function rollStory(input: StoryRollInput): Promise<RolledStory> {
  const fixed = input.fixed ?? {};
  const media = input.media ?? (input.mode === 'sequel' && input.inspiration?.media?.length ? input.inspiration.media : mediaExamples(input.category));
  const prompt = buildMasterPrompt(masterInput(input, media));
  const write = (userPrompt: string) =>
    executeJsonPrompt<Record<string, unknown>>(
      {
        userPrompt,
        temperature: input.mode === 'fresh' ? 1 : 0.85,
        thinking: 'low',
        tier: 'story',
        // A full story is about 1,600 tokens; the cap stops a runaway reply early.
        maxTokens: 4096,
        schema: STORY_SCHEMA,
        signal: input.signal,
        feature: 'Story roll'
      },
      hasStory(fixed)
    );

  let raw: Record<string, unknown>;
  const check: StoryCheck = { ran: false, problems: [], rewritten: false };
  try {
    raw = await write(prompt);
    check.writerModel = getLastModelUsedLabel();
  } catch (err) {
    throw setupFailure(err, 'Story roll');
  }

  if (!input.noCheck) {
    try {
      const verdict = await executeJsonPrompt<{ pass: boolean; problems: string[] }>(
        {
          userPrompt: buildCheckPrompt(prompt, raw),
          temperature: 0.2,
          thinking: 'low',
          tier: 'check',
          maxTokens: 2048,
          schema: CHECK_SCHEMA,
          signal: input.signal,
          feature: 'Story check'
        },
        (v) => !!v && typeof v === 'object' && typeof v.pass === 'boolean'
      );
      check.ran = true;
      check.checkModel = getLastModelUsedLabel();
      check.problems = Array.isArray(verdict.problems) ? verdict.problems.map((p) => String(p).trim()).filter(Boolean).slice(0, 8) : [];
      check.pass = verdict.pass;
      if (!check.pass && !check.problems.length) check.problems = ['The editor did not pass the story but named no problem.'];
    } catch (err) {
      if (isCancel(err)) throw setupFailure(err, 'Story roll');
      check.error = err instanceof Error ? err.message : String(err);
      reportAINotice('Story check', `The story check could not run (${check.error}), so this story was not double-checked.`);
    }
    if (check.ran && !check.pass) {
      try {
        raw = await write(buildFixPrompt(prompt, raw, check.problems));
        check.rewritten = true;
      } catch (err) {
        // The first draft is a real AI story; keep it, and say the fix did not run.
        if (isCancel(err)) throw setupFailure(err, 'Story roll');
        reportAINotice('Story check', `The story check found problems but the rewrite failed (${err instanceof Error ? err.message : String(err)}). Reroll the story if it does not make sense.`);
      }
    }
  }
  if (typeof console !== 'undefined') console.info('[story] check', check);

  let pkg: StoryPackage;
  try {
    pkg = normalizeStoryReply(raw, { category: input.category, pronouns: input.pronouns, fixed, shape: input.mode === 'opener' ? input.shape?.id : undefined });
  } catch (err) {
    throw setupFailure(err, 'Story roll');
  }
  if (input.mode === 'opener' && input.turningPoint) pkg.outline = { ...pkg.outline, turningPoint: input.turningPoint };

  if (input.mode === 'fresh') {
    rememberStory({ title: pkg.title, hero: pkg.hero.roleClass.toLowerCase() });
    rememberRoll(input.category, 'title', pkg.title);
    rememberRoll(input.category, 'premise', pkg.premise);
  }
  if (!fixed.name) rememberRoll(input.category, 'heroName', pkg.hero.name);
  return { ...pkg, media, check, prompt };
}

/* ------------------------------- hero parts -------------------------------- */

export type HeroPart = RerollField;

export interface HeroPartContext {
  category: ExperienceCategory;
  pronouns: string;
  rulesMode: RulesMode;
  title: string;
  premise: string;
  startingCircumstances?: string;
  goal?: string;
  hero: HeroDraft;
  /** The campaign's seed-list example titles, so a reroll reads the genre the same way. */
  media?: string[];
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

export function buildHeroPartPrompt(part: HeroPart, ctx: HeroPartContext): string {
  return buildRerollPrompt(part, ctx);
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
      const name = fixName(raw.name, ctx.category, ctx.pronouns);
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
