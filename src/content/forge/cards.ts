/**
 * Opening and closing cards. Copy to src/content/forge/cards.ts.
 *
 * Every premise before 0.2 opened on the hero's daily routine ("You spend your days...")
 * and closed on "How long can you...?". The first 0.2 prototype fixed that but found new
 * ruts ("You stand..." in 12 of 24, "Will you X, or Y?" in 20 of 24). So each roll is
 * dealt one opening and one closing card in rotation, never the same as the last roll.
 * ohnna's rule (2026-11-21) that the premise ends on a question is kept: the cards vary
 * the KIND of question.
 */
export const OPENING_CARDS: readonly string[] = [
  'Open with a line of dialogue someone says to the hero.',
  'Open with a sound the hero hears.',
  'Open with the object in the hero\'s hands and what is wrong with it.',
  'Open mid-motion: the hero is already running, climbing, rowing, hiding or carrying something.',
  'Open with a time and a place, like a log entry or a letter heading.',
  'Open with the most striking detail of the place.',
  'Open with what the hero wants most, said plainly.',
  'Open with what someone else is doing, and only then bring in the hero.',
  'Open with a rule, a sign or a notice the hero is reading.',
  'Open with the weather and what it is doing to the people in it.',
  'Open with a smell, and what it means to the hero.',
  'Open with a crowd, then find the hero in it.',
  'Open with something the hero is counting: coins, steps, hours or people.',
  'Open with a small kindness the hero does without thinking.'
];

export const CLOSING_CARDS: readonly string[] = [
  'a choice between two concrete actions ("Do you … or …?")',
  'who the hero turns to first ("Who do you …?")',
  'what the hero offers, gives up or keeps ("What do you …?")',
  'where the hero goes first ("Where do you …?")',
  'whether the hero keeps a promise, a secret or a rule ("Do you keep …?")',
  'what the hero says first, and to whom ("What do you tell …?")',
  'what the hero does with the thing in front of them ("What do you do with …?")',
  'which of two people the hero helps first ("Do you help … or …?")',
  'whether the hero acts now or waits ("Do you … now, or wait until …?")',
  'who the hero lets in ("Do you let … in?")'
];
