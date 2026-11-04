/** Names models overuse until they feel like stock characters (ohnna, 2026-11-04). */
export const OVERUSED_NAMES: readonly string[] = [
  'Sloane', 'Vance', 'Thorne', 'Kael', 'Elara', 'Lyra', 'Seraphina', 'Aria', 'Kira', 'Rowan', 'Silas', 'Elias',
  'Zephyr', 'Raven', 'Nyx', 'Ash', 'Sterling', 'Voss', 'Blackwood', 'Ravenwood', 'Nightshade', 'Calloway', 'Hayes',
  'Kane', 'Cross', 'Raine', 'Jax', 'Ezra', 'Nova', 'Sable', 'Marcus', 'Aurelius', 'Reyes', 'Valerius', 'Draven',
  'Lysander', 'Isolde', 'Cassian', 'Evelyn', 'Mara', 'Finn', 'Orion', 'Selene', 'Vale', 'Wren'
];

const OVERUSED = new Set(OVERUSED_NAMES.map((n) => n.toLowerCase()));

/** False for a name (or any part of one) that is on the overused list. */
export function isFreshName(name: string): boolean {
  return !name.split(/[\s-]+/).some((part) => OVERUSED.has(part.toLowerCase()));
}
