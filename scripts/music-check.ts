/**
 * Music manifest check (M10): every category has a track, keys and file names line up,
 * and with --online every URL answers with audio. Pass --base=<url> to check a
 * self-hosted copy (the same value as VITE_MUSIC_BASE).
 *
 *   npm run music:check
 *   npm run music:check -- --online --base=https://pub-xxxx.r2.dev/music
 */
import { CATEGORY_IDS } from '../src/content/categoryIds';
import { CATEGORY_TRACKS, HOME_TRACK, resolveTrackUrl, trackFileName } from '../src/audio/catalog';

const online = process.argv.includes('--online');
const base = (process.argv.find((a) => a.startsWith('--base='))?.slice(7) ?? '').replace(/\/+$/, '');
const errors: string[] = [];

for (const id of CATEGORY_IDS) {
  const t = (CATEGORY_TRACKS as Record<string, typeof HOME_TRACK>)[id];
  if (!t) errors.push(`${id}: no track`);
  else if (t.key !== id) errors.push(`${id}: track key is "${t.key}"`);
}
for (const k of Object.keys(CATEGORY_TRACKS)) if (!(CATEGORY_IDS as readonly string[]).includes(k)) errors.push(`${k}: track for a category the site does not have`);

const tracks = [HOME_TRACK, ...Object.values(CATEGORY_TRACKS)];
console.log('Files to host (when VITE_MUSIC_BASE is set):');
for (const t of tracks) console.log(`  ${trackFileName(t.key).padEnd(28)} ${t.label} | ${t.license} | from ${t.url}`);

if (online) {
  for (const t of tracks) {
    const url = resolveTrackUrl(t, base);
    try {
      const res = await fetch(url, { method: 'GET', headers: { Range: 'bytes=0-1023' } });
      const type = res.headers.get('content-type') ?? '';
      if (!res.ok) errors.push(`${t.key}: ${res.status} from ${url}`);
      else if (!/audio|octet-stream/.test(type)) errors.push(`${t.key}: ${url} is "${type}", not audio`);
      else console.log(`ok    ${t.key}`);
    } catch (e) {
      errors.push(`${t.key}: unreachable ${url} (${e instanceof Error ? e.message : e})`);
    }
  }
}

for (const e of errors) console.log(`error ${e}`);
console.log(`\n${errors.length} error(s).`);
process.exit(errors.length ? 1 : 0);
