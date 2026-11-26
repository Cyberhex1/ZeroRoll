import React, { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { BookOpen, Check, ChevronLeft, Lock, Skull, X } from 'lucide-react';
import type { Experience, LogMessage } from '../types';
import { type BookEntry, type ChapterEntry, markerOf, storyTimeline } from '../dnd/chapters';
import { REFEREE_PREFIX } from '../dnd/memory';
import { useDialog } from './ui/useDialog';

type TimelineSource = Parameters<typeof storyTimeline>[0];

/** One bar per chapter: filled behind the player, glowing where they are, dim ahead. */
export const ChapterBar: React.FC<{ book: BookEntry; className?: string }> = ({ book, className = '' }) => (
  <div className={`flex items-center gap-1 ${className}`} aria-hidden="true">
    {book.chapters.map((c) => (
      <span
        key={c.n}
        className={`h-1.5 flex-1 min-w-[10px] rounded-full transition-all ${c.status === 'current' ? 'animate-pulse' : ''}`}
        style={{
          background:
            c.status === 'done' ? 'var(--sk-accent)' : c.status === 'current' ? 'color-mix(in srgb, var(--sk-accent) 70%, white)' : 'rgba(255,255,255,0.12)',
          boxShadow: c.status === 'current' ? '0 0 8px var(--sk-accent)' : undefined,
          opacity: c.status === 'unreached' ? 0.35 : 1
        }}
      />
    ))}
  </div>
);

/** The header button: which book, which chapter, and the bar. Opens the chapter list. */
export const ChapterProgressButton: React.FC<{ experience: TimelineSource; onOpen: () => void }> = ({ experience, onOpen }) => {
  const books = useMemo(() => storyTimeline(experience), [experience]);
  const book = books[books.length - 1];
  const chapter = book.chapters[book.at - 1];
  const label = book.ended
    ? book.ended === 'death'
      ? `Book ${book.book} ended in Chapter ${book.at}`
      : `Book ${book.book} complete`
    : `Book ${book.book} · Chapter ${book.at} of ${book.total}`;
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group w-full sm:w-auto sm:min-w-[260px] text-left rounded-md border border-white/10 bg-black/30 hover:bg-white/5 px-2.5 py-1.5 transition"
      aria-label={`${label}${chapter?.title ? `: ${chapter.title}` : ''}. Open the chapter list.`}
      data-testid="chapter-progress"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 min-w-0">
          <BookOpen className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--sk-accent)' }} />
          <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-slate-300 truncate">{label}</span>
        </span>
        <span className="text-[10px] text-slate-500 group-hover:text-slate-300 shrink-0">Chapters ›</span>
      </div>
      {chapter?.title && !book.ended && (
        <div className="text-xs sm:text-[13px] text-slate-100 truncate mt-0.5" style={{ fontFamily: 'var(--sk-font-heading)' }}>
          {chapter.title}
        </div>
      )}
      <ChapterBar book={book} className="mt-1.5" />
    </button>
  );
};

const STATUS_TEXT: Record<ChapterEntry['status'], string> = {
  done: 'Finished',
  current: 'You are here',
  locked: 'Locked',
  unreached: 'Not reached'
};

const ChapterRow: React.FC<{ c: ChapterEntry; book: BookEntry; selected: boolean; onRead: () => void }> = ({ c, book, selected, onRead }) => {
  const readable = c.start !== null;
  const icon =
    c.status === 'done' ? (
      book.ended === 'death' && c.n === book.at ? <Skull className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />
    ) : c.status === 'current' ? (
      <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--sk-accent)' }} />
    ) : (
      <Lock className="w-3 h-3" />
    );
  return (
    <li>
      <button
        type="button"
        onClick={onRead}
        disabled={!readable}
        aria-current={c.status === 'current' ? 'step' : undefined}
        className={`w-full flex items-start gap-2.5 rounded-md px-2.5 py-2 text-left border transition ${
          selected ? 'bg-white/10 border-white/20' : 'border-transparent hover:bg-white/5'
        } disabled:cursor-default disabled:hover:bg-transparent`}
      >
        <span
          className={`mt-0.5 w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-[10px] font-bold border ${
            c.status === 'current' ? 'border-[var(--sk-accent)]' : c.status === 'done' ? 'border-white/20 text-black' : 'border-white/10 text-slate-500'
          }`}
          style={c.status === 'done' ? { background: 'var(--sk-accent)' } : undefined}
        >
          {icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline justify-between gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Chapter {c.n}
              {c.final ? ' · Finale' : ''}
            </span>
            <span className={`text-[10px] shrink-0 ${c.status === 'current' ? 'text-[var(--sk-accent)] font-semibold' : 'text-slate-500'}`}>
              {STATUS_TEXT[c.status]}
              {readable && c.turns ? ` · ${c.turns} turn${c.turns === 1 ? '' : 's'}` : ''}
            </span>
          </span>
          <span
            className={`block text-sm leading-snug ${c.status === 'locked' ? 'text-slate-500 italic' : c.status === 'unreached' ? 'text-slate-500 line-through' : 'text-slate-100'}`}
            style={{ fontFamily: c.status === 'locked' ? undefined : 'var(--sk-font-heading)' }}
          >
            {c.status === 'locked' ? 'Still to come' : c.title ?? `Chapter ${c.n}`}
          </span>
        </span>
      </button>
    </li>
  );
};

const ReaderLine: React.FC<{ log: LogMessage }> = ({ log }) => {
  if (markerOf(log)) return null;
  if (log.sender === 'player') {
    const referee = log.text.startsWith(REFEREE_PREFIX);
    return (
      <p className={`ml-6 border-l-2 pl-2.5 text-[13px] italic ${referee ? 'border-purple-500/50 text-purple-200/80' : 'border-amber-500/50 text-amber-100/90'}`}>
        {referee ? log.text.slice(REFEREE_PREFIX.length).trim() : log.text}
      </p>
    );
  }
  if (log.sender === 'system') return <p className="text-[11px] text-slate-500 italic text-center">{log.text}</p>;
  return (
    <div className="prose prose-invert max-w-none text-[13px] leading-relaxed text-slate-200">
      <ReactMarkdown
        components={{
          p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
          strong: ({ node, ...props }) => <strong className="text-amber-300 font-semibold" {...props} />
        }}
      >
        {log.text}
      </ReactMarkdown>
    </div>
  );
};

/**
 * Every book and chapter in the save. Chapters the player has reached can be reread;
 * chapters still ahead in the current book are locked and untitled (no spoilers).
 */
export const ChaptersDialog: React.FC<{ experience: TimelineSource & Pick<Experience, 'logs'>; onClose: () => void }> = ({ experience, onClose }) => {
  const books = useMemo(() => storyTimeline(experience), [experience]);
  const current = books[books.length - 1];
  const [sel, setSel] = useState<{ book: number; n: number }>({ book: current.book, n: current.at });
  // On a phone the list and the reader take turns; on wider screens they sit side by side.
  const [phoneView, setPhoneView] = useState<'list' | 'read'>('list');
  const dialog = useDialog(onClose, { labelledBy: 'chapters-title' });

  const selBook = books.find((b) => b.book === sel.book) ?? current;
  const selChapter = selBook.chapters.find((c) => c.n === sel.n);
  const lines = selChapter && selChapter.start !== null && selChapter.end !== null ? experience.logs.slice(selChapter.start, selChapter.end) : [];

  return (
    <div className="fixed inset-0 z-[55] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4" {...dialog.overlayProps}>
      <div
        {...dialog.dialogProps}
        className="w-full sm:max-w-4xl h-[92dvh] sm:h-[80vh] bg-[#111118] border border-white/10 rounded-t-xl sm:rounded-xl shadow-2xl flex flex-col overflow-hidden text-slate-200"
        style={{ borderTop: '2px solid var(--sk-accent)' }}
        data-testid="chapters-dialog"
      >
        <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-white/10">
          <div className="min-w-0">
            <h2 id="chapters-title" className="text-base font-bold truncate" style={{ fontFamily: 'var(--sk-font-heading)', color: 'var(--sk-accent)' }}>
              Chapters
            </h2>
            <p className="text-[11px] text-slate-400">
              {books.length > 1 ? `${books.length} books in this save. ` : ''}Pick a chapter you have played to read it again.
            </p>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-slate-100" aria-label="Close the chapter list">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <nav aria-label="Books and chapters" className={`min-h-0 overflow-y-auto p-3 space-y-4 md:border-r border-white/10 ${phoneView === 'read' ? 'hidden md:block' : ''}`}>
            {[...books].reverse().map((b) => (
              <section key={b.book} aria-label={`Book ${b.book}`}>
                <div className="px-1 mb-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                      Book {b.book}
                      {b.current && !b.ended ? ' · now playing' : ''}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {b.ended === 'death' ? 'Hero fell' : b.ended ? 'Complete' : `${b.at} of ${b.total}`}
                    </span>
                  </div>
                  {b.title && <div className="text-sm font-semibold text-slate-100 truncate" style={{ fontFamily: 'var(--sk-font-heading)' }}>{b.title}</div>}
                  <ChapterBar book={b} className="mt-1.5" />
                </div>
                <ol className="space-y-0.5">
                  {b.chapters.map((c) => (
                    <ChapterRow
                      key={c.n}
                      c={c}
                      book={b}
                      selected={sel.book === b.book && sel.n === c.n}
                      onRead={() => {
                        setSel({ book: b.book, n: c.n });
                        setPhoneView('read');
                      }}
                    />
                  ))}
                </ol>
              </section>
            ))}
          </nav>

          <article className={`min-h-0 overflow-y-auto p-4 sm:p-5 bg-[#0A0A0F] ${phoneView === 'list' ? 'hidden md:block' : ''}`} aria-live="polite">
            <button type="button" onClick={() => setPhoneView('list')} className="md:hidden mb-3 flex items-center gap-1 text-xs text-slate-400 hover:text-slate-100">
              <ChevronLeft className="w-3.5 h-3.5" /> All chapters
            </button>
            {selChapter ? (
              <>
                <div className="text-center mb-4">
                  <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-slate-500">
                    Book {selBook.book} · Chapter {selChapter.n}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-100 mt-1" style={{ fontFamily: 'var(--sk-font-heading)' }}>
                    {selChapter.title ?? `Chapter ${selChapter.n}`}
                  </h3>
                  <div className="mx-auto mt-2 h-px w-24" style={{ background: 'var(--sk-accent)' }} />
                </div>
                {lines.length ? (
                  <div className="space-y-3">
                    {lines.map((l) => (
                      <ReaderLine key={l.id} log={l} />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 text-center">
                    {selChapter.status === 'locked' ? 'This chapter is still ahead of you.' : 'This save has no log for this chapter.'}
                  </p>
                )}
              </>
            ) : null}
          </article>
        </div>
      </div>
    </div>
  );
};

/** Where chapter and book dividers go in the story feed, keyed by log index. */
export interface StreamDivider {
  kicker: string;
  title: string | null;
  note?: string;
}

export function streamDividers(experience: TimelineSource): Record<number, StreamDivider> {
  const out: Record<number, StreamDivider> = {};
  for (const b of storyTimeline(experience)) {
    for (const c of b.chapters) {
      if (c.start === null) continue;
      const log = experience.logs[c.start];
      const m = log ? markerOf(log) : null;
      const raw = m && log.sender === 'system' ? log.text.replace(/^📖\s*/, '').replace(/^Book\s+\d+\s+begins\.\s*/i, '') : '';
      const note = raw && raw !== c.title && !raw.startsWith(`${c.title ?? '\u0000'}`) ? raw : undefined;
      out[c.start] = {
        kicker: c.n === 1 ? `Book ${b.book} · Chapter 1` : `Chapter ${c.n}${c.final ? ' · Finale' : ''}`,
        title: c.title,
        ...(note ? { note } : {})
      };
    }
  }
  return out;
}

export const StoryDivider: React.FC<{ d: StreamDivider }> = ({ d }) => (
  <div className="py-3 text-center select-none" role="separator" aria-label={`${d.kicker}${d.title ? `: ${d.title}` : ''}`} data-testid="story-divider">
    <div className="flex items-center gap-3">
      <span className="h-px flex-1 bg-gradient-to-r from-transparent to-white/20" />
      <span className="text-[10px] font-mono uppercase tracking-[0.25em]" style={{ color: 'var(--sk-accent)' }}>
        {d.kicker}
      </span>
      <span className="h-px flex-1 bg-gradient-to-l from-transparent to-white/20" />
    </div>
    {d.title && (
      <div className="mt-1 text-base sm:text-lg font-bold text-slate-100" style={{ fontFamily: 'var(--sk-font-heading)' }}>
        {d.title}
      </div>
    )}
    {d.note && <div className="mt-0.5 text-[11px] text-slate-400 italic">{d.note}</div>}
  </div>
);
