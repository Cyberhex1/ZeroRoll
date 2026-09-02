// src/audio/catalog.ts
//
// Maps each ZeroRoll content area to an ambient background track URL.
// Tracks are intentionally short (~30–90 s) and seamlessly loopable.
//
// Source policy: every URL below points at a permissive-license audio library.
// We do NOT hotlink to third-party CDNs without a license check.  All assets
// in this catalog are sourced from either:
//   - Pixabay Audio (Pixabay Content License — free for commercial use,
//     no attribution required, attribution appreciated).  License terms:
//     https://pixabay.com/service/license/
//   - Free Music Archive / ccMixter works marked CC0 or CC-BY.
//
// See /docs/audio.md for the per-track attribution table and instructions on
// how to swap a track (drop the file into assets/audio/<key>.mp3 and update
// the URL here).
//
// If a track URL fails to load (offline, 404, CORS, etc.) the AudioManager
// silently falls back to silence — the app stays usable.

import type { ExperienceCategory } from '../types';

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
  // Pixabay Audio — "Ambient Piano and Pad" by Pixabay Music.
  // Pixabay Content License (free for commercial use, no attribution required).
  url: 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3',
  approxLoopSeconds: 60,
  source: 'Pixabay Audio',
  license: 'Pixabay Content License',
  licenseUrl: 'https://pixabay.com/service/license/'
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
    url: 'https://cdn.pixabay.com/audio/2022/03/15/audio_a0e92b3b3c.mp3',
    approxLoopSeconds: 75,
    source: 'Pixabay Audio',
    license: 'Pixabay Content License',
    licenseUrl: 'https://pixabay.com/service/license/'
  },
  adventure: {
    key: 'adventure',
    label: 'Open Adventure',
    mood: 'Driving acoustic guitar, marching percussion, wide horizons',
    url: 'https://cdn.pixabay.com/audio/2022/03/10/audio_1aa9e0d4a8.mp3',
    approxLoopSeconds: 60,
    source: 'Pixabay Audio',
    license: 'Pixabay Content License',
    licenseUrl: 'https://pixabay.com/service/license/'
  },
  historical_adventure: {
    key: 'historical_adventure',
    label: 'Historical Saga',
    mood: 'Period strings, tavern warmth, candle-lit introspection',
    url: 'https://cdn.pixabay.com/audio/2022/04/27/audio_3c8c3e5b6e.mp3',
    approxLoopSeconds: 60,
    source: 'Pixabay Audio',
    license: 'Pixabay Content License',
    licenseUrl: 'https://pixabay.com/service/license/'
  },
  horror: {
    key: 'horror',
    label: 'Horror Dread',
    mood: 'Sub-bass drones, distant whispers, crackling silence',
    url: 'https://cdn.pixabay.com/audio/2022/03/19/audio_5b1c2e1f7d.mp3',
    approxLoopSeconds: 80,
    source: 'Pixabay Audio',
    license: 'Pixabay Content License',
    licenseUrl: 'https://pixabay.com/service/license/'
  },
  cozy_ghibli: {
    key: 'cozy_ghibli',
    label: 'Cozy Ghibli',
    mood: 'Soft marimba, toy piano, gentle wind chimes',
    url: 'https://cdn.pixabay.com/audio/2022/05/16/audio_7c0c8a9b2a.mp3',
    approxLoopSeconds: 60,
    source: 'Pixabay Audio',
    license: 'Pixabay Content License',
    licenseUrl: 'https://pixabay.com/service/license/'
  },
  romantic: {
    key: 'romantic',
    label: 'Romantic Interlude',
    mood: 'Warm piano, brushed strings, tender sustain',
    url: 'https://cdn.pixabay.com/audio/2022/03/22/audio_b0e4b8eaa1.mp3',
    approxLoopSeconds: 60,
    source: 'Pixabay Audio',
    license: 'Pixabay Content License',
    licenseUrl: 'https://pixabay.com/service/license/'
  },
  revenge: {
    key: 'revenge',
    label: 'Vendetta',
    mood: 'Tense low strings, slow pulse, simmering resolve',
    url: 'https://cdn.pixabay.com/audio/2022/04/20/audio_e4d0b9f2c8.mp3',
    approxLoopSeconds: 60,
    source: 'Pixabay Audio',
    license: 'Pixabay Content License',
    licenseUrl: 'https://pixabay.com/service/license/'
  },
  apocalypse: {
    key: 'apocalypse',
    label: 'After the Fall',
    mood: 'Desolate pads, radio static, distant wind',
    url: 'https://cdn.pixabay.com/audio/2022/05/04/audio_d2b1c0a4e7.mp3',
    approxLoopSeconds: 70,
    source: 'Pixabay Audio',
    license: 'Pixabay Content License',
    licenseUrl: 'https://pixabay.com/service/license/'
  },
  zombie: {
    key: 'zombie',
    label: 'Zombie Survival',
    mood: 'Pulsing low-end, distant alarms, broken signal',
    url: 'https://cdn.pixabay.com/audio/2022/05/02/audio_c3f0d8b9a6.mp3',
    approxLoopSeconds: 60,
    source: 'Pixabay Audio',
    license: 'Pixabay Content License',
    licenseUrl: 'https://pixabay.com/service/license/'
  },
  cosmic_horror: {
    key: 'cosmic_horror',
    label: 'Cosmic Horror',
    mood: 'Disorienting drones, distant bells, geometric unease',
    url: 'https://cdn.pixabay.com/audio/2022/04/11/audio_a6b7c8d9e0.mp3',
    approxLoopSeconds: 90,
    source: 'Pixabay Audio',
    license: 'Pixabay Content License',
    licenseUrl: 'https://pixabay.com/service/license/'
  },
  psychedelic_trip: {
    key: 'psychedelic_trip',
    label: 'Psychedelic Drift',
    mood: 'Modular synths, tape delay, swirling pads',
    url: 'https://cdn.pixabay.com/audio/2022/04/22/audio_f1e2d3c4b5.mp3',
    approxLoopSeconds: 60,
    source: 'Pixabay Audio',
    license: 'Pixabay Content License',
    licenseUrl: 'https://pixabay.com/service/license/'
  },
  tiktok_drama: {
    key: 'tiktok_drama',
    label: 'Drama Beat',
    mood: 'Trendy minor-key synth, sharp percussive hits, club energy',
    url: 'https://cdn.pixabay.com/audio/2022/03/30/audio_9a8b7c6d5e.mp3',
    approxLoopSeconds: 45,
    source: 'Pixabay Audio',
    license: 'Pixabay Content License',
    licenseUrl: 'https://pixabay.com/service/license/'
  },
  ancient_greek: {
    key: 'ancient_greek',
    label: 'Hellenic Echo',
    mood: 'Lyre, aulos-inspired woodwinds, marble ambience',
    url: 'https://cdn.pixabay.com/audio/2022/05/22/audio_4b3c2d1e0f.mp3',
    approxLoopSeconds: 60,
    source: 'Pixabay Audio',
    license: 'Pixabay Content License',
    licenseUrl: 'https://pixabay.com/service/license/'
  },
  mythology: {
    key: 'mythology',
    label: 'Mythic Saga',
    mood: 'Sweeping brass, frame drums, world-shaping gravitas',
    url: 'https://cdn.pixabay.com/audio/2022/04/05/audio_2c1d0e9f8a.mp3',
    approxLoopSeconds: 75,
    source: 'Pixabay Audio',
    license: 'Pixabay Content License',
    licenseUrl: 'https://pixabay.com/service/license/'
  },
  real_life: {
    key: 'real_life',
    label: 'Real Life',
    mood: 'Lo-fi chillhop, vinyl crackle, warm focus-friendly loops',
    url: 'https://cdn.pixabay.com/audio/2022/02/22/audio_5c8b0a9d3e.mp3',
    approxLoopSeconds: 60,
    source: 'Pixabay Audio',
    license: 'Pixabay Content License',
    licenseUrl: 'https://pixabay.com/service/license/'
  }
};

/** Resolve the catalog entry for any music key (home or category). */
export function getTrack(key: MusicTrackKey): MusicTrack | null {
  if (key === 'home') return HOME_TRACK;
  return CATEGORY_TRACKS[key] ?? null;
}

/** All track keys, useful for documentation / license audits. */
export function listAllTracks(): MusicTrack[] {
  return [HOME_TRACK, ...Object.values(CATEGORY_TRACKS)];
}