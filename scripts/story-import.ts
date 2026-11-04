/**
 * npm run story:import <package-dir> [--dry-run]
 *
 * Installs a story package that passed story:check:
 *   1. checks it (story.json plus <package-dir>/art/*.webp, 250 KB or less each),
 *   2. uploads the art to Cloudflare R2 when R2 is configured, and writes each image's
 *      public URL into the story's art list; without R2 it copies the art into
 *      public/story-art/<id>/ so the dev server and preview builds can show it,
 *   3. writes stories/<id>/story.json.
 *
 * R2 settings (environment variables, never committed):
 *   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET,
 *   R2_PUBLIC_BASE   the bucket's public URL, e.g. https://art.zeroroll.app
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { AwsClient } from 'aws4fetch';
import { checkStory, formatIssues } from '../src/story/validate';

const MAX_ART_BYTES = 250 * 1024;

const [dir, ...flags] = process.argv.slice(2);
const dryRun = flags.includes('--dry-run');
if (!dir) {
  console.log('Usage: npm run story:import <package-dir> [--dry-run]');
  process.exit(1);
}

const raw = JSON.parse(readFileSync(join(dir, 'story.json'), 'utf8'));
const artDir = join(dir, 'art');
const artFiles = existsSync(artDir) ? readdirSync(artDir) : [];
const check = checkStory(raw, artFiles);
if (!check.ok || !check.story) {
  console.log(formatIssues(check));
  console.log('\nNot imported. Fix the errors above, then run story:import again.');
  process.exit(1);
}
const story = check.story;
const used = Object.values(story.art).map((a) => a.file);
const tooBig = used.filter((f) => existsSync(join(artDir, f)) && statSync(join(artDir, f)).size > MAX_ART_BYTES);
if (tooBig.length) {
  console.log(`These images are over 250 KB; re-export them smaller: ${tooBig.join(', ')}`);
  process.exit(1);
}
if (check.warnings.length) console.log(formatIssues({ ...check, issues: [] }));

const env = process.env;
const r2 = env.R2_ACCOUNT_ID && env.R2_ACCESS_KEY_ID && env.R2_SECRET_ACCESS_KEY && env.R2_BUCKET && env.R2_PUBLIC_BASE;
const id = story.meta.id;

async function main() {
  if (r2) {
    const client = new AwsClient({ accessKeyId: env.R2_ACCESS_KEY_ID!, secretAccessKey: env.R2_SECRET_ACCESS_KEY!, service: 's3', region: 'auto' });
    const endpoint = `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${env.R2_BUCKET}`;
    const publicBase = env.R2_PUBLIC_BASE!.replace(/\/+$/, '');
    for (const [artId, a] of Object.entries(story.art)) {
      const key = `${id}/${a.file}`;
      if (dryRun) {
        console.log(`would upload ${key}`);
      } else {
        const res = await client.fetch(`${endpoint}/${key}`, {
          method: 'PUT',
          body: readFileSync(join(artDir, a.file)),
          headers: { 'Content-Type': 'image/webp', 'Cache-Control': 'public, max-age=31536000, immutable' }
        });
        if (!res.ok) throw new Error(`Upload of ${key} failed: HTTP ${res.status} ${await res.text()}`);
        console.log(`uploaded ${key}`);
      }
      story.art[artId] = { ...a, url: `${publicBase}/${key}` };
    }
  } else {
    const out = join('public', 'story-art', id);
    console.log(`R2 is not configured, so the art goes to ${out}/ (served by the dev server and preview builds).`);
    if (!dryRun) mkdirSync(out, { recursive: true });
    for (const a of Object.values(story.art)) {
      if (dryRun) console.log(`would copy ${a.file}`);
      else copyFileSync(join(artDir, a.file), join(out, a.file));
    }
  }

  const target = join('stories', id, 'story.json');
  if (dryRun) {
    console.log(`would write ${target}`);
  } else {
    mkdirSync(join('stories', id), { recursive: true });
    writeFileSync(target, JSON.stringify(story, null, 2) + '\n');
    console.log(`wrote ${target}`);
  }
  console.log(`\n"${story.meta.title}" ${dryRun ? 'would be' : 'is'} installed. It appears in Story mode under ${story.meta.category}.`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
