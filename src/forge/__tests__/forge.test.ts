import { beforeEach, describe, expect, it, vi } from 'vitest';

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

const calls: Array<{ feature?: string; userPrompt: string }> = [];
let replies: Array<unknown | Error> = [];
/** The continuity read is counted apart, so the older call-count tests keep their meaning. */
const checks: Array<{ userPrompt: string }> = [];
let checkReplies: Array<unknown | Error> = [];
let local: number | undefined;
vi.mock('../../lib/geminiService', () => ({
  executeJsonPrompt: vi.fn(async (opts: { feature?: string; userPrompt: string }, isValid: (v: unknown) => boolean) => {
    if (opts.feature === 'Story check') {
      checks.push(opts);
      const c = checkReplies.shift() ?? { problems: [] };
      if (c instanceof Error) throw c;
      return c;
    }
    calls.push(opts);
    const r = replies.shift();
    if (r instanceof Error) throw r;
    if (!isValid(r)) throw new Error('invalid');
    return r;
  }),
  activeLocalContext: () => local
}));

const { forgeStory, fullTurningPoint } = await import('../forge');
const { drawSpread } = await import('../spread');
const { remember, recent, clearRecent } = await import('../recent');
const { pickPitch } = await import('../pitch');
const { gatePremise, STOCK, IRONY } = await import('../gate');
const { fixNpcNames } = await import('../names');
const { STORY_DECKS } = await import('../../content/forge/decks');
const { normalizeOutline, normalizeGear } = await import('../../setup/normalize');
const { CATEGORY_IDS, CATEGORY_CONTENT } = await import('../../content');
const { validateDecks } = await import('../../content/forge/validateDecks');
const { FAMILY_TRADITIONS, NAME_TRADITIONS } = await import('../../content/forge/names');
const { isFreshName, nameFitsPronouns } = await import('../../content/names');

const seq = (...xs: number[]) => { let i = 0; return () => xs[i++ % xs.length]; };

const GOOD_PREMISE =
  'The bell-ringer\'s boy hands you a wet letter at the ferry steps: your sister is alive, and she is asking for the silver comb you buried with her. The river is high and the ferryman wants double. Across the water, a lantern you have never seen burns in the window of her old room. Do you pay the ferryman, or swim for it?';

const pitchReply = {
  pitches: [
    { title: 'Ink and Tally', hero: 'A tired harbor scribe.', hook: 'How long can you keep your head down while the guild turns?', turningPoint: 'The guild frames you.', surprise: 'none' },
    { title: 'The Comb Below', hero: 'A ferry-woman who wants her sister back.', hook: 'A wet letter says the drowned sister is alive and wants her comb.', turningPoint: 'Chapter 3: the sister is the river spirit that drowned the village.', surprise: 'The river keeps promises.' },
    { title: 'Salt Debt', hero: 'A salt-cutter.', hook: 'A buyer pays in coins from a wreck.', turningPoint: 'The buyer is dead.', surprise: 'Coins sing.' },
    { title: 'Tower of Bells', hero: 'A bell-founder.', hook: 'A bell rings on its own.', turningPoint: 'The bell holds a god.', surprise: 'It is lonely.' }
  ]
};

function buildReply(premise = GOOD_PREMISE, over: Record<string, unknown> = {}) {
  return {
    title: 'The Comb Below',
    premise,
    outline: {
      startingCircumstances: 'You run the ferry at the bell-ringer\'s steps.',
      incitingIncident: 'A wet letter says your drowned sister is alive.',
      immediateGoal: 'Cross the river.',
      keyNpcs: [
        { name: 'Elara Vance', role: 'Ferryman\'s wife', motivation: 'Money', secret: 'She wrote the letter', move: 'Elara Vance raises the fare again' },
        { name: 'Odo Brask', role: 'Ferryman', motivation: 'Quiet', secret: 'Owes the river', move: 'Leaves without you' }
      ],
      fronts: [{ name: 'The Flood', agenda: 'Drown the low town', portents: ['Water on the steps', 'The bridge creaks', 'The low town floods'] }],
      setPieces: ['A wedding on a sinking barge.'],
      chapters: ['One', 'Two', 'Three', 'Four'],
      storyShape: 'before',
      turningPoint: 'Chapter 3: Elara Vance reveals the sister is the river spirit.'
    },
    openingActions: ['Ask Elara Vance about the letter', 'Pay the fare', 'Look at the lantern'],
    hero: { name: 'Ingrid Mosfell', roleClass: 'Ferry-woman', origin: 'River-born human', appearance: 'Broad shoulders, tar on her hands.' },
    sheet: { abilityScores: { str: 14, dex: 12, con: 14, int: 10, wis: 12, cha: 10 }, skills: ['athletics'], gear: [{ name: 'Pole', type: 'misc' }], spells: [] },
    ...over
  };
}

beforeEach(() => {
  calls.length = 0;
  checks.length = 0;
  checkReplies = [];
  replies = [];
  local = undefined;
  clearRecent();
});

describe('content: story decks and the name bank', () => {
  it('every category has a deck that validates, and every name is fresh and fits its list', () => {
    const r = validateDecks(STORY_DECKS, CATEGORY_CONTENT, CATEGORY_IDS, { traditions: NAME_TRADITIONS, familyMap: FAMILY_TRADITIONS });
    expect(r.errors).toEqual([]);
    for (const t of Object.values(NAME_TRADITIONS)) {
      for (const n of [...t.feminine, ...t.masculine, ...t.neutral, ...t.family]) expect(isFreshName(n)).toBe(true);
      for (const n of t.feminine) expect(nameFitsPronouns(n, 'she/her')).toBe(true);
    }
  });
});

describe('spread', () => {
  it('is deterministic with a seeded rand and fills every part', () => {
    const a = drawSpread('mythology', { rand: seq(0.1, 0.5, 0.9) });
    const b = drawSpread('mythology', { rand: seq(0.1, 0.5, 0.9) });
    expect(a).toEqual(b);
    expect(a.family.sources).toContain(a.primary.id);
    expect(a.spice?.id).not.toBe(a.primary.id);
    expect(a.setPieces).toHaveLength(3);
    expect(new Set(a.setPieces).size).toBe(3);
  });

  it('avoids the last family, recent hooks and places', () => {
    const first = drawSpread('horror', { rand: () => 0 });
    remember('horror', 'family', first.family.id);
    remember('horror', 'hook', first.hook);
    remember('horror', 'place', first.place);
    const next = drawSpread('horror', { rand: () => 0 });
    expect(next.family.id).not.toBe(first.family.id);
    expect(next.hook).not.toBe(first.hook);
    expect(next.place).not.toBe(first.place);
  });

  it('Revenge never joins after the betrayal (no hidden_return)', () => {
    for (let i = 0; i < 60; i++) {
      clearRecent();
      expect(drawSpread('revenge', { rand: () => (i % 20) / 20 }).shape.id).not.toBe('hidden_return');
    }
  });

  it('local models get no second influence and two set-pieces', () => {
    const s = drawSpread('fantasy', { local: true, rand: () => 0.3 });
    expect(s.spice).toBeUndefined();
    expect(s.setPieces).toHaveLength(2);
  });

  it('opening and closing cards rotate (never one of the last two)', () => {
    const s1 = drawSpread('zombie', { rand: () => 0 });
    remember('*', 'opening', s1.opening);
    remember('*', 'closing', s1.closing);
    const s2 = drawSpread('fantasy', { rand: () => 0 });
    remember('*', 'opening', s2.opening);
    remember('*', 'closing', s2.closing);
    const s3 = drawSpread('romantic', { rand: () => 0 });
    expect([s1.opening, s2.opening]).not.toContain(s3.opening);
    expect([s1.closing, s2.closing]).not.toContain(s3.closing);
  });

  it('a picked seed takes the place of the hook', () => {
    const s = drawSpread('fantasy', { seed: 'A cursed bell rings at noon', rand: () => 0.4 });
    expect(s).toMatchObject({ hook: 'A cursed bell rings at noon', hookIsSeed: true });
  });

  it('offers names on hand from the family traditions that fit the pronouns', () => {
    const s = drawSpread('mythology', { rand: () => 0, pronouns: 'she/her' });
    expect(s.names.given.length).toBeGreaterThan(0);
    for (const n of s.names.given) expect(nameFitsPronouns(n, 'she/her')).toBe(true);
  });
});

describe('pick a pitch', () => {
  const ctx = { category: 'fantasy' as const, recentPremises: [] as string[] };
  it('penalizes stock hooks, off-genre words and hooks like recent rolls', () => {
    const { chosen } = pickPitch(pitchReply.pitches, ctx, () => 0);
    expect(chosen.title).toBe('The Comb Below');
    const recentCtx = { category: 'fantasy' as const, recentPremises: ['A wet letter says the drowned sister is alive and wants her comb back.'] };
    expect(pickPitch(pitchReply.pitches, recentCtx, () => 0).chosen.title).not.toBe('The Comb Below');
    const cozy = pickPitch([{ ...pitchReply.pitches[1], hook: 'A corpse with a severed head floats by in blood.' }, pitchReply.pitches[2]], { category: 'cozy_ghibli', recentPremises: [] }, () => 0);
    expect(cozy.chosen.title).toBe('Salt Debt');
  });
  it('returns the other pitches as alternates', () => {
    const { others } = pickPitch(pitchReply.pitches, ctx, () => 0);
    expect(others).toHaveLength(3);
  });
});

describe('gate', () => {
  const ctx = { avoidKeywords: [] as string[], recentPremises: [] as string[] };
  it('catches every stock and irony pattern from the baseline', () => {
    const stock = [
      'How long can you keep your head down?', 'What would you do if they turned on you?', 'You spend your days carving runes.',
      'You tend the glowing embers of the forge.', 'Yet lately, the mead has soured.', 'Your father relies on your steady hands.'
    ];
    for (const s of stock) expect(STOCK.some((re) => re.test(s))).toBe(true);
    const irony = ['You smile, unaware that the ink is dry.', 'Little do you know the guild has plans.', 'Soon you will learn the truth.'];
    for (const s of irony) expect(IRONY.some((re) => re.test(s))).toBe(true);
  });

  it('passes a good premise, and flags shape, tics and off-genre words', () => {
    expect(gatePremise(GOOD_PREMISE, ctx)).toEqual([]);
    expect(gatePremise('You row. The river is high.', ctx).map((f) => f.kind)).toContain('shape');
    const thin = GOOD_PREMISE.replace(/[^.!]*\?$/, ' Do you keep your promise?');
    expect(gatePremise(thin, ctx).find((f) => f.kind === 'shape')?.detail).toContain('too thin');
    expect(gatePremise(`${GOOD_PREMISE.slice(0, -1)} with a palpable, rhythmic dread?`, ctx).map((f) => f.kind)).toContain('tics');
    expect(gatePremise(GOOD_PREMISE.replace('lantern', 'demon'), { ...ctx, avoidKeywords: ['demon'] }).map((f) => f.kind)).toContain('off_genre');
  });

  it('flags a premise that gives away the turning point, but not one that only shares the hook', () => {
    const spoil = gatePremise(
      'You row the ferry for the bell-ringer. Your sister drowned last spring. Tonight a lantern burns in her room, and you cannot know that the sister is the river spirit that drowned the village and cursed the ferry. Do you cross?',
      { ...ctx, turningPoint: 'Chapter 3: the sister is the river spirit that drowned the village and cursed the ferry.', incitingIncident: 'A lantern burns in the sister\'s room.' }
    );
    expect(spoil.map((f) => f.kind)).toContain('spoiler');
    expect(gatePremise(GOOD_PREMISE, { ...ctx, turningPoint: 'Chapter 3: the river spirit drowns the village.', incitingIncident: 'A wet letter.' }).map((f) => f.kind)).not.toContain('spoiler');
  });

  it('flags a premise that opens like a recent one', () => {
    expect(gatePremise(GOOD_PREMISE, { ...ctx, recentPremises: ["The bell-ringer's boy runs past you."] }).map((f) => f.kind)).toContain('samey');
  });
});

describe('names in code', () => {
  it('replaces an overused NPC name everywhere, consistently', () => {
    const r = buildReply();
    const pkg = { title: r.title, premise: 'Elara Vance waits at the steps. Elara smiles.', outline: normalizeOutline(r.outline, r.premise), actions: r.openingActions, heroName: 'Ingrid Mosfell' };
    const out = fixNpcNames(pkg, ['norse'], () => 0.2);
    const [, to] = out.renamed[0];
    expect(isFreshName(to)).toBe(true);
    expect(out.premise).not.toMatch(/Elara|Vance/);
    expect(out.premise).toContain(to);
    expect(JSON.stringify(out.outline)).not.toMatch(/Elara|Vance/);
    expect(out.actions[0]).toContain(to.split(' ')[0]);
  });
});

describe('outline normalization (0.2 fields)', () => {
  it('trims and caps fronts, portents, set-pieces and NPC moves; old outlines unchanged', () => {
    const o = normalizeOutline({
      keyNpcs: [{ name: 'A', role: 'r', motivation: 'm', move: ' next ' }],
      fronts: [
        { name: 'F1', agenda: 'a', portents: ['1', '2', '3', '4', '5'] },
        { name: 'F2', agenda: 'a', portents: ['1'] },
        { name: 'F3', agenda: 'a', portents: ['1', '2'] },
        { name: 'F4', agenda: 'a', portents: ['1', '2'] }
      ],
      setPieces: ['a', 'b', ' ', 'c', 'd', 'e', 'f', 'g']
    }, 'P');
    expect(o.keyNpcs[0].move).toBe('next');
    expect(o.fronts).toHaveLength(2);
    expect(o.fronts![0].portents).toHaveLength(4);
    expect(o.fronts!.map((f) => f.name)).toEqual(['F1', 'F3']);
    expect(o.setPieces).toHaveLength(6);
    const old = normalizeOutline({ chapters: ['One'] }, 'P');
    expect(old.fronts).toBeUndefined();
    expect(old.setPieces).toBeUndefined();
  });

  it('numbers chapters once, in order', () => {
    const o = normalizeOutline({ chapters: ['Chapter 1: The Toast', 'Chapter Two - Flight', 'Chapter 4: Chapter 4: Marissa poisons the water.', 'The End'] }, 'P');
    expect(o.chapters).toEqual(['Chapter 1: The Toast', 'Chapter 2: Flight', 'Chapter 3: Marissa poisons the water.', 'Chapter 4: The End']);
  });
});

describe('forgeStory', () => {
  const base = { category: 'mythology' as const, pronouns: 'she/her', mode: 'fresh' as const, rand: () => 0.3 };

  it('pitch, then build; a clean premise needs no repair (2 calls)', async () => {
    replies = [pitchReply, buildReply()];
    const pkg = await forgeStory(base);
    expect(calls.map((c) => c.feature)).toEqual(['Story pitch', 'Story roll']);
    expect(calls[1].userPrompt).toContain('THE PITCH YOU ARE BUILDING');
    expect(pkg.forge).toMatchObject({ v: 1, family: pkg.spread.family.id, pitchTitle: 'The Comb Below' });
    expect(pkg.alternates).toHaveLength(3);
    expect(pkg.stats.repaired).toBe(false);
    // The stock NPC name is gone everywhere.
    expect(JSON.stringify(pkg)).not.toMatch(/Elara|Vance/);
    expect(recent('mythology', 'family')).toEqual([pkg.spread.family.id]);
  });

  it('a failed gate gets one repair (3 calls), and the better premise is kept', async () => {
    replies = [pitchReply, buildReply('You spend your days at the ferry. How long can you keep your head down?'), { premise: GOOD_PREMISE }];
    const pkg = await forgeStory(base);
    expect(calls.map((c) => c.feature)).toEqual(['Story pitch', 'Story roll', 'Story polish']);
    expect(calls[2].userPrompt).toContain('stock line');
    expect(pkg.premise).toBe(GOOD_PREMISE);
    expect(pkg.forge.gate).toEqual({ before: expect.arrayContaining(['stock', 'shape']), after: [] });
  });

  it('a worse repair is thrown away', async () => {
    const bad = `You spend your days at the ferry steps, watching the river, and your sister has been gone a year now, and the town has moved on, and the ferryman's wife keeps asking about the comb. ${'Rain falls. '.repeat(1)}How long can you keep your head down?`;
    replies = [pitchReply, buildReply(bad), { premise: 'You spend your days. Lately it is worse, unaware that the end is near. How long can you wait? You hum.' }];
    const pkg = await forgeStory(base);
    expect(pkg.premise).toBe(bad);
    expect(pkg.stats.repaired).toBe(false);
  });

  it('a failed pitch call still produces a story (built from the spread)', async () => {
    // executeJsonPrompt is mocked as one call per reply; the pitch fails once.
    replies = [new Error('503 overloaded'), buildReply()];
    const pkg = await forgeStory(base);
    expect(pkg.stats.pitchSkipped).toMatch(/503/);
    expect(calls.map((c) => c.feature)).toEqual(['Story pitch', 'Story roll']);
    expect(calls[1].userPrompt).not.toContain('THE PITCH YOU ARE BUILDING');
    expect(pkg.alternates).toEqual([]);
  });

  it('local models skip the pitch (1 call before the gate)', async () => {
    local = 8192;
    replies = [buildReply()];
    await forgeStory(base);
    expect(calls.map((c) => c.feature)).toEqual(['Story roll']);
    expect(calls[0].userPrompt).not.toContain('A second influence');
  });

  it("never repairs the player's own premise", async () => {
    replies = [buildReply('You spend your days. How long can you keep your head down?')];
    const pkg = await forgeStory({ ...base, mode: 'adapt', fixed: { premise: 'You spend your days. How long can you keep your head down?' } });
    expect(calls.map((c) => c.feature)).toEqual(['Story roll']);
    expect(pkg.premise).toBe('You spend your days. How long can you keep your head down?');
    expect(calls[0].userPrompt).toContain('THE PLAYER WROTE THIS STORY');
    expect(calls[0].userPrompt).toContain('INGREDIENTS FOR THE OUTLINE');
  });

  it('a sequel keeps the family and primary influence of the book before', async () => {
    replies = [buildReply()];
    const first = drawSpread('mythology', { rand: () => 0.7 });
    const pkg = await forgeStory({ ...base, mode: 'sequel', continuation: 'Start Book 2.', previous: { v: 1, family: first.family.id, familyName: first.family.name, dna: [first.primary.id], dnaTitles: [first.primary.title], engine: first.engineId } });
    expect(calls.map((c) => c.feature)).toEqual(['Story roll']);
    expect(pkg.spread.family.id).toBe(first.family.id);
    expect(pkg.spread.primary.id).toBe(first.primary.id);
    expect(calls[0].userPrompt).not.toContain("The hook (use it");
  });

  it('a bare chapter-title turning point takes the pitch event', () => {
    expect(fullTurningPoint('Chapter 2: The Salt-Prison Horizon', 'The chancellor accuses you of poisoning the prince.')).toBe('Chapter 2: The chancellor accuses you of poisoning the prince.');
    expect(fullTurningPoint('Chapter 2: your brother signs the estate over to the Varrows', 'x')).toBe('Chapter 2: your brother signs the estate over to the Varrows');
  });
});

describe('titles', () => {
  const base = { category: 'mythology' as const, pronouns: 'she/her', mode: 'fresh' as const, rand: () => 0.3 };
  it('a title with a worn word takes the clean pitch title, with no extra call', async () => {
    replies = [pitchReply, buildReply(GOOD_PREMISE, { title: 'The Ledger of the River' })];
    const pkg = await forgeStory(base);
    expect(pkg.title).toBe('The Comb Below');
    expect(calls).toHaveLength(2);
  });
  it('otherwise the repair call writes a new title', async () => {
    replies = [new Error('down'), buildReply(GOOD_PREMISE, { title: 'Ink and Echoes' }), { title: 'The Comb Below the Ferry' }];
    const pkg = await forgeStory(base);
    expect(calls.map((c) => c.feature)).toEqual(['Story pitch', 'Story roll', 'Story polish']);
    expect(calls[2].userPrompt).toContain('Give this story a new title');
    expect(pkg.title).toBe('The Comb Below the Ferry');
    expect(pkg.premise).toBe(GOOD_PREMISE);
  });
});

describe('Phase A bug test fixes', () => {
  beforeEach(() => clearRecent());

  it('M1: offers a hero card per family, never the same twice in a row, varied over 6 draws', async () => {
    const { rememberSpread } = await import('../spread');
    const seen: string[] = [];
    let x = 0.37;
    const rand = () => (x = (x * 9301 + 49297) % 233280 / 233280);
    for (let i = 0; i < 6; i++) {
      const s = drawSpread('horror', { keepFamily: 'rules', rand });
      expect(s.heroCard).toBeTruthy();
      if (seen.length) expect(s.heroCard).not.toBe(seen.at(-1));
      seen.push(s.heroCard!);
      rememberSpread(s);
    }
    expect(new Set(seen).size).toBeGreaterThanOrEqual(5);
  });

  it('M1: only fresh rolls offer the hero, and the prompt never lists the worn roles', async () => {
    const { buildPrompt, pitchPrompt } = await import('../prompts');
    const s = drawSpread('fantasy', { rand: () => 0.3 });
    const text = pitchPrompt(s) + buildPrompt({ mode: 'fresh', spread: s, pronouns: 'she/her' });
    expect(text).toContain(`A hero idea: ${s.heroCard}.`);
    for (const w of ['archivist', 'copyist', 'cupbearer', 'scrivener']) expect(text.toLowerCase()).not.toContain(w);
    expect(buildPrompt({ mode: 'sequel', spread: s, pronouns: 'she/her', continuation: 'Book 2' })).not.toContain("A hero idea");
  });

  it('M1: worn roles and ledger/ink pitches score lower, unless the card offered that role', async () => {
    const { scorePitch } = await import('../pitch');
    const ctx = { category: 'fantasy' as const, recentPremises: [] };
    const plain = { title: 'Salt Bells', hero: 'A ferry-woman.', hook: 'A bell rings.', turningPoint: 'x', surprise: 'y' };
    const worn = { ...plain, hero: 'A royal archivist.' };
    const r = () => 0;
    expect(scorePitch(worn, 0, ctx, r)).toBeCloseTo(scorePitch(plain, 0, ctx, r) - 0.8);
    expect(scorePitch(worn, 0, { ...ctx, heroCard: 'archivist of the dead' }, r)).toBeCloseTo(scorePitch(plain, 0, ctx, r));
    expect(scorePitch({ ...plain, title: 'The Ink Debt' }, 0, ctx, r)).toBeCloseTo(scorePitch(plain, 0, ctx, r) - 0.5);
  });

  it('M2: a celtic Mythology spread never draws a card tagged only for Egypt', async () => {
    const { CARD_FAMILIES } = await import('../../content/forge/familyTags');
    const egyptOnly = new Set(
      Object.values(CARD_FAMILIES.mythology ?? {}).flatMap((cards) => Object.entries(cards ?? {}).filter(([, t]) => t.length === 1 && t[0] === 'egypt').map(([c]) => c))
    );
    expect(egyptOnly.size).toBeGreaterThan(0);
    let x = 0.123;
    const rand = () => (x = (x * 9301 + 49297) % 233280 / 233280);
    for (let i = 0; i < 200; i++) {
      const s = drawSpread('mythology', { keepFamily: 'celtic', rand });
      for (const c of [s.hook, s.place, ...s.setPieces]) expect(egyptOnly.has(c)).toBe(false);
      if (s.spice) expect(s.family.sources).toContain(s.spice.id);
    }
  });

  it('M3 and S2: the coma opening is stock; "ledger" or "trembling" fail on their own', () => {
    const ctx = { avoidKeywords: [], recentPremises: [] };
    expect(STOCK.some((re) => re.test('You wake from a long coma in an empty ward.'))).toBe(true);
    expect(gatePremise(GOOD_PREMISE.replace('wet letter', 'wet ledger'), ctx).map((f) => f.kind)).toContain('tics');
    expect(gatePremise(GOOD_PREMISE.replace('The river is high', 'The trembling river is high'), ctx).map((f) => f.kind)).toContain('tics');
  });

  it('S1: the hero named outside dialogue, or no "you", fails the pov check', () => {
    const ctx = { avoidKeywords: [], recentPremises: [], heroName: 'Clotilde Varn' };
    expect(gatePremise(GOOD_PREMISE, ctx)).toEqual([]);
    expect(gatePremise(`Clotilde bends over the desk. ${GOOD_PREMISE}`, ctx).map((f) => f.kind)).toContain('pov');
    expect(gatePremise(`"Clotilde, wake up," the bell-ringer says. ${GOOD_PREMISE}`, ctx).map((f) => f.kind)).not.toContain('pov');
    const third = 'The bell-ringer\'s boy hands her a wet letter at the ferry steps: her sister is alive, and she is asking for the silver comb buried with her. The river is high and the ferryman wants double. Across the water, a lantern burns in the window of her old room. Does she pay the ferryman, or swim for the far bank tonight?';
    expect(gatePremise(third, ctx).map((f) => f.kind)).toContain('pov');
  });

  it('N1: a single harp is one harp; plural and used-up gear keep their count', () => {
    const g = normalizeGear([{ name: 'Brass-strung harp', quantity: 10 }, { name: 'Throwing knives', quantity: 6 }, { name: 'Torch', quantity: 3 }, { name: 'Healing potion', type: 'potion', quantity: 2 }]);
    expect(g.map((i) => i.quantity)).toEqual([1, 6, 3, 2]);
  });
});

describe('class names', () => {
  it('drops a leading "Disgraced" from the class', async () => {
    const { normalizeStoryReply } = await import('../../setup/normalize');
    const r = normalizeStoryReply({ title: 'T', premise: 'P', hero: { name: 'Ana Ruiz', roleClass: 'Disgraced Glassblower', origin: 'Guild-born' } } as any, { category: 'fantasy', pronouns: 'she/her' } as any);
    expect(r.hero.roleClass).toBe('Glassblower');
  });
});

describe('0.2 setup screen helpers', () => {
  beforeEach(() => {
    calls.length = 0;
    replies = [];
    local = undefined;
    clearRecent();
  });

  it('the story card disclosure names the influences, never the complication or set-pieces', async () => {
    const { forgeDisclosure } = await import('../context');
    const pkg = await (async () => {
      replies = [pitchReply, buildReply()];
      return forgeStory({ category: 'mythology', pronouns: 'she/her', mode: 'fresh', rand: () => 0.3 });
    })();
    const d = forgeDisclosure('mythology', pkg.forge)!;
    expect(d.line).toMatch(/^Inspired by /);
    expect(d.line).toContain(pkg.spread.primary.title);
    const all = d.items.map((i) => `${i.kind} ${i.text}`).join(' | ');
    expect(all).toContain(pkg.spread.primary.dna);
    expect(all).not.toContain(pkg.spread.complication);
    for (const sp of pkg.spread.setPieces) expect(all).not.toContain(sp);
    expect(all).toContain('Kept from you');
    expect(forgeDisclosure('mythology', undefined)).toBeNull();
  });

  it('"New ideas" is one pitch call; building a picked idea is one build call on the same spread', async () => {
    const { newIdeas, rollStory } = await import('../../setup/storyRoll');
    replies = [pitchReply];
    const ideas = await newIdeas({ category: 'mythology', pronouns: 'he/him' });
    expect(calls.map((c) => c.feature)).toEqual(['Story pitch']);
    expect(ideas.pitches.length).toBeGreaterThanOrEqual(2);
    calls.length = 0;
    replies = [buildReply()];
    const pkg = await rollStory({ category: 'mythology', pronouns: 'he/him', rulesMode: 'narrative', inspiration: { media: [], tropes: [] }, mode: 'fresh', spread: ideas.spread, pitch: ideas.pitches[1], shape: ideas.spread.shape });
    expect(calls).toHaveLength(1);
    expect(calls[0].userPrompt).toContain(ideas.pitches[1].hook);
    expect(pkg.spread).toBe(ideas.spread);
  });
});

describe('coherent rolls (ohnna, 2026-11-25)', () => {
  it('the second influence always comes from the family\'s own sources, in every category', () => {
    for (const cat of ['revenge', 'fantasy', 'horror', 'romantic', 'zombie', 'tiktok_drama'] as const) {
      for (let i = 0; i < 40; i++) {
        const s = drawSpread(cat, { rand: Math.random });
        if (s.spice) expect(s.family.sources).toContain(s.spice.id);
      }
    }
  });

  it('the prompt splits core cards from optional ones and asks for one situation', async () => {
    const { buildPrompt, pitchPrompt } = await import('../prompts');
    const s = drawSpread('revenge', { rand: () => 0.3 });
    const p = pitchPrompt(s);
    expect(p).toContain('THE CORE');
    expect(p).toContain('OPTIONAL CARDS');
    expect(p).toContain('ONE STORY, NOT A COLLAGE');
    expect(p).not.toContain('built around the second influence');
    const b = buildPrompt({ mode: 'fresh', spread: s, pronouns: 'she/her' });
    expect(b).toContain('SAME-MOMENT CHECK');
    expect(b).toMatch(/each one risks or costs something/);
  });
});

describe('continuity read (ohnna, 2026-11-25)', () => {
  it('runs once per roll and applies only the fields it fixed', async () => {
    replies = [pitchReply, buildReply()];
    checkReplies = [{ problems: ['"Where you start" is a different scene'], startingCircumstances: 'You run the ferry at the bell-ringer\'s steps, waiting for the last crossing.' }];
    const pkg = await forgeStory({ category: 'fantasy', pronouns: 'she/her', mode: 'fresh', rand: () => 0.4 });
    expect(checks).toHaveLength(1);
    expect(checks[0].userPrompt).toContain(GOOD_PREMISE);
    expect(pkg.outline.startingCircumstances).toContain('waiting for the last crossing');
    expect(pkg.premise).toBe(GOOD_PREMISE);
    expect(pkg.stats.continuityFixed).toEqual(['startingCircumstances']);
  });

  it('a failed read keeps the card', async () => {
    replies = [pitchReply, buildReply()];
    checkReplies = [new Error('busy')];
    const pkg = await forgeStory({ category: 'fantasy', pronouns: 'she/her', mode: 'fresh', rand: () => 0.4 });
    expect(pkg.premise).toBe(GOOD_PREMISE);
  });

  it('never rewrites the player\'s own premise', async () => {
    const mine = 'You keep the lighthouse on a rock the maps forgot. Tonight a ship signals that it is carrying your brother, who drowned ten years ago. The keeper before you left one rule: never answer a ship at night. Do you answer the signal, or keep the rule?';
    replies = [buildReply(mine)];
    checkReplies = [{ problems: ['x'], premise: 'A completely different premise that the model wrote instead of the one the player typed, long enough to count as a premise for the check.' }];
    const pkg = await forgeStory({ category: 'fantasy', pronouns: 'she/her', mode: 'adapt', fixed: { premise: mine }, rand: () => 0.4 });
    expect(pkg.premise).toBe(mine);
  });
});
