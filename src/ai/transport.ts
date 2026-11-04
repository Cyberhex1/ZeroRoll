/**
 * Provider transports shared by the game's prompt helpers and the tier router.
 * Every transport takes a system string plus a messages array, sets an output limit,
 * reports truncation, and throws a classified AIError. Nothing here falls back to
 * procedural content.
 */
import { AIProviderId, AI_PROVIDERS } from '../lib/providersConfig';
import { AIError, classifyAIError, isTransient, shouldTryNextModel } from '../lib/aiErrors';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ProviderCallConfig {
  provider: AIProviderId;
  apiKey: string;
  model: string;
  baseUrl?: string;
  /** PC app only: send this call to the local model in Ollama (through the Rust side). */
  local?: { context: number; promptFormat?: 'mistral' | 'gemma' };
}

export interface ProviderRequest {
  system?: string;
  messages: ChatMessage[];
  temperature?: number;
  json?: boolean;
  thinking?: 'minimal' | 'low';
  maxTokens?: number;
  /** Absolute time (ms) by which the whole call, cascade included, must finish. */
  deadlineAt?: number;
  /** Cancels the call (e.g. the player navigated away). */
  signal?: AbortSignal;
  /** Gemini only: call exactly this model, without the fallback cascade (the router runs its own ladder). */
  noCascade?: boolean;
}

export interface ProviderReply {
  text: string;
  /** The provider stopped because it hit the output limit (the reply is cut off). */
  truncated: boolean;
  provider: AIProviderId;
  /** The model that actually answered. */
  model: string;
  /** Set when the Gemini cascade answered with a different model than the one chosen. */
  swappedFrom?: string;
  swapReason?: string;
}

/** What one transport call produced. */
interface TransportReply {
  text: string;
  truncated: boolean;
}

// Room for a long scene plus the trailing blocks. Gemini counts thinking tokens
// against the same limit, so it gets more headroom.
export const DEFAULT_MAX_OUTPUT_TOKENS: Record<'gemini' | 'other', number> = { gemini: 8192, other: 4096 };

// A whole turn (every model in the cascade, every retry) gives up after this long.
export const AI_TURN_DEADLINE_MS = 180_000;

// Default Gemini model: the "latest" alias Google keeps pointed at the current Flash release.
export const GEMINI_DEFAULT_MODEL = 'gemini-flash-latest';

// Models tried, in order, after the player's chosen model when it is unavailable,
// rate-limited or overloaded. Stable IDs from https://ai.google.dev/gemini-api/docs/models
export const FALLBACK_MODELS = [
  'gemini-flash-latest',
  'gemini-3.8-flash',
  'gemini-3.6-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite'
];

// Give up on a single provider request after this long.
export const AI_REQUEST_TIMEOUT_MS = 90_000;

/* -------------------------------------------------------------------------- */
/*                         GEMINI MODEL DISCOVERY                             */
/* -------------------------------------------------------------------------- */

const GEMINI_MODELS_CACHE_KEY = 'zeroroll_gemini_available_models';
const NON_TEXT_MODEL_PATTERN = /(image|tts|live|audio|embedding|transcribe|robotics|imagen|veo|lyria|aqa)/;

export function normalizeGeminiModelName(model?: string): string {
  const clean = (model || '').trim().replace(/^models\//, '');
  return clean || GEMINI_DEFAULT_MODEL;
}

/** Models the saved key could use the last time it was checked (null = never checked). */
export function getCachedGeminiModels(): string[] | null {
  try {
    const raw = localStorage.getItem(GEMINI_MODELS_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((m) => typeof m === 'string') : null;
  } catch (_) {
    return null;
  }
}

export function setCachedGeminiModels(models: string[] | null): void {
  try {
    if (models && models.length) localStorage.setItem(GEMINI_MODELS_CACHE_KEY, JSON.stringify(models));
    else localStorage.removeItem(GEMINI_MODELS_CACHE_KEY);
  } catch (_) {}
}

/**
 * Lists the text-generation models this key can call. Doubles as a key check:
 * a bad key throws an AIError of kind "auth".
 */
export async function listGeminiModels(apiKey: string): Promise<string[]> {
  const models: string[] = [];
  let pageToken = '';
  for (let page = 0; page < 5; page++) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?pageSize=1000${pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : ''}`;
    const data = await withTimeout(async (signal) => {
      const res = await fetch(url, { headers: { 'x-goog-api-key': apiKey.trim() }, signal });
      const body = await res.text();
      if (!res.ok) {
        let parsedMsg = body;
        try {
          const json = JSON.parse(body);
          parsedMsg = `${json.error?.status || ''} ${json.error?.message || body}`.trim();
          const reason = json.error?.details?.find((d: any) => d?.reason)?.reason;
          if (reason) parsedMsg += ` (${reason})`;
        } catch (_) {}
        throw classifyAIError({ status: res.status, message: `[Google Gemini] API Error (${res.status}): ${parsedMsg}` }, 'gemini');
      }
      return JSON.parse(body);
    }, 20_000, 'gemini');

    for (const m of data.models || []) {
      const name = normalizeGeminiModelName(m.name);
      const methods: string[] = m.supportedGenerationMethods || m.supportedActions || [];
      if (methods.includes('generateContent') && !NON_TEXT_MODEL_PATTERN.test(name)) {
        models.push(name);
      }
    }
    pageToken = data.nextPageToken || '';
    if (!pageToken) break;
  }
  return Array.from(new Set(models));
}

/* ------------------------- usable models (probed) ------------------------- */

const GEMINI_USABLE_KEY = 'zeroroll_gemini_usable_models';

/**
 * Models that actually answered a short test request with this key the last time they were
 * probed (null = never probed). Listing a model is not the same as being able to use it:
 * keys see models with zero free-tier quota, previews that 404, and aliases that are overloaded.
 * The pickers and the cascade only offer models in this list (ohnna, 2026-11-04).
 */
export function getUsableGeminiModels(): string[] | null {
  try {
    const parsed = JSON.parse(localStorage.getItem(GEMINI_USABLE_KEY) || 'null');
    return Array.isArray(parsed?.models) ? parsed.models.filter((m: unknown) => typeof m === 'string') : null;
  } catch (_) {
    return null;
  }
}

export function setUsableGeminiModels(models: string[] | null): void {
  try {
    if (models) localStorage.setItem(GEMINI_USABLE_KEY, JSON.stringify({ models, checkedAt: Date.now() }));
    else localStorage.removeItem(GEMINI_USABLE_KEY);
  } catch (_) {}
}

/** Text models worth probing: current generations only, no dated snapshots or experiments. */
export function probeCandidates(listed: string[], curated: string[], max = 12): string[] {
  const current = (m: string) =>
    /^gemini-/.test(m) &&
    !/^gemini-(1|2)(\.|-)/.test(m) &&
    !/^gemini-pro(-|$)/.test(m) &&
    !/-(exp|experimental)(-|$)/.test(m) &&
    !/-\d{3}$/.test(m) &&
    !/-\d{2}-\d{2,4}$/.test(m);
  const fromList = listed.filter(current);
  const curatedHere = curated.filter((m) => listed.includes(m));
  return Array.from(new Set([...curatedHere, ...fromList])).slice(0, max);
}

/** One tiny request: does this model answer with this key right now? */
export async function probeGeminiModel(apiKey: string, model: string, timeoutMs = 15_000): Promise<{ model: string; ok: boolean; reason?: string }> {
  try {
    const res = await withTimeout(
      (signal) =>
        fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey.trim() },
          body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: 'Reply with the word OK.' }] }], generationConfig: { maxOutputTokens: 64, temperature: 0 } }),
          signal
        }),
      timeoutMs,
      'gemini'
    );
    if (res.ok) return { model, ok: true };
    return { model, ok: false, reason: `HTTP ${res.status}` };
  } catch (e) {
    return { model, ok: false, reason: e instanceof Error ? e.message : String(e) };
  }
}

/** Probes the candidates a few at a time and returns the ones that answered, in candidate order. */
export async function probeGeminiModels(apiKey: string, candidates: string[], concurrency = 3): Promise<{ usable: string[]; failed: Array<{ model: string; reason?: string }> }> {
  const results: Array<{ model: string; ok: boolean; reason?: string }> = [];
  for (let i = 0; i < candidates.length; i += concurrency) {
    results.push(...(await Promise.all(candidates.slice(i, i + concurrency).map((m) => probeGeminiModel(apiKey, m)))));
  }
  return {
    usable: candidates.filter((m) => results.find((r) => r.model === m)?.ok),
    failed: results.filter((r) => !r.ok).map(({ model, reason }) => ({ model, reason }))
  };
}

/**
 * The chosen model first, then known-good fallbacks the key can actually use. Once the key's
 * models have been probed, only models that answered are tried, so a turn never waits on a
 * model that cannot serve it.
 */
export function getGeminiCandidateModels(preferred?: string): string[] {
  const first = normalizeGeminiModelName(preferred);
  const usable = getUsableGeminiModels();
  if (usable && usable.length) {
    const ordered = [first, ...FALLBACK_MODELS, ...usable].filter((m) => usable.includes(m));
    return Array.from(new Set(ordered)).slice(0, 4);
  }
  const available = getCachedGeminiModels();
  const fallbacks = FALLBACK_MODELS.filter((m) => !available || available.includes(m));
  const extras = available
    ? available.filter((m) => m.includes('flash') && !m.includes('preview') && !m.includes('exp')).slice(0, 3)
    : [];
  return Array.from(new Set([first, ...fallbacks, ...extras])).slice(0, 5);
}

export async function withTimeout<T>(
  run: (signal: AbortSignal) => Promise<T>,
  ms: number,
  provider: string,
  outer?: AbortSignal
): Promise<T> {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  let onAbort: (() => void) | undefined;
  const stop = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new AIError('timeout', `No response after ${Math.round(ms / 1000)}s`, { provider }));
    }, ms);
    if (outer) {
      onAbort = () => {
        controller.abort();
        reject(new AIError('cancelled', 'Cancelled.', { provider }));
      };
      if (outer.aborted) onAbort();
      else outer.addEventListener('abort', onAbort, { once: true });
    }
  });
  try {
    return await Promise.race([run(controller.signal), stop]);
  } finally {
    clearTimeout(timer);
    if (outer && onAbort) outer.removeEventListener('abort', onAbort);
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Time left for a call that must finish by `deadlineAt`, capped at the per-request timeout. */
function requestBudget(deadlineAt: number, provider: string): number {
  const remaining = deadlineAt - Date.now();
  if (remaining < 2_000) {
    throw new AIError('timeout', `Gave up after ${Math.round(AI_TURN_DEADLINE_MS / 1000)}s without a reply.`, { provider });
  }
  return Math.min(AI_REQUEST_TIMEOUT_MS, remaining);
}

/** Seconds the provider asked us to wait, from "retry in 7.2s" or a RetryInfo "retryDelay": "7s". */
export function parseRetryDelayMs(message: string): number | undefined {
  const m = message.match(/retry in ([\d.]+)\s*s/i) || message.match(/retryDelay"?\s*[:=]\s*"?([\d.]+)s/i);
  if (!m) return undefined;
  const ms = Math.ceil(parseFloat(m[1]) * 1000);
  return Number.isFinite(ms) ? ms : undefined;
}

/* -------------------------------------------------------------------------- */
/*                            GEMINI IMPLEMENTATION                           */
/* -------------------------------------------------------------------------- */

// Models that rejected a thinking level (older or non-thinking models); sent without it from then on.
const modelsWithoutThinkingLevel = new Set<string>();

/**
 * One generateContent call over plain REST. The @google/genai SDK added ~500 KB to the
 * page download for this single request. The key goes in the x-goog-api-key header,
 * never in the URL.
 */
async function callGeminiModel(
  apiKey: string,
  modelName: string,
  systemPrompt: string | undefined,
  messages: ChatMessage[],
  temperature: number,
  responseJson: boolean,
  thinking: 'minimal' | 'low',
  maxTokens: number,
  timeoutMs: number,
  outer?: AbortSignal
): Promise<TransportReply> {
  const generationConfig: Record<string, any> = { temperature, maxOutputTokens: maxTokens };
  if (responseJson) generationConfig.responseMimeType = 'application/json';
  const useThinkingLevel = !modelsWithoutThinkingLevel.has(modelName);
  if (useThinkingLevel) generationConfig.thinkingConfig = { thinkingLevel: thinking.toUpperCase() };

  const body: Record<string, any> = {
    contents: messages.map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
    generationConfig
  };
  if (systemPrompt) body.systemInstruction = { parts: [{ text: systemPrompt }] };

  return withTimeout(async (signal) => {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelName)}:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey.trim() },
        body: JSON.stringify(body),
        signal
      }
    );
    const raw = await res.text();

    if (!res.ok) {
      let parsedMsg = raw;
      try {
        const json = JSON.parse(raw);
        parsedMsg = `${json.error?.status || ''} ${json.error?.message || raw}`.trim();
        const reason = json.error?.details?.find((d: any) => d?.reason)?.reason;
        if (reason) parsedMsg += ` (${reason})`;
        const retryDelay = json.error?.details?.find((d: any) => d?.retryDelay)?.retryDelay;
        if (retryDelay) parsedMsg += ` retryDelay: ${retryDelay}`;
      } catch (_) {}
      // Models without thinking levels reject the field; retry once without it.
      if (res.status === 400 && useThinkingLevel && /thinking/i.test(parsedMsg)) {
        modelsWithoutThinkingLevel.add(modelName);
        return callGeminiModel(apiKey, modelName, systemPrompt, messages, temperature, responseJson, thinking, maxTokens, timeoutMs, outer);
      }
      throw classifyAIError({ status: res.status, message: `[Google Gemini] API Error (${res.status}): ${parsedMsg}` }, 'gemini');
    }

    const data = JSON.parse(raw);
    const candidate = data.candidates?.[0];
    const finishReason: string | undefined = candidate?.finishReason;
    const blockReason: string | undefined = data.promptFeedback?.blockReason;
    if (blockReason || finishReason === 'SAFETY' || finishReason === 'PROHIBITED_CONTENT' || finishReason === 'BLOCKLIST') {
      throw new AIError('blocked', `${modelName} blocked the ${blockReason ? 'prompt' : 'reply'} (${blockReason || finishReason}).`, { provider: 'gemini' });
    }
    const parts: any[] = candidate?.content?.parts || [];
    const text = parts.filter((p) => !p.thought && typeof p.text === 'string').map((p) => p.text).join('');
    if (!text.trim()) {
      const why = finishReason === 'MAX_TOKENS' ? 'it used its whole length limit before writing anything' : finishReason || 'no text';
      throw new AIError('bad_output', `${modelName} returned an empty reply (${why}).`, { provider: 'gemini' });
    }
    return { text, truncated: finishReason === 'MAX_TOKENS' };
  }, timeoutMs, 'gemini', outer);
}

async function callGeminiWithCascade(
  apiKey: string,
  model: string,
  systemPrompt: string | undefined,
  messages: ChatMessage[],
  temperature: number,
  responseJson: boolean,
  thinking: 'minimal' | 'low' = 'low',
  maxTokens: number = DEFAULT_MAX_OUTPUT_TOKENS.gemini,
  deadlineAt: number = Date.now() + AI_TURN_DEADLINE_MS,
  outer?: AbortSignal,
  noCascade = false
): Promise<ProviderReply> {
  const candidates = noCascade ? [normalizeGeminiModelName(model)] : getGeminiCandidateModels(model);
  let lastError: AIError | undefined;
  let firstError: AIError | undefined;
  let lastBadRequest: string | undefined;

  for (const modelName of candidates) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const reply = await callGeminiModel(
          apiKey, modelName, systemPrompt, messages, temperature, responseJson, thinking, maxTokens,
          requestBudget(deadlineAt, 'gemini'), outer
        );
        return {
          ...reply,
          provider: 'gemini',
          model: modelName,
          ...(modelName !== candidates[0] ? { swappedFrom: candidates[0], swapReason: firstError?.kind } : {})
        };
      } catch (raw) {
        const err = classifyAIError(raw, 'gemini');
        lastError = err;
        if (!firstError) firstError = err;
        // A bad key, a blocked prompt, a cancel or the overall deadline fail the same way on every model.
        if (err.kind === 'auth' || err.kind === 'blocked' || err.kind === 'cancelled' || (err.kind === 'timeout' && deadlineAt - Date.now() < 2_000)) throw err;
        const hint = parseRetryDelayMs(err.message);
        // Honour a short retry hint on quota errors before moving down the cascade.
        if (attempt === 0 && err.kind === 'quota' && hint !== undefined && hint <= 10_000 && deadlineAt - Date.now() > hint + 5_000) {
          await sleep(hint);
          continue;
        }
        if (attempt === 0 && isTransient(err.kind)) {
          await sleep(Math.min(hint ?? 1000, 5000));
          continue;
        }
        break;
      }
    }
    if (lastError?.kind === 'bad_request') {
      // A 400 that is about this model (unsupported option) is worth one more model;
      // the same 400 twice means the request itself is the problem.
      if (lastBadRequest === lastError.message) throw lastError;
      lastBadRequest = lastError.message;
    } else if (lastError && !shouldTryNextModel(lastError.kind) && lastError.kind !== 'bad_output' && lastError.kind !== 'timeout') {
      throw lastError;
    }
    console.warn(`[Gemini] ${modelName} failed (${lastError?.kind}): ${lastError?.message}`);
  }

  throw lastError || new AIError('unknown', 'No Gemini model could answer.', { provider: 'gemini' });
}

/* -------------------------------------------------------------------------- */
/*                       OPENAI COMPATIBLE IMPLEMENTATION                     */
/* -------------------------------------------------------------------------- */

/**
 * A 404 from /chat/completions means either the model is unknown or the base URL is
 * wrong (Ollama without /v1, a typo). Probing /models tells the two apart.
 */
async function baseUrlLooksLikeApi(base: string, headers: Record<string, string>): Promise<boolean> {
  try {
    const res = await withTimeout(
      (signal) => fetch(`${base}/models`, { method: 'GET', headers: { Authorization: headers['Authorization'] || '' }, signal }),
      8_000,
      'probe'
    );
    if (res.status === 404) return false;
    const type = res.headers.get('content-type') || '';
    return !type.includes('text/html');
  } catch (_) {
    return false;
  }
}

async function callOpenAICompatibleApi(
  provider: AIProviderId,
  apiKey: string,
  baseUrl: string,
  model: string,
  systemPrompt: string | undefined,
  chat: ChatMessage[],
  temperature: number,
  responseJson: boolean,
  maxTokens: number = DEFAULT_MAX_OUTPUT_TOKENS.other,
  timeoutMs: number = AI_REQUEST_TIMEOUT_MS,
  outer?: AbortSignal
): Promise<TransportReply> {
  const base = baseUrl.replace(/\/+$/, '');
  const url = `${base}/chat/completions`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  if (apiKey && apiKey.trim()) {
    headers['Authorization'] = `Bearer ${apiKey.trim()}`;
  }

  // OpenRouter specific attribution headers
  if (provider === 'openrouter') {
    headers['HTTP-Referer'] = 'https://zeroroll.app';
    headers['X-Title'] = 'ZeroRoll TTRPG Engine';
  }

  const messages: Array<{ role: string; content: string }> = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  for (const m of chat) messages.push({ role: m.role, content: m.content });

  const body: any = {
    model: model || 'gpt-4o-mini',
    messages,
    temperature
  };
  // OpenAI's current models only accept max_completion_tokens; compatible servers use max_tokens.
  if (provider === 'openai') body.max_completion_tokens = maxTokens;
  else body.max_tokens = maxTokens;

  if (responseJson && supportsJsonMode(provider)) {
    body.response_format = { type: 'json_object' };
  }

  return withTimeout(async (signal) => {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal
    });

    if (!res.ok) {
      const errorBody = await res.text();
      let parsedMsg = errorBody;
      try {
        const json = JSON.parse(errorBody);
        parsedMsg = json.error?.message || json.message || errorBody;
      } catch (_) {}
      const providerName = AI_PROVIDERS[provider]?.name || provider;
      if (res.status === 404 && !(await baseUrlLooksLikeApi(base, headers))) {
        throw new AIError('bad_base_url', `[${providerName}] ${url} returned 404 and ${base}/models is not an API either.`, { provider, status: 404 });
      }
      throw classifyAIError(
        { status: res.status, message: `[${providerName}] API Error (${res.status}): ${parsedMsg}` },
        provider
      );
    }

    const data = await res.json();
    const choice = data.choices?.[0];
    const content = choice?.message?.content || '';
    const text = typeof content === 'string' ? content : JSON.stringify(content);
    if (!text.trim()) {
      if (choice?.finish_reason === 'content_filter') throw new AIError('blocked', `${model} filtered the reply.`, { provider });
      throw new AIError('bad_output', `${model} returned an empty reply.`, { provider });
    }
    return { text, truncated: choice?.finish_reason === 'length' };
  }, timeoutMs, provider, outer);
}

/** Providers that accept response_format: json_object. Others get JSON instructions in the prompt only. */
export function supportsJsonMode(provider: AIProviderId): boolean {
  return provider === 'gemini' || provider === 'openai' || provider === 'openrouter' || provider === 'grok';
}

/* -------------------------------------------------------------------------- */
/*                          ANTHROPIC CLAUDE IMPLEMENTATION                   */
/* -------------------------------------------------------------------------- */

async function callAnthropicApi(
  apiKey: string,
  baseUrl: string,
  model: string,
  systemPrompt: string | undefined,
  chat: ChatMessage[],
  temperature: number,
  responseJson: boolean,
  maxTokens: number = DEFAULT_MAX_OUTPUT_TOKENS.other,
  timeoutMs: number = AI_REQUEST_TIMEOUT_MS,
  outer?: AbortSignal
): Promise<TransportReply> {
  const url = `${baseUrl.replace(/\/+$/, '')}/messages`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-api-key': apiKey.trim(),
    'anthropic-version': '2023-06-01',
    'anthropic-dangerous-direct-browser-access': 'true'
  };

  const messages = chat.map((m) => ({ role: m.role, content: m.content }));
  const last = messages[messages.length - 1];
  if (responseJson && last?.role === 'user') {
    last.content += '\n\nIMPORTANT: Respond ONLY with valid, parseable JSON with no markdown wrapping.';
  }

  const body: any = {
    model: model || AI_PROVIDERS.anthropic.defaultModel,
    max_tokens: maxTokens,
    temperature,
    messages
  };

  if (systemPrompt) {
    body.system = systemPrompt;
  }

  return withTimeout(async (signal) => {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal
    });

    if (!res.ok) {
      const errorBody = await res.text();
      let parsedMsg = errorBody;
      try {
        const json = JSON.parse(errorBody);
        parsedMsg = json.error?.message || json.message || errorBody;
      } catch (_) {}
      throw classifyAIError({ status: res.status, message: `[Anthropic Claude] API Error (${res.status}): ${parsedMsg}` }, 'anthropic');
    }

    const data = await res.json();
    const text = (data.content || [])
      .filter((c: any) => c.type === 'text' && typeof c.text === 'string')
      .map((c: any) => c.text)
      .join('');
    if (!text.trim()) {
      if (data.stop_reason === 'refusal') throw new AIError('blocked', `${model} declined to answer.`, { provider: 'anthropic' });
      throw new AIError('bad_output', `${model} returned an empty reply.`, { provider: 'anthropic' });
    }
    return { text, truncated: data.stop_reason === 'max_tokens' };
  }, timeoutMs, 'anthropic', outer);
}

/* -------------------------------------------------------------------------- */
/*                         LOCAL MODEL (PC APP, OLLAMA)                       */
/* -------------------------------------------------------------------------- */

/**
 * Calls the local model through the Rust side, which forwards to Ollama on localhost.
 * Going through Rust avoids Ollama's CORS rules for the app's webview origin.
 */
async function callLocalOllama(
  model: string,
  local: NonNullable<ProviderCallConfig['local']>,
  systemPrompt: string | undefined,
  chat: ChatMessage[],
  temperature: number,
  responseJson: boolean,
  maxTokens: number,
  timeoutMs: number
): Promise<TransportReply> {
  const { invoke } = await import('@tauri-apps/api/core');
  let reply: { text: string; truncated: boolean };
  try {
    reply = await invoke('ollama_chat', {
      req: { model, system: systemPrompt, messages: chat, temperature, max_tokens: maxTokens, num_ctx: local.context, json: responseJson, timeout_ms: timeoutMs, prompt_format: local.promptFormat }
    });
  } catch (err) {
    const msg = String(err instanceof Error ? err.message : err);
    if (/not running/i.test(msg)) throw new AIError('network', msg, { provider: 'custom' });
    if (/^timeout/i.test(msg)) throw new AIError('timeout', msg, { provider: 'custom' });
    if (/not found|pull/i.test(msg)) throw new AIError('model_not_found', msg, { provider: 'custom' });
    throw new AIError('network', msg, { provider: 'custom' });
  }
  if (!reply.text.trim()) throw new AIError('bad_output', `${model} returned an empty reply.`, { provider: 'custom' });
  return reply;
}

/* -------------------------------------------------------------------------- */
/*                               SINGLE ENTRY POINT                           */
/* -------------------------------------------------------------------------- */

/**
 * One call to one provider. Gemini runs its model cascade; the others call the
 * configured model once. Throws a classified AIError.
 */
export async function callProvider(cfg: ProviderCallConfig, req: ProviderRequest): Promise<ProviderReply> {
  const { provider, apiKey, model } = cfg;
  const { system, messages, temperature = 0.8, json = false, thinking = 'low', signal } = req;
  const providerName = AI_PROVIDERS[provider]?.name || provider;
  const deadlineAt = req.deadlineAt ?? Date.now() + AI_TURN_DEADLINE_MS;

  if (provider !== 'custom' && !apiKey.trim()) {
    throw new AIError('no_key', `Missing ${providerName} API key.`, { provider });
  }

  try {
    if (provider === 'gemini') {
      const maxTokens = req.maxTokens ?? DEFAULT_MAX_OUTPUT_TOKENS.gemini;
      return await callGeminiWithCascade(apiKey, model, system, messages, temperature, json, thinking, maxTokens, deadlineAt, signal, req.noCascade);
    }
    const maxTokens = req.maxTokens ?? DEFAULT_MAX_OUTPUT_TOKENS.other;
    let reply: TransportReply;
    if (cfg.local) {
      reply = await callLocalOllama(model, cfg.local, system, messages, temperature, json, maxTokens, requestBudget(deadlineAt, provider));
    } else if (provider === 'anthropic') {
      const baseUrl = cfg.baseUrl || AI_PROVIDERS.anthropic?.defaultBaseUrl || 'https://api.anthropic.com/v1';
      reply = await callAnthropicApi(apiKey, baseUrl, model, system, messages, temperature, json, maxTokens, requestBudget(deadlineAt, provider), signal);
    } else {
      const baseUrl = cfg.baseUrl || AI_PROVIDERS[provider]?.defaultBaseUrl || 'https://api.openai.com/v1';
      reply = await callOpenAICompatibleApi(provider, apiKey, baseUrl, model, system, messages, temperature, json, maxTokens, requestBudget(deadlineAt, provider), signal);
    }
    return { ...reply, provider, model };
  } catch (err) {
    throw classifyAIError(err, provider);
  }
}
