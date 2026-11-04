import { describe, it, expect, beforeEach } from 'vitest';
import { EMBED_AFTER, clearRecallCache, embeddingScores, lexicalScores, recallOrder } from '../recall';
import { buildPrompt } from '../promptBuilder';
import { addEntry, emptyMemory, MemoryEntry } from '../memoryStore';

const entry = (id: string, text: string, createdTurn: number, pinned = false): MemoryEntry => ({ id, text, createdTurn, pinned, source: 'auto' });

describe('memory recall', () => {
  beforeEach(() => clearRecallCache());

  it('scores the entry that shares the scene words highest', () => {
    const s = lexicalScores([entry('a', 'Mira owes the hero a favour at the lighthouse.', 3), entry('b', 'The market sells bread.', 90)], 'We climb the lighthouse stairs looking for Mira.');
    expect(s.a).toBeGreaterThan(s.b);
    expect(s.b).toBe(0);
  });

  it('a relevant old memory outranks newer unrelated ones; without a query, newest first', () => {
    const list = [entry('old', 'The silver key opens the crypt door under the chapel.', 2), ...Array.from({ length: 5 }, (_, i) => entry(`n${i}`, `Bought supplies number ${i} in town.`, 100 + i))];
    expect(recallOrder(list, 'I take out the silver key at the crypt door.')[0].id).toBe('old');
    expect(recallOrder(list, undefined)[0].id).toBe('n4');
  });

  it('keeps the relevant memory in a tight budget even when 250 newer ones exist', () => {
    let m = addEntry(emptyMemory(), 'The silver key opens the crypt door under the chapel.', 1);
    for (let i = 0; i < 250; i++) m = addEntry(m, `Traded trinket ${i} with a passing merchant on the road north.`, 10 + i);
    const built = buildPrompt({ system: 'S', sheets: [], memory: m, turns: [{ role: 'user', content: 'I use the silver key on the crypt door.' }], contextTokens: 1200, replyReserve: 400 });
    expect(built.system).toContain('silver key opens the crypt');
    expect(built.meter.droppedMemories).toBeGreaterThan(0);
    expect(built.meter.over).toBe(false);
  });

  it('uses embeddings past the threshold, caches vectors, and skips them below it', async () => {
    const calls: string[][] = [];
    const embed = async (texts: string[]) => {
      calls.push(texts);
      return texts.map((t) => (/dragon|wyrm/i.test(t) ? [1, 0] : [0, 1]));
    };
    const few = [entry('x', 'A wyrm sleeps in the hills.', 1)];
    expect(await embeddingScores(few, 'the dragon', embed)).toBeNull();
    const many = [entry('w', 'A wyrm sleeps in the hills.', 1), ...Array.from({ length: EMBED_AFTER }, (_, i) => entry(`e${i}`, `Errand ${i}.`, 2 + i))];
    const s = (await embeddingScores(many, 'the dragon wakes', embed))!;
    expect(s.w).toBeCloseTo(1);
    expect(s.e0).toBeCloseTo(0);
    expect(recallOrder(many.filter((e) => !e.pinned), 'the dragon wakes', s)[0].id).toBe('w');
    await embeddingScores(many, 'the dragon wakes', embed);
    expect(calls.length).toBe(1);
  });

  it('an embedder failure surfaces to the caller', async () => {
    const many = Array.from({ length: EMBED_AFTER }, (_, i) => entry(`e${i}`, `Errand ${i}.`, i));
    await expect(embeddingScores(many, 'q', async () => { throw new Error('boom'); })).rejects.toThrow('boom');
  });
});
