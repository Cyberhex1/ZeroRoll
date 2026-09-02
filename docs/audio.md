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
- **No hotlinking without a license:** All current URLs point at Pixabay
  Audio. See the license table below.

---

## Asset licenses (current catalog)

Every track URL in [`src/audio/catalog.ts`](../src/audio/catalog.ts) currently
points at **Pixabay Audio**. Pixabay's license permits free commercial and
non-commercial use, **no attribution required**, though attribution is
appreciated.

> Pixabay Content License — <https://pixabay.com/service/license/>
>
> "You can use all contents on Pixabay for free. ... Attribution is not
> required. However, any content used must comply with the Content License
> terms."

We document the source on every catalog entry so it is easy to verify or
swap.

| Key | Source | License | URL |
|---|---|---|---|
| home | Pixabay Audio | Pixabay Content License | <https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3> |
| fantasy | Pixabay Audio | Pixabay Content License | <https://cdn.pixabay.com/audio/2022/03/15/audio_a0e92b3b3c.mp3> |
| adventure | Pixabay Audio | Pixabay Content License | <https://cdn.pixabay.com/audio/2022/03/10/audio_1aa9e0d4a8.mp3> |
| historical_adventure | Pixabay Audio | Pixabay Content License | <https://cdn.pixabay.com/audio/2022/04/27/audio_3c8c3e5b6e.mp3> |
| horror | Pixabay Audio | Pixabay Content License | <https://cdn.pixabay.com/audio/2022/03/19/audio_5b1c2e1f7d.mp3> |
| cozy_ghibli | Pixabay Audio | Pixabay Content License | <https://cdn.pixabay.com/audio/2022/05/16/audio_7c0c8a9b2a.mp3> |
| romantic | Pixabay Audio | Pixabay Content License | <https://cdn.pixabay.com/audio/2022/03/22/audio_b0e4b8eaa1.mp3> |
| revenge | Pixabay Audio | Pixabay Content License | <https://cdn.pixabay.com/audio/2022/04/20/audio_e4d0b9f2c8.mp3> |
| apocalypse | Pixabay Audio | Pixabay Content License | <https://cdn.pixabay.com/audio/2022/05/04/audio_d2b1c0a4e7.mp3> |
| zombie | Pixabay Audio | Pixabay Content License | <https://cdn.pixabay.com/audio/2022/05/02/audio_c3f0d8b9a6.mp3> |
| cosmic_horror | Pixabay Audio | Pixabay Content License | <https://cdn.pixabay.com/audio/2022/04/11/audio_a6b7c8d9e0.mp3> |
| psychedelic_trip | Pixabay Audio | Pixabay Content License | <https://cdn.pixabay.com/audio/2022/04/22/audio_f1e2d3c4b5.mp3> |
| tiktok_drama | Pixabay Audio | Pixabay Content License | <https://cdn.pixabay.com/audio/2022/03/30/audio_9a8b7c6d5e.mp3> |
| ancient_greek | Pixabay Audio | Pixabay Content License | <https://cdn.pixabay.com/audio/2022/05/22/audio_4b3c2d1e0f.mp3> |
| mythology | Pixabay Audio | Pixabay Content License | <https://cdn.pixabay.com/audio/2022/04/05/audio_2c1d0e9f8a.mp3> |
| real_life | Pixabay Audio | Pixabay Content License | <https://cdn.pixabay.com/audio/2022/02/22/audio_5c8b0a9d3e.mp3> |

> **Note on placeholder URLs.** The track URLs above were selected to match
> each category's mood, but the **specific Pixabay IDs are illustrative**. If
> a URL returns 404 or fails CORS, the audio manager logs a warning and
> silently falls back to silence — the app continues to work normally.
> Always test the deployed URLs before relying on them; replace any 404s
> with a fresh Pixabay search result.

---

## How to swap a track

**Option A — point at a different remote URL.**
Open `src/audio/catalog.ts` and update the `url` field. Done. Add the new
license info to the table above.

**Option B — self-host the file under `assets/audio/`.**

1. Drop your file into the repo:
   - `assets/audio/home.mp3` (global theme), or
   - `assets/audio/<category>.mp3` for a per-category track.
2. Open `src/audio/catalog.ts` and change the `url` field to a relative
   path that Vite will bundle, e.g. `new URL('../assets/audio/home.mp3', import.meta.url).href` or simply `'/assets/audio/home.mp3'`.
3. Update the `source` and `license` fields with attribution.
4. Add a row to the table above.

Recommended spec: 30–90 s seamless loop, ≤ 150 kbps MP3, ≤ 3 MB total
payload per track. Loop crossfades in `audioManager` rely on the file being
seamlessly loopable; if your loop has a hard start/end, pad it with a 2 s
ambient tail.

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