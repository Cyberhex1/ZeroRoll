/**
 * What later prompts (Chapter One, turns) carry from the forge record, so the campaign keeps
 * the voice and influences it was built from.
 */
import type { CampaignInspiration, ExperienceCategory, ForgeRecord } from '../types';
import type { SourceDna, StoryFamily } from '../content/forge/types';
import { getCategoryProfile } from '../content';
import { deckFor } from './spread';
import { ENGINES } from '../content/forge/engines';

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

export interface ForgeDisclosure {
  /** "Inspired by The Odyssey and Circe · A long voyage home · a journey with stops" */
  line: string;
  /** What the AI was given, for the StoryCard disclosure. Never the complication or set-pieces. */
  items: { kind: string; text: string }[];
}

/** AGENTS §12 transparency for a forged story; null for stories from before 0.2. */
export function forgeDisclosure(category: ExperienceCategory, forge: ForgeRecord | undefined): ForgeDisclosure | null {
  if (!forge) return null;
  const deck = deckFor(category);
  const dna = (forge.dna ?? []).map((id) => deck.dna.find((d) => d.id === id)).filter((d): d is SourceDna => !!d);
  const titles = dna.length ? dna.map((d) => d.title) : forge.dnaTitles ?? [];
  const engine = ENGINES[forge.engine]?.name;
  const line = [titles.length ? `Inspired by ${titles.join(' and ')}` : '', forge.familyName, engine ?? ''].filter(Boolean).join(' · ');
  const items = [
    { kind: 'Story family', text: forge.familyName },
    ...dna.map((d) => ({ kind: `Influence (${d.medium})`, text: `${d.title}: ${d.dna}` })),
    ...(engine ? [{ kind: 'Plot engine', text: `${engine}: ${ENGINES[forge.engine].drive}` }] : []),
    ...(forge.hook ? [{ kind: 'Hook offered', text: forge.hook }] : []),
    ...(forge.place ? [{ kind: 'Place offered', text: forge.place }] : []),
    { kind: 'Kept from you', text: 'a secret and some big scenes for later' }
  ];
  return { line, items };
}
