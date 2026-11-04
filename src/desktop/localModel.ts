/**
 * PC app only: picking a local model and remembering which one the basic tier uses.
 * The model runs in Ollama (installed by the player); the Rust side (src-tauri/src/ollama.rs)
 * checks Ollama, pulls models through it and forwards chats to it.
 */
import recommendations from './recommendations.json';
import { isTauri } from '../lib/platform';

export interface ModelPick {
  name: string;
  /** Ollama tag, e.g. "gemma3:12b" or "hf.co/<repo>:<quant>". */
  ollama: string;
  sizeGb: number;
  context: number;
  verified: boolean;
}

export interface Band {
  id: string;
  label: string;
  minVramGb: number;
  regular: ModelPick;
  uncensored: ModelPick;
}

export interface SystemInfo {
  os: string;
  arch: string;
  cpu_threads: number;
  ram_gb: number;
  gpus: Array<{ name: string; vendor: string; vram_gb: number }>;
  backend: 'cuda' | 'vulkan' | 'metal' | 'cpu';
  usable_vram_gb: number;
}

export interface OllamaStatus {
  running: boolean;
  version: string | null;
  models: string[];
}

export const BANDS: Band[] = (recommendations as { bands: Band[] }).bands;

/** The largest band the machine fits; on CPU only, the CPU band. */
export function bandFor(info: Pick<SystemInfo, 'usable_vram_gb' | 'backend'>): Band {
  if (info.backend === 'cpu') return BANDS[0];
  let best = BANDS[0];
  for (const b of BANDS) if (info.usable_vram_gb >= b.minVramGb) best = b;
  return best;
}

/** Uncensored picks are offered only when the player has Mature content turned on. */
export function picksFor(band: Band, mature: boolean): ModelPick[] {
  return mature ? [band.regular, band.uncensored] : [band.regular];
}

/** Ollama lists a pulled model as "<tag>" or "<tag>:latest"; library tags compare case-insensitively. */
export function isInstalled(tag: string, models: string[]): boolean {
  const want = tag.toLowerCase();
  return models.some((m) => {
    const have = m.toLowerCase();
    return have === want || have === `${want}:latest`;
  });
}

/* ------------------------------- local settings ------------------------------ */

const LOCAL_KEY = 'zeroroll_local_llm';

export interface LocalModelSettings {
  /** Use the local model for the basic tier. */
  enabled: boolean;
  /** Ollama tag of the chosen model. */
  model?: string;
  /** Display name of the chosen model. */
  modelName?: string;
  context?: number;
}

export function getLocalModelSettings(): LocalModelSettings {
  try {
    const raw = JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}');
    return { enabled: raw.enabled === true, model: typeof raw.model === 'string' ? raw.model : undefined, modelName: raw.modelName, context: raw.context };
  } catch (_) {
    return { enabled: false };
  }
}

export function saveLocalModelSettings(s: LocalModelSettings): void {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(s));
  } catch (_) {}
}

/** The local model for the router's basic tier, or null when it should not be used. */
export function localBasicTier(): { model: string; context: number } | null {
  if (!isTauri()) return null;
  const s = getLocalModelSettings();
  return s.enabled && s.model ? { model: s.model, context: s.context ?? 8192 } : null;
}
