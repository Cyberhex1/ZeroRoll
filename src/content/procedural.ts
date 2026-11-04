/**
 * Offline setup generator (Offline mode, or the procedural roll button). Draws only from
 * the category's own procedural kit.
 */
import type { DMStoryOutline, ExperienceCategory, InventoryItem } from '../types';
import { getContent, gearToInventory } from './index';
import { isFreshName } from './names';

export interface RandomizedScenarioData {
  title: string;
  heroName: string;
  gender?: string;
  roleClass: string;
  raceOrigin: string;
  storyBlurb: string;
  physicalDescription: string;
  avatarUrl?: string;
  storyOutline?: DMStoryOutline;
  suggestedActions: string[];
  initialInventory: InventoryItem[];
  initialSpells: string[];
  initialConditions: string[];
  startingHp: number;
}

const pick = <T,>(xs: readonly T[], fallback: T): T => (xs.length ? xs[Math.floor(Math.random() * xs.length)] : fallback);

export function generateRandomScenarioSetup(category: ExperienceCategory): RandomizedScenarioData {
  const k = getContent(category).procedural;
  // Skip the stock names models and name lists lean on (Sloane, Vance and the like).
  const fresh = (xs: string[]) => (xs.filter(isFreshName).length ? xs.filter(isFreshName) : xs);
  const heroName = `${pick(fresh(k.firstNames), 'Tamsin')} ${pick(fresh(k.lastNames), 'Ashford')}`;
  const roleClass = pick(k.roles, 'Adventurer');
  const raceOrigin = pick(k.origins, 'Human');
  const hook = pick(k.hooks, {
    hook: `${heroName}, a ${raceOrigin} ${roleClass}, arrives at the edge of something new.`,
    actions: ['Look around carefully', 'Speak with the nearest person', 'Check your gear'],
    gear: [{ name: 'Traveler\'s Pack', type: 'misc' as const }],
    spells: [],
    hp: 12
  });
  return {
    title: pick(k.titles, 'A New Beginning'),
    heroName,
    roleClass,
    raceOrigin,
    storyBlurb: hook.hook,
    physicalDescription: pick(k.physicalTraits, `${heroName} has an observant gaze and practical traveling clothes.`),
    suggestedActions: hook.actions.length ? hook.actions : ['Look around carefully', 'Speak with the nearest person', 'Check your gear'],
    initialInventory: gearToInventory(hook.gear),
    initialSpells: hook.spells,
    initialConditions: ['Well-Rested'],
    startingHp: hook.hp || 12
  };
}
