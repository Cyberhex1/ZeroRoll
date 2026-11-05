/**
 * Offline setup generator (Offline mode, the procedural roll button and the draft a setup
 * window opens with). A draft is one whole opener from the category, so its title, premise,
 * hero, gear and spells belong together (playtest D16); only the name changes when it
 * doesn't fit the chosen pronouns or is a stock name (B9, D17).
 */
import type { DMStoryOutline, ExperienceCategory, InventoryItem } from '../types';
import type { Opener } from './types';
import { getContent, gearToInventory } from './index';
import { givenName, isFreshName, nameFitsPronouns } from './names';

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
  /** The opener the draft came from, for the campaign's inspiration. */
  openerId?: string;
}

const pick = <T,>(xs: readonly T[], fallback: T): T => (xs.length ? xs[Math.floor(Math.random() * xs.length)] : fallback);

/** A hero name from the category that is not a stock name and fits the pronouns. */
export function heroNameFor(category: ExperienceCategory, pronouns?: string, preferred?: string): string {
  if (preferred && isFreshName(preferred) && nameFitsPronouns(preferred, pronouns)) return preferred;
  const c = getContent(category);
  const firsts = [...new Set([...c.openers.map((o) => givenName(o.hero.name)), ...c.procedural.firstNames])]
    .filter((n) => n && isFreshName(n) && nameFitsPronouns(n, pronouns));
  const preferredLast = preferred?.trim().split(/\s+/).slice(1).join(' ');
  const lasts = c.procedural.lastNames.filter(isFreshName);
  const last = preferredLast && isFreshName(preferredLast) ? preferredLast : pick(lasts, 'Ashford');
  const first = pick(firsts.filter((n) => n !== givenName(preferred ?? '')), pick(firsts, 'Tamsin'));
  return `${first} ${last}`.trim();
}

export function generateRandomScenarioSetup(category: ExperienceCategory, opts: { pronouns?: string; notTitle?: string } = {}): RandomizedScenarioData {
  const c = getContent(category);
  const openers = c.openers.filter((o) => o.title !== opts.notTitle);
  const o: Opener | undefined = pick(openers.length ? openers : c.openers, undefined as Opener | undefined);
  if (!o) {
    const heroName = heroNameFor(category, opts.pronouns);
    return {
      title: 'A New Beginning',
      heroName,
      roleClass: pick(c.procedural.roles, 'Adventurer'),
      raceOrigin: pick(c.procedural.origins, 'Human'),
      storyBlurb: `${heroName} arrives at the edge of something new.`,
      physicalDescription: '',
      suggestedActions: ['Look around carefully', 'Speak with the nearest person', 'Check your gear'],
      initialInventory: gearToInventory([{ name: "Traveler's Pack", type: 'misc' }]),
      initialSpells: [],
      initialConditions: ['Well-Rested'],
      startingHp: 12
    };
  }
  return {
    title: o.title,
    heroName: heroNameFor(category, opts.pronouns, o.hero.name),
    roleClass: o.hero.role,
    raceOrigin: o.hero.origin,
    storyBlurb: o.premise,
    physicalDescription: '',
    storyOutline: { startingCircumstances: o.premise, immediateGoal: o.actions[0] } as DMStoryOutline,
    suggestedActions: [...o.actions],
    initialInventory: gearToInventory(o.gear),
    initialSpells: [...o.spells],
    initialConditions: ['Well-Rested'],
    startingHp: o.hp || 12,
    openerId: o.id
  };
}
