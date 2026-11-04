/**
 * Assembles a prompt under a token budget, in four parts:
 *   1. the system prompt and the fixed sheets (character sheet, current state, director
 *      block): never trimmed,
 *   2. the memory list: pinned entries always, then unpinned ones by relevance to the
 *      recent turns (recall.ts), the least relevant dropped first,
 *   3. the rolling summary of everything before the recent window,
 *   4. recent turns: dropped oldest first, keeping at least the newest two.
 * The meter reports what each part used so the player can see the budget.
 */
import type { ChatMessage } from '../ai/transport';
import type { MemoryState } from './memoryStore';
import { estimateTokens } from './tokens';
import { recallOrder, recallQuery } from './recall';

export interface BuildInput {
  system: string;
  /** Fixed context blocks, e.g. "CURRENT STATE ..." or the director block. */
  sheets: string[];
  memory: MemoryState;
  /** Oldest first. */
  turns: ChatMessage[];
  /** Total context in tokens. */
  contextTokens: number;
  /** Tokens kept free for the reply. */
  replyReserve: number;
  /** Relevance scores per entry id (embedding recall); lexical relevance otherwise. */
  recallScores?: Record<string, number> | null;
}

export interface PromptMeter {
  budget: number;
  used: number;
  parts: { system: number; memory: number; summary: number; turns: number };
  droppedMemories: number;
  droppedTurns: number;
  /** True when even the fixed parts and the newest turns do not fit. */
  over: boolean;
}

export interface BuiltPrompt {
  system: string;
  messages: ChatMessage[];
  meter: PromptMeter;
}

const MIN_TURNS = 2;

export function buildPrompt(input: BuildInput): BuiltPrompt {
  const budget = Math.max(512, input.contextTokens - input.replyReserve);
  const fixed = [input.system, ...input.sheets.filter(Boolean)].join('\n\n');
  const fixedTokens = estimateTokens(fixed);

  const summaryBlock = input.memory.summary ? `STORY SO FAR (summary of earlier turns)\n${input.memory.summary}` : '';
  const summaryTokens = summaryBlock ? estimateTokens(summaryBlock) : 0;

  // Memory: pinned first (always), then unpinned newest first until the budget says stop.
  const pinned = input.memory.entries.filter((e) => e.pinned);
  const unpinned = recallOrder(input.memory.entries.filter((e) => !e.pinned), recallQuery(input.turns), input.recallScores);
  const memLine = (t: string) => `- ${t}`;
  const memTokens = (lines: string[]) => (lines.length ? estimateTokens(`MEMORY (facts that stay true)\n${lines.join('\n')}`) : 0);

  // Turns: newest backwards.
  const turns = [...input.turns];
  const turnTokens = turns.map((t) => estimateTokens(t.content) + 4);

  const keptTurns: number[] = [];
  let used = fixedTokens + summaryTokens + memTokens(pinned.map((e) => memLine(e.text)));
  // The newest turns are needed to answer at all.
  for (let i = turns.length - 1; i >= 0 && keptTurns.length < MIN_TURNS; i--) {
    keptTurns.unshift(i);
    used += turnTokens[i];
  }
  // Then unpinned memories (most relevant first), then older turns, while they fit.
  const keptUnpinned: typeof unpinned = [];
  for (const e of unpinned) {
    const cost = estimateTokens(memLine(e.text)) + 1;
    if (used + cost > budget) continue;
    keptUnpinned.push(e);
    used += cost;
  }
  for (let i = turns.length - 1 - keptTurns.length; i >= 0; i--) {
    if (used + turnTokens[i] > budget) break;
    keptTurns.unshift(i);
    used += turnTokens[i];
  }

  const memoryLines = [...pinned, ...keptUnpinned.sort((a, b) => a.createdTurn - b.createdTurn)].map((e) => memLine(e.text));
  const memoryBlock = memoryLines.length ? `MEMORY (facts that stay true)\n${memoryLines.join('\n')}` : '';
  const system = [fixed, memoryBlock, summaryBlock].filter(Boolean).join('\n\n');
  const messages = keptTurns.map((i) => turns[i]);

  const parts = {
    system: fixedTokens,
    memory: memTokens(memoryLines),
    summary: summaryTokens,
    turns: keptTurns.reduce((n, i) => n + turnTokens[i], 0)
  };
  const total = parts.system + parts.memory + parts.summary + parts.turns;
  return {
    system,
    messages,
    meter: {
      budget,
      used: total,
      parts,
      droppedMemories: unpinned.length - keptUnpinned.length,
      droppedTurns: turns.length - keptTurns.length,
      over: total > budget
    }
  };
}
