# ZeroRoll PC app (Tauri)

The PC app is the same web app in a native window (`src-tauri/`, Tauri 2) plus a local
model run by [Ollama](https://ollama.com), so quick replies (the router's basic tier) are
free, private and work offline. Story turns keep using the player's chosen provider.

## Build and run

Prerequisites: Node 22, Rust (stable), and the Tauri system libraries for your OS
(https://v2.tauri.app/start/prerequisites/). Then:

```
npm ci
npm run desktop:dev     # dev window against the Vite dev server
npm run desktop:build   # installers in src-tauri/target/release/bundle
```

## Local model flow (Settings > Local model)

1. The player installs Ollama from https://ollama.com/download (the app has a **Get
   Ollama** button that opens that page).
2. **Check this PC** runs `system_check` (Rust): GPUs and VRAM (nvidia-smi, the Windows
   registry, AMD sysfs on Linux) and RAM. It then asks Ollama on `127.0.0.1:11434` for its
   version and installed models, and runs `ollama serve` if Ollama is installed but not
   running.
3. The VRAM band picks one regular model from `src/desktop/recommendations.json`, and one
   uncensored model as well when **Mature content** is on. Each pick is an Ollama tag
   (library tags, or `hf.co/<repo>:<quant>` for Hugging Face GGUFs).
4. **Download** pulls the tag through Ollama (`ollama_pull`, streaming progress). Ollama
   checks each layer's SHA-256 and resumes an interrupted pull, so **Pause** just stops
   the stream.
5. The router then sends basic-tier calls to `ollama_chat`, which forwards them to
   Ollama's `/api/chat` with the pick's context size. The calls go through Rust so the
   webview's origin is never subject to Ollama's CORS rules. If Ollama is not running,
   the call fails as a network error and the router steps on to the player's provider.

## Not yet verified

The recommendation list is marked `verified: false`: each entry still needs one real
pull and play-through on a machine with that much VRAM (Phase 1 gate: start the app,
detect the GPU, pull one 12B model, answer a prompt from localhost).
