/**
 * Compares the tier ladder in models.json with the models a provider currently lists, and
 * suggests updates: a model that is gone (retired) or a newer stable release in the same family.
 * Pure functions, shared by the weekly GitHub Action (scripts/check-models.ts) and the in-app check.
 */
import type { Tier } from './router';

export interface ModelSuggestion {
  provider: string;
  tier: Tier;
  current: string;
  suggested: string | null;
  reason: 'retired' | 'newer';
}

interface Parsed {
  family: string;
  version: number[];
  preview: boolean;
}

function compareVersions(a: number[], b: number[]): number {
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const d = (a[i] ?? 0) - (b[i] ?? 0);
    if (d) return d;
  }
  return 0;
}

/** gemini-3.8-flash, gemini-3.5-flash-lite, gemini-3.1-pro-preview. Dated snapshots are ignored. */
export function parseGemini(id: string): Parsed | null {
  const m = id.match(/^gemini-(\d+(?:\.\d+)*)-(flash-lite|flash|pro)(-preview)?$/);
  if (!m) return null;
  return { family: m[2], version: m[1].split('.').map(Number), preview: !!m[3] };
}

/** claude-sonnet-5-5, claude-haiku-5-5, claude-opus-5. Dated snapshots are ignored. */
export function parseAnthropic(id: string): Parsed | null {
  const m = id.match(/^claude-(haiku|sonnet|opus)-(\d+)(?:-(\d{1,2}))?$/);
  if (!m) return null;
  return { family: m[1], version: [Number(m[2]), Number(m[3] ?? 0)], preview: false };
}

const PARSERS: Record<string, (id: string) => Parsed | null> = {
  gemini: parseGemini,
  anthropic: parseAnthropic
};

/** Newest model in `available` from the same family; previews only count when the current model is one. */
function newestInFamily(available: string[], parse: (id: string) => Parsed | null, family: string, allowPreview: boolean): string | null {
  let best: { id: string; p: Parsed } | null = null;
  for (const id of available) {
    const p = parse(id);
    if (!p || p.family !== family || (p.preview && !allowPreview)) continue;
    if (!best || compareVersions(p.version, best.p.version) > 0 || (compareVersions(p.version, best.p.version) === 0 && best.p.preview && !p.preview)) {
      best = { id, p };
    }
  }
  return best?.id ?? null;
}

export function suggestModelUpdates(
  provider: string,
  ladder: Partial<Record<Tier, string>>,
  available: string[]
): ModelSuggestion[] {
  const parse = PARSERS[provider];
  const out: ModelSuggestion[] = [];
  const have = new Set(available);
  for (const [tier, current] of Object.entries(ladder) as [Tier, string][]) {
    if (!current) continue;
    const p = parse?.(current) ?? null;
    if (!have.has(current)) {
      out.push({ provider, tier, current, suggested: p && parse ? newestInFamily(available, parse, p.family, p.preview) : null, reason: 'retired' });
      continue;
    }
    if (!p || !parse) continue; // Aliases like gemini-flash-latest track the newest release by themselves.
    const newest = newestInFamily(available, parse, p.family, p.preview);
    if (newest && newest !== current && compareVersions(parse(newest)!.version, p.version) > 0) {
      out.push({ provider, tier, current, suggested: newest, reason: 'newer' });
    }
  }
  return out;
}

export function formatSuggestions(s: ModelSuggestion[]): string {
  if (!s.length) return 'Every model in src/ai/models.json is current.';
  return s
    .map((x) => x.reason === 'retired'
      ? `- ${x.provider} ${x.tier}: \`${x.current}\` is no longer listed${x.suggested ? `; use \`${x.suggested}\`` : '; pick a replacement'}.`
      : `- ${x.provider} ${x.tier}: \`${x.suggested}\` is newer than \`${x.current}\`.`)
    .join('\n');
}
