import { describe, it, expect } from 'vitest';
import example from '../../../stories/lantern-of-hollowmere/story.json';
import { checkStory } from '../validate';
import { Story } from '../schema';
import { storySystemPrompt, fanFictionNote } from '../prompt';
import { cleanPlayer, playerLine } from '../player';
import { groupBySource, matchesSearch } from '../sections';
import { fanficId, fanficWriterPrompt, shapeFanfic, trappedBeats } from '../createFanfic';
import { newSave, buildPrompt } from '../play';

const clone = () => JSON.parse(JSON.stringify(example));
const story = checkStory(example).story as Story;
const fan = (title: string, src: string, medium: 'game' | 'book' = 'game'): Story['meta'] => ({ ...story.meta, id: title.toLowerCase().replace(/\W+/g, '-'), title, source: { title: src, medium } });

describe('player name and pronouns', () => {
  it('cleans what the player typed and needs a name', () => {
    expect(cleanPlayer('  Ana   Lucia ', ' she/her ')).toEqual({ name: 'Ana Lucia', pronouns: 'she/her' });
    expect(cleanPlayer('Kai', '')).toEqual({ name: 'Kai', pronouns: 'they/them' });
    expect(cleanPlayer('   ', 'he/him')).toBeNull();
  });

  it('writes the player into the story prompt, full and compact', () => {
    const p = { name: 'Ana', pronouns: 'she/her' };
    expect(storySystemPrompt(story, 'full', 180, p)).toContain(playerLine(p));
    expect(storySystemPrompt(story, 'compact', 180, p)).toContain('called Ana and uses she/her');
    expect(storySystemPrompt(story, 'full', 180)).not.toContain("player's character is called");
  });

  it('keeps the player on the save and sends it every turn', () => {
    const save = newSave(story, 'good', { name: 'Rook', pronouns: 'they/them' });
    expect(save.player?.name).toBe('Rook');
    expect(buildPrompt(story, save, 'good').system).toContain('called Rook');
  });
});

describe('fan fiction stories', () => {
  it('accepts a source and sends the SOURCE block only for fan fiction', () => {
    const s = clone();
    s.meta.source = { title: "Baldur's Gate 3", medium: 'game', owner: 'Larian Studios' };
    const c = checkStory(s);
    expect(c.ok).toBe(true);
    const prompt = storySystemPrompt(c.story!, 'full', 180);
    expect(prompt).toContain("SOURCE\nThis is unofficial fan fiction set in the world of Baldur's Gate 3 (video game).");
    expect(storySystemPrompt(story, 'full', 180)).not.toContain('SOURCE');
    expect(fanFictionNote(c.story!)).toMatch(/Unofficial fan fiction set in Baldur's Gate 3 \(video game\), which belongs to Larian Studios/);
  });

  it('rejects an unknown medium', () => {
    const s = clone();
    s.meta.source = { title: 'X', medium: 'podcast' };
    expect(checkStory(s).ok).toBe(false);
  });

  it('groups by work and searches title, blurb, genre and work', () => {
    const list = [fan('B story', 'Diablo'), fan('A story', 'Diablo'), fan('C story', "Baldur's Gate 3")];
    expect(groupBySource(list).map(([t, l]) => [t, l.map((m) => m.title)])).toEqual([
      ["Baldur's Gate 3", ['C story']],
      ['Diablo', ['A story', 'B story']]
    ]);
    expect(matchesSearch(list[2], 'baldur')).toBe(true);
    expect(matchesSearch(list[2], 'fantasy baldur')).toBe(true);
    expect(matchesSearch(list[2], 'diablo')).toBe(false);
    expect(matchesSearch(fan('Les', 'Les Misérables', 'book'), 'miserables')).toBe(true);
  });
});

describe('create your own fanfic', () => {
  const req = { media: 'Lookism', medium: 'manhwa' as const, rating: 'teen' as const };

  it('asks for a new story in that world, never a retelling', () => {
    const p = fanficWriterPrompt({ ...req, idea: 'a rooftop fight' });
    expect(p).toContain('fan fiction set in Lookism (manhwa (Korean webcomic))');
    expect(p).toContain('a rooftop fight');
    expect(p).toMatch(/never retell the original's plot/);
    expect(p).toMatch(/never name them or fix their gender/);
  });

  it('makes a unique id and fills the fields the player chose', () => {
    expect(fanficId("Baldur's Gate 3!", 0)).toBe('my-baldur-s-gate-3-0');
    const raw = clone();
    raw.meta.category = 'fantasy';
    raw.cast[0].portrait = 'odda';
    const shaped = shapeFanfic(raw, req, 'my-test') as Story;
    const c = checkStory(shaped);
    expect(c.issues).toEqual([]);
    expect(c.story!.meta).toMatchObject({ id: 'my-test', rating: 'teen', created: true, source: { title: 'Lookism', medium: 'manhwa' } });
    expect(c.story!.art).toEqual({});
    expect(c.story!.beats.every((b) => !b.artCues.length)).toBe(true);
  });

  it('finds beats where every exit is gated', () => {
    const beats = [
      { id: 'a', exits: ['b', 'c'] },
      { id: 'b', exits: ['end'], entry: [{ flag: 'x', is: true }] },
      { id: 'c', exits: ['end'], entry: [{ flag: 'y', is: true }] },
      { id: 'end', isEnding: true, exits: [] }
    ];
    expect(trappedBeats({ beats }).map((i) => i.at)).toEqual(['beats.a.exits']);
    beats[2].entry = [];
    expect(trappedBeats({ beats })).toEqual([]);
  });
});
