import { describe, expect, it } from 'vitest';
import type { StatBlock } from '../../types';
import { CATEGORY_IDS, getContent } from '../../content';
import { turnContextBlock } from '../../content/injection';
import { nameFitsPronouns } from '../../content/names';
import { SKILLS, castsSpells } from '../../dnd/rules';
import {
  POINT_BUY_BUDGET, STANDARD_ARRAY, canRaise, fitPointBuy, isLegalPointBuy, lower, pointsLeft, pointsSpent, raise, roleSpread
} from '../pointBuy';
import { SKILL_PICKS, MAX_GEAR, fixName, matchSkill, normalizeGear, normalizeSkills, normalizeSpells, normalizeStoryReply } from '../normalize';
import {
  applyClass, applyHeroPart, applyPackage, applyStoryEdit, choosePronouns, draftFromOpener, editSheet, inspirationWithSeed,
  keepAsIs, offlinePart, resetSheet, sheetForRole, toCharacterSheet, typeHeroField, typedAmong, REPLACES, validateDraft
} from '../draft';
import { buildHeroPartPrompt, buildStoryPrompt } from '../storyRoll';
import { buildCheckPrompt, buildFixPrompt } from '../masterPrompt';
import { STORY_SHAPES, pickShape, shapeById } from '../storyShape';
import { formatOutlineForPrompt } from '../../lib/geminiService';
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

  it('capitalizes a name that starts lower-case, keeping particles', () => {
    expect(fixName('claire Sutcliffe', 'horror', 'she/her')).toBe('Claire Sutcliffe');
    expect(fixName('Alix ap Rhys', 'romantic', 'they/them')).toBe('Alix ap Rhys');
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
    expect(normalizeSpells(['A', 'B', 'C', 'D', 'E'], 'Wizard')).toHaveLength(4);
  });

  it('classes that would not normally cast spells get none', () => {
    expect(normalizeSpells(['Magic Missile'], 'Swashbuckler Rogue')).toEqual([]);
    expect(normalizeSpells(['Detect Evil'], 'Night Shift Nurse')).toEqual([]);
    expect(normalizeSpells([], 'Fighter')).toEqual([]);
    expect(normalizeSpells([], 'Wizard')).toContain('Magic Missile');
    expect(normalizeSpells(['Wind Song'], 'Cloud Shepherd')).toEqual(['Wind Song']);
    expect(castsSpells('Eldritch Bladesinger')).toBe(true);
    expect(castsSpells('Dragon Knight')).toBe(false);
    const rogue = fantasy.openers.find((o) => castsSpells(o.hero.role) === false && o.spells.length);
    if (rogue) expect(draftFromOpener('fantasy', rogue, 'she/her', insp).sheet.spells).toEqual([]);
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
    expect(i.tropes).toEqual(['A lighthouse keeper finds a door', 'x']);
    expect(i.openerId).toBeUndefined();
  });

  it('the campaign hero uses the story gear, falls back to the kit only when there is none, and has no stand-in art', () => {
    const d = applyPackage(null, pkg, { category: 'fantasy', inspiration: insp, source: 'ai' });
    const category = { defaultCharacter: { inventory: [{ id: 'k', name: 'Kit Rope', type: 'misc' as const, quantity: 1, isEquipped: false }] } } as never;
    const hero = toCharacterSheet(d, { pronouns: 'she/her', rulesMode: 'full5e', category });
    expect(hero.inventory.map((g) => g.name)).toEqual(['Rusted Shiv', 'Lockpicks']);
    expect(hero.proficiencies).toEqual(d.sheet.skills);
    expect(toCharacterSheet({ ...d, sheet: { ...d.sheet, spells: ['Shield'] } }, { pronouns: 'she/her', rulesMode: 'full5e', category }).spells).toEqual([]);
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

describe('master prompt (ohnna, 2026-11-26)', () => {
  const base = { category: 'fantasy' as const, pronouns: 'she/her', rulesMode: 'narrative' as const, inspiration: insp };
  const media = ['Treasure Island (Book)', 'The Goonies (Film)'];

  it('a story roll sends only the genre, seed-list examples and the fields to fill', () => {
    const p = buildStoryPrompt({ ...base, category: 'adventure', mode: 'fresh', media });
    expect(p).toContain('Today your player chose to play an Adventure story.');
    expect(p).toContain('Examples of this kind of story in books, film, TV and games: Treasure Island (Book); The Goonies (Film).');
    expect(p).toContain('Do NOT recreate these stories');
    expect(p).toContain('unique and creative');
    for (const field of ['title:', 'premise ("The story")', 'outline.startingCircumstances ("Where you start")', 'outline.immediateGoal ("Your first goal")', 'hero.name', 'hero.roleClass', 'hero.origin', 'hero.appearance', 'openingActions', 'outline.keyNpcs', 'outline.chapters', 'outline.turningPoint']) {
      expect(p).toContain(field);
    }
    expect(p).toContain('The hero uses she/her pronouns.');
    expect(p).toContain('Avoid the names and places AI models reach for');
    // No card machinery left.
    expect(p).not.toMatch(/Story family|Storytelling DNA|plot engine|OPTIONAL CARDS|pitch/i);
  });

  it('a seed roll builds from the seed', () => {
    const p = buildStoryPrompt({ ...base, mode: 'fresh', seed: 'A cursed bell rings at noon', media });
    expect(p).toContain('THE PLAYER PICKED THIS STORY IDEA');
    expect(p).toContain('A cursed bell rings at noon');
    expect(p).toContain('HERO FIT');
  });

  it("an adapt roll keeps the player's words, title and name", () => {
    const p = buildStoryPrompt({ ...base, mode: 'adapt', media, fixed: { premise: 'You run a tavern on a dragon.', name: 'Kept Name', title: 'Mine' } });
    expect(p).toContain('THE PLAYER WROTE THEIR OWN STORY');
    expect(p).toContain('ALREADY FILLED IN');
    expect(p).toContain('You run a tavern on a dragon.');
    expect(p).toContain('- hero.name: "Kept Name"');
    expect(p).toContain('- title: "Mine"');
  });

  it('an opener roll keeps its premise and moves', () => {
    const p = buildStoryPrompt({ ...base, mode: 'opener', media, fixed: { title: opener.title, premise: opener.premise, actions: opener.actions } });
    expect(p).toContain('HAND-WRITTEN OPENER');
    expect(p).toContain(opener.premise);
  });

  it('every category has its own genre line and examples from its seed list', () => {
    for (const id of CATEGORY_IDS) {
      const p = buildStoryPrompt({ ...base, category: id, mode: 'fresh' });
      expect(p).toContain(`${getContent(id).card.name} story.`);
      const titles = getContent(id).media.map((m) => m.title);
      expect(titles.some((t) => p.includes(t))).toBe(true);
    }
  });

  it('a field reroll asks for that field only, keeping to the story', () => {
    const ctx = { category: 'fantasy' as const, pronouns: 'he/him', rulesMode: 'narrative' as const, title: 'The Salt Crown', premise: 'You wake in the brine pits.', hero: { name: 'Odo Brine', roleClass: 'Salt Miner', origin: 'Pit-born human', appearance: '' }, media };
    const p = buildHeroPartPrompt('name', ctx);
    expect(p).toContain('Change ONLY the hero\'s name');
    expect(p).toContain('THE STORY AS IT STANDS');
    expect(p).toContain('You wake in the brine pits.');
    expect(p).toContain('the pronouns he/him');
    expect(buildHeroPartPrompt('roleClass', ctx)).toContain('HERO SHEET');
  });

  it('the story check reads the prompt and the reply, and the fix carries the problems', () => {
    const c = buildCheckPrompt('THE PROMPT TEXT', { title: 'T' });
    expect(c).toContain('=== PROMPT ===\nTHE PROMPT TEXT');
    expect(c).toContain('"title": "T"');
    expect(c).toMatch(/Did the writer follow the prompt\?/);
    expect(c).toMatch(/Is it logical\?/);
    const f = buildFixPrompt('THE PROMPT TEXT', { title: 'T' }, ['premise: the hero is in two places']);
    expect(f).toContain('- premise: the hero is in two places');
    expect(f.startsWith('THE PROMPT TEXT')).toBe(true);
  });
});

describe('where the player joins the story', () => {
  const base = { category: 'fantasy' as const, pronouns: 'she/her', rulesMode: 'narrative' as const, inspiration: insp };

  it('picks every shape over many rolls, and a reroll never repeats the last one', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 200; i++) seen.add(pickShape(undefined, () => i / 200).id);
    expect(seen.size).toBe(STORY_SHAPES.length);
    for (const s of STORY_SHAPES) for (let i = 0; i < 20; i++) expect(pickShape(s.id, () => i / 20).id).not.toBe(s.id);
  });

  it('a story roll is told to start before the turning point', () => {
    const p = buildStoryPrompt({ ...base, mode: 'fresh', media: ['X (Film)'] });
    expect(p).toContain('The player starts BEFORE the turning point');
    for (const s of STORY_SHAPES) expect(p).toContain(`"${s.id}"`);
  });

  it("the roll's shape wins over the reply's, and the turning point is kept", () => {
    const pkg = normalizeStoryReply(reply({ outline: { storyShape: 'hidden_return', turningPoint: 'Chapter 2: the fire.' } }), { category: 'fantasy', pronouns: 'she/her', shape: 'before' });
    expect(pkg.outline).toMatchObject({ storyShape: 'before', turningPoint: 'Chapter 2: the fire.' });
    const adapted = normalizeStoryReply(reply({ outline: { storyShape: 'brewing' } }), { category: 'fantasy', pronouns: 'she/her' });
    expect(adapted.outline.storyShape).toBe('brewing');
    const junk = normalizeStoryReply(reply({ outline: { storyShape: 'climax' } }), { category: 'fantasy', pronouns: 'she/her' });
    expect(junk.outline.storyShape).toBeUndefined();
  });

  it('the game master sees the shape and turning point on every turn', () => {
    const out = formatOutlineForPrompt({ storyShape: 'long_road', turningPoint: 'Chapter 4: you learn it was your sister.' } as never, 'brief');
    expect(out).toContain(shapeById('long_road')!.pacing);
    expect(out).toContain('Turning Point: Chapter 4: you learn it was your sister.');
  });
});

describe('hand-written openers', () => {
  const base = { category: 'revenge' as const, pronouns: 'she/her', rulesMode: 'narrative' as const, inspiration: insp };
  const all = (['fantasy', 'romantic', 'revenge', 'zombie', 'tiktok_drama'] as const).flatMap((c) => getContent(c).openers);

  it('the rewritten openers start before the turning point, and say what it is', () => {
    const shaped = all.filter((o) => o.shape);
    expect(shaped.length).toBeGreaterThanOrEqual(21);
    for (const o of shaped) {
      expect(shapeById(o.shape)).toBeDefined();
      expect(o.turningPoint).toMatch(/^(Chapter \d|Final chapter)/);
    }
    expect(getContent('revenge').openers.every((o) => o.shape)).toBe(true);
  });

  it('an opener puts its shape and turning point in the outline, and its build-out is told them', () => {
    const o = getContent('revenge').openers.find((x) => x.id === 'seed_rev_02')!;
    expect(draftFromOpener('revenge', o, 'she/her', insp).outline).toMatchObject({ storyShape: 'before', turningPoint: o.turningPoint });
    const p = buildStoryPrompt({ ...base, mode: 'opener', shape: shapeById(o.shape), turningPoint: o.turningPoint, fixed: { title: o.title, premise: o.premise, actions: o.actions } });
    expect(p).toContain('joins the story at "before"');
    expect(p).toContain(o.turningPoint!);
    expect(p).not.toContain('EXAMPLE OPENERS');
  });

  it('0.2: fresh rolls are not shown hand-written openers as examples (they anchored every roll)', () => {
    const p = buildStoryPrompt({ ...base, mode: 'fresh', shape: shapeById('brewing') });
    expect(p).not.toContain('EXAMPLE OPENERS');
    for (const o of getContent('revenge').openers) expect(p).not.toContain(o.premise);
  });
});

describe('story patterns (ohnna, 2026-11-21)', () => {
  const base = { category: 'revenge' as const, pronouns: 'she/her', rulesMode: 'narrative' as const, inspiration: { media: ['A'], tropes: ['B'] } };

  it('a sequel keeps the hero', () => {
    const p = buildStoryPrompt({ ...base, mode: 'sequel', continuation: 'Start Book 2 of this campaign.', fixed: { name: 'Odile Marchetti', roleClass: 'Harbor Pilot', origin: 'Harbor-born human' } });
    expect(p).toMatch(/NEXT BOOK[\s\S]*Start Book 2/);
    expect(p).toContain('- hero.name: "Odile Marchetti"');
    expect(p).toContain('- hero.roleClass: "Harbor Pilot"');
  });

  it('game-master turns get no story seeds', () => {
    const t = turnContextBlock('revenge', { media: ['John Wick (Film)'], tropes: ['You stand over the first betrayer'] });
    expect(t).toContain('John Wick');
    expect(t).not.toContain('first betrayer');
  });

  it('no category seed starts with the payoff or with narrator irony', () => {
    for (const id of CATEGORY_IDS) {
      for (const t of getContent(id).tropes) expect(t.premise).not.toMatch(/\b(unaware|oblivious|little do|too late)\b|first betrayer|on your list/i);
    }
  });
});
