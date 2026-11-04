import { describe, it, expect, vi, beforeEach } from 'vitest';

// Firestore stand-in: a map of "users/uid/experiences/id" -> data.
const cloud = new Map<string, any>();
let currentUser: any = null;

vi.mock('../firebase', () => ({
  get auth() {
    return { currentUser };
  },
  db: {},
}));
vi.mock('firebase/firestore', () => ({
  collection: (_db: any, ...path: string[]) => ({ path: path.join('/') }),
  doc: (_db: any, ...path: string[]) => ({ path: path.join('/') }),
  getDocs: async (col: { path: string }) => {
    const docs = [...cloud.entries()]
      .filter(([k]) => k.startsWith(col.path + '/'))
      .map(([k, v]) => ({ id: k.split('/').pop(), data: () => v }));
    return { forEach: (fn: (d: any) => void) => docs.forEach(fn) };
  },
  getDoc: async (ref: { path: string }) => ({ exists: () => cloud.has(ref.path), data: () => cloud.get(ref.path) }),
  setDoc: async (ref: { path: string }, data: any) => {
    cloud.set(ref.path, { ...(cloud.get(ref.path) || {}), ...data });
  },
}));

class MemoryStorage {
  data = new Map<string, string>();
  get length() { return this.data.size; }
  key(i: number) { return [...this.data.keys()][i] ?? null; }
  getItem(k: string) { return this.data.has(k) ? this.data.get(k)! : null; }
  setItem(k: string, v: string) { this.data.set(k, String(v)); }
  removeItem(k: string) { this.data.delete(k); }
}

const backup = await import('../backup');

const exp = (id: string, updatedAt: string, extra: any = {}) => ({
  id, title: `Campaign ${id}`, category: 'fantasy', userId: 'u1', createdAt: '2026-01-01T00:00:00Z', updatedAt, logs: [], ...extra,
});

describe('backup export', () => {
  beforeEach(() => { cloud.clear(); currentUser = null; });

  it('never exports API keys', async () => {
    const s = new MemoryStorage();
    s.setItem('zeroroll_key_gemini', 'AIzaSECRET');
    s.setItem('dnd_gemini_api_key', 'AIzaSECRET2');
    s.setItem('zeroroll_ai_provider', 'gemini');
    s.setItem('zeroroll_exp_guest_a', JSON.stringify(exp('a', '2026-02-01T00:00:00Z')));
    const file = await backup.buildBackup(s);
    const text = JSON.stringify(file);
    expect(text).not.toContain('AIzaSECRET');
    expect(file.preferences.zeroroll_ai_provider).toBe('gemini');
    expect(file.counts.local).toBe(1);
  });

  it('collects every local prefix and the signed-in cloud copies', async () => {
    const s = new MemoryStorage();
    s.setItem('experience_old', JSON.stringify(exp('old', '2025-01-01T00:00:00Z')));
    s.setItem('zeroroll_exp_guest_g', JSON.stringify(exp('g', '2026-01-01T00:00:00Z')));
    s.setItem('zeroroll_exp_u1_a', JSON.stringify(exp('a', '2026-02-01T00:00:00Z')));
    s.setItem('zeroroll_exp_other_b', JSON.stringify(exp('b', '2026-02-01T00:00:00Z')));
    currentUser = { uid: 'u1', email: 'p@example.com', isAnonymous: false };
    cloud.set('users/u1/experiences/a', exp('a', '2026-03-01T00:00:00Z'));
    cloud.set('users/u1/experiences/c', exp('c', '2026-03-01T00:00:00Z'));
    const file = await backup.buildBackup(s);
    expect(file.counts).toMatchObject({ local: 4, cloud: 2, uniqueCampaigns: 5 });
    expect(file.campaigns.find((c) => c.source === 'cloud' && c.experience.id === 'a')).toBeTruthy();
  });

  it('keeps an unreadable experience entry as raw text instead of dropping it', async () => {
    const s = new MemoryStorage();
    s.setItem('zeroroll_exp_guest_broken', '{not json');
    const file = await backup.buildBackup(s);
    expect(file.preferences.zeroroll_exp_guest_broken).toBe('{not json');
  });
});

describe('backup import', () => {
  beforeEach(() => { cloud.clear(); currentUser = null; });

  it('rejects files that are not backups', () => {
    expect(() => backup.parseBackup('{"hello":1}')).toThrow(/not a ZeroRoll backup/);
    expect(() => backup.parseBackup('nope')).toThrow(/not valid JSON/);
  });

  it('round-trips a guest backup into an empty browser', async () => {
    const src = new MemoryStorage();
    src.setItem('zeroroll_exp_guest_a', JSON.stringify(exp('a', '2026-02-01T00:00:00Z', { logs: [{ id: 'm1' }] })));
    src.setItem('zeroroll_music_volume', '0.4');
    const file = backup.parseBackup(JSON.stringify(await backup.buildBackup(src)));

    const dst = new MemoryStorage();
    const r = await backup.importBackup(file, dst);
    expect(r).toMatchObject({ restoredLocal: 1, skippedNewer: 0, preferencesRestored: 1 });
    expect(JSON.parse(dst.getItem('zeroroll_exp_guest_a')!).logs).toHaveLength(1);
  });

  it('never overwrites a newer local or cloud copy', async () => {
    currentUser = { uid: 'u1', email: null, isAnonymous: false };
    const dst = new MemoryStorage();
    dst.setItem('zeroroll_exp_u1_a', JSON.stringify(exp('a', '2026-05-01T00:00:00Z', { title: 'newer local' })));
    cloud.set('users/u1/experiences/a', exp('a', '2026-05-01T00:00:00Z', { title: 'newer cloud' }));
    const file = {
      format: 'zeroroll-backup', version: 1, exportedAt: '', app: 'ZeroRoll', account: null,
      counts: { local: 1, cloud: 0, uniqueCampaigns: 1, preferences: 0 },
      campaigns: [{ source: 'local', experience: exp('a', '2026-01-01T00:00:00Z', { title: 'old' }) }],
      preferences: { zeroroll_key_gemini: 'AIzaLEAK' },
    } as any;
    const r = await backup.importBackup(file, dst);
    expect(r.skippedNewer).toBe(1);
    expect(r.restoredCloud).toBe(0);
    expect(JSON.parse(dst.getItem('zeroroll_exp_u1_a')!).title).toBe('newer local');
    expect(cloud.get('users/u1/experiences/a').title).toBe('newer cloud');
    expect(dst.getItem('zeroroll_key_gemini')).toBeNull();
  });

  it('uses the newest copy when a file holds several', () => {
    const m = backup.newestById([
      { source: 'local', experience: exp('a', '2026-01-01T00:00:00Z', { title: 'old' }) as any },
      { source: 'cloud', experience: exp('a', '2026-04-01T00:00:00Z', { title: 'new' }) as any },
    ]);
    expect(m.get('a')!.title).toBe('new');
  });

  it('uploads restored campaigns for a signed-in player, owned by them', async () => {
    currentUser = { uid: 'u9', email: null, isAnonymous: false };
    const dst = new MemoryStorage();
    const file = {
      format: 'zeroroll-backup', version: 1, exportedAt: '', app: 'ZeroRoll', account: null,
      counts: { local: 1, cloud: 0, uniqueCampaigns: 1, preferences: 0 },
      campaigns: [{ source: 'local', experience: exp('z', '2026-01-01T00:00:00Z', { userId: 'guest' }) }],
      preferences: {},
    } as any;
    const r = await backup.importBackup(file, dst);
    expect(r.restoredCloud).toBe(1);
    expect(cloud.get('users/u9/experiences/z').userId).toBe('u9');
    expect(dst.getItem('zeroroll_exp_u9_z')).not.toBeNull();
  });
});
