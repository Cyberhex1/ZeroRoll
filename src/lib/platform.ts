/** True inside the Tauri PC app (which serves files from a custom protocol, so it uses hash routes). */
export function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

/** Story mode is built but hidden until its content ships. Turn on with VITE_STORY_MODE=true. */
export const STORY_MODE_ENABLED = import.meta.env.VITE_STORY_MODE === 'true';
