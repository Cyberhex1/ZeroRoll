/**
 * Writes a dump made by backup-firestore.ts back into Firestore, additively.
 *
 * - Never deletes anything.
 * - By default skips any document that already exists. With --overwrite-older,
 *   replaces an existing document only when the dump's updatedAt is newer.
 * - Dry run unless --confirm is passed: prints what it would write.
 *
 *   GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json \
 *     npm run restore:firestore -- --from backups/2026-11-04T... [--only users.experiences] [--confirm]
 */
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { decode, DumpLine } from './firestoreDump';

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}
const flag = (name: string) => process.argv.includes(`--${name}`);

const from = arg('from');
if (!from) {
  console.error('Usage: npm run restore:firestore -- --from <backup dir> [--only <bucket>] [--overwrite-older] [--confirm]');
  process.exit(1);
}
const confirm = flag('confirm');
const overwriteOlder = flag('overwrite-older');
const only = arg('only');

const config = JSON.parse(readFileSync(new URL('../firebase-applet-config.json', import.meta.url), 'utf8'));
const projectId = arg('project') || config.projectId;
const databaseId = arg('database') || config.firestoreDatabaseId || '(default)';
const app = initializeApp({ credential: applicationDefault(), projectId });
const db = databaseId === '(default)' ? getFirestore(app) : getFirestore(app, databaseId);

const ts = (d: any) => {
  const t = new Date(d?.updatedAt || d?.createdAt || 0).getTime();
  return Number.isFinite(t) ? t : 0;
};

const tally = { written: 0, skippedExisting: 0, skippedNewer: 0 };
for (const file of readdirSync(from).filter((f) => f.endsWith('.jsonl'))) {
  const bucket = file.replace(/\.jsonl$/, '');
  if (only && bucket !== only) continue;
  const lines = readFileSync(join(from, file), 'utf8').split('\n').filter(Boolean);
  console.log(`${bucket}: ${lines.length} document(s)`);
  for (const line of lines) {
    const { path, data } = JSON.parse(line) as DumpLine;
    const ref = db.doc(path);
    const existing = await ref.get();
    if (existing.exists) {
      if (!overwriteOlder) { tally.skippedExisting++; continue; }
      if (ts(existing.data()) >= ts(data)) { tally.skippedNewer++; continue; }
    }
    if (confirm) await ref.set(decode(data, db) as FirebaseFirestore.DocumentData);
    else console.log(`  would write ${path}`);
    tally.written++;
  }
}
console.log(JSON.stringify({ dryRun: !confirm, ...tally }, null, 2));
if (!confirm) console.log('Dry run only. Re-run with --confirm to write.');
