import { useSyncExternalStore } from 'react';
import { AIError, AIErrorKind } from './aiErrors';

/* -------------------------------------------------------------------------- */
/*            LIVE AI STATUS — what the last real AI call actually did        */
/* -------------------------------------------------------------------------- */

export interface AIStatus {
  /** 'unknown' until the first call (or a successful connection test) completes. */
  state: 'unknown' | 'ok' | 'error';
  kind?: AIErrorKind;
  /** Player-facing message for the last failure. */
  message?: string;
  /** Which feature failed, e.g. "Scenario generation". */
  feature?: string;
  /** True when the game substituted offline/procedural content for this failure. */
  usedFallback?: boolean;
  /** False once the player has dismissed the current failure banner. */
  visible: boolean;
  at: number;
  /** Provider and model that answered the last successful call, e.g. "Google Gemini (gemini-flash-latest)". */
  lastModel?: string;
  /**
   * A soft problem on a call that otherwise worked: a model swap, a cut-off reply,
   * generic fallback chips, a substitute image engine. Shown, never swallowed.
   */
  notice?: { feature: string; message: string; at: number; visible: boolean };
}

let status: AIStatus = { state: 'unknown', visible: false, at: 0 };
const listeners = new Set<() => void>();

function emit(next: AIStatus) {
  status = next;
  listeners.forEach((l) => l());
}

export function getAIStatus(): AIStatus {
  return status;
}

export function subscribeAIStatus(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function reportAISuccess(lastModel?: string): void {
  const model = lastModel ?? status.lastModel;
  if (status.state === 'ok' && !status.visible && model === status.lastModel) return;
  emit({ state: 'ok', visible: false, at: Date.now(), lastModel: model, notice: status.notice });
}

/** Records a soft failure: the call worked, but not exactly as the player asked. */
export function reportAINotice(feature: string, message: string): void {
  console.warn(`[AI] ${feature}: ${message}`);
  emit({ ...status, notice: { feature, message, at: Date.now(), visible: true } });
}

export function dismissAINotice(): void {
  if (!status.notice?.visible) return;
  emit({ ...status, notice: { ...status.notice, visible: false } });
}

export function reportAIFailure(
  err: AIError,
  message: string,
  opts: { feature?: string; usedFallback?: boolean } = {}
): void {
  emit({
    state: 'error',
    kind: err.kind,
    message,
    feature: opts.feature,
    usedFallback: !!opts.usedFallback,
    visible: true,
    at: Date.now(),
    lastModel: status.lastModel,
    notice: status.notice
  });
}

export function dismissAIStatus(): void {
  if (!status.visible) return;
  emit({ ...status, visible: false });
}

/** Clears any recorded failure, e.g. after the player changes provider settings. */
export function resetAIStatus(): void {
  emit({ state: 'unknown', visible: false, at: Date.now() });
}

export function useAIStatus(): AIStatus {
  return useSyncExternalStore(subscribeAIStatus, getAIStatus, getAIStatus);
}
