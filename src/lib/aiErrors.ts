/* -------------------------------------------------------------------------- */
/*                     AI ERROR CLASSIFICATION (ALL PROVIDERS)                */
/* -------------------------------------------------------------------------- */

export type AIErrorKind =
  | 'no_key'          // No key configured for the active provider
  | 'auth'            // Key rejected (invalid, revoked, API not enabled for the key)
  | 'model_not_found' // Model ID doesn't exist or isn't available to this key
  | 'quota'           // Rate limit / quota exhausted (429)
  | 'overloaded'      // Provider-side 5xx / "high demand"
  | 'network'         // Request never reached the provider
  | 'timeout'         // We gave up waiting
  | 'bad_request'     // Other 4xx
  | 'bad_output'      // Provider answered, but not in a shape we can use
  | 'unknown';

export class AIError extends Error {
  kind: AIErrorKind;
  status?: number;
  provider?: string;

  constructor(kind: AIErrorKind, message: string, opts: { status?: number; provider?: string } = {}) {
    super(message);
    this.name = 'AIError';
    this.kind = kind;
    this.status = opts.status;
    this.provider = opts.provider;
  }
}

/** Errors worth retrying on a different model (never auth or bad requests). */
export function shouldTryNextModel(kind: AIErrorKind): boolean {
  return kind === 'model_not_found' || kind === 'quota' || kind === 'overloaded';
}

/** Errors worth retrying on the same model after a short wait. */
export function isTransient(kind: AIErrorKind): boolean {
  return kind === 'overloaded' || kind === 'timeout' || kind === 'network';
}

/**
 * Normalises anything thrown by the Gemini SDK, fetch, or our own code into an AIError.
 */
export function classifyAIError(err: unknown, provider?: string): AIError {
  if (err instanceof AIError) {
    if (!err.provider && provider) err.provider = provider;
    return err;
  }

  const e = err as any;
  const status: number | undefined = typeof e?.status === 'number' ? e.status : undefined;
  const rawMessage: string = (e?.message ?? String(err ?? '')).toString();
  const msg = rawMessage.toLowerCase();

  let kind: AIErrorKind = 'unknown';

  if (e?.name === 'TimeoutError' || msg.includes('timed out')) {
    kind = 'timeout';
  } else if (e?.name === 'AbortError') {
    kind = 'timeout';
  } else if (
    msg.includes('api_key_invalid') ||
    msg.includes('api key not valid') ||
    msg.includes('api_key_service_blocked') ||
    msg.includes('permission_denied') ||
    msg.includes('invalid x-api-key') ||
    msg.includes('incorrect api key') ||
    msg.includes('unauthorized') ||
    status === 401 ||
    status === 403
  ) {
    kind = 'auth';
  } else if (
    status === 404 ||
    msg.includes('not_found') ||
    (msg.includes('model') && (msg.includes('not found') || msg.includes('is not supported') || msg.includes('does not exist')))
  ) {
    kind = 'model_not_found';
  } else if (status === 429 || msg.includes('resource_exhausted') || msg.includes('quota') || msg.includes('rate limit')) {
    kind = 'quota';
  } else if (
    (status !== undefined && status >= 500) ||
    msg.includes('unavailable') ||
    msg.includes('overloaded') ||
    msg.includes('high demand')
  ) {
    kind = 'overloaded';
  } else if (
    msg.includes('failed to fetch') ||
    msg.includes('load failed') ||
    msg.includes('networkerror') ||
    msg.includes('network request failed')
  ) {
    kind = 'network';
  } else if (status !== undefined && status >= 400) {
    kind = 'bad_request';
  }

  return new AIError(kind, rawMessage || 'Unknown AI error', { status, provider });
}

/** Short, player-facing explanation of an AI failure. */
export function describeAIError(err: AIError, providerName = 'The AI provider'): string {
  switch (err.kind) {
    case 'no_key':
      return `No ${providerName} API key is set. Add one in AI settings.`;
    case 'auth':
      return `${providerName} rejected your API key${err.status ? ` (${err.status})` : ''}. Check the key in AI settings.`;
    case 'model_not_found':
      return `${providerName} doesn't offer the selected model to your key. Pick another model in AI settings.`;
    case 'quota':
      return `${providerName} quota or rate limit reached. Wait a minute or switch models.`;
    case 'overloaded':
      return `${providerName} is overloaded right now. Try again shortly.`;
    case 'network':
      return `Couldn't reach ${providerName}. Check your connection.`;
    case 'timeout':
      return `${providerName} took too long to answer.`;
    case 'bad_output':
      return `${providerName} returned a reply the game couldn't read.`;
    case 'bad_request':
      return `${providerName} refused the request${err.status ? ` (${err.status})` : ''}: ${truncate(err.message, 160)}`;
    default:
      return `${providerName} error: ${truncate(err.message, 160)}`;
  }
}

function truncate(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}
