/**
 * The setup menu's AI calls.
 *
 * - rollStory: ONE call writes the story and everything that depends on it (title, outline,
 *   opening moves, hero, hero sheet). Used for Reroll Story, a picked story seed, the player's
 *   own story (adapt) and a hand-written opener (built out around it).
 * - rollHeroPart: one small call for a title, name, class (with its sheet) or origin, written
 *   for the story as it stands.
 *
 * Failures throw a player-facing Error and change nothing; there is no silent stand-in.
 * Replies are structured (a Gemini response schema, JSON mode elsewhere), then checked in code.
 */
import type { CampaignInspiration, ExperienceCategory } from '../types';
import { SKILLS, RulesMode } from '../dnd/rules';
import { getCategoryProfile } from '../content';
import { fullProfileBlock, styleCard } from '../content/injection';
import { freshnessLines, rememberRoll } from '../lib/rollFreshness';
import { executeJsonPrompt, getActiveProvider, reportFeatureFailure } from '../lib/geminiService';
import { AIError, classifyAIError } from '../lib/aiErrors';
import { AI_PROVIDERS } from '../lib/providersConfig';
import { parseRetryDelayMs } from '../ai/transport';
import { FixedParts, cleanTitle, fixName, normalizeSheet, normalizeStoryReply } from './normalize';
import { POINT_BUY_BUDGET } from './pointBuy';
import type { HeroDraft, HeroSheetDraft, StoryPackage } from './types';

/* --------------------------------- schemas --------------------------------- */

const S = (description?: string) => ({ type: 'STRING', ...(description ? { description } : {}) });
const LIST = (description?: string) => ({ type: 'ARRAY', items: { type: 'STRING' }, ...(description ? { description } : {}) });
const INT = { type: 'INTEGER' };

const SHEET_SCHEMA = {
  type: 'OBJECT',
  properties: {
    abilityScores: {
      type: 'OBJECT',
      properties: { str: INT, dex: INT, con: INT, int: INT, wis: INT, cha: INT },
      required: ['str', 'dex', 'con', 'int', 'wis', 'cha']
    },
    skills: LIST('Exactly 4 skill names from the list given'),
    gear: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          name: S(),
          type: { type: 'STRING', enum: ['weapon', 'armor', 'potion', 'scroll', 'relic', 'misc'] },
          quantity: INT,
          equipped: { type: 'BOOLEAN' },
          description: S()
        },
        required: ['name', 'type']
      }
    },
    spells: LIST('0 to 4 spells or signature abilities')
  },
  required: ['abilityScores', 'skills', 'gear', 'spells']
};

const HERO_SCHEMA = {
  type: 'OBJECT',
  properties: { name: S(), roleClass: S(), origin: S(), appearance: S() },
  required: ['name', 'roleClass', 'origin', 'appearance']
};

export const STORY_SCHEMA = {
  type: 'OBJECT',
  properties: {
    title: S(),
    premise: S('3 or 4 sentences written to the player as "you"'),
    outline: {
      type: 'OBJECT',
      properties: {
        startingCircumstances: S(),
        backstory: S(),
        incitingIncident: S(),
        immediateGoal: S(),
        keyNpcs: {
          type: 'ARRAY',
          items: { type: 'OBJECT', properties: { name: S(), role: S(), motivation: S(), secret: S() }, required: ['name', 'role', 'motivation'] }
        },
        majorConflicts: LIST(),
        secretsAndReveals: LIST(),
        chapters: LIST('3 to 5 chapters; the last resolves the story'),
        potentialEndings: LIST()
      },
      required: ['startingCircumstances', 'incitingIncident', 'immediateGoal', 'keyNpcs', 'chapters']
    },
    openingActions: LIST('Three short first moves'),
    hero: HERO_SCHEMA,
    sheet: SHEET_SCHEMA
  },
  required: ['title', 'premise', 'outline', 'openingActions', 'hero', 'sheet']
};

/* --------------------------------- prompts --------------------------------- */

const SKILL_LIST = Object.keys(SKILLS).join(', ');

const SHEET_RULES = `HERO SHEET (D&D 5e, level 1). It must make sense for this hero in this story:
- abilityScores: 5e point buy. Every score from 8 to 15, total cost at most ${POINT_BUY_BUDGET} (8=0, 9=1, 10=2, 11=3, 12=4, 13=5, 14=7, 15=9). Put the high scores where this hero's life and this story need them.
- skills: exactly 4, chosen from: ${SKILL_LIST}. Pick the ones this hero would really have learned.
- gear: 4 to 7 things this hero carries when the story starts, named for this story (type is weapon, armor, potion, scroll, relic or misc). No generic filler like "Adventurer Tool".
- spells: 0 to 4 spells or signature abilities, only if this hero's class would have them, in the genre's own flavour (a hacker's exploit, a priestess's blessing). An empty list is fine.`;

const SHEET_EXAMPLE = `"sheet": {
    "abilityScores": { "str": 8, "dex": 15, "con": 13, "int": 12, "wis": 14, "cha": 10 },
    "skills": ["stealth", "perception", "insight", "sleight of hand"],
    "gear": [{ "name": "…", "type": "weapon", "quantity": 1, "equipped": true, "description": "…" }],
    "spells": []
  }`;

export interface StoryRollInput {
  category: ExperienceCategory;
  /** The pronouns in force, e.g. "she/her". */
  pronouns: string;
  rulesMode: RulesMode;
  inspiration: CampaignInspiration;
  /**
   * fresh: a new story (optionally from a story seed). adapt: the player's own story, kept word
   * for word, with the rest rebuilt around it. opener: a hand-written opener, built out.
   */
  mode: 'fresh' | 'adapt' | 'opener';
  /** fresh only: the story seed the player picked. */
  seed?: string;
  fixed?: FixedParts;
  signal?: AbortSignal;
}

export function buildStoryPrompt(input: StoryRollInput): string {
  const { category, pronouns, inspiration, mode, seed, fixed = {} } = input;
  const profile = getCategoryProfile(category);
  const heroLines = [
    `- Pronouns: ${pronouns}. ${fixed.name ? '' : `Give the hero a first and last name that suits these pronouns and the setting.`}`,
    fixed.name ? `- Name: keep "${fixed.name}" exactly.` : '',
    fixed.roleClass ? `- Class: keep "${fixed.roleClass}".` : '- roleClass: a class or archetype this story calls for, in the genre\'s own terms.',
    fixed.origin ? `- Origin: keep "${fixed.origin}".` : '- origin: a people, species or background (never a job), fitting the setting.',
    '- appearance: one or two sentences on build, face and what they wear or carry. Looks only, no backstory.'
  ].filter(Boolean);

  let assignment: string;
  if (mode === 'adapt') {
    assignment = `THE PLAYER WROTE THIS STORY. It is authoritative: keep every fact, name and place in it, and return it unchanged as "premise".
"""
${fixed.premise}
"""
${fixed.title ? `Keep the title "${fixed.title}".` : 'Write a title that fits it.'}
Build everything else around the player's story: the outline, the opening moves, the hero's class, origin and looks, and the hero sheet.`;
  } else if (mode === 'opener') {
    assignment = `THE CAMPAIGN STARTS FROM THIS HAND-WRITTEN OPENER. Keep its title, premise, hero and first moves; return the premise unchanged.
Title: ${fixed.title}
Premise: ${fixed.premise}
First moves: ${(fixed.actions ?? []).join(' | ')}
Build the rest around it: a full outline (people, conflicts, secrets, chapters, endings), the hero's looks, and the hero sheet.`;
  } else {
    assignment = `Write ONE original story for a "${profile.name}" campaign, and the hero who fits it. Everything you return belongs to this one story: the hero's class, origin, ability scores, skills, gear and spells all follow from the premise.
${seed
  ? `STORY SEED (the player picked this; it is the core of the story): "${seed}"
Keep the seed's situation and its central conflict, and build an original story from it: invent the people, places and stakes. Do not just restate it.`
  : 'No seed was picked: invent a striking premise that shows what this genre profile does best.'}`;
  }

  const freshness = mode === 'fresh' ? freshnessLines(category, ['title', 'premise', ...(fixed.name ? [] : (['heroName'] as const))]) : fixed.name ? [] : freshnessLines(category, ['heroName']);

  return `You are a master tabletop RPG game master and author, setting up a new campaign.

${fullProfileBlock(category, inspiration)}

ASSIGNMENT
${assignment}

STORY RULES
- premise: a back-of-the-book pitch of 3 or 4 sentences, written to the player as "you" (never "he", "she" or the hero's name). Start at the real beginning: where the hero is, what just went wrong, and the choice in front of them. Resolve nothing.
- outline: startingCircumstances, incitingIncident and immediateGoal in one or two sentences each; backstory in two or three; 2 to 4 keyNpcs, each with a secret; 2 majorConflicts; 2 secretsAndReveals for later; 3 to 5 chapters naming this story's people and places (the last resolves the story); 3 potentialEndings.
- openingActions: three short first moves for the first scene, each a different approach.
- title: evocative, no chapter number.

THE HERO
${heroLines.join('\n')}

${SHEET_RULES}
${freshness.length ? `\nFRESHNESS\n${freshness.join('\n')}\n` : ''}
Reply with JSON only, in this shape:
{
  "title": "…",
  "premise": "…",
  "outline": { "startingCircumstances": "…", "backstory": "…", "incitingIncident": "…", "immediateGoal": "…", "keyNpcs": [{ "name": "…", "role": "…", "motivation": "…", "secret": "…" }], "majorConflicts": ["…"], "secretsAndReveals": ["…"], "chapters": ["…"], "potentialEndings": ["…"] },
  "openingActions": ["…", "…", "…"],
  "hero": { "name": "…", "roleClass": "…", "origin": "…", "appearance": "…" },
  ${SHEET_EXAMPLE}
}`;
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

/** One call: the story and everything that depends on it. */
export async function rollStory(input: StoryRollInput): Promise<StoryPackage> {
  const fixed = input.fixed ?? {};
  try {
    const raw = await executeJsonPrompt<Record<string, unknown>>(
      {
        userPrompt: buildStoryPrompt(input),
        temperature: input.mode === 'fresh' ? 0.95 : 0.8,
        thinking: 'low',
        schema: STORY_SCHEMA,
        signal: input.signal,
        feature: 'Story roll'
      },
      (v) => !!v && typeof v === 'object' && !!(fixed.premise || (typeof v.premise === 'string' && v.premise.trim())) && !!(fixed.title || (typeof v.title === 'string' && v.title.trim())) && typeof v.hero === 'object'
    );
    const pkg = normalizeStoryReply(raw, { category: input.category, pronouns: input.pronouns, fixed });
    if (input.mode === 'fresh') {
      rememberRoll(input.category, 'title', pkg.title);
      rememberRoll(input.category, 'premise', pkg.premise);
    }
    if (!fixed.name) rememberRoll(input.category, 'heroName', pkg.hero.name);
    return pkg;
  } catch (err) {
    throw setupFailure(err, 'Story roll');
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
  name: (ctx) => `Give the hero a new first and last name (not "${ctx.hero.name}") that suits the pronouns ${ctx.pronouns} and this story's setting.\nReply as JSON: { "name": "…" }`,
  origin: (ctx) => `Give the hero a new origin (not "${ctx.hero.origin}"): a people, species or background (never a job) that fits this story's setting, and new looks to match (one or two sentences: build, face, what they wear or carry).\nReply as JSON: { "origin": "…", "appearance": "…" }`,
  roleClass: (ctx) => `Give the hero a new class or archetype (not "${ctx.hero.roleClass}") that this story could be told around, and the hero sheet that goes with it.\n\n${SHEET_RULES}\n\nReply as JSON: { "roleClass": "…", ${SHEET_EXAMPLE} }`
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
