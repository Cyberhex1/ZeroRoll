/**
 * Template sharing (Phase 5): a story can be exported as a package zip and given to
 * someone else, who adds it with "Add stories". A shared story is effectively a system
 * prompt written by a stranger, so before anything is installed the player sees every
 * word of it that can reach the model, with lines that look like attempts to override the
 * app's instructions marked. Nothing is stripped or changed silently.
 */
import { zipSync, strToU8 } from 'fflate';
import { idb } from '../storage/db';
import { LOCAL_ART, artUrl } from './art';
import { newState } from './engine';
import { directorBlock, storySystemPrompt, targetWords } from './prompt';
import type { Story } from './schema';

export interface PromptSection {
  title: string;
  text: string;
}

/** Everything in the story that the narrator can be sent: the bible and each beat's director block. */
export function promptPreview(story: Story): PromptSection[] {
  const words = targetWords(story);
  const sections: PromptSection[] = [{ title: 'Story bible (sent every turn)', text: storySystemPrompt(story, 'full', words) }];
  const base = newState(story);
  for (const beat of story.beats) {
    sections.push({ title: `Beat: ${beat.title}`, text: directorBlock(story, { ...base, beat: beat.id }, 'full') });
  }
  return sections;
}

const SUSPICIOUS: Array<[RegExp, string]> = [
  [/\b(ignore|disregard|forget|override)\b.{0,40}\b(previous|prior|above|earlier|all|system|instructions?|rules?)\b/i, 'asks the model to ignore other instructions'],
  [/\b(system prompt|developer message|jailbreak|DAN mode|no (content )?filter|without (any )?restrictions)\b/i, 'talks about the model\'s own rules'],
  [/\b(api[ _-]?key|password|token|credit card|localStorage|document\.cookie)\b/i, 'mentions keys, passwords or browser storage'],
  [/https?:\/\/\S+/i, 'contains a web link'],
  [/<\s*(script|iframe|img)\b/i, 'contains HTML'],
  [/^\s*(system|assistant|user)\s*:/im, 'pretends to be a chat role']
];

export interface PromptFlag {
  section: string;
  line: string;
  why: string;
}

/** Lines worth a second look. A flag is a warning for the player, not a block. */
export function flagPrompt(sections: PromptSection[]): PromptFlag[] {
  const flags: PromptFlag[] = [];
  for (const s of sections) {
    for (const line of s.text.split('\n')) {
      for (const [re, why] of SUSPICIOUS) {
        const m = re.exec(line);
        if (m) {
          // The words around the match, so a long scene brief still shows the part that matters.
          const from = Math.max(0, m.index - 80);
          const to = Math.min(line.length, m.index + m[0].length + 120);
          flags.push({ section: s.title, line: `${from ? '…' : ''}${line.slice(from, to).trim()}${to < line.length ? '…' : ''}`, why });
          break;
        }
      }
    }
  }
  return flags;
}

async function artBytes(story: Story, artId: string): Promise<Uint8Array | null> {
  const url = artUrl(story, artId);
  if (!url) return null;
  try {
    let blob = await idb.get<Blob>('artCache', url);
    if (!blob && !url.startsWith(LOCAL_ART)) {
      const res = await fetch(url);
      if (res.ok) blob = await res.blob();
    }
    return blob ? new Uint8Array(await blob.arrayBuffer()) : null;
  } catch (_) {
    return null;
  }
}

/** A package zip for one story: <id>/story.json and <id>/art/*.webp. Lists art it could not include. */
export async function exportStoryPackage(story: Story): Promise<{ blob: Blob; fileName: string; missingArt: string[] }> {
  const id = story.meta.id;
  const clean: Story = structuredClone(story);
  // Device-only or hosted locations mean nothing on another device; the files travel in the zip.
  for (const a of Object.values(clean.art)) delete a.url;
  const files: Record<string, Uint8Array> = { [`${id}/story.json`]: strToU8(JSON.stringify(clean, null, 2)) };
  const missingArt: string[] = [];
  for (const [artId, a] of Object.entries(story.art)) {
    const bytes = await artBytes(story, artId);
    if (bytes) files[`${id}/art/${a.file}`] = bytes;
    else missingArt.push(a.file);
  }
  const zipped = zipSync(files, { level: 0 });
  return { blob: new Blob([zipped as BlobPart], { type: 'application/zip' }), fileName: `${id}.zip`, missingArt };
}
