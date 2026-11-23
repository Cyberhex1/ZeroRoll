/**
 * Turn eval (0.2, plan 8.2): forge one story per category, start the campaign the way the
 * setup menu does, play Chapter One plus scripted turns through the same helpers as
 * ExperienceView, once with the Director on and once off (same story, same Chapter One).
 * Real calls only, never a stub.
 *
 *   NODE_USE_ENV_PROXY=1 GEMINI_MODEL=gemini-3.5-flash-lite npx vite-node scripts/turn-eval.ts [turns=10] [category ...]
 *   EVAL_OUT=turn-eval.md (optional)
 *
 * About 2 forge calls per category, 1 Chapter One, and 2 x turns play calls. The key is read
 * from GEMINI_API_KEY only and never printed.
 */
import { writeFileSync } from 'node:fs';

class MemoryStorage {
  private data = new Map<string, string>();
  get length() { return this.data.size; }
  key(i: number) { return [...this.data.keys()][i] ?? null; }
  getItem(k: string) { return this.data.has(k) ? this.data.get(k)! : null; }
  setItem(k: string, v: string) { this.data.set(k, String(v)); }
  removeItem(k: string) { this.data.delete(k); }
  clear() { this.data.clear(); }
}
(globalThis as any).localStorage = new MemoryStorage();

const key = process.env.GEMINI_API_KEY;
if (!key) {
  console.error('Set GEMINI_API_KEY.');
  process.exit(1);
}
localStorage.setItem('zeroroll_ai_provider', 'gemini');
localStorage.setItem('zeroroll_key_gemini', key);
const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
localStorage.setItem('zeroroll_model_gemini', model);

const { rollStory } = await import('../src/setup/storyRoll');
const { pickShape } = await import('../src/setup/storyShape');
const { applyPackage, toCharacterSheet } = await import('../src/setup/draft');
const { CATEGORIES_DATA, getContent, pickInspiration, getCategoryFallbackActions } = await import('../src/content');
const { aiCallCount, executeActionTurn, generateChapterOneAI } = await import('../src/lib/geminiService');
const { applyDelta, applyWorld, gateAlerts } = await import('../src/dnd/applyTurn');
const { REFEREE_PREFIX, buildDndContext, experienceMemory, memoryFromTurn } = await import('../src/dnd/memory');
const { turnDirection, leaksDirector } = await import('../src/forge/turnContext');
const { updateDirector, hasDialogue } = await import('../src/forge/director');
const { repetitionRate } = await import('../src/forge/language');

type Exp = import('../src/types').Experience;

const MOVES = [
  'I ask the nearest person what they know.',
  'I look around for anything out of place.',
  'I follow the most obvious lead.',
  'I keep my head down and listen.',
  'I go somewhere quieter to think it through.',
  'I confront the person who seems to be hiding something.',
  'I check what I am carrying and use what helps.',
  'I take the risk and push forward.',
  'I try to make an ally of someone here.',
  'I do what my hero would do right now.'
];

const args = process.argv.slice(2);
const turns = /^\d+$/.test(args[0] ?? '') ? Number(args.shift()) : 10;
const cats = args.length ? args : ['horror', 'romantic'];
const uid = () => Math.random().toString(36).slice(2, 10);

interface Run {
  director: boolean;
  notes: Record<string, number>;
  noteLog: string[];
  replies: string[];
  dialogue: number;
  chapters: number[];
  setPiecesUsed: number;
  leaks: number;
  errors: string[];
  calls: number;
}

async function play(start: Exp, director: boolean): Promise<{ run: Run; exp: Exp }> {
  let exp = start;
  const run: Run = { director, notes: {}, noteLog: [], replies: [], dialogue: 0, chapters: [], setPiecesUsed: 0, leaks: 0, errors: [], calls: 0 };
  const before = aiCallCount();
  for (let i = 0; i < turns; i++) {
    const playerMsg = { id: `msg_${uid()}`, sender: 'player' as const, text: MOVES[i % MOVES.length], timestamp: new Date().toISOString() };
    const logs = [...exp.logs, playerMsg];
    const temp: Exp = { ...exp, logs };
    const turnNumber = logs.filter((l) => l.sender === 'player' && !l.text.startsWith(REFEREE_PREFIX)).length;
    const direction = turnDirection(temp, turnNumber, { director });
    if (direction.note) {
      run.notes[direction.note.kind] = (run.notes[direction.note.kind] ?? 0) + 1;
      run.noteLog.push(`turn ${turnNumber}: ${direction.note.kind}: ${direction.note.text}`);
    }
    let data;
    try {
      data = await executeActionTurn({
        contents: buildDndContext(temp, logs, null).contents,
        category: temp.category,
        model,
        characterState: temp.character,
        world: temp.gameWorldState,
        rulesMode: temp.rulesMode ?? 'narrative',
        storyOutline: temp.storyOutline,
        inspiration: temp.inspiration,
        ...(director ? { director: { note: direction.note?.text, language: direction.language, names: direction.names, context: direction.context } } : {})
      });
    } catch (e) {
      run.errors.push(`turn ${turnNumber}: ${e instanceof Error ? e.message : String(e)}`);
      if (/daily|per day|PerDay/i.test(String(e))) throw e;
      break;
    }
    const text = data.text || '';
    run.replies.push(text);
    if (hasDialogue(text)) run.dialogue++;
    if (leaksDirector(text)) run.leaks++;
    const alerts = gateAlerts(temp, data.alerts ?? (data.courseChangeAlert ? [data.courseChangeAlert] : []), turnNumber);
    const sheet = applyDelta(temp.character, data.stateDelta, temp.rulesMode ?? 'narrative');
    const world = applyWorld(temp, data.stateDelta, alerts, turnNumber);
    let memory = memoryFromTurn(experienceMemory(temp), turnNumber, data.stateDelta, null);
    for (const a of alerts) memory = memoryFromTurn(memory, turnNumber, null, a);
    const dmMsg = { id: `msg_${uid()}`, sender: 'dm' as const, text, timestamp: new Date().toISOString(), suggestedActions: data.suggestedActions };
    const chapterBefore = temp.gameWorldState.currentChapter ?? 1;
    exp = {
      ...temp,
      character: sheet.character,
      ...world,
      memory,
      logs: [...temp.logs, dmMsg],
      director: updateDirector(temp, { text, check: !!data.requiredCheck, hpDelta: data.stateDelta?.hpDelta ?? 0 }, turnNumber, direction.note)
    };
    if ((exp.gameWorldState.currentChapter ?? 1) !== chapterBefore) run.chapters.push(turnNumber);
    console.log(`  ${director ? 'on ' : 'off'} turn ${turnNumber}${direction.note ? ` [${direction.note.kind}]` : ''}: ${text.slice(0, 90).replace(/\s+/g, ' ')}…`);
  }
  run.setPiecesUsed = exp.director?.setPiecesUsed.length ?? 0;
  run.calls = aiCallCount() - before;
  return { run, exp };
}

const pct = (n: number) => `${(n * 100).toFixed(1)}%`;
let md = `# Turn eval (${new Date().toISOString().slice(0, 16)}Z)\n\nModel: ${model}. ${turns} scripted turns per run; the Director-off run replays the same story and Chapter One.\n`;
const summary: string[] = [];
const totals = { on: { notes: {} as Record<string, number>, rep: [] as number[], leaks: 0 }, off: { rep: [] as number[], leaks: 0 } };

for (const category of cats) {
  const info = CATEGORIES_DATA.find((c) => c.id === category)!;
  console.log(`${category}: forging`);
  const pkg = await rollStory({ category: category as any, pronouns: 'she/her', rulesMode: 'narrative' as any, inspiration: pickInspiration(category as any), mode: 'fresh', shape: pickShape() });
  const draft = applyPackage(null, pkg, { category: category as any, inspiration: pickInspiration(category as any), source: 'ai' });
  const outline = draft.outline ?? pkg.outline;
  const character = toCharacterSheet(draft, { pronouns: 'she/her', rulesMode: 'narrative', category: info });
  const one = await generateChapterOneAI({ category: category as any, storyBlurb: draft.premise, storyOutline: outline, characterState: character, model, inspiration: draft.inspiration });
  if (one.failure) throw new Error(`Chapter One failed: ${JSON.stringify(one.failure)}`);
  const start: Exp = {
    id: `exp_${uid()}`,
    userId: 'eval',
    title: draft.title,
    category: category as any,
    description: draft.premise,
    model,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    character,
    gameWorldState: {
      currentLocation: 'Unknown',
      timeOfDay: outline.startingCircumstances || 'Daybreak',
      activeQuest: outline.immediateGoal || 'Begin your adventure',
      dangerLevel: 'Safe',
      customNotes: outline.backstory || '',
      currentChapter: 1
    },
    logs: [{ id: `msg_init_${uid()}`, sender: 'dm', text: one.text, timestamp: new Date().toISOString(), suggestedActions: one.suggestedActions?.length ? one.suggestedActions : getCategoryFallbackActions(category as any) }],
    storyOutline: outline,
    inspiration: draft.inspiration,
    rulesMode: 'narrative',
    book: 1,
    pendingCheck: null,
    activeAlert: null
  } as Exp;

  const on = await play(start, true);
  const off = await play(start, false);
  const repOn = repetitionRate(on.run.replies);
  const repOff = repetitionRate(off.run.replies);
  totals.on.rep.push(repOn);
  totals.off.rep.push(repOff);
  totals.on.leaks += on.run.leaks;
  totals.off.leaks += off.run.leaks;
  for (const [k, v] of Object.entries(on.run.notes)) totals.on.notes[k] = (totals.on.notes[k] ?? 0) + v;

  md += `\n## ${getContent(category as any).card.name}: ${draft.title}\n\n${draft.premise}\n\n`;
  md += `- Fronts: ${(outline.fronts ?? []).map((f) => `${f.name} (${f.portents.length} portents)`).join('; ') || 'none'}\n- Set-pieces: ${(outline.setPieces ?? []).length}\n- NPCs: ${(outline.keyNpcs ?? []).map((n) => n.name).join(', ')}\n\n`;
  md += `| | Director on | Director off |\n|---|---|---|\n`;
  md += `| Notes issued | ${Object.entries(on.run.notes).map(([k, v]) => `${k} ${v}`).join(', ') || 'none'} | - |\n`;
  md += `| Repeated 4-gram rate | ${pct(repOn)} | ${pct(repOff)} |\n`;
  md += `| Replies with dialogue | ${on.run.dialogue}/${on.run.replies.length} | ${off.run.dialogue}/${off.run.replies.length} |\n`;
  md += `| Chapter changes (turn) | ${on.run.chapters.join(', ') || 'none'} | ${off.run.chapters.join(', ') || 'none'} |\n`;
  md += `| Set-pieces detected | ${on.run.setPiecesUsed} | ${off.run.setPiecesUsed} |\n`;
  md += `| Replies that mention the Director | ${on.run.leaks} | ${off.run.leaks} |\n`;
  md += `| Calls | ${on.run.calls} | ${off.run.calls} |\n`;
  if (on.run.errors.length || off.run.errors.length) md += `\nErrors: ${[...on.run.errors, ...off.run.errors].join(' | ')}\n`;
  md += `\n### Notes (Director on)\n${on.run.noteLog.map((l) => `- ${l}`).join('\n') || '- none'}\n`;
  md += `\n### Chapter One\n\n${one.text}\n`;
  for (const r of [on, off]) {
    md += `\n### Transcript, Director ${r.run.director ? 'on' : 'off'}\n`;
    r.run.replies.forEach((t, i) => (md += `\n**Turn ${i + 1}.** _${MOVES[i % MOVES.length]}_\n\n${t}\n`));
  }
  summary.push(`${category}: notes ${JSON.stringify(on.run.notes)}, repetition on ${pct(repOn)} vs off ${pct(repOff)}, dialogue ${on.run.dialogue}/${on.run.replies.length} vs ${off.run.dialogue}/${off.run.replies.length}, leaks ${on.run.leaks}`);
}

const mean = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
const frontNotes = totals.on.notes.front ?? 0;
const npcNotes = totals.on.notes.npc ?? 0;
const head = `\n## Summary\n\n| Metric | Result | Target |\n|---|---|---|\n| Front notes issued | ${frontNotes} | ≥ 2 |\n| NPC notes issued | ${npcNotes} | ≥ 1 |\n| Repeated 4-gram rate, on vs off | ${pct(mean(totals.on.rep))} vs ${pct(mean(totals.off.rep))} | on lower |\n| Replies that mention the Director | ${totals.on.leaks + totals.off.leaks} | 0 |\n| Total calls | ${aiCallCount()} | |\n`;
md = md.replace(/\n## /, `${head}\n## `);
const out = process.env.EVAL_OUT || 'turn-eval.md';
writeFileSync(out, md);
console.log(summary.join('\n'));
console.log(head);
console.log(`Wrote ${out}`);
