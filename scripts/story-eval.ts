/**
 * Story Forge eval (0.2, plan 8.1): real rolls through the same rollStory the setup menu
 * uses, with a report and a summary table. Never a stub (feedback: judge prompts on real output).
 *
 *   NODE_USE_ENV_PROXY=1 GEMINI_MODEL=gemini-3.5-flash-lite npx vite-node scripts/story-eval.ts [perCategory=2] [--no-pitch] [category ...]
 *   EVAL_OUT=story-eval.md (optional; a .json with the same name is written next to it)
 *
 * The key is read from GEMINI_API_KEY only and never printed.
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
localStorage.setItem('zeroroll_model_gemini', process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite');

const { rollStory } = await import('../src/setup/storyRoll');
const { pickShape } = await import('../src/setup/storyShape');
const { CATEGORY_IDS, getContent, pickInspiration } = await import('../src/content');
const { aiCallCount } = await import('../src/lib/geminiService');
const { STOCK, IRONY, firstMatch, ticsIn, stockPlacesIn } = await import('../src/forge/gate');
const { firstWords, overlap } = await import('../src/forge/words');
const { isFreshName } = await import('../src/content/names');
const { CLOSING_CARDS } = await import('../src/content/forge/cards');

const args = process.argv.slice(2);
const noPitch = args.includes('--no-pitch');
const rest = args.filter((a) => a !== '--no-pitch');
const per = /^\d+$/.test(rest[0] ?? '') ? Number(rest.shift()) : 2;
const cats = rest.length ? rest : [...CATEGORY_IDS];
const pronouns = ['she/her', 'he/him', 'they/them'];

interface Row {
  category: string;
  ok: boolean;
  error?: string;
  title?: string;
  premise?: string;
  closing?: string;
  heroName?: string;
  npcNames?: string[];
  gateBefore?: string[];
  gateAfter?: string[];
  calls: number;
  seconds: number;
}
const rows: Row[] = [];
let md = `# Story Forge eval (${new Date().toISOString().slice(0, 16)}Z)\n\nModel: ${localStorage.getItem('zeroroll_model_gemini')}. Pitch: ${noPitch ? 'off' : 'on'}. ${per} per category.\n`;

let n = 0;
for (const category of cats) {
  md += `\n## ${getContent(category).card.name}\n`;
  for (let i = 0; i < per; i++, n++) {
    const p = pronouns[n % 3];
    const before = aiCallCount();
    const t0 = Date.now();
    try {
      const pkg = await rollStory({ category: category as any, pronouns: p, rulesMode: 'narrative' as any, inspiration: pickInspiration(category as any), mode: 'fresh', shape: pickShape(), noPitch });
      const s = pkg.spread;
      const secs = (Date.now() - t0) / 1000;
      const calls = aiCallCount() - before;
      const o = pkg.outline;
      md += `\n### ${pkg.title}\n_(${s.family.name} · ${s.primary.title}${s.spice ? ` + ${s.spice.title}` : ''} · ${s.engine.name} · ${s.shape.id} · ${p})_\n_Opening: ${s.opening} Closing: ${s.closing}_\n\n${pkg.premise}\n\n`;
      md += `- Hero: ${pkg.hero.name}, ${pkg.hero.roleClass}, ${pkg.hero.origin}\n- Gear: ${pkg.sheet.gear.map((g) => g.name).join('; ')}${pkg.sheet.spells.length ? `\n- Spells: ${pkg.sheet.spells.join('; ')}` : ''}\n`;
      md += `- NPCs: ${(o.keyNpcs ?? []).map((x) => `${x.name} (${x.role}; wants ${x.motivation}; next: ${x.move ?? '-'})`).join(' | ')}\n`;
      md += `- Turning point: ${o.turningPoint}\n- Fronts: ${(o.fronts ?? []).map((f) => `${f.name}: ${f.portents.join(' > ')}`).join(' || ')}\n- Set-pieces: ${(o.setPieces ?? []).join(' | ')}\n- Chapters: ${(o.chapters ?? []).join(' / ')}\n- First moves: ${pkg.actions.join(' | ')}\n`;
      if (pkg.stats.pitches.length) md += `- Pitches: ${pkg.stats.pitches.map((x, k) => `${k === pkg.stats.chosenIndex ? '**' : ''}${x.title}: ${x.hook}${k === pkg.stats.chosenIndex ? '**' : ''}`).join(' | ')}\n`;
      if (pkg.stats.pitchSkipped) md += `- Pitch skipped: ${pkg.stats.pitchSkipped}\n`;
      md += `- Gate: before [${pkg.stats.gateBefore.map((g) => `${g.kind}: ${g.detail}`).join('; ')}] after [${pkg.stats.gateAfter.map((g) => `${g.kind}: ${g.detail}`).join('; ')}]${pkg.stats.repaired ? ' (repaired)' : ''}\n- Calls: ${calls}, ${secs.toFixed(1)} s\n`;
      rows.push({ category, ok: true, title: pkg.title, premise: pkg.premise, closing: s.closing, heroName: pkg.hero.name, npcNames: (o.keyNpcs ?? []).map((x) => x.name), gateBefore: pkg.stats.gateBefore.map((g) => g.kind), gateAfter: pkg.stats.gateAfter.map((g) => g.kind), calls, seconds: secs });
      console.log(`ok   ${category} #${i + 1} (${calls} calls, ${secs.toFixed(1)}s): ${pkg.title}`);
    } catch (err: any) {
      const secs = (Date.now() - t0) / 1000;
      rows.push({ category, ok: false, error: err?.message, calls: aiCallCount() - before, seconds: secs });
      md += `\n### FAILED: ${err?.message}\n`;
      console.log(`FAIL ${category} #${i + 1}: ${err?.message}`);
      if (/limit|quota|429/i.test(String(err?.message))) {
        console.log('Quota hit: stopping.');
        break;
      }
    }
  }
}

const ok = rows.filter((r) => r.ok);
const prem = ok.map((r) => r.premise!);
const pct = (a: number, b: number) => `${a}/${b}${b ? ` (${Math.round((100 * a) / b)}%)` : ''}`;
const median = (xs: number[]) => { const s = [...xs].sort((a, b) => a - b); return s.length ? s[Math.floor((s.length - 1) / 2)] : 0; };
const p90 = (xs: number[]) => { const s = [...xs].sort((a, b) => a - b); return s.length ? s[Math.min(s.length - 1, Math.ceil(s.length * 0.9) - 1)] : 0; };
const closingCounts = CLOSING_CARDS.map((c) => ok.filter((r) => r.closing === c).length);
let pairs = 0;
let sum = 0;
for (let i = 0; i < prem.length; i++) for (let j = i + 1; j < prem.length; j++) { sum += overlap(prem[i], prem[j]); pairs++; }
const firstPass = ok.filter((r) => !r.gateBefore!.length).length;
const repairedRows = ok.filter((r) => r.gateBefore!.length);
const fixedAll = repairedRows.filter((r) => !r.gateAfter!.length).length;
const summary = {
  rolls: rows.length,
  stock: ok.filter((r) => firstMatch(r.premise!, STOCK)).length,
  irony: ok.filter((r) => firstMatch(r.premise!, IRONY)).length,
  distinctFirst3: new Set(prem.map((x) => firstWords(x))).size,
  topClosingShare: ok.length ? Math.max(...closingCounts) / ok.length : 0,
  tics2: ok.filter((r) => ticsIn(r.premise!).length >= 2).length,
  overusedNames: ok.filter((r) => [r.heroName!, ...r.npcNames!].some((x) => !isFreshName(x))).length,
  stockPlaces: ok.filter((r) => stockPlacesIn(r.premise! + ' ' + r.title!).length).length,
  gateFirstPass: firstPass,
  repairsFixedAll: fixedAll,
  repairsTried: repairedRows.length,
  failures: rows.length - ok.length,
  medianSeconds: median(ok.map((r) => r.seconds)),
  p90Seconds: p90(ok.map((r) => r.seconds)),
  callsPerRoll: rows.length ? rows.reduce((a, r) => a + r.calls, 0) / rows.length : 0,
  meanPairwiseJaccard: pairs ? sum / pairs : 0
};
const table = `| Metric | Result | Target |
|---|---|---|
| Final premises with a STOCK match | ${pct(summary.stock, ok.length)} | 0 |
| Final premises with an IRONY match | ${pct(summary.irony, ok.length)} | ≤ 1 |
| Distinct first three words | ${summary.distinctFirst3}/${ok.length} | ≥ 26/30 |
| Most common closing card | ${Math.round(summary.topClosingShare * 100)}% | ≤ 40% |
| Final premises with 2+ tic words | ${summary.tics2} | ≤ 2 |
| Overused names in hero or NPCs | ${summary.overusedNames} | 0 |
| Stock places | ${summary.stockPlaces} | ≤ 2 |
| Gate pass on the first try | ${pct(firstPass, ok.length)} | ≥ 70% |
| Repairs that fix all failures | ${pct(fixedAll, repairedRows.length)} | ≥ 70% |
| Schema or validation failures | ${summary.failures} | ≤ 1 |
| Median / p90 seconds per roll | ${summary.medianSeconds.toFixed(1)} / ${summary.p90Seconds.toFixed(1)} | ≤ 18 / ≤ 30 |
| Calls per roll (average) | ${summary.callsPerRoll.toFixed(2)} | ≤ 2.4 |
| Mean pairwise Jaccard across premises | ${summary.meanPairwiseJaccard.toFixed(3)} | ≤ 0.05 |
`;
md = md.replace('\n', `\n\n## Summary\n\n${table}\n`);
const out = process.env.EVAL_OUT || 'story-eval.md';
writeFileSync(out, md);
writeFileSync(out.replace(/\.md$/, '') + '.json', JSON.stringify({ summary, rows }, null, 2));
console.log(`\n${table}\nWrote ${out}`);
process.exit(0);
