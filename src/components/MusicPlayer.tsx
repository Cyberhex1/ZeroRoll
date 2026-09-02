// src/components/MusicPlayer.tsx
//
// Persistent bottom-right ambient music control.
//
// Behaviors:
//   - Renders nothing until first user gesture (autoplay compliance).
//   - Shows a one-time toast prompting the user to click to enable music.
//   - After unlock: collapsible panel with Play/Pause, Mute, Volume,
//     "Now playing" pill, and a chevron to minimize.
//   - All controls are keyboard-accessible and expose aria-pressed / aria-label.
//   - Visibility-aware: pauses output when document.visibilityState === 'hidden'.
//   - Respects prefers-reduced-motion (no slide animation) and
//     prefers-reduced-data (audio stays disabled until manually enabled).
//
// Persistence keys (localStorage):
//   zr.musicEnabled   '0' | '1' — top-level on/off
//   zr.musicMuted     '0' | '1' — mute toggle (output gain)
//   zr.musicVolume    '0'..'1'   — master gain
//   zr.musicMinimized '0' | '1' — panel collapsed state
//   zr.musicToastSeen '0' | '1' — suppresses the unlock prompt after first accept

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Music2, Music3, Volume2, VolumeX, Play, Pause, ChevronDown, ChevronUp, X, Sparkles } from 'lucide-react';
import { audioManager } from '../audio/manager';
import { getTrack, MusicTrackKey } from '../audio/catalog';

const KEY_ENABLED = 'zr.musicEnabled';
const KEY_MUTED = 'zr.musicMuted';
const KEY_VOLUME = 'zr.musicVolume';
const KEY_MIN = 'zr.musicMinimized';
const KEY_TOAST = 'zr.musicToastSeen';

interface MusicPlayerProps {
  /** Which track should currently be playing (home or category id). */
  currentTrackKey: MusicTrackKey;
}

/** First-gesture hook: calls `fn` once on the first real user interaction. */
function useFirstGesture(fn: () => void): void {
  const fired = useRef(false);
  useEffect(() => {
    const handler = () => {
      if (fired.current) return;
      fired.current = true;
      fn();
      window.removeEventListener('pointerdown', handler);
      window.removeEventListener('keydown', handler);
      window.removeEventListener('scroll', handler);
      window.removeEventListener('touchstart', handler);
    };
    window.addEventListener('pointerdown', handler, { passive: true });
    window.addEventListener('keydown', handler);
    window.addEventListener('scroll', handler, { passive: true });
    window.addEventListener('touchstart', handler, { passive: true });
    return () => {
      window.removeEventListener('pointerdown', handler);
      window.removeEventListener('keydown', handler);
      window.removeEventListener('scroll', handler);
      window.removeEventListener('touchstart', handler);
    };
  }, [fn]);
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ currentTrackKey }) => {
  const [hydrated, setHydrated] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.4);
  const [minimized, setMinimized] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [reducedData, setReducedData] = useState(false);

  // ---------- hydrate from localStorage + audioManager ----------
  useEffect(() => {
    audioManager.hydrate();
    try {
      const e = localStorage.getItem(KEY_ENABLED);
      const m = localStorage.getItem(KEY_MUTED);
      const v = localStorage.getItem(KEY_VOLUME);
      const min = localStorage.getItem(KEY_MIN);
      const toast = localStorage.getItem(KEY_TOAST);
      if (e !== null) setEnabled(e === '1');
      if (m !== null) setMuted(m === '1');
      if (v !== null) {
        const n = parseFloat(v);
        if (Number.isFinite(n)) setVolume(Math.max(0, Math.min(1, n)));
      }
      if (min !== null) setMinimized(min === '1');
      if (toast !== '1' && e !== '0') setToastVisible(true);
    } catch {}
    setHydrated(true);
    setUnlocked(audioManager.isUnlocked());
    setReducedData(audioManager.isReducedData());
    if (audioManager.isMuted() !== (localStorage.getItem(KEY_MUTED) === '1')) {
      // keep local state in sync if manager was hydrated before us
      setMuted(audioManager.isMuted());
    }
  }, []);

  // ---------- unlock on first gesture ----------
  useFirstGesture(useCallback(() => {
    if (!enabled) return;
    audioManager.resumeOnGesture();
    setUnlocked(true);
    setToastVisible(false);
    try { localStorage.setItem(KEY_TOAST, '1'); } catch {}
  }, [enabled]));

  // ---------- react to track key changes ----------
  useEffect(() => {
    if (!hydrated || !enabled) return;
    if (reducedData) return;
    if (!audioManager.isUnlocked()) {
      // resumeOnGesture() will pick this up after first interaction
      return;
    }
    void audioManager.play(currentTrackKey);
    setIsPlaying(true);
  }, [hydrated, enabled, reducedData, currentTrackKey]);

  // ---------- subscribe to manager events (so UI mirrors stop / track changes) ----------
  useEffect(() => {
    const unsub = audioManager.subscribe(key => {
      setIsPlaying(key !== null);
    });
    const onVis = () => audioManager.onVisibilityChange(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', onVis);
    return () => { unsub(); document.removeEventListener('visibilitychange', onVis); };
  }, []);

  // ---------- handlers ----------
  const handleTogglePlay = useCallback(() => {
    const next = !enabled;
    setEnabled(next);
    audioManager.setEnabled(next);
    if (next) {
      // user just enabled — treat the click itself as a gesture
      audioManager.resumeOnGesture();
      setUnlocked(true);
      setToastVisible(false);
      try { localStorage.setItem(KEY_TOAST, '1'); } catch {}
      void audioManager.play(currentTrackKey);
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  }, [enabled, currentTrackKey]);

  const handleToggleMute = useCallback(() => {
    const next = !muted;
    setMuted(next);
    audioManager.setMuted(next);
  }, [muted]);

  const handleVolume = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    audioManager.setVolume(v);
    // changing volume is an implicit "I want to hear this" — unmute + enable
    if (muted && v > 0) {
      setMuted(false);
      audioManager.setMuted(false);
    }
    if (!enabled) {
      setEnabled(true);
      audioManager.setEnabled(true);
    }
  }, [muted, enabled]);

  const handleMinimize = useCallback(() => {
    setMinimized(m => {
      const next = !m;
      try { localStorage.setItem(KEY_MIN, next ? '1' : '0'); } catch {}
      return next;
    });
  }, []);

  const handleDismissToast = useCallback(() => {
    setToastVisible(false);
    try { localStorage.setItem(KEY_TOAST, '1'); } catch {}
  }, []);

  if (!hydrated) return null;

  const track = getTrack(currentTrackKey);
  const trackLabel = track?.label ?? 'Ambient';

  // ---------- render ----------
  return (
    <>
      {/* One-time gesture prompt */}
      {toastVisible && unlocked === false && (
        <button
          type="button"
          onClick={() => {
            audioManager.resumeOnGesture();
            setUnlocked(true);
            setToastVisible(false);
            try { localStorage.setItem(KEY_TOAST, '1'); } catch {}
          }}
          className="fixed bottom-24 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl border border-amber-500/40 bg-stone-900/95 text-amber-100 shadow-2xl backdrop-blur-sm hover:border-amber-400/70 hover:bg-stone-800/95 transition-colors"
          aria-label="Click to enable ambient music"
        >
          <Sparkles className="w-4 h-4 text-amber-300" aria-hidden="true" />
          <span className="text-sm font-medium">Click to enable music</span>
          <span
            role="button"
            tabIndex={-1}
            onClick={(e) => { e.stopPropagation(); handleDismissToast(); }}
            className="ml-2 text-stone-500 hover:text-stone-300"
            aria-label="Dismiss music prompt"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </span>
        </button>
      )}

      <div
        className="fixed bottom-4 right-4 z-50 select-none"
        role="region"
        aria-label="Ambient music player"
      >
        <div
          className={[
            'flex flex-col gap-2 p-3 rounded-2xl border border-stone-700/60 bg-stone-900/85 backdrop-blur-md shadow-2xl text-stone-100',
            'transition-[width,height] duration-200 ease-out',
            minimized ? 'w-12 h-12 items-center justify-center p-1.5' : 'w-72 p-3'
          ].join(' ')}
        >
          {minimized ? (
            <button
              type="button"
              onClick={handleMinimize}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-stone-800 hover:bg-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
              aria-label="Expand music player"
              aria-pressed="false"
            >
              {isPlaying && enabled ? (
                <Music3 className="w-5 h-5 text-amber-300" aria-hidden="true" />
              ) : (
                <Music2 className="w-5 h-5 text-stone-400" aria-hidden="true" />
              )}
            </button>
          ) : (
            <>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {isPlaying && enabled ? (
                    <Music3 className="w-4 h-4 text-amber-300 shrink-0" aria-hidden="true" />
                  ) : (
                    <Music2 className="w-4 h-4 text-stone-400 shrink-0" aria-hidden="true" />
                  )}
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-widest text-stone-500">Now playing</div>
                    <div className="text-xs font-medium truncate" title={trackLabel}>{trackLabel}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleMinimize}
                  className="text-stone-500 hover:text-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-400/60 rounded p-1"
                  aria-label="Minimize music player"
                >
                  <ChevronDown className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTogglePlay}
                  className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-400/60 text-xs font-medium"
                  aria-label={enabled ? 'Pause music' : 'Play music'}
                  aria-pressed={enabled}
                >
                  {enabled ? (
                    <>
                      <Pause className="w-3.5 h-3.5" aria-hidden="true" /> Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" aria-hidden="true" /> Play
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleToggleMute}
                  className={[
                    'flex items-center justify-center w-9 h-9 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400/60',
                    muted ? 'bg-stone-800 text-stone-400 hover:bg-stone-700' : 'bg-amber-500/15 text-amber-200 hover:bg-amber-500/25'
                  ].join(' ')}
                  aria-label={muted ? 'Unmute' : 'Mute'}
                  aria-pressed={muted}
                >
                  {muted ? (
                    <VolumeX className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <Volume2 className="w-4 h-4" aria-hidden="true" />
                  )}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <label htmlFor="zr-music-volume" className="sr-only">
                  Music volume
                </label>
                <input
                  id="zr-music-volume"
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={handleVolume}
                  className="w-full accent-amber-400"
                  aria-valuemin={0}
                  aria-valuemax={1}
                  aria-valuenow={Math.round(volume * 100)}
                  aria-valuetext={`${Math.round(volume * 100)} percent`}
                />
              </div>

              {reducedData && (
                <div className="text-[10px] text-stone-500 leading-snug">
                  Reduced-data mode is on, so music is paused by default.
                </div>
              )}
              {currentTrackKey === 'home' && enabled && unlocked && (
                <div className="text-[10px] text-stone-500 leading-snug">
                  Crossfades to the category track when an experience starts.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default MusicPlayer;