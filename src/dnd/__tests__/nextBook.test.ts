import { describe, expect, it, vi } from 'vitest';

vi.mock('../../lib/geminiService', () => ({
  generateScenarioAI: vi.fn(async () => ({ scenario: { storyBlurb: 'The sea road calls.', storyOutline: { chapters: ['Tide', 'Wreck'], immediateGoal: 'Find the wreck' }, suggestedActions: ['Sail'] }, source: 'ai' })),
  generateChapterOneAI: vi.fn(async () => ({ text: 'Salt wind. Chapter One.', suggestedActions: ['Board the ship'], modelUsed: 'm' }))
}));

const { bookRecap, continueToNextBook, nextBookPrompt } = await import('../nextBook');
const { mergeInventoryAdditive } = await import('../../lib/experienceHelpers');
import type { Experience } from '../../types';

const exp = {
  id: 'e1', title: 'Saltmarsh', category: 'fantasy', book: 1, concluded: { reason: 'story', at: '' },
  character: { name: 'Rook', level: 4, hp: 0, maxHp: 22, raceOrigin: 'Elf', roleClass: 'Rogue', inventory: [{ id: 'i', name: 'Silver Key', type: 'misc', quantity: 1 }], deathSaves: { successes: 1, failures: 1 } },
  gameWorldState: { currentChapter: 3, activeQuest: 'old', customNotes: '' },
  storyOutline: { chapters: ['Docks', 'Marsh', 'Bell'] },
  memory: { entries: [], pending: [], summary: 'Rook rang the drowned bell.', summarizedThrough: 10 },
  logs: [{ id: 'l', sender: 'dm', text: 'The bell falls silent forever.', timestamp: '' }]
} as unknown as Experience;

describe('next book', () => {
  it('builds a recap from the summary, chapters and ending', () => {
    expect(bookRecap(exp)).toMatch(/drowned bell[\s\S]*Docks \| Marsh \| Bell[\s\S]*falls silent/);
    expect(nextBookPrompt(exp)).toMatch(/Start Book 2[\s\S]*Silver Key/);
  });

  it('continues in the same save with HP restored and the old book pinned', async () => {
    const next = await continueToNextBook(exp, 'm');
    expect(next.id).toBe('e1');
    expect(next).toMatchObject({ book: 2, concluded: null, gameWorldState: { currentChapter: 1, activeQuest: 'Find the wreck' } });
    expect(next.character).toMatchObject({ hp: 22, deathSaves: undefined });
    expect(next.memory!.entries[0]).toMatchObject({ pinned: true });
    expect(next.memory!.entries[0].text).toMatch(/^Book 1:/);
    expect(next.logs.slice(-1)[0]).toMatchObject({ sender: 'dm', text: 'Salt wind. Chapter One.', suggestedActions: ['Board the ship'] });
  });
});

describe('starting gear merge (PS7)', () => {
  it('skips default weapons and armour when the hero has their own', () => {
    const hero = [{ id: 'a', name: 'Rapier', type: 'weapon' as const, quantity: 1, isEquipped: true }];
    const defaults = [
      { id: 'b', name: 'Longsword', type: 'weapon' as const, quantity: 1, isEquipped: true },
      { id: 'c', name: 'Leather Armor', type: 'armor' as const, quantity: 1, isEquipped: true },
      { id: 'd', name: 'Torch', type: 'misc' as const, quantity: 1 }
    ];
    expect(mergeInventoryAdditive(hero, defaults).map((i) => i.name)).toEqual(['Rapier', 'Leather Armor', 'Torch']);
  });
});
