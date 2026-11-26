/**
 * Gemini limits, as Google applies them (https://aistudio.google.com/docs/rate-limits):
 * requests per minute, input tokens per minute and requests per day, per Google Cloud
 * project and per model. Daily limits reset at midnight Pacific time.
 *
 * This module remembers which models are out of requests for the day, so the game stops
 * calling them until the reset, and keeps a per-day usage log for the meter in AI settings.
 * Everything lives in this browser only.
 */

const OUT_KEY = 'zeroroll_gemini_models_out';
const USAGE_KEY = 'zeroroll_gemini_usage';

export type QuotaScope = 'minute' | 'day' | 'zero';

/* ------------------------------ Pacific days ------------------------------ */

/** The Pacific-time calendar date (YYYY-MM-DD) that `now` falls on. */
export function pacificDay(now = Date.now()): string {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Los_Angeles', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date(now));
  const get = (t: string) => parts.find((p) => p.type === t)?.value || '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

/** The next midnight Pacific time after `now`, in epoch ms (when Google resets daily limits). */
export function nextPacificMidnight(now = Date.now()): number {
  const today = pacificDay(now);
  // Pacific is UTC-7 or UTC-8; step forward an hour at a time until the Pacific date changes.
  let t = now - (now % 3_600_000) + 3_600_000;
  while (pacificDay(t) === today) t += 3_600_000;
  // t is within the first hour of the new Pacific day; back up to the exact minute it started.
  while (pacificDay(t - 60_000) !== today) t -= 60_000;
  return t;
}

/** "3:00 AM" in the player's own time zone. */
export function formatResetTime(at: number): string {
  try {
    return new Date(at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  } catch (_) {
    return new Date(at).toISOString().slice(11, 16) + ' UTC';
  }
}

/* --------------------------- reading a 429 body --------------------------- */

/**
 * What a Gemini 429 means, from its QuotaFailure details. A daily quota does not clear by
 * waiting, whatever retryDelay says (Google forum, 2025); a limit of 0 means this key's
 * project gets no requests for the model at all (a paid-only model on a free key).
 */
export function quotaScopeFromError(json: any): QuotaScope | undefined {
  const err = json?.error;
  if (!err) return undefined;
  const message: string = String(err.message || '');
  if (/limit:\s*0\b/.test(message)) return 'zero';
  const violations: any[] = (err.details || []).flatMap((d: any) => (Array.isArray(d?.violations) ? d.violations : []));
  const ids = violations.map((v) => `${v?.quotaId || ''} ${v?.quotaMetric || ''}`).join(' ');
  if (/PerDay/i.test(ids)) return 'day';
  if (/PerMinute/i.test(ids)) return 'minute';
  if (/per day/i.test(message)) return 'day';
  return undefined;
}

/* --------------------------- models out for today -------------------------- */

interface OutEntry {
  until: number;
  scope: QuotaScope;
}

function readOut(): Record<string, OutEntry> {
  try {
    const parsed = JSON.parse(localStorage.getItem(OUT_KEY) || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (_) {
    return {};
  }
}

function writeOut(all: Record<string, OutEntry>): void {
  try {
    localStorage.setItem(OUT_KEY, JSON.stringify(all));
  } catch (_) {}
}

/** Stop calling `model` until Google's next daily reset (a week for a limit of 0). */
export function markModelOut(model: string, scope: QuotaScope, now = Date.now()): number {
  // A limit of 0 never resets for this key; check again in a week (the key may get billing).
  const until = scope === 'zero' ? now + 7 * 24 * 60 * 60 * 1000 : nextPacificMidnight(now);
  const all = readOut();
  all[model] = { until, scope };
  writeOut(all);
  return until;
}

/** When `model` is out for the day, the time it comes back; otherwise undefined. */
export function modelOutUntil(model: string, now = Date.now()): { until: number; scope: QuotaScope } | undefined {
  const all = readOut();
  const entry = all[model];
  if (!entry) return undefined;
  if (entry.until <= now) {
    delete all[model];
    writeOut(all);
    return undefined;
  }
  return entry;
}

export function isModelOut(model: string, now = Date.now()): boolean {
  return !!modelOutUntil(model, now);
}

/** Forget every "out for today" mark (a new key, or the player asked to retry). */
export function clearModelsOut(): void {
  try {
    localStorage.removeItem(OUT_KEY);
  } catch (_) {}
  clearModelsBusy();
}

/* ------------------------- models busy right now -------------------------- */

const BUSY_KEY = 'zeroroll_gemini_busy';
// Google's "high demand" 503s come in spells. After a model fails one, the next few minutes of
// calls go straight to a model that answers instead of paying two failed requests and a backoff
// on every call (seen on 3.5 Flash-Lite, 2026-11-24: 3 of 5 build calls in a row).
export const MODEL_BUSY_MS = 5 * 60 * 1000;

function readBusy(): Record<string, number> {
  try {
    const parsed = JSON.parse(localStorage.getItem(BUSY_KEY) || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (_) {
    return {};
  }
}

/** Try `model` last for a few minutes: Google said it was overloaded. */
export function markModelBusy(model: string, now = Date.now()): number {
  const all = readBusy();
  for (const [m, until] of Object.entries(all)) if (until <= now) delete all[m];
  const until = now + MODEL_BUSY_MS;
  all[model] = until;
  try {
    localStorage.setItem(BUSY_KEY, JSON.stringify(all));
  } catch (_) {}
  return until;
}

export function isModelBusy(model: string, now = Date.now()): boolean {
  const until = readBusy()[model];
  return typeof until === 'number' && until > now;
}

export function clearModelsBusy(): void {
  try {
    localStorage.removeItem(BUSY_KEY);
  } catch (_) {}
}

/* -------------------------------- usage log -------------------------------- */

export interface ModelUsage {
  requests: number;
  inputTokens: number;
  outputTokens: number;
}

interface UsageLog {
  day: string;
  models: Record<string, ModelUsage>;
}

function readUsage(now = Date.now()): UsageLog {
  const day = pacificDay(now);
  try {
    const parsed = JSON.parse(localStorage.getItem(USAGE_KEY) || 'null');
    if (parsed?.day === day && parsed.models && typeof parsed.models === 'object') return parsed;
  } catch (_) {}
  return { day, models: {} };
}

/** Counts one answered request and its tokens (Gemini's usageMetadata) against today's log. */
export function recordGeminiUsage(model: string, usage: any, now = Date.now()): void {
  const log = readUsage(now);
  const m = log.models[model] || { requests: 0, inputTokens: 0, outputTokens: 0 };
  m.requests += 1;
  m.inputTokens += Number(usage?.promptTokenCount) || 0;
  m.outputTokens += (Number(usage?.candidatesTokenCount) || 0) + (Number(usage?.thoughtsTokenCount) || 0);
  log.models[model] = m;
  try {
    localStorage.setItem(USAGE_KEY, JSON.stringify(log));
  } catch (_) {}
}

/** Today's (Pacific day) requests and tokens per model. */
export function getGeminiUsageToday(now = Date.now()): Record<string, ModelUsage> {
  return readUsage(now).models;
}

/**
 * Rough free-tier daily request limits, as keys reported them in late 2026. Google does not
 * publish free numbers and changes them, so these are only for the meter's "about N" hint.
 * The Flash aliases share one quota.
 */
export function approxFreeDailyLimit(model: string): number | undefined {
  if (/flash-lite/.test(model)) return 500;
  if (/^gemini-(flash-latest|3\.[5-9]-flash)$/.test(model)) return 20;
  return undefined;
}
