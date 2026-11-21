import { Camera, RefreshCw, UserRound } from 'lucide-react';
import { Portrait } from '../../components/ui/Portrait';
import { FIELD_LIMITS } from '../normalize';
import type { HeroPart } from '../storyRoll';
import type { PronounChoice, SetupDraft } from '../types';

const PRONOUNS: Array<{ id: PronounChoice; label: string }> = [
  { id: 'she/her', label: 'She / Her' },
  { id: 'he/him', label: 'He / Him' },
  { id: 'they/them', label: 'They / Them' },
  { id: 'custom', label: 'Custom…' }
];

interface Props {
  draft: SetupDraft;
  pronounChoice: PronounChoice;
  customPronouns: string;
  onPronouns: (choice: PronounChoice) => void;
  onCustomPronouns: (text: string) => void;
  onType: (field: 'name' | 'roleClass' | 'origin' | 'appearance', value: string) => void;
  onRoll: (part: Exclude<HeroPart, 'title'>) => void;
  rolling: HeroPart | null;
  locked: boolean;
  errors: Record<string, string>;
  portrait: { drawing: boolean; error: string | null; off: boolean; onDraw: () => void; onAllow: () => void };
}

function RollButton({ label, spinning, disabled, onClick, title }: { label: string; spinning: boolean; disabled: boolean; onClick: () => void; title: string }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} title={title} className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-mono disabled:opacity-50">
      <RefreshCw className={`w-2.5 h-2.5 ${spinning ? 'animate-spin' : ''}`} aria-hidden="true" />
      {label}
    </button>
  );
}

const inputCls = 'w-full bg-[#111118] border border-white/10 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-600/50 font-medium disabled:opacity-60';
const labelCls = 'block text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold';

export function HeroCard({ draft, pronounChoice, customPronouns, onPronouns, onCustomPronouns, onType, onRoll, rolling, locked, errors, portrait }: Props) {
  const field = (key: 'name' | 'roleClass' | 'origin', label: string, part: 'name' | 'roleClass' | 'origin', rollLabel: string, rollTitle: string, max: number, error?: string) => (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label htmlFor={`setup-${key}`} className={labelCls}>{label}</label>
        <RollButton label={rollLabel} spinning={rolling === part} disabled={locked} onClick={() => onRoll(part)} title={rollTitle} />
      </div>
      <input id={`setup-${key}`} type="text" value={draft.hero[key]} maxLength={max} disabled={locked} onChange={(e) => onType(key, e.target.value)} className={inputCls} aria-invalid={!!error} />
      {error && <p className="text-[10px] text-red-300 mt-0.5">{error}</p>}
    </div>
  );

  return (
    <section aria-labelledby="setup-hero-h" className="rounded-lg bg-[#0A0A0F] border border-white/10 p-3 sm:p-3.5 space-y-3">
      <div className="flex items-center gap-2">
        <UserRound className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
        <h3 id="setup-hero-h" className="text-[10px] uppercase tracking-[0.2em] text-amber-400 font-bold font-mono">Hero</h3>
      </div>

      <fieldset className="space-y-1.5" disabled={locked}>
        <legend className={labelCls}>Pronouns</legend>
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {PRONOUNS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              aria-pressed={pronounChoice === opt.id}
              onClick={() => onPronouns(opt.id)}
              className={`px-2.5 py-1 rounded text-xs font-mono font-semibold transition border disabled:opacity-60 ${
                pronounChoice === opt.id ? 'bg-amber-600/30 text-amber-300 border-amber-500 font-bold' : 'bg-[#111118] text-slate-400 border-white/10 hover:text-slate-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
          {pronounChoice === 'custom' && (
            <input
              type="text"
              value={customPronouns}
              onChange={(e) => onCustomPronouns(e.target.value)}
              maxLength={FIELD_LIMITS.pronouns}
              placeholder="e.g. she/they, ze/zir"
              aria-label="Custom pronouns"
              className="flex-1 min-w-[140px] bg-[#111118] border border-amber-500/50 rounded px-2.5 py-1 text-xs text-amber-200 focus:outline-none font-mono"
            />
          )}
        </div>
        {errors.pronouns && <p className="text-[10px] text-red-300">{errors.pronouns}</p>}
      </fieldset>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {field('name', 'Name', 'name', 'Roll Name', 'A new name that fits your pronouns and this story', FIELD_LIMITS.heroName, errors.name)}
        {field('roleClass', 'Class', 'roleClass', 'Roll Class', 'A new class for this story, with a hero sheet to match', FIELD_LIMITS.roleClass, errors.role)}
        {field('origin', 'Origin', 'origin', 'Roll Origin', 'A new origin and looks that fit this story', FIELD_LIMITS.raceOrigin, errors.origin)}
      </div>

      <div className="flex items-start gap-3">
        <Portrait value={draft.portrait} name={draft.hero.name || 'Hero'} loading={portrait.drawing} className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl border-2 border-amber-500/60 shadow-lg shrink-0 text-2xl" />
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center justify-between">
            <label htmlFor="setup-appearance" className={labelCls}>Looks</label>
            <button type="button" disabled={locked} onClick={portrait.onDraw} className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-mono disabled:opacity-50">
              <Camera className="w-3 h-3" aria-hidden="true" />
              {draft.portrait ? 'Redraw portrait' : 'Draw portrait'}
            </button>
          </div>
          <textarea
            id="setup-appearance"
            rows={2}
            value={draft.hero.appearance}
            onChange={(e) => onType('appearance', e.target.value)}
            maxLength={FIELD_LIMITS.description}
            disabled={locked}
            placeholder="Build, face, and what they wear or carry."
            className="w-full bg-[#111118] border border-white/10 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-600/50 resize-none font-sans disabled:opacity-60"
          />
          {portrait.error && <p className="text-[10px] text-red-300 font-mono">{portrait.error}</p>}
          {portrait.off && (
            <button type="button" className="text-[10px] underline text-amber-300" onClick={portrait.onAllow}>
              Allow free portraits from pollinations.ai (sends only the looks text) and draw one
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
