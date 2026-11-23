/**
 * Repair (0.2, plan 4.6): one cheap, targeted rewrite of a premise the gate failed.
 */
import { executeJsonPrompt } from '../lib/geminiService';
import type { DMStoryOutline } from '../types';
import type { GateFailure } from './gate';
import type { Spread } from './spread';
import { repairPrompt } from './prompts';
import { firstWords } from './words';
import { S } from '../setup/schemas';

export async function repairPremise(input: { premise: string; outline: DMStoryOutline; failures: GateFailure[]; spread: Spread; signal?: AbortSignal }): Promise<string> {
  const raw = await executeJsonPrompt<{ premise?: unknown }>(
    {
      userPrompt: repairPrompt({
        premise: input.premise,
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
      schema: { type: 'OBJECT', properties: { premise: S() }, required: ['premise'] },
      signal: input.signal,
      feature: 'Story polish'
    },
    (v) => !!v && typeof v.premise === 'string' && v.premise.trim().length > 40
  );
  return String(raw.premise).replace(/\s+/g, ' ').trim().slice(0, 2000);
}
