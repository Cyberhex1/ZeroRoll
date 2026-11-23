/**
 * Pitch (0.2, plan 4.3): one cheap call asks for four deliberately different pitches from the
 * spread; code picks one. The other three become "More ideas from this roll".
 */
import { executeJsonPrompt } from '../lib/geminiService';
import { OVERUSED_NAMES } from '../content/names';
import { getCategoryProfile } from '../content';
import { hasKeyword } from '../content/validate';
import type { Spread } from './spread';
import { PITCH_SCHEMA, pitchPrompt } from './prompts';
import { STOCK, stockPlacesIn } from './gate';
import { overlap } from './words';
import { WORN_ROLES } from '../content/forge/familyTags';

/** Roles Flash-Lite falls back to (code only; never sent to the model). */
const WORN_ROLE = new RegExp(`\\b(${WORN_ROLES.join('|')})s?\\b`, 'i');
const WORN_TITLE = /\b(ledgers?|ink)\b/i;

type PitchContext = { category: Spread['category']; recentPremises: readonly string[]; heroCard?: string };

export interface Pitch {
  title: string;
  hero: string;
  hook: string;
  turningPoint: string;
  surprise: string;
}

const clip = (v: unknown, max: number) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, max) : '');

export function cleanPitches(raw: unknown): Pitch[] {
  const list = raw && typeof raw === 'object' && Array.isArray((raw as { pitches?: unknown }).pitches) ? (raw as { pitches: unknown[] }).pitches : [];
  return list
    .map((p) => (p && typeof p === 'object' ? (p as Record<string, unknown>) : {}))
    .map((p) => ({ title: clip(p.title, 100).replace(/^["']+|["']+$/g, ''), hero: clip(p.hero, 300), hook: clip(p.hook, 400), turningPoint: clip(p.turningPoint, 300), surprise: clip(p.surprise, 300) }))
    .filter((p) => p.title && p.hook)
    .slice(0, 4);
}

export async function pitchStories(spread: Spread, signal?: AbortSignal): Promise<Pitch[]> {
  const raw = await executeJsonPrompt<unknown>(
    {
      userPrompt: pitchPrompt(spread),
      tier: 'basic',
      thinking: 'minimal',
      temperature: 1.05,
      maxTokens: 2048,
      schema: PITCH_SCHEMA,
      signal,
      feature: 'Story pitch'
    },
    (v) => cleanPitches(v).length >= 2
  );
  return cleanPitches(raw);
}

const OVERUSED = OVERUSED_NAMES.map((n) => new RegExp(`\\b${n}\\b`));

export function scorePitch(p: Pitch, index: number, ctx: PitchContext, rand: () => number): number {
  const text = `${p.title} ${p.hero} ${p.hook}`;
  let score = rand() * 0.5;
  for (const re of STOCK) if (re.test(text)) score -= 1;
  if (getCategoryProfile(ctx.category).avoidKeywords.some((k) => hasKeyword(text, k))) score -= 1;
  if (stockPlacesIn(text).length) score -= 1;
  if (OVERUSED.some((re) => re.test(text))) score -= 0.5;
  if (ctx.recentPremises.slice(0, 6).some((r) => overlap(p.hook, r) > 0.2)) score -= 0.6;
  // Bug test M1: the same bookish hero kept winning.
  if (WORN_ROLE.test(p.hero) && !(ctx.heroCard && WORN_ROLE.test(ctx.heroCard))) score -= 0.8;
  if (WORN_TITLE.test(`${p.title} ${p.hook}`)) score -= 0.5;
  if (index === 1 || index === 2) score += 0.15;
  return score;
}

/** The best-scoring pitch, and the rest in their original order. */
export function pickPitch(pitches: Pitch[], ctx: PitchContext, rand: () => number = Math.random): { chosen: Pitch; others: Pitch[] } {
  const scored = pitches.map((p, i) => ({ p, i, s: scorePitch(p, i, ctx, rand) }));
  const best = scored.reduce((a, b) => (b.s > a.s ? b : a));
  return { chosen: best.p, others: scored.filter((x) => x !== best).map((x) => x.p) };
}
