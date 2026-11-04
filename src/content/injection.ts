/**
 * Injection policy: what part of the category corpus goes into which prompt.
 *
 * - Scenario generation and Chapter One get the full profile plus the campaign's inspiration.
 * - Action turns get a short style card (at most STYLE_CARD_MAX characters) plus the same
 *   stored inspiration, verbatim, so the campaign keeps one voice from turn 1 to turn 100.
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
  if (inspiration.tropes.length) lines.push(`Story seeds:\n${inspiration.tropes.map((t) => `- ${t}`).join('\n')}`);
  if (!lines.length) return '';
  return `=== CAMPAIGN INSPIRATION ===\n${lines.join('\n')}\n${ANTI_COPY}`;
}

/** The whole profile, for scenario generation and the Chapter One scene. */
export function fullProfileBlock(category: ExperienceCategory, inspiration?: CampaignInspiration): string {
  const p = getCategoryProfile(category);
  const insp = inspiration ?? pickInspiration(category);
  return `=== GENRE PROFILE: ${p.name.toUpperCase()} ===
Voice: ${p.voice}
Atmosphere: ${p.atmosphere}
Sensory anchors: ${p.sensoryMotifs.join('; ')}
Scene structure: ${p.sceneStructure}
Story beats: ${p.storyBeats}
Characters: ${p.characterDynamics}
Encounters: ${p.encounterPatterns}
Avoid: ${p.avoid}

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

/** Style card plus the campaign's stored inspiration, for every action turn. */
export function turnContextBlock(category: ExperienceCategory, inspiration?: CampaignInspiration): string {
  const insp = inspiration ? inspirationBlock(inspiration) : '';
  return insp ? `${styleCard(category)}\n\n${insp}` : styleCard(category);
}
