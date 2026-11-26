/**
 * Continuity read (2026-11-25): one call that reads the story card the way the player will
 * (title, premise, "Where you start", "Your first goal", hero) and fixes contradictions,
 * stitched-in elements and a closing question with nothing at stake. Real rolls showed these
 * survive any amount of prompt wording on Flash-Lite (about 1 card in 8); a separate read
 * catches them. The model only rewrites what is wrong and keeps every fact it can.
 */
import { executeJsonPrompt } from '../lib/geminiService';
import { getContent } from '../content';
import { S } from '../setup/schemas';
import type { ExperienceCategory } from '../types';

export interface StoryCard {
  title: string;
  premise: string;
  startingCircumstances: string;
  immediateGoal: string;
  roleClass: string;
  origin: string;
}

export interface ContinuityResult {
  problems: string[];
  fixed: Partial<StoryCard>;
}

const FIELDS = ['title', 'premise', 'startingCircumstances', 'immediateGoal', 'roleClass', 'origin'] as const;

export function continuityPrompt(card: StoryCard, ctx: { category: ExperienceCategory; turningPoint?: string; signature?: string }): string {
  const c = getContent(ctx.category).card;
  return `You are the continuity editor for a role-playing campaign. The player reads this story card before playing. Read it slowly, as a first-time reader, and check that it is ONE story that makes sense.

CATEGORY: ${c.name}.${ctx.signature ? ` ${ctx.signature}` : ''}
title: ${card.title}
premise: ${card.premise}
startingCircumstances (shown as "Where you start"): ${card.startingCircumstances}
immediateGoal (shown as "Your first goal"): ${card.immediateGoal}
roleClass: ${card.roleClass}
origin: ${card.origin}
SECRET (never reveal or hint at it; for your reference only): ${ctx.turningPoint ?? '(none)'}

CHECK EACH OF THESE
1. One situation: every person, place and object belongs to the same scene and world. Nothing reads as if stitched in from another story; nothing appears from nowhere (a person, object or event named without being set up). Every concrete detail (a sign, a timer, a sound, an object) is explained and matters to the hook or the choice; a detail that is mentioned and then dropped is a problem.
2. Same moment: "Where you start" is the hero's life as the premise's scene begins (same place, same time, same objects, same people). "Your first goal" follows from the premise, is true whichever way the closing question is answered, and adds nothing the premise has not set up.
3. Physical sense: where everyone stands, what is open or shut, lit or dark, alive or dead, said or unsaid, agrees from sentence to sentence. Times of day, numbers and names agree.
4. Stakes: the premise ends on one question whose answers are real, different choices the hero can make right now, built from people and things already in the premise, each risking or costing something the card has shown the hero cares about. Relationships the choice depends on (who someone is to the hero, what they want) are stated.
5. Fit: the title names something that is actually in the premise; roleClass and origin match the person the premise describes; the story clearly belongs to ${c.name}.

If everything passes, reply {"problems": []}.
If anything fails, list each problem in one short line, then return the WHOLE corrected card: all six fields, rewritten together so they agree with each other (a fix to one field often needs the others to change too). Keep the same hero, place, hook and genre, and keep every sentence that was fine. The premise stays 3 or 4 sentences, second person ("you"), present tense, about 70 to 100 words, ending on one question. Do not add a second situation to fix a first one: cut instead. Field values are plain text: no labels like "Where you start:".
Reply with JSON only: {"problems": ["…"], "title": "…", "premise": "…", "startingCircumstances": "…", "immediateGoal": "…", "roleClass": "…", "origin": "…"}`;
}

const SCHEMA = {
  type: 'OBJECT',
  properties: { problems: { type: 'ARRAY', items: S() }, ...Object.fromEntries(FIELDS.map((f) => [f, S()])) },
  required: ['problems']
};

const clean = (v: unknown, max: number): string => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, max) : '');

/** Seen on 3.8 Flash: "Where you start: Where you start: ..." and titles that ran to 17 words. */
const LABEL = /^\s*(?:title|premise|where you start|your first goal|starting ?circumstances|immediate ?goal|role ?class|origin)\s*:\s*/i;
function unlabel(v: string): string {
  let out = v;
  while (LABEL.test(out)) out = out.replace(LABEL, '');
  return out.trim();
}
const titleOk = (t: string) => t.split(/\s+/).length <= 6 && !/[\u3000-\u9fff_<>[\](){}]|\b[A-Z]{3,}\b/.test(t) && !/\b(revised|draft)\b/i.test(t);

export function parseContinuity(raw: unknown, card: StoryCard): ContinuityResult {
  const r = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const problems = Array.isArray(r.problems) ? r.problems.map((p) => clean(p, 300)).filter(Boolean) : [];
  const fixed: Partial<StoryCard> = {};
  if (!problems.length) return { problems, fixed };
  const max: Record<(typeof FIELDS)[number], number> = { title: 100, premise: 2000, startingCircumstances: 600, immediateGoal: 400, roleClass: 60, origin: 120 };
  for (const f of FIELDS) {
    const v = unlabel(clean(r[f], max[f]));
    if (!v || v === card[f]) continue;
    if (f === 'premise' && v.length <= 120) continue;
    if (f === 'title' && !titleOk(v)) continue;
    fixed[f] = v;
  }
  return { problems, fixed };
}

export async function checkContinuity(card: StoryCard, ctx: { category: ExperienceCategory; turningPoint?: string; signature?: string; signal?: AbortSignal }): Promise<ContinuityResult> {
  const raw = await executeJsonPrompt<unknown>(
    {
      userPrompt: continuityPrompt(card, ctx),
      temperature: 0.3,
      thinking: 'low',
      tier: 'check',
      maxTokens: 2048,
      schema: SCHEMA,
      signal: ctx.signal,
      feature: 'Story check'
    },
    (v) => !!v && typeof v === 'object' && Array.isArray((v as { problems?: unknown }).problems)
  );
  return parseContinuity(raw, card);
}
