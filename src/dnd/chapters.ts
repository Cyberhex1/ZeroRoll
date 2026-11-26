/**
 * The chapter list: which book the player is on, which chapters are behind them, which one
 * they are in, and how many are still to come. Built from the save alone, so older saves get
 * it too: chapter and book starts are read from the log (markers on new logs, the "📖" notes
 * on older ones), titles from the roadmap, and finished books from `pastBooks`.
 *
 * Spoilers: titles of chapters the player has not reached are never returned for the book
 * being played; they show as locked. A finished book shows its whole roadmap.
 */
import type { Experience, LogMessage, PastBook, StoryMarker } from '../types';
import { chapterCount } from './applyTurn';
import { REFEREE_PREFIX } from './memory';

export type ChapterStatus = 'done' | 'current' | 'locked' | 'unreached';

export interface ChapterEntry {
  n: number;
  /** Null while the chapter is locked, or when no title was ever written. */
  title: string | null;
  status: ChapterStatus;
  final: boolean;
  /** Log range [start, end) the chapter covers; null when the log has no start for it. */
  start: number | null;
  end: number | null;
  /** Player turns taken in the chapter. */
  turns: number;
}

export interface BookEntry {
  book: number;
  title: string | null;
  current: boolean;
  /** How the book ended; null while it is being played. */
  ended: 'story' | 'death' | null;
  chapters: ChapterEntry[];
  /** The chapter the book is on (current book) or reached (finished book). */
  at: number;
  total: number;
  start: number;
  end: number;
}

const CHAPTER_PREFIX = /^(?:Chapter\s+(?:[IVXLC]+|\d+|One|Two|Three|Four|Five|Six)\s*[:.\-–—|]\s*)+/i;

/** "Chapter 2: Lights on the Headland" → "Lights on the Headland". */
export function chapterTitle(line: string | undefined | null): string | null {
  const t = (line ?? '').replace(CHAPTER_PREFIX, '').replace(/^["'“”]+|["'“”]+$/g, '').trim();
  return t || null;
}

const BOOK_NOTE = /^📖\s*Book\s+(\d+)\s+begins/i;

/** The book or chapter start a log line marks, if any. Older logs are read from their text. */
export function markerOf(log: LogMessage): StoryMarker | null {
  if (log.marker) return log.marker;
  if (log.sender !== 'system' || !log.text.startsWith('📖')) return null;
  const book = BOOK_NOTE.exec(log.text);
  if (book) return { kind: 'book', book: Number(book[1]), chapter: 1 };
  // "📖 <alert title>: <subtitle>" from a chapter change (ExperienceView alert notes).
  const head = log.text.replace(/^📖\s*/, '').split(/:\s/)[0];
  return { kind: 'chapter', book: 0, chapter: 0, title: chapterTitle(head) ?? undefined };
}

const isTurn = (l: LogMessage) => l.sender === 'player' && !l.text.startsWith(REFEREE_PREFIX);

interface Segment {
  book: number;
  start: number;
  end: number;
  /** Chapter number → where it starts and the title its marker carried. */
  starts: Map<number, { at: number; title?: string }>;
}

function segments(logs: LogMessage[], currentBook: number): Segment[] {
  const out: Segment[] = [];
  let seg: Segment = { book: 1, start: 0, end: logs.length, starts: new Map([[1, { at: 0 }]]) };
  let chapter = 1;
  logs.forEach((log, i) => {
    const m = markerOf(log);
    if (!m) return;
    if (m.kind === 'book') {
      seg.end = i;
      out.push(seg);
      seg = { book: m.book || seg.book + 1, start: i, end: logs.length, starts: new Map([[1, { at: i, title: m.title }]]) };
      chapter = 1;
    } else {
      chapter = m.chapter > chapter ? m.chapter : chapter + 1;
      if (!seg.starts.has(chapter)) seg.starts.set(chapter, { at: i, title: m.title });
    }
  });
  out.push(seg);
  // The last stretch of the log is always the book being played, whatever its divider said.
  out[out.length - 1].book = currentBook;
  return out;
}

function chapterEntries(
  logs: LogMessage[],
  seg: Segment,
  total: number,
  titleOf: (n: number) => string | null,
  statusOf: (n: number) => ChapterStatus
): ChapterEntry[] {
  const known = [...seg.starts.entries()].filter(([n]) => n <= total).sort((a, b) => a[0] - b[0]);
  return Array.from({ length: total }, (_, i) => {
    const n = i + 1;
    const status = statusOf(n);
    const here = seg.starts.get(n);
    const start = status === 'locked' || status === 'unreached' || !here ? null : here.at;
    const next = known.find(([k]) => k > n);
    const end = start === null ? null : next ? next[1].at : seg.end;
    const turns = start === null || end === null ? 0 : logs.slice(start, end).filter(isTurn).length;
    return { n, title: status === 'locked' ? null : titleOf(n), status, final: n === total, start, end, turns };
  });
}

/** Every book in the save, oldest first, each with its chapter list. */
export function storyTimeline(exp: Pick<Experience, 'logs' | 'book' | 'bookTitle' | 'title' | 'pastBooks' | 'storyOutline' | 'gameWorldState' | 'concluded'>): BookEntry[] {
  const logs = exp.logs ?? [];
  const currentBook = exp.book ?? 1;
  const segs = segments(logs, currentBook);
  return segs.map((seg, idx) => {
    const current = idx === segs.length - 1;
    if (current) {
      const total = chapterCount(exp);
      const at = Math.min(total, Math.max(1, exp.gameWorldState?.currentChapter ?? 1));
      const ended = exp.concluded?.reason ?? null;
      const roadmap = exp.storyOutline?.chapters ?? [];
      const statusOf = (n: number): ChapterStatus =>
        n < at ? 'done' : n === at ? (ended ? 'done' : 'current') : ended ? 'unreached' : 'locked';
      const titleOf = (n: number) => chapterTitle(roadmap[n - 1]) ?? (seg.starts.get(n)?.title || null);
      return {
        book: seg.book,
        title: (currentBook > 1 ? exp.bookTitle : exp.title) || null,
        current: true,
        ended,
        chapters: chapterEntries(logs, seg, total, titleOf, statusOf),
        at,
        total,
        start: seg.start,
        end: seg.end
      };
    }
    const past: PastBook | undefined = exp.pastBooks?.find((b) => b.book === seg.book);
    const seen = Math.max(...seg.starts.keys());
    const reached = Math.max(1, past?.reached ?? seen);
    const total = Math.max(past?.chapters.length ?? 0, reached);
    const titleOf = (n: number) => chapterTitle(past?.chapters[n - 1]) ?? (seg.starts.get(n)?.title || null);
    return {
      book: seg.book,
      title: past?.title ?? (seg.book === 1 ? exp.title : null) ?? null,
      current: false,
      ended: past?.ended ?? 'story',
      chapters: chapterEntries(logs, seg, total, titleOf, (n) => (n <= reached ? 'done' : 'unreached')),
      at: reached,
      total,
      start: seg.start,
      end: seg.end
    };
  });
}

/** The record kept for a book when the next one starts (its roadmap is replaced then). */
export function pastBookRecord(exp: Pick<Experience, 'book' | 'bookTitle' | 'title' | 'storyOutline' | 'gameWorldState' | 'concluded'>): PastBook {
  const book = exp.book ?? 1;
  return {
    book,
    title: (book > 1 ? exp.bookTitle : exp.title) || undefined,
    chapters: [...(exp.storyOutline?.chapters ?? [])],
    reached: Math.max(1, exp.gameWorldState?.currentChapter ?? 1),
    ended: exp.concluded?.reason ?? null
  };
}

/** The marker for a chapter the story just moved into. */
export function chapterMarker(exp: Pick<Experience, 'book' | 'storyOutline'>, chapter: number): StoryMarker {
  const title = chapterTitle(exp.storyOutline?.chapters?.[chapter - 1]);
  return { kind: 'chapter', book: exp.book ?? 1, chapter, ...(title ? { title } : {}) };
}
