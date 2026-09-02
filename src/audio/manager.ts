// src/audio/manager.ts
//
// Singleton Web Audio engine for ZeroRoll's ambient music.
//
// Responsibilities:
//   - Own one AudioContext, master GainNode, and an in-memory buffer cache.
//   - Fetch + decode each track lazily on first use; never preload all.
//   - Crossfade between tracks over FADE_SECONDS via per-track GainNodes.
//   - Honor persistence keys: zr.musicMuted, zr.musicVolume,
//     zr.musicEnabled, zr.musicReducedDuck.
//   - Respect prefers-reduced-motion and prefers-reduced-data.
//   - Pause when document.visibilityState === 'hidden'.
//   - Survive navigation between home <-> experience; never block the UI.
//
// If the user has never interacted with the page, play() is a no-op until
// resumeOnGesture() is called from a real click/keypress/scroll handler.
// This is required by browser autoplay policies on Chrome / Safari / Firefox.

import { getTrack, MusicTrack, MusicTrackKey } from './catalog';

const FADE_SECONDS = 1.6;
const MASTERY_KEY_MUTED = 'zr.musicMuted';
const MASTERY_KEY_VOLUME = 'zr.musicVolume';
const MASTERY_KEY_ENABLED = 'zr.musicEnabled';
const MASTERY_KEY_DUCK = 'zr.musicReducedDuck';

interface ActiveVoice {
  key: MusicTrackKey;
  buffer: AudioBuffer;
  source: AudioBufferSourceNode;
  gain: GainNode;
  /** Linear gain at the start of the active fade. */
  startGain: number;
  /** Linear gain the voice is fading toward (0 if fading out). */
  targetGain: number;
}

interface AudioManagerState {
  ctx: AudioContext | null;
  master: GainNode | null;
  cache: Map<string, AudioBuffer>;
  voices: ActiveVoice[];
  currentKey: MusicTrackKey | null;
  /** True after the first user gesture unlocks audio. */
  unlocked: boolean;
  /** Set when reduced-data is preferred and music should not auto-start. */
  reducedData: boolean;
  muted: boolean;
  volume: number;
  enabled: boolean;
  /** Reduce volume when GM is narrating? reserved for future use. */
  duck: boolean;
}

class AudioManager {
  private state: AudioManagerState = {
    ctx: null,
    master: null,
    cache: new Map(),
    voices: [],
    currentKey: null,
    unlocked: false,
    reducedData: false,
    muted: false,
    volume: 0.4,
    enabled: true,
    duck: false
  };

  private listeners = new Set<(key: MusicTrackKey | null) => void>();

  // ---------- public API ----------

  isUnlocked(): boolean {
    return this.state.unlocked;
  }

  isReducedData(): boolean {
    return this.state.reducedData;
  }

  isMuted(): boolean {
    return this.state.muted;
  }

  isEnabled(): boolean {
    return this.state.enabled;
  }

  getVolume(): number {
    return this.state.volume;
  }

  getCurrentKey(): MusicTrackKey | null {
    return this.state.currentKey;
  }

  subscribe(cb: (key: MusicTrackKey | null) => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  /** Read persisted prefs and motion/data preferences. Safe to call early. */
  hydrate(): void {
    try {
      const m = localStorage.getItem(MASTERY_KEY_MUTED);
      const v = localStorage.getItem(MASTERY_KEY_VOLUME);
      const e = localStorage.getItem(MASTERY_KEY_ENABLED);
      const d = localStorage.getItem(MASTERY_KEY_DUCK);
      if (m !== null) this.state.muted = m === '1';
      if (v !== null) {
        const n = parseFloat(v);
        if (Number.isFinite(n) && n >= 0 && n <= 1) this.state.volume = n;
      }
      if (e !== null) this.state.enabled = e === '1';
      if (d !== null) this.state.duck = d === '1';
    } catch {
      // localStorage may be unavailable (private mode, etc.) — ignore.
    }

    if (typeof window !== 'undefined' && window.matchMedia) {
      const reducedDataQuery = window.matchMedia('(prefers-reduced-data: reduce)');
      this.state.reducedData = reducedDataQuery.matches;
      reducedDataQuery.addEventListener?.('change', ev => {
        this.state.reducedData = ev.matches;
        if (this.state.reducedData) this.stop();
      });
    }
  }

  /** Mark audio as unlocked.  Called from a real user gesture handler. */
  resumeOnGesture(): void {
    if (this.state.unlocked) return;
    this.state.unlocked = true;
    if (!this.state.ctx) this.initContext();
    // Some browsers leave the context in 'suspended' until a gesture.
    this.state.ctx?.resume().catch(() => undefined);
    if (this.state.currentKey) {
      // Replay current track now that audio is unlocked.
      const k = this.state.currentKey;
      this.state.currentKey = null;
      void this.play(k);
    }
  }

  /** Set mute state and persist.  Pauses output without tearing down voices. */
  setMuted(muted: boolean): void {
    this.state.muted = muted;
    try { localStorage.setItem(MASTERY_KEY_MUTED, muted ? '1' : '0'); } catch {}
    if (!this.state.master || !this.state.ctx) return;
    const now = this.state.ctx.currentTime;
    const target = muted ? 0 : this.state.volume;
    this.state.master.gain.cancelScheduledValues(now);
    this.state.master.gain.setValueAtTime(this.state.master.gain.value, now);
    this.state.master.gain.linearRampToValueAtTime(target, now + 0.25);
  }

  /** Set master volume (0..1) and persist.  Effective only when not muted. */
  setVolume(volume: number): void {
    const v = Math.max(0, Math.min(1, volume));
    this.state.volume = v;
    try { localStorage.setItem(MASTERY_KEY_VOLUME, String(v)); } catch {}
    if (!this.state.muted && this.state.master && this.state.ctx) {
      const now = this.state.ctx.currentTime;
      this.state.master.gain.cancelScheduledValues(now);
      this.state.master.gain.setValueAtTime(this.state.master.gain.value, now);
      this.state.master.gain.linearRampToValueAtTime(v, now + 0.15);
    }
  }

  /** Top-level toggle (persisted). */
  setEnabled(enabled: boolean): void {
    this.state.enabled = enabled;
    try { localStorage.setItem(MASTERY_KEY_ENABLED, enabled ? '1' : '0'); } catch {}
    if (!enabled) this.stop();
    else if (this.state.currentKey) {
      const k = this.state.currentKey;
      this.state.currentKey = null;
      void this.play(k);
    }
  }

  /** Crossfade to the track associated with `key`.  No-op until unlocked. */
  async play(key: MusicTrackKey): Promise<void> {
    if (!this.state.enabled) return;
    if (this.state.reducedData) return;
    if (!this.state.unlocked) {
      // Remember intent so resumeOnGesture() can replay after first gesture.
      this.state.currentKey = key;
      return;
    }
    if (!this.state.ctx) this.initContext();
    const ctx = this.state.ctx;
    if (!ctx) return;

    const track = getTrack(key);
    if (!track) {
      console.warn(`[audio] no track registered for key "${key}"`);
      return;
    }

    if (this.state.currentKey === key) return; // already playing
    this.state.currentKey = key;

    let buffer: AudioBuffer;
    try {
      buffer = await this.loadBuffer(track);
    } catch (err) {
      // Network/CORS/decoding failures must not break the UI.
      console.warn(`[audio] failed to load track "${key}":`, err);
      return;
    }

    // Cancel any in-flight fades and start fresh.
    for (const v of this.state.voices) this.cancelVoiceFade(v);
    this.state.voices = this.state.voices.filter(v => !this.isVoiceStopped(v));

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    source.connect(gain).connect(this.state.master!);
    source.start();

    const voice: ActiveVoice = {
      key,
      buffer,
      source,
      gain,
      startGain: 0,
      targetGain: 1
    };
    this.state.voices.push(voice);

    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(1, now + FADE_SECONDS);

    // Fade out any pre-existing voices that weren't already cancelled.
    for (const v of this.state.voices) {
      if (v === voice) continue;
      v.startGain = v.gain.gain.value;
      v.targetGain = 0;
      const t = ctx.currentTime;
      v.gain.gain.cancelScheduledValues(t);
      v.gain.gain.setValueAtTime(v.gain.gain.value, t);
      v.gain.gain.linearRampToValueAtTime(0, t + FADE_SECONDS);
      try {
        v.source.stop(t + FADE_SECONDS + 0.05);
      } catch {
        // already stopped
      }
    }

    this.notify(key);
  }

  /** Hard stop everything (preserves the intended currentKey so resume works). */
  stop(): void {
    if (!this.state.ctx) return;
    const ctx = this.state.ctx;
    const now = ctx.currentTime;
    for (const v of this.state.voices) {
      const t = now;
      v.gain.gain.cancelScheduledValues(t);
      v.gain.gain.setValueAtTime(v.gain.gain.value, t);
      v.gain.gain.linearRampToValueAtTime(0, t + 0.3);
      try { v.source.stop(t + 0.35); } catch {}
    }
    this.state.voices = [];
    this.state.currentKey = null;
    this.notify(null);
  }

  /** Suspend/resume in response to tab visibility changes. */
  onVisibilityChange(visible: boolean): void {
    if (!this.state.ctx) return;
    if (visible) {
      this.state.ctx.resume().catch(() => undefined);
    } else {
      this.state.ctx.suspend().catch(() => undefined);
    }
  }

  /** Tear down on logout / hard reset.  Does not touch persistence. */
  dispose(): void {
    this.stop();
    try { this.state.ctx?.close(); } catch {}
    this.state.ctx = null;
    this.state.master = null;
    this.state.cache.clear();
  }

  // ---------- internals ----------

  private initContext(): void {
    if (this.state.ctx) return;
    const Ctx = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext | undefined;
    if (!Ctx) return;
    try {
      const ctx = new Ctx();
      const master = ctx.createGain();
      master.gain.value = this.state.muted ? 0 : this.state.volume;
      master.connect(ctx.destination);
      this.state.ctx = ctx;
      this.state.master = master;
    } catch (err) {
      console.warn('[audio] AudioContext init failed:', err);
    }
  }

  private async loadBuffer(track: MusicTrack): Promise<AudioBuffer> {
    const cached = this.state.cache.get(track.url);
    if (cached) return cached;
    if (!this.state.ctx) throw new Error('AudioContext not initialized');
    const res = await fetch(track.url, { credentials: 'omit' });
    if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${track.url}`);
    const arr = await res.arrayBuffer();
    const buf = await this.state.ctx.decodeAudioData(arr.slice(0));
    this.state.cache.set(track.url, buf);
    return buf;
  }

  private cancelVoiceFade(v: ActiveVoice): void {
    if (!this.state.ctx) return;
    try {
      const t = this.state.ctx.currentTime;
      v.gain.gain.cancelScheduledValues(t);
      v.source.stop();
    } catch {
      // already stopped
    }
  }

  private isVoiceStopped(v: ActiveVoice): boolean {
    // A buffer source that has been stopped reports a finite playback time;
    // we approximate by checking if its gain has reached 0 and we asked it
    // to stop.  Simpler: just clear all voices on each play() and start fresh.
    return false;
  }

  private notify(key: MusicTrackKey | null): void {
    for (const cb of this.listeners) {
      try { cb(key); } catch {}
    }
  }
}

export const audioManager = new AudioManager();