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

export function reportAISuccess(): void {
  if (status.state === 'ok' && !status.visible) return;
  emit({ state: 'ok', visible: false, at: Date.now() });
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
    at: Date.now()
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
