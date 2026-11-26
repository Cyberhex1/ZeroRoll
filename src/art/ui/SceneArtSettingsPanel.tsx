import { useEffect, useState } from 'react';
import { Brush } from 'lucide-react';
import { getActiveProvider, getProviderKey } from '../../lib/geminiService';
import {
  IMAGE_MODELS,
  SceneArtMode,
  getDailyCap,
  getSceneArtMode,
  getSceneArtModel,
  getUsableImageModels,
  pictureCostLabel,
  pictureSpendToday,
  refreshUsableImageModels,
  setDailyCap,
  setSceneArtMode,
  setSceneArtModel,
  subscribeSceneArtSettings
} from '../sceneArt';

const MODES: Array<{ id: SceneArtMode; label: string; detail: string }> = [
  { id: 'key', label: 'Key moments', detail: 'The opening, new places, chapter changes, twists, ambushes and the ending. At most one picture every 3 turns, except chapters and endings.' },
  { id: 'ask', label: 'Only when I ask', detail: 'A "Paint this scene" button under the newest reply.' },
  { id: 'off', label: 'Off', detail: 'No pictures and no button.' }
];

/** Settings for pictures painted during play. Saved as soon as they change. */
export function SceneArtSettingsPanel() {
  const [, setTick] = useState(0);
  const [checking, setChecking] = useState(false);
  const [checkNote, setCheckNote] = useState('');
  useEffect(() => subscribeSceneArtSettings(() => setTick((t) => t + 1)), []);

  const mode = getSceneArtMode();
  const usable = getUsableImageModels();
  const model = getSceneArtModel();
  const spend = pictureSpendToday();
  const isGemini = getActiveProvider() === 'gemini';

  const check = async () => {
    const key = getProviderKey('gemini');
    if (!key) {
      setCheckNote('Add a Gemini key first.');
      return;
    }
    setChecking(true);
    setCheckNote('');
    try {
      const r = await refreshUsableImageModels(key);
      setCheckNote(
        r.usable.length
          ? `${r.usable.length} image model${r.usable.length === 1 ? '' : 's'} answered.`
          : `None of this key's image models answered${r.failed.length ? ` (${r.failed.map((f) => `${f.model}: ${f.reason}`).join('; ')})` : ''}. Image models need a key with billing turned on.`
      );
    } catch (e) {
      setCheckNote(e instanceof Error ? e.message : String(e));
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="p-3 rounded bg-[#0A0A0F] border border-white/10 space-y-2" data-testid="scene-art-settings">
      <h3 className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider flex items-center gap-2">
        <Brush className="w-3.5 h-3.5 text-amber-400" />
        Scene art
      </h3>
      <p className="text-[11px] text-slate-400">
        Gemini paints a picture of the moment and shows it under the story text a few seconds later. Pictures use your Gemini key and cost money (Google has no free tier for them). They are kept on this device.
      </p>
      {!isGemini && <p className="text-[11px] text-amber-300">Scene art uses Google's image models, so it needs Gemini as the active provider.</p>}

      <fieldset className="space-y-1">
        <legend className="sr-only">When to paint</legend>
        {MODES.map((m) => (
          <label key={m.id} className="flex items-start gap-2 text-xs text-slate-300 cursor-pointer">
            <input type="radio" name="scene-art-mode" checked={mode === m.id} onChange={() => setSceneArtMode(m.id)} className="mt-0.5 accent-amber-500" />
            <span>
              <span className="font-semibold text-slate-200">{m.label}.</span> <span className="text-slate-400">{m.detail}</span>
            </span>
          </label>
        ))}
      </fieldset>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <label className="text-slate-400" htmlFor="scene-art-model">Image model</label>
        {usable && usable.length ? (
          <select
            id="scene-art-model"
            value={model ?? ''}
            onChange={(e) => setSceneArtModel(e.target.value)}
            className="w-full sm:w-auto max-w-full bg-[#111118] border border-white/10 rounded px-2 py-1 text-slate-200"
          >
            {IMAGE_MODELS.filter((m) => usable.includes(m.id)).map((m) => (
              <option key={m.id} value={m.id}>
                {m.label} · {pictureCostLabel(m.id)} · {m.note}
              </option>
            ))}
          </select>
        ) : (
          <span className="text-slate-500">{usable ? 'none usable with this key' : 'not checked yet'}</span>
        )}
        <button type="button" onClick={check} disabled={checking} className="rounded bg-white/5 px-2 py-1 text-[11px] text-slate-300 hover:bg-white/10 disabled:opacity-50">
          {checking ? 'Checking…' : 'Check image models'}
        </button>
      </div>
      {checkNote && <p className="text-[11px] text-slate-400">{checkNote}</p>}

      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
        <label htmlFor="scene-art-cap">Most pictures a day</label>
        <input
          id="scene-art-cap"
          type="number"
          min={1}
          max={200}
          value={getDailyCap()}
          onChange={(e) => setDailyCap(Number(e.target.value) || 1)}
          className="w-16 bg-[#111118] border border-white/10 rounded px-2 py-1 text-slate-200"
        />
        <span>
          Today: {spend.pictures} picture{spend.pictures === 1 ? '' : 's'}, about ${spend.dollars.toFixed(2)} (this browser).
        </span>
      </div>
    </div>
  );
}
