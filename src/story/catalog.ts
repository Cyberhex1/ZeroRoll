/**
 * The installed stories. A build-time index (scripts/vite-story-index.ts) lists each
 * story's meta and cover for the picker; the full package is loaded and checked only when a story is opened.
 */
import storyIndex from 'virtual:story-index';
import type { ExperienceCategory } from '../types';
import { Story } from './schema';
import { checkStory } from './validate';

export type StoryMeta = Story['meta'];

const loaders = import.meta.glob<unknown>('../../stories/*/story.json', { import: 'default' });

const pathFor = (id: string) => Object.keys(loaders).find((p) => p.endsWith(`/${id}/story.json`));

export function listStories(): StoryMeta[] {
  return storyIndex.map((e) => e.meta).sort((a, b) => a.title.localeCompare(b.title));
}

/** The cover image URL for the picker, without loading the whole story. */
export function coverUrl(meta: StoryMeta): string | null {
  if (!meta.cover) return null;
  const entry = storyIndex.find((e) => e.meta.id === meta.id)?.cover;
  if (!entry) return null;
  return entry.url ?? `${(import.meta.env.VITE_STORY_ART_BASE || '/story-art').replace(/\/+$/, '')}/${meta.id}/${entry.file}`;
}

export function storiesByCategory(): Map<ExperienceCategory, StoryMeta[]> {
  const out = new Map<ExperienceCategory, StoryMeta[]>();
  for (const m of listStories()) out.set(m.category, [...(out.get(m.category) ?? []), m]);
  return out;
}

const cache = new Map<string, Story>();

/** Loads and validates a story. Throws with the validator's first error if it is broken. */
export async function loadStory(id: string): Promise<Story> {
  const hit = cache.get(id);
  if (hit) return hit;
  const path = pathFor(id);
  if (!path) throw new Error(`There is no story called "${id}".`);
  const check = checkStory(await loaders[path]());
  if (!check.story) throw new Error(`"${id}" did not pass its checks: ${check.issues[0]?.at} ${check.issues[0]?.message}`);
  cache.set(id, check.story);
  return check.story;
}

export async function loadAllStories(): Promise<Story[]> {
  return Promise.all(listStories().map((m) => loadStory(m.id)));
}
