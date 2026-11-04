import { useMemo, useState } from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { useDialog } from '../../components/ui/useDialog';
import type { PreparedPackage } from '../importPackage';
import { flagPrompt, promptPreview } from '../share';

/**
 * Review before install: a shared story is a prompt written by someone else, so the player
 * reads all of it (every word the narrator can be sent) and picks what to add. Stories
 * with flagged lines start unticked.
 */
export default function ImportReview({ prepared, onCancel, onConfirm }: { prepared: PreparedPackage[]; onCancel: () => void; onConfirm: (chosen: PreparedPackage[]) => void }) {
  const dialog = useDialog(onCancel, { labelledBy: 'import-review-title' });
  const items = useMemo(
    () =>
      prepared.map((p) => {
        if (!p.story) return { p, sections: [], flags: [] };
        const sections = promptPreview(p.story);
        return { p, sections, flags: flagPrompt(sections) };
      }),
    [prepared]
  );
  const [chosen, setChosen] = useState<Set<number>>(() => new Set(items.flatMap((it, i) => (it.p.story && !it.flags.length ? [i] : []))));
  const toggle = (i: number) =>
    setChosen((s) => {
      const n = new Set(s);
      if (n.has(i)) n.delete(i);
      else n.add(i);
      return n;
    });

  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-end sm:items-center justify-center p-0 sm:p-4" {...dialog.overlayProps}>
      <div className="bg-[#111118] border border-white/10 rounded-t-2xl sm:rounded-xl max-w-2xl w-full p-4 sm:p-6 space-y-4 max-h-[92dvh] overflow-y-auto text-slate-200" {...dialog.dialogProps}>
        <h2 id="import-review-title" className="text-base font-semibold">Read before adding</h2>
        <p className="text-xs text-slate-400">
          A story is a set of instructions for the AI. Below is everything each story can send to the narrator. Add only stories you trust. Lines that look like they try to change the
          app's own rules are marked; nothing has been removed or changed.
        </p>
        <ul className="space-y-3">
          {items.map(({ p, sections, flags }, i) => (
            <li key={i} className="rounded-lg border border-white/10 p-3 space-y-2">
              {p.story ? (
                <>
                  <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                    <input type="checkbox" checked={chosen.has(i)} onChange={() => toggle(i)} className="accent-amber-500" />
                    {p.story.meta.title}
                    <span className="text-[10px] font-normal text-slate-400">
                      {p.story.meta.id} · {p.story.meta.rating}
                    </span>
                  </label>
                  {flags.length ? (
                    <div className="text-xs text-amber-300 space-y-1">
                      <p className="flex items-center gap-1 font-semibold">
                        <AlertTriangle className="w-3.5 h-3.5" /> {flags.length} line{flags.length === 1 ? '' : 's'} to check
                      </p>
                      <ul className="list-disc pl-5 space-y-0.5">
                        {flags.slice(0, 12).map((f, j) => (
                          <li key={j}>
                            <span className="text-slate-400">{f.section}:</span> “{f.line}” <span className="text-slate-400">({f.why})</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-xs text-emerald-300 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Nothing unusual found. Still worth a read.
                    </p>
                  )}
                  <details className="text-xs">
                    <summary className="cursor-pointer text-slate-300">Show the full prompt ({sections.length} parts)</summary>
                    {sections.map((s, j) => (
                      <div key={j} className="mt-2">
                        <p className="font-semibold text-slate-300">{s.title}</p>
                        <pre className="whitespace-pre-wrap text-[11px] text-slate-400 bg-black/40 rounded p-2 mt-1">{s.text}</pre>
                      </div>
                    ))}
                  </details>
                </>
              ) : (
                <div className="text-xs">
                  <p className="font-semibold text-red-300">{p.result.title ? `"${p.result.title}"` : p.result.dir} cannot be added</p>
                  <pre className="whitespace-pre-wrap text-[11px] text-slate-400 mt-1">{p.result.report}</pre>
                </div>
              )}
            </li>
          ))}
        </ul>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="text-xs px-3 py-1.5 rounded border border-white/10 text-slate-300 hover:bg-white/5">
            Cancel
          </button>
          <button
            type="button"
            disabled={!chosen.size}
            onClick={() => onConfirm(items.filter((_, i) => chosen.has(i)).map((it) => it.p))}
            className="text-xs px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-black font-semibold disabled:opacity-50"
          >
            Add {chosen.size} stor{chosen.size === 1 ? 'y' : 'ies'}
          </button>
        </div>
      </div>
    </div>
  );
}
