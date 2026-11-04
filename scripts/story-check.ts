/**
 * npm run story:check [dir ...]
 * Checks story packages (story.json plus art) and prints every problem with where it is
 * and what to change. With no arguments, checks every package under stories/.
 * Exits 1 when any package has an error, so CI can run it.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { checkStory, formatIssues } from '../src/story/validate';

function artFilesFor(dir: string, id: string | undefined): string[] {
  for (const candidate of [join(dir, 'art'), id ? join('public', 'story-art', id) : '']) {
    if (candidate && existsSync(candidate)) return readdirSync(candidate);
  }
  return [];
}

const args = process.argv.slice(2);
const dirs = args.length
  ? args
  : existsSync('stories')
    ? readdirSync('stories').map((d) => join('stories', d)).filter((d) => statSync(d).isDirectory())
    : [];

let failed = 0;
for (const dir of dirs) {
  const file = join(dir, 'story.json');
  if (!existsSync(file)) {
    console.log(`\n${dir}: no story.json here.`);
    failed++;
    continue;
  }
  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(file, 'utf8'));
  } catch (err) {
    console.log(`\n${file}: not valid JSON (${(err as Error).message}).`);
    failed++;
    continue;
  }
  const id = (raw as { meta?: { id?: string } })?.meta?.id;
  const check = checkStory(raw, artFilesFor(resolve(dir), id));
  const label = check.ok ? 'OK' : `${check.issues.length} error(s)`;
  console.log(`\n${file}: ${label}${check.warnings.length ? `, ${check.warnings.length} warning(s)` : ''}`);
  const report = formatIssues(check);
  if (report) console.log(report);
  if (!check.ok) failed++;
}
if (!dirs.length) console.log('No story packages found.');
process.exit(failed ? 1 : 0);
