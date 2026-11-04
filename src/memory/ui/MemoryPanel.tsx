import { useState } from 'react';
import { Check, Pin, PinOff, Plus, Trash2, X } from 'lucide-react';
import { MemoryState, acceptPending, addEntry, deleteEntry, dismissPending, editEntry, needsMerge, setSummary, togglePin } from '../memoryStore';
import type { PromptMeter } from '../promptBuilder';

interface Props {
  memory: MemoryState;
  meter: PromptMeter;
  turn: number;
  onChange: (memory: MemoryState) => void;
  /** Runs the merge pass; resolves to an error message, or null when it worked. */
  onMerge?: () => Promise<string | null>;
  /** Styles for skinned screens; plain slate by default. */
  tone?: { border: string; muted: string; accent: string };
}

const SOURCE_LABEL = { manual: 'yours', auto: 'from the story', beat: 'story beat', state: 'game state' } as const;

/**
 * The memory list for one story or campaign: what the model is always told, the summary
 * of older turns, facts waiting for the player's OK, and how much of the context each
 * part uses.
 */
export default function MemoryPanel({ memory, meter, turn, onChange, onMerge, tone }: Props) {
  const t = tone ?? { border: 'rgb(51 65 85)', muted: 'rgb(148 163 184)', accent: 'rgb(245 158 11)' };
  const [draft, setDraft] = useState('');
  const [editing, setEditing] = useState<{ id: string; text: string } | null>(null);
  const [summaryDraft, setSummaryDraft] = useState<string | null>(null);
  const [merging, setMerging] = useState(false);
  const [mergeNote, setMergeNote] = useState<string | null>(null);

  const pct = (n: number) => `${Math.min(100, (n / Math.max(1, meter.budget)) * 100)}%`;
  const box = { borderColor: t.border } as const;
  const iconBtn = 'p-1 rounded hover:opacity-80 focus:outline-none focus:ring-1';

  const merge = async () => {
    if (!onMerge) return;
    setMerging(true);
    setMergeNote(null);
    const err = await onMerge();
    setMerging(false);
    setMergeNote(err ?? 'Merged.');
  };

  return (
    <section aria-label="Memory" className="space-y-4 text-sm">
      <div className="space-y-1">
        <div className="flex justify-between text-xs" style={{ color: t.muted }}>
          <span>Context used</span>
          <span>{meter.used.toLocaleString()} / {meter.budget.toLocaleString()} tokens (estimate)</span>
        </div>
        <div className="h-2 w-full rounded overflow-hidden flex" style={{ background: 'color-mix(in srgb, currentColor 10%, transparent)' }} role="img" aria-label={`System ${meter.parts.system}, memory ${meter.parts.memory}, summary ${meter.parts.summary}, recent turns ${meter.parts.turns} tokens`}>
          <span style={{ width: pct(meter.parts.system), background: '#64748b' }} />
          <span style={{ width: pct(meter.parts.memory), background: t.accent }} />
          <span style={{ width: pct(meter.parts.summary), background: '#38bdf8' }} />
          <span style={{ width: pct(meter.parts.turns), background: '#a78bfa' }} />
        </div>
        <p className="text-[11px]" style={{ color: t.muted }}>
          Grey is the story setup, gold is memory, blue is the summary, purple is recent turns.
          {meter.droppedTurns > 0 && ` ${meter.droppedTurns} older turn${meter.droppedTurns === 1 ? ' is' : 's are'} left to the summary.`}
          {meter.droppedMemories > 0 && ` ${meter.droppedMemories} unpinned memor${meter.droppedMemories === 1 ? 'y does' : 'ies do'} not fit; pin the ones that matter.`}
        </p>
      </div>

      {memory.pending.length > 0 && (
        <div className="space-y-1">
          <h3 className="text-xs font-semibold">Suggested to remember</h3>
          <ul className="space-y-1">
            {memory.pending.map((p) => (
              <li key={p.id} className="flex items-start gap-2 rounded border px-2 py-1" style={box}>
                <span className="flex-1">{p.text}</span>
                <button type="button" className={iconBtn} aria-label={`Remember: ${p.text}`} onClick={() => onChange(acceptPending(memory, p.id))}><Check className="w-3.5 h-3.5" /></button>
                <button type="button" className={iconBtn} aria-label={`Dismiss: ${p.text}`} onClick={() => onChange(dismissPending(memory, p.id))}><X className="w-3.5 h-3.5" /></button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-1">
        <h3 className="text-xs font-semibold">Remembered ({memory.entries.length})</h3>
        {!memory.entries.length && <p className="text-xs" style={{ color: t.muted }}>Nothing yet. Add a fact the story must keep, such as a name or a promise.</p>}
        <ul className="space-y-1">
          {memory.entries.map((e) => (
            <li key={e.id} className="flex items-start gap-2 rounded border px-2 py-1" style={box}>
              {editing?.id === e.id ? (
                <form
                  className="flex-1 flex gap-1"
                  onSubmit={(ev) => {
                    ev.preventDefault();
                    onChange(editEntry(memory, e.id, editing.text));
                    setEditing(null);
                  }}
                >
                  <label htmlFor={`mem-${e.id}`} className="sr-only">Edit memory</label>
                  <input id={`mem-${e.id}`} autoFocus value={editing.text} onChange={(ev) => setEditing({ id: e.id, text: ev.target.value })} onKeyDown={(ev) => ev.key === 'Escape' && setEditing(null)} className="flex-1 rounded border bg-transparent px-1" style={box} maxLength={400} />
                  <button type="submit" className={iconBtn} aria-label="Save memory"><Check className="w-3.5 h-3.5" /></button>
                </form>
              ) : (
                <button type="button" className="flex-1 text-left" onClick={() => setEditing({ id: e.id, text: e.text })} aria-label={`Edit: ${e.text}`}>
                  {e.text}
                  <span className="ml-2 text-[10px] uppercase tracking-wide" style={{ color: t.muted }}>{SOURCE_LABEL[e.source]}</span>
                </button>
              )}
              <button type="button" className={iconBtn} aria-pressed={e.pinned} aria-label={e.pinned ? `Unpin: ${e.text}` : `Pin: ${e.text}`} onClick={() => onChange(togglePin(memory, e.id))} style={e.pinned ? { color: t.accent } : undefined}>
                {e.pinned ? <Pin className="w-3.5 h-3.5" /> : <PinOff className="w-3.5 h-3.5" />}
              </button>
              <button type="button" className={iconBtn} aria-label={`Delete: ${e.text}`} onClick={() => onChange(deleteEntry(memory, e.id))}><Trash2 className="w-3.5 h-3.5" /></button>
            </li>
          ))}
        </ul>
        <form
          className="flex gap-1 pt-1"
          onSubmit={(ev) => {
            ev.preventDefault();
            if (!draft.trim()) return;
            onChange(addEntry(memory, draft, turn, 'manual', true));
            setDraft('');
          }}
        >
          <label htmlFor="mem-new" className="sr-only">New memory</label>
          <input id="mem-new" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Add something to remember" maxLength={400} className="flex-1 rounded border bg-transparent px-2 py-1 text-xs" style={box} />
          <button type="submit" disabled={!draft.trim()} className="rounded border px-2 text-xs inline-flex items-center gap-1 disabled:opacity-40" style={box}><Plus className="w-3 h-3" />Add</button>
        </form>
        {needsMerge(memory) && onMerge && (
          <div className="flex items-center gap-2 text-xs pt-1" style={{ color: t.muted }}>
            <span>The list is long. Merging combines duplicates; pinned entries stay as they are.</span>
            <button type="button" disabled={merging} onClick={merge} className="rounded border px-2 py-0.5 disabled:opacity-40" style={box}>{merging ? 'Merging…' : 'Merge'}</button>
          </div>
        )}
        {mergeNote && <p role="status" className="text-xs" style={{ color: t.muted }}>{mergeNote}</p>}
      </div>

      <div className="space-y-1">
        <h3 className="text-xs font-semibold">Story so far</h3>
        {summaryDraft === null ? (
          <>
            <p className="text-xs whitespace-pre-wrap" style={{ color: memory.summary ? undefined : t.muted }}>
              {memory.summary || 'The summary starts once older turns leave the recent window (about 22 turns in).'}
            </p>
            <button type="button" className="text-xs underline" style={{ color: t.muted }} onClick={() => setSummaryDraft(memory.summary)}>Edit summary</button>
          </>
        ) : (
          <form
            className="space-y-1"
            onSubmit={(e) => {
              e.preventDefault();
              onChange(setSummary(memory, summaryDraft));
              setSummaryDraft(null);
            }}
          >
            <label htmlFor="mem-summary" className="sr-only">Summary</label>
            <textarea id="mem-summary" value={summaryDraft} onChange={(e) => setSummaryDraft(e.target.value)} rows={8} className="w-full rounded border bg-transparent px-2 py-1 text-xs" style={box} />
            <div className="flex gap-2">
              <button type="submit" className="rounded border px-2 py-0.5 text-xs" style={box}>Save summary</button>
              <button type="button" className="text-xs underline" onClick={() => setSummaryDraft(null)}>Cancel</button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
