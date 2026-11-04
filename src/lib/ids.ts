/**
 * Collision-free IDs. Date.now() IDs collided when two records were created in the
 * same millisecond (for example a player message and the reply placeholder).
 */
export function uid(): string {
  const c = (globalThis as { crypto?: Crypto }).crypto;
  if (c && typeof c.randomUUID === 'function') return c.randomUUID();
  // Fallback for very old browsers: 128 random bits as hex.
  const bytes = new Uint8Array(16);
  if (c && typeof c.getRandomValues === 'function') c.getRandomValues(bytes);
  else for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function newId(prefix: string): string {
  return `${prefix}_${uid()}`;
}
