/**
 * Weekly latest-model check (run by .github/workflows/model-check.yml, or locally:
 * GEMINI_API_KEY=... ANTHROPIC_API_KEY=... npm run models:check).
 *
 * Lists the models each provider offers and compares them with src/ai/models.json.
 * Writes model-check-report.md and, with --write, updates models.json in place.
 * Providers without a key are skipped and say so in the report.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { suggestModelUpdates, formatSuggestions, ModelSuggestion } from '../src/ai/modelCheck';

const MODELS_PATH = new URL('../src/ai/models.json', import.meta.url);
const models = JSON.parse(readFileSync(MODELS_PATH, 'utf8'));

async function getJson(url: string, headers: Record<string, string>): Promise<any> {
  const res = await fetch(url, { headers });
  const body = await res.text();
  if (!res.ok) throw new Error(`${res.status} ${body.slice(0, 200)}`);
  return JSON.parse(body);
}

async function listGemini(key: string): Promise<string[]> {
  const out: string[] = [];
  let token = '';
  do {
    const data = await getJson(
      `https://generativelanguage.googleapis.com/v1beta/models?pageSize=1000${token ? `&pageToken=${token}` : ''}`,
      { 'x-goog-api-key': key }
    );
    for (const m of data.models || []) {
      if ((m.supportedGenerationMethods || []).includes('generateContent')) out.push(String(m.name).replace(/^models\//, ''));
    }
    token = data.nextPageToken || '';
  } while (token);
  return out;
}

async function listAnthropic(key: string): Promise<string[]> {
  const out: string[] = [];
  let after = '';
  for (let i = 0; i < 10; i++) {
    const data = await getJson(`https://api.anthropic.com/v1/models?limit=100${after ? `&after_id=${after}` : ''}`, {
      'x-api-key': key,
      'anthropic-version': '2023-06-01'
    });
    out.push(...(data.data || []).map((m: any) => m.id));
    if (!data.has_more) break;
    after = data.last_id;
  }
  return out;
}

async function listOpenAI(key: string): Promise<string[]> {
  const data = await getJson('https://api.openai.com/v1/models', { Authorization: `Bearer ${key}` });
  return (data.data || []).map((m: any) => m.id);
}

const sources: Array<{ provider: string; env: string; list: (k: string) => Promise<string[]> }> = [
  { provider: 'gemini', env: 'GEMINI_API_KEY', list: listGemini },
  { provider: 'anthropic', env: 'ANTHROPIC_API_KEY', list: listAnthropic },
  { provider: 'openai', env: 'OPENAI_API_KEY', list: listOpenAI }
];

const lines: string[] = [`# Model check, ${new Date().toISOString().slice(0, 10)}`, ''];
const all: ModelSuggestion[] = [];
for (const s of sources) {
  const key = process.env[s.env]?.trim();
  if (!key) {
    lines.push(`## ${s.provider}`, `Skipped: no ${s.env} secret.`, '');
    continue;
  }
  try {
    const available = await s.list(key);
    const found = suggestModelUpdates(s.provider, models.providers[s.provider] || {}, available);
    all.push(...found);
    lines.push(`## ${s.provider}`, formatSuggestions(found), '');
  } catch (err) {
    lines.push(`## ${s.provider}`, `Could not list models: ${err instanceof Error ? err.message : String(err)}`, '');
  }
}

if (process.argv.includes('--write')) {
  for (const s of all) if (s.suggested) models.providers[s.provider][s.tier] = s.suggested;
  models.checkedAt = new Date().toISOString().slice(0, 10);
  writeFileSync(MODELS_PATH, JSON.stringify(models, null, 2) + '\n');
}

const report = lines.join('\n');
writeFileSync('model-check-report.md', report);
console.log(report);
// Exit 0 either way; the workflow reads the report. "changes=true" tells it to open a PR.
if (process.env.GITHUB_OUTPUT) writeFileSync(process.env.GITHUB_OUTPUT, `changes=${all.length > 0}\n`, { flag: 'a' });
