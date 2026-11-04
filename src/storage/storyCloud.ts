/**
 * Cloud backup of Story mode saves, for signed-in players (guest accounts included).
 *
 *   users/{uid}/stories/{storyId}               state, memory, settings, message count
 *   users/{uid}/stories/{storyId}/turns/{page}  50 messages per page
 *
 * The device save is written first and is what play reads; the cloud copy is a backup.
 * A backup never overwrites a cloud save that is newer than the one being written, so a
 * stale tab or device cannot clobber progress made elsewhere.
 */
import { collection, doc, getDoc, getDocs, writeBatch } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import type { StoryMessage, StorySave } from './storyRepository';

export const TURNS_PER_PAGE = 50;

export interface CloudStoryMeta extends Omit<StorySave, 'messages'> {
  messageCount: number;
  pages: number;
  pageHashes: string[];
}

export type BackupResult = { ok: true } | { ok: false; reason: 'signed_out' | 'newer_in_cloud' | 'error'; message: string };

export function cloudUid(): string | null {
  return auth.currentUser?.uid ?? null;
}

/** FNV-1a over a page's JSON: enough to tell whether a page changed. */
export function pageHash(messages: StoryMessage[]): string {
  const text = JSON.stringify(messages);
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36) + text.length.toString(36);
}

/**
 * Which pages to write for a save, given the page hashes the cloud copy has: pages whose
 * content changed (a new turn, or a reroll that rewrote the tail) are written, and pages
 * past the new end (after a restart) are deleted.
 */
export function planPages(prevHashes: string[], messages: StoryMessage[]): { write: Array<{ page: number; messages: StoryMessage[] }>; remove: number[]; hashes: string[] } {
  const pages = Math.ceil(messages.length / TURNS_PER_PAGE);
  const write = [];
  const hashes: string[] = [];
  for (let p = 0; p < pages; p++) {
    const slice = messages.slice(p * TURNS_PER_PAGE, (p + 1) * TURNS_PER_PAGE);
    hashes.push(pageHash(slice));
    if (prevHashes[p] !== hashes[p]) write.push({ page: p, messages: slice });
  }
  const remove = [];
  for (let p = pages; p < prevHashes.length; p++) remove.push(p);
  return { write, remove, hashes };
}

/** Firestore refuses undefined anywhere in a document. */
export function stripUndefined<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

const storyRef = (uid: string, storyId: string) => doc(db, 'users', uid, 'stories', storyId);
const pageRef = (uid: string, storyId: string, page: number) => doc(db, 'users', uid, 'stories', storyId, 'turns', String(page));

/**
 * True when the cloud copy changed since this save last matched it (another device or tab
 * saved), so writing would throw that progress away. A save that never matched the cloud
 * falls back to comparing times.
 */
export function cloudMovedOn(cloudUpdatedAt: number, save: Pick<StorySave, 'updatedAt' | 'cloudBase'>): boolean {
  if (cloudUpdatedAt === save.updatedAt) return false;
  return save.cloudBase !== undefined ? cloudUpdatedAt > save.cloudBase : cloudUpdatedAt > save.updatedAt;
}

export async function backupStorySave(save: StorySave, opts: { force?: boolean } = {}): Promise<BackupResult> {
  const uid = cloudUid();
  if (!uid) return { ok: false, reason: 'signed_out', message: 'Sign in to back up story saves.' };
  try {
    const remote = await getDoc(storyRef(uid, save.storyId));
    const prev = remote.exists() ? (remote.data() as CloudStoryMeta) : null;
    if (prev && cloudMovedOn(prev.updatedAt, save) && !opts.force) {
      return { ok: false, reason: 'newer_in_cloud', message: 'The cloud has a newer save for this story (from another device or tab), so it was not overwritten. Settings > Saves lets you pick which one to keep.' };
    }
    const { messages, ...rest } = save as StorySave & { undo?: unknown };
    delete (rest as { undo?: unknown }).undo;
    rest.cloudBase = save.updatedAt;
    const plan = planPages(prev?.pageHashes ?? [], messages);
    const batch = writeBatch(db);
    for (const w of plan.write) batch.set(pageRef(uid, save.storyId, w.page), stripUndefined({ messages: w.messages }));
    for (const p of plan.remove) batch.delete(pageRef(uid, save.storyId, p));
    const meta: CloudStoryMeta = { ...rest, messageCount: messages.length, pages: plan.hashes.length, pageHashes: plan.hashes };
    batch.set(storyRef(uid, save.storyId), stripUndefined(meta));
    await batch.commit();
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: 'error', message: e instanceof Error ? e.message : String(e) };
  }
}

export async function listCloudStories(): Promise<CloudStoryMeta[]> {
  const uid = cloudUid();
  if (!uid) return [];
  const snap = await getDocs(collection(db, 'users', uid, 'stories'));
  return snap.docs.map((d) => d.data() as CloudStoryMeta);
}

export async function cloudStoryMeta(storyId: string): Promise<CloudStoryMeta | null> {
  const uid = cloudUid();
  if (!uid) return null;
  const meta = await getDoc(storyRef(uid, storyId));
  return meta.exists() ? (meta.data() as CloudStoryMeta) : null;
}

export async function loadCloudStory(storyId: string): Promise<StorySave | null> {
  const uid = cloudUid();
  if (!uid) return null;
  const meta = await getDoc(storyRef(uid, storyId));
  if (!meta.exists()) return null;
  const { messageCount, pages, pageHashes: _hashes, ...rest } = meta.data() as CloudStoryMeta;
  const pageDocs = await Promise.all(Array.from({ length: pages }, (_, p) => getDoc(pageRef(uid, storyId, p))));
  const messages = pageDocs.flatMap((d) => (d.exists() ? ((d.data().messages as StoryMessage[]) ?? []) : []));
  if (messages.length !== messageCount) throw new Error(`The cloud save for this story is incomplete (${messages.length} of ${messageCount} messages).`);
  return { ...rest, messages };
}

/** Backs up with retries (2s, 5s, 15s), reporting each attempt. Gives up on a newer cloud save. */
export async function backupWithRetry(save: StorySave, onStatus: (s: BackupStatus) => void, waits = [2000, 5000, 15000]): Promise<BackupResult> {
  onStatus({ kind: 'saving' });
  for (let attempt = 0; ; attempt++) {
    const r = await backupStorySave(save);
    if (r.ok) {
      onStatus({ kind: 'saved', at: Date.now() });
      return r;
    }
    if (r.reason !== 'error' || attempt >= waits.length) {
      onStatus(r.reason === 'signed_out' ? { kind: 'local_only' } : { kind: 'failed', message: r.message });
      return r;
    }
    onStatus({ kind: 'retrying', attempt: attempt + 1, message: r.message });
    await new Promise((res) => setTimeout(res, waits[attempt]));
  }
}

export type BackupStatus =
  | { kind: 'idle' }
  | { kind: 'local_only' }
  | { kind: 'saving' }
  | { kind: 'saved'; at: number }
  | { kind: 'retrying'; attempt: number; message: string }
  | { kind: 'failed'; message: string };

export function describeBackup(s: BackupStatus): string {
  switch (s.kind) {
    case 'idle':
      return '';
    case 'local_only':
      return 'Saved on this device. Sign in to back it up.';
    case 'saving':
      return 'Saved on this device. Backing up…';
    case 'saved':
      return 'Saved on this device and backed up.';
    case 'retrying':
      return `Saved on this device. Backup failed, trying again (${s.attempt})…`;
    case 'failed':
      return `Saved on this device. Backup failed: ${s.message}`;
  }
}

/**
 * One backup at a time per screen; while one runs, only the newest waiting save is kept.
 * Each finished backup moves the base forward so the next save is not mistaken for a
 * conflict with the one just written.
 */
export function createBackupQueue(onStatus: (s: BackupStatus) => void, onBackedUp: (storyId: string, at: number) => void) {
  let running = false;
  let waiting: StorySave | null = null;
  let lastWritten = 0;
  const run = async (save: StorySave) => {
    running = true;
    const based = lastWritten ? { ...save, cloudBase: Math.max(save.cloudBase ?? 0, lastWritten) } : save;
    const r = await backupWithRetry(based, onStatus);
    if (r.ok) {
      lastWritten = save.updatedAt;
      onBackedUp(save.storyId, save.updatedAt);
    }
    running = false;
    const next = waiting;
    waiting = null;
    if (next && (r.ok || r.reason === 'error')) void run(next);
  };
  return {
    push(save: StorySave) {
      if (running) waiting = save;
      else void run(save);
    }
  };
}
