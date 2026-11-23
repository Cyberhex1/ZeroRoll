/**
 * Repair (0.2, plan 4.6): one cheap, targeted rewrite of a premise the gate failed, and/or a
 * new title when the title leans on a worn word.
 */
import { executeJsonPrompt } from '../lib/geminiService';
import type { DMStoryOutline } from '../types';
import type { GateFailure } from './gate';
import type { Spread } from './spread';
import { repairPrompt } from './prompts';
import { firstWords } from './words';
import { S } from '../setup/schemas';

export async function repairPremise(input: {
  premise: string;
  title?: string;
  /** Worn words in the title; when set, the reply also carries a new title. */
  titleTics?: string[];
  outline: DMStoryOutline;
  failures: GateFailure[];
  spread: Spread;
  signal?: AbortSignal;
}): Promise<{ premise?: string; title?: string }> {
  const wantPremise = input.failures.length > 0;
  const wantTitle = !!input.titleTics?.length;
  const properties = { ...(wantPremise ? { premise: S() } : {}), ...(wantTitle ? { title: S() } : {}) };
  const raw = await executeJsonPrompt<{ premise?: unknown; title?: unknown }>(
    {
      userPrompt: repairPrompt({
        premise: input.premise,
        title: input.title,
        titleTics: input.titleTics,
        startingCircumstances: input.outline.startingCircumstances,
        incitingIncident: input.outline.incitingIncident,
        turningPoint: input.outline.turningPoint,
        failures: input.failures,
        spread: input.spread,
        firstWords: firstWords(input.premise, 4)
      }),
      tier: 'basic',
      thinking: 'minimal',
      temperature: 0.7,
      maxTokens: 512,
      schema: { type: 'OBJECT', properties, required: Object.keys(properties) },
      signal: input.signal,
      feature: 'Story polish'
    },
    (v) => !!v && (!wantPremise || (typeof v.premise === 'string' && v.premise.trim().length > 40)) && (!wantTitle || (typeof v.title === 'string' && v.title.trim().length > 2))
  );
  return {
    ...(wantPremise ? { premise: String(raw.premise).replace(/\s+/g, ' ').trim().slice(0, 2000) } : {}),
    ...(wantTitle ? { title: String(raw.title) } : {})
  };
}
