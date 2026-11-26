/**
 * How the Story mode picker groups stories: Originals pinned first, then fan fiction by kind of
 * work (games, anime and comics, TV and film, books), and inside each by the work itself.
 */
import { getContent } from '../content';
import type { Medium } from './schema';
import type { StoryMeta } from './catalog';

export const FANFIC_GROUPS: Array<{ id: string; name: string; mediums: Medium[] }> = [
  { id: 'games', name: 'Games', mediums: ['game'] },
  { id: 'anime', name: 'Anime, manga and manhwa', mediums: ['anime', 'manga', 'manhwa'] },
  { id: 'screen', name: 'TV and film', mediums: ['tv', 'film'] },
  { id: 'books', name: 'Books and classics', mediums: ['book'] }
];

/** Fan fiction grouped by the work it is set in, works in A to Z order, stories by title. */
export function groupBySource(stories: StoryMeta[]): Array<[string, StoryMeta[]]> {
  const out = new Map<string, StoryMeta[]>();
  for (const m of stories) {
    const key = m.source?.title ?? '';
    out.set(key, [...(out.get(key) ?? []), m]);
  }
  return [...out.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, list]) => [k, list.sort((a, b) => a.title.localeCompare(b.title))] as [string, StoryMeta[]]);
}

const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Every word of the search must appear in the title, blurb, genre or the work's name. */
export function matchesSearch(m: StoryMeta, query: string): boolean {
  const words = fold(query).split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  let genre = '';
  try {
    genre = getContent(m.category).card.name;
  } catch {
    genre = m.category;
  }
  const hay = fold([m.title, m.blurb, genre, m.source?.title ?? '', m.source?.owner ?? ''].join(' '));
  return words.every((w) => hay.includes(w));
}
