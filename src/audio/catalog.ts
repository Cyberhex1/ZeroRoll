// src/audio/catalog.ts
//
// Maps each ZeroRoll content area to an ambient background track URL.
// Tracks are short, seamlessly loopable ambient pieces.
//
// Source: every track is an original ZeroRoll loop, synthesized for this app
// (no third-party samples), so there is no outside license or attribution to
// carry. The files live in the zeroroll-assets R2 bucket as music/<key>.mp3.
// See /docs/audio.md for the generator and how to swap a track.
//
// If a track URL fails to load (offline, 404, CORS, etc.) the AudioManager
// silently falls back to silence; the app stays usable.

import type { ExperienceCategory } from '../types';

/** Public R2 folder that holds the original ZeroRoll loops. VITE_MUSIC_BASE overrides it. */
export const DEFAULT_MUSIC_BASE = 'https://pub-6b60ebc316364d97ac49ce3c63db6106.r2.dev/music';

const ORIGINAL = {
  source: 'Original ZeroRoll loop',
  license: 'Original work for ZeroRoll',
  licenseUrl: ''
} as const;

export type MusicTrackKey = 'home' | ExperienceCategory;

export interface MusicTrack {
  /** Stable identifier; used as the cache key in AudioManager. */
  key: MusicTrackKey;
  /** Display label for the "Now playing" pill in the player UI. */
  label: string;
  /** Mood descriptor shown on hover / aria-label. */
  mood: string;
  /** Direct URL to the audio file (mp3/ogg). */
  url: string;
  /** Loop length in seconds — used for sanity checks and docs. */
  approxLoopSeconds: number;
  /** Where the asset came from and what license it ships under. */
  source: string;
  license: string;
  licenseUrl: string;
}

/**
 * Global "theme" track — plays everywhere except inside an active experience.
 * Once an experience starts the player crossfades to the category-specific track.
 */
export const HOME_TRACK: MusicTrack = {
  key: 'home',
  label: 'ZeroRoll Theme',
  mood: 'Calm ambient pads, slow tempo, airy',
  url: `${DEFAULT_MUSIC_BASE}/home.mp3`,
  approxLoopSeconds: 60,
  ...ORIGINAL
};

/**
 * Per-category track table.  Categories not listed here silently get silence
 * (AudioManager logs a warning and skips) rather than the home theme, so the
 * UI never claims a category is "now playing" something inappropriate.
 *
 * Each track was selected to roughly match the genre's emotional register
 * (see AGENTS.md §11 — ZeroRoll UI must feel like ZeroRoll, not a generic
 * purple AI template; music should reinforce the category's identity).
 */
export const CATEGORY_TRACKS: Record<ExperienceCategory, MusicTrack> = {
  fantasy: {
    key: 'fantasy',
    label: 'High Fantasy',
    mood: 'Lush strings, harp arpeggios, distant choirs',
    url: `${DEFAULT_MUSIC_BASE}/fantasy.mp3`,
    approxLoopSeconds: 75,
    ...ORIGINAL
  },
  adventure: {
    key: 'adventure',
    label: 'Open Adventure',
    mood: 'Driving acoustic guitar, marching percussion, wide horizons',
    url: `${DEFAULT_MUSIC_BASE}/adventure.mp3`,
    approxLoopSeconds: 60,
    ...ORIGINAL
  },
  historical_adventure: {
    key: 'historical_adventure',
    label: 'Historical Saga',
    mood: 'Period strings, tavern warmth, candle-lit introspection',
    url: `${DEFAULT_MUSIC_BASE}/historical_adventure.mp3`,
    approxLoopSeconds: 60,
    ...ORIGINAL
  },
  horror: {
    key: 'horror',
    label: 'Horror Dread',
    mood: 'Sub-bass drones, distant whispers, crackling silence',
    url: `${DEFAULT_MUSIC_BASE}/horror.mp3`,
    approxLoopSeconds: 80,
    ...ORIGINAL
  },
  cozy_ghibli: {
    key: 'cozy_ghibli',
    label: 'Cozy Ghibli',
    mood: 'Soft marimba, toy piano, gentle wind chimes',
    url: `${DEFAULT_MUSIC_BASE}/cozy_ghibli.mp3`,
    approxLoopSeconds: 60,
    ...ORIGINAL
  },
  romantic: {
    key: 'romantic',
    label: 'Romantic Interlude',
    mood: 'Warm piano, brushed strings, tender sustain',
    url: `${DEFAULT_MUSIC_BASE}/romantic.mp3`,
    approxLoopSeconds: 60,
    ...ORIGINAL
  },
  revenge: {
    key: 'revenge',
    label: 'Vendetta',
    mood: 'Tense low strings, slow pulse, simmering resolve',
    url: `${DEFAULT_MUSIC_BASE}/revenge.mp3`,
    approxLoopSeconds: 60,
    ...ORIGINAL
  },
  apocalypse: {
    key: 'apocalypse',
    label: 'After the Fall',
    mood: 'Desolate pads, radio static, distant wind',
    url: `${DEFAULT_MUSIC_BASE}/apocalypse.mp3`,
    approxLoopSeconds: 70,
    ...ORIGINAL
  },
  zombie: {
    key: 'zombie',
    label: 'Zombie Survival',
    mood: 'Pulsing low-end, distant alarms, broken signal',
    url: `${DEFAULT_MUSIC_BASE}/zombie.mp3`,
    approxLoopSeconds: 60,
    ...ORIGINAL
  },
  cosmic_horror: {
    key: 'cosmic_horror',
    label: 'Cosmic Horror',
    mood: 'Disorienting drones, distant bells, geometric unease',
    url: `${DEFAULT_MUSIC_BASE}/cosmic_horror.mp3`,
    approxLoopSeconds: 90,
    ...ORIGINAL
  },
  psychedelic_trip: {
    key: 'psychedelic_trip',
    label: 'Psychedelic Drift',
    mood: 'Modular synths, tape delay, swirling pads',
    url: `${DEFAULT_MUSIC_BASE}/psychedelic_trip.mp3`,
    approxLoopSeconds: 60,
    ...ORIGINAL
  },
  tiktok_drama: {
    key: 'tiktok_drama',
    label: 'Drama Beat',
    mood: 'Trendy minor-key synth, sharp percussive hits, club energy',
    url: `${DEFAULT_MUSIC_BASE}/tiktok_drama.mp3`,
    approxLoopSeconds: 45,
    ...ORIGINAL
  },
  ancient_greek: {
    key: 'ancient_greek',
    label: 'Hellenic Echo',
    mood: 'Lyre, aulos-inspired woodwinds, marble ambience',
    url: `${DEFAULT_MUSIC_BASE}/ancient_greek.mp3`,
    approxLoopSeconds: 60,
    ...ORIGINAL
  },
  mythology: {
    key: 'mythology',
    label: 'Mythic Saga',
    mood: 'Sweeping brass, frame drums, world-shaping gravitas',
    url: `${DEFAULT_MUSIC_BASE}/mythology.mp3`,
    approxLoopSeconds: 75,
    ...ORIGINAL
  },
  real_life: {
    key: 'real_life',
    label: 'Real Life',
    mood: 'Lo-fi chillhop, vinyl crackle, warm focus-friendly loops',
    url: `${DEFAULT_MUSIC_BASE}/real_life.mp3`,
    approxLoopSeconds: 60,
    ...ORIGINAL
  }
};

/** Resolve the catalog entry for any music key (home or category). */
/**
 * When VITE_MUSIC_BASE is set, every track loads from `${VITE_MUSIC_BASE}/<key>.mp3`
 * instead of DEFAULT_MUSIC_BASE. `npm run music:check` lists what to upload.
 */
export function musicBase(): string {
  const env = (import.meta as any).env ?? {};
  const base = String(env.VITE_MUSIC_BASE ?? '').trim();
  return base.replace(/\/+$/, '');
}

export function trackFileName(key: MusicTrackKey): string {
  return `${key}.mp3`;
}

export function resolveTrackUrl(track: MusicTrack, base = musicBase()): string {
  return base ? `${base}/${trackFileName(track.key)}` : track.url;
}

export function getTrack(key: MusicTrackKey): MusicTrack | null {
  const t = key === 'home' ? HOME_TRACK : CATEGORY_TRACKS[key] ?? null;
  return t ? { ...t, url: resolveTrackUrl(t) } : null;
}

/** All track keys, useful for documentation / license audits. */
export function listAllTracks(): MusicTrack[] {
  return [HOME_TRACK, ...Object.values(CATEGORY_TRACKS)];
}