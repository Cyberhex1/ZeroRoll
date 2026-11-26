import { useEffect, useRef, useState } from 'react';
import { BookOpen, Pencil, RefreshCw } from 'lucide-react';
import { InfoTip } from './InfoTip';
import { FIELD_LIMITS } from '../normalize';
import { shapeById } from '../storyShape';
import type { SetupDraft } from '../types';

const SOURCE_LABEL = (d: SetupDraft): string =>
  d.storySource === 'player' ? 'Your story' : d.storySource === 'ai' ? (d.seed ? 'Written by the AI from your seed' : 'Written by the AI') : d.builtIn ? 'Hand-written opener' : 'Opener, built out by the AI';

export const STORY_EDIT_INFO_AI =
  'Editing your story rewrites everything that depends on it to fit what you wrote: class, origin, looks, hero sheet, gear and opening moves, and the title unless you typed one. Your words, your name and your pronouns stay the same.';
export const STORY_EDIT_INFO_OFF =
  'The AI is off, so saving changes only your words. Your hero and hero sheet stay as they are, and you can keep them or change them yourself.';

interface Props {
  draft: SetupDraft;
  aiOn: boolean;
  /** Any call is running; every control waits. */
  locked: boolean;
  rollingTitle: boolean;
  onRollTitle: () => void;
  onSave: (edit: { title: string; premise: string }) => void;
  onRebuild: () => void;
  onKeepAsIs: () => void;
  onEditingChange: (editing: boolean) => void;
}

export function StoryCard({ draft, aiOn, locked, rollingTitle, onRollTitle, onSave, onRebuild, onKeepAsIs, onEditingChange }: Props) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(draft.title);
  const [premise, setPremise] = useState(draft.premise);

  const premiseRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => onEditingChange(editing), [editing, onEditingChange]);
  useEffect(() => {
    if (editing) premiseRef.current?.focus({ preventScroll: false });
  }, [editing]);

  const startEdit = () => {
    setTitle(draft.title);
    setPremise(draft.premise);
    setEditing(true);
  };
  const save = () => {
    if (!premise.trim()) return;
    setEditing(false);
    onSave({ title, premise });
  };

  const o = draft.outline;
  const start = o?.startingCircumstances && o.startingCircumstances.trim() !== draft.premise.trim() ? o.startingCircumstances : '';
  const goal = o?.immediateGoal || '';
  const joinAt = shapeById(o?.storyShape)?.label;
  const feel = draft.inspiration.style || '';
  // What steers the telling: the seed, and the 1 to 3 seed-list titles the AI picked as tone references (never to copy).
  const steering = [
    ...draft.inspiration.tropes.filter((t) => t !== draft.seed).map((t) => ({ kind: 'Seed', text: t })),
    ...draft.inspiration.media.map((m) => ({ kind: 'Tone', text: m }))
  ];

  return (
    <section aria-labelledby="setup-story-h" className="rounded-lg bg-[#0A0A0F] border border-amber-500/25 p-3 sm:p-3.5 space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <BookOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" aria-hidden="true" />
          <h3 id="setup-story-h" className="text-[10px] uppercase tracking-[0.2em] text-amber-400 font-bold font-mono">Story</h3>
          <span className="text-[10px] text-slate-500 truncate">· {SOURCE_LABEL(draft)}</span>
        </div>
        {!editing && (
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={startEdit}
              disabled={locked}
              className="px-2 py-1 rounded border border-amber-500/40 text-amber-300 text-[10px] font-mono font-bold flex items-center gap-1 hover:bg-amber-500/10 disabled:opacity-50"
            >
              <Pencil className="w-3 h-3" aria-hidden="true" />
              Edit
            </button>
            <InfoTip text={aiOn ? STORY_EDIT_INFO_AI : STORY_EDIT_INFO_OFF} label="What editing the story does" />
          </div>
        )}
      </div>

      {editing ? (
        <div className="space-y-2">
          <label className="block">
            <span className="block text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold mb-1">Title</span>
            <input
              type="text"
              value={title}
              maxLength={FIELD_LIMITS.title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#111118] border border-white/10 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-600/50"
            />
          </label>
          <label className="block">
            <span className="block text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold mb-1">Your story</span>
            <textarea
              rows={5}
              value={premise}
              maxLength={FIELD_LIMITS.premise}
              onChange={(e) => setPremise(e.target.value)}
              ref={premiseRef}
              className="w-full bg-[#111118] border border-white/10 rounded p-2.5 text-xs text-slate-200 leading-relaxed focus:outline-none focus:border-amber-600/50 resize-y font-sans"
              placeholder="Where you are, what just went wrong, and the choice in front of you."
            />
          </label>
          <p className="text-[10px] text-slate-400">{aiOn ? STORY_EDIT_INFO_AI : STORY_EDIT_INFO_OFF}</p>
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" onClick={() => setEditing(false)} className="px-3 py-1.5 rounded text-xs text-slate-400 hover:bg-white/5">
              Cancel
            </button>
            <button
              type="button"
              onClick={save}
              disabled={!premise.trim()}
              className="px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-black text-xs font-bold disabled:opacity-50"
            >
              {aiOn && premise.trim() !== draft.premise.trim() ? 'Save and rebuild the rest' : 'Save'}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm sm:text-base font-serif font-bold text-amber-50 leading-snug">{draft.title}</p>
            <button
              type="button"
              onClick={onRollTitle}
              disabled={locked}
              title="A new title for this story"
              className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-mono disabled:opacity-50 shrink-0 pt-0.5"
            >
              <RefreshCw className={`w-3 h-3 ${rollingTitle ? 'animate-spin' : ''}`} aria-hidden="true" />
              Roll Title
            </button>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">{draft.premise}</p>
          {(start || goal || joinAt || feel) && (
            <dl className="grid gap-1.5 text-[11px]">
              {joinAt && (
                <div>
                  <dt className="inline text-slate-500 font-semibold">Where you join: </dt>
                  <dd className="inline text-slate-300">{joinAt}</dd>
                </div>
              )}
              {start && (
                <div>
                  <dt className="inline text-slate-500 font-semibold">Where you start: </dt>
                  <dd className="inline text-slate-300">{start}</dd>
                </div>
              )}
              {goal && (
                <div>
                  <dt className="inline text-slate-500 font-semibold">Your first goal: </dt>
                  <dd className="inline text-slate-300">{goal}</dd>
                </div>
              )}
              {feel && (
                <div>
                  <dt className="inline text-slate-500 font-semibold">Voice and feel: </dt>
                  <dd className="inline text-slate-300">{feel}</dd>
                </div>
              )}
            </dl>
          )}
          {draft.seed && (
            <p className="text-[11px] text-amber-200/90">
              <span className="text-slate-500 font-semibold">Built from your seed: </span>
              {draft.seed}
            </p>
          )}
          {steering.length > 0 && (
            <details className="text-[11px] group">
              <summary className="cursor-pointer text-slate-500 hover:text-slate-300 select-none">Tone references for this story (never copied)</summary>
              <ul className="mt-1.5 flex flex-wrap gap-1.5">
                {steering.map((s, i) => (
                  <li key={i} className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
                    <span className="text-slate-500">{s.kind}: </span>
                    {s.text}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </>
      )}

      {draft.stale && !editing && (
        <div role="status" className="rounded border border-sky-700/50 bg-sky-950/40 p-2.5 text-[11px] text-sky-100 space-y-2">
          <p>Your hero and hero sheet were made for the old story. {aiOn ? 'Rebuild them to fit yours, or keep them as they are.' : 'The AI is off, so they were not rebuilt. Keep them, or change them yourself.'}</p>
          <div className="flex flex-wrap gap-2">
            {aiOn && (
              <button type="button" onClick={onRebuild} disabled={locked} className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-black font-bold text-[10px] font-mono uppercase tracking-wider disabled:opacity-50">
                Rebuild to fit my story
              </button>
            )}
            <button type="button" onClick={onKeepAsIs} disabled={locked} className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/15 border border-white/15 text-slate-200 text-[10px] font-mono uppercase tracking-wider disabled:opacity-50">
              Keep as is
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
