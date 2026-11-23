/** Console logging for the forge and Director, only with localStorage.zeroroll_forge_debug = '1'. */
export function forgeDebug(...args: unknown[]): void {
  try {
    if (localStorage.getItem('zeroroll_forge_debug') === '1') console.info('[forge]', ...args);
  } catch {
    // no storage
  }
}
