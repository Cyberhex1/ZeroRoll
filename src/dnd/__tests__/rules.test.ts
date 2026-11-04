import { describe, expect, it } from 'vitest';
import { abilityForCheck, checkOutcome, deathSave, gainXp, levelForXp, planCheck, proficiencyBonus, roleTemplate, rollPlan } from '../rules';
import { parseGmReply, leadAlert, normaliseAlertType } from '../turnParser';
import { applyDelta, applyInventory, applyWorld, itemCount, nextAlert } from '../applyTurn';
import type { CharacterSheet, Experience } from '../../types';

const hero = (over: Partial<CharacterSheet> = {}): CharacterSheet => ({
  id: 'h', name: 'Rook', roleClass: 'Rogue', raceOrigin: 'Elf', level: 3, hp: 10, maxHp: 18, armorClass: 14, initiativeBonus: 3,
  stats: { str: 8, dex: 16, con: 12, int: 10, wis: 13, cha: 14 }, inventory: [], spells: [], statusEffects: [], backgroundNotes: '', ...over
});

describe('rules', () => {
  it('plans checks per rules mode', () => {
    expect(planCheck(hero(), 'Stealth', undefined, 'narrative')).toMatchObject({ ability: 'dex', modifier: 3, proficient: false, formula: '1d20+3' });
    expect(planCheck(hero(), 'Stealth', undefined, 'full5e')).toMatchObject({ modifier: 5, proficient: true, formula: '1d20+5' });
    expect(planCheck(hero(), 'Athletics', 'str', 'full5e', 'advantage')).toMatchObject({ modifier: -1, proficient: false, formula: '2d20kh1-1' });
    expect(planCheck(hero(), 'Perception', undefined, 'narrative', 'advantage').formula).toBe('1d20+1');
    expect(abilityForCheck('Resist the poison')).toBe('con');
    expect(abilityForCheck('Anything', 'Charisma')).toBe('cha');
  });

  it('rolls advantage as the better d20 and gives one outcome string', () => {
    const seq = [0.95, 0.1];
    const r = rollPlan(planCheck(hero(), 'Stealth', undefined, 'full5e'), 'Stealth', 'advantage', () => seq.shift()!);
    expect(r.rolls).toEqual([20, 3]);
    expect(r.total).toBe(25);
    expect(checkOutcome(14, 15, 20)).toEqual({ success: false, text: 'FAILURE (14 vs DC 15, natural 20)' });
    expect(checkOutcome(15, 15).success).toBe(true);
  });

  it('handles death saves, XP and levels', () => {
    let s = { successes: 0, failures: 0 };
    s = deathSave(s, 12).saves;
    expect(deathSave(s, 1)).toMatchObject({ saves: { failures: 2 }, result: 'continue' });
    expect(deathSave({ successes: 0, failures: 2 }, 5).result).toBe('dead');
    expect(deathSave({ successes: 2, failures: 1 }, 10).result).toBe('stable');
    expect(deathSave({ successes: 0, failures: 2 }, 20).result).toBe('revived');
    expect(levelForXp(899)).toBe(2);
    expect(proficiencyBonus(5)).toBe(3);
    const up = gainXp(hero({ xp: 2600 }), 200);
    expect(up.levelsGained).toBe(1);
    expect(up.character).toMatchObject({ level: 4, xp: 2800, maxHp: 24, hp: 16 });
  });

  it('fits stats, HP and spells to the role', () => {
    const wiz = roleTemplate('Storm Wizard');
    expect(wiz.stats.int).toBe(15);
    expect(wiz.spells).toContain('Magic Missile');
    expect(roleTemplate('Kensei Monk').spells).toEqual([]);
    expect(roleTemplate('Barbarian').maxHp).toBeGreaterThan(wiz.maxHp);
  });
});

describe('game master reply parser', () => {
  it('reads every block, merges deltas and strips a cut-off block', () => {
    const r = parseGmReply(`You win.
---STATE_UPDATE---
HP_DELTA: -3
ITEMS_GAINED: ["Silver Key"]
GOLD_DELTA: +12
---END_STATE_UPDATE---
More text.
---STATE_UPDATE---
HP_DELTA: +1
ITEMS_LOST: Rope
LOCATION: The Drowned Bell
---END_STATE_UPDATE---
---COURSE_TRIGGER---
TITLE: The Gate
TYPE: Chapter Transition
---END_TRIGGER---
---CHECK_REQUIRED---
SKILL: Stealth
STAT: Dexterity
DC: 14
---END_CHECK---
---OPTIONS---
[1] Run
[2] Hide
---AVATAR_EVOLUTION---
EVOLVED: tr`);
    expect(r.text).toBe('You win.\n\nMore text.');
    expect(r.delta).toMatchObject({ hpDelta: -2, goldDelta: 12, itemsGained: ['Silver Key'], itemsLost: ['Rope'], locationUpdate: 'The Drowned Bell' });
    expect(r.alerts[0].type).toBe('chapter_transition');
    expect(r.check).toMatchObject({ skill: 'Stealth', stat: 'dex', dc: 14 });
    expect(r.options).toEqual(['Run', 'Hide']);
  });

  it('does not invent a check from prose and drops an unterminated block', () => {
    const r = parseGmReply('Make a DC 15 Stealth check to sneak by.\n---STATE_UPDATE---\nHP_DELTA: -4');
    expect(r.check).toBeNull();
    expect(r.delta).toBeNull();
    expect(r.text).toBe('Make a DC 15 Stealth check to sneak by.');
  });

  it('normalises trigger types and ranks alerts', () => {
    expect(normaliseAlertType('Story Conclusion')).toBe('story_conclusion');
    expect(normaliseAlertType('the finale')).toBe('story_conclusion');
    expect(normaliseAlertType('weird')).toBe('course_change');
    const a = parseGmReply('x\n---COURSE_TRIGGER---\nTYPE: ambush\n---END_TRIGGER---\n---COURSE_TRIGGER---\nTYPE: story_conclusion\n---END_TRIGGER---');
    expect(leadAlert(a.alerts)?.type).toBe('story_conclusion');
  });
});

describe('applying a turn', () => {
  it('does inventory maths by exact name and quantity (S9)', () => {
    const inv = [
      { id: '1', name: 'Healing Potion', type: 'potion' as const, quantity: 3 },
      { id: '2', name: 'Potion of Fire Breath', type: 'potion' as const, quantity: 1 },
      { id: '3', name: 'Coin Purse', type: 'misc' as const, quantity: 1 }
    ];
    const r = applyInventory(inv, ['Healing Potion x2', '15 gold', 'Lantern'], ['Healing Potions', 'Potion', 'Coin']);
    expect(r.inventory.map((i) => `${i.name}:${i.quantity}`)).toEqual(['Healing Potion:4', 'Potion of Fire Breath:1', 'Coin Purse:1', 'Lantern:1']);
    expect(r.goldDelta).toBe(14);
    expect(itemCount('3 Arrows')).toEqual({ name: 'Arrows', qty: 3 });
  });

  it('downs the hero in Full 5e and applies XP, gold, conditions and spells', () => {
    const r = applyDelta(hero({ hp: 4, statusEffects: ['Poisoned'] }), { hpDelta: -9, goldDelta: 5, conditionsRemoved: ['poisoned'], conditionsAdded: ['Prone'], spellsGained: ['Light'], xpGained: 900 }, 'full5e');
    expect(r.character).toMatchObject({ hp: 0, gold: 5, statusEffects: ['Prone'], spells: ['Light'], deathSaves: { successes: 0, failures: 0 } });
    expect(r.downed).toBe(true);
    const n = applyDelta(hero({ hp: 4 }), { hpDelta: -9, xpGained: 900 }, 'narrative');
    expect(n.character.deathSaves).toBeUndefined();
    expect(n.character.level).toBe(3);
  });

  it('advances the chapter on receipt and keeps a transition on screen', () => {
    const exp = { gameWorldState: { currentChapter: 1 }, storyOutline: { chapters: ['a', 'b', 'c'] } } as unknown as Experience;
    const t = { id: 't', type: 'chapter_transition' } as never;
    expect(applyWorld(exp, { locationUpdate: 'Gate' }, [t]).gameWorldState).toMatchObject({ currentChapter: 2, currentLocation: 'Gate' });
    expect(applyWorld(exp, null, [{ type: 'story_conclusion' } as never]).concluded?.reason).toBe('story');
    expect(nextAlert(t, { id: 'x', type: 'ambush' } as never)).toBe(t);
  });
});
