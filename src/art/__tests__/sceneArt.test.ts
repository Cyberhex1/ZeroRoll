import { describe, expect, it, beforeEach } from 'vitest';
import { approxFreeDailyLimit } from '../../ai/quota';
import {
  buildScenePrompt,
  getSceneArtMode,
  getSceneArtModel,
  imageProbeCandidates,
  isImageModel,
  pictureCostLabel,
  SPEND_CAP,
  sceneMoment,
  setSceneArtModel,
  setUsableImageModels
} from '../sceneArt';

class MemoryStorage {
  private m = new Map<string, string>();
  getItem(k: string) { return this.m.has(k) ? this.m.get(k)! : null; }
  setItem(k: string, v: string) { this.m.set(k, String(v)); }
  removeItem(k: string) { this.m.delete(k); }
  clear() { this.m.clear(); }
}
(globalThis as any).localStorage = new MemoryStorage();

describe('sceneMoment', () => {
  it('paints nothing on an ordinary turn', () => {
    expect(sceneMoment({ turn: 5, previousLocation: 'The Docks', delta: { hpDelta: -2 } })).toBeNull();
  });
  it('paints a new place, but not the same place spelled differently', () => {
    expect(sceneMoment({ turn: 5, previousLocation: 'The Docks', delta: { locationUpdate: 'Salt Market' } })).toBe('new place');
    expect(sceneMoment({ turn: 5, previousLocation: 'The Docks', delta: { locationUpdate: 'docks' } })).toBeNull();
  });
  it('keeps a gap between ordinary key moments', () => {
    expect(sceneMoment({ turn: 6, lastArtTurn: 5, delta: { locationUpdate: 'Salt Market' } })).toBeNull();
    expect(sceneMoment({ turn: 8, lastArtTurn: 5, delta: { locationUpdate: 'Salt Market' } })).toBe('new place');
  });
  it('always paints chapter changes and endings', () => {
    const alert = (type: any) => [{ id: 'a', timestamp: '', title: 'x', subtitle: '', description: '', type }];
    expect(sceneMoment({ turn: 6, lastArtTurn: 5, alerts: alert('chapter_transition') })).toBe('new chapter');
    expect(sceneMoment({ turn: 6, lastArtTurn: 5, alerts: alert('story_conclusion') })).toBe('ending');
    expect(sceneMoment({ turn: 6, lastArtTurn: 5, alerts: alert('twist') })).toBeNull();
    expect(sceneMoment({ turn: 9, lastArtTurn: 5, alerts: alert('twist') })).toBe('twist');
    expect(sceneMoment({ turn: 9, alerts: alert('opportunity') })).toBeNull();
  });
  it('treats a hero transformation as a key moment', () => {
    expect(sceneMoment({ turn: 9, transformed: true })).toBe('transformation');
  });
});

describe('buildScenePrompt', () => {
  it('carries the passage, the look, the place and the hero, and forbids text in the image', () => {
    const p = buildScenePrompt({
      category: 'horror',
      sceneText: 'The lighthouse door swings open on its own.',
      reason: 'new place',
      location: 'Gull Point Light',
      hero: { raceOrigin: 'Human', roleClass: 'Rogue', physicalDescription: 'a scarred woman in a grey oilskin', gender: 'she/her' }
    });
    expect(p).toContain('The lighthouse door swings open on its own.');
    expect(p).toContain('horror anime');
    expect(p).toContain('Gull Point Light');
    expect(p).toContain('grey oilskin');
    expect(p).toMatch(/Do not put any text/);
  });
});

describe('image models', () => {
  beforeEach(() => localStorage.clear());
  it('recognises image models and offers only known ones the key lists', () => {
    expect(isImageModel('gemini-3.1-flash-lite-image')).toBe(true);
    expect(isImageModel('gemini-nano-banana-2.1')).toBe(true);
    expect(isImageModel('gemini-3.5-flash-lite')).toBe(false);
    expect(imageProbeCandidates(['gemini-3.1-flash-image', 'gemini-3.1-flash-image-preview', 'gemini-3.5-flash'])).toEqual(['gemini-3.1-flash-image']);
  });
  it('is off by default and picks the cheapest usable model', () => {
    expect(getSceneArtMode()).toBe('off');
    expect(getSceneArtModel()).toBeNull();
    setUsableImageModels(['gemini-3-pro-image', 'gemini-3.1-flash-lite-image']);
    expect(getSceneArtModel()).toBe('gemini-3.1-flash-lite-image');
    setSceneArtModel('gemini-3-pro-image');
    expect(getSceneArtModel()).toBe('gemini-3-pro-image');
    setSceneArtModel('gemini-3.1-flash-image');
    expect(getSceneArtModel()).toBe('gemini-3.1-flash-lite-image');
  });
  it('prices a picture and keeps image models out of the free-limit hint', () => {
    expect(pictureCostLabel('gemini-3.1-flash-lite-image')).toBe('about 3.4¢');
    expect(pictureCostLabel('gemini-3-pro-image')).toBe('about 13¢');
    expect(approxFreeDailyLimit('gemini-3.1-flash-lite-image')).toBeUndefined();
    expect(approxFreeDailyLimit('gemini-3.5-flash-lite')).toBe(500);
  });
});

describe('spend cap', () => {
  it('recognises the spend-cap 429 so it is not shown as a short rate limit', () => {
    expect(SPEND_CAP.test('Your project has exceeded its monthly spending cap. Please go to AI Studio')).toBe(true);
    expect(SPEND_CAP.test('Resource has been exhausted (e.g. check quota).')).toBe(false);
  });
});
