/**
 * Story import in the app (Phase 4): a package folder, a zip of one package, or a zip or
 * folder holding many (batch import for the content track). Each package is a story.json
 * with its art/*.webp beside it. Packages are checked with the same validator as
 * story:check, art is kept in IndexedDB, and nothing broken is installed.
 */
import { unzipSync } from 'fflate';
import { idb } from '../storage/db';
import { LOCAL_ART } from './art';
import type { Story } from './schema';
import { checkStory, formatIssues } from './validate';

export const MAX_ART_BYTES = 250 * 1024;

export interface PackageFile {
  /** Path inside the import, with forward slashes, e.g. "lantern/art/cover.webp". */
  path: string;
  bytes: Uint8Array;
}

export interface ImportResult {
  dir: string;
  id?: string;
  title?: string;
  ok: boolean;
  /** Validator errors (and other reasons) when not installed; warnings when installed. */
  report: string;
  replaced?: boolean;
}

/** Expands zips into their files; other files pass through. */
export function expandFiles(files: PackageFile[]): PackageFile[] {
  const out: PackageFile[] = [];
  for (const f of files) {
    if (!/\.zip$/i.test(f.path)) {
      out.push(f);
      continue;
    }
    const base = f.path.replace(/\.zip$/i, '');
    const entries = unzipSync(f.bytes);
    for (const [p, bytes] of Object.entries(entries)) {
      if (p.endsWith('/') || /(^|\/)(__MACOSX|\.DS_Store)/.test(p)) continue;
      out.push({ path: `${base}/${p}`, bytes });
    }
  }
  return out.map((f) => ({ ...f, path: f.path.replace(/\\/g, '/').replace(/^\/+/, '') }));
}

/** Groups files into packages: every folder that holds a story.json. */
export function findPackages(files: PackageFile[]): Array<{ dir: string; story: PackageFile; art: PackageFile[] }> {
  const stories = files.filter((f) => /(^|\/)story\.json$/i.test(f.path));
  return stories.map((story) => {
    const dir = story.path.replace(/story\.json$/i, '');
    const art = files.filter((f) => f.path.startsWith(`${dir}art/`) && !f.path.slice(`${dir}art/`.length).includes('/'));
    return { dir: dir.replace(/\/$/, '') || '(top level)', story, art };
  });
}

const decoder = new TextDecoder();

/** Checks one package; returns the story ready to store, with art URLs pointing at IndexedDB. */
export function preparePackage(pkg: { dir: string; story: PackageFile; art: PackageFile[] }, builtInIds: Set<string>): { result: ImportResult; story?: Story; art?: Array<{ key: string; bytes: Uint8Array }> } {
  let raw: unknown;
  try {
    raw = JSON.parse(decoder.decode(pkg.story.bytes));
  } catch (e) {
    return { result: { dir: pkg.dir, ok: false, report: `story.json is not valid JSON: ${e instanceof Error ? e.message : String(e)}` } };
  }
  const names = pkg.art.map((a) => a.path.split('/').pop()!);
  const check = checkStory(raw, names);
  if (!check.ok || !check.story) return { result: { dir: pkg.dir, ok: false, report: formatIssues(check) } };
  const story = structuredClone(check.story);
  const id = story.meta.id;
  if (builtInIds.has(id)) return { result: { dir: pkg.dir, id, title: story.meta.title, ok: false, report: `"${id}" is already built into the app, so it cannot be replaced by an import. Give the story another id.` } };
  const used = new Set(Object.values(story.art).map((a) => a.file));
  const tooBig = pkg.art.filter((a) => used.has(a.path.split('/').pop()!) && a.bytes.length > MAX_ART_BYTES).map((a) => a.path.split('/').pop());
  if (tooBig.length) return { result: { dir: pkg.dir, id, title: story.meta.title, ok: false, report: `These images are over 250 KB; re-export them smaller: ${tooBig.join(', ')}` } };
  const art: Array<{ key: string; bytes: Uint8Array }> = [];
  for (const [artId, a] of Object.entries(story.art)) {
    const file = pkg.art.find((f) => f.path.endsWith(`/${a.file}`) || f.path === a.file);
    if (!file) continue;
    const key = `${LOCAL_ART}${id}/${a.file}`;
    story.art[artId] = { ...a, url: key };
    art.push({ key, bytes: file.bytes });
  }
  return { result: { dir: pkg.dir, id, title: story.meta.title, ok: true, report: check.warnings.length ? formatIssues({ ...check, issues: [] }) : '' }, story, art };
}

export interface StoredStory {
  story: Story;
  importedAt: number;
}

/** Imports every package found; returns one result per package. */
export async function importPackages(files: PackageFile[], builtInIds: Set<string>): Promise<ImportResult[]> {
  const packages = findPackages(expandFiles(files));
  if (!packages.length) return [{ dir: '(import)', ok: false, report: 'No story.json was found. Pick a story package folder, or a zip that contains one or more.' }];
  const results: ImportResult[] = [];
  for (const pkg of packages) {
    const prepared = preparePackage(pkg, builtInIds);
    if (prepared.story && prepared.art) {
      const existing = await idb.get<StoredStory>('userStories', prepared.story.meta.id);
      for (const a of prepared.art) await idb.put('artCache', a.key, new Blob([a.bytes as BlobPart], { type: 'image/webp' }));
      await idb.put<StoredStory>('userStories', prepared.story.meta.id, { story: prepared.story, importedAt: Date.now() });
      prepared.result.replaced = !!existing;
    }
    results.push(prepared.result);
  }
  return results;
}

export async function listImportedStories(): Promise<Story[]> {
  return (await idb.all<StoredStory>('userStories')).map((s) => s.story);
}

export async function removeImportedStory(id: string): Promise<void> {
  const s = await idb.get<StoredStory>('userStories', id);
  if (!s) return;
  for (const a of Object.values(s.story.art)) if (a.url?.startsWith(LOCAL_ART)) await idb.delete('artCache', a.url);
  await idb.delete('userStories', id);
}

/** Reads files picked in a file or folder input. Folder picks keep their relative paths. */
export async function readPicked(list: FileList | File[]): Promise<PackageFile[]> {
  const files = Array.from(list);
  return Promise.all(
    files.map(async (f) => ({
      path: (f as File & { webkitRelativePath?: string }).webkitRelativePath || f.name,
      bytes: new Uint8Array(await f.arrayBuffer())
    }))
  );
}
