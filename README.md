<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/9c0aebe7-7997-4d1a-9feb-1386b5178a88

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

---

## Ambient Music

ZeroRoll ships an opt-in ambient music layer. The **ZeroRoll Theme** plays
on every screen except inside an active experience — when you launch a
campaign the player crossfades (~1.6 s) to a track chosen for that category.

See [`docs/audio.md`](docs/audio.md) for the full category map, controls,
persistence keys, asset licenses, and how to swap a track.

Quick facts:

- Singleton `AudioContext` + per-track `GainNode` crossfades
- Lazy fetch + decode; cached buffers reused within a session
- Respects `prefers-reduced-data` (no auto-play) and
  `prefers-reduced-motion`
- Pauses on `visibilitychange`
- Volume / mute / on-off persist in `localStorage`
- Keyboard-accessible controls with `aria-pressed` and `aria-label`s
- All current assets are sourced from Pixabay Audio (Pixabay Content
  License — free for commercial use, no attribution required)
