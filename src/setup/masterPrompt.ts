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
 * The genre comes from the category's own line below plus a few titles from its seed list
 * (src/content/categories/<id>.ts "media"), as examples of the kind of story, never to copy.
 */
import type { ExperienceCategory } from '../types';
import { getContent, shuffle } from '../content';
import { recentRolls } from '../lib/rollFreshness';
import { STORY_SHAPES, StoryShape } from './storyShape';
import { CLASS_RULE, HERO_FIT, ORIGIN_RULE, SHEET_EXAMPLE, SHEET_RULES } from './heroRules';
import type { HeroDraft } from './types';
import { OVERUSED_NAMES } from '../content/names';

/**
 * Names and places AI models overuse. Shown to the story check only (the editor), never to the
 * writer: a list in the writer's prompt primes the very names it lists.
 */
export const AI_HABIT_PLACES = ['Oakhaven', 'Eldoria', 'Willowbrook', 'Silverbrook', 'Ravenswood', 'Riverbend', 'Stonehaven', 'Blackwood', 'Brightwater', 'Mistvale', 'Thornfield', 'Ashford'];

/** What each category's player signed up for, in one or two plain sentences. */
export const GENRE_LINES: Record<ExperienceCategory, string> = {
  fantasy: 'A fantasy adventure: a world with its own magic, history and peoples, where one person gets caught up in something bigger than they are.',
  adventure: 'A swashbuckling adventure: expeditions, treasure, ships, ruins and rivals, told with momentum and daring.',
  historical_adventure: 'A historical adventure set in a real time and place from history, true to its customs, politics and dangers.',
  horror: 'A horror story: dread that builds, something wrong that the hero has to survive or understand, in a place they cannot easily leave.',
  cozy_ghibli: 'A cozy, gentle story in the spirit of Studio Ghibli: warmth, small wonders, nature spirits, community and kindness, with low but real stakes.',
  romantic: 'A romance: two people, the pull between them and everything standing in the way, with sharp dialogue and tension that lingers.',
  revenge: 'A revenge story: the hero is wronged and written off, lives through it, and then takes back what was theirs.',
  apocalypse: 'A post-apocalyptic survival story: the world already ended, and the hero has to live, scavenge and choose who to trust in what is left.',
  zombie: 'A zombie outbreak survival story: ordinary life breaking down as the dead rise, and the hard choices of staying alive.',
  cosmic_horror: 'A cosmic horror story: the hero uncovers a truth too vast for the human mind, and understanding it costs them.',
  psychedelic_trip: 'A psychedelic trip: reality bends, senses blur together and the hero travels through the inside of a mind as much as a world.',
  tiktok_drama: 'A short-drama story like the ones on ReelShort and GoodNovel: secret identities, contract marriages, cruel rivals and a satisfying comeback, played big and emotional.',
  ancient_greek: 'An Ancient Greek epic: heroes, oracles, city-states, gods who meddle, and honor that has a price.',
  mythology: 'A mythic saga drawn from the world\'s mythologies (Norse, Egyptian and others): fate, gods, monsters and legend.',
  real_life: 'A real-life story: an ordinary person in the modern world facing a very human problem at work, at home or in their city. No magic and no monsters.'
};

/** How many seed-list titles each roll shows as examples. */
export const MEDIA_EXAMPLES = 6;

/** A fresh handful of the category's seed-list titles, e.g. "Treasure Island (Book)". */
export function mediaExamples(category: ExperienceCategory, rand: () => number = Math.random): string[] {
  return shuffle(getContent(category).media, rand)
    .slice(0, MEDIA_EXAMPLES)
    .map((m) => `${m.title} (${m.medium})`);
}

/** The opening every setup call shares: who the model is, the genre and the examples. */
export function genreIntro(category: ExperienceCategory, media: string[]): string {
  const name = getContent(category).card.name;
  const article = /^[aeiou]/i.test(name) ? 'an' : 'a';
  return `You are the game master (DM) of a choose-your-own-adventure tabletop RPG, played one-on-one with a single player.

Today your player chose to play ${article} ${name} story. ${GENRE_LINES[category]}
${media.length ? `Examples of this kind of story in books, film, TV and games: ${media.join('; ')}.\nDo NOT recreate these stories, and never borrow their characters, names, places or plots. Come up with your own.` : 'Come up with your own story.'} Try to be unique and creative while telling a great story.`;
}

export const PLAIN_WRITING =
  'Write like a good human novelist, not like an AI. Use plain, specific words and avoid the stock phrases and flowery filler AI writing is known for. Avoid the names and places AI models reach for by habit: give people names that real people in this setting would have, and give places names that sound like real places.';

/* ------------------------------ the fields ------------------------------ */

const PLAYER_FIELDS = `WHAT THE PLAYER SEES ON THE SETUP SCREEN
- title: the story's title, two to five words.
- premise ("The story"): 3 or 4 sentences, about 70 to 100 words, to the player as "you", in present tense. Who you are, where you are, and what is happening to you right now that starts the story. Only what the hero knows. End with a question about what you will do.
- outline.startingCircumstances ("Where you start"): one or two sentences to the player as "you": your life as the premise's scene begins. Same moment and place as the premise.
- outline.immediateGoal ("Your first goal"): one sentence to the player as "you": what you want to get done in the first scene or two.
- hero.name: the hero's first and last name.
- hero.roleClass ("Class"): ${CLASS_RULE.replace(/^roleClass: /, '')}
- hero.origin ("Origin"): ${ORIGIN_RULE.replace(/^origin: /, '')}
- hero.appearance ("Looks"): one or two sentences: build, face, what they wear or carry.
- openingActions: three short first moves the player could make, of different kinds (say something, do something, look into something).
- sheet: the hero sheet (rules below).`;

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
The player starts BEFORE the turning point, so they live through it on screen. Never start at the climax or right after the big event.`;

function jsonShape(): string {
  return `{
  "title": "…",
  "premise": "…",
  "outline": { "startingCircumstances": "…", "immediateGoal": "…", "backstory": "…", "incitingIncident": "…", "keyNpcs": [{ "name": "…", "role": "…", "motivation": "…", "secret": "…", "move": "…" }], "fronts": [{ "name": "…", "agenda": "…", "portents": ["…", "…", "…"] }], "setPieces": ["…"], "chapters": ["…"], "turningPoint": "…", "storyShape": "…", "majorConflicts": ["…"], "secretsAndReveals": ["…"], "potentialEndings": ["…"] },
  "openingActions": ["…", "…", "…"],
  "hero": { "name": "…", "roleClass": "…", "origin": "…", "appearance": "…" },
  ${SHEET_EXAMPLE}
}`;
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
  actions?: string[];
}

export interface MasterInput {
  category: ExperienceCategory;
  pronouns: string;
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
    fixed.origin ? `- hero.origin: "${fixed.origin}"` : '',
    fixed.actions?.length ? `- openingActions: ${fixed.actions.map((a) => `"${a}"`).join(', ')}` : ''
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
  const recent = input.mode === 'fresh' ? recentRolls(category, 'title').slice(0, 4) : [];
  const parts = [
    genreIntro(category, input.media),
    modeBlock(input),
    `These are the fields for the story you are crafting and telling. Please tell us about the story by filling in every field. They all describe ONE story: the same hero, the same place and the same moment, and they never contradict each other.
The hero uses ${pronouns} pronouns.`,
    kept.length ? `ALREADY FILLED IN (return these exactly as they are, and make everything else fit them):\n${kept.join('\n')}` : '',
    PLAYER_FIELDS,
    DM_FIELDS,
    SHEET_RULES,
    HERO_FIT,
    recent.length ? `Your last stories for this player in this genre were: ${recent.map((t) => `"${t}"`).join(', ')}. Write something different.` : '',
    PLAIN_WRITING,
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
  startingCircumstances?: string;
  goal?: string;
  hero: HeroDraft;
  /** The campaign's example titles; a reroll that has none gets a fresh handful. */
  media?: string[];
}

const REROLL_ASKS: Record<RerollField, (s: StoryAsItStands) => string> = {
  title: (s) => `Change ONLY the title. Give the story a new title of two to five words (not "${s.title}") that fits the story above.\nReply as JSON: { "title": "…" }`,
  name: (s) => `Change ONLY the hero's name. Give the hero a new first and last name (not "${s.hero.name}") that fits the story above, its setting and the pronouns ${s.pronouns}.\nReply as JSON: { "name": "…" }`,
  origin: (s) => `Change ONLY the hero's origin, keeping to the story above. Give a new origin (not "${s.hero.origin}"). ${ORIGIN_RULE} Then new looks to match: one or two sentences (build, face, what they wear or carry).\nReply as JSON: { "origin": "…", "appearance": "…" }`,
  roleClass: (s) => `Change ONLY the hero's class, keeping to the story above. Give a new class (not "${s.hero.roleClass}") that the premise still allows, and the hero sheet that goes with it. ${CLASS_RULE}\n\n${SHEET_RULES}\n\n${HERO_FIT}\n\nReply as JSON: { "roleClass": "…", ${SHEET_EXAMPLE} }`
};

/** One field, rewritten for the story as it stands. */
export function buildRerollPrompt(field: RerollField, s: StoryAsItStands): string {
  return [
    genreIntro(s.category, s.media?.length ? s.media : mediaExamples(s.category)),
    `THE STORY AS IT STANDS (the player's setup screen)
Title: ${s.title}
The story: ${s.premise.slice(0, 1500)}
${s.startingCircumstances ? `Where you start: ${s.startingCircumstances}\n` : ''}${s.goal ? `Your first goal: ${s.goal}\n` : ''}Hero: ${s.hero.name} (${s.pronouns}), ${s.hero.roleClass}, ${s.hero.origin}`,
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
2. Is it logical? Read the fields the way the player will. Do they all tell ONE story that makes sense: the same hero, place and moment in the premise, "where you start" and "your first goal"; a class, origin, looks, skills and gear that fit the hero the premise describes; DM notes and chapters that follow from the premise? Does anything contradict something else, or not make sense?

For the AI-writing check: names and places AI models overuse include ${[...OVERUSED_NAMES, ...AI_HABIT_PLACES].join(', ')}, and anything that sounds like them. A story that uses one of these, or a phrase that reads like stock AI prose, does not pass.

Only report real problems a reader would notice, not matters of taste. If there are none, pass.

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
