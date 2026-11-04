/** Tier router: ladder order, overrides, failover, and what stops the route. */
import { describe, it, expect, beforeEach, vi } from 'vitest';

class MemoryStorage {
  private data = new Map<string, string>();
  get length() { return this.data.size; }
  key(i: number) { return [...this.data.keys()][i] ?? null; }
  getItem(k: string) { return this.data.has(k) ? this.data.get(k)! : null; }
  setItem(k: string, v: string) { this.data.set(k, String(v)); }
  removeItem(k: string) { this.data.delete(k); }
  clear() { this.data.clear(); }
}
(globalThis as any).localStorage = new MemoryStorage();

const calls: string[] = [];
/** Model name -> HTTP status it answers with (200 = success). */
let statusFor: Record<string, number> = {};

(globalThis as any).fetch = vi.fn((url: string, init: any = {}) => {
  const body = init.body ? JSON.parse(init.body) : {};
  const model = body.model || decodeURIComponent(url.match(/models\/([^:]+):/)?.[1] || '');
  calls.push(model);
  const status = statusFor[model] ?? 200;
  const ok = status === 200;
  const payload = ok
    ? url.includes('generativelanguage')
      ? { candidates: [{ content: { parts: [{ text: `hi from ${model}` }] }, finishReason: 'STOP' }] }
      : url.includes('anthropic')
        ? { content: [{ type: 'text', text: `hi from ${model}` }], stop_reason: 'end_turn' }
        : { choices: [{ message: { content: `hi from ${model}` }, finish_reason: 'stop' }] }
    : { error: { message: status === 429 ? 'quota exceeded' : status === 404 ? 'model not found' : status === 401 ? 'invalid api key' : 'bad' } };
  const text = JSON.stringify(payload);
  return Promise.resolve({
    ok,
    status,
    headers: { get: () => 'application/json' },
    text: async () => text,
    json: async () => payload,
  });
});

const svc = await import('../../lib/geminiService');
const router = await import('../router');
const { getAIStatus, resetAIStatus } = await import('../../lib/aiStatus');

const msgs = [{ role: 'user' as const, content: 'hello' }];

beforeEach(() => {
  localStorage.clear();
  calls.length = 0;
  statusFor = {};
  resetAIStatus();
  svc.setActiveProvider('gemini');
  svc.setProviderKey('gemini', 'AIzaTestKey123456789');
  svc.setProviderModel('gemini', 'gemini-flash-latest');
});

describe('planRoute', () => {
  it('best steps down through good and basic', () => {
    const plan = router.planRoute('best').map((s) => `${s.tier}:${s.model}`);
    expect(plan).toEqual(['best:gemini-3.1-pro-preview', 'good:gemini-flash-latest', 'basic:gemini-3.5-flash-lite']);
  });

  it('basic never steps up', () => {
    expect(router.planRoute('basic').map((s) => s.tier)).toEqual(['basic']);
  });

  it("the player's chosen model is the good tier", () => {
    svc.setProviderModel('gemini', 'gemini-3.8-flash');
    expect(router.planRoute('good')[0].model).toBe('gemini-3.8-flash');
  });

  it('an override goes first for its tier', () => {
    router.setTierOverride('best', { provider: 'gemini', model: 'gemini-9-ultra' });
    const plan = router.planRoute('best');
    expect(plan[0]).toMatchObject({ model: 'gemini-9-ultra', source: 'override' });
    expect(plan[1].model).toBe('gemini-3.1-pro-preview');
  });

  it('cross-provider backup is opt-in and only uses providers with keys', () => {
    svc.setProviderKey('anthropic', 'sk-ant-test-123456');
    expect(router.planRoute('good').every((s) => s.provider === 'gemini')).toBe(true);
    router.setCrossProviderFailover(true);
    const providers = router.planRoute('good').map((s) => s.provider);
    expect(providers).toContain('anthropic');
    expect(providers).not.toContain('openai');
  });

  it('dedupes a model that sits in two tiers', () => {
    svc.setActiveProvider('openai');
    svc.setProviderKey('openai', 'sk-test-123456');
    svc.setProviderModel('openai', 'gpt-5');
    const models = router.planRoute('best').map((s) => s.model);
    expect(models).toEqual(['gpt-5', 'gpt-5-mini']);
  });
});

describe('complete', () => {
  it('answers from the requested tier when it works', async () => {
    const r = await router.complete(msgs, 'good');
    expect(r).toMatchObject({ model: 'gemini-flash-latest', tier: 'good', requestedTier: 'good', attempts: [] });
    expect(r.text).toBe('hi from gemini-flash-latest');
    expect(getAIStatus().notice).toBeUndefined();
  });

  it('steps down when a model is unavailable and says so', async () => {
    statusFor['gemini-3.1-pro-preview'] = 404;
    const r = await router.complete(msgs, 'best', { feature: 'Story chat' });
    expect(r.tier).toBe('good');
    expect(r.attempts.map((a) => a.error)).toEqual(['model_not_found']);
    expect(getAIStatus().notice?.message).toMatch(/gemini-3.1-pro-preview was unavailable/);
  });

  it('calls one model per step (no hidden Gemini cascade)', async () => {
    statusFor['gemini-3.1-pro-preview'] = 404;
    await router.complete(msgs, 'best');
    expect(calls).toEqual(['gemini-3.1-pro-preview', 'gemini-flash-latest']);
  });

  it('a bad key stops the route instead of burning through the ladder', async () => {
    statusFor['gemini-3.1-pro-preview'] = 401;
    await expect(router.complete(msgs, 'best')).rejects.toMatchObject({ kind: 'auth' });
    expect(calls).toHaveLength(1);
  });

  it('throws the last error when every step fails, never a substitute', async () => {
    statusFor['gemini-flash-latest'] = 404;
    statusFor['gemini-3.5-flash-lite'] = 404;
    await expect(router.complete(msgs, 'good')).rejects.toMatchObject({ kind: 'model_not_found' });
  });

  it('falls over to another provider only when opted in', async () => {
    svc.setProviderKey('anthropic', 'sk-ant-test-123456');
    statusFor['gemini-flash-latest'] = 404;
    statusFor['gemini-3.5-flash-lite'] = 404;
    router.setCrossProviderFailover(true);
    const r = await router.complete(msgs, 'good');
    expect(r.provider).toBe('anthropic');
    expect(r.model).toBe('claude-sonnet-5-5');
  });
});
