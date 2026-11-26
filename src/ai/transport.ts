/**
 * Provider transports shared by the game's prompt helpers and the tier router.
 * Every transport takes a system string plus a messages array, sets an output limit,
 * reports truncation, and throws a classified AIError. Nothing here falls back to
 * procedural content.
 */
import { AIProviderId, AI_PROVIDERS } from '../lib/providersConfig';
import { AIError, classifyAIError, isTransient, shouldTryNextModel } from '../lib/aiErrors';
import { localCallFor } from '../desktop/localModel';
import { formatResetTime, isModelBusy, isModelOut, markModelBusy, markModelOut, modelOutUntil, quotaScopeFromError, recordGeminiUsage } from './quota';

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
  /**
   * Gemini only, with `json`: the shape the reply must have (an OpenAPI-style responseSchema).
   * Structured output removes most unparseable replies. Other providers ignore it.
   */
  schema?: Record<string, unknown>;
  /** Give up on one request after this long (default AI_REQUEST_TIMEOUT_MS). Short tasks use less. */
  timeoutMs?: number;
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

// Default Gemini model. Free keys get about 500 Flash-Lite requests a day but only about 20
// Flash requests, so Flash-Lite is the default and Flash is the player's choice (ohnna, 2026-11-21).
export const GEMINI_DEFAULT_MODEL = 'gemini-3.5-flash-lite';

// Models tried, in order, after the player's chosen model when it is unavailable,
// rate-limited or overloaded. Stable IDs from https://ai.google.dev/gemini-api/docs/models
// Flash-Lite first: it has the largest free allowance and answers in seconds. Note that
// gemini-flash-latest and gemini-3.8-flash share one quota, so only one of them is listed.
export const FALLBACK_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-3.8-flash',
  'gemini-3.6-flash'
];

// Give up on a single provider request after this long. A model that has not answered in a
// minute is usually queued or overloaded, and the next model is a better bet than waiting.
export const AI_REQUEST_TIMEOUT_MS = 60_000;
// Short tasks (name rolls, the Rules Referee) on the basic tier.
export const AI_SHORT_TIMEOUT_MS = 30_000;

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
    !/-customtools$/.test(m) &&
    !/-\d{3}$/.test(m) &&
    !/-\d{2}-\d{2,4}$/.test(m);
  // Only the curated current models: every probe is a real request against the key's daily
  // limit (free Flash keys get about 20), so listing extras would spend it on models nobody picked.
  const curatedHere = curated.filter((m) => listed.includes(m) && current(m));
  return Array.from(new Set(curatedHere)).slice(0, max);
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
    if (res.ok) {
      try {
        recordGeminiUsage(model, (await res.json())?.usageMetadata);
      } catch (_) {}
      return { model, ok: true };
    }
    if (res.status === 429) {
      let scope;
      try {
        scope = quotaScopeFromError(await res.json());
      } catch (_) {}
      // A limit of 0 means the key can never use this model (paid only). Any other 429 is a
      // limit that resets, so the model stays usable and the cascade skips it until then.
      if (scope === 'zero') return { model, ok: false, reason: 'needs a paid key (limit 0)' };
      if (scope === 'day') markModelOut(model, 'day');
      return { model, ok: true, reason: scope === 'day' ? 'out of requests for today' : 'rate-limited right now' };
    }
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
  return orderedGeminiCandidates(first).filter((m) => !isModelOut(m));
}

// "-latest" aliases run on the same model as a pinned ID, so when one is overloaded the other
// is too, and the cascade skips it (2026-11-24: gemini-flash-lite-latest answered as gemini-3.5-flash-lite, and both gave
// the same 503s). Replies carry modelVersion, which keeps this map current.
const GEMINI_ALIAS_TARGETS: Record<string, string> = {
  'gemini-flash-lite-latest': 'gemini-3.5-flash-lite',
  'gemini-flash-latest': 'gemini-3.8-flash'
};

/** The model a name really runs on: an alias's current target, else the name itself. */
export function geminiBackend(model: string): string {
  return GEMINI_ALIAS_TARGETS[model] || model;
}

export function rememberGeminiAlias(model: string, modelVersion: unknown): void {
  if (!/-latest$/.test(model) || typeof modelVersion !== 'string') return;
  const target = normalizeGeminiModelName(modelVersion);
  if (/^gemini-/.test(target) && target !== model) GEMINI_ALIAS_TARGETS[model] = target;
}

/** A model Google called overloaded in the last few minutes, by name or through its alias. */
export function isGeminiBusy(model: string): boolean {
  return isModelBusy(model) || isModelBusy(geminiBackend(model));
}

function orderedGeminiCandidates(first: string): string[] {
  const ordered = rawGeminiCandidates(first);
  // Busy models go last rather than out: if every model is busy, they are still worth a try.
  return [...ordered.filter((m) => !isGeminiBusy(m)), ...ordered.filter((m) => isGeminiBusy(m))];
}

function rawGeminiCandidates(first: string): string[] {
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
/** "quota" alone hides the useful part; a daily limit says when it comes back. */
function swapReasonText(err?: AIError): string | undefined {
  if (!err) return undefined;
  if (err.kind === 'quota' && err.quotaScope === 'day' && err.resetAt) return `daily limit used up until ${formatResetTime(err.resetAt)}`;
  if (err.kind === 'quota' && err.quotaScope === 'zero') return 'needs a paid key';
  if (err.kind === 'overloaded') return 'busy';
  return err.kind;
}
/** Up to a second of random spread, so retries from many tabs or players don't land together. */
const jitter = () => Math.floor(Math.random() * 1000);

/** Time left for a call that must finish by `deadlineAt`, capped at the per-request timeout. */
function requestBudget(deadlineAt: number, provider: string, cap: number = AI_REQUEST_TIMEOUT_MS): number {
  const remaining = deadlineAt - Date.now();
  if (remaining < 2_000) {
    throw new AIError('timeout', `Gave up after ${Math.round(AI_TURN_DEADLINE_MS / 1000)}s without a reply.`, { provider });
  }
  return Math.min(cap, remaining);
}

// A local model on a home PC can take well over a minute for one reply; it has no quota to protect.
const LOCAL_REQUEST_TIMEOUT_MS = 90_000;

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
// Models that reject "minimal" thinking (Flash); they get "low", the nearest level they take.
const modelsWithoutMinimalThinking = new Set<string>();

/**
 * Gemini 3.6 and newer (and Gemini 4) ignore temperature and may reject it in a future
 * release (Google troubleshooting guide), so it is not sent to them.
 */
export function geminiTakesTemperature(model: string): boolean {
  return !/^gemini-(3\.([6-9]|\d{2})|[4-9])(\.|-)/.test(model) && !/^gemini-(flash|pro)-latest$/.test(model);
}
// Models that rejected a response schema; asked for plain JSON from then on.
const modelsWithoutSchema = new Set<string>();

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
  outer?: AbortSignal,
  schema?: Record<string, unknown>
): Promise<TransportReply> {
  const generationConfig: Record<string, any> = { maxOutputTokens: maxTokens };
  if (geminiTakesTemperature(modelName)) generationConfig.temperature = temperature;
  if (thinking === 'minimal' && modelsWithoutMinimalThinking.has(modelName)) thinking = 'low';
  if (responseJson) generationConfig.responseMimeType = 'application/json';
  const useSchema = !!(responseJson && schema && !modelsWithoutSchema.has(modelName));
  if (useSchema) generationConfig.responseSchema = schema;
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
        if (res.status === 429) {
          const scope = quotaScopeFromError(json);
          if (scope === 'day' || scope === 'zero') {
            // Waiting does not clear these, whatever retryDelay says: skip the model until the reset.
            const resetAt = markModelOut(modelName, scope);
            const what = scope === 'zero' ? 'gets no requests on this key (paid only)' : `is out of requests until ${formatResetTime(resetAt)}`;
            throw new AIError('quota', `[Google Gemini] ${modelName} ${what}. ${parsedMsg}`, { provider: 'gemini', status: 429, quotaScope: scope, resetAt, model: modelName });
          }
          if (scope === 'minute') {
            throw new AIError('quota', `[Google Gemini] API Error (429): ${parsedMsg}`, { provider: 'gemini', status: 429, quotaScope: 'minute', model: modelName });
          }
        }
      } catch (e) {
        if (e instanceof AIError) throw e;
      }
      // Flash rejects "minimal"; step up to "low" rather than dropping the setting, which would
      // leave the model's default (more thinking, slower, more tokens).
      if (res.status === 400 && useThinkingLevel && thinking === 'minimal' && /thinking level/i.test(parsedMsg) && /minimal/i.test(parsedMsg)) {
        modelsWithoutMinimalThinking.add(modelName);
        return callGeminiModel(apiKey, modelName, systemPrompt, messages, temperature, responseJson, 'low', maxTokens, timeoutMs, outer, schema);
      }
      // Models without thinking levels reject the field; retry once without it.
      if (res.status === 400 && useThinkingLevel && /thinking/i.test(parsedMsg)) {
        modelsWithoutThinkingLevel.add(modelName);
        return callGeminiModel(apiKey, modelName, systemPrompt, messages, temperature, responseJson, thinking, maxTokens, timeoutMs, outer, schema);
      }
      // A model that can't take this schema still answers plain JSON; retry once without it.
      if (res.status === 400 && useSchema && /schema|response_?schema|generation_?config/i.test(parsedMsg)) {
        modelsWithoutSchema.add(modelName);
        return callGeminiModel(apiKey, modelName, systemPrompt, messages, temperature, responseJson, thinking, maxTokens, timeoutMs, outer, schema);
      }
      throw classifyAIError({ status: res.status, message: `[Google Gemini] API Error (${res.status}): ${parsedMsg}` }, 'gemini');
    }

    const data = JSON.parse(raw);
    recordGeminiUsage(modelName, data.usageMetadata);
    rememberGeminiAlias(modelName, data.modelVersion);
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
  noCascade = false,
  schema?: Record<string, unknown>,
  timeoutMs: number = AI_REQUEST_TIMEOUT_MS
): Promise<ProviderReply> {
  const chosen = normalizeGeminiModelName(model);
  const candidates = noCascade ? (isModelOut(chosen) ? [] : [chosen]) : getGeminiCandidateModels(model);
  if (!candidates.length) {
    // Every model is out for today: say so and when it resets, without calling Google again.
    const out = modelOutUntil(chosen);
    const resetAt = out?.until;
    throw new AIError(
      'quota',
      `[Google Gemini] ${noCascade ? chosen : 'Every model this key can use'} is out of requests${resetAt ? ` until ${formatResetTime(resetAt)}` : ' for today'}.`,
      { provider: 'gemini', status: 429, quotaScope: out?.scope === 'zero' ? 'zero' : 'day', resetAt, model: chosen }
    );
  }
  let lastError: AIError | undefined;
  let firstError: AIError | undefined;
  let lastBadRequest: string | undefined;
  // The player's model is out for today and was skipped without a call: still say so.
  const skippedOut = !noCascade && candidates[0] !== chosen ? modelOutUntil(chosen) : undefined;
  if (skippedOut) {
    firstError = new AIError('quota', `${chosen} is out of requests until ${formatResetTime(skippedOut.until)}.`, { provider: 'gemini', quotaScope: skippedOut.scope, resetAt: skippedOut.until, model: chosen });
  }
  // The player's model was overloaded a few minutes ago and was put last: say so too.
  if (!firstError && !noCascade && candidates[0] !== chosen && isGeminiBusy(chosen)) {
    firstError = new AIError('overloaded', `${chosen} was busy a few minutes ago.`, { provider: 'gemini', model: chosen });
  }
  const reported = firstError ? chosen : candidates[0];

  // Real models that were overloaded during this call: an alias of one is skipped, not retried.
  const busyHere = new Set<string>();
  for (const modelName of candidates) {
    if (busyHere.has(geminiBackend(modelName))) {
      console.warn(`[Gemini] ${modelName} skipped: it runs on ${geminiBackend(modelName)}, which is busy.`);
      continue;
    }
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const reply = await callGeminiModel(
          apiKey, modelName, systemPrompt, messages, temperature, responseJson, thinking, maxTokens,
          Math.min(timeoutMs, requestBudget(deadlineAt, 'gemini', timeoutMs)), outer, schema
        );
        return {
          ...reply,
          provider: 'gemini',
          model: modelName,
          ...(modelName !== reported ? { swappedFrom: reported, swapReason: swapReasonText(firstError) } : {})
        };
      } catch (raw) {
        const err = classifyAIError(raw, 'gemini');
        lastError = err;
        if (!firstError) firstError = err;
        // A bad key, a blocked prompt, a cancel or the overall deadline fail the same way on every model.
        if (err.kind === 'auth' || err.kind === 'blocked' || err.kind === 'cancelled' || (err.kind === 'timeout' && deadlineAt - Date.now() < 2_000)) throw err;
        const hint = parseRetryDelayMs(err.message);
        // A daily limit (or a limit of 0) does not clear by waiting: go straight to the next model.
        if (err.kind === 'quota' && (err.quotaScope === 'day' || err.quotaScope === 'zero')) break;
        // Honour a short retry hint on per-minute limits before moving down the cascade.
        if (attempt === 0 && err.kind === 'quota' && hint !== undefined && hint <= 10_000 && deadlineAt - Date.now() > hint + 5_000) {
          await sleep(hint + jitter());
          continue;
        }
        // Busy (503) or a dropped connection: one quick retry with backoff. A timeout is not
        // retried on the same model; it already waited the whole request budget.
        if (attempt === 0 && isTransient(err.kind) && err.kind !== 'timeout') {
          await sleep(Math.min(hint ?? 1000, 5000) + jitter());
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
    // Still overloaded after the retry: try other models first for the next few minutes.
    if (lastError?.kind === 'overloaded') {
      busyHere.add(geminiBackend(modelName));
      markModelBusy(modelName);
      if (geminiBackend(modelName) !== modelName) markModelBusy(geminiBackend(modelName));
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
      return await callGeminiWithCascade(apiKey, model, system, messages, temperature, json, thinking, maxTokens, deadlineAt, signal, req.noCascade, req.schema, req.timeoutMs);
    }
    const maxTokens = req.maxTokens ?? DEFAULT_MAX_OUTPUT_TOKENS.other;
    let reply: TransportReply;
    const local = cfg.local ?? localCallFor(provider, model, cfg.baseUrl);
    if (local) {
      reply = await callLocalOllama(model, local, system, messages, temperature, json, maxTokens, requestBudget(deadlineAt, provider, LOCAL_REQUEST_TIMEOUT_MS));
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
