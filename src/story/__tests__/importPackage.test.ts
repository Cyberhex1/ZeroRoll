import 'fake-indexeddb/auto';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { zipSync } from 'fflate';
import { resetDbForTests } from '../../storage/db';
import { importPackages, listImportedStories, removeImportedStory } from '../importPackage';
import { idb } from '../../storage/db';

const root = join(__dirname, '../../..');
const storyJson = JSON.parse(readFileSync(join(root, 'stories/lantern-of-hollowmere/story.json'), 'utf8'));
const artDir = join(root, 'public/story-art/lantern-of-hollowmere');
const art = Object.fromEntries(readdirSync(artDir).map((f) => [f, new Uint8Array(readFileSync(join(artDir, f)))]));
const enc = (v: unknown) => new TextEncoder().encode(JSON.stringify(v));

const pkg = (id: string, prefix = '') => {
  const s = { ...storyJson, meta: { ...storyJson.meta, id, title: `Copy ${id}` } };
  return { [`${prefix}story.json`]: enc(s), ...Object.fromEntries(Object.entries(art).map(([f, b]) => [`${prefix}art/${f}`, b])) };
};

describe('story import in the app', () => {
  beforeEach(() => {
    indexedDB.deleteDatabase('zeroroll');
    resetDbForTests();
  });

  it('imports a batch zip, stores art locally, and refuses broken or built-in packages', async () => {
    const broken = { ...storyJson, meta: { ...storyJson.meta, id: 'broken-one' }, start: 'nowhere' };
    const zip = zipSync({ ...pkg('copy-a', 'a/'), ...pkg('copy-b', 'b/'), 'c/story.json': enc(broken), ...pkg('lantern-of-hollowmere', 'd/') });
    const results = await importPackages([{ path: 'batch.zip', bytes: zip }], new Set(['lantern-of-hollowmere']));
    expect(results.map((r) => [r.dir, r.ok])).toEqual([
      ['batch/a', true],
      ['batch/b', true],
      ['batch/c', false],
      ['batch/d', false]
    ]);
    expect(results[3].report).toMatch(/already built into the app/);
    const stored = await listImportedStories();
    expect(stored.map((s) => s.meta.id).sort()).toEqual(['copy-a', 'copy-b']);
    const cover = stored[0].art[stored[0].meta.cover!];
    expect(cover.url).toMatch(/^zr-local:copy-/);
    expect(await idb.get('artCache', cover.url!)).toBeTruthy();
    await removeImportedStory('copy-a');
    expect((await listImportedStories()).map((s) => s.meta.id)).toEqual(['copy-b']);
    expect(await idb.get('artCache', `zr-local:copy-a/${cover.url!.split('/').pop()}`)).toBeUndefined();
  });

  it('imports a picked folder and marks a re-import as an update', async () => {
    const files = Object.entries(pkg('folder-story')).map(([p, bytes]) => ({ path: `myfolder/${p}`, bytes }));
    expect((await importPackages(files, new Set()))[0]).toMatchObject({ ok: true, replaced: false });
    expect((await importPackages(files, new Set()))[0]).toMatchObject({ ok: true, replaced: true });
    expect((await importPackages([{ path: 'notes.txt', bytes: enc('x') }], new Set()))[0].report).toMatch(/No story.json/);
  });
});
