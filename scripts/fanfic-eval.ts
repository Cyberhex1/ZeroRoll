/**
 * "Create your own fanfic" eval: real stories through the same createFanfic the app uses,
 * each checked by the story validator, written to a report so a person can read them.
 * Never a stub (feedback: judge prompts on real output).
 *
 *   NODE_USE_ENV_PROXY=1 STORY_MODEL=gemini-4-carbon npx vite-node scripts/fanfic-eval.ts "Baldur's Gate 3:game" "Lookism:manhwa"
 *   EVAL_OUT=fanfic-eval.md (optional; a .json with the same name is written next to it)
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

const { createFanfic } = await import('../src/story/createFanfic');
const { aiCallCount, getLastCallMeta } = await import('../src/lib/geminiService');
const { formatIssues, checkStory } = await import('../src/story/validate');

const works = process.argv.slice(2).length ? process.argv.slice(2) : ["Baldur's Gate 3:game"];
const out = process.env.EVAL_OUT || 'fanfic-eval.md';
const lines: string[] = [`# Create your own fanfic eval\n\nWriter: ${process.env.STORY_MODEL || '(player model)'}; run ${new Date().toISOString()}\n`];
const json: unknown[] = [];

for (const w of works) {
  const [media, medium] = w.split(':');
  const steps: string[] = [];
  const t0 = Date.now();
  const calls0 = aiCallCount();
  try {
    const story = await createFanfic({ media, medium: medium as any, rating: 'teen', onStep: (s) => steps.push(s) });
    const secs = Math.round((Date.now() - t0) / 1000);
    const c = checkStory(story);
    lines.push(`## ${media}: "${story.meta.title}" (${story.meta.category})\n`);
    lines.push(`Steps: ${steps.join(' > ')}; ${aiCallCount() - calls0} calls; ${secs} s; last model ${getLastCallMeta()?.model}. Warnings:\n\n\`\`\`\n${formatIssues(c) || '(none)'}\n\`\`\`\n`);
    lines.push(`**Blurb:** ${story.meta.blurb}\n\n**World:** ${story.world}\n\n**Player:** ${story.playerRole}\n\n**Tone:** ${story.tone}\n`);
    lines.push(`**Cast:**\n${story.cast.map((m) => `- ${m.name}: ${m.appearance} ${m.voice} ${m.stance}`).join('\n')}\n`);
    lines.push('**Beats:**\n');
    for (const b of story.beats) {
      lines.push(`- **${b.id}** "${b.title}"${b.isEnding ? ` (ENDING: ${b.endingTitle})` : ''} -> ${b.exits.join(', ') || '-'}${b.entry.length ? ` [entry ${JSON.stringify(b.entry)}]` : ''}\n  ${b.sceneBrief}\n  Choices: ${b.choices.map((ch) => `"${ch.label}"${ch.target ? ` -> ${ch.target}` : ''}`).join('; ')}`);
    }
    lines.push('');
    json.push(story);
    console.log(`OK ${media}: ${story.meta.title} (${secs}s, ${steps.join('>')})`);
  } catch (e) {
    lines.push(`## ${media}: FAILED\n\n${e instanceof Error ? e.message : String(e)} (steps ${steps.join(' > ')})\n`);
    console.log(`FAIL ${media}: ${e instanceof Error ? e.message : String(e)}`);
  }
  writeFileSync(out, lines.join('\n'));
  writeFileSync(out.replace(/\.md$/, '.json'), JSON.stringify(json, null, 2));
}
