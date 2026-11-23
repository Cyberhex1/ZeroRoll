/**
 * What later prompts (Chapter One, turns) carry from the forge record, so the campaign keeps
 * the voice and influences it was built from.
 */
import type { CampaignInspiration, ExperienceCategory, ForgeRecord } from '../types';
import type { SourceDna, StoryFamily } from '../content/forge/types';
import { getCategoryProfile } from '../content';
import { deckFor } from './spread';

export function forgeParts(category: ExperienceCategory, forge: ForgeRecord): { family?: StoryFamily; primary?: SourceDna } {
  const deck = deckFor(category);
  return { family: deck.families.find((f) => f.id === forge.family), primary: deck.dna.find((d) => d.id === forge.dna?.[0]) };
}

/** Chapter One's genre block for a forged campaign: signature, voice, atmosphere, the family palette and the primary DNA. */
export function forgeContextBlock(category: ExperienceCategory, inspiration: CampaignInspiration | undefined): string | null {
  const forge = inspiration?.forge;
  if (!forge) return null;
  const { family, primary } = forgeParts(category, forge);
  const p = getCategoryProfile(category);
  return [
    `=== GENRE: ${p.name.toUpperCase()} ===`,
    deckFor(category).signature,
    `Voice: ${p.voice}`,
    `Atmosphere: ${p.atmosphere}`,
    family ? `Story family: ${family.name}. Palette (things to draw from, not phrases to copy): ${family.palette}.${family.rule ? ` Family rule: ${family.rule}` : ''}` : '',
    primary ? `Storytelling DNA (${primary.title}): ${primary.dna} Borrow its structure and feel, never its names, characters or plot.` : ''
  ]
    .filter(Boolean)
    .join('\n');
}
