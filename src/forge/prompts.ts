/**
 * Story Forge prompt texts (plan section 6). Positive craft targets instead of a wall of
 * don'ts; the only examples are the spread's own cards, which change every roll.
 */
import { getCategoryProfile, getContent } from '../content';
import { deckFor, Spread } from './spread';
import type { Pitch } from './pitch';
import { RULE_NEVER_CLIMAX, STORY_SHAPES } from '../setup/storyShape';
import { CLASS_RULE, HERO_FIT, ORIGIN_RULE, SHEET_EXAMPLE, SHEET_RULES } from '../setup/heroRules';
import type { FixedParts } from '../setup/normalize';
import type { GateFailure } from './gate';
import { STOCK_PLACES, TITLE_TICS } from './gate';

export const STOCK_PLACE_LINE = `Never call a place ${STOCK_PLACES.slice(0, -1).join(', ')}.`;

/** The spread as the model reads it. `outlineOnly` (adapt, opener): ingredients for the outline, not the premise. */
/** "night guard: a rules horror hero" -> "night guard"; the part before a colon, else the whole line. */
export const heroKind = (hero: string): string => (hero.includes(':') ? hero.slice(0, hero.indexOf(':')).trim() : hero);

export function spreadBlock(s: Spread, opts: { outlineOnly?: boolean; noHook?: boolean; adapt?: boolean } = {}): string {
  const card = getContent(s.category).card;
  const deck = deckFor(s.category);
  const profile = getCategoryProfile(s.category);
  const f = s.family;
  // Coherence fix (2026-11-25): every card used to be offered on equal terms ("fuse and transform
  // it"), so the model stitched hero, hook, place, a second film and the palette into one premise
  // (a retired baker waking in a hotel copy of their prison cell). Now the family, the hook and
  // the primary DNA are the core; everything else is optional and may be left out.
  const hookLine = opts.outlineOnly || opts.noHook
    ? ''
    : s.hookIsSeed
      ? `- THE PLAYER'S CHOSEN STORY SEED (the core of this story; keep its situation and its central conflict, and invent the people, places and stakes): ${s.hook}`
      : `- The hook (use it, twist it, or replace it with a stronger one of the same kind): ${s.hook}.`;
  const core = [
    opts.adapt
      ? `- Story family: ${f.name}. Later, ${f.turn}. Payoff: ${f.payoff}.`
      : `- Story family: ${f.name}. The hero is usually ${heroKind(f.hero)}. It starts in ${f.start}. Later, ${f.turn}. Payoff: ${f.payoff}.`,
    f.rule ? `- Family rule: ${f.rule}` : '',
    hookLine,
    `- Storytelling DNA of ${s.primary.title} (${s.primary.medium}): ${s.primary.dna}`
  ].filter(Boolean);
  const optional = [
    s.heroCard && !opts.outlineOnly && !opts.noHook
      ? `- A hero idea: ${s.heroCard}. Use it only if it fits the hook${s.hookIsSeed ? ' and the seed does not already say who the hero is' : ''}; otherwise pick someone who belongs in the hook's world.`
      : '',
    opts.outlineOnly ? '' : `- A place idea: ${s.place}. Use it only if the hook could happen there; otherwise invent a place where it naturally would.`,
    `- A plot engine for the middle chapters: ${s.engine.name} (${s.engine.drive}).`,
    s.spice ? `- A second influence, for one small idea in the outline at most: ${s.spice.title}: ${s.spice.dna}` : '',
    `- Palette for scenes and details, mostly in later chapters (never a list to tick off): ${f.palette}.`
  ].filter(Boolean);
  return `CATEGORY: ${card.name}. ${deck.signature}
Voice: ${profile.voice}

${opts.outlineOnly ? "INGREDIENTS FOR THE OUTLINE (drawn at random for this story; use them in the plan, not in the player's premise)" : "THIS ROLL'S CARDS (drawn at random for this story)"}
THE CORE (build the story from these):
${core.join('\n')}
OPTIONAL CARDS (drawn independently, so some will not fit. Take one only if it fits the core without bending it; leaving most of them out is normal and expected):
${optional.join('\n')}
${ONE_STORY}
Borrow structure, dynamics and feel from the influences, never their names, characters, places or plots.`;
}

/** The rule the stitched premises broke. */
export const ONE_STORY =
  'ONE STORY, NOT A COLLAGE: the result must read as one situation a real writer chose on purpose: one hero, one place, one thing happening. If a card would need explaining away to fit, leave it out.';

export const CRAFT = `WHAT MAKES A GREAT OPENING HERE
- A specific person with a want they would fight for and a flaw or fear that will cost them. A job, if they have one, is texture, not the story.
- A place that feels real and lived-in, with one concrete detail that could only exist in this story.
- The hook is happening NOW, in the first scene: an arrival, a discovery, an offer, a theft, a summons, a body, a door. Something the player can grab with both hands.
- The defining event of the story (the turning point) is still ahead. The hook opens the door; the turning point is what waits behind it.
- One element the player would not guess from the genre name, in the genre's own tone. It grows out of this situation; it is never a second situation bolted on.
- Tell it from inside the hero: only what they know, see and want. Other people's secrets stay hidden.`;

export const PITCH_SCHEMA = {
  type: 'OBJECT',
  properties: {
    pitches: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          title: { type: 'STRING' },
          hero: { type: 'STRING', description: 'Who they are and what they want, one sentence' },
          hook: { type: 'STRING', description: 'What happens in the first scene' },
          turningPoint: { type: 'STRING', description: 'The defining event ahead; never the hook itself' },
          surprise: { type: 'STRING', description: 'The element the player would not guess' }
        },
        required: ['title', 'hero', 'hook', 'turningPoint', 'surprise']
      }
    }
  },
  required: ['pitches']
};

export function pitchPrompt(s: Spread): string {
  return `You are running a pitch meeting for a new tabletop RPG campaign.

${spreadBlock(s)}

${CRAFT}

Pitch 4 stories from these cards that are truly different from each other. Each pitch is ONE clear situation built from the core; it may take one or two optional cards that fit, and drops the rest.
1. plays the core straight, at its best;
2. turns the hook inside out (the victim is the culprit, the gift is a debt, the monster is a guest);
3. pushes the family's later turn somewhere the player would not expect;
4. is the boldest one that still keeps the category line above.
For each: title (two to five words, no chapter number, naming something only this story has: its place, a person, an object or the hook; never the worn words ${[...new Set(TITLE_TICS.map((w) => w.replace(/e?s$/, '')))].join(', ')}), hero (who they are and what they want, one sentence), hook (what happens in the first scene), turningPoint (the defining event ahead; never the hook itself), surprise (the element the player would not guess).
${STOCK_PLACE_LINE}
Reply with JSON only: { "pitches": [{ "title": "…", "hero": "…", "hook": "…", "turningPoint": "…", "surprise": "…" }] }`;
}

/** The screenshot bug: premise in a cell, "where you start" baking bread at home. */
export const SAME_MOMENT = `SAME-MOMENT CHECK: before you reply, read the premise, startingCircumstances, incitingIncident and immediateGoal together, as the player will. They describe the same hero, in the same place, at the same moment: startingCircumstances is the hero's life right up to the premise's scene, incitingIncident is the hook in that scene, and immediateGoal is what the hero wants to do next because of it. If any of them describes a different situation, rewrite it to match the premise.`;

export type BuildMode = 'fresh' | 'adapt' | 'opener' | 'sequel';

export interface BuildPromptInput {
  mode: BuildMode;
  spread: Spread;
  pitch?: Pitch;
  pronouns: string;
  fixed?: FixedParts;
  /** sequel: what happened so far and who the hero is now. */
  continuation?: string;
  /** opener: its turning point, kept as written. */
  turningPoint?: string;
  /** adapt, or an opener without a shape: the model picks where the player joins. */
  chooseShape?: boolean;
}

function heroLines(pronouns: string, fixed: FixedParts, names: Spread['names']): string[] {
  const onHand = [...names.given, ...names.family];
  return [
    fixed.name
      ? `- Pronouns ${pronouns}. Name: keep "${fixed.name}" exactly.`
      : `- Pronouns ${pronouns}. A first and last name from a naming tradition that fits this setting.${onHand.length ? ` Names that fit, if you want them: ${onHand.join(', ')}.` : ''}`,
    fixed.roleClass ? `- Class: keep "${fixed.roleClass}".` : `- ${CLASS_RULE}`,
    fixed.origin ? `- Origin: keep "${fixed.origin}".` : `- ${ORIGIN_RULE}`,
    '- appearance: looks only, one or two sentences: build, face, what they wear or carry.'
  ];
}

function jsonShape(shapeId: string): string {
  return `{
  "title": "…",
  "premise": "…",
  "outline": { "startingCircumstances": "…", "backstory": "…", "incitingIncident": "…", "immediateGoal": "…", "keyNpcs": [{ "name": "…", "role": "…", "motivation": "…", "secret": "…", "move": "…" }], "fronts": [{ "name": "…", "agenda": "…", "portents": ["…", "…", "…"] }], "setPieces": ["…"], "majorConflicts": ["…"], "secretsAndReveals": ["…"], "chapters": ["…"], "potentialEndings": ["…"], "storyShape": "${shapeId}", "turningPoint": "…" },
  "openingActions": ["…", "…", "…"],
  "hero": { "name": "…", "roleClass": "…", "origin": "…", "appearance": "…" },
  ${SHEET_EXAMPLE}
}`;
}

export function buildPrompt(input: BuildPromptInput): string {
  const { mode, spread: s, pitch, pronouns, fixed = {} } = input;
  const outlineOnly = mode === 'adapt' || mode === 'opener';
  const parts: string[] = ['You are the head writer of a tabletop RPG campaign, setting up its story.', ''];

  parts.push(spreadBlock(s, { outlineOnly, noHook: mode === 'sequel', adapt: mode === 'adapt' }));
  parts.push(`- A complication for later (a secret for the outline, never the premise): ${s.complication}.`, '');

  if (mode === 'adapt') {
    parts.push(`THE PLAYER WROTE THIS STORY. It is authoritative: keep every fact, name and place in it, and return it unchanged as "premise".
"""
${fixed.premise ?? ''}
"""
${fixed.title ? `Keep the title "${fixed.title}".` : 'Write a title that fits it.'}
Build everything else around the player's story: the outline, the opening moves, the hero's class, origin and looks, and the hero sheet.`, '');
  } else if (mode === 'opener') {
    parts.push(`THE CAMPAIGN STARTS FROM THIS HAND-WRITTEN OPENER. Keep its title, premise, hero and first moves; return the premise unchanged.
Title: ${fixed.title ?? ''}
Premise: ${fixed.premise ?? ''}
First moves: ${(fixed.actions ?? []).join(' | ')}
Build the rest around it: a full outline (people, fronts, set-pieces, chapters, endings), the hero's looks, and the hero sheet.${input.turningPoint ? `\nThe opener's turning point, kept as written: "${input.turningPoint}". Build the chapters around it.` : ''}`, '');
  } else if (mode === 'sequel') {
    parts.push(`THIS IS THE NEXT BOOK OF A CAMPAIGN THE PLAYER IS ALREADY PLAYING. Same hero, same world.
${input.continuation ?? ''}

Write the next book's story: a new arc that grows out of how the last book ended, with a new pressure, new chapters and a new turning point still ahead. Keep established names, places and relationships, and keep the hero's name, class and origin as given. The premise is written to the player as "you" and starts where this book starts.`, '');
  }

  if (pitch && mode === 'fresh') {
    parts.push(`THE PITCH YOU ARE BUILDING (keep its hero, hook, surprise and turning point)
Title: ${pitch.title}
Hero: ${pitch.hero}
Hook: ${pitch.hook}
Turning point (secret): ${pitch.turningPoint}
Surprise: ${pitch.surprise}`, '');
  }

  if (!outlineOnly) parts.push(CRAFT, '');

  if (input.chooseShape) {
    parts.push(`WHERE THE PLAYER JOINS: keep the premise as given, and pick the storyShape that fits where it starts. ${RULE_NEVER_CLIMAX}
Shapes:
${STORY_SHAPES.map((x) => `- ${x.id}: ${x.brief}`).join('\n')}`, '');
  } else {
    parts.push(`WHERE THE PLAYER JOINS (storyShape "${s.shape.id}"): ${s.shape.label}. ${s.shape.brief}
${s.hookIsSeed && mode === 'fresh' ? "If this shape starts before the seed's situation, the seed's situation is the turning point the story builds to.\n" : ''}${RULE_NEVER_CLIMAX}`, '');
  }

  if (!outlineOnly) {
    parts.push(`PREMISE (the only part the player reads before playing)
- 3 or 4 sentences, to the player as "you", present tense, about 70 to 100 words.
- First sentence: ${s.opening.replace(/^Open with/, 'open with').replace(/\.$/, '')}, already inside the hook's scene (same place, same moment). Never open in one scene and cut to another. If that opening cannot work there, open on the hook itself.
- One scene: the hero, where they are, and the hook happening to them. Name at most two other people or objects, and only ones that matter to the hook.
- Only what the hero knows now. The turning point, the complication and every secret stay in the outline.
- End with one question about ${s.closing}. Both answers come straight out of the scene above, and each one risks or costs something the premise has shown the hero cares about.`, '');
  }

  parts.push(`OUTLINE (game master only; the player never reads it, so put the full plan here)
- startingCircumstances, backstory, incitingIncident (the hook, on screen in the first scene), immediateGoal: one or two sentences each. startingCircumstances and immediateGoal are shown to the player under the premise, so write them to the hero as "you", like the premise, and make them agree with it word for word on facts:
  - startingCircumstances ("Where you start"): who you are and how your life stands as the premise's scene begins: your work, your home, the people and things you care about. Background for that scene, never a different scene, an earlier time or another place. Every object and person it names is where the premise puts them.
  - immediateGoal ("Your first goal"): what you want to get done in the first scene or two, whichever way the player answers the premise's question. It never assumes an answer, never jumps ahead to later events, and adds no new people, places or objects the premise has not set up.
- keyNpcs: 3 or 4 people. Each has a role, what they want (motivation), a secret, and the move they make next if the hero does nothing.
- fronts: 2 pressures that move on their own, whether or not the hero acts. Each has a name, an agenda and 3 or 4 portents that escalate in order; the last portent is what happens if nobody stops it.
- setPieces: 4 big, vivid scenes for later chapters (a place plus something happening). You may transform these genre moments: ${s.setPieces.join(' | ')}
- chapters: 4 or 5 short chapter titles (3 to 8 words each), naming this story's people and places; the turning point lands in its own chapter, on screen, under a title of its own (not the turning point sentence); the last resolves the story.
- turningPoint: what happens at the defining event, as a full sentence, and its chapter: "Chapter N: <who does what to whom>". Not a chapter title.
- majorConflicts (2), secretsAndReveals (2, for later), potentialEndings (2 or 3).
- openingActions: three first moves of different kinds (say something, do something, look into something).
- Call the hero by the same name everywhere.
- title: two to five words, no chapter number, naming something only this story has (its place, a person, an object or the hook).`, '');

  parts.push('THE HERO', ...heroLines(pronouns, fixed, s.names), '', SHEET_RULES, '', HERO_FIT, '');
  if (!outlineOnly) parts.push(SAME_MOMENT, '');
  parts.push(STOCK_PLACE_LINE, `Reply with JSON only, in this shape:\n${jsonShape(input.chooseShape ? '…' : s.shape.id)}`);
  return parts.join('\n');
}

const REPAIR_LINES: Record<GateFailure['kind'], (f: GateFailure, s: Spread, firstWordsText: string) => string> = {
  stock: (f) => `It uses a stock line ("${f.detail}"). Say it in this story's own words.`,
  irony: (f) => `It tells the player something the hero does not know ("${f.detail}"). Cut it; show only what the hero knows.`,
  spoiler: () => 'It gives away the secret turning point. Remove every hint of it.',
  shape: () => 'It must be 3 or 4 sentences, about 70 to 100 words, and end with a question that names someone or something from this story.',
  samey: (_f, s, fw) => `It opens like a recent story ("${fw}"). Open differently, in the same scene: ${s.opening}`,
  tics: (f) => `Replace these worn words: ${f.detail}.`,
  pov: () => 'Write it in second person: the hero is "you"; their name appears only in someone\'s dialogue.',
  off_genre: (f, s) => `"${f.detail}" does not belong in ${getContent(s.category).card.name}. Remove it.`
};

export function repairPrompt(input: { premise: string; title?: string; titleTics?: string[]; startingCircumstances?: string; incitingIncident?: string; turningPoint?: string; failures: GateFailure[]; spread: Spread; firstWords: string }): string {
  const titleLine = input.titleTics?.length
    ? `\nTITLE: "${input.title}" uses a worn word (${input.titleTics.join(', ')}). Also give a new title of two to five words that names something only this story has (its place, a person, an object or the hook).`
    : '';
  if (!input.failures.length) {
    return `Give this story a new title.

PREMISE:
${input.premise}
${titleLine}
Reply with JSON only: {"title": "..."}`;
  }
  const fixes = input.failures.map((f) => `- ${REPAIR_LINES[f.kind](f, input.spread, input.firstWords)}`);
  return `Rewrite this story premise so it passes the checks below. Keep the same hero, place, hook and kind of closing question; change only what the checks name.

PREMISE:
${input.premise}

WHAT THE HERO KNOWS NOW: ${[input.startingCircumstances, input.incitingIncident].filter(Boolean).join(' ')}
SECRET (must not appear or be hinted at): ${input.turningPoint ?? '(none)'}

FIX:
${fixes.join('\n')}

3 or 4 sentences, "you", present tense, about 70 to 100 words. End with one question about ${input.spread.closing}.${titleLine}
Reply with JSON only: {"premise": "..."${input.titleTics?.length ? ', "title": "..."' : ''}}`;
}
