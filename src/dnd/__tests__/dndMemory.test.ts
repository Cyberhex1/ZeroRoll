import { describe, expect, it } from 'vitest';
import { buildDndContext, currentStateBlock, dndTurns, experienceMemory, maybeSummarizeExperience, memoryFromTurn } from '../memory';
import { emptyMemory } from '../../memory/memoryStore';
import type { CharacterSheet, Experience, LogMessage } from '../../types';

const hero: CharacterSheet = {
  id: 'c1', name: 'Rook', gender: 'she/her', roleClass: 'Rogue', raceOrigin: 'Elf', level: 3, hp: 0, maxHp: 18, armorClass: 14, initiativeBonus: 3,
  stats: { str: 8, dex: 16, con: 12, int: 10, wis: 13, cha: 14 },
  inventory: [{ id: 'i1', name: 'Dagger', type: 'weapon', quantity: 2, isEquipped: true }, { id: 'i2', name: 'Rope', type: 'misc', quantity: 1 }],
  spells: [], statusEffects: ['Poisoned'], backgroundNotes: ''
};

const log = (i: number, sender: LogMessage['sender'] = i % 2 ? 'dm' : 'player'): LogMessage => ({ id: `l${i}`, sender, text: `entry ${i}`, timestamp: '' });

const exp = (logs: LogMessage[]): Experience =>
  ({ id: 'e1', userId: 'u', title: 't', category: 'fantasy', description: '', model: '', createdAt: '', updatedAt: '', character: hero, gameWorldState: { currentLocation: 'Saltmarsh', timeOfDay: 'Dusk', activeQuest: 'Find the smuggler', dangerLevel: 'Moderate', customNotes: '' }, logs, mapData: {} as never }) as Experience;

describe('D&D CURRENT STATE', () => {
  it('sends HP 0 as 0, with inventory, conditions and location', () => {
    const b = currentStateBlock(hero, { currentLocation: 'Saltmarsh' });
    expect(b).toContain('HP: 0/18');
    expect(b).toContain('down');
    expect(b).toContain('Dagger x2 (equipped), Rope');
    expect(b).toContain('Conditions: Poisoned');
    expect(b).toContain('DEX 16 (+3)');
    expect(b).toContain('Location: Saltmarsh');
    expect(currentStateBlock(undefined)).toBe('');
  });
});

describe('D&D memory', () => {
  it('builds the context from memory, summary and log, skipping system and referee messages', () => {
    const logs = [log(0), log(1), log(2, 'system'), log(3, 'adjudicator'), log(4)];
    expect(dndTurns(logs)).toHaveLength(3);
    const e = { ...exp(logs), memory: { ...emptyMemory(), summary: 'Rook fled the docks.', entries: [{ id: 'm', text: 'Captain Vey wants Rook dead', pinned: true, source: 'manual' as const, createdTurn: 0 }] } };
    const { contents, meter } = buildDndContext(e);
    expect(contents).toMatch(/MEMORY[\s\S]*Captain Vey[\s\S]*STORY SO FAR[\s\S]*Rook fled[\s\S]*Recent Story Log:\nPLAYER: entry 0\nDM: entry 1\nPLAYER: entry 4/);
    expect(contents).not.toContain('CURRENT STATE');
    expect(meter.parts.system).toBeGreaterThan(0);
  });

  it('turns state updates and alerts into memory entries', () => {
    let m = memoryFromTurn(emptyMemory(), 4, { locationUpdate: 'The Drowned Bell', itemsGained: ['Silver Key'] }, { id: 'a', title: 'Chapter 2', type: 'chapter_transition', subtitle: '', description: 'The tide turns.' } as never);
    expect(m.entries.map((e) => e.text)).toEqual(['Visited The Drowned Bell.', 'The hero has Silver Key (found on turn 4).', 'Chapter 2: The tide turns.']);
    expect(m.entries[2].pinned).toBe(true);
    m = memoryFromTurn(m, 6, { itemsLost: ['silver key'] });
    expect(m.entries.some((e) => e.text.includes('Silver Key'))).toBe(false);
  });

  it('summarizes in the background and applies onto the newest campaign', async () => {
    const e = exp(Array.from({ length: 24 }, (_, i) => log(i)));
    const apply = await maybeSummarizeExperience(e, async () => ({ text: '{"summary":"Rook crossed the marsh.","facts":["Vey has a scar"]}' }) as never);
    const latest = { ...e, logs: [...e.logs, log(99)] };
    const done = apply!(latest);
    expect(done.logs).toHaveLength(25);
    expect(experienceMemory(done)).toMatchObject({ summary: 'Rook crossed the marsh.', summarizedThrough: 12 });
    expect(buildDndContext(done).contents).not.toContain('entry 11\n');
  });
});
