import { describe, expect, it, vi } from 'vitest';

vi.mock('../../lib/firebase', () => ({ auth: { currentUser: null }, db: {} }));

const { TURNS_PER_PAGE, cloudMovedOn, planPages, describeBackup } = await import('../storyCloud');

const msgs = (n: number, tag = '') => Array.from({ length: n }, (_, i) => ({ id: `m${i}`, kind: 'player' as const, text: `t${i}${tag}`, beat: 'b', at: i }));

describe('story cloud paging', () => {
  it('writes every page the first time and only changed pages after', () => {
    const first = planPages([], msgs(120));
    expect(first.write.map((w) => w.page)).toEqual([0, 1, 2]);
    expect(first.write[2].messages).toHaveLength(120 - 2 * TURNS_PER_PAGE);
    const next = planPages(first.hashes, msgs(121));
    expect(next.write.map((w) => w.page)).toEqual([2]);
    expect(next.remove).toEqual([]);
  });

  it('rewrites an earlier page when a reroll changed it, and removes pages past the end', () => {
    const base = planPages([], msgs(101));
    const rerolled = msgs(101);
    rerolled[49] = { ...rerolled[49], text: 'rewritten' };
    expect(planPages(base.hashes, rerolled).write.map((w) => w.page)).toEqual([0]);
    const restarted = planPages(base.hashes, msgs(3));
    expect(restarted.write.map((w) => w.page)).toEqual([0]);
    expect(restarted.remove).toEqual([1, 2]);
  });
});

describe('cloud conflicts', () => {
  it('refuses only when the cloud moved on since this save matched it', () => {
    expect(cloudMovedOn(100, { updatedAt: 200, cloudBase: 100 })).toBe(false);
    // Another device saved at 150 after this one last matched at 100.
    expect(cloudMovedOn(150, { updatedAt: 200, cloudBase: 100 })).toBe(true);
    expect(cloudMovedOn(150, { updatedAt: 200 })).toBe(false);
    expect(cloudMovedOn(250, { updatedAt: 200 })).toBe(true);
    expect(cloudMovedOn(200, { updatedAt: 200, cloudBase: 1 })).toBe(false);
  });

  it('describes backup status in plain words', () => {
    expect(describeBackup({ kind: 'retrying', attempt: 2, message: 'x' })).toMatch(/trying again \(2\)/);
    expect(describeBackup({ kind: 'local_only' })).toMatch(/Sign in/);
  });
});
