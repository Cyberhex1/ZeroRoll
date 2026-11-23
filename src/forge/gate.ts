/**
 * The Gate (0.2): cheap deterministic checks on a rolled premise (AGENTS.md 10). A failing
 * premise gets at most one targeted rewrite (repair.ts); the gate never blocks a roll.
 */
import { hasKeyword } from '../content/validate';
import { contentWords, firstWords, jaccard, overlap, sentences, wordCount } from './words';

export type GateKind = 'stock' | 'irony' | 'spoiler' | 'shape' | 'samey' | 'tics' | 'off_genre';

export interface GateFailure {
  kind: GateKind;
  /** What matched, for the repair line and the eval report. */
  detail: string;
}

/** Stock lines every roll used to reach for (measured on real output, plan 1.1). */
export const STOCK: RegExp[] = [
  /how (much )?long(er)? (can|will|could) you/i,
  /what (would|will) you do (if|when|to)/i,
  /\byou (spend|have spent) your (days|mornings|nights|evenings|years)\b/i,
  /^\s*(for (years|months|decades)[^,]*,\s*)?you (tend|keep|manage|run|work|serve|carve|spend)\b/i,
  /\b(yet|but) (lately|tonight|this (morning|winter|season|year))\b/i,
  /\blately\b/i,
  /steady hands/i,
  /\bhead down\b/i,
  /\brel(y|ies) on (your|you)\b/i
];

/** The narrator telling the player what the hero does not know. */
export const IRONY: RegExp[] = [
  /\bunaware\b/i,
  /\bnot realizing\b/i,
  /\blittle do (you|they|he|she) know\b/i,
  /\b(has|have) no idea (that|what)\b/i,
  /\bwithout (knowing|realizing) (that|who|what)\b/i,
  /\bwhen you (realize|discover|learn)\b/i,
  /\bsoon (you|they) will\b/i
];

/** Worn words; two or more in one premise is a tic. */
export const TIC_WORDS = ['ledger', 'rhythmic', 'ozone', 'hum', 'humming', 'trembling', 'tapestry', 'testament', 'palpable', 'whispers of', 'a sense of', 'sweaty palm'];

/** Words Flash-Lite put in a third of 0.2's first 30 titles ("The Mercury Ledger", "Ink on Bone"). */
export const TITLE_TICS = ['ledger', 'ledgers', 'ink', 'echo', 'echoes', 'whisper', 'whispers', 'shadow', 'shadows', 'tapestry'];

export function titleTics(title: string): string[] {
  return TITLE_TICS.filter((w) => new RegExp(`\\b${w}\\b`, 'i').test(title));
}

export const STOCK_PLACES = ['Oakhaven', 'Eldoria', 'Willowbrook', 'Silverbrook', 'Ravenswood', 'Riverbend', 'Stonehaven', 'Blackwood'];

export interface GateContext {
  /** The category's avoidKeywords (off-genre words). */
  avoidKeywords: readonly string[];
  /** The last few premises rolled in this category, newest first. */
  recentPremises: readonly string[];
  turningPoint?: string;
  incitingIncident?: string;
  startingCircumstances?: string;
  /** Words that are allowed to overlap with the turning point: the hero's name, the place. */
  allowWords?: readonly string[];
}

export function firstMatch(text: string, patterns: readonly RegExp[]): string | undefined {
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return m[0].trim();
  }
  return undefined;
}

export function ticsIn(text: string): string[] {
  const t = text.toLowerCase();
  return TIC_WORDS.filter((w) => new RegExp(`\\b${w.replace(/\s+/g, '\\s+')}\\b`, 'i').test(t));
}

export function stockPlacesIn(text: string): string[] {
  return STOCK_PLACES.filter((p) => new RegExp(`\\b${p}\\b`, 'i').test(text));
}

/**
 * Turning-point words that the hero could not know yet: content words of the turning point
 * minus those of the inciting incident and starting circumstances (and the allowed words).
 */
export function secretWords(ctx: Pick<GateContext, 'turningPoint' | 'incitingIncident' | 'startingCircumstances' | 'allowWords'>): Set<string> {
  const tp = contentWords(ctx.turningPoint ?? '');
  const known = contentWords(`${ctx.incitingIncident ?? ''} ${ctx.startingCircumstances ?? ''} ${(ctx.allowWords ?? []).join(' ')}`);
  for (const w of known) tp.delete(w);
  // "Chapter" and ordinal words are structure, not story.
  for (const w of ['chapter', 'first', 'second', 'third', 'fourth', 'final']) tp.delete(w);
  return tp;
}

/** Spoiler thresholds (plan 7.2), calibrated on the Phase A eval. */
export const SPOILER_MIN_WORDS = 4;
export const SPOILER_MIN_JACCARD = 0.25;
export const SAMEY_JACCARD = 0.3;

export function gatePremise(premise: string, ctx: GateContext): GateFailure[] {
  const out: GateFailure[] = [];
  const p = premise.trim();
  const stock = firstMatch(p, STOCK);
  if (stock) out.push({ kind: 'stock', detail: stock });
  const irony = firstMatch(p, IRONY);
  if (irony) out.push({ kind: 'irony', detail: irony });

  const secret = secretWords(ctx);
  if (secret.size) {
    const pw = contentWords(p);
    const hits = [...secret].filter((w) => pw.has(w));
    if (hits.length >= SPOILER_MIN_WORDS || jaccard(pw, secret) > SPOILER_MIN_JACCARD) out.push({ kind: 'spoiler', detail: hits.join(', ') });
  }

  const n = sentences(p).length;
  const words = wordCount(p);
  if (n < 2 || n > 5 || words < 45 || words > 130 || !/\?["”’)]*$/.test(p)) out.push({ kind: 'shape', detail: `${n} sentences, ${words} words${/\?["”’)]*$/.test(p) ? '' : ', no closing question'}` });

  const fw = firstWords(p);
  for (const r of ctx.recentPremises.slice(0, 5)) {
    if (fw && firstWords(r) === fw) {
      out.push({ kind: 'samey', detail: fw });
      break;
    }
    if (overlap(p, r) > SAMEY_JACCARD) {
      out.push({ kind: 'samey', detail: firstWords(p, 5) });
      break;
    }
  }

  const tics = ticsIn(p);
  if (tics.length >= 2) out.push({ kind: 'tics', detail: tics.join(', ') });

  const off = ctx.avoidKeywords.find((k) => hasKeyword(p, k));
  if (off) out.push({ kind: 'off_genre', detail: off.replace(/\*$/, '') });
  return out;
}
