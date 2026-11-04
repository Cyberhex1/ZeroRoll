# ZeroRoll PC app (Tauri)

The PC app is the same web app in a native window (`src-tauri/`, Tauri 2) plus a local
model: it runs [llama.cpp](https://github.com/ggml-org/llama.cpp)'s `llama-server` on
`127.0.0.1` so quick replies (the router's basic tier) are free, private and work offline.
Story turns keep using the player's chosen provider.

## Build and run

Prerequisites: Node 22, Rust (stable), and the Tauri system libraries for your OS
(https://v2.tauri.app/start/prerequisites/). Then:

```
npm ci
npm run desktop:dev     # dev window against the Vite dev server
npm run desktop:build   # installers in src-tauri/target/release/bundle
```

## Local model flow (Settings > Local model)

1. **Check this PC** runs `system_check` (Rust): GPUs and VRAM (nvidia-smi, the Windows
   registry, AMD sysfs on Linux), RAM, and the backend: CUDA, Vulkan, Metal or CPU.
2. The VRAM band picks one regular model from `src/desktop/recommendations.json`, and one
   uncensored model as well when **Mature content** is on.
3. **Download** fetches the newest llama.cpp build for that backend from GitHub releases
   (plus the CUDA runtime on Windows) and the GGUF model from Hugging Face. Each download
   resumes after an interruption (`.part` file + HTTP Range) and is checked against the
   SHA-256 the source publishes (GitHub asset digest, Hugging Face LFS oid) before it is
   used. A file with no published checksum is refused.
4. **Start** launches llama-server on a free localhost port and waits for `/health`. The
   router then uses it for the basic tier. It starts again on launch if left on, and is
   stopped when the app exits.

All files live in the app data folder; the Rust commands refuse any path outside it.

## Not yet verified

The recommendation list is marked `verified: false`: each entry still needs one real
download and play-through on a machine with that much VRAM (Phase 1 gate: start the app,
detect the GPU, download one 12B model, answer a prompt from localhost).
