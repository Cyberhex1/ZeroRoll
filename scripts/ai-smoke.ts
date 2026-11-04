/**
 * Live smoke test: one tiny prompt through every provider that has a key in the
 * environment, using the same code path as the game (testProviderConnection).
 * Prints provider, model, latency and the first line of the reply.
 *
 *   GEMINI_API_KEY=... OPENAI_API_KEY=... ANTHROPIC_API_KEY=... npm run ai:smoke
 *   CUSTOM_BASE_URL=http://localhost:11434/v1 CUSTOM_MODEL=llama3.1 npm run ai:smoke
 *
 * Optional per-provider model overrides: GEMINI_MODEL, OPENAI_MODEL, ANTHROPIC_MODEL, ...
 * Keys are read from the environment only and never printed.
 */
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

const { testProviderConnection } = await import('../src/lib/geminiService');
const { AI_PROVIDERS } = await import('../src/lib/providersConfig');

const ENV: Record<string, { key?: string; model?: string; baseUrl?: string }> = {
  gemini: { key: process.env.GEMINI_API_KEY, model: process.env.GEMINI_MODEL },
  openai: { key: process.env.OPENAI_API_KEY, model: process.env.OPENAI_MODEL },
  anthropic: { key: process.env.ANTHROPIC_API_KEY, model: process.env.ANTHROPIC_MODEL },
  grok: { key: process.env.XAI_API_KEY, model: process.env.XAI_MODEL },
  openrouter: { key: process.env.OPENROUTER_API_KEY, model: process.env.OPENROUTER_MODEL },
  copilot: { key: process.env.GITHUB_MODELS_TOKEN, model: process.env.GITHUB_MODELS_MODEL },
  custom: { key: process.env.CUSTOM_API_KEY || '', model: process.env.CUSTOM_MODEL, baseUrl: process.env.CUSTOM_BASE_URL },
};

let ran = 0;
let failed = 0;
for (const [provider, cfg] of Object.entries(ENV)) {
  const configured = provider === 'custom' ? !!cfg.baseUrl : !!cfg.key;
  if (!configured) continue;
  ran++;
  const r = await testProviderConnection({
    provider: provider as any,
    apiKey: cfg.key || '',
    model: cfg.model,
    baseUrl: cfg.baseUrl,
  });
  const name = (AI_PROVIDERS as any)[provider]?.name || provider;
  const line = (r.reply || r.message).split('\n')[0];
  console.log(`${r.success ? 'PASS' : 'FAIL'}  ${name.padEnd(22)} ${(r.modelUsed || cfg.model || '-').padEnd(28)} ${String(r.latencyMs).padStart(6)} ms  ${line}`);
  if (!r.success) failed++;
}

if (!ran) {
  console.log('No provider keys in the environment. Set GEMINI_API_KEY, OPENAI_API_KEY, ANTHROPIC_API_KEY, XAI_API_KEY, OPENROUTER_API_KEY, GITHUB_MODELS_TOKEN or CUSTOM_BASE_URL.');
  process.exit(1);
}
process.exit(failed ? 1 : 0);
