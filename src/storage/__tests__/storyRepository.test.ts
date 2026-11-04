import 'fake-indexeddb/auto';
import { describe, it, expect } from 'vitest';
import example from '../../../stories/lantern-of-hollowmere/story.json';
import { checkStory } from '../../story/validate';
import { Story } from '../../story/schema';
import { applyChoice, newState } from '../../story/engine';
import { StoryRepository, StorySave } from '../storyRepository';

const story = checkStory(example).story as Story;
const saveOf = (state = newState(story)): StorySave => ({ version: 1, storyId: story.meta.id, state, messages: [{ id: 'm1', kind: 'narrator', text: 'Dusk.', beat: state.beat, at: 1 }], length: 1, tier: 'good', updatedAt: 0 });

describe('StoryRepository', () => {
  it('saves, lists, resumes and removes a story save', async () => {
    await StoryRepository.save(saveOf());
    const loaded = await StoryRepository.load(story.meta.id);
    expect(loaded?.messages[0].text).toBe('Dusk.');
    expect(loaded!.updatedAt).toBeGreaterThan(0);
    expect((await StoryRepository.list()).map((s) => s.storyId)).toContain(story.meta.id);
    await StoryRepository.remove(story.meta.id);
    expect(await StoryRepository.load(story.meta.id)).toBeUndefined();
  });

  it('records beats and endings across playthroughs', async () => {
    let s = newState(story);
    for (const c of ['help_chain', 'cross', 'relight', 'row_on', 'read_board', 'leave']) s = applyChoice(story, s, c).state;
    const p = await StoryRepository.recordProgress(s, true);
    expect(p.endings).toEqual(['leave_lake']);
    expect(p.beatsSeen).toEqual(expect.arrayContaining(['landing', 'crossing', 'tower', 'leave_lake']));
    expect(p.playthroughs).toBe(1);
  });

  it('exports and imports a save, and refuses one that does not match the story', async () => {
    await StoryRepository.save(saveOf());
    const file = JSON.parse(JSON.stringify(await StoryRepository.exportSave(story.meta.id)));
    await StoryRepository.remove(story.meta.id);
    await StoryRepository.importSave(file, [story]);
    expect((await StoryRepository.load(story.meta.id))?.state.beat).toBe('landing');

    await expect(StoryRepository.importSave({ kind: 'other' }, [story])).rejects.toThrow(/not a ZeroRoll story save/);
    const bad = { ...file, save: { ...file.save, state: { ...file.save.state, beat: 'gone' } } };
    await expect(StoryRepository.importSave(bad, [story])).rejects.toThrow(/does not match/);
  });
});
