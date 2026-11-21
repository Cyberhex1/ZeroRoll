/**
 * Starting ability scores by 5e point buy: every score from 8 to 15, 27 points to spend.
 * The story roll suggests a spread; the player can move points; nothing here calls the AI.
 */
import type { StatBlock } from '../types';
import { ABILITIES, Ability, abilityPriorities } from '../dnd/rules';

export const POINT_BUY_BUDGET = 27;
export const POINT_BUY_MIN = 8;
export const POINT_BUY_MAX = 15;

/** Cost of each score from 8 (free) to 15 (9 points), as in the Player's Handbook. */
export const POINT_COST: Readonly<Record<number, number>> = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 };

/** The standard array; always a legal 27-point spread. */
export const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8] as const;

const isScore = (v: unknown): v is number => Number.isInteger(v) && (v as number) >= POINT_BUY_MIN && (v as number) <= POINT_BUY_MAX;

export function pointsSpent(stats: StatBlock): number {
  return ABILITIES.reduce((sum, a) => sum + (POINT_COST[stats[a]] ?? 0), 0);
}

export function pointsLeft(stats: StatBlock): number {
  return POINT_BUY_BUDGET - pointsSpent(stats);
}

export function isLegalPointBuy(stats: StatBlock): boolean {
  return ABILITIES.every((a) => isScore(stats[a])) && pointsSpent(stats) <= POINT_BUY_BUDGET;
}

export function canRaise(stats: StatBlock, ability: Ability): boolean {
  const s = stats[ability];
  return s < POINT_BUY_MAX && pointsSpent(stats) - POINT_COST[s] + POINT_COST[s + 1] <= POINT_BUY_BUDGET;
}

export function canLower(stats: StatBlock, ability: Ability): boolean {
  return stats[ability] > POINT_BUY_MIN;
}

export function raise(stats: StatBlock, ability: Ability): StatBlock {
  return canRaise(stats, ability) ? { ...stats, [ability]: stats[ability] + 1 } : stats;
}

export function lower(stats: StatBlock, ability: Ability): StatBlock {
  return canLower(stats, ability) ? { ...stats, [ability]: stats[ability] - 1 } : stats;
}

/** The standard array placed by the role's priorities. */
export function roleSpread(roleClass: string): StatBlock {
  const order = abilityPriorities(roleClass);
  return Object.fromEntries(order.map((a, i) => [a, STANDARD_ARRAY[i]])) as unknown as StatBlock;
}

/**
 * A legal point-buy spread from whatever the AI suggested. A legal suggestion is kept as is.
 * Anything else keeps the suggestion's order (highest score first, ties broken by the role's
 * priorities) and places the standard array in that order.
 */
export function fitPointBuy(candidate: unknown, roleClass: string): StatBlock {
  const c = (candidate && typeof candidate === 'object' ? candidate : {}) as Record<string, unknown>;
  const read = (a: Ability): unknown => c[a] ?? c[a.toUpperCase()] ?? c[{ str: 'strength', dex: 'dexterity', con: 'constitution', int: 'intelligence', wis: 'wisdom', cha: 'charisma' }[a]];
  const values = Object.fromEntries(ABILITIES.map((a) => [a, read(a)])) as Record<Ability, unknown>;
  if (ABILITIES.every((a) => isScore(values[a]))) {
    const stats = values as unknown as StatBlock;
    if (pointsSpent(stats) <= POINT_BUY_BUDGET) return { ...stats };
  }
  const priorities = abilityPriorities(roleClass);
  const num = (a: Ability) => (typeof values[a] === 'number' && Number.isFinite(values[a]) ? (values[a] as number) : -Infinity);
  const anyNumbers = ABILITIES.some((a) => num(a) !== -Infinity);
  if (!anyNumbers) return roleSpread(roleClass);
  const order = [...ABILITIES].sort((a, b) => num(b) - num(a) || priorities.indexOf(a) - priorities.indexOf(b));
  return Object.fromEntries(order.map((a, i) => [a, STANDARD_ARRAY[i]])) as unknown as StatBlock;
}
