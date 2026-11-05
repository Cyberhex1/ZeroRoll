import { describe, expect, it } from 'vitest';
import { generateRandomScenarioSetup } from '../../content/procedural';
import { getContent } from '../../content';
import { CATEGORY_IDS } from '../../content/categoryIds';
import { isFreshName, nameFitsPronouns } from '../../content/names';

describe('offline drafts (playtest D16, D17)', () => {
  it('come from one opener, so title, premise, hero and gear belong together', () => {
    for (const id of CATEGORY_IDS) {
      for (let i = 0; i < 5; i++) {
        const d = generateRandomScenarioSetup(id, { pronouns: 'she/her' });
        const o = getContent(id).openers.find((x) => x.id === d.openerId)!;
        expect(o, id).toBeTruthy();
        expect(d).toMatchObject({ title: o.title, storyBlurb: o.premise, roleClass: o.hero.role, raceOrigin: o.hero.origin });
        expect(d.initialInventory.map((g) => g.name)).toEqual(o.gear.map((g) => g.name));
      }
    }
  });

  it('give names that fit the pronouns and avoid stock names', () => {
    for (const id of CATEGORY_IDS) {
      for (const pronouns of ['she/her', 'he/him']) {
        for (let i = 0; i < 8; i++) {
          const { heroName } = generateRandomScenarioSetup(id, { pronouns });
          expect(nameFitsPronouns(heroName, pronouns), `${id} ${pronouns} ${heroName}`).toBe(true);
          expect(isFreshName(heroName), heroName).toBe(true);
        }
      }
    }
    expect(nameFitsPronouns('Sebastian Fairfax', 'she/her')).toBe(false);
    expect(nameFitsPronouns('Dr. Evelyn Hart', 'he/him')).toBe(false);
    expect(nameFitsPronouns('Rowan Pike', 'he/him')).toBe(true);
  });
});
