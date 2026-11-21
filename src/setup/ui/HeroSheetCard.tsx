import { useState } from 'react';
import { Minus, Plus, ScrollText, X } from 'lucide-react';
import { ABILITIES, RULES_MODES, RulesMode, SKILLS, abilityMod, combatStats, fmtMod } from '../../dnd/rules';
import { guessType } from '../../dnd/applyTurn';
import { uid } from '../../lib/ids';
import { POINT_BUY_BUDGET, canLower, canRaise, lower, pointsLeft, raise } from '../pointBuy';
import { FIELD_LIMITS, MAX_GEAR, MAX_SPELLS, SKILL_PICKS } from '../normalize';
import type { HeroSheetDraft, SetupDraft } from '../types';

interface Props {
  draft: SetupDraft;
  rulesMode: RulesMode;
  onRulesMode: (m: RulesMode) => void;
  onChange: (sheet: HeroSheetDraft) => void;
  onReset: () => void;
  locked: boolean;
}

const ABILITY_NAMES: Record<string, string> = { str: 'Strength', dex: 'Dexterity', con: 'Constitution', int: 'Intelligence', wis: 'Wisdom', cha: 'Charisma' };
const chip = 'px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-slate-300';
const smallBtn = 'w-6 h-6 rounded border border-white/15 text-slate-200 flex items-center justify-center hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed';
const sameSheet = (a: HeroSheetDraft, b: HeroSheetDraft) => JSON.stringify(a) === JSON.stringify(b);

export function HeroSheetCard({ draft, rulesMode, onRulesMode, onChange, onReset, locked }: Props) {
  const [editing, setEditing] = useState(false);
  const [newGear, setNewGear] = useState('');
  const [newSpell, setNewSpell] = useState('');
  const sheet = draft.sheet;
  const { maxHp, armorClass } = combatStats(draft.hero.roleClass || 'Adventurer', sheet.stats);
  const full5e = rulesMode === 'full5e';
  const left = pointsLeft(sheet.stats);
  const edit = editing && !locked;

  const toggleSkill = (skill: string) => {
    const has = sheet.skills.includes(skill);
    if (!has && sheet.skills.length >= SKILL_PICKS) return;
    onChange({ ...sheet, skills: has ? sheet.skills.filter((s) => s !== skill) : [...sheet.skills, skill] });
  };
  const addGear = () => {
    const name = newGear.trim().slice(0, FIELD_LIMITS.gearName);
    if (!name || sheet.gear.length >= MAX_GEAR) return;
    onChange({ ...sheet, gear: [...sheet.gear, { id: `item_${uid()}`, name, type: guessType(name), quantity: 1, isEquipped: false }] });
    setNewGear('');
  };
  const addSpell = () => {
    const name = newSpell.trim().slice(0, FIELD_LIMITS.spell);
    if (!name || sheet.spells.length >= MAX_SPELLS || sheet.spells.includes(name)) return;
    onChange({ ...sheet, spells: [...sheet.spells, name] });
    setNewSpell('');
  };

  return (
    <section aria-labelledby="setup-sheet-h" className="rounded-lg bg-[#0A0A0F] border border-white/10 p-3 sm:p-3.5 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ScrollText className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
          <h3 id="setup-sheet-h" className="text-[10px] uppercase tracking-[0.2em] text-amber-400 font-bold font-mono">Hero sheet</h3>
          <span className="text-[10px] text-slate-500">· level 1 {draft.hero.roleClass || 'hero'}</span>
        </div>
        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          disabled={locked}
          aria-expanded={edit}
          className="px-2 py-1 rounded border border-amber-500/40 text-amber-300 text-[10px] font-mono font-bold hover:bg-amber-500/10 disabled:opacity-50"
        >
          {edit ? 'Done' : 'Edit'}
        </button>
      </div>

      <fieldset className="space-y-1" disabled={locked}>
        <legend className="text-[10px] uppercase tracking-wider text-slate-500 font-mono font-bold">Rules</legend>
        <div className="flex flex-wrap gap-2 pt-1">
          {(Object.keys(RULES_MODES) as RulesMode[]).map((m) => (
            <label key={m} className={`flex items-start gap-1.5 rounded border px-2 py-1 cursor-pointer ${rulesMode === m ? 'border-amber-500/70 bg-amber-500/10' : 'border-white/10'}`}>
              <input type="radio" name="rules-mode" value={m} checked={rulesMode === m} onChange={() => onRulesMode(m)} className="mt-0.5 accent-amber-500" />
              <span>
                <span className="block text-[11px] font-semibold text-slate-200">{RULES_MODES[m].name}</span>
                <span className="block text-[10px] text-slate-400">{RULES_MODES[m].blurb}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-mono">
        <span className="text-amber-400 font-bold">HP {maxHp}</span>
        {full5e && <span className="text-amber-400 font-bold">AC {armorClass}</span>}
        {edit && (
          <span className={left < 0 ? 'text-red-300' : left === 0 ? 'text-emerald-300' : 'text-sky-200'} aria-live="polite">
            {left} of {POINT_BUY_BUDGET} points left
          </span>
        )}
        <span className="text-slate-500">HP{full5e ? ' and AC' : ''} follow your class and scores.</span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
        {ABILITIES.map((a) => (
          <div key={a} className="rounded border border-white/10 bg-white/5 px-1.5 py-1.5 text-center">
            <div className="text-[9px] uppercase tracking-wider text-slate-500 font-bold" title={ABILITY_NAMES[a]}>{a}</div>
            <div className="text-sm font-bold text-slate-100 leading-tight">{sheet.stats[a]}</div>
            <div className="text-[10px] text-slate-400 font-mono">{fmtMod(abilityMod(sheet.stats[a]))}</div>
            {edit && (
              <div className="flex items-center justify-center gap-1 pt-1">
                <button type="button" className={smallBtn} disabled={!canLower(sheet.stats, a)} onClick={() => onChange({ ...sheet, stats: lower(sheet.stats, a) })} aria-label={`Lower ${ABILITY_NAMES[a]}`}>
                  <Minus className="w-3 h-3" aria-hidden="true" />
                </button>
                <button type="button" className={smallBtn} disabled={!canRaise(sheet.stats, a)} onClick={() => onChange({ ...sheet, stats: raise(sheet.stats, a) })} aria-label={`Raise ${ABILITY_NAMES[a]}`}>
                  <Plus className="w-3 h-3" aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      {edit && <p className="text-[10px] text-slate-500">5e point buy: each score from 8 to 15, {POINT_BUY_BUDGET} points in all. Higher scores cost more (14 costs 7, 15 costs 9).</p>}

      {full5e && (
        <div className="space-y-1">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-mono font-bold">
            Trained skills {edit && <span className="normal-case tracking-normal font-normal">({sheet.skills.length} of {SKILL_PICKS} picked; ★ fits your story)</span>}
          </div>
          {edit ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
              {Object.keys(SKILLS).map((k) => {
                const on = sheet.skills.includes(k);
                const full = !on && sheet.skills.length >= SKILL_PICKS;
                return (
                  <label key={k} className={`flex items-center gap-1.5 text-[11px] rounded px-1.5 py-1 border ${on ? 'border-amber-500/60 bg-amber-500/10 text-amber-100' : 'border-white/5 text-slate-300'} ${full ? 'opacity-40' : 'cursor-pointer'}`}>
                    <input type="checkbox" checked={on} disabled={full} onChange={() => toggleSkill(k)} className="accent-amber-500" />
                    <span className="capitalize">{k}</span>
                    <span className="text-slate-500 uppercase text-[9px]">{SKILLS[k]}</span>
                    {draft.storySheet.skills.includes(k) && <span className="text-amber-400" aria-label="fits your story">★</span>}
                  </label>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {sheet.skills.map((s) => (
                <span key={s} className={`${chip} capitalize`}>{s}</span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="space-y-1">
        <div className="text-[10px] uppercase tracking-wider text-slate-500 font-mono font-bold">Gear {edit && <span className="normal-case tracking-normal font-normal">(up to {MAX_GEAR})</span>}</div>
        {edit ? (
          <ul className="space-y-1">
            {sheet.gear.map((g, i) => (
              <li key={g.id} className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={g.name}
                  maxLength={FIELD_LIMITS.gearName}
                  aria-label={`Gear item ${i + 1}`}
                  onChange={(e) => onChange({ ...sheet, gear: sheet.gear.map((x) => (x.id === g.id ? { ...x, name: e.target.value } : x)) })}
                  className="flex-1 min-w-0 bg-[#111118] border border-white/10 rounded px-2 py-1 text-[11px] text-slate-200 focus:outline-none focus:border-amber-600/50"
                />
                <button type="button" className={smallBtn} onClick={() => onChange({ ...sheet, gear: sheet.gear.filter((x) => x.id !== g.id) })} aria-label={`Remove ${g.name}`}>
                  <X className="w-3 h-3" aria-hidden="true" />
                </button>
              </li>
            ))}
            {sheet.gear.length < MAX_GEAR && (
              <li className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={newGear}
                  maxLength={FIELD_LIMITS.gearName}
                  placeholder="Add an item"
                  aria-label="New gear item"
                  onChange={(e) => setNewGear(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addGear())}
                  className="flex-1 min-w-0 bg-[#111118] border border-dashed border-white/15 rounded px-2 py-1 text-[11px] text-slate-200 focus:outline-none focus:border-amber-600/50"
                />
                <button type="button" className={smallBtn} onClick={addGear} disabled={!newGear.trim()} aria-label="Add item">
                  <Plus className="w-3 h-3" aria-hidden="true" />
                </button>
              </li>
            )}
          </ul>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {sheet.gear.length ? sheet.gear.map((g) => <span key={g.id} className={chip}>{g.name}{g.quantity > 1 ? ` ×${g.quantity}` : ''}</span>) : <span className="text-[10px] text-slate-500">None yet. The category's starter kit is used.</span>}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="text-[10px] uppercase tracking-wider text-slate-500 font-mono font-bold">Spells and abilities {edit && <span className="normal-case tracking-normal font-normal">(up to {MAX_SPELLS})</span>}</div>
        {edit ? (
          <div className="flex flex-wrap items-center gap-1.5">
            {sheet.spells.map((sp) => (
              <span key={sp} className="pl-2 pr-1 py-0.5 rounded bg-blue-950/60 border border-blue-800/40 text-[10px] font-mono text-blue-300 flex items-center gap-1">
                {sp}
                <button type="button" onClick={() => onChange({ ...sheet, spells: sheet.spells.filter((x) => x !== sp) })} aria-label={`Remove ${sp}`} className="hover:text-white">
                  <X className="w-3 h-3" aria-hidden="true" />
                </button>
              </span>
            ))}
            {sheet.spells.length < MAX_SPELLS && (
              <span className="flex items-center gap-1">
                <input
                  type="text"
                  value={newSpell}
                  maxLength={FIELD_LIMITS.spell}
                  placeholder="Add a spell"
                  aria-label="New spell or ability"
                  onChange={(e) => setNewSpell(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSpell())}
                  className="w-32 bg-[#111118] border border-dashed border-white/15 rounded px-2 py-0.5 text-[11px] text-slate-200 focus:outline-none focus:border-amber-600/50"
                />
                <button type="button" className={smallBtn} onClick={addSpell} disabled={!newSpell.trim()} aria-label="Add spell">
                  <Plus className="w-3 h-3" aria-hidden="true" />
                </button>
              </span>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {sheet.spells.length ? sheet.spells.map((sp) => <span key={sp} className="px-2 py-0.5 rounded bg-blue-950/60 border border-blue-800/40 text-[10px] font-mono text-blue-300">⚡ {sp}</span>) : <span className="text-[10px] text-slate-500">None</span>}
          </div>
        )}
      </div>

      {edit && !sameSheet(sheet, draft.storySheet) && (
        <div className="flex justify-end">
          <button type="button" onClick={onReset} className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/15 border border-white/15 text-slate-200 text-[10px] font-mono uppercase tracking-wider">
            Reset to the story's sheet
          </button>
        </div>
      )}
    </section>
  );
}
