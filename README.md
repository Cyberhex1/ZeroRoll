# ZeroRoll

An AI-powered tabletop storytelling site. Pick a genre, build a character, and play
a campaign with an AI Game Master.

ZeroRoll is a static site. There is no backend: every AI call goes straight from
your browser to the provider you choose, using **your own key** (Gemini, OpenAI,
Anthropic, xAI Grok, OpenRouter, GitHub Models, or a local model). Keys stay in
your browser and are never sent to ZeroRoll's database.

Signing in (Google, email or guest) only stores your campaigns in Firebase so
they follow you between devices.

## Run locally

Prerequisite: Node.js 22.

```sh
npm install
npm run dev        # http://localhost:3000
```

Then open **Connect AI** in the navbar and paste a key. For Gemini, create one at
[Google AI Studio](https://aistudio.google.com/apikey).

Other scripts:

| Script | What it does |
| --- | --- |
| `npm run build` | Static build into `dist/` |
| `npm run preview` | Serve the build locally |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm test` | Vitest |
| `npm run backup:firestore` | Owner-only Firestore dump, see [docs/backup.md](docs/backup.md) |

## Deploying

`npm run build` and serve `dist/` from any static host. The live site deploys
from this repo.

## Backups

Players can download all their campaigns from **Settings → Export my campaigns**
and load them back with **Import**. See [docs/backup.md](docs/backup.md).

---

## Local models (Ollama, LM Studio, and others)

ZeroRoll can run on a model on your own machine. In the **Connect AI Provider & API Key** dialog,
pick **Custom / Local LLM**, set the base URL (Ollama: `http://localhost:11434/v1`,
LM Studio: `http://localhost:1234/v1`), enter the model name, and leave the key
blank. The local server must allow browser requests, for example
`OLLAMA_ORIGINS="*" ollama serve`, or CORS turned on in LM Studio.

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
