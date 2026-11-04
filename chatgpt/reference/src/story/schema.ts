/**
 * Story package format (Story mode only). A package is `stories/<id>/story.json` plus its
 * art. ChatGPT writes packages with the authoring kit in docs/story-authoring/; the app and
 * `npm run story:check` validate them with this schema and the graph check in validate.ts.
 */
import { z } from 'zod';
import { CATEGORY_IDS } from '../content/categoryIds';

export const STORY_SCHEMA_VERSION = 1;

const id = z
  .string()
  .regex(/^[a-z0-9][a-z0-9_-]*$/, 'Use lowercase letters, digits, - and _ only (start with a letter or digit).')
  .max(64);

/** A test on one flag. Booleans use `is`; counters use atLeast / atMost / equals. */
export const ConditionSchema = z
  .object({
    flag: id,
    is: z.boolean().optional(),
    atLeast: z.number().int().optional(),
    atMost: z.number().int().optional(),
    equals: z.number().int().optional()
  })
  .strict()
  .refine((c) => [c.is, c.atLeast, c.atMost, c.equals].some((v) => v !== undefined), {
    message: 'A condition needs one of is, atLeast, atMost or equals.'
  });

/** A change to one flag: set a boolean or counter, or add to a counter. */
export const FlagEffectSchema = z
  .object({
    flag: id,
    set: z.union([z.boolean(), z.number().int()]).optional(),
    add: z.number().int().optional()
  })
  .strict()
  .refine((e) => (e.set !== undefined) !== (e.add !== undefined), { message: 'A flag effect needs exactly one of set or add.' });

export const FlagDefSchema = z
  .object({
    type: z.enum(['bool', 'counter']),
    initial: z.union([z.boolean(), z.number().int()]),
    /** What the flag means, in plain words. The narrator sees this, so it can report the flag. */
    description: z.string().min(3).max(200)
  })
  .strict();

export const ChoiceSchema = z
  .object({
    id,
    label: z.string().min(2).max(120),
    /** A beat in this beat's exits. Picking the choice moves there once the gate is open. */
    target: id.optional(),
    sets: z.array(FlagEffectSchema).default([])
  })
  .strict();

export const ArtCueSchema = z
  .object({
    art: id,
    on: z.enum(['enter', 'choice', 'flag']),
    /** For on: choice, the choice id. */
    choice: id.optional(),
    /** For on: flag, the flag that must hold. */
    when: ConditionSchema.optional()
  })
  .strict();

export const BeatSchema = z
  .object({
    id,
    title: z.string().min(2).max(80),
    /** Flag conditions that must all hold before the beat's exits open. Empty: open at once. */
    goal: z.array(ConditionSchema).default([]),
    /** Extra conditions to enter this beat from any exit. */
    entry: z.array(ConditionSchema).default([]),
    /** What the narrator knows here that the player does not yet. */
    sceneBrief: z.string().min(20).max(1500),
    choices: z.array(ChoiceSchema).default([]),
    artCues: z.array(ArtCueSchema).default([]),
    /** Beats reachable next. */
    exits: z.array(id).default([]),
    isEnding: z.boolean().default(false),
    /** Shown on the progress map for endings. */
    endingTitle: z.string().max(80).optional(),
    /** In-fiction nudge the narrator works in after `hintAfterTurns` turns in the beat. */
    hint: z.string().max(300).optional(),
    hintAfterTurns: z.number().int().min(1).max(50).optional()
  })
  .strict();

export const CastSchema = z
  .object({
    id,
    name: z.string().min(1).max(60),
    /** Injected every turn so hair, eyes and clothes never drift. */
    appearance: z.string().min(10).max(400),
    voice: z.string().min(5).max(300),
    stance: z.string().min(5).max(300),
    portrait: id.optional()
  })
  .strict();

export const ArtSchema = z
  .object({
    /** File name in the package's art folder, e.g. "cover.webp". */
    file: z.string().regex(/^[a-z0-9_-]+\.webp$/, 'Art files are lowercase .webp names.'),
    /** Screen-reader text and the fallback when the image cannot load. */
    alt: z.string().min(5).max(300),
    /** Set by story:import once the file is uploaded. */
    url: z.string().url().optional()
  })
  .strict();

const color = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Colours are #rrggbb.');

export const SkinSchema = z
  .object({
    palette: z
      .object({
        background: color,
        surface: color,
        accent: color,
        text: color,
        muted: color,
        playerBubble: color,
        narratorBubble: color
      })
      .partial()
      .strict()
      .optional(),
    fonts: z.object({ heading: z.enum(['serif', 'sans', 'mono', 'display', 'hand']), body: z.enum(['serif', 'sans', 'mono']) }).partial().strict().optional(),
    bubble: z.enum(['rounded', 'square', 'soft', 'scroll']).optional(),
    pattern: z.enum(['none', 'dots', 'grid', 'grain', 'stars', 'waves']).optional(),
    /** Art id used as a dimmed background behind the chat. */
    backgroundArt: id.optional(),
    particles: z.enum(['none', 'embers', 'snow', 'petals', 'rain', 'motes', 'ash']).optional(),
    ambient: z.string().max(40).optional()
  })
  .strict();

export const StorySchema = z
  .object({
    schemaVersion: z.literal(STORY_SCHEMA_VERSION),
    meta: z
      .object({
        id,
        title: z.string().min(2).max(80),
        category: z.enum(CATEGORY_IDS),
        rating: z.enum(['everyone', 'teen', 'mature']),
        /** story: a narrator runs the scene. character: the player talks with one cast member. */
        mode: z.enum(['story', 'character']).default('story'),
        /** For character mode: the cast id the player talks with. */
        character: id.optional(),
        blurb: z.string().min(20).max(400),
        cover: id.optional(),
        author: z.string().max(80).optional()
      })
      .strict(),
    world: z.string().min(40).max(2000),
    tone: z.string().min(5).max(300),
    playerRole: z.string().min(10).max(500),
    /** Rough reply length; the player can change it with the length slider. */
    lengthTarget: z.enum(['short', 'medium', 'long']).default('medium'),
    narratorStyle: z.string().min(10).max(500),
    /** hard: beats wait for their goal. soft: the goal steers but the narrator may move on. */
    strictness: z.enum(['hard', 'soft']).default('hard'),
    /** Default turns in a beat before the hint is offered. */
    hintAfterTurns: z.number().int().min(1).max(50).default(6),
    cast: z.array(CastSchema).min(1),
    flags: z.record(id, FlagDefSchema).default({}),
    start: id,
    beats: z.array(BeatSchema).min(3),
    art: z.record(id, ArtSchema).default({}),
    skin: SkinSchema.default({})
  })
  .strict();

export type Condition = z.infer<typeof ConditionSchema>;
export type FlagEffect = z.infer<typeof FlagEffectSchema>;
export type FlagDef = z.infer<typeof FlagDefSchema>;
export type Choice = z.infer<typeof ChoiceSchema>;
export type ArtCue = z.infer<typeof ArtCueSchema>;
export type Beat = z.infer<typeof BeatSchema>;
export type CastMember = z.infer<typeof CastSchema>;
export type StoryArt = z.infer<typeof ArtSchema>;
export type SkinOverride = z.infer<typeof SkinSchema>;
export type Story = z.infer<typeof StorySchema>;
export type FlagValue = boolean | number;
export type Flags = Record<string, FlagValue>;
