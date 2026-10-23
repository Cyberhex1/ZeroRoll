import { describe, it, expect, beforeEach, vi } from 'vitest';
import firebaseConfig from '../../../firebase-applet-config.json';

// Minimal in-memory localStorage for the node test environment.
class MemoryStorage {
  private data = new Map<string, string>();
  getItem(k: string) { return this.data.has(k) ? this.data.get(k)! : null; }
  setItem(k: string, v: string) { this.data.set(k, String(v)); }
  removeItem(k: string) { this.data.delete(k); }
  clear() { this.data.clear(); }
}
(globalThis as any).localStorage = new MemoryStorage();

const generateContent = vi.fn();
vi.mock('@google/genai', () => ({
  GoogleGenAI: class {
    models = { generateContent };
  }
}));

const svc = await import('../geminiService');
const { classifyAIError, AIError } = await import('../aiErrors');
const { getAIStatus, resetAIStatus } = await import('../aiStatus');

const FIREBASE_KEY = (firebaseConfig as any).apiKey as string;
const GOOD_KEY = 'AIzaSy-test-key-1234567890';

function apiError(status: number, message: string) {
  return Object.assign(new Error(message), { status });
}

beforeEach(() => {
  localStorage.clear();
  generateContent.mockReset();
  resetAIStatus();
});

describe('Gemini key handling', () => {
  it('never treats the Firebase web key as a Gemini key', () => {
    expect(svc.getProviderKey('gemini')).toBe('');
    expect(svc.hasActiveGeminiKey()).toBe(false);

    localStorage.setItem('zeroroll_key_gemini', FIREBASE_KEY);
    expect(svc.getProviderKey('gemini')).toBe('');
    expect(svc.hasActiveGeminiKey()).toBe(false);
  });

  it('purges a stored Firebase key left by older builds', () => {
    localStorage.setItem('zeroroll_key_gemini', FIREBASE_KEY);
    localStorage.setItem('dnd_gemini_api_key', FIREBASE_KEY);
    expect(svc.purgeUnusableStoredKeys()).toBe(true);
    expect(localStorage.getItem('zeroroll_key_gemini')).toBeNull();
    expect(localStorage.getItem('dnd_gemini_api_key')).toBeNull();
  });

  it('exports only keys the player saved', () => {
    expect(svc.exportAllProviderSettings().providerKeys).toEqual({});
    svc.setProviderKey('gemini', GOOD_KEY);
    expect(svc.exportAllProviderSettings().providerKeys).toEqual({ gemini: GOOD_KEY });
  });

  it('does not let cloud settings overwrite a local key, and skips the Firebase key', () => {
    svc.setProviderKey('gemini', GOOD_KEY);
    svc.importAllProviderSettings({ providerKeys: { gemini: 'AIzaSy-stale-cloud-key', openai: 'sk-cloud' } });
    expect(svc.getProviderKey('gemini')).toBe(GOOD_KEY);
    expect(svc.getProviderKey('openai')).toBe('sk-cloud');

    localStorage.clear();
    svc.importAllProviderSettings({ providerKeys: { gemini: FIREBASE_KEY } });
    expect(svc.getProviderKey('gemini')).toBe('');
  });

  it('offline mode disables AI even with a key', () => {
    svc.setProviderKey('gemini', GOOD_KEY);
    expect(svc.hasActiveGeminiKey()).toBe(true);
    svc.setOfflineMode(true);
    expect(svc.hasActiveGeminiKey()).toBe(false);
  });
});

describe('classifyAIError', () => {
  it.each([
    [apiError(403, 'PERMISSION_DENIED API_KEY_SERVICE_BLOCKED'), 'auth'],
    [apiError(400, 'API key not valid. Please pass a valid API key.'), 'auth'],
    [apiError(404, 'models/gemini-9-flash is not found for API version v1beta'), 'model_not_found'],
    [apiError(429, 'RESOURCE_EXHAUSTED'), 'quota'],
    [apiError(503, 'The model is overloaded'), 'overloaded'],
    [new TypeError('Failed to fetch'), 'network'],
    [apiError(400, 'Invalid JSON payload'), 'bad_request']
  ])('%s -> %s', (err, kind) => {
    expect(classifyAIError(err).kind).toBe(kind);
  });
});

describe('parseJsonReply', () => {
  it('handles fences and stray prose', () => {
    expect(svc.parseJsonReply('```json\n{"a":1}\n```')).toEqual({ a: 1 });
    expect(svc.parseJsonReply('Sure! Here it is: {"a":2} Enjoy.')).toEqual({ a: 2 });
  });
  it('throws bad_output for non-JSON', () => {
    expect(() => svc.parseJsonReply('no json here')).toThrowError(AIError);
  });
});

describe('Gemini cascade', () => {
  beforeEach(() => {
    svc.setProviderKey('gemini', GOOD_KEY);
    svc.setProviderModel('gemini', 'gemini-made-up-model');
  });

  it('moves to the next model when the chosen one does not exist', async () => {
    generateContent
      .mockRejectedValueOnce(apiError(404, 'model not found'))
      .mockResolvedValueOnce({ text: 'Hello, adventurer' });
    await expect(svc.executeUniversalPrompt({ userPrompt: 'hi' })).resolves.toBe('Hello, adventurer');
    expect(generateContent.mock.calls[0][0].model).toBe('gemini-made-up-model');
    expect(generateContent.mock.calls[1][0].model).toBe(svc.FALLBACK_MODELS[0]);
    expect(svc.getLastModelUsedLabel()).toContain(svc.FALLBACK_MODELS[0]);
  });

  it('stops immediately on a rejected key', async () => {
    generateContent.mockRejectedValue(apiError(403, 'PERMISSION_DENIED'));
    await expect(svc.executeUniversalPrompt({ userPrompt: 'hi' })).rejects.toMatchObject({ kind: 'auth' });
    expect(generateContent).toHaveBeenCalledTimes(1);
  });

  it('throws no_key without calling the API', async () => {
    localStorage.clear();
    await expect(svc.executeUniversalPrompt({ userPrompt: 'hi' })).rejects.toMatchObject({ kind: 'no_key' });
    expect(generateContent).not.toHaveBeenCalled();
  });
});

describe('Visible fallbacks', () => {
  it('reports when a scenario falls back to the offline generator', async () => {
    svc.setProviderKey('gemini', GOOD_KEY);
    generateContent.mockRejectedValue(apiError(403, 'API_KEY_SERVICE_BLOCKED'));
    const res = await svc.generateScenarioAI({ category: 'fantasy' as any });
    expect(res.source).toBe('procedural');
    const status = getAIStatus();
    expect(status.state).toBe('error');
    expect(status.kind).toBe('auth');
    expect(status.usedFallback).toBe(true);
    expect(status.visible).toBe(true);
  });

  it('Book Two mode throws instead of substituting a random story', async () => {
    svc.setProviderKey('gemini', GOOD_KEY);
    generateContent.mockRejectedValue(apiError(403, 'API_KEY_SERVICE_BLOCKED'));
    await expect(svc.generateScenarioAI({ category: 'fantasy' as any, allowFallback: false })).rejects.toThrow(/rejected your API key/);
  });

  it('accepts a valid AI scenario', async () => {
    svc.setProviderKey('gemini', GOOD_KEY);
    generateContent.mockResolvedValue({ text: JSON.stringify({ title: 'T', storyBlurb: 'B', heroName: 'H' }) });
    const res = await svc.generateScenarioAI({ category: 'fantasy' as any });
    expect(res.source).toBe('ai');
    expect(res.scenario.title).toBe('T');
    expect(getAIStatus().state).toBe('ok');
  });

  it('stays quiet in offline mode', async () => {
    svc.setOfflineMode(true);
    const res = await svc.generateScenarioAI({ category: 'fantasy' as any });
    expect(res.source).toBe('procedural');
    expect(getAIStatus().state).toBe('unknown');
    expect(generateContent).not.toHaveBeenCalled();
  });
});
