/**
 * Dumps every Firestore document (all top-level collections and every
 * subcollection under them, e.g. users/{uid} and users/{uid}/experiences/{id})
 * to backups/<date>/<bucket>.jsonl plus counts.json.
 *
 * Read-only. Run it before Phase 0 merges, before the Phase 3 storage
 * migration, and after it to compare counts.
 *
 *   GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json npm run backup:firestore
 *   npm run backup:firestore -- --out backups/manual --database "(default)"
 *
 * The service-account file stays on your machine. backups/ is git-ignored.
 */
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore, DocumentReference, CollectionReference } from 'firebase-admin/firestore';
import { mkdirSync, createWriteStream, writeFileSync, WriteStream, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { encode, bucketFor } from './firestoreDump';

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const config = JSON.parse(readFileSync(new URL('../firebase-applet-config.json', import.meta.url), 'utf8'));
const projectId = arg('project') || config.projectId;
const databaseId = arg('database') || config.firestoreDatabaseId || '(default)';
const outDir = arg('out') || join('backups', new Date().toISOString().replace(/[:.]/g, '-'));

const app = initializeApp({ credential: applicationDefault(), projectId });
const db = databaseId === '(default)' ? getFirestore(app) : getFirestore(app, databaseId);

mkdirSync(outDir, { recursive: true });
const streams = new Map<string, WriteStream>();
const counts: Record<string, number> = {};

function write(path: string, data: unknown) {
  const bucket = bucketFor(path);
  let s = streams.get(bucket);
  if (!s) {
    s = createWriteStream(join(outDir, `${bucket}.jsonl`));
    streams.set(bucket, s);
  }
  s.write(JSON.stringify({ path, data: encode(data) }) + '\n');
  counts[bucket] = (counts[bucket] || 0) + 1;
}

async function dumpCollection(col: CollectionReference) {
  // listDocuments also returns "missing" parents that only exist because they have subcollections.
  const refs = await col.listDocuments();
  for (const ref of refs) await dumpDoc(ref);
}

async function dumpDoc(ref: DocumentReference) {
  const snap = await ref.get();
  if (snap.exists) write(ref.path, snap.data());
  for (const sub of await ref.listCollections()) await dumpCollection(sub);
}

const started = Date.now();
for (const col of await db.listCollections()) {
  console.log(`Dumping ${col.id}…`);
  await dumpCollection(col);
}
await Promise.all([...streams.values()].map((s) => new Promise((r) => s.end(r))));
const summary = { projectId, databaseId, finishedAt: new Date().toISOString(), seconds: (Date.now() - started) / 1000, counts };
writeFileSync(join(outDir, 'counts.json'), JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
console.log(`Backup written to ${outDir}`);
