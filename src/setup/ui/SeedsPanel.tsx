import { Dices, Lightbulb, Sparkles } from 'lucide-react';
import { clickable } from '../../components/ui/a11y';
import type { Opener, OpenerDraw } from '../../content';

interface Props {
  categoryName: string;
  seeds: string[];
  openers: OpenerDraw[];
  openerTotal: number;
  aiOn: boolean;
  locked: boolean;
  onSeed: (seed: string) => void;
  onOpener: (opener: Opener) => void;
  onShowOthers: () => void;
}

export function SeedsPanel({ categoryName, seeds, openers, openerTotal, aiOn, locked, onSeed, onOpener, onShowOthers }: Props) {
  const item = 'rounded bg-black/40 border border-white/5 transition focus:outline-none focus:ring-2 focus:ring-amber-500';
  const live = locked ? 'opacity-50 pointer-events-none' : 'cursor-pointer hover:border-amber-400/50 hover:bg-amber-500/10';
  return (
    <div className="space-y-5" aria-busy={locked}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 rounded bg-amber-950/20 border border-amber-600/30 text-xs text-amber-200">
        <div className="space-y-0.5">
          <div className="font-bold flex items-center gap-1.5 text-amber-300">
            <Lightbulb className="w-3.5 h-3.5" aria-hidden="true" />
            {categoryName} story seeds and openers
          </div>
          <p className="text-[11px] text-amber-200/80">
            {aiOn
              ? 'A story seed rolls a new story built from it. An opener keeps its hand-written start and the AI builds the rest around it.'
              : 'The AI is off: a seed becomes your story as written, and an opener is used as it is.'}
          </p>
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            Story seeds
          </h4>
          <span className="text-[10px] text-slate-500 font-mono">{aiOn ? 'Click to roll a story from it' : 'Click to use it as your story'}</span>
        </div>
        <div className="flex flex-col gap-1.5">
          {seeds.map((seed, idx) => (
            <div key={idx} className={`${item} ${live} text-[11px] px-3 py-2 text-slate-300 font-mono hover:text-amber-300`} {...clickable(() => onSeed(seed))}>
              {seed}
            </div>
          ))}
        </div>
      </div>

      <div className="pt-2 border-t border-white/5">
        <div className="flex items-center justify-between mb-2.5">
          <div className="space-y-0.5">
            <h4 className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
              <Dices className="w-3.5 h-3.5" aria-hidden="true" />
              Ready-to-play openers
            </h4>
            <p className="text-[10px] text-slate-400">
              A hero, a premise, three first moves and starting gear. {openerTotal} in this category.
            </p>
          </div>
          <button
            type="button"
            onClick={onShowOthers}
            disabled={locked}
            className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[11px] font-mono font-bold flex items-center gap-1.5 transition disabled:opacity-50"
            title="Show openers you have not seen yet"
          >
            <Dices className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Show others</span>
          </button>
        </div>
        <div className="space-y-2.5">
          {openers.map(({ opener, padded }, idx) => (
            <div key={opener.id || idx} {...clickable(() => onOpener(opener))} className={`${item} ${live} p-3.5 rounded-lg text-xs space-y-2 group`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-amber-300 font-bold font-serif text-sm group-hover:text-amber-200 transition">{opener.title}</div>
                  <div className="text-amber-200/70 text-[11px] italic mt-0.5">"{opener.tagline}"</div>
                  {padded && <div className="text-[10px] font-mono text-slate-500 mt-0.5">Quick start from the built-in generator</div>}
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 shrink-0">{opener.hero.role}</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">{opener.premise}</p>
              {opener.actions.some(Boolean) && (
                <div className="text-[10px] text-slate-400 flex flex-wrap gap-1.5 pt-1">
                  {opener.actions.filter(Boolean).map((act, aIdx) => (
                    <span key={aIdx} className="bg-white/5 px-2 py-0.5 rounded text-slate-300">▸ {act}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
