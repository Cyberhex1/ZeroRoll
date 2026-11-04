# ZeroRoll Ambient Music

ZeroRoll ships an opt-in ambient music layer. By default the **ZeroRoll Theme**
plays on every screen except inside an active experience — when you launch a
campaign the player crossfades (~1.6 s) to a track chosen for that category.

The music system is built around the existing React app structure (no extra
framework). It's a singleton Web Audio engine + a small React control panel.

---

## How routing works

```
App.tsx
  └── <MusicPlayer currentTrackKey={activeExperience ? activeExperience.category : 'home'} />
```

- `MusicPlayer` reads `currentTrackKey` and asks the `audioManager` to
  crossfade to that track.
- On the catalog / settings / auth screens the key is `'home'` — so the
  ZeroRoll Theme plays.
- When you open an experience, the key flips to the experience's category
  (e.g. `horror`, `cosmic_horror`, `cozy_ghibli`) and the player fades over.
- When you back out, it fades back to `'home'`.

There is no router — the active experience lives in React state, and the
music key is derived from that. This is intentionally lightweight so it works
without touching the rest of the app.

---

## Categories & moods

| Category | Track label | Mood |
|---|---|---|
| Home (no active experience) | ZeroRoll Theme | Calm ambient pads, slow tempo, airy |
| fantasy | High Fantasy | Lush strings, harp arpeggios, distant choirs |
| adventure | Open Adventure | Driving acoustic guitar, marching percussion |
| historical_adventure | Historical Saga | Period strings, tavern warmth |
| horror | Horror Dread | Sub-bass drones, distant whispers |
| cozy_ghibli | Cozy Ghibli | Soft marimba, toy piano, wind chimes |
| romantic | Romantic Interlude | Warm piano, brushed strings |
| revenge | Vendetta | Tense low strings, slow pulse |
| apocalypse | After the Fall | Desolate pads, radio static |
| zombie | Zombie Survival | Pulsing low-end, broken signal |
| cosmic_horror | Cosmic Horror | Disorienting drones, geometric unease |
| psychedelic_trip | Psychedelic Drift | Modular synths, tape delay |
| tiktok_drama | Drama Beat | Trendy minor-key synth, sharp hits |
| ancient_greek | Hellenic Echo | Lyre, woodwinds, marble ambience |
| mythology | Mythic Saga | Sweeping brass, frame drums |
| real_life | Real Life | Lo-fi chillhop, vinyl crackle |

---

## Controls

The panel sits in the bottom-right corner. It is **collapsible** — click the
chevron (or the round button when minimized) to expand or hide it.

| Control | Behavior | Persisted? |
|---|---|---|
| Play / Pause | Top-level on/off switch | `zr.musicEnabled` |
| Mute | Output gain to 0 | `zr.musicMuted` |
| Volume slider | Master gain (0..1) | `zr.musicVolume` |
| Chevron / round button | Collapse / expand | `zr.musicMinimized` |
| "Click to enable music" toast | One-time gesture prompt | dismissed = `zr.musicToastSeen` |

All controls are keyboard-accessible, expose `aria-pressed` for toggles and
`aria-label`s for icon-only buttons, and the volume slider has a screen-reader
`aria-valuetext`.

---

## Accessibility & autoplay compliance

- **Autoplay policies:** Browsers require a user gesture before any audio
  output. The player listens for `pointerdown` / `keydown` / `scroll` /
  `touchstart` and only then calls `AudioContext.resume()` and starts the
  current track.
- **First-time prompt:** Until the user interacts, a small toast appears
  near the player: *"Click to enable music."* Once dismissed (or after the
  first gesture) it never shows again (`zr.musicToastSeen`).
- **`prefers-reduced-motion`:** We disable decorative slide animations on
  expand/collapse (CSS uses a short, low-amplitude transition by default —
  see the `transition-[width,height]` class on the panel).
- **`prefers-reduced-data: reduce`:** The audio manager refuses to auto-start
  any track when this media query matches. The player UI shows a small note:
  *"Reduced-data mode is on, so music is paused by default."* Users can still
  enable music manually.
- **Tab visibility:** When the tab is hidden, the `AudioContext` is
  suspended (`onVisibilityChange`); resumed on return.
- **Keyboard:** All buttons are real `<button>` / `<input>` elements, tab into
  them with `Tab`. Volume slider uses standard `<input type="range">`
  semantics.

---

## Performance

- **Lazy load:** No audio is fetched on page load. Each track is requested,
  decoded, and cached the first time the player asks for it.
- **Single AudioContext:** `audioManager` owns one context + one master
  `GainNode`. Per-track voices each have their own `GainNode` for the fade.
- **Decode once, replay from buffer:** Decoded `AudioBuffer`s are stored in
  an in-memory `Map` keyed by URL. Re-visiting a category within a session
  uses the cached buffer — no re-fetch, no re-decode.
- **Crossfade:** When the track key changes, the new voice's gain ramps
  `0 → 1` over 1.6 s; the previous voice ramps `1 → 0` over the same window
  and is stopped at the end.
- **Self-hosted:** every track is served from the ZeroRoll R2 bucket. See
  the asset section below.

---

## Assets and licensing

Every track is an **original ZeroRoll loop**, synthesized for this app from
scratch (no third-party samples or recordings), so there is no outside
license or attribution to carry. The earlier catalog pointed at Pixabay
links that turned out to be placeholders and partly dead; they are gone.

- **Where they live:** the `zeroroll-assets` R2 bucket, as `music/<key>.mp3`
  (for example `music/home.mp3`, `music/horror.mp3`). The public folder is
  `DEFAULT_MUSIC_BASE` in [`src/audio/catalog.ts`](../src/audio/catalog.ts).
- **Override:** set `VITE_MUSIC_BASE` on the deploy to load the same file
  names from somewhere else.
- **Generator:** the loops were made with a small Python synth script
  (`synth.py`, kept in the project files next to `zeroroll-music.zip`).
  Rerun it to regenerate or tweak a mood.
- **Check:** `npm run music:check -- --online` fetches every track and fails
  on any that is missing or not audio.

---

## How to swap a track

1. Make or pick a 30–90 s seamless loop (≤ 150 kbps MP3, ≤ 3 MB). If it is
   not your own work, make sure its license allows commercial use.
2. Upload it to the bucket as `music/<key>.mp3`, replacing the old file.
3. If it is not an original loop, update that entry's `source`, `license`
   and `licenseUrl` in `src/audio/catalog.ts`.
4. Run `npm run music:check -- --online`.

Loop crossfades in `audioManager` rely on the file being seamlessly loopable;
if your loop has a hard start/end, pad it with a 2 s ambient tail.

---

## Disabling music system-wide

If you want to remove the system without breaking the build:

1. Delete `src/audio/`, `src/components/MusicPlayer.tsx`, and the import /
   `<MusicPlayer />` block in `src/App.tsx`.
2. Run `npm run lint` and `npm run build` to confirm no orphan references.

The system is intentionally isolated — nothing else in the app depends on
the audio modules.

---

## Verification done during development

- `npm run lint` (which runs `tsc --noEmit`) passes with exit code 0.
- `npm run build` produces a clean Vite production bundle.
- Manual dev-server smoke test: the bottom-right player renders, persists
  volume/mute across reloads, and `currentTrackKey` updates when an
  experience is opened.
- `AudioContext` is created lazily on first gesture so browsers that
  require a user gesture (Chrome, Safari, Firefox) do not block the app.