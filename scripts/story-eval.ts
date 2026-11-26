/**
 * Master-prompt eval: real rolls through the same rollStory the setup menu uses (writer, story
 * check, at most one rewrite), written to a readable report. Never a stub (judge prompts on
 * real output).
 *
 *   NODE_USE_ENV_PROXY=1 STORY_MODEL=gemini-4-carbon npx vite-node scripts/story-eval.ts [perCategory=1] [category ...]
 *   EVAL_OUT=story-eval.md (a .json with the same name is written next to it)
 *   GEMINI_MODEL: the player's model (default gemini-3.5-flash-lite). USABLE: comma list, as
 *   Test Connection stores it (picks the check model).
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
if (process.env.STORY_MODEL) localStorage.setItem('zeroroll_story_model_gemini', process.env.STORY_MODEL);
if (process.env.USABLE) localStorage.setItem('zeroroll_gemini_usable_models', JSON.stringify({ models: process.env.USABLE.split(','), checkedAt: Date.now() }));

const { rollStory } = await import('../src/setup/storyRoll');
const { CATEGORY_IDS, getContent } = await import('../src/content');
const { writerOptions } = await import('../src/setup/masterPrompt');
if (process.env.NAMES_TO_WRITER === '0') writerOptions.nameList = false;
const { aiCallCount } = await import('../src/lib/geminiService');

const args = process.argv.slice(2);
const per = /^\d+$/.test(args[0] ?? '') ? Number(args.shift()) : 1;
const cats = (args.length ? args : [...CATEGORY_IDS]) as (typeof CATEGORY_IDS)[number][];
const pronouns = ['she/her', 'he/him', 'they/them'];
const out = process.env.EVAL_OUT || 'story-eval.md';

const rows: any[] = [];
const md: string[] = [`# Story roll eval (${new Date().toISOString()})`, '', `Writer: ${process.env.STORY_MODEL || process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite'}`, ''];
let n = 0;
for (const category of cats) {
  for (let i = 0; i < per; i++) {
    const p = pronouns[n++ % pronouns.length];
    const calls0 = aiCallCount();
    const t0 = Date.now();
    try {
      const pkg = await rollStory({ category, pronouns: p, rulesMode: 'narrative', inspiration: { media: [], tropes: [] }, mode: 'fresh' });
      const secs = Math.round((Date.now() - t0) / 1000);
      const o = pkg.outline;
      rows.push({ category, ok: true, secs, calls: aiCallCount() - calls0, pkg: { ...pkg, prompt: undefined } });
      md.push(
        `## ${getContent(category).card.name}: ${pkg.title}`,
        '',
        `*${secs}s, ${aiCallCount() - calls0} calls. Examples: ${pkg.media.join('; ')}*`,
        `*Check: ${pkg.check.ran ? (pkg.check.pass ? 'pass' : `FAILED → ${pkg.check.rewritten ? 'rewritten' : 'not rewritten'}`) : `did not run (${pkg.check.error})`}. Writer ${pkg.check.writerModel ?? '?'}, checker ${pkg.check.checkModel ?? '?'}*`,
        ...(pkg.check.problems.length ? ['', 'Problems the check found:', ...pkg.check.problems.map((x) => `- ${x}`)] : []),
        '',
        `**The story:** ${pkg.premise}`,
        '',
        `**Where you start:** ${o.startingCircumstances}`,
        '',
        `**Your first goal:** ${o.immediateGoal}`,
        '',
        `**Hero:** ${pkg.hero.name} (${p}), ${pkg.hero.roleClass}, ${pkg.hero.origin}. ${pkg.hero.appearance}`,
        `**Gear:** ${pkg.sheet.gear.map((g) => g.name).join(', ')}${pkg.sheet.spells.length ? ` · **Spells:** ${pkg.sheet.spells.join(', ')}` : ''} · **Skills:** ${pkg.sheet.skills.join(', ')}`,
        `**First moves:** ${pkg.actions.join(' | ')}`,
        '',
        `DM notes: people ${o.keyNpcs.map((k) => `${k.name} (${k.role})`).join(', ')}. Chapters: ${o.chapters.join(' / ')}. Turning point: ${o.turningPoint ?? '-'} (${o.storyShape ?? '-'})`,
        ''
      );
      console.log(`${category}: ${pkg.title} (${secs}s, check ${pkg.check.ran ? (pkg.check.pass ? 'pass' : 'fail') : 'skipped'})`);
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      rows.push({ category, ok: false, error });
      md.push(`## ${category}: FAILED`, '', error, '');
      console.log(`${category}: FAILED ${error}`);
    }
    writeFileSync(out, md.join('\n'));
    writeFileSync(out.replace(/\.md$/, '.json'), JSON.stringify(rows, null, 2));
  }
}
const ok = rows.filter((r) => r.ok);
const summary = `\n${ok.length}/${rows.length} rolled. Check passed first time: ${ok.filter((r) => r.pkg.check.pass).length}; rewritten: ${ok.filter((r) => r.pkg.check.rewritten).length}; check did not run: ${ok.filter((r) => !r.pkg.check.ran).length}. Mean ${Math.round(ok.reduce((s, r) => s + r.secs, 0) / Math.max(1, ok.length))}s per roll.`;
md.push(summary);
writeFileSync(out, md.join('\n'));
console.log(summary);
