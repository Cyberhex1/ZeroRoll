/**
 * Player-side backup: "Export my campaigns" and "Import".
 *
 * The export collects every campaign this browser knows about (all experience
 * keys in localStorage, whatever user they belong to) plus, for a signed-in
 * player, every campaign in their Firestore subcollection. It also includes the
 * non-secret preferences in localStorage. API keys are never exported.
 *
 * Import is additive: it never deletes anything, and it never replaces a copy
 * that is newer than the one in the file.
 */
import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import type { Experience } from '../types';

export const BACKUP_FORMAT = 'zeroroll-backup';
export const BACKUP_VERSION = 1;

const EXPERIENCE_KEY_PREFIXES = ['zeroroll_exp_', 'experience_'];

/** localStorage keys that hold secrets and must never leave the device. */
export function isSecretStorageKey(key: string): boolean {
  const k = key.toLowerCase();
  return (
    k.startsWith('zeroroll_key_') ||
    k.includes('api_key') ||
    k.includes('apikey') ||
    k.includes('secret') ||
    k.includes('token') ||
    k.includes('passphrase')
  );
}

export function isExperienceStorageKey(key: string): boolean {
  return EXPERIENCE_KEY_PREFIXES.some((p) => key.startsWith(p));
}

export interface BackupCampaign {
  /** Where this copy came from. */
  source: 'local' | 'cloud';
  /** The localStorage key it was read from (local copies only). */
  storageKey?: string;
  experience: Experience;
}

export interface BackupFile {
  format: typeof BACKUP_FORMAT;
  version: number;
  exportedAt: string;
  app: 'ZeroRoll';
  account: { uid: string; email: string | null; isAnonymous: boolean } | null;
  counts: { local: number; cloud: number; uniqueCampaigns: number; preferences: number };
  campaigns: BackupCampaign[];
  /** Non-secret localStorage entries (preferences, profile, music settings). */
  preferences: Record<string, string>;
  /** Set when the cloud could not be read, so the player knows the file is local-only. */
  cloudError?: string;
}

interface StorageLike {
  readonly length: number;
  key(index: number): string | null;
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

function timestampOf(exp: Partial<Experience> | undefined): number {
  if (!exp) return 0;
  const t = new Date((exp.updatedAt as string) || (exp.createdAt as string) || 0).getTime();
  return Number.isFinite(t) ? t : 0;
}

/** Reads every campaign and non-secret preference from a Storage. Pure apart from reading storage. */
export function collectLocal(storage: StorageLike): { campaigns: BackupCampaign[]; preferences: Record<string, string> } {
  const campaigns: BackupCampaign[] = [];
  const preferences: Record<string, string> = {};
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (!key) continue;
    const raw = storage.getItem(key);
    if (raw == null) continue;
    if (isExperienceStorageKey(key)) {
      try {
        const exp = JSON.parse(raw);
        if (exp && typeof exp === 'object' && exp.id) {
          campaigns.push({ source: 'local', storageKey: key, experience: exp });
        }
      } catch {
        // Keep unreadable entries as raw text so nothing is lost.
        preferences[key] = raw;
      }
      continue;
    }
    if (isSecretStorageKey(key)) continue;
    preferences[key] = raw;
  }
  return { campaigns, preferences };
}

async function collectCloud(uid: string): Promise<BackupCampaign[]> {
  const snap = await getDocs(collection(db, 'users', uid, 'experiences'));
  const out: BackupCampaign[] = [];
  snap.forEach((d) => {
    out.push({ source: 'cloud', experience: { ...(d.data() as Experience), id: d.id } });
  });
  return out;
}

export function countUnique(campaigns: BackupCampaign[]): number {
  return new Set(campaigns.map((c) => c.experience.id)).size;
}

export async function buildBackup(storage: StorageLike = localStorage): Promise<BackupFile> {
  const { campaigns, preferences } = collectLocal(storage);
  const user = auth.currentUser;
  let cloud: BackupCampaign[] = [];
  let cloudError: string | undefined;
  if (user) {
    // Anonymous (guest-account) players can have cloud docs too.
    try {
      cloud = await collectCloud(user.uid);
    } catch (err) {
      cloudError = err instanceof Error ? err.message : String(err);
    }
  }
  const all = [...campaigns, ...cloud];
  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    app: 'ZeroRoll',
    account: user ? { uid: user.uid, email: user.email, isAnonymous: user.isAnonymous } : null,
    counts: {
      local: campaigns.length,
      cloud: cloud.length,
      uniqueCampaigns: countUnique(all),
      preferences: Object.keys(preferences).length,
    },
    campaigns: all,
    preferences,
    ...(cloudError ? { cloudError } : {}),
  };
}

export function downloadBackup(backup: BackupFile): string {
  const date = backup.exportedAt.slice(0, 10);
  const filename = `zeroroll-backup-${date}.json`;
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return filename;
}

export function parseBackup(text: string): BackupFile {
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('This file is not valid JSON.');
  }
  if (!data || data.format !== BACKUP_FORMAT || !Array.isArray(data.campaigns)) {
    throw new Error('This file is not a ZeroRoll backup.');
  }
  if (typeof data.version !== 'number' || data.version > BACKUP_VERSION) {
    throw new Error('This backup was made by a newer version of ZeroRoll.');
  }
  return data as BackupFile;
}

export interface ImportResult {
  restoredLocal: number;
  restoredCloud: number;
  skippedNewer: number;
  preferencesRestored: number;
  errors: string[];
}

/** Picks the newest copy of each campaign in the file. */
export function newestById(campaigns: BackupCampaign[]): Map<string, Experience> {
  const best = new Map<string, Experience>();
  for (const c of campaigns) {
    const exp = c.experience;
    if (!exp?.id) continue;
    const cur = best.get(exp.id);
    if (!cur || timestampOf(exp) > timestampOf(cur)) best.set(exp.id, exp);
  }
  return best;
}

/** Local key a campaign should be restored to for the current player. */
export function localKeyFor(exp: Experience, uid: string | null): string {
  return uid ? `zeroroll_exp_${uid}_${exp.id}` : `zeroroll_exp_guest_${exp.id}`;
}

/**
 * Restores campaigns into this browser (and the cloud when signed in).
 * Never deletes. Never overwrites a newer copy. Preferences are only filled in
 * where this browser has no value yet.
 */
export async function importBackup(
  backup: BackupFile,
  storage: StorageLike = localStorage,
  opts: { cloud?: boolean } = {}
): Promise<ImportResult> {
  const user = auth.currentUser;
  const uid = user?.uid ?? null;
  const useCloud = opts.cloud ?? !!uid;
  const result: ImportResult = { restoredLocal: 0, restoredCloud: 0, skippedNewer: 0, preferencesRestored: 0, errors: [] };

  for (const [, original] of newestById(backup.campaigns)) {
    const exp: Experience = { ...original, userId: uid ?? 'guest' };
    const key = localKeyFor(exp, uid);

    // Local
    let localExisting: Experience | undefined;
    try {
      const raw = storage.getItem(key);
      if (raw) localExisting = JSON.parse(raw);
    } catch {
      /* treat unreadable as missing */
    }
    if (localExisting && timestampOf(localExisting) >= timestampOf(exp)) {
      result.skippedNewer++;
    } else {
      try {
        storage.setItem(key, JSON.stringify(exp));
        result.restoredLocal++;
      } catch (err) {
        result.errors.push(`Could not save "${exp.title || exp.id}" in this browser: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    // Cloud
    if (useCloud && uid) {
      try {
        const ref = doc(db, 'users', uid, 'experiences', exp.id);
        const snap = await getDoc(ref);
        if (snap.exists() && timestampOf(snap.data() as Experience) >= timestampOf(exp)) continue;
        await setDoc(ref, stripUndefined(exp), { merge: true });
        result.restoredCloud++;
      } catch (err) {
        result.errors.push(`Could not upload "${exp.title || exp.id}": ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  }

  for (const [k, v] of Object.entries(backup.preferences || {})) {
    if (isSecretStorageKey(k) || isExperienceStorageKey(k)) continue;
    try {
      if (storage.getItem(k) == null) {
        storage.setItem(k, v);
        result.preferencesRestored++;
      }
    } catch {
      /* quota: preferences are optional */
    }
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('rollzero_experience_change'));
  }
  return result;
}

function stripUndefined(obj: any): any {
  if (Array.isArray(obj)) {
    if (obj.length > 0 && Array.isArray(obj[0])) return JSON.stringify(obj);
    return obj.map(stripUndefined);
  }
  if (obj !== null && typeof obj === 'object') {
    const out: any = {};
    for (const [k, v] of Object.entries(obj)) if (v !== undefined) out[k] = stripUndefined(v);
    return out;
  }
  return obj;
}
