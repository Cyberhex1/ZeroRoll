import { describe, expect, it } from 'vitest';
import { storyArtFileUrl } from '../art';

describe('storyArtFileUrl', () => {
  it('serves art that ships in public/story-art from the site', () => {
    expect(storyArtFileUrl('fan-diablo-the-sleepless-chapel', 'cover.webp')).toBe('/story-art/fan-diablo-the-sleepless-chapel/cover.webp');
    expect(storyArtFileUrl('lantern-of-hollowmere', 'cover.webp')).toBe('/story-art/lantern-of-hollowmere/cover.webp');
  });
  it('sends art that is not bundled to the art base', () => {
    const base = (import.meta.env.VITE_STORY_ART_BASE || '/story-art').replace(/\/+$/, '');
    expect(storyArtFileUrl('some-r2-only-story', 'cover.webp')).toBe(`${base}/some-r2-only-story/cover.webp`);
  });
});
