/**
 * Vite plugin: `virtual:story-index` exports each installed story's meta and its cover's
 * art entry, read from stories/<id>/story.json at build time. The picker imports only
 * this small index; full stories load on demand when one is opened. It also defines
 * __BUNDLED_STORY_ART__, the art files that ship with the site.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import type { Plugin } from 'vite';

const ID = 'virtual:story-index';
const RESOLVED = '\0' + ID;

/** Every `<storyId>/<file>` under public/story-art, which the build ships with the site. */
export function bundledStoryArt(dir = 'public/story-art'): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const id of readdirSync(dir, { withFileTypes: true })) {
    if (!id.isDirectory()) continue;
    for (const f of readdirSync(join(dir, id.name))) out.push(`${id.name}/${f}`);
  }
  return out.sort();
}

export function storyIndex(root = 'stories', artDir = 'public/story-art'): Plugin {
  return {
    name: 'zeroroll-story-index',
    // Art that ships inside the site is served from the site. Only art that is not in
    // public/story-art (stories installed with their art in R2) goes to VITE_STORY_ART_BASE.
    config: () => ({ define: { __BUNDLED_STORY_ART__: JSON.stringify(bundledStoryArt(artDir)) } }),
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
