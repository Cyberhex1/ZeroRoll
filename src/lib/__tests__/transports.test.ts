/**
 * Transport matrix (AI11): for each of the three transports and each outcome class,
 * assert what the player ends up with. The rule under test: no path returns substituted
 * content without a report to the status store.
 */
import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

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

type Reply =
  | { status: number; body: unknown; contentType?: string }
  | { networkError: true }
  | { hang: true };

/** Every request goes through here; tests queue replies per URL pattern. */
const calls: Array<{ url: string; init: any }> = [];
let route: (url: string, init: any) => Reply = () => ({ status: 500, body: { error: { message: 'no route' } } });

(globalThis as any).fetch = vi.fn((url: string, init: any = {}) => {
  calls.push({ url, init });
  const r = route(url, init);
  if ('networkError' in r) return Promise.reject(new TypeError('Failed to fetch'));
  if ('hang' in r) {
    return new Promise((_, reject) => {
      init.signal?.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' })));
    });
  }
  const text = typeof r.body === 'string' ? r.body : JSON.stringify(r.body);
  return Promise.resolve({
    ok: r.status >= 200 && r.status < 300,
    status: r.status,
    headers: { get: (h: string) => (h.toLowerCase() === 'content-type' ? r.contentType || 'application/json' : null) },
    text: async () => text,
    json: async () => JSON.parse(text),
    blob: async () => new Blob([text], { type: r.contentType || 'application/json' }),
  });
});

const svc = await import('../geminiService');
const { getAIStatus, resetAIStatus } = await import('../aiStatus');

const gemini = (text: string, finishReason = 'STOP', extra: any = {}) => ({
  status: 200,
  body: { candidates: [{ content: { parts: [{ text }] }, finishReason }], ...extra },
});
const openai = (content: string, finish_reason = 'stop') => ({ status: 200, body: { choices: [{ message: { content }, finish_reason }] } });
const anthropic = (text: string, stop_reason = 'end_turn') => ({ status: 200, body: { content: [{ type: 'text', text }], stop_reason } });

function useProvider(p: 'gemini' | 'openai' | 'anthropic' | 'custom', key = 'test-key-123') {
  svc.setActiveProvider(p);
  if (key) svc.setProviderKey(p, key);
  if (p === 'gemini') {
    // One model in the cascade keeps the tests focused on a single request.
    localStorage.setItem('zeroroll_gemini_available_models', JSON.stringify(['gemini-flash-latest']));
    svc.setProviderModel('gemini', 'gemini-flash-latest');
  }
}

async function run<T>(p: Promise<T>): Promise<T> {
  // Let retries' sleeps and timeouts elapse instantly.
  const settled = p.then((v) => ({ v }), (e) => ({ e }));
  await vi.runAllTimersAsync();
  const r: any = await settled;
  if ('e' in r) throw r.e;
  return r.v;
}

beforeEach(() => {
  vi.useFakeTimers();
  localStorage.clear();
  calls.length = 0;
  resetAIStatus();
});
afterEach(() => {
  vi.useRealTimers();
});

const PROVIDERS = ['gemini', 'openai', 'anthropic'] as const;
const okReply = { gemini: gemini('Hello'), openai: openai('Hello'), anthropic: anthropic('Hello') };
const errorBody = (msg: string) => ({ error: { message: msg, status: msg } });

describe.each(PROVIDERS)('%s transport', (provider) => {
  it('no key: throws no_key before any request', async () => {
    svc.setActiveProvider(provider);
    await expect(run(svc.executeUniversalPrompt({ userPrompt: 'hi' }))).rejects.toMatchObject({ kind: 'no_key' });
    expect(calls).toHaveLength(0);
  });

  it('invalid key: auth', async () => {
    useProvider(provider);
    route = () => ({ status: provider === 'gemini' ? 400 : 401, body: errorBody('API_KEY_INVALID') });
    await expect(run(svc.executeUniversalPrompt({ userPrompt: 'hi' }))).rejects.toMatchObject({ kind: 'auth' });
  });

  it('quota: quota', async () => {
    useProvider(provider);
    route = () => ({ status: 429, body: errorBody('RESOURCE_EXHAUSTED') });
    await expect(run(svc.executeUniversalPrompt({ userPrompt: 'hi' }))).rejects.toMatchObject({ kind: 'quota' });
  });

  it('overload: overloaded', async () => {
    useProvider(provider);
    route = () => ({ status: 503, body: errorBody('UNAVAILABLE') });
    await expect(run(svc.executeUniversalPrompt({ userPrompt: 'hi' }))).rejects.toMatchObject({ kind: 'overloaded' });
  });

  it('network: network', async () => {
    useProvider(provider);
    route = () => ({ networkError: true });
    await expect(run(svc.executeUniversalPrompt({ userPrompt: 'hi' }))).rejects.toMatchObject({ kind: 'network' });
  });

  it('timeout: timeout', async () => {
    useProvider(provider);
    route = () => ({ hang: true });
    await expect(run(svc.executeUniversalPrompt({ userPrompt: 'hi' }))).rejects.toMatchObject({ kind: 'timeout' });
  });

  it('empty reply: bad_output, never shown as a turn', async () => {
    useProvider(provider);
    route = () => (provider === 'gemini' ? gemini('') : provider === 'openai' ? openai('') : anthropic(''));
    await expect(run(svc.executeUniversalPrompt({ userPrompt: 'hi' }))).rejects.toMatchObject({ kind: 'bad_output' });
  });

  it('truncated reply: returned, flagged, and reported', async () => {
    useProvider(provider);
    route = () =>
      provider === 'gemini' ? gemini('Half a sent', 'MAX_TOKENS') : provider === 'openai' ? openai('Half a sent', 'length') : anthropic('Half a sent', 'max_tokens');
    const text = await run(svc.executeUniversalPrompt({ userPrompt: 'hi', feature: 'Story turn' }));
    expect(text).toBe('Half a sent');
    expect(svc.getLastCallMeta()?.truncated).toBe(true);
    expect(getAIStatus().notice?.message).toMatch(/cut short/);
  });

  it('sets an output limit on every request', async () => {
    useProvider(provider);
    route = () => okReply[provider];
    await run(svc.executeUniversalPrompt({ userPrompt: 'hi', maxTokens: 777 }));
    const body = JSON.parse(calls[0].init.body);
    const limit = body.generationConfig?.maxOutputTokens ?? body.max_completion_tokens ?? body.max_tokens;
    expect(limit).toBe(777);
  });

  it('success marks the status ok with the model that answered', async () => {
    useProvider(provider);
    route = () => okReply[provider];
    await run(svc.executeUniversalPrompt({ userPrompt: 'hi' }));
    expect(getAIStatus().state).toBe('ok');
    expect(getAIStatus().lastModel).toBeTruthy();
  });
});

describe('Gemini specifics', () => {
  it('sends the key in a header, never in the URL', async () => {
    useProvider('gemini', 'AIzaSy-header-only');
    route = () => gemini('ok');
    await run(svc.executeUniversalPrompt({ userPrompt: 'hi' }));
    expect(calls[0].url).not.toContain('AIzaSy-header-only');
    expect(calls[0].init.headers['x-goog-api-key']).toBe('AIzaSy-header-only');
  });

  it('a safety block is "blocked", not a key problem, and is not retried on other models', async () => {
    useProvider('gemini');
    localStorage.setItem('zeroroll_gemini_available_models', JSON.stringify(['gemini-flash-latest', 'gemini-3.8-flash']));
    route = () => ({ status: 200, body: { promptFeedback: { blockReason: 'SAFETY' }, candidates: [] } });
    await expect(run(svc.executeUniversalPrompt({ userPrompt: 'hi' }))).rejects.toMatchObject({ kind: 'blocked' });
    expect(calls).toHaveLength(1);
  });

  it('a cascade swap is reported in the status line (AI4)', async () => {
    useProvider('gemini');
    localStorage.setItem('zeroroll_gemini_available_models', JSON.stringify(['gemini-flash-latest', 'gemini-3.8-flash']));
    route = (url) => (url.includes('gemini-flash-latest') ? { status: 404, body: errorBody('NOT_FOUND model') } : gemini('ok'));
    await run(svc.executeUniversalPrompt({ userPrompt: 'hi', feature: 'Story turn' }));
    expect(svc.getLastCallMeta()).toMatchObject({ model: 'gemini-3.8-flash', swappedFrom: 'gemini-flash-latest' });
    expect(getAIStatus().notice?.message).toMatch(/gemini-3.8-flash answered/);
    expect(svc.getLastModelUsedLabel()).toContain('gemini-3.8-flash');
  });

  it('a 400 unrelated to thinking moves to the next model once instead of failing the turn (AI9)', async () => {
    useProvider('gemini');
    localStorage.setItem('zeroroll_gemini_available_models', JSON.stringify(['gemini-flash-latest', 'gemini-3.8-flash']));
    route = (url) => (url.includes('gemini-flash-latest') ? { status: 400, body: errorBody('responseMimeType not supported') } : gemini('ok'));
    await expect(run(svc.executeUniversalPrompt({ userPrompt: 'hi' }))).resolves.toBe('ok');
  });

  it('the same 400 on two models stops the cascade', async () => {
    useProvider('gemini');
    localStorage.setItem('zeroroll_gemini_available_models', JSON.stringify(['gemini-flash-latest', 'gemini-3.8-flash', 'gemini-3.6-flash']));
    route = () => ({ status: 400, body: errorBody('INVALID_ARGUMENT contents') });
    await expect(run(svc.executeUniversalPrompt({ userPrompt: 'hi' }))).rejects.toMatchObject({ kind: 'bad_request' });
    expect(calls).toHaveLength(2);
  });

  it('honours a short retry hint on 429 before giving up on the model', async () => {
    useProvider('gemini');
    let n = 0;
    route = () => (n++ === 0 ? { status: 429, body: errorBody('RESOURCE_EXHAUSTED Please retry in 3s.') } : gemini('ok'));
    await expect(run(svc.executeUniversalPrompt({ userPrompt: 'hi' }))).resolves.toBe('ok');
    expect(calls).toHaveLength(2);
  });

  it('a whole turn has an overall deadline (AI9)', async () => {
    useProvider('gemini');
    localStorage.setItem(
      'zeroroll_gemini_available_models',
      JSON.stringify(['gemini-flash-latest', 'gemini-3.8-flash', 'gemini-3.6-flash', 'gemini-3.5-flash-lite', 'gemini-3.1-flash-lite'])
    );
    route = () => ({ hang: true });
    const start = Date.now();
    await expect(run(svc.executeUniversalPrompt({ userPrompt: 'hi' }))).rejects.toMatchObject({ kind: 'timeout' });
    expect(Date.now() - start).toBeLessThanOrEqual(svc.AI_TURN_DEADLINE_MS + 1000);
  });

  it('parses retry hints', () => {
    expect(svc.parseRetryDelayMs('Please retry in 7.2s.')).toBe(7200);
    expect(svc.parseRetryDelayMs('retryDelay: 12s')).toBe(12000);
    expect(svc.parseRetryDelayMs('nothing here')).toBeUndefined();
  });
});

describe('OpenAI-compatible specifics', () => {
  it('a 404 on a base URL without /v1 is reported as a base URL problem, not a missing model (AI6)', async () => {
    useProvider('custom', '');
    svc.setProviderBaseUrl('custom', 'http://localhost:11434');
    route = () => ({ status: 404, body: '404 page not found', contentType: 'text/plain' });
    await expect(run(svc.executeUniversalPrompt({ userPrompt: 'hi' }))).rejects.toMatchObject({ kind: 'bad_base_url' });
  });

  it('a 404 when /models answers is a missing model', async () => {
    useProvider('custom', '');
    svc.setProviderBaseUrl('custom', 'http://localhost:11434/v1');
    route = (url) => (url.endsWith('/models') ? { status: 200, body: { data: [] } } : { status: 404, body: errorBody('model "x" not found') });
    await expect(run(svc.executeUniversalPrompt({ userPrompt: 'hi' }))).rejects.toMatchObject({ kind: 'model_not_found' });
  });

  it('OpenAI gets max_completion_tokens; compatible servers get max_tokens', async () => {
    useProvider('openai');
    route = () => openai('ok');
    await run(svc.executeUniversalPrompt({ userPrompt: 'hi' }));
    expect(JSON.parse(calls[0].init.body)).toHaveProperty('max_completion_tokens');
    calls.length = 0;
    useProvider('custom', '');
    await run(svc.executeUniversalPrompt({ userPrompt: 'hi' }));
    expect(JSON.parse(calls[0].init.body)).toHaveProperty('max_tokens');
  });
});

describe('Anthropic specifics', () => {
  it('honours the configured base URL (AI7)', async () => {
    useProvider('anthropic');
    svc.setProviderBaseUrl('anthropic', 'https://proxy.example.com/v1/');
    route = () => anthropic('ok');
    await run(svc.executeUniversalPrompt({ userPrompt: 'hi' }));
    expect(calls[0].url).toBe('https://proxy.example.com/v1/messages');
  });
});

describe('Test Connection', () => {
  it('marks the navbar status ok after a passing test (AI5)', async () => {
    useProvider('openai');
    route = () => openai('{"status":"Ready for adventure"}');
    const r = await run(svc.testProviderConnection({ provider: 'openai', apiKey: 'sk-test' }));
    expect(r.success).toBe(true);
    expect(getAIStatus().state).toBe('ok');
  });

  it('does not force JSON mode on a local model that answers in prose (AI10)', async () => {
    useProvider('custom', '');
    route = () => openai('Ready for adventure');
    const r = await run(svc.testProviderConnection({ provider: 'custom', baseUrl: 'http://localhost:1234/v1', model: 'local' }));
    expect(r.success).toBe(true);
    expect(JSON.parse(calls[0].init.body).response_format).toBeUndefined();
  });
});

describe('Gameplay features never substitute silently', () => {
  it('a turn with no ---OPTIONS--- gets generic chips and a notice (AI2)', async () => {
    useProvider('openai');
    route = () => openai('The door creaks open.');
    const r = await run(svc.executeActionTurn({ contents: 'open door', category: 'horror' as any, model: '' }));
    expect(r.fallbackActions).toBe(true);
    expect(getAIStatus().notice?.message).toMatch(/generic/);
  });

  it('a cut-off turn offers Continue and hides a half-written block (AI1)', async () => {
    useProvider('openai');
    route = () => openai('You step inside.\n---STATE_UPDATE---\nHP_DEL', 'length');
    const r = await run(svc.executeActionTurn({ contents: 'enter', category: 'horror' as any, model: '' }));
    expect(r.truncated).toBe(true);
    expect(r.suggestedActions?.[0]).toBe(svc.CONTINUE_ACTION);
    expect(r.text).toBe('You step inside.');
  });

  it('Chapter One failure is returned to the caller, not passed off as the opening (AI3)', async () => {
    useProvider('openai');
    route = () => ({ status: 503, body: errorBody('overloaded') });
    const r = await run(
      svc.generateChapterOneAI({ category: 'horror' as any, storyBlurb: 'A premise.', characterState: {}, model: '' })
    );
    expect(r.failure).toBeTruthy();
    expect(getAIStatus().state).toBe('error');
  });

  it('a Chapter One that works is labelled with the model that wrote it', async () => {
    useProvider('openai');
    route = () => openai('The fog rolls in.\n---OPTIONS---\n[1] Run\n[2] Hide\n[3] Call out');
    const r = await run(
      svc.generateChapterOneAI({ category: 'horror' as any, storyBlurb: 'A premise.', characterState: {}, model: '' })
    );
    expect(r.failure).toBeUndefined();
    expect(r.modelUsed).toContain('OpenAI');
    expect(r.suggestedActions).toEqual(['Run', 'Hide', 'Call out']);
  });

  it('an avatar engine swap is reported, and free portraits wait for the player (AI8, S18)', async () => {
    useProvider('openai');
    route = () => ({ status: 400, body: errorBody('content policy') });
    await expect(
      run(svc.generateAvatarAI({ characterName: 'A', roleClass: 'B', raceOrigin: 'C', category: 'horror' as any }))
    ).rejects.toThrow(/Free portraits are off/);
    expect(getAIStatus().notice?.feature).toBe('Portrait');
    expect(calls.some((c) => c.url.includes('pollinations'))).toBe(false);
  });

  it('an allowed free portrait is stored on the device and carries no hero name (AI8, H6)', async () => {
    useProvider('openai');
    const { setFreePortraitsAllowed, IMG_REF } = await import('../portraits');
    setFreePortraitsAllowed(true);
    route = (url) => (url.includes('pollinations') ? { status: 200, body: 'PNGDATA', contentType: 'image/png' } : { status: 400, body: errorBody('content policy') });
    const r = await run(
      svc.generateAvatarAI({ characterName: 'Zephyrine', roleClass: 'B', raceOrigin: 'C', category: 'horror' as any })
    );
    expect(r.engine).toMatch(/Flux/);
    expect(r.avatarUrl.startsWith(IMG_REF)).toBe(true);
    const free = calls.find((c) => c.url.includes('pollinations'));
    expect(free?.url).not.toContain('Zephyrine');
  });
});

describe('only usable Gemini models are offered (ohnna, 2026-11-04)', () => {
  it('Test Connection keeps the models that answer and the cascade skips the rest', async () => {
    useProvider('gemini');
    localStorage.removeItem('zeroroll_gemini_available_models');
    const listed = ['gemini-flash-latest', 'gemini-3.8-flash', 'gemini-3.5-flash-lite', 'gemini-argon', 'gemini-2.0-flash', 'gemini-3.8-flash-001', 'gemini-exp-1206', 'text-embedding-004'];
    route = (url) => {
      if (url.includes('/models?')) return { status: 200, body: { models: listed.map((n) => ({ name: `models/${n}`, supportedGenerationMethods: n.startsWith('text-') ? ['embedContent'] : ['generateContent'] })) } };
      if (url.includes('gemini-flash-latest:')) return { status: 503, body: errorBody('UNAVAILABLE overloaded') };
      if (url.includes('gemini-argon:')) return { status: 429, body: errorBody('RESOURCE_EXHAUSTED limit: 0') };
      return gemini('{"status": "Ready for adventure"}');
    };
    const r = await run(svc.testProviderConnection({ provider: 'gemini', apiKey: 'AIzaTest', model: 'gemini-flash-latest' }));
    expect(r.success).toBe(true);
    expect(r.usableModels).toEqual(['gemini-3.8-flash', 'gemini-3.5-flash-lite']);
    expect(r.modelUsed).toBe('gemini-3.8-flash');
    expect(r.message).toMatch(/gemini-flash-latest didn't answer/);
    // Old generations, dated snapshots and experiments are never probed.
    const probed = calls.filter((c) => c.url.includes(':generateContent')).map((c) => c.url.match(/models\/([^:]+):/)![1]);
    expect(probed).not.toContain('gemini-2.0-flash');
    expect(probed).not.toContain('gemini-3.8-flash-001');
    expect(probed).not.toContain('gemini-exp-1206');
    expect(svc.getGeminiCandidateModels('gemini-flash-latest')).toEqual(['gemini-3.8-flash', 'gemini-3.5-flash-lite']);
    const { usableGeminiModelOptions } = await import('../modelsConfig');
    expect(usableGeminiModelOptions().map((m) => m.id)).toEqual(['gemini-3.8-flash', 'gemini-3.5-flash-lite']);
  });

  it('a model outside the curated list that answers is offered by name', async () => {
    const { usableGeminiModelOptions, prettyGeminiName } = await import('../modelsConfig');
    expect(prettyGeminiName('gemini-argon')).toBe('Gemini Argon');
    expect(usableGeminiModelOptions(['gemini-3.8-flash', 'gemini-argon']).map((m) => m.name)).toEqual(['Gemini 3.8 Flash', 'Gemini Argon']);
  });
});
