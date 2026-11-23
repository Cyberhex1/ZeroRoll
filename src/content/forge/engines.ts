/**
 * Shared plot engines. Copy to src/content/forge/engines.ts.
 * An engine is what drives scenes from chapter to chapter, independent of genre.
 */
import type { EngineId } from './types';

export interface PlotEngine {
  name: string;
  /** What drives its scenes, in one line. */
  drive: string;
}

export const ENGINES: Record<EngineId, PlotEngine> = {
  heist: { name: 'a heist', drive: 'a plan, a crew or an inside person, a guarded target, and the moment the plan breaks' },
  journey: { name: 'a journey with stops', drive: 'a destination far away; each stop on the road is a different kind of test' },
  mystery: { name: 'a mystery', drive: 'a question that matters, clues spread across places and people, and a suspect who lies for a sympathetic reason' },
  siege: { name: 'a siege', drive: 'something small to defend, something huge coming, and the price of every hour held' },
  bargain: { name: 'a bargain gone wrong', drive: 'a deal that seemed fair, terms that tighten each chapter, and a loophole to find' },
  rescue: { name: 'a rescue', drive: 'someone taken or lost, a deadline, and a person who may not want to be found' },
  contest: { name: 'a contest', drive: 'rounds of a public competition, a rival with a better reason than yours, and rules someone is bending' },
  masquerade: { name: 'a masquerade', drive: 'the hero must pass as someone they are not, and every scene risks the mask' },
  trial: { name: 'a trial', drive: 'a judgment coming on a set day, witnesses to win over, and a truth that helps one person and hurts another' },
  hunt: { name: 'a hunt', drive: 'a quarry with its own reasons, signs to read, and the moment the hunter becomes the hunted' },
  inheritance: { name: 'an inheritance', drive: 'something left behind with conditions, people who want it, and what it reveals about the dead' },
  homecoming: { name: 'a homecoming', drive: 'going back to a place that changed, people who remember the hero differently, and an old debt' },
  courtship: { name: 'a courtship', drive: 'two people forced into each other\'s company, a reason they should not, and a public moment that forces a choice' },
  escape: { name: 'an escape', drive: 'a place that will not let the hero leave, allies of convenience, and a way out that costs something' },
  survival: { name: 'survival', drive: 'dwindling supplies, a group with different ideas, and choices about who gets what' },
  delivery: { name: 'a delivery', drive: 'something precious that must reach someone by a deadline, and everyone who wants it on the way' }
};
