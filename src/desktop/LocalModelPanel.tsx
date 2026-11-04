import React, { useEffect, useRef, useState } from 'react';
import { Cpu, Download, Play, Square, X } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import {
  Band,
  LlamaStatus,
  ModelPick,
  SystemInfo,
  bandFor,
  getLocalModelSettings,
  picksFor,
  resolveHfFile,
  resolveLlamaBuild,
  saveLocalModelSettings
} from './localModel';
import { isMatureContentEnabled, setMatureContentEnabled } from '../lib/contentRating';
import { complete } from '../ai/router';

type Progress = { id: string; received: number; total: number | null; stage: string };

const gb = (bytes: number) => (bytes / 1_073_741_824).toFixed(1);

/**
 * PC app only (Settings). Checks the machine, recommends a model for its VRAM, downloads
 * llama-server and the model with checksum verification, and runs it for the basic tier.
 */
export default function LocalModelPanel() {
  const [info, setInfo] = useState<SystemInfo | null>(null);
  const [band, setBand] = useState<Band | null>(null);
  const [mature, setMature] = useState(isMatureContentEnabled());
  const [settings, setSettings] = useState(getLocalModelSettings());
  const [status, setStatus] = useState<LlamaStatus | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const activeDownload = useRef<string | null>(null);

  const update = (patch: Partial<typeof settings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveLocalModelSettings(next);
  };

  useEffect(() => {
    const un = listen<Progress>('download-progress', (e) => setProgress(e.payload));
    invoke<LlamaStatus>('llama_status').then(setStatus).catch(() => {});
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
      setNote({ kind: 'error', text: msg === 'cancelled' ? 'Download paused. Start it again to resume where it stopped.' : msg });
    } finally {
      setBusy(null);
      setProgress(null);
      activeDownload.current = null;
    }
  };

  const checkSystem = () =>
    run('check', async () => {
      const i = await invoke<SystemInfo>('system_check');
      setInfo(i);
      setBand(bandFor(i));
    });

  const download = async (id: string, url: string, dest: string, sha256: string) => {
    activeDownload.current = id;
    return invoke<string>('download_file', { id, url, dest, sha256 });
  };

  const install = (pick: ModelPick) =>
    run('install', async () => {
      if (!info) throw new Error('Check this PC first.');
      const exe = info.os === 'windows' ? 'llama-server.exe' : 'llama-server';
      const serverPath = `llama/bin/${exe}`;
      if (!(await invoke<boolean>('file_exists', { path: serverPath }))) {
        for (const f of await resolveLlamaBuild(info)) {
          await download(`llama:${f.name}`, f.url, `llama/${f.name}`, f.sha256);
          await invoke('extract_zip', { zip: `llama/${f.name}`, dest: 'llama/bin' });
        }
        if (!(await invoke<boolean>('file_exists', { path: serverPath }))) {
          throw new Error('The llama.cpp download did not contain llama-server.');
        }
      }
      const modelPath = `models/${pick.file}`;
      if (!(await invoke<boolean>('file_exists', { path: modelPath }))) {
        const f = await resolveHfFile(pick.repo, pick.file);
        await download(`model:${pick.file}`, f.url, modelPath, f.sha256);
      }
      update({ serverPath, modelPath, modelName: pick.file, context: pick.context });
      setNote({ kind: 'ok', text: `${pick.name} is installed and checked. Start it below.` });
    });

  const start = () =>
    run('start', async () => {
      if (!settings.serverPath || !settings.modelPath) throw new Error('Install a model first.');
      const s = await invoke<LlamaStatus>('start_llama', { server: settings.serverPath, model: settings.modelPath, context: settings.context ?? 8192 });
      setStatus(s);
      update({ baseUrl: s.base_url ?? undefined, enabled: true });
      setNote({ kind: 'ok', text: `Running at ${s.base_url}. Quick replies (the basic tier) now use it.` });
    });

  const stop = () =>
    run('stop', async () => {
      setStatus(await invoke<LlamaStatus>('stop_llama'));
      update({ baseUrl: undefined });
    });

  const test = () =>
    run('test', async () => {
      const r = await complete([{ role: 'user', content: 'In one sentence, greet a new adventurer.' }], 'basic', { feature: 'Local model test', maxTokens: 120 });
      setNote({ kind: 'ok', text: `${r.model} answered: ${r.text.trim().slice(0, 200)}` });
    });

  const btn = 'px-3 py-1.5 rounded text-[11px] font-semibold disabled:opacity-50 inline-flex items-center gap-1';

  return (
    <div className="p-3 rounded bg-[#0A0A0F] border border-white/10 space-y-2">
      <h3 className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider flex items-center gap-2">
        <Cpu className="w-3 h-3" /> Local model (PC app)
      </h3>
      <p className="text-[11px] text-slate-400">Run a model on this PC for quick replies. It is free, private and works offline; story turns still use your chosen provider.</p>

      {!info ? (
        <button type="button" disabled={!!busy} onClick={checkSystem} className={`${btn} border border-amber-500/40 text-amber-300`}>
          {busy === 'check' ? 'Checking...' : 'Check this PC'}
        </button>
      ) : (
        <div className="text-[11px] text-slate-300 space-y-1">
          <div>
            {info.gpus.length ? info.gpus.map((g) => `${g.name}${g.vram_gb ? ` (${g.vram_gb.toFixed(1)} GB)` : ''}`).join(', ') : 'No dedicated GPU found'}
            {' · '}{info.ram_gb} GB RAM · runs on {info.backend.toUpperCase()}
          </div>
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
          {band && picksFor(band, mature).map((p) => (
            <div key={p.file} className="flex flex-wrap items-center justify-between gap-2 bg-black/30 rounded px-2 py-1.5">
              <span>
                {p.name} <span className="text-slate-500">· {p.sizeGb} GB download{p.verified ? '' : ' · not yet tested by us'}</span>
              </span>
              <button type="button" disabled={!!busy} onClick={() => install(p)} className={`${btn} bg-amber-500 text-slate-950`}>
                <Download className="w-3 h-3" />{settings.modelName === p.file ? 'Installed' : 'Download'}
              </button>
            </div>
          ))}
        </div>
      )}

      {progress && (
        <div className="text-[11px] text-slate-300 flex items-center gap-2">
          <span>
            {progress.stage === 'verifying' ? 'Checking the file...' : `Downloading ${gb(progress.received)}${progress.total ? ` of ${gb(progress.total)}` : ''} GB`}
          </span>
          {activeDownload.current && progress.stage === 'downloading' && (
            <button type="button" onClick={() => invoke('cancel_download', { id: activeDownload.current })} className={`${btn} border border-white/10 text-slate-300`}>
              <X className="w-3 h-3" />Pause
            </button>
          )}
        </div>
      )}

      {settings.modelPath && (
        <div className="flex flex-wrap items-center gap-2">
          {status?.running ? (
            <>
              <span className="text-[11px] text-emerald-300">Running {status.model}</span>
              <button type="button" disabled={!!busy} onClick={test} className={`${btn} border border-white/10 text-slate-300`}>{busy === 'test' ? 'Asking...' : 'Test it'}</button>
              <button type="button" disabled={!!busy} onClick={stop} className={`${btn} border border-white/10 text-slate-300`}><Square className="w-3 h-3" />Stop</button>
            </>
          ) : (
            <button type="button" disabled={!!busy} onClick={start} className={`${btn} bg-emerald-500 text-slate-950`}>
              <Play className="w-3 h-3" />{busy === 'start' ? 'Loading the model...' : `Start ${settings.modelName}`}
            </button>
          )}
          <label className="flex items-center gap-1 text-[11px] text-slate-400">
            <input type="checkbox" checked={settings.enabled} onChange={(e) => update({ enabled: e.target.checked })} />
            Use for quick replies
          </label>
        </div>
      )}

      {note && <p role="status" className={`text-[11px] ${note.kind === 'error' ? 'text-red-300' : 'text-emerald-300'}`}>{note.text}</p>}
    </div>
  );
}
