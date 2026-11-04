/**
 * Vite plugin: `virtual:story-index` exports each installed story's meta and its cover's
 * art entry, read from stories/<id>/story.json at build time. The picker imports only
 * this small index; full stories load on demand when one is opened.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import type { Plugin } from 'vite';

const ID = 'virtual:story-index';
const RESOLVED = '\0' + ID;

export function storyIndex(root = 'stories'): Plugin {
  return {
    name: 'zeroroll-story-index',
    resolveId: (id) => (id === ID ? RESOLVED : undefined),
    load(id) {
      if (id !== RESOLVED) return;
      const entries = [];
      if (existsSync(root)) {
        for (const dir of readdirSync(root)) {
          const file = join(root, dir, 'story.json');
          if (!existsSync(file)) continue;
          this.addWatchFile(resolve(file));
          try {
            const s = JSON.parse(readFileSync(file, 'utf8'));
            entries.push({ meta: s.meta, cover: s.meta?.cover ? s.art?.[s.meta.cover] ?? null : null });
          } catch (_) {
            // story:check in CI reports broken JSON; the picker just skips it.
          }
        }
      }
      return `export default ${JSON.stringify(entries)};`;
    }
  };
}
