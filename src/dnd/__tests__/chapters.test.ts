import { describe, expect, it } from 'vitest';
import { chapterMarker, chapterTitle, markerOf, pastBookRecord, storyTimeline } from '../chapters';
import { REFEREE_PREFIX } from '../memory';
import type { Experience, LogMessage } from '../../types';

let id = 0;
const L = (sender: LogMessage['sender'], text: string, extra: Partial<LogMessage> = {}): LogMessage => ({ id: `l${id++}`, sender, text, timestamp: '', ...extra });

const outline = { chapters: ['Chapter 1: The Waterlogged Ledger', 'Chapter 2: Lights on the Headland', "Chapter 3: The Smuggler's Den", 'Chapter 4: The Tide Turns'] };

const base = (over: Partial<Experience> = {}) =>
  ({
    title: 'Saltmarsh',
    book: 1,
    storyOutline: outline,
    gameWorldState: { currentChapter: 2 },
    concluded: null,
    logs: [
      L('dm', 'Opening.'),
      L('player', 'Look around'),
      L('dm', 'Rain.'),
      L('player', `${REFEREE_PREFIX} can I climb?`),
      L('player', 'Climb the tower'),
      L('dm', 'The ledger burns; you head for the cliffs.'),
      L('system', '📖 A New Light: the headland', { marker: { kind: 'chapter', book: 1, chapter: 2, title: 'Lights on the Headland' } }),
      L('player', 'Signal the boat'),
      L('dm', 'A lamp answers.')
    ],
    ...over
  }) as unknown as Experience;

describe('chapter list', () => {
  it('strips "Chapter N:" from roadmap lines', () => {
    expect(chapterTitle('Chapter 3: Chapter 3: "The Den"')).toBe('The Den');
    expect(chapterTitle('')).toBeNull();
  });

  it('shows played chapters with titles and turns, and locks the rest without titles', () => {
    const [b] = storyTimeline(base());
    expect(b).toMatchObject({ book: 1, current: true, at: 2, total: 4, ended: null, title: 'Saltmarsh' });
    expect(b.chapters.map((c) => c.status)).toEqual(['done', 'current', 'locked', 'locked']);
    expect(b.chapters[0]).toMatchObject({ title: 'The Waterlogged Ledger', start: 0, end: 6, turns: 2 });
    expect(b.chapters[1]).toMatchObject({ title: 'Lights on the Headland', start: 6, end: 9, turns: 1 });
    // No spoilers: chapters ahead carry no title and no log range.
    expect(b.chapters[2]).toMatchObject({ title: null, start: null });
    expect(b.chapters[3]).toMatchObject({ title: null, final: true });
  });

  it('reads chapter starts from older saves that only have the 📖 note', () => {
    const exp = base();
    delete exp.logs[6].marker;
    const [b] = storyTimeline(exp);
    expect(b.chapters[1]).toMatchObject({ status: 'current', start: 6, title: 'Lights on the Headland' });
    expect(markerOf(exp.logs[6])).toMatchObject({ kind: 'chapter' });
    expect(markerOf(L('system', '🎲 Took 3 damage'))).toBeNull();
  });

  it('marks a death ending and leaves later chapters unreached', () => {
    const [b] = storyTimeline(base({ concluded: { reason: 'death', at: '' } }));
    expect(b.ended).toBe('death');
    expect(b.chapters.map((c) => c.status)).toEqual(['done', 'done', 'unreached', 'unreached']);
    // A finished book is not a spoiler any more.
    expect(b.chapters[3].title).toBe('The Tide Turns');
  });

  it('splits books at the Book N divider and keeps the old roadmap from pastBooks', () => {
    const first = base({ gameWorldState: { currentChapter: 4 } as any, concluded: { reason: 'story', at: '' } });
    const record = pastBookRecord(first);
    expect(record).toEqual({ book: 1, title: 'Saltmarsh', chapters: outline.chapters, reached: 4, ended: 'story' });
    const logs = [
      ...first.logs,
      L('system', '📖 Book 2 begins. Rook has rested and recovered.', { marker: { kind: 'book', book: 2, chapter: 1, title: 'The Drowned Choir' } }),
      L('dm', 'Book two opens.'),
      L('player', 'Go')
    ];
    const books = storyTimeline({ ...first, book: 2, bookTitle: 'The Drowned Choir', pastBooks: [record], logs, storyOutline: { chapters: ['Chapter 1: Choir', 'Chapter 2: Bells'] } as any, gameWorldState: { currentChapter: 1 } as any, concluded: null });
    expect(books.map((b) => [b.book, b.title, b.current])).toEqual([
      [1, 'Saltmarsh', false],
      [2, 'The Drowned Choir', true]
    ]);
    expect(books[0].chapters.map((c) => c.status)).toEqual(['done', 'done', 'done', 'done']);
    expect(books[0].chapters[1]).toMatchObject({ start: 6, end: 9 });
    expect(books[1].chapters[0]).toMatchObject({ title: 'Choir', start: 9, end: 12, turns: 1, status: 'current' });
    expect(books[1].chapters[1]).toMatchObject({ title: null, status: 'locked' });
  });

  it('builds the marker for the chapter just entered', () => {
    expect(chapterMarker(base(), 3)).toEqual({ kind: 'chapter', book: 1, chapter: 3, title: "The Smuggler's Den" });
  });
});
