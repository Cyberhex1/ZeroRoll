/**
 * Story art. Files live in Cloudflare R2 in production (VITE_STORY_ART_BASE, e.g.
 * https://art.zeroroll.app) and in public/story-art/ in development. Each image is cached
 * in IndexedDB after its first view, so a story that has been played once works offline.
 */
import { idb } from '../storage/db';
import type { Story } from './schema';

const BASE = (import.meta.env.VITE_STORY_ART_BASE || '/story-art').replace(/\/+$/, '');
const BUNDLED = new Set<string>(typeof __BUNDLED_STORY_ART__ !== 'undefined' ? __BUNDLED_STORY_ART__ : []);

/**
 * Where a built-in story's art file is served. A file that ships in public/story-art comes
 * from the site itself, so it works even before (or without) an upload to R2; anything else
 * comes from VITE_STORY_ART_BASE.
 */
export function storyArtFileUrl(storyId: string, file: string): string {
  return BUNDLED.has(`${storyId}/${file}`) ? `/story-art/${storyId}/${file}` : `${BASE}/${storyId}/${file}`;
}

export function artUrl(story: Story, artId: string): string | null {
  const a = story.art[artId];
  if (!a) return null;
  return a.url ?? storyArtFileUrl(story.meta.id, a.file);
}

/** Art from a story imported in the app lives only in IndexedDB, under this scheme. */
export const LOCAL_ART = 'zr-local:';

const objectUrls = new Map<string, string>();

/** A URL that shows the image, from the cache when possible. Falls back to the network URL. */
export async function cachedArtUrl(url: string): Promise<string> {
  const known = objectUrls.get(url);
  if (known) return known;
  try {
    let blob = await idb.get<Blob>('artCache', url);
    if (!blob && url.startsWith(LOCAL_ART)) return '';
    if (!blob) {
      const res = await fetch(url);
      if (!res.ok) return url;
      blob = await res.blob();
      await idb.put('artCache', url, blob);
    }
    const obj = URL.createObjectURL(blob);
    objectUrls.set(url, obj);
    return obj;
  } catch (_) {
    return url;
  }
}
