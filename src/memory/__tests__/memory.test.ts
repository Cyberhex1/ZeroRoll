import { describe, expect, it } from 'vitest';
import { acceptPending, addEntry, applyMerge, deleteEntry, dismissPending, editEntry, emptyMemory, needsMerge, propose, togglePin } from '../memoryStore';
import { buildPrompt } from '../promptBuilder';
import { estimateTokens } from '../tokens';
import { parseSummary, shouldSummarize, summarize, RECENT_WINDOW, SUMMARY_EVERY } from '../summarizer';
import type { ChatMessage } from '../../ai/transport';

describe('memory store', () => {
  it('adds, dedupes, edits, pins and deletes', () => {
    let m = addEntry(emptyMemory(), '  Mira owes the ferryman a coin ', 1);
    m = addEntry(m, 'mira owes the ferryman a coin', 2);
    expect(m.entries).toHaveLength(1);
    expect(m.entries[0].text).toBe('Mira owes the ferryman a coin');
    const id = m.entries[0].id;
    m = editEntry(togglePin(m, id), id, 'Mira owes the ferryman two coins');
    expect(m.entries[0]).toMatchObject({ pinned: true, text: 'Mira owes the ferryman two coins' });
    expect(editEntry(m, id, '   ').entries).toHaveLength(0);
    expect(deleteEntry(m, id).entries).toHaveLength(0);
  });

  it('proposes only new facts and moves accepted ones into the list', () => {
    let m = addEntry(emptyMemory(), 'The tower bell is cracked', 1);
    m = propose(m, ['The tower bell is cracked', 'Ash is the warden', 'ash is the warden', ''], 5);
    expect(m.pending.map((p) => p.text)).toEqual(['Ash is the warden']);
    m = propose(m, ['Ash is the warden'], 6);
    expect(m.pending).toHaveLength(1);
    const accepted = acceptPending(m, m.pending[0].id);
    expect(accepted.pending).toHaveLength(0);
    expect(accepted.entries.map((e) => e.text)).toContain('Ash is the warden');
    expect(dismissPending(m, m.pending[0].id).pending).toHaveLength(0);
  });

  it('offers a merge past 60 entries and keeps pinned ones through it', () => {
    let m = emptyMemory();
    for (let i = 0; i < 61; i++) m = addEntry(m, `fact number ${i}`, i);
    expect(needsMerge(m)).toBe(true);
    m = togglePin(m, m.entries[3].id);
    const merged = applyMerge(m, ['facts 0 to 60 are numbered'], 70);
    expect(merged.entries.map((e) => e.text)).toEqual(['fact number 3', 'facts 0 to 60 are numbered']);
  });
});

const turn = (i: number, words = 60): ChatMessage => ({ role: i % 2 ? 'assistant' : 'user', content: `Turn ${i}. ${'word '.repeat(words)}` });

describe('prompt builder', () => {
  it('never goes over the budget across a 150 turn game', () => {
    let memory = emptyMemory();
    const turns: ChatMessage[] = [];
    for (let i = 0; i < 150; i++) {
      turns.push(turn(i, 40 + (i % 7) * 30));
      if (i % 3 === 0) memory = addEntry(memory, `Fact from turn ${i}: ${'detail '.repeat(i % 9)}`, i, 'auto', i % 30 === 0);
      if (i % 10 === 0) memory = { ...memory, summary: 'Summary. '.repeat(Math.min(400, i * 3)) };
      for (const ctx of [4096, 8192, 32_000]) {
        const p = buildPrompt({ system: 'You narrate. '.repeat(40), sheets: ['CURRENT STATE\nHP 7/12'], memory, turns, contextTokens: ctx, replyReserve: 900 });
        expect(p.meter.over).toBe(false);
        expect(p.meter.used).toBeLessThanOrEqual(p.meter.budget);
        const real = estimateTokens(p.system) + p.messages.reduce((n, m) => n + estimateTokens(m.content) + 4, 0);
        expect(real).toBeLessThanOrEqual(p.meter.budget + 4);
        expect(p.messages.at(-1)).toBe(turns.at(-1));
      }
    }
  });

  it('keeps pinned memories and the newest two turns even when nothing else fits', () => {
    let memory = addEntry(emptyMemory(), 'Pinned: the player is a lighthouse keeper', 0, 'manual', true);
    for (let i = 1; i < 30; i++) memory = addEntry(memory, `Loose fact ${i} ${'x '.repeat(40)}`, i);
    const turns = Array.from({ length: 40 }, (_, i) => turn(i, 200));
    const p = buildPrompt({ system: 'sys', sheets: [], memory, turns, contextTokens: 1200, replyReserve: 400 });
    expect(p.system).toContain('lighthouse keeper');
    expect(p.messages).toEqual(turns.slice(-2));
    expect(p.meter.droppedTurns).toBe(38);
    expect(p.meter.droppedMemories).toBeGreaterThan(0);
  });

  it('keeps the sheets and summary in the system prompt', () => {
    const memory = { ...emptyMemory(), summary: 'They crossed the lake.' };
    const p = buildPrompt({ system: 'sys', sheets: ['DIRECTOR\nbeat: tower'], memory, turns: [turn(0)], contextTokens: 8000, replyReserve: 500 });
    expect(p.system).toMatch(/DIRECTOR[\s\S]*STORY SO FAR[\s\S]*crossed the lake/);
    expect(p.meter.droppedTurns).toBe(0);
  });
});

describe('summarizer', () => {
  it('waits for SUMMARY_EVERY turns past the window', () => {
    const m = emptyMemory();
    expect(shouldSummarize(m, RECENT_WINDOW + SUMMARY_EVERY - 1)).toBe(false);
    expect(shouldSummarize(m, RECENT_WINDOW + SUMMARY_EVERY)).toBe(true);
    expect(shouldSummarize({ ...m, summarizedThrough: 10 }, RECENT_WINDOW + SUMMARY_EVERY + 5)).toBe(false);
  });

  it('reads fenced, trailing-comma and broken replies', () => {
    expect(parseSummary('```json\n{"summary": "They met.", "facts": ["Ash is the warden", 3, "no"],}\n```')).toEqual({ summary: 'They met.', facts: ['Ash is the warden'] });
    expect(parseSummary('nothing here')).toBeNull();
    expect(parseSummary('{"summary": ""}')).toBeNull();
  });

  it('summarizes the turns leaving the window and proposes facts', async () => {
    const turns = Array.from({ length: 30 }, (_, i) => ({ role: (i % 2 ? 'assistant' : 'user') as 'user' | 'assistant', content: `t${i}` }));
    let seen = '';
    const complete = async (messages: ChatMessage[], tier: string) => {
      seen = `${tier}|${messages[0].content}`;
      return { text: '{"summary":"Stuff happened.","facts":["The key is brass"]}', provider: 'gemini', model: 'm', tier: 'basic' } as never;
    };
    const r = await summarize(emptyMemory(), turns, complete);
    expect(r.ok).toBe(true);
    expect(seen.startsWith('basic|')).toBe(true);
    expect(seen).toContain('t17');
    expect(seen).not.toContain('t18');
    expect(r.memory.summarizedThrough).toBe(18);
    expect(r.memory.pending[0].text).toBe('The key is brass');
    const bad = await summarize(emptyMemory(), turns, async () => ({ text: 'oops' }) as never);
    expect(bad).toMatchObject({ ok: false, memory: { summarizedThrough: 0 } });
  });
});
