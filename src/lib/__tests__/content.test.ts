import { describe, it, expect } from 'vitest';
import { CATEGORY_SEEDLISTS } from '../seedlists';
import { buildGroundedSeedContext } from '../narrativeProfiles';
import { CATEGORIES_DATA } from '../categoriesData';

(globalThis as any).localStorage ??= { getItem: () => null, setItem() {}, removeItem() {}, length: 0, key: () => null };
const { formatOutlineForPrompt } = await import('../geminiService');

describe('seedlist keys (SL1)', () => {
  it('has a seedlist for every category id, and nothing else', () => {
    expect(Object.keys(CATEGORY_SEEDLISTS).sort()).toEqual(CATEGORIES_DATA.map((c) => c.id).sort());
  });

  it('Real Life turns use the Real Life corpus, not fantasy', () => {
    const fantasyTitles = CATEGORY_SEEDLISTS.fantasy.mediaReferences;
    for (let i = 0; i < 20; i++) {
      const ctx = buildGroundedSeedContext('real_life');
      for (const t of fantasyTitles) expect(ctx).not.toContain(t);
    }
  });
});

describe('outline in prompts (SL4)', () => {
  it('never prints "undefined" for a partial outline', () => {
    const out = formatOutlineForPrompt({ backstory: 'Player-supplied campaign premise: a heist.' } as any, 'full');
    expect(out).toBe('- Backstory: Player-supplied campaign premise: a heist.');
    expect(out).not.toContain('undefined');
  });

  it('returns nothing when there is no usable field', () => {
    expect(formatOutlineForPrompt(undefined, 'full')).toBe('');
    expect(formatOutlineForPrompt({ keyNpcs: [], chapters: [] } as any, 'brief')).toBe('');
  });

  it('keeps every field of a full outline', () => {
    const out = formatOutlineForPrompt({
      startingCircumstances: 'A', backstory: 'B', incitingIncident: 'C', immediateGoal: 'D',
      keyNpcs: [{ name: 'Mira', role: 'Fence', motivation: 'Debt', secret: 'Informant' }],
      majorConflicts: ['E'], secretsAndReveals: ['F'], chapters: ['One', 'Two'], potentialEndings: [],
    } as any, 'full');
    expect(out).toContain('Mira (Fence, Motivation: Debt, Secret: Informant)');
    expect(out).toContain('Chapter Progression: One | Two');
    expect(out.split('\n')).toHaveLength(8);
  });
});
