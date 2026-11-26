/**
 * Injection policy: what part of the category corpus goes into which prompt.
 *
 * - Chapter One and every action turn get the campaign's 1 to 3 tone references (picked by the
 *   story roll). No genre profile or style card in play since 2026-11-26 (ohnna).
 * - The Rules Referee gets nothing from the corpus.
 * - Media and trope picks are made once (pickInspiration) and stored on the Experience.
 */
import type { CampaignInspiration, ExperienceCategory } from '../types';
import { getCategoryProfile, pickInspiration } from './index';

export const STYLE_CARD_MAX = 300;

const ANTI_COPY = 'Use these for tone and pacing only. Never retell them or reuse their names, plots or characters unless the player asks for it.';

function clip(text: string, max: number): string {
  const t = text.replace(/\s+/g, ' ').trim();
  return t.length <= max ? t : `${t.slice(0, Math.max(0, max - 1)).replace(/[\s,;:.]+\S*$/, '')}…`;
}

export function inspirationBlock(inspiration: CampaignInspiration): string {
  const lines: string[] = [];
  if (inspiration.media.length) lines.push(`Tone references: ${inspiration.media.join('; ')}.`);
  if (inspiration.tropes.length) lines.push(`Story seeds (starting situations, as examples):\n${inspiration.tropes.map((t) => `- ${t}`).join('\n')}`);
  if (!lines.length) return '';
  return `=== CAMPAIGN INSPIRATION ===\n${lines.join('\n')}\n${ANTI_COPY}`;
}

/** The category's premise pattern: the shape of a good story start, not a plot. */
export function patternBlock(category: ExperienceCategory): string {
  const { pattern: pat, name } = getCategoryProfile(category);
  return `PREMISE PATTERN (${name}): the shape every story in this category follows. It is not a plot; invent your own people, places and events inside it.
- The hero: ${pat.hero}
- Where the story starts (the premise lives here): ${pat.start}
- What goes wrong, on screen, after the start: ${pat.turn}
- The payoff, at the end: ${pat.payoff}`;
}

/**
 * The whole profile, for the story roll and the Chapter One scene. Story seeds are left out
 * when `seeds` is false (Chapter One with an outline follows the outline, not the seeds).
 */
export function fullProfileBlock(category: ExperienceCategory, inspiration?: CampaignInspiration, opts: { seeds?: boolean } = {}): string {
  const p = getCategoryProfile(category);
  const base = inspiration ?? pickInspiration(category);
  const insp = opts.seeds === false ? { ...base, tropes: [] } : base;
  return `=== GENRE PROFILE: ${p.name.toUpperCase()} ===
Voice: ${p.voice}
Atmosphere: ${p.atmosphere}
Sensory anchors: ${p.sensoryMotifs.join('; ')}
Scene structure: ${p.sceneStructure}
Story beats: ${p.storyBeats}
Characters: ${p.characterDynamics}
Encounters: ${p.encounterPatterns}
Avoid: ${p.avoid}

${patternBlock(category)}

${inspirationBlock(insp)}`;
}

/** At most STYLE_CARD_MAX characters: voice, three sensory anchors, and what to avoid. */
export function styleCard(category: ExperienceCategory): string {
  const p = getCategoryProfile(category);
  const head = `STYLE (${p.name}): `;
  const anchors = `Anchors: ${p.sensoryMotifs.slice(0, 3).map((m) => clip(m, 40)).join('; ')}.`;
  const avoid = `Avoid: ${clip(p.avoid, 70)}`;
  const fixed = head.length + anchors.length + avoid.length + 2;
  const voice = clip(p.voice, Math.max(40, STYLE_CARD_MAX - fixed));
  const card = `${head}${voice} ${anchors} ${avoid}`;
  return card.length <= STYLE_CARD_MAX ? card : clip(card, STYLE_CARD_MAX);
}

/**
 * The campaign's tone references, for every action turn (ohnna, 2026-11-26: the 1 to 3 titles
 * the story roll picked). The static style card is no longer sent: the recent log already
 * carries the story's voice. The story seeds are not sent either: after Chapter One the game
 * master follows the story's own outline.
 */
export function turnContextBlock(_category: ExperienceCategory, inspiration?: CampaignInspiration, _opts: { turn?: number } = {}): string {
  return inspiration ? inspirationBlock({ ...inspiration, tropes: [] }) : '';
}
