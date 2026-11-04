import { describe, it, expect, beforeEach } from 'vitest';

class MemoryStorage {
  private data = new Map<string, string>();
  get length() { return this.data.size; }
  key(i: number) { return [...this.data.keys()][i] ?? null; }
  getItem(k: string) { return this.data.has(k) ? this.data.get(k)! : null; }
  setItem(k: string, v: string) { this.data.set(k, String(v)); }
  removeItem(k: string) { this.data.delete(k); }
  clear() { this.data.clear(); }
}
(globalThis as any).localStorage = new MemoryStorage();

const { CATEGORY_CONTENT, CATEGORY_IDS, CATEGORIES_DATA, drawOpeners, markOpenersSeen, pickInspiration, shuffle } = await import('../../content');
const { validateContent } = await import('../../content/validate');
const { styleCard, turnContextBlock, fullProfileBlock, STYLE_CARD_MAX } = await import('../../content/injection');
const { formatOutlineForPrompt } = await import('../geminiService');

beforeEach(() => localStorage.clear());

describe('content table', () => {
  it('has content for every category id, and nothing else (SL1)', () => {
    expect(Object.keys(CATEGORY_CONTENT).sort()).toEqual([...CATEGORY_IDS].sort());
    expect(CATEGORIES_DATA.map((c) => c.id)).toEqual([...CATEGORY_IDS]);
  });

  it('passes the validator (gaps allowed until the content pass)', () => {
    const { errors } = validateContent(CATEGORY_CONTENT, [...CATEGORY_IDS]);
    expect(errors).toEqual([]);
  });

  it('the validator rejects a duplicated title and an off-profile opener', () => {
    const fantasy = CATEGORY_CONTENT.fantasy;
    const real = CATEGORY_CONTENT.real_life;
    const dupe = { ...real.openers[0], id: 'dupe_test', hero: { ...real.openers[0].hero, name: 'Unique Person' }, premise: `${'A quiet morning turns strange. '.repeat(4)}`, title: fantasy.openers[0].title };
    const offProfile = { ...real.openers[1], id: 'off_test', hero: { ...real.openers[1].hero, name: 'Other Person' }, premise: `A dragon lands on the office roof and the elevator stops between floors while everyone stares. ${'x'.repeat(10)}`, title: 'Unusual Tuesday' };
    const table = { ...CATEGORY_CONTENT, real_life: { ...real, openers: [...real.openers, dupe, offProfile] } };
    const { errors } = validateContent(table, [...CATEGORY_IDS]);
    expect(errors.some((e) => e.includes('dupe_test') && e.includes('title'))).toBe(true);
    expect(errors.some((e) => e.includes('off_test') && e.includes('dragon'))).toBe(true);
  });
});

describe('opener draw', () => {
  it('draws only from the category and never repeats until all are seen', () => {
    const total = CATEGORY_CONTENT.fantasy.openers.length;
    const ids = new Set<string>();
    for (let round = 0; round < Math.ceil(total / 5); round++) {
      const draw = drawOpeners('fantasy', 5);
      for (const d of draw) {
        expect(d.opener.id.startsWith('seed_fan') || d.padded).toBe(true);
        if (!d.padded) ids.add(d.opener.id);
      }
      markOpenersSeen('fantasy', draw.filter((d) => !d.padded).map((d) => d.opener.id));
    }
    expect(ids.size).toBe(total);
  });

  it('pads a short category from its own hooks, labelled', () => {
    // Every category is full now, so shorten one for the test and put it back after.
    const greek = CATEGORY_CONTENT.ancient_greek;
    const full = greek.openers;
    greek.openers = full.slice(0, 1);
    try {
      const draw = drawOpeners('ancient_greek', 5);
      expect(draw).toHaveLength(Math.min(5, greek.openers.length + greek.procedural.hooks.length));
      const padded = draw.filter((d) => d.padded);
      expect(padded.length).toBeGreaterThan(0);
      for (const p of padded) expect(greek.procedural.hooks.map((h) => h.hook)).toContain(p.opener.premise);
    } finally {
      greek.openers = full;
    }
  });

  it('every category has its full set of openers', () => {
    const { errors, gaps } = validateContent(CATEGORY_CONTENT, [...CATEGORY_IDS], { strict: true });
    expect(errors).toEqual([]);
    expect(gaps).toEqual([]);
  });

  it('shuffle keeps every item', () => {
    expect(shuffle([1, 2, 3, 4, 5]).sort()).toEqual([1, 2, 3, 4, 5]);
  });
});

describe('injection policy', () => {
  it('Real Life prompts carry only Real Life media (SL1)', () => {
    const fantasyTitles = CATEGORY_CONTENT.fantasy.media.map((m) => m.title);
    for (let i = 0; i < 20; i++) {
      const ctx = fullProfileBlock('real_life');
      for (const t of fantasyTitles) expect(ctx).not.toContain(t);
    }
  });

  it('the turn style card stays within its budget for every category', () => {
    for (const id of CATEGORY_IDS) expect(styleCard(id).length).toBeLessThanOrEqual(STYLE_CARD_MAX);
  });

  it('turn 1 and turn 20 of a campaign carry the same inspiration block', () => {
    const insp = pickInspiration('horror', 'seed_hor_01');
    expect(turnContextBlock('horror', insp)).toBe(turnContextBlock('horror', insp));
    expect(turnContextBlock('horror', insp)).toContain(insp.media[0]);
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
