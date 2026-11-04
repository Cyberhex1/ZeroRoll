import { describe, it, expect } from 'vitest';
import example from '../../../stories/lantern-of-hollowmere/story.json';
import { checkStory } from '../validate';
import { Story } from '../schema';
import { applyChoice, applyNarratorTail, chipsFor, gateRefusal, newState } from '../engine';
import { directorBlock, parseNarratorReply, storySystemPrompt } from '../prompt';

const clone = () => JSON.parse(JSON.stringify(example));
const story = checkStory(example).story as Story;

describe('story validator', () => {
  it('accepts the example story', () => {
    const c = checkStory(example, ['cover.webp', 'landing.webp', 'odda.webp', 'maelis.webp', 'crossing.webp', 'lights.webp', 'bell.webp', 'dawn.webp']);
    expect(c.issues).toEqual([]);
    expect(c.ok).toBe(true);
  });

  it('rejects a story with an unreachable beat', () => {
    const s = clone();
    s.beats.push({ id: 'island', title: 'Lost island', sceneBrief: 'A beat nothing leads to, for the test.', isEnding: true });
    const c = checkStory(s);
    expect(c.ok).toBe(false);
    expect(c.issues.some((i) => i.at === 'beats.island' && /cannot be reached/.test(i.message))).toBe(true);
  });

  it('rejects dead ends, unknown exits, unknown flags and missing art', () => {
    const s = clone();
    s.beats[0].exits = ['crossing', 'nowhere'];
    s.beats[1].choices[0].sets = [{ flag: 'ghost_flag', set: true }];
    s.beats[3].artCues = [{ art: 'missing_art', on: 'enter' }];
    const msgs = checkStory(s).issues.map((i) => i.message).join('\n');
    expect(msgs).toMatch(/Exit "nowhere" is not a beat/);
    expect(msgs).toMatch(/Flag "ghost_flag" is not declared/);
    expect(msgs).toMatch(/Art "missing_art" is not in the art list/);
  });

  it('refuses a hard gate no authored choice can open', () => {
    const s = clone();
    s.beats[1].choices = s.beats[1].choices.filter((c: { id: string }) => c.id !== 'relight');
    expect(checkStory(s).issues.some((i) => i.at === 'beats.crossing.goal')).toBe(true);
  });

  it('needs two endings and art files on disk', () => {
    const s = clone();
    s.beats = s.beats.filter((b: { id: string }) => b.id !== 'shard' && b.id !== 'leave_lake');
    s.beats.find((b: { id: string }) => b.id === 'bell').exits = ['freed'];
    s.beats.find((b: { id: string }) => b.id === 'bell').choices = [{ id: 'remember', label: 'Remember her', target: 'freed', sets: [{ flag: 'spared_spirit', set: true }] }];
    s.beats.find((b: { id: string }) => b.id === 'tower').exits = ['bell'];
    s.beats.find((b: { id: string }) => b.id === 'tower').choices = [{ id: 'read_board', label: 'Read the board', sets: [{ flag: 'knows_name', set: true }] }];
    const c = checkStory(s, []);
    expect(c.issues.some((i) => /at least two endings/.test(i.message))).toBe(true);
    expect(c.issues.some((i) => /is not in the art folder/.test(i.message))).toBe(true);
  });
});

describe('beat engine', () => {
  it('holds the player in a beat until its goal is met', () => {
    const s0 = newState(story);
    expect(gateRefusal(story, s0, 'crossing')).toMatch(/goal of "Odda's Landing" is not met/);
    const tried = applyChoice(story, s0, 'cross');
    expect(tried.state.beat).toBe('landing');
    expect(tried.events.some((e) => e.kind === 'rejected')).toBe(true);
    expect(tried.state.notice).toMatch(/Narrate why it does not work yet/);

    const helped = applyChoice(story, tried.state, 'help_chain');
    expect(helped.state.flags.odda_trust).toBe(1);
    const moved = applyChoice(story, helped.state, 'cross');
    expect(moved.state.beat).toBe('crossing');
    expect(moved.events).toContainEqual({ kind: 'art', art: 'crossing' });
  });

  it('drops a narrator claim the graph does not allow and says why next turn', () => {
    const s0 = newState(story);
    const jump = applyNarratorTail(story, s0, { beatReached: 'bell' });
    expect(jump.state.beat).toBe('landing');
    expect(jump.state.notice).toMatch(/not reachable/);
    expect(directorBlock(story, jump.state, 'full')).toMatch(/Correction:/);

    const early = applyNarratorTail(story, s0, { beatReached: 'crossing' });
    expect(early.state.beat).toBe('landing');

    const ok = applyNarratorTail(story, s0, { beatReached: 'crossing', flags: { odda_trust: '+1' } });
    expect(ok.state.beat).toBe('crossing');
    expect(ok.state.notice).toBeUndefined();
  });

  it('only accepts declared flags with the right type', () => {
    const r = applyNarratorTail(story, newState(story), { flags: { lantern_lit: 'yes', odda_trust: 2, made_up: true, knows_name: true } });
    expect(r.state.flags).toMatchObject({ lantern_lit: false, odda_trust: 2, knows_name: true });
    expect('made_up' in r.state.flags).toBe(false);
  });

  it('different choices reach different endings', () => {
    const play = (final: string) => {
      let s = newState(story);
      for (const c of ['help_chain', 'cross', 'relight', 'listen', 'row_on', 'descend', final]) s = applyChoice(story, s, c).state;
      return s;
    };
    expect(play('remember').ending).toBe('freed');
    expect(play('break').ending).toBe('shard');
    expect(chipsFor(story, play('break'), ['x'])).toEqual([]);
  });

  it('fires flag art cues when the condition starts to hold, and gives a hint after a while', () => {
    let s = newState(story);
    for (const c of ['help_chain', 'cross', 'relight', 'row_on']) s = applyChoice(story, s, c).state;
    expect(s.beat).toBe('tower');
    const r = applyChoice(story, s, 'read_board');
    expect(r.events).toContainEqual({ kind: 'art', art: 'maelis' });

    let idle = newState(story);
    for (let i = 0; i < 5; i++) idle = applyNarratorTail(story, idle, {}).state;
    expect(directorBlock(story, idle, 'compact')).toMatch(/Work this hint into the scene/);
  });

  it('offers authored choices first, then the narrator\'s, at most four', () => {
    const chips = chipsFor(story, newState(story), ['Ask Odda about the bell under the lake', 'Sit and watch the water']);
    expect(chips.map((c) => c.label)).toEqual(['Help Odda haul the heavy chain', 'Tell her plainly why the guild sent you', 'Ask about the bell under the lake', 'Ask her to take you across now']);
  });
});

describe('narrator prompts and replies', () => {
  it('reads a fenced JSON tail and strips it from the narration', () => {
    const r = parseNarratorReply('The chain groans.\n\n```json\n{"beatReached": "none", "flags": {"odda_trust": "+1"}, "choices": ["Pull", "Rest"],}\n```');
    expect(r.narration).toBe('The chain groans.');
    expect(r.tail).toMatchObject({ beatReached: 'none', flags: { odda_trust: '+1' }, choices: ['Pull', 'Rest'] });
  });

  it('reads a bare trailing object and tolerates no tail', () => {
    expect(parseNarratorReply('Rain. {"beatReached":"crossing"}').tail.beatReached).toBe('crossing');
    expect(parseNarratorReply('Just prose with {braces} inside.')).toEqual({ narration: 'Just prose with {braces} inside.', tail: {} });
  });

  it('keeps the compact prompt short for local models', () => {
    const full = storySystemPrompt(story, 'full', 180);
    const compact = storySystemPrompt(story, 'compact', 180);
    expect(compact.length).toBeLessThan(full.length);
    expect(compact).toMatch(/Odda: A broad woman/);
  });
});

describe('skins', async () => {
  const { CATEGORY_SKINS, resolveSkin, skinVars } = await import('../skins');
  const { CATEGORY_IDS } = await import('../../content/categoryIds');
  it('has a base skin for every category and applies story overrides on top', () => {
    for (const c of CATEGORY_IDS) expect(CATEGORY_SKINS[c]).toBeTruthy();
    const s = resolveSkin('fantasy', story.skin);
    expect(s.palette.accent).toBe('#7cc4ff');
    expect(s.palette.background).toBe(CATEGORY_SKINS.fantasy.palette.background);
    expect(skinVars(s)['--sk-accent']).toBe('#7cc4ff');
    expect(skinVars(resolveSkin('horror'))['--sk-accent']).not.toBe(skinVars(s)['--sk-accent']);
  });
});

describe('playing a turn', async () => {
  const { addPlayerInput, narrate, newSave, rewindForReroll, buildPrompt, currentChips, maybeSummarize, memoryOf } = await import('../play');
  const reply = (text: string) => async () => ({ text, truncated: false, provider: 'gemini' as const, model: 'm', tier: 'good' as const, requestedTier: 'good' as const, attempts: [] });

  it('runs a choice and a narrator reply into a saved turn', async () => {
    let save = newSave(story);
    save = addPlayerInput(story, save, { choiceId: 'help_chain' }).save;
    const r = await narrate(story, save, reply('You haul together.\n```json\n{"beatReached":"crossing","flags":{},"choices":["Look back"]}\n```'));
    expect(r.save.state.beat).toBe('crossing');
    expect(r.save.messages.map((m) => m.kind)).toEqual(['player', 'art', 'narrator', 'art']);
    expect(r.save.messages[1].art).toBe('landing');
    expect(r.save.messages[2].text).toBe('You haul together.');
    expect(currentChips(story, r.save)[0].choiceId).toBe('relight');

    const back = rewindForReroll(r.save)!;
    expect(back.state.beat).toBe('landing');
    expect(back.messages).toHaveLength(1);
  });

  it('sends the compact prompt on the basic tier and starts history with the player', () => {
    const save = { ...newSave(story, 'basic'), messages: [{ id: 'a', kind: 'narrator' as const, text: 'Dusk.', beat: 'landing', at: 1 }] };
    const p = buildPrompt(story, save, 'basic');
    expect(p.system).toMatch(/DIRECTOR/);
    expect(p.messages[0]).toEqual({ role: 'user', content: 'Continue the story.' });
  });

  it('refuses a reply that is only data', async () => {
    await expect(narrate(story, newSave(story), reply('{"beatReached":"none"}'))).rejects.toMatchObject({ kind: 'bad_output' });
  });

  it('pins the beats the story enters and unpins them on reroll', async () => {
    let save = addPlayerInput(story, newSave(story), { choiceId: 'help_chain' }).save;
    const r = await narrate(story, save, reply('You haul together.\n```json\n{"beatReached":"crossing"}\n```'));
    const pins = memoryOf(r.save).entries.filter((e) => e.source === 'beat');
    expect(pins).toHaveLength(1);
    expect(pins[0]).toMatchObject({ pinned: true });
    expect(buildPrompt(story, r.save, 'good').system).toContain(pins[0].text);
    save = rewindForReroll(r.save)!;
    expect(memoryOf(save).entries.filter((e) => e.source === 'beat')).toHaveLength(0);
  });

  it('leaves summarized turns to the summary and applies a summary onto a newer save', async () => {
    const messages = Array.from({ length: 30 }, (_, i) => ({ id: `m${i}`, kind: (i % 2 ? 'narrator' : 'player') as 'narrator' | 'player', text: `line ${i}`, beat: 'landing', at: i }));
    const save = { ...newSave(story), messages };
    const apply = await maybeSummarize(save, reply('{"summary":"They argued on the dock.","facts":["Odda keeps the ferry"]}'));
    expect(apply).not.toBeNull();
    const later = { ...save, messages: [...messages, { id: 'x', kind: 'player' as const, text: 'one more', beat: 'landing', at: 99 }] };
    const done = apply!(later);
    expect(done.messages).toHaveLength(31);
    expect(memoryOf(done)).toMatchObject({ summary: 'They argued on the dock.', summarizedThrough: 18 });
    expect(memoryOf(done).pending[0].text).toBe('Odda keeps the ferry');
    const p = buildPrompt(story, done, 'good');
    expect(p.system).toContain('They argued on the dock.');
    expect(p.messages.some((m) => m.content === 'line 17')).toBe(false);
    expect(p.messages.some((m) => m.content === 'line 18')).toBe(true);
    expect(await maybeSummarize(done, reply('{}'))).toBeNull();
  });
});
