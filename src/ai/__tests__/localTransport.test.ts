import { describe, it, expect, vi } from 'vitest';

// The Rust command the transport calls; each test sets what it answers.
let answer: (cmd: string, args: unknown) => Promise<unknown> = async () => ({ text: '', truncated: false });
const calls: Array<[string, unknown]> = [];
vi.mock('@tauri-apps/api/core', () => ({
  invoke: (cmd: string, args: unknown) => {
    calls.push([cmd, args]);
    return answer(cmd, args);
  }
}));

import { callProvider } from '../transport';

const cfg = { provider: 'custom' as const, apiKey: '', model: 'gemma3:12b', local: { context: 8192 } };
const kindOf = () => callProvider(cfg, { messages: [{ role: 'user', content: 'Hi' }] }).then(() => 'resolved', (e) => e.kind);
const fail = (msg: string) => async () => {
  throw msg; // Tauri rejects with the Rust error string.
};

describe('local model transport (Ollama via Rust)', () => {
  it('sends the chat to ollama_chat with the context size', async () => {
    answer = async () => ({ text: 'Hail, traveler.', truncated: false });
    const r = await callProvider(cfg, { system: 'Be brief.', messages: [{ role: 'user', content: 'Hi' }], maxTokens: 50 });
    expect(r).toMatchObject({ text: 'Hail, traveler.', provider: 'custom', model: 'gemma3:12b' });
    expect(calls.at(-1)).toEqual(['ollama_chat', { req: expect.objectContaining({ model: 'gemma3:12b', system: 'Be brief.', num_ctx: 8192, max_tokens: 50 }) }]);
  });

  it('reports Ollama not running as a network error so the router steps on', async () => {
    answer = fail('Ollama is not running on this PC.');
    expect(await kindOf()).toBe('network');
  });

  it('reports a missing model as model_not_found', async () => {
    answer = fail('Ollama error (404 Not Found): model "gemma3:12b" not found, try pulling it first');
    expect(await kindOf()).toBe('model_not_found');
  });
});
