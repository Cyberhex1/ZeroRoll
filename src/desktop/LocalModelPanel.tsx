import React, { useEffect, useRef, useState } from 'react';
import { Check, Cpu, Download, ExternalLink, RefreshCw, X } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { Band, ModelPick, OllamaStatus, SystemInfo, bandFor, getLocalModelSettings, isInstalled, picksFor, saveLocalModelSettings } from './localModel';
import { isMatureContentEnabled, setMatureContentEnabled } from '../lib/contentRating';
import { complete } from '../ai/router';

type Progress = { id: string; received: number; total: number | null; stage: string; status: string };

const gb = (bytes: number) => (bytes / 1_073_741_824).toFixed(1);

/**
 * PC app only (Settings). Checks the machine and Ollama, recommends a model for its VRAM,
 * pulls it through Ollama, and uses it for the basic tier (quick replies).
 */
export default function LocalModelPanel() {
  const [info, setInfo] = useState<SystemInfo | null>(null);
  const [band, setBand] = useState<Band | null>(null);
  const [ollama, setOllama] = useState<OllamaStatus | null>(null);
  const [mature, setMature] = useState(isMatureContentEnabled());
  const [settings, setSettings] = useState(getLocalModelSettings());
  const [progress, setProgress] = useState<Progress | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const activePull = useRef<string | null>(null);

  const update = (patch: Partial<typeof settings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveLocalModelSettings(next);
  };

  useEffect(() => {
    const un = listen<Progress>('download-progress', (e) => setProgress(e.payload));
    return () => {
      un.then((f) => f());
    };
  }, []);

  const run = async (label: string, fn: () => Promise<void>) => {
    setBusy(label);
    setNote(null);
    try {
      await fn();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setNote({ kind: 'error', text: msg === 'cancelled' ? 'Download paused. Press Download again to resume where it stopped.' : msg });
    } finally {
      setBusy(null);
      setProgress(null);
      activePull.current = null;
    }
  };

  const check = () =>
    run('check', async () => {
      const i = await invoke<SystemInfo>('system_check');
      setInfo(i);
      setBand(bandFor(i));
      let s = await invoke<OllamaStatus>('ollama_status');
      if (!s.running) {
        // Installed but not running: start it. Not installed: show the download link.
        s = await invoke<OllamaStatus>('ollama_start').catch(() => s);
      }
      setOllama(s);
    });

  const pull = (pick: ModelPick) =>
    run('pull', async () => {
      if (!isInstalled(pick.ollama, ollama?.models ?? [])) {
        activePull.current = pick.ollama;
        await invoke('ollama_pull', { id: pick.ollama, model: pick.ollama });
        setOllama(await invoke<OllamaStatus>('ollama_status'));
      }
      update({ model: pick.ollama, modelName: pick.name, context: pick.context, enabled: true });
      setNote({ kind: 'ok', text: `${pick.name} is ready. Quick replies (the basic tier) now use it. Press Test it to check.` });
    });

  const test = () =>
    run('test', async () => {
      const r = await complete([{ role: 'user', content: 'In one sentence, greet a new adventurer.' }], 'basic', { feature: 'Local model test', maxTokens: 120 });
      const local = r.attempts.length === 0 && r.provider === 'custom';
      setNote({
        kind: local ? 'ok' : 'error',
        text: local ? `${r.model} answered: ${r.text.trim().slice(0, 200)}` : `The local model did not answer (${r.attempts[0]?.message ?? 'not used'}), so ${r.model} did.`
      });
    });

  const btn = 'px-3 py-1.5 rounded text-[11px] font-semibold disabled:opacity-50 inline-flex items-center gap-1';

  return (
    <div className="p-3 rounded bg-[#0A0A0F] border border-white/10 space-y-2">
      <h3 className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider flex items-center gap-2">
        <Cpu className="w-3 h-3" /> Local model (PC app)
      </h3>
      <p className="text-[11px] text-slate-400">
        Run a model on this PC with Ollama for quick replies. It is free, private and works offline; story turns still use your chosen provider.
      </p>

      {!info ? (
        <button type="button" disabled={!!busy} onClick={check} className={`${btn} border border-amber-500/40 text-amber-300`}>
          {busy === 'check' ? 'Checking...' : 'Check this PC'}
        </button>
      ) : (
        <div className="text-[11px] text-slate-300 space-y-1">
          <div>
            {info.gpus.length ? info.gpus.map((g) => `${g.name}${g.vram_gb ? ` (${g.vram_gb.toFixed(1)} GB)` : ''}`).join(', ') : 'No dedicated GPU found'}
            {' · '}
            {info.ram_gb} GB RAM · {info.backend.toUpperCase()}
          </div>

          {!ollama?.running ? (
            <div className="space-y-1">
              <div className="text-amber-300">Ollama is not running on this PC. Install it, open it once, then check again.</div>
              <div className="flex gap-2">
                <button type="button" onClick={() => invoke('open_ollama_download')} className={`${btn} bg-amber-500 text-slate-950`}>
                  <ExternalLink className="w-3 h-3" />
                  Get Ollama
                </button>
                <button type="button" disabled={!!busy} onClick={check} className={`${btn} border border-white/10 text-slate-300`}>
                  <RefreshCw className="w-3 h-3" />
                  {busy === 'check' ? 'Checking...' : 'Check again'}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="text-emerald-300">Ollama {ollama.version ?? ''} is running.</div>
              {band && <div className="text-slate-400">Recommended for {band.label}:</div>}
              <label className="flex items-center gap-2 text-[11px] text-slate-400">
                <input
                  type="checkbox"
                  checked={mature}
                  onChange={(e) => {
                    setMature(e.target.checked);
                    setMatureContentEnabled(e.target.checked);
                  }}
                />
                Mature content (also offer an uncensored model)
              </label>
              {band &&
                picksFor(band, mature).map((p) => {
                  const installed = isInstalled(p.ollama, ollama.models);
                  const inUse = settings.model === p.ollama;
                  return (
                    <div key={p.ollama} className="flex flex-wrap items-center justify-between gap-2 bg-black/30 rounded px-2 py-1.5">
                      <span>
                        {p.name}{' '}
                        <span className="text-slate-500">
                          · {installed ? 'downloaded' : `${p.sizeGb} GB download`}
                          {p.verified ? '' : ' · not yet tested by us'}
                        </span>
                      </span>
                      <button
                        type="button"
                        disabled={!!busy || (inUse && installed)}
                        onClick={() => pull(p)}
                        className={`${btn} ${inUse && installed ? 'border border-emerald-500/40 text-emerald-300' : 'bg-amber-500 text-slate-950'}`}
                      >
                        {inUse && installed ? <Check className="w-3 h-3" /> : <Download className="w-3 h-3" />}
                        {inUse && installed ? 'In use' : installed ? 'Use this' : 'Download'}
                      </button>
                    </div>
                  );
                })}
            </>
          )}
        </div>
      )}

      {progress && (
        <div className="text-[11px] text-slate-300 flex items-center gap-2">
          <span>
            {progress.stage === 'verifying'
              ? 'Checking the download...'
              : progress.total
                ? `Downloading ${gb(progress.received)} of ${gb(progress.total)} GB`
                : progress.status || 'Starting the download...'}
          </span>
          {activePull.current && progress.stage === 'downloading' && (
            <button type="button" onClick={() => invoke('cancel_pull', { id: activePull.current })} className={`${btn} border border-white/10 text-slate-300`}>
              <X className="w-3 h-3" />
              Pause
            </button>
          )}
        </div>
      )}

      {settings.model && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-slate-300">Model: {settings.modelName ?? settings.model}</span>
          <button type="button" disabled={!!busy} onClick={test} className={`${btn} border border-white/10 text-slate-300`}>
            {busy === 'test' ? 'Asking...' : 'Test it'}
          </button>
          <label className="flex items-center gap-1 text-[11px] text-slate-400">
            <input type="checkbox" checked={settings.enabled} onChange={(e) => update({ enabled: e.target.checked })} />
            Use for quick replies
          </label>
          <label className="flex items-center gap-1 text-[11px] text-slate-400" title="Story and D&D turns go to the local model first; your AI provider answers only if it fails.">
            <input type="checkbox" checked={settings.allTurns === true} disabled={!settings.enabled} onChange={(e) => update({ allTurns: e.target.checked })} />
            Use for every turn
          </label>
        </div>
      )}

      {note && <p role="status" className={`text-[11px] ${note.kind === 'error' ? 'text-red-300' : 'text-emerald-300'}`}>{note.text}</p>}
    </div>
  );
}
