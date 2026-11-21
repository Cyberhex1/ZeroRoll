/**
 * Real story rolls, for reading against the category patterns (feedback: prompt changes are
 * judged on real model output, never a stub). Uses the same rollStory call as the setup menu.
 *
 *   GEMINI_API_KEY=... npx vite-node scripts/story-samples.ts [count=2] [category ...]
 *   GEMINI_MODEL=gemini-flash-latest  (optional)  SAMPLES_OUT=samples.md  (optional)
 *
 * The key is read from the environment only and never printed.
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

// Behind a proxy (cloud sessions), run with NODE_USE_ENV_PROXY=1 so Node's fetch uses HTTPS_PROXY.

const key = process.env.GEMINI_API_KEY;
if (!key) {
  console.error('Set GEMINI_API_KEY.');
  process.exit(1);
}
localStorage.setItem('zeroroll_ai_provider', 'gemini');
localStorage.setItem('zeroroll_key_gemini', key);
if (process.env.GEMINI_MODEL) localStorage.setItem('zeroroll_model_gemini', process.env.GEMINI_MODEL);

const { rollStory } = await import('../src/setup/storyRoll');
const { pickShape } = await import('../src/setup/storyShape');
const { CATEGORY_IDS, getContent, pickInspiration } = await import('../src/content');

const args = process.argv.slice(2);
const count = /^\d+$/.test(args[0] ?? '') ? Number(args.shift()) : 2;
const cats = args.length ? args : [...CATEGORY_IDS];
const pronouns = ['she/her', 'he/him', 'they/them'];

let out = `# Story roll samples (${new Date().toISOString().slice(0, 16)}Z)\n`;
let failed = 0;
for (const category of cats) {
  out += `\n## ${getContent(category).card.name}\n`;
  for (let i = 0; i < count; i++) {
    const shape = pickShape();
    const p = pronouns[(i + cats.indexOf(category)) % 3];
    try {
      const pkg = await rollStory({ category: category as any, pronouns: p, rulesMode: 'narrative' as any, inspiration: pickInspiration(category as any), mode: 'fresh', shape });
      out += `\n### ${pkg.title}  _(${shape.id}, ${p})_\n${pkg.premise}\n\n- Hero: ${pkg.hero.name}, ${pkg.hero.roleClass}, ${pkg.hero.origin}\n- Gear: ${pkg.sheet.gear.map((g) => g.name).join('; ')}${pkg.sheet.spells.length ? `\n- Spells: ${pkg.sheet.spells.join('; ')}` : ''}\n- Turning point: ${pkg.outline.turningPoint}\n- Chapters: ${(pkg.outline.chapters ?? []).join(' / ')}\n`;
      console.log(`ok   ${category} #${i + 1}: ${pkg.title}`);
    } catch (err: any) {
      failed++;
      out += `\n### FAILED: ${err?.message}\n`;
      console.log(`FAIL ${category} #${i + 1}: ${err?.message}`);
    }
  }
}
const file = process.env.SAMPLES_OUT || 'story-samples.md';
writeFileSync(file, out);
console.log(`Wrote ${file}`);
process.exit(failed ? 1 : 0);
