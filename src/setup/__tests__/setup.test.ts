import { describe, expect, it } from 'vitest';
import type { StatBlock } from '../../types';
import { getContent } from '../../content';
import { nameFitsPronouns } from '../../content/names';
import { SKILLS } from '../../dnd/rules';
import {
  POINT_BUY_BUDGET, STANDARD_ARRAY, canRaise, fitPointBuy, isLegalPointBuy, lower, pointsLeft, pointsSpent, raise, roleSpread
} from '../pointBuy';
import { SKILL_PICKS, MAX_GEAR, fixName, matchSkill, normalizeGear, normalizeSkills, normalizeSpells, normalizeStoryReply } from '../normalize';
import {
  applyClass, applyHeroPart, applyPackage, applyStoryEdit, choosePronouns, draftFromOpener, editSheet, inspirationWithSeed,
  keepAsIs, offlinePart, resetSheet, sheetForRole, toCharacterSheet, typeHeroField, typedAmong, REPLACES, validateDraft
} from '../draft';
import { buildStoryPrompt } from '../storyRoll';
import type { SetupDraft, StoryPackage } from '../types';

const fantasy = getContent('fantasy');
const opener = fantasy.openers[0];
const insp = { media: ['A'], tropes: ['B'] };
const freshDraft = (): SetupDraft => draftFromOpener('fantasy', opener, 'she/her', insp);

const reply = (over: Record<string, unknown> = {}) => ({
  title: 'Chapter I: The Salt Crown',
  premise: 'You wake in the brine pits with a stolen crown in your pocket. The warden wants it back.',
  outline: { startingCircumstances: 'In the pits.', keyNpcs: [{ name: 'Warden Oslo', role: 'Warden', motivation: 'Order' }], chapters: ['One', 'Two', 'Three'] },
  openingActions: ['Hide the crown', 'Bribe a guard'],
  hero: { name: 'Mira Thorn', roleClass: 'Rogue', origin: 'Tidefolk', appearance: 'Lean, salt-stained coat.' },
  sheet: {
    abilityScores: { str: 8, dex: 15, con: 13, int: 12, wis: 14, cha: 10 },
    skills: ['Stealth', 'sleight-of-hand', 'nonsense', 'perception'],
    gear: [{ name: 'Rusted Shiv', type: 'weapon', equipped: true }, 'Lockpicks', { name: 'lockpicks' }, { name: '' }],
    spells: []
  },
  ...over
});

describe('point buy', () => {
  it('the standard array and every role spread are legal 27-point spreads', () => {
    const arr = Object.fromEntries(['str', 'dex', 'con', 'int', 'wis', 'cha'].map((a, i) => [a, STANDARD_ARRAY[i]])) as unknown as StatBlock;
    expect(pointsSpent(arr)).toBe(POINT_BUY_BUDGET);
    for (const role of ['Fighter', 'Wizard', 'Rogue', 'Cleric', 'Hacker', '']) expect(isLegalPointBuy(roleSpread(role)), role).toBe(true);
  });

  it('raise stops at the budget and at 15; lower stops at 8', () => {
    let s = roleSpread('Fighter');
    expect(pointsLeft(s)).toBe(0);
    expect(canRaise(s, 'cha')).toBe(false);
    expect(raise(s, 'cha')).toBe(s);
    s = lower(s, 'str');
    expect(pointsLeft(s)).toBeGreaterThan(0);
    const all8: StatBlock = { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 };
    expect(lower(all8, 'str')).toBe(all8);
    const at15: StatBlock = { ...all8, str: 15 };
    expect(canRaise(at15, 'str')).toBe(false);
  });

  it('keeps a legal suggestion and repairs an illegal one in the order it suggested', () => {
    const legal = { str: 8, dex: 15, con: 13, int: 12, wis: 14, cha: 10 };
    expect(fitPointBuy(legal, 'Rogue')).toEqual(legal);
    const greedy = { str: 18, dex: 17, con: 16, int: 3, wis: 10, cha: 9 };
    const fixed = fitPointBuy(greedy, 'Fighter');
    expect(isLegalPointBuy(fixed)).toBe(true);
    expect(fixed).toMatchObject({ str: 15, dex: 14, con: 13 });
    expect(fitPointBuy({ STR: 15, Dexterity: 8 }, 'Fighter').str).toBe(15);
    expect(fitPointBuy(null, 'Wizard')).toEqual(roleSpread('Wizard'));
  });
});

describe('normalizing the story reply', () => {
  it('cleans the title, fills three moves, matches real skills and dedupes gear', () => {
    const pkg = normalizeStoryReply(reply(), { category: 'fantasy', pronouns: 'she/her' });
    expect(pkg.title).toBe('The Salt Crown');
    expect(pkg.actions).toHaveLength(3);
    expect(pkg.actions.slice(0, 2)).toEqual(['Hide the crown', 'Bribe a guard']);
    expect(pkg.sheet.skills).toHaveLength(SKILL_PICKS);
    expect(pkg.sheet.skills.slice(0, 3)).toEqual(['stealth', 'sleight of hand', 'perception']);
    for (const s of pkg.sheet.skills) expect(s in SKILLS).toBe(true);
    expect(pkg.sheet.gear.map((g) => g.name)).toEqual(['Rusted Shiv', 'Lockpicks']);
    expect(pkg.sheet.gear[0]).toMatchObject({ type: 'weapon', isEquipped: true, quantity: 1 });
    expect(pkg.hero).toMatchObject({ name: 'Mira Thorn', roleClass: 'Rogue', origin: 'Tidefolk' });
  });

  it('fixed parts win over the reply', () => {
    const pkg = normalizeStoryReply(reply(), {
      category: 'fantasy',
      pronouns: 'he/him',
      fixed: { title: 'My Title', premise: 'You are my story.', name: 'Kept Name', roleClass: 'Bard', actions: ['a', 'b', 'c'] }
    });
    expect(pkg).toMatchObject({ title: 'My Title', premise: 'You are my story.', actions: ['a', 'b', 'c'] });
    expect(pkg.hero).toMatchObject({ name: 'Kept Name', roleClass: 'Bard', origin: 'Tidefolk' });
  });

  it('throws when there is no story or title', () => {
    expect(() => normalizeStoryReply({ title: 'X' }, { category: 'fantasy', pronouns: 'she/her' })).toThrow();
    expect(() => normalizeStoryReply({}, { category: 'fantasy', pronouns: 'she/her' })).toThrow();
  });

  it('swaps a name that does not fit the pronouns', () => {
    const name = fixName('Sebastian Fairfax', 'fantasy', 'she/her');
    expect(nameFitsPronouns(name, 'she/her')).toBe(true);
    expect(fixName('', 'fantasy', 'he/him')).not.toBe('');
  });

  it('skills, gear and spells stay inside their limits', () => {
    expect(matchSkill('Animal-Handling')).toBe('animal handling');
    expect(matchSkill('juggling')).toBeUndefined();
    expect(normalizeSkills('nope', 'Wizard')).toHaveLength(SKILL_PICKS);
    expect(normalizeGear(Array.from({ length: 20 }, (_, i) => `Thing ${i}`))).toHaveLength(MAX_GEAR);
    expect(normalizeGear([{ name: 'Healing Potion', type: 'bogus' }])[0].type).toBe('potion');
    expect(normalizeSpells(['A', 'B', 'C', 'D', 'E'], 'Fighter')).toHaveLength(4);
  });
});

describe('setup draft rules', () => {
  const pkg: StoryPackage = normalizeStoryReply(reply(), { category: 'fantasy', pronouns: 'she/her' });

  it('a story reroll replaces everything, name included, and drops a stale portrait', () => {
    const prev = { ...typeHeroField(freshDraft(), 'name', 'Typed Name'), portrait: 'data:x' };
    const next = applyPackage(prev, pkg, { category: 'fantasy', inspiration: insp, source: 'ai' });
    expect(next.hero.name).toBe('Mira Thorn');
    expect(next.title).toBe('The Salt Crown');
    expect(next.portrait).toBeUndefined();
    expect(next.typed).toEqual([]);
    expect(next.sheet).toBe(next.storySheet);
  });

  it('a rebuild after a story edit keeps the name and title', () => {
    const prev = { ...applyStoryEdit(freshDraft(), { title: 'Mine', premise: 'You run a tavern on a dragon.' }), portrait: 'data:x' };
    expect(prev.stale).toBe(true);
    expect(prev.storySource).toBe('player');
    expect(prev.inspiration.openerId).toBeUndefined();
    const next = applyPackage(prev, pkg, { category: 'fantasy', inspiration: prev.inspiration, source: 'player', keepName: true, keepTitle: true });
    expect(next.hero.name).toBe(prev.hero.name);
    expect(next.title).toBe('Mine');
    expect(next.stale).toBe(false);
    expect(next.typed).toEqual(expect.arrayContaining(['title', 'story']));
  });

  it('a title-only edit does not mark the story stale', () => {
    const d = applyStoryEdit(freshDraft(), { title: 'New Title', premise: opener.premise });
    expect(d.stale).toBe(false);
    expect(d.title).toBe('New Title');
    expect(keepAsIs({ ...d, stale: true }).stale).toBe(false);
  });

  it('pronouns change the name unless the player typed it', () => {
    const d = { ...freshDraft(), hero: { ...freshDraft().hero, name: 'Sebastian Fairfax' } };
    expect(nameFitsPronouns(choosePronouns(d, 'she/her').hero.name, 'she/her')).toBe(true);
    const typed = typeHeroField(d, 'name', 'Sebastian Fairfax');
    expect(choosePronouns(typed, 'she/her').hero.name).toBe('Sebastian Fairfax');
  });

  it('the confirm names only typed fields a reroll would replace', () => {
    const d = typeHeroField(typeHeroField(freshDraft(), 'name', 'X'), 'origin', 'Elf');
    expect(typedAmong(d, REPLACES.roleClass)).toEqual([]);
    expect(typedAmong(d, REPLACES.story)).toEqual(['name', 'origin']);
    expect(typedAmong(d, REPLACES.story, ['name'])).toEqual(['origin']);
  });

  it('a class reroll brings its sheet; editing and resetting the sheet', () => {
    const d = applyClass(freshDraft(), 'Wizard', sheetForRole('Wizard'));
    expect(d.hero.roleClass).toBe('Wizard');
    const edited = editSheet(d, { ...d.sheet, skills: ['arcana', 'history', 'insight', 'religion'] });
    expect(edited.typed).toContain('sheet');
    const reset = resetSheet(edited);
    expect(reset.sheet).toBe(d.storySheet);
    expect(reset.typed).not.toContain('sheet');
    expect(applyHeroPart({ ...d, portrait: 'p' }, { origin: 'Elf', appearance: 'Tall' }).portrait).toBeUndefined();
    expect(applyHeroPart({ ...d, portrait: 'p' }, { name: 'New' }).portrait).toBe('p');
  });

  it('a picked seed leads the tropes and clears the opener', () => {
    const i = inspirationWithSeed('fantasy', 'A lighthouse keeper finds a door', { media: [], tropes: ['x', 'y', 'z'], openerId: 'o' });
    expect(i.tropes).toEqual(['A lighthouse keeper finds a door', 'x', 'y']);
    expect(i.openerId).toBeUndefined();
  });

  it('the campaign hero uses the story gear, falls back to the kit only when there is none, and has no stand-in art', () => {
    const d = applyPackage(null, pkg, { category: 'fantasy', inspiration: insp, source: 'ai' });
    const category = { defaultCharacter: { inventory: [{ id: 'k', name: 'Kit Rope', type: 'misc' as const, quantity: 1, isEquipped: false }] } } as never;
    const hero = toCharacterSheet(d, { pronouns: 'she/her', rulesMode: 'full5e', category });
    expect(hero.inventory.map((g) => g.name)).toEqual(['Rusted Shiv', 'Lockpicks']);
    expect(hero.proficiencies).toEqual(d.sheet.skills);
    expect(hero.avatarUrl).toBeUndefined();
    expect(hero.maxHp).toBeGreaterThanOrEqual(6);
    const bare = toCharacterSheet({ ...d, sheet: { ...d.sheet, gear: [{ ...d.sheet.gear[0], name: '  ' }] } }, { pronouns: 'she/her', rulesMode: 'narrative', category });
    expect(bare.inventory.map((g) => g.name)).toEqual(['Kit Rope']);
  });

  it('validation and offline rolls', () => {
    const d = freshDraft();
    expect(validateDraft(d, 'she/her', '')).toEqual({});
    expect(validateDraft({ ...d, premise: ' ' }, 'custom', '')).toMatchObject({ premise: expect.any(String), pronouns: expect.any(String) });
    let n = 0;
    const rand = () => (n++ % 7) / 7;
    expect(offlinePart(d, 'roleClass', 'she/her', rand).hero.roleClass).not.toBe(d.hero.roleClass);
    expect(nameFitsPronouns(offlinePart(d, 'name', 'he/him', rand).hero.name, 'he/him')).toBe(true);
  });
});

describe('story prompt', () => {
  const base = { category: 'fantasy' as const, pronouns: 'she/her', rulesMode: 'narrative' as const, inspiration: insp };

  it('a seed roll puts the seed at the core of the story', () => {
    const p = buildStoryPrompt({ ...base, mode: 'fresh', seed: 'A cursed bell rings at noon' });
    expect(p).toContain('STORY SEED');
    expect(p).toContain('A cursed bell rings at noon');
    expect(p).toContain('Pronouns: she/her');
  });

  it("an adapt roll keeps the player's words and the name", () => {
    const p = buildStoryPrompt({ ...base, mode: 'adapt', fixed: { premise: 'You run a tavern on a dragon.', name: 'Kept Name', title: 'Mine' } });
    expect(p).toContain('THE PLAYER WROTE THIS STORY');
    expect(p).toContain('You run a tavern on a dragon.');
    expect(p).toContain('keep "Kept Name" exactly');
    expect(p).toContain('Keep the title "Mine"');
  });

  it('an opener roll keeps its premise and moves', () => {
    const p = buildStoryPrompt({ ...base, mode: 'opener', fixed: { title: opener.title, premise: opener.premise, actions: opener.actions } });
    expect(p).toContain('HAND-WRITTEN OPENER');
    expect(p).toContain(opener.premise);
  });
});
