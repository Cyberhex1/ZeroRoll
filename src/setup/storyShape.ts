/**
 * Where the player joins the story (ohnna, 2026-11-21).
 *
 * A story about a betrayal, a loss or a transformation is cheap when the player is dropped in
 * after it, at the turning point or the climax. Each roll picks one of these shapes so the thing
 * the story is about is still ahead of the player and happens on screen. The shape and the
 * turning point travel with the outline, so Chapter One and every later turn build to it.
 */

export type StoryShapeId = 'before' | 'brewing' | 'long_road' | 'hidden_return';

export interface StoryShape {
  id: StoryShapeId;
  /** Player-facing, on the story card: "Where you join: …". */
  label: string;
  /** How often it is picked, relative to the others. */
  weight: number;
  /** What the story roll is told. */
  brief: string;
  /** One line for the game master on every turn. */
  pacing: string;
}

export const STORY_SHAPES: readonly StoryShape[] = [
  {
    id: 'before',
    label: 'From the very beginning',
    weight: 3,
    brief:
      "Start in the hero's life BEFORE the turning point, with something worth losing on the page: the people, the place, the standing or the trust it will cost. The turning point happens on screen in chapter 1 or 2, and the player lives through it. The rest of the story answers it.",
    pacing: 'The player starts before the turning point. Let them live with what they will lose, then play the turning point out on screen when its chapter comes. Never skip it or tell it as already done.'
  },
  {
    id: 'brewing',
    label: 'While things are still building',
    weight: 3,
    brief:
      'Start while the trouble is building: warning signs, small slights, a rival circling, something that does not add up. The breaking point lands around the middle of the story, on screen. The first half builds to it; the second half is the response. For example, in Revenge: a trusted, overworked clerk is handed extra work and talked down to for a few chapters, then fired for something she did not do, and only then uses what she knows to bring down her coworkers and her old boss. In Zombie Outbreak: a nurse notices the odd admissions for a few shifts before the hospital falls.',
    pacing: 'The player starts while the trouble is building. Plant warning signs and small wrongs; the breaking point lands mid-story, on screen, and the second half is the response.'
  },
  {
    id: 'long_road',
    label: 'The long road',
    weight: 2,
    brief:
      'Most of the story is living through the slow wrong: the betrayal unfolding, the hardship endured, the hero not yet knowing who is behind it or why. The truth arrives late, and the payoff takes the last chapter.',
    pacing: 'The player lives through the slow wrong for most of the story without knowing the whole truth. Hold the truth back until late; the payoff belongs to the final chapter.'
  },
  {
    id: 'hidden_return',
    label: 'After a big change, keeping a secret',
    weight: 2,
    brief:
      'Start after a great change has already happened, but the hero carries something nobody knows yet: a hidden identity, a transformation, what they saw, what they plan. The big moment is still ahead (the reveal, the reckoning, the confrontation) and the story builds to it. Never start at that moment.',
    pacing: 'The great change is behind the hero, but their secret is not out. Build tension around it; the reveal or reckoning is the story\'s big moment and must not come early.'
  }
];

export const RULE_NEVER_CLIMAX =
  'Never drop the player at the climax, or straight after the defining event with nothing big left to live through. Whatever the story is really about (the betrayal, the loss, the discovery, the transformation, or its reveal) must still be ahead of the player and happen on screen.';

export function shapeById(id: unknown): StoryShape | undefined {
  return STORY_SHAPES.find((s) => s.id === id);
}

/** A weighted random shape, never the one given (so Reroll Story varies where you join). */
export function pickShape(notId?: StoryShapeId, rand: () => number = Math.random): StoryShape {
  const pool = STORY_SHAPES.filter((s) => s.id !== notId);
  const total = pool.reduce((sum, s) => sum + s.weight, 0);
  let roll = rand() * total;
  for (const s of pool) {
    roll -= s.weight;
    if (roll < 0) return s;
  }
  return pool[pool.length - 1];
}
