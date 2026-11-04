import { describe, it, expect, vi, beforeEach } from 'vitest';

/** A minimal Web Audio fake: enough to count voices and see what started. */
class FakeParam {
  value = 0;
  cancelScheduledValues() {}
  setValueAtTime(v: number) { this.value = v; }
  linearRampToValueAtTime(v: number) { this.value = v; }
}
const started: string[] = [];
class FakeCtx {
  currentTime = 0;
  destination = {};
  createGain() { return { gain: new FakeParam(), connect: (n: any) => n }; }
  createBufferSource() {
    const s: any = { buffer: null, loop: false, connect: (n: any) => n, start: () => started.push(s.buffer.name), stop: vi.fn() };
    return s;
  }
  decodeAudioData(arr: ArrayBuffer) { return Promise.resolve({ name: new TextDecoder().decode(arr) }); }
  resume() { return Promise.resolve(); }
  suspend() { return Promise.resolve(); }
  close() {}
}
(globalThis as any).window = { AudioContext: FakeCtx };
(globalThis as any).localStorage = { getItem: () => null, setItem: () => {} };

const pending = new Map<string, (ok: boolean) => void>();
(globalThis as any).fetch = vi.fn((url: string) =>
  new Promise((resolve) => {
    pending.set(url, (ok) =>
      resolve({ ok, status: ok ? 200 : 404, arrayBuffer: async () => new TextEncoder().encode(url.split('/').pop()!).buffer })
    );
  })
);

const { audioManager } = await import('../manager');
const { getTrack } = await import('../catalog');
const flush = () => new Promise((r) => setTimeout(r, 0));
const finish = async (key: 'horror' | 'fantasy' | 'home', ok = true) => {
  pending.get(getTrack(key)!.url)!(ok);
  await flush();
  await flush();
};

describe('music (S23)', () => {
  beforeEach(() => {
    started.length = 0;
    pending.clear();
    audioManager.resumeOnGesture();
  });

  it('a track that finishes loading after the player moved on does not start', async () => {
    void audioManager.play('horror');
    void audioManager.play('fantasy');
    await finish('fantasy');
    await finish('horror');
    expect(started.map((n) => n.replace('.mp3', ''))).toEqual([getTrack('fantasy')!.url.split('/').pop()!.replace('.mp3', '')]);
    expect(audioManager.getCurrentKey()).toBe('fantasy');
  });

  it('a track that failed to load can be tried again', async () => {
    audioManager.stop();
    void audioManager.play('home');
    await finish('home', false);
    expect(audioManager.getCurrentKey()).toBe(null);
    void audioManager.play('home');
    expect(pending.has(getTrack('home')!.url)).toBe(true);
  });

  it('muting from anywhere is heard by the player panel (S24)', () => {
    const seen: boolean[] = [];
    const off = audioManager.subscribeMuted((m) => seen.push(m));
    audioManager.setMuted(true);
    audioManager.setMuted(false);
    off();
    expect(seen).toEqual([true, false]);
  });
});
