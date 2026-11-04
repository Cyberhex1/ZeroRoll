/**
 * PC app only: picking, downloading and running a local model with llama-server.
 * The Rust side (src-tauri) does the system check, downloads and process; this file
 * decides what to download and remembers what is installed.
 */
import recommendations from './recommendations.json';
import { isTauri } from '../lib/platform';

export interface ModelPick {
  name: string;
  repo: string;
  file: string;
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

export interface LlamaStatus {
  running: boolean;
  port: number | null;
  base_url: string | null;
  model: string | null;
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

/* ------------------------------ download sources ----------------------------- */

export interface ResolvedFile {
  url: string;
  sha256: string;
  name: string;
  sizeBytes?: number;
}

/** Hugging Face lists the SHA-256 of every LFS file; we check the download against it. */
export async function resolveHfFile(repo: string, file: string, fetcher: typeof fetch = fetch): Promise<ResolvedFile> {
  const res = await fetcher(`https://huggingface.co/api/models/${repo}/tree/main`);
  if (!res.ok) throw new Error(`Hugging Face did not list ${repo} (HTTP ${res.status}).`);
  const entries = (await res.json()) as Array<{ path: string; size?: number; lfs?: { oid?: string; size?: number } }>;
  const entry = entries.find((e) => e.path === file);
  if (!entry) throw new Error(`${file} is no longer in ${repo}. The recommendation list needs updating.`);
  const sha = entry.lfs?.oid;
  if (!sha || !/^[a-f0-9]{64}$/i.test(sha)) throw new Error(`Hugging Face gave no checksum for ${file}, so it was not downloaded.`);
  return { url: `https://huggingface.co/${repo}/resolve/main/${encodeURIComponent(file)}`, sha256: sha, name: file, sizeBytes: entry.lfs?.size ?? entry.size };
}

/** Asset-name patterns for llama.cpp release builds, best first. */
export function llamaAssetPatterns(os: string, arch: string, backend: SystemInfo['backend']): RegExp[] {
  if (os === 'windows') {
    const cpu = /bin-win-cpu-x64\.zip$/;
    if (backend === 'cuda') return [/bin-win-cuda-12\.\d+-x64\.zip$/, /bin-win-vulkan-x64\.zip$/, cpu];
    if (backend === 'vulkan') return [/bin-win-vulkan-x64\.zip$/, cpu];
    return [cpu];
  }
  if (os === 'macos') return [arch === 'aarch64' ? /bin-macos-arm64\.zip$/ : /bin-macos-x64\.zip$/];
  // Linux: llama.cpp ships Vulkan and CPU builds; CUDA cards use Vulkan.
  return backend === 'cpu' ? [/bin-ubuntu-x64\.zip$/] : [/bin-ubuntu-vulkan-x64\.zip$/, /bin-ubuntu-x64\.zip$/];
}

type GhAsset = { name: string; browser_download_url: string; digest?: string; size?: number };
type GhRelease = { tag_name: string; body?: string; draft?: boolean; assets: GhAsset[] };

const LLAMA_API = 'https://api.github.com/repos/ggml-org/llama.cpp/releases';

/** The files to download from one release for this machine, or null if it has no build for it. */
function pickLlamaAssets(release: GhRelease, info: SystemInfo): ResolvedFile[] | null {
  const toFile = (a: GhAsset): ResolvedFile => {
    const sha = (a.digest || '').replace(/^sha256:/, '');
    if (!/^[a-f0-9]{64}$/i.test(sha)) throw new Error(`GitHub gave no checksum for ${a.name}, so it was not downloaded.`);
    return { url: a.browser_download_url, sha256: sha, name: a.name, sizeBytes: a.size };
  };
  for (const re of llamaAssetPatterns(info.os, info.arch, info.backend)) {
    const asset = release.assets.find((a) => re.test(a.name));
    if (!asset) continue;
    const files = [toFile(asset)];
    // CUDA builds on Windows need the matching CUDA runtime DLLs beside the binary.
    const cuda = asset.name.match(/cuda-(12\.\d+)-x64/);
    if (cuda) {
      const rt = release.assets.find((a) => a.name === `cudart-llama-bin-win-cuda-${cuda[1]}-x64.zip`);
      if (rt) files.push(toFile(rt));
    }
    return files;
  }
  return null;
}

/**
 * The newest llama.cpp build for this machine, with GitHub's SHA-256 of it.
 * llama.cpp's "latest" release can be a versioned release (v0.8.0) that only points at a
 * nightly build (b11960) where the binaries live, and the nightlies are prereleases that
 * /releases/latest skips. So: try latest, then the nightly it names, then the recent list.
 */
export async function resolveLlamaBuild(info: SystemInfo, fetcher: typeof fetch = fetch): Promise<ResolvedFile[]> {
  const get = async <T,>(url: string): Promise<T> => {
    const res = await fetcher(url);
    if (!res.ok) throw new Error(`Could not read llama.cpp releases from GitHub (HTTP ${res.status}).`);
    return (await res.json()) as T;
  };
  const tried: string[] = [];
  const latest = await get<GhRelease>(`${LLAMA_API}/latest`);
  tried.push(latest.tag_name);
  const fromLatest = pickLlamaAssets(latest, info);
  if (fromLatest) return fromLatest;

  const nightly = latest.body?.match(/\[(b\d+)\]\(https:\/\/github\.com\/ggml-org\/llama\.cpp\/releases\/tag\/b\d+\)/)?.[1];
  if (nightly && !tried.includes(nightly)) {
    const r = await get<GhRelease>(`${LLAMA_API}/tags/${nightly}`).catch(() => null);
    if (r) {
      tried.push(r.tag_name);
      const files = pickLlamaAssets(r, info);
      if (files) return files;
    }
  }

  const recent = await get<GhRelease[]>(`${LLAMA_API}?per_page=10`);
  for (const r of recent) {
    if (r.draft || tried.includes(r.tag_name)) continue;
    tried.push(r.tag_name);
    const files = pickLlamaAssets(r, info);
    if (files) return files;
  }
  throw new Error(`llama.cpp has no ${info.os} ${info.arch} (${info.backend}) build in its recent releases (checked ${tried.slice(0, 4).join(', ')}).`);
}

/* ------------------------------- local settings ------------------------------ */

const LOCAL_KEY = 'zeroroll_local_llm';

export interface LocalModelSettings {
  /** Use the local model for the basic tier when it is running. */
  enabled: boolean;
  /** Paths inside the app data folder. */
  serverPath?: string;
  modelPath?: string;
  modelName?: string;
  context?: number;
  /** Set while llama-server is running, e.g. http://127.0.0.1:51234/v1 */
  baseUrl?: string;
}

export function getLocalModelSettings(): LocalModelSettings {
  try {
    return { enabled: false, ...JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}') };
  } catch (_) {
    return { enabled: false };
  }
}

export function saveLocalModelSettings(s: LocalModelSettings): void {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(s));
  } catch (_) {}
}

/** The local endpoint for the router's basic tier, or null when it should not be used. */
export function localBasicTier(): { baseUrl: string; model: string } | null {
  if (!isTauri()) return null;
  const s = getLocalModelSettings();
  return s.enabled && s.baseUrl && s.modelName ? { baseUrl: s.baseUrl, model: s.modelName } : null;
}
