/**
 * The master prompt (ohnna, 2026-11-26): story rolls send the model only the genre and the
 * setup screen's fields to fill. No card decks, pitches, gates or rewrites in code.
 *
 * - A story roll sends every field (the whole story).
 * - A single-field reroll (title, name, class, origin) sends the story as it stands and asks for
 *   that one field, kept true to the story.
 * - A second call, the story check, reads the writer's prompt and reply and says whether the
 *   reply followed the prompt and makes sense. It runs on story rolls only.
 *
 * The genre comes from the category's kinds of story (GENRE_KINDS) plus a few titles from its seed list
 * (src/content/categories/<id>.ts "media"), as examples of the kind of story, never to copy.
 */
import type { ExperienceCategory } from '../types';
import { getContent, shuffle } from '../content';
import { STORY_SHAPES, StoryShape } from './storyShape';
import { SHEET_EXAMPLE, classRule, originRule, sheetRules } from './heroRules';
import type { HeroDraft } from './types';
import { OVERUSED_NAMES } from '../content/names';

/**
 * Names and places AI models overuse, for the writer (writerOptions.nameList) and the story check.
 */
export const AI_HABIT_PLACES = ['Oakhaven', 'Eldoria', 'Willowbrook', 'Silverbrook', 'Ravenswood', 'Riverbend', 'Stonehaven', 'Blackwood', 'Brightwater', 'Mistvale', 'Thornfield', 'Ashford'];

/**
 * What each category means, as kinds of story, characters and settings (ohnna, 2026-11-26: a
 * list to ground the category, not a description that steers the story). The seed-list titles
 * are added to it on every roll.
 */
export const GENRE_KINDS: Record<ExperienceCategory, string[]> = {
  dnd: ['classic party quests', 'dungeon crawls', 'dragons and their hoards', 'guild contracts', 'cursed kingdoms', 'planar travel', 'heists in fantasy cities', 'tavern rumours that turn into legends'],
  fantasy: ['quests against a dark power', 'court intrigue in a magic kingdom', 'wizard schools', 'dragon hunters', 'cursed heirs', 'fae bargains', 'sword-and-sorcery mercenaries'],
  adventure: ['pirate crews', 'space rogues', 'treasure hunts', 'lost-city expeditions', 'sky ships', 'jungle ruins', 'heists', 'rival explorers'],
  historical_adventure: ['Viking raids', 'the Silk Road', 'Edo Japan', 'the Age of Sail', 'the Wild West', 'Renaissance Italy', 'wartime spies', 'frontier explorers'],
  horror: ['haunted houses', 'slashers', 'cursed objects', 'towns with a secret', 'possession', 'found footage', 'creatures in the woods', 'folk horror'],
  cozy_ghibli: ['small-town magic', 'nature spirits', 'bakeries and tea shops', 'gentle journeys', 'found family', 'seasonal festivals', 'a young witch\'s first year away from home'],
  romantic: ['enemies to lovers', 'second chances', 'fake dating', 'forbidden love', 'slow burns', 'rivals', 'love across class or worlds', 'romcoms'],
  revenge: ['betrayed heirs', 'framed soldiers', 'wronged lovers', 'heists against the people who ruined you', 'long cons', 'returning in disguise'],
  apocalypse: ['wasteland wanderers', 'the last city', 'nuclear winter', 'climate collapse', 'convoys', 'settlement politics', 'raiders and scavengers'],
  zombie: ['outbreak day one', 'fortified survivor camps', 'road trips through the dead', 'mall sieges', 'quarantine zones', 'a cure that might exist'],
  cosmic_horror: ['forbidden books', 'deep-sea expeditions', 'towns that worship something', 'remote research stations', 'dreams that aren\'t dreams', 'ancient things that wake'],
  psychedelic_trip: ['dream logic', 'inner journeys', 'festivals that bend reality', 'mind-bending sci-fi', 'surreal cities', 'talking animals', 'ego death and rebirth'],
  tiktok_drama: ['hidden billionaires', 'contract marriages', 'heirs swapped at birth', 'cheating exes', 'revenge glow-ups', 'mafia romance', 'CEO romance', 'second-life rebirth stories'],
  ancient_greek: ['Greek heroes', 'oracles and prophecies', 'the Olympic games', 'wars between city-states', 'gods who meddle', 'monsters', 'voyages across the Aegean'],
  mythology: ['Norse, Egyptian, Japanese, Celtic, Hindu and Aztec myth', 'gods walking among people', 'tricksters', 'end-of-the-world prophecies', 'journeys to the underworld'],
  real_life: ['office politics', 'family secrets', 'small businesses', 'coming of age', 'friendships', 'scandals', 'big-city life', 'workplace comedies and dramas']
};

/** How many seed-list titles each roll shows as examples. */
export const MEDIA_EXAMPLES = 6;

/** A fresh handful of the category's seed-list titles, e.g. "Treasure Island (Book)". */
export function mediaExamples(category: ExperienceCategory, rand: () => number = Math.random): string[] {
  return shuffle(getContent(category).media, rand)
    .slice(0, MEDIA_EXAMPLES)
    .map((m) => `${m.title} (${m.medium})`);
}

const DM_LINE = 'You are the dungeon master (DM) of a choose-your-own-adventure tabletop RPG, played one-on-one with a single player.';

function storyKind(category: ExperienceCategory): string {
  const name = getContent(category).card.name;
  return `${/^[aeiou]/i.test(name) ? 'an' : 'a'} ${name} story`;
}

/** The opening of a story roll: who the model is, and what the category means. */
export function genreIntro(category: ExperienceCategory, media: string[]): string {
  const name = getContent(category).card.name;
  return `${DM_LINE}

Today your player chose to play ${storyKind(category)}. To show what we mean by ${name}, here are kinds of story and works that fit it: ${[...GENRE_KINDS[category], ...media].join('; ')}.
These are only there to ground what the category means. They are not a limit or a menu: you are expected to come up with an original story of your own, and never to retell or borrow from any of them.`;
}

/**
 * Whether the writer also sees the overused-name list. On: with the list, Carbon's rolls that the
 * check failed for AI names went from 10 of 15 to 2 of 15 (2026-11-26 evals, run3 vs run4).
 * The eval can switch it off with NAMES_TO_WRITER=0.
 */
export const writerOptions = { nameList: true };

function nameListLine(): string {
  return writerOptions.nameList ? `\nNever use these names AI models overuse, for anyone or anywhere: ${[...OVERUSED_NAMES, ...AI_HABIT_PLACES].join(', ')}.` : '';
}

export const PLAIN_WRITING =
  'Write like a good human novelist, not like an AI. Use plain, specific words and avoid the stock phrases and flowery filler AI writing is known for. Avoid the names and places AI models reach for by habit: give people names that real people in this setting would have, and give places names that sound like real places.';

/* ------------------------------ the fields ------------------------------ */

function playerFields(category: ExperienceCategory): string {
  return `WHAT THE PLAYER SEES ON THE SETUP SCREEN
- title: the story's title, one to five words.
- premise ("The story"): the story's "about" text, like the blurb for a book, film or game: a few sentences on who the hero is, their world and what is about to happen to them.
- hero.name: the hero's first and last name.
- hero.roleClass ("Class"): ${classRule(category)}
- hero.origin ("Origin"): ${originRule(category)}
- hero.appearance ("Looks"): one or two sentences: build, face, what they wear or carry.
- sheet: the hero sheet (below).`;
}

const DM_FIELDS = `YOUR PRIVATE DM NOTES (the player never sees these; you will use them to run the story, so put the whole plan here)
- outline.backstory: what happened before the story starts that matters.
- outline.incitingIncident: the event in the first scene that starts the story.
- outline.keyNpcs: 3 or 4 people: name, role, motivation (what they want), secret, move (what they do next if the hero does nothing).
- outline.fronts: 2 dangers or pressures that move forward on their own: name, agenda, and 3 or 4 portents (signs that get worse, in order).
- outline.setPieces: 4 big scenes for later chapters.
- outline.chapters: 4 or 5 short chapter titles; the last one resolves the story.
- outline.turningPoint: the big defining event the story builds to, as a full sentence, with its chapter ("Chapter 2: ...").
- outline.storyShape: where the player joins the story, one of: ${STORY_SHAPES.map((s) => `"${s.id}" (${s.label.toLowerCase()})`).join(', ')}.
- outline.majorConflicts (2), outline.secretsAndReveals (2), outline.potentialEndings (2 or 3).
- references: 1 to 3 of the works named at the top whose tone fits this story, copied exactly. You will get them back as tone references while you tell it.
- style: how this story should feel when you tell it: its voice in a sentence or two, then three concrete sensory details from its world.`;

/**
 * Held back (ohnna, 2026-11-26): removed from the prompt to stop over-explaining. Add it to
 * DM_FIELDS again if rolls start the player at or after the climax.
 */
export const START_BEFORE_TURNING_POINT = 'The player starts BEFORE the turning point, so they live through it on screen. Never start at the climax or right after the big event.';

function jsonShape(): string {
  return `{
  "title": "…",
  "premise": "…",
  "outline": { "backstory": "…", "incitingIncident": "…", "keyNpcs": [{ "name": "…", "role": "…", "motivation": "…", "secret": "…", "move": "…" }], "fronts": [{ "name": "…", "agenda": "…", "portents": ["…", "…", "…"] }], "setPieces": ["…"], "chapters": ["…"], "turningPoint": "…", "storyShape": "…", "majorConflicts": ["…"], "secretsAndReveals": ["…"], "potentialEndings": ["…"] },
  "hero": { "name": "…", "roleClass": "…", "origin": "…", "appearance": "…" },
  ${SHEET_EXAMPLE},
  "references": ["…"],
  "style": "…"
}`;
}

/** The pronoun line: the player's choice, or a unisex hero when they made none. */
export function pronounLine(pronouns: string | undefined): string {
  return pronouns ? `The hero uses ${pronouns} pronouns.` : 'The player did not choose pronouns: give the hero a unisex name and use they/them.';
}

/* ------------------------- recent stories (any genre) ------------------------- */

const RECENT_KEY = 'zeroroll_recent_stories';
const RECENT_KEEP = 6;

export interface RecentStory {
  title: string;
  hero: string;
}

/** The player's last few rolled stories across every genre, newest first. */
export function recentStories(): RecentStory[] {
  try {
    const v = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
    return Array.isArray(v) ? v.filter((x) => x && typeof x.title === 'string' && typeof x.hero === 'string').slice(0, RECENT_KEEP) : [];
  } catch {
    return [];
  }
}

export function rememberStory(story: RecentStory): void {
  try {
    const list = [story, ...recentStories().filter((s) => s.title !== story.title)].slice(0, RECENT_KEEP);
    localStorage.setItem(RECENT_KEY, JSON.stringify(list));
  } catch {
    // private mode: no memory of recent stories
  }
}

/* ---------------------------- the story roll ---------------------------- */

export type MasterMode = 'fresh' | 'adapt' | 'opener' | 'sequel';

/** Fields the player (or a hand-written opener) already set; they are sent as kept, word for word. */
export interface KeptFields {
  title?: string;
  premise?: string;
  name?: string;
  roleClass?: string;
  origin?: string;
}

export interface MasterInput {
  category: ExperienceCategory;
  pronouns: string;
  /** False when the player picked no pronouns: the hero gets a unisex name. */
  pronounsChosen?: boolean;
  mode: MasterMode;
  /** The seed-list titles shown as examples (mediaExamples). */
  media: string[];
  fixed?: KeptFields;
  /** fresh: a story seed the player picked. */
  seed?: string;
  /** sequel: the recap of the book that ended and the hero now. */
  continuation?: string;
  /** opener: where the player joins and its turning point, kept as written. */
  shape?: StoryShape;
  turningPoint?: string;
}

function keptLines(fixed: KeptFields): string[] {
  const lines = [
    fixed.title ? `- title: "${fixed.title}"` : '',
    fixed.premise ? `- premise: """${fixed.premise}"""` : '',
    fixed.name ? `- hero.name: "${fixed.name}"` : '',
    fixed.roleClass ? `- hero.roleClass: "${fixed.roleClass}"` : '',
    fixed.origin ? `- hero.origin: "${fixed.origin}"` : ''
  ];
  return lines.filter(Boolean);
}

function modeBlock(input: MasterInput): string {
  const { mode } = input;
  if (mode === 'adapt') return 'THE PLAYER WROTE THEIR OWN STORY (the premise below). It is the story: keep every fact, name and place in it, and build every other field around it.';
  if (mode === 'opener') {
    return `THE PLAYER PICKED A HAND-WRITTEN OPENER (the kept fields below). Build every other field around it.${input.shape ? ` The player joins the story at "${input.shape.id}": ${input.shape.brief}` : ''}${input.turningPoint ? `\nIts turning point, kept as written: "${input.turningPoint}".` : ''}`;
  }
  if (mode === 'sequel') {
    return `THIS IS THE NEXT BOOK OF A STORY THE PLAYER IS ALREADY PLAYING. Same hero, same world. Write a new arc that grows out of how the last book ended, with a new problem and a new turning point still ahead. Keep established names, places and relationships.

${input.continuation ?? ''}`;
  }
  return input.seed
    ? `THE PLAYER PICKED THIS STORY IDEA from the genre's seed list. Build the story from its situation and its conflict; invent the people, places and details yourself:\n"${input.seed}"`
    : '';
}

/** The whole story-roll prompt: the genre, then every field to fill. */
export function buildMasterPrompt(input: MasterInput): string {
  const { category, pronouns, fixed = {} } = input;
  const kept = keptLines(fixed);
  const recent = input.mode === 'fresh' ? recentStories() : [];
  const parts = [
    genreIntro(category, input.media),
    modeBlock(input),
    `These are the fields for the story you are crafting. Please tell us about the story by filling in every field. They all describe ONE story and never contradict each other. Once the player is happy with it, the next step is telling the story with them, one scene at a time.
${pronounLine(input.pronounsChosen === false ? undefined : pronouns)}`,
    kept.length ? `ALREADY FILLED IN (return these exactly as they are, and make everything else fit them):\n${kept.join('\n')}` : '',
    playerFields(category),
    DM_FIELDS,
    sheetRules(category),
    recent.length
      ? `The player's last stories (any genre) were: ${recent.map((s) => `"${s.title}" (the hero was a ${s.hero})`).join('; ')}. Make this one clearly different: a different kind of hero and situation, and no title words from these.`
      : '',
    PLAIN_WRITING + nameListLine(),
    `Reply with JSON only, in this shape:\n${jsonShape()}`
  ];
  return parts.filter(Boolean).join('\n\n');
}

/* --------------------------- single-field rerolls --------------------------- */

export type RerollField = 'title' | 'name' | 'roleClass' | 'origin';

export interface StoryAsItStands {
  category: ExperienceCategory;
  pronouns: string;
  title: string;
  premise: string;
  hero: HeroDraft;
}

const REROLL_ASKS: Record<RerollField, (s: StoryAsItStands) => string> = {
  title: (s) => `Change ONLY the title. Give the story a new title of one to five words (not "${s.title}").\nReply as JSON: { "title": "…" }`,
  name: (s) => `Change ONLY the hero's name. Give the hero a new first and last name (not "${s.hero.name}") that fits the pronouns ${s.pronouns}.\nReply as JSON: { "name": "…" }`,
  origin: (s) => `Change ONLY the hero's origin. Give a new origin (not "${s.hero.origin}"): ${originRule(s.category)} Then new looks to match: one or two sentences (build, face, what they wear or carry).\nReply as JSON: { "origin": "…", "appearance": "…" }`,
  roleClass: (s) => `Change ONLY the hero's class. Give a new class (not "${s.hero.roleClass}"): ${classRule(s.category)} Then the hero sheet that goes with it.\n\n${sheetRules(s.category)}\n\nReply as JSON: { "roleClass": "…", ${SHEET_EXAMPLE} }`
};

/**
 * One field, rewritten for the story as it stands. No example titles here (ohnna, 2026-11-26):
 * the story below is the context, and the new field only has to be cohesive with it.
 */
export function buildRerollPrompt(field: RerollField, s: StoryAsItStands): string {
  return [
    `${DM_LINE} Your player is setting up ${storyKind(s.category)}. Make sure what you write is cohesive with the story below.`,
    `THE STORY AS IT STANDS (the player's setup screen)
Title: ${s.title}
The story: ${s.premise.slice(0, 1500)}
Hero: ${s.hero.name} (${s.pronouns}), ${s.hero.roleClass}, ${s.hero.origin}`,
    REROLL_ASKS[field](s),
    PLAIN_WRITING
  ].join('\n\n');
}

/* ------------------------------ the story check ------------------------------ */

export const CHECK_SCHEMA = {
  type: 'OBJECT',
  properties: {
    pass: { type: 'BOOLEAN' },
    problems: { type: 'ARRAY', items: { type: 'STRING' }, description: 'Each problem names the field and says what is wrong; empty when pass is true' }
  },
  required: ['pass', 'problems']
};

/** The second call: an editor reads the writer's prompt and reply. Prompted judgment, no code rules. */
export function buildCheckPrompt(writerPrompt: string, reply: unknown): string {
  return `You are the story editor for a choose-your-own-adventure RPG. A writer was given the PROMPT below and wrote the REPLY below. The reply fills in the player's setup screen before the game starts.

Read both carefully and check two things:
1. Did the writer follow the prompt? Every instruction, including the genre, not recreating the example stories, filling every field as described, keeping any fields marked as already filled in, and avoiding AI-sounding writing and typical AI names and places.
2. Is it logical? Read the fields the way the player will. Do they all tell ONE story that makes sense: a class, origin, looks, skills and gear that fit the hero the premise describes, and DM notes and chapters that follow from the premise? Does anything contradict something else, or not make sense?

For the AI-writing check: names of people and places that AI models overuse include ${[...OVERUSED_NAMES, ...AI_HABIT_PLACES].join(', ')}, and names that sound like them. A person or place with one of these names, or a phrase that reads like stock AI prose, does not pass. The list is about names: an ordinary word such as "ash" or "cross" in a title or sentence is fine. A famous real person's name for an invented character is not fine.

Do not report JSON formatting, missing optional fields (such as a gear item's "equipped" or "description"), gear quantities or skill spelling: the app checks and fixes those itself. Only report real problems a reader would notice, not matters of taste. If there are none, pass.

=== PROMPT ===
${writerPrompt}

=== REPLY ===
${JSON.stringify(reply, null, 2)}

Reply with JSON only: { "pass": true or false, "problems": ["<field>: <what is wrong>", …] }`;
}

/** The writer's second try, when the check found problems. */
export function buildFixPrompt(writerPrompt: string, reply: unknown, problems: string[]): string {
  return `${writerPrompt}

=== YOUR FIRST DRAFT ===
${JSON.stringify(reply, null, 2)}

=== THE EDITOR FOUND THESE PROBLEMS ===
${problems.map((p) => `- ${p}`).join('\n')}

Write the whole reply again, fixing every problem above and keeping what already works. Reply with the complete JSON object only, in the same shape.`;
}
