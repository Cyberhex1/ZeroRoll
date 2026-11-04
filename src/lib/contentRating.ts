/**
 * Mature content rating (off by default). Phase 1 uses it only to decide whether the PC
 * app offers uncensored local models; story filtering uses it in later phases.
 */
const KEY = 'zeroroll_mature_content';

export function isMatureContentEnabled(): boolean {
  try {
    return localStorage.getItem(KEY) === 'on';
  } catch (_) {
    return false;
  }
}

export function setMatureContentEnabled(on: boolean): void {
  try {
    localStorage.setItem(KEY, on ? 'on' : 'off');
  } catch (_) {}
}
