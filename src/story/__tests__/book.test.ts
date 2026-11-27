import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { checkStory } from '../validate';
import type { Story } from '../schema';
import { bookChips, fillPage, hasBook, openBook, turnBook, usesBook, walkBook } from '../book';
import { PlaySave, newSave } from '../play';

const dir = join(__dirname, '../../../stories');
const all = readdirSync(dir)
  .filter((d) => existsSync(join(dir, d, 'story.json')))
  .map((d) => checkStory(JSON.parse(readFileSync(join(dir, d, 'story.json'), 'utf8'))).story as Story);

describe('book mode', () => {
  it('every built-in story can be read as a book', () => {
    for (const s of all) expect(hasBook(s), s.meta.id).toBe(true);
  });

  it('every book reaches every ending by its choices alone and never gets stuck', () => {
    for (const s of all) {
      const w = walkBook(s);
      expect(w.stuck, s.meta.id).toEqual([]);
      expect([...w.endings].sort(), s.meta.id).toEqual(s.beats.filter((b) => b.isEnding).map((b) => b.id).sort());
    }
  });

  it('reads pages offline: opening page, a choice, then the next page', () => {
    const s = all.find((x) => x.meta.id === 'fan-zelda-the-courier-of-hateno')!;
    let save: PlaySave = { ...newSave(s), player: { name: 'Rin', pronouns: 'they/them' } };
    expect(usesBook(s, save)).toBe(true);
    save = openBook(s, save);
    const first = save.messages.filter((m) => m.kind === 'narrator');
    expect(first).toHaveLength(1);
    expect(first[0].text).toBe(s.beats[0].page);
    const chip = bookChips(s, save.state)[0];
    save = turnBook(s, save, chip.choiceId);
    expect(save.state.beat).toBe('crossroads');
    expect(save.messages.at(-1)!.text).toBe(s.beats[1].page);
  });

  it('a stay-here choice shows its outcome and is not offered again', () => {
    const s = all.find((x) => x.meta.id === 'fan-zelda-the-courier-of-hateno')!;
    let save = openBook(s, newSave(s));
    save = turnBook(s, save, bookChips(s, save.state)[0].choiceId);
    const stay = s.beats[1].choices[0];
    save = turnBook(s, save, stay.id);
    expect(save.messages.at(-1)!.text).toBe(stay.outcome);
    expect(bookChips(s, save.state).map((c) => c.choiceId)).not.toContain(stay.id);
  });

  it('hides endings whose discovery the player never made', () => {
    const s = all.find((x) => x.meta.id === 'fan-zelda-the-courier-of-hateno')!;
    const state = { ...newSave(s).state, beat: 'finale', flags: { ...newSave(s).state.flags, clue_a: true } };
    expect(bookChips(s, state).map((c) => c.choiceId)).toHaveLength(2);
  });

  it('fills the player name and turns off with book: false', () => {
    expect(fillPage('Hello, {name}.', { name: 'Ana', pronouns: 'she/her' })).toBe('Hello, Ana.');
    const s = all[0];
    expect(usesBook(s, { book: false })).toBe(false);
  });
});
