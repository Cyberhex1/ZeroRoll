/**
 * Story mode saves: one resumable save per story (saved after every turn), the player's
 * progress map across playthroughs, and JSON export/import of a save.
 */
import { idb } from './db';
import type { StoryState } from '../story/engine';
import type { Story } from '../story/schema';
import type { Tier } from '../ai/router';
import type { MemoryState } from '../memory/memoryStore';

export interface StoryMessage {
  id: string;
  kind: 'player' | 'narrator' | 'art' | 'note';
  text?: string;
  /** Art id for kind "art". */
  art?: string;
  /** The beat the story was in when this message was written. */
  beat: string;
  /** "Google Gemini (gemini-flash-latest), good tier" on narrator messages. */
  answeredBy?: string;
  /** Choices offered after this narrator message. */
  chips?: Array<{ label: string; choiceId?: string }>;
  at: number;
}

export interface StorySave {
  version: 1;
  storyId: string;
  state: StoryState;
  messages: StoryMessage[];
  /** Memory list, summary and pending facts. Missing on saves from before Phase 3. */
  memory?: MemoryState;
  /** Reply length slider, 0 short to 2 long. */
  length: number;
  tier: Tier;
  updatedAt: number;
  /** updatedAt of the cloud backup this save last matched; a cloud copy newer than it came from elsewhere. */
  cloudBase?: number;
}

export interface StoryProgress {
  storyId: string;
  /** Every beat ever entered, across playthroughs. */
  beatsSeen: string[];
  /** Endings reached, across playthroughs. */
  endings: string[];
  playthroughs: number;
}

export interface SaveExport {
  kind: 'zeroroll-story-save';
  version: 1;
  exportedAt: string;
  save: StorySave;
  progress?: StoryProgress;
}

export const StoryRepository = {
  load: (storyId: string) => idb.get<StorySave>('storySaves', storyId),
  /** Writes the save stamped with the time, and returns the stamped save. */
  async save<T extends StorySave>(save: T): Promise<T> {
    const stamped = { ...save, updatedAt: Math.max(Date.now(), save.updatedAt + 1) };
    await idb.put('storySaves', save.storyId, stamped);
    return stamped;
  },
  /** Records that the cloud now holds the save made at `at`, without counting as a new save. */
  async markBackedUp(storyId: string, at: number): Promise<void> {
    const cur = await idb.get<StorySave>('storySaves', storyId);
    if (cur) await idb.put('storySaves', storyId, { ...cur, cloudBase: Math.max(cur.cloudBase ?? 0, at) });
  },
  remove: (storyId: string) => idb.delete('storySaves', storyId),
  list: () => idb.all<StorySave>('storySaves').then((all) => all.sort((a, b) => b.updatedAt - a.updatedAt)),

  progress: async (storyId: string): Promise<StoryProgress> => (await idb.get<StoryProgress>('storyProgress', storyId)) ?? { storyId, beatsSeen: [], endings: [], playthroughs: 0 },
  allProgress: () => idb.all<StoryProgress>('storyProgress'),

  /** Records the beats of a state (and its ending) in the progress map. */
  async recordProgress(state: StoryState, finishedPlaythrough = false): Promise<StoryProgress> {
    const p = await StoryRepository.progress(state.storyId);
    const next: StoryProgress = {
      storyId: state.storyId,
      beatsSeen: [...new Set([...p.beatsSeen, ...state.visited])],
      endings: state.ending ? [...new Set([...p.endings, state.ending])] : p.endings,
      playthroughs: p.playthroughs + (finishedPlaythrough ? 1 : 0)
    };
    await idb.put('storyProgress', state.storyId, next);
    return next;
  },

  async exportSave(storyId: string): Promise<SaveExport | null> {
    const save = await StoryRepository.load(storyId);
    if (!save) return null;
    return { kind: 'zeroroll-story-save', version: 1, exportedAt: new Date().toISOString(), save, progress: await StoryRepository.progress(storyId) };
  },

  /** Imports an exported save after checking it belongs to a story that is installed. */
  async importSave(data: unknown, stories: Story[]): Promise<StorySave> {
    const save = parseExport(data, stories);
    await StoryRepository.save(save.save);
    if (save.progress) {
      const mine = await StoryRepository.progress(save.save.storyId);
      await idb.put('storyProgress', save.save.storyId, {
        storyId: save.save.storyId,
        beatsSeen: [...new Set([...mine.beatsSeen, ...save.progress.beatsSeen])],
        endings: [...new Set([...mine.endings, ...save.progress.endings])],
        playthroughs: Math.max(mine.playthroughs, save.progress.playthroughs)
      });
    }
    return save.save;
  }
};

export function parseExport(data: unknown, stories: Story[]): SaveExport {
  const d = data as SaveExport;
  if (!d || d.kind !== 'zeroroll-story-save' || d.version !== 1 || !d.save) throw new Error('This file is not a ZeroRoll story save.');
  const story = stories.find((s) => s.meta.id === d.save.storyId);
  if (!story) throw new Error(`The save is for a story that is not installed ("${d.save.storyId}").`);
  const beats = new Set(story.beats.map((b) => b.id));
  const st = d.save.state;
  if (!st || !beats.has(st.beat) || !Array.isArray(st.visited) || !st.visited.every((b) => beats.has(b)) || typeof st.flags !== 'object') {
    throw new Error('The save does not match this version of the story, so it was not imported.');
  }
  if (!Array.isArray(d.save.messages)) throw new Error('The save has no messages.');
  const mem = d.save.memory;
  if (mem && (!Array.isArray(mem.entries) || !Array.isArray(mem.pending) || typeof mem.summary !== 'string' || typeof mem.summarizedThrough !== 'number')) {
    // A damaged memory list should not cost the player the whole save.
    return { ...d, save: { ...d.save, memory: undefined } };
  }
  return d;
}
