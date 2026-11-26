import { describe, expect, it } from 'vitest';
import type { Experience } from '../../types';
import { directorNote, ensureDirector, maxPortentStep, setPieceHit, updateDirector, hasDialogue } from '../director';
import { freshLanguage, repeatedPhrases, overusedTics, repetitionRate } from '../language';
import { turnDirection, leaksDirector } from '../turnContext';
import { turnContextBlock } from '../../content/injection';

const outline = {
  startingCircumstances: '', backstory: '', incitingIncident: '', immediateGoal: '', majorConflicts: [], secretsAndReveals: [], potentialEndings: [],
  chapters: ['One', 'Two', 'Three', 'Four'],
  keyNpcs: [
    { name: 'Hallvard Mosfell', role: 'the harbor reeve', motivation: 'the toll money', move: 'Seizes the hero\'s boat for the toll.' },
    { name: 'Signy', role: 'a net-mender', motivation: 'her brother back' }
  ],
  fronts: [
    { name: 'The Sea-Ice', agenda: 'close the fjord', portents: ['Ice on the oars at dawn.', 'The fishing fleet cannot leave.', 'The fjord freezes shut.', 'The town starves.'] },
    { name: 'The Wolf Cult', agenda: 'feed the old god', portents: ['A dog goes missing.', 'Howling inside the walls.', 'A child is taken.'] }
  ],
  setPieces: ['A funeral ship burning on black water while the drowned climb aboard.', 'A frozen waterfall that cracks open around a sleeping giant.', 'Raiders storm the feast hall during the oath-swearing.']
};

const exp = (over: Partial<Experience> = {}): Experience =>
  ({
    id: 'e', title: 't', category: 'mythology', logs: [], character: { name: 'Ingrid Vik' },
    gameWorldState: { currentChapter: 1, chapterStartedTurn: 0 },
    storyOutline: outline,
    inspiration: { media: [], tropes: [], forge: { v: 1, family: 'norse', familyName: 'Norse saga', dna: ['northman'], dnaTitles: ['The Northman'], engine: 'siege' } },
    ...over
  }) as unknown as Experience;

/** Plays turns with a reply, applying each note like ExperienceView does. */
function play(e: Experience, turns: number, reply: (t: number) => { text: string; check?: boolean; hpDelta?: number }) {
  const notes: Array<{ turn: number; kind: string }> = [];
  let cur = e;
  for (let t = 1; t <= turns; t++) {
    const note = directorNote(cur, t);
    if (note) notes.push({ turn: t, kind: note.kind });
    const r = reply(t);
    cur = { ...cur, director: updateDirector(cur, { text: r.text, check: !!r.check, hpDelta: r.hpDelta ?? 0 }, t, note) };
  }
  return { notes, state: cur.director! };
}

describe('director', () => {
  it('never speaks on turn 1, and never two turns in a row', () => {
    expect(directorNote(exp(), 1)).toBeNull();
    const { notes } = play(exp(), 20, () => ({ text: 'You walk on. "Hello," she says. "Hi."' }));
    for (let i = 1; i < notes.length; i++) expect(notes[i].turn - notes[i - 1].turn).toBeGreaterThan(1);
  });

  it('moves a stalled front after 5 turns, within the pacing cap', () => {
    const { notes, state } = play(exp({ storyOutline: { ...outline, setPieces: [] } }), 6, () => ({ text: 'Hallvard Mosfell nods. "Go," he says. "Now."' }));
    expect(notes.find((n) => n.kind === 'front')?.turn).toBe(5);
    expect(state.frontStep[0] + state.frontStep[1]).toBe(1);
    // Chapter 1 of 4: a 4-portent front may reach only its first portent.
    expect(maxPortentStep(4, 1, 4)).toBe(0);
    expect(maxPortentStep(4, 4, 4)).toBe(3);
    const capped = exp({ director: { ...ensureDirector(exp()), frontStep: [1, 1], frontMovedTurn: [0, 0] } });
    expect(directorNote(capped, 9)?.kind).not.toBe('front');
  });

  it('brings back an NPC with a move who has been off-screen, and marks NPCs seen', () => {
    const e = exp({ storyOutline: { ...outline, fronts: [] } });
    const { notes, state } = play(e, 5, () => ({ text: 'Snow falls. "Cold," says Signy. "Yes."' }));
    expect(notes[0]).toEqual({ turn: 4, kind: 'npc' });
    expect(state.npcSeen.Signy).toBe(5);
    expect(state.npcSeen['Hallvard Mosfell']).toBeUndefined();
  });

  it("offers this chapter's set-piece at chapter turn 4, and detects it when it happens", () => {
    const e = exp({ storyOutline: { ...outline, fronts: [], keyNpcs: [] } });
    expect(directorNote(e, 4)?.kind).toBe('set_piece');
    expect(directorNote(e, 4)?.text).toContain('funeral ship');
    expect(setPieceHit(outline.setPieces[0], 'The funeral ship is burning on the black water, and the drowned climb aboard it.')).toBe(true);
    expect(setPieceHit(outline.setPieces[0], 'You drink mead.')).toBe(false);
  });

  it('asks for dialogue after 3 silent replies, and a quiet beat after 3 action turns', () => {
    const bare = exp({ storyOutline: { ...outline, fronts: [], keyNpcs: [], setPieces: [] } });
    expect(play(bare, 4, () => ({ text: 'You climb. The wind howls.' })).notes[0]).toEqual({ turn: 4, kind: 'dialogue' });
    expect(play(bare, 4, () => ({ text: '"Run!" "Now!"', check: true })).notes[0]).toEqual({ turn: 4, kind: 'quiet' });
    expect(hasDialogue('He said nothing.')).toBe(false);
  });

  it('closes a chapter that has run long (story conclusion in the final chapter)', () => {
    const long = exp({ gameWorldState: { currentChapter: 2, chapterStartedTurn: 0 } as never });
    expect(directorNote(long, 12)?.kind).toBe('chapter_close');
    expect(directorNote(long, 12)?.text).toContain('chapter_transition');
    const last = exp({ gameWorldState: { currentChapter: 4, chapterStartedTurn: 0 } as never });
    expect(directorNote(last, 13)?.text).toContain('story_conclusion');
  });

  it('a campaign from before 0.2 (no fronts, moves or set-pieces) gets only dialogue and quiet notes', () => {
    const old = exp({ storyOutline: { ...outline, fronts: undefined, setPieces: undefined, keyNpcs: [{ name: 'Old Tom', role: 'innkeeper', motivation: 'coin' }] }, inspiration: { media: [], tropes: [] } });
    const { notes } = play(old, 10, () => ({ text: '"Hello," says Old Tom. "Hi."' }));
    expect(notes).toEqual([]);
    expect(directorNote({ ...old, storyOutline: undefined }, 5)).toBeNull();
  });
});

describe('fresh language', () => {
  it('finds 4-grams repeated across recent replies, ignoring stopword-only grams', () => {
    const replies = [
      'The wind howls across the fjord as you step onto the ice.',
      'Snow drifts. The wind howls across the fjord again, louder.',
      'It is what it is, and so it is.'
    ];
    const p = repeatedPhrases(replies);
    expect(p.some((x) => x.includes('wind howls across the'))).toBe(true);
    expect(p.join(' ')).not.toMatch(/^it is what it$/);
    expect(freshLanguage(replies)).toMatch(/^FRESH LANGUAGE: .*wind howls across the/);
  });

  it('flags phrases copied from the profile and overused tic words; empty when clean', () => {
    expect(repeatedPhrases(['You see ravens circling frostbitten fjords at dusk.'], 'Ravens circling frostbitten fjords at the edge of the world.')).toContain('ravens circling frostbitten fjords at');
    expect(overusedTics(['a hum', 'the hum', 'hum again'])).toEqual(['hum']);
    expect(freshLanguage(['One clean reply.', 'Another different one.'])).toBe('');
    expect(repetitionRate(['a b c d e', 'x y z w'])).toBe(0);
  });
});

describe('turn context', () => {
  it('every campaign gets the style card and its tone references', () => {
    const d = turnDirection(exp(), 3);
    const block = turnContextBlock('mythology', { media: ['The Odyssey (Epic)'], tropes: [] }, d.context);
    expect(block).toContain('Tone references: The Odyssey');
    expect(block.startsWith('STYLE (')).toBe(true);
    expect(d.names).toMatch(/^New characters, if any, can take names like: /);
    expect(d.names).not.toContain('Ingrid');
  });

  it('spots a reply that leaks the machinery', () => {
    expect(leaksDirector('As the DIRECTOR NOTE says, the ice moves.')).toBe(true);
    expect(leaksDirector('The ice moves.')).toBe(false);
  });
});

describe('fresh language catches play tics (bug test S3)', () => {
  it('flags hum, ozone and rhythmic when they repeat, not on one use', async () => {
    const { overusedTics } = await import('../language');
    expect(overusedTics(['An electric hum fills the hall; the air smells of ozone.', 'The lamps are humming, and ozone stings your nose.', 'A rhythmic glow pulses.'])).toEqual(expect.arrayContaining(['ozone', 'hum']));
    expect(overusedTics(['A rhythmic glow pulses.', 'Rain on the roof.'])).not.toContain('rhythmic');
  });
});
