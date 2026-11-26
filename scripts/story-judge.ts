/**
 * Coherence judge for story-eval output (measurement only, never shipped).
 *   NODE_USE_ENV_PROXY=1 npx vite-node scripts/story-judge.ts story-eval.json [model=gemini-3.8-flash]
 * Rates what the player reads on the story card (title, premise, where you start, first goal, hero)
 * for whether it holds together as one story.
 */
import { readFileSync } from 'node:fs';
const [file, model = 'gemini-3.8-flash'] = process.argv.slice(2);
const key = process.env.GEMINI_API_KEY;
if (!key || !file) { console.error('usage: story-judge.ts <eval.json> [model]'); process.exit(1); }
const { rows } = JSON.parse(readFileSync(file, 'utf8'));
class M { d = new Map<string, string>(); getItem(k: string) { return this.d.get(k) ?? null; } setItem(k: string, v: string) { this.d.set(k, v); } removeItem(k: string) { this.d.delete(k); } }
(globalThis as any).localStorage = new M();
const { deckFor } = await import('../src/forge/spread');
const { getContent } = await import('../src/content');
const PROMPT = (r: any) => `You are a strict story editor. A player sees this story card before starting a role-playing campaign. Judge only whether it makes sense as ONE story.

Category: ${getContent(r.category).card.name}. What this category promises: ${deckFor(r.category).signature}
Title: ${r.title}
Premise: ${r.premise}
Where you start: ${r.start}
Your first goal: ${r.goal}
Hero: ${r.role}

Score 1-5 for each:
- coherent: every person, place and object in the premise belongs to one situation; nothing feels stitched in from another story (5 = one clear situation).
- consistent: premise, "where you start" and "first goal" describe the same moment and never contradict each other (5 = fully consistent).
- stakes: the closing question offers a choice that matters, where each answer risks or costs something the card has shown (5 = real stakes).
- clear: a first-time reader understands who they are, where they are and what is happening (5 = crystal clear).
List every contradiction or non sequitur you find (empty list if none).
Reply with JSON only: {"coherent":n,"consistent":n,"stakes":n,"clear":n,"problems":["…"]}`;
const tot = { coherent: 0, consistent: 0, stakes: 0, clear: 0 }; let n = 0; let bad = 0;
const judgeOne = async (r: any) => {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: PROMPT(r) }] }], generationConfig: { temperature: 0, responseMimeType: 'application/json' } }) });
  const j: any = await res.json();
  const txt = j?.candidates?.[0]?.content?.parts?.map((p: any) => p.text ?? '').join('') ?? '';
  try {
    const v = JSON.parse(txt);
    for (const k of Object.keys(tot) as (keyof typeof tot)[]) tot[k] += v[k];
    n++;
    const min = Math.min(v.coherent, v.consistent, v.stakes, v.clear);
    if (min <= 2) bad++;
    console.log(`${r.category.padEnd(20)} c${v.coherent} k${v.consistent} s${v.stakes} l${v.clear}  ${r.title}${v.problems?.length ? `\n    - ${v.problems.join('\n    - ')}` : ''}`);
  } catch { console.log(`judge failed for ${r.title}: ${JSON.stringify(j).slice(0, 200)}`); }
};
// JUDGE_CONCURRENCY (default 6): slow judges like gemini-4-neon take most of a minute each.
const ok = rows.filter((x: any) => x.ok);
const conc = Number(process.env.JUDGE_CONCURRENCY || 6);
for (let i = 0; i < ok.length; i += conc) await Promise.all(ok.slice(i, i + conc).map(judgeOne));
const avg = (k: keyof typeof tot) => (tot[k] / Math.max(n, 1)).toFixed(2);
console.log(`\nJUDGED ${n}: coherent ${avg('coherent')} consistent ${avg('consistent')} stakes ${avg('stakes')} clear ${avg('clear')} | cards with any score <= 2: ${bad}`);
process.exit(0);
