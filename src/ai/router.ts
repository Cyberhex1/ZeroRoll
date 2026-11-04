/**
 * Tier router. Callers ask for a quality tier, not a model:
 *   basic = cheap and fast (field rolls, short helpers)
 *   good  = the story model (turns, chapter openings)
 *   best  = the strongest model (planning, hard rules questions)
 *
 * The router picks the model for that tier from models.json (or the player's override),
 * and when a model is unavailable, rate-limited or overloaded it steps down the ladder:
 * best -> good -> basic. Every step down is reported to the status line. If the whole
 * ladder fails, it throws the last AIError. It never substitutes procedural content.
 */
import modelsJson from './models.json';
import { AIProviderId, AI_PROVIDERS } from '../lib/providersConfig';
import { AIError, AIErrorKind, classifyAIError } from '../lib/aiErrors';
import { reportAINotice, reportAISuccess } from '../lib/aiStatus';
import { getActiveProvider, getProviderBaseUrl, getProviderKey, getProviderModel, getSavedProviderModel } from '../lib/geminiService';
import { AI_TURN_DEADLINE_MS, ChatMessage, ProviderReply, callProvider } from './transport';
import { getLadderPatch } from './weeklyModelCheck';
import { localBasicTier } from '../desktop/localModel';

export type Tier = 'basic' | 'good' | 'best';
export const TIERS: Tier[] = ['basic', 'good', 'best'];

export interface RouteStep {
  provider: AIProviderId;
  model: string;
  tier: Tier;
  /** Where the model choice came from. */
  source: 'override' | 'player' | 'models.json' | 'local';
  /** Set for the PC app's local model in Ollama, which is not a configured provider. */
  local?: { context: number };
}

export interface RouterAttempt extends RouteStep {
  error: AIErrorKind;
  message: string;
}

export interface RouterReply extends ProviderReply {
  tier: Tier;
  requestedTier: Tier;
  /** Steps that failed before this one answered. */
  attempts: RouterAttempt[];
}

export interface CompleteOptions {
  system?: string;
  temperature?: number;
  json?: boolean;
  maxTokens?: number;
  thinking?: 'minimal' | 'low';
  signal?: AbortSignal;
  /** Feature name for status-line notices, e.g. "Story chat". */
  feature?: string;
}

type TierModels = Partial<Record<Tier, string>>;
const LADDERS = (modelsJson as { providers: Partial<Record<AIProviderId, TierModels>> }).providers;
export const MODELS_CHECKED_AT: string = (modelsJson as { checkedAt: string }).checkedAt;

/* ----------------------------- player overrides ---------------------------- */

const OVERRIDES_KEY = 'zeroroll_tier_overrides';
const CROSS_PROVIDER_KEY = 'zeroroll_router_cross_provider';

export type TierOverride = { provider: AIProviderId; model: string };

export function getTierOverrides(): Partial<Record<Tier, TierOverride>> {
  try {
    const parsed = JSON.parse(localStorage.getItem(OVERRIDES_KEY) || '{}');
    const out: Partial<Record<Tier, TierOverride>> = {};
    for (const t of TIERS) {
      const o = parsed?.[t];
      if (o && typeof o.model === 'string' && o.model.trim() && o.provider in AI_PROVIDERS) {
        out[t] = { provider: o.provider, model: o.model.trim() };
      }
    }
    return out;
  } catch (_) {
    return {};
  }
}

export function setTierOverride(tier: Tier, value: TierOverride | null): void {
  const all = getTierOverrides();
  if (value && value.model.trim()) all[tier] = { provider: value.provider, model: value.model.trim() };
  else delete all[tier];
  try {
    localStorage.setItem(OVERRIDES_KEY, JSON.stringify(all));
  } catch (_) {}
}

/** Opt-in: when the active provider's whole ladder fails, try other providers the player has keys for. */
export function getCrossProviderFailover(): boolean {
  try {
    return localStorage.getItem(CROSS_PROVIDER_KEY) === 'true';
  } catch (_) {
    return false;
  }
}

export function setCrossProviderFailover(enabled: boolean): void {
  try {
    localStorage.setItem(CROSS_PROVIDER_KEY, enabled ? 'true' : 'false');
  } catch (_) {}
}

/* --------------------------------- routing -------------------------------- */

/** The requested tier, then every tier below it. */
export function tierLadder(tier: Tier): Tier[] {
  return TIERS.slice(0, TIERS.indexOf(tier) + 1).reverse();
}

/**
 * The model a provider uses for a tier. A model the player picked in settings is their
 * "good" model; otherwise models.json decides.
 */
export function modelForTier(provider: AIProviderId, tier: Tier): { model: string; source: RouteStep['source'] } {
  const saved = getSavedProviderModel(provider);
  if ((tier === 'good' && saved) || provider === 'custom') {
    return { model: getProviderModel(provider), source: 'player' };
  }
  // The weekly check replaces models.json entries that the provider has retired.
  const fromJson = getLadderPatch(provider)[tier] || LADDERS[provider]?.[tier];
  if (fromJson) return { model: fromJson, source: 'models.json' };
  return { model: getProviderModel(provider), source: 'player' };
}

/** Every provider/model the router would try for this tier, in order, without calling anything. */
export function planRoute(tier: Tier): RouteStep[] {
  const overrides = getTierOverrides();
  const active = getActiveProvider();
  const providers: AIProviderId[] = [active];
  if (getCrossProviderFailover()) {
    for (const id of Object.keys(AI_PROVIDERS) as AIProviderId[]) {
      if (id !== active && id !== 'custom' && getProviderKey(id).trim()) providers.push(id);
    }
  }

  const steps: RouteStep[] = [];
  const seen = new Set<string>();
  const push = (s: RouteStep) => {
    const k = `${s.provider}|${s.model}`;
    if (!seen.has(k)) {
      seen.add(k);
      steps.push(s);
    }
  };
  // In the PC app, the local model in Ollama is the basic tier (it is free and works offline).
  const local = localBasicTier();
  for (const provider of providers) {
    for (const t of tierLadder(tier)) {
      if (t === 'basic' && local && provider === active) {
        push({ provider: 'custom', model: local.model, tier: 'basic', source: 'local', local: { context: local.context } });
      }
      const o = overrides[t];
      if (o && provider === active) push({ provider: o.provider, model: o.model, tier: t, source: 'override' });
      const m = modelForTier(provider, t);
      push({ provider, model: m.model, tier: t, source: m.source });
    }
  }
  return steps;
}

/** Errors that are about this model or provider right now, so a different step may work. */
function worthNextStep(kind: AIErrorKind): boolean {
  return kind === 'model_not_found' || kind === 'quota' || kind === 'overloaded' || kind === 'timeout' || kind === 'bad_output' || kind === 'network';
}

/**
 * Sends a conversation to the best available model for `tier`.
 * Throws an AIError when every step fails; the caller decides how to show it.
 */
export async function complete(messages: ChatMessage[], tier: Tier = 'good', opts: CompleteOptions = {}): Promise<RouterReply> {
  const steps = planRoute(tier);
  const deadlineAt = Date.now() + AI_TURN_DEADLINE_MS;
  const attempts: RouterAttempt[] = [];
  let lastError: AIError | undefined;

  for (const step of steps) {
    if (deadlineAt - Date.now() < 2_000) break;
    try {
      const reply = await callProvider(
        {
          provider: step.provider,
          apiKey: step.source === 'local' ? '' : getProviderKey(step.provider),
          model: step.model,
          baseUrl: getProviderBaseUrl(step.provider),
          local: step.local
        },
        {
          system: opts.system,
          messages,
          temperature: opts.temperature,
          json: opts.json,
          thinking: opts.thinking,
          maxTokens: opts.maxTokens,
          signal: opts.signal,
          deadlineAt,
          noCascade: true
        }
      );
      const providerName = AI_PROVIDERS[reply.provider]?.name || reply.provider;
      reportAISuccess(`${providerName} (${reply.model})`);
      const feature = opts.feature || 'AI reply';
      if (attempts.length) {
        const first = attempts[0];
        reportAINotice(
          feature,
          `${first.model} was unavailable (${first.error}), so ${reply.model}${step.tier !== tier ? ` (${step.tier} tier)` : ''} answered instead.`
        );
      }
      if (reply.truncated) {
        reportAINotice(feature, 'The reply was cut short by the model\'s length limit. Use Continue to pick up where it stopped.');
      }
      return { ...reply, tier: step.tier, requestedTier: tier, attempts };
    } catch (raw) {
      const err = classifyAIError(raw, step.provider);
      lastError = err;
      attempts.push({ ...step, error: err.kind, message: err.message });
      // A missing or bad key only rules out this provider; anything else not model-specific stops the route.
      if (err.kind === 'no_key' || err.kind === 'auth') {
        if (step.provider === getActiveProvider() && !getCrossProviderFailover()) throw err;
        continue;
      }
      if (!worthNextStep(err.kind)) throw err;
      console.warn(`[Router] ${step.provider}/${step.model} failed (${err.kind}): ${err.message}`);
    }
  }
  throw lastError || new AIError('timeout', `Gave up after ${Math.round(AI_TURN_DEADLINE_MS / 1000)}s without a reply.`);
}
