/** Names models overuse until they feel like stock characters (ohnna, 2026-11-04). */
export const OVERUSED_NAMES: readonly string[] = [
  'Sloane', 'Vance', 'Thorne', 'Kael', 'Elara', 'Lyra', 'Seraphina', 'Aria', 'Kira', 'Rowan', 'Silas', 'Elias',
  'Zephyr', 'Raven', 'Nyx', 'Ash', 'Sterling', 'Voss', 'Blackwood', 'Ravenwood', 'Nightshade', 'Calloway', 'Hayes',
  'Kane', 'Cross', 'Raine', 'Jax', 'Ezra', 'Nova', 'Sable', 'Marcus', 'Aurelius', 'Reyes', 'Valerius', 'Draven',
  'Lysander', 'Isolde', 'Cassian', 'Evelyn', 'Mara', 'Finn', 'Orion', 'Selene', 'Vale', 'Wren',
  // Seen again in the 2026-11-05 D&D playtest.
  'Vane', 'Sinclair', 'Mercer', 'Blackwell', 'Shadowcloak', 'Thistle', 'Quicksilver'
];

const OVERUSED = new Set(OVERUSED_NAMES.map((n) => n.toLowerCase()));

/** False for a name (or any part of one) that is on the overused list. */
export function isFreshName(name: string): boolean {
  return !name.split(/[\s-]+/).some((part) => OVERUSED.has(part.toLowerCase()));
}

/**
 * First names in the content that read as clearly feminine or masculine, so an offline
 * draft's name matches the pronouns picked (playtest B9, D17). Anything else is neutral.
 */
const FEMININE = new Set(`Ada Ailbhe Althea Amara Astra Astraea Astrid Aurelia Beatrice Beatrix Camille Cecilia Chloe Claire Clara Cora
Decima Devika Echo Eleanor Elena Elodie Emily Etta Evelyn Fenna Freya Genevieve Hana Hannah Hazel Helena Hervor Hrafna Imani Ines
Ione Iphigenia Isabeau Kassandra Kiki Klea Leah Leontia Lucia Lulu Luma Lyra Lysippe Mara Maya Merit Mimi Miriam Morwenna Myrine
Naomi Nessa Nova Orlaith Penelope Petra Priya Qiao Rachel Rhea Rosalind Ruelle Sabela Sabine Salma Sarah Selma Seraphina Serena
Sienna Sigrun Solana Solveig Sophie Talia Tara Tessa Thaleia Thalia Tomoe Valerie Vela Vera Vespera Victoria Vivian Vivienne
Zaynab Isolde Selene Elara Aria Kira Raine`.toLowerCase().split(/\s+/));
const MASCULINE = new Set(`Alexander Alexios Anhur Anik Arthur Aurelius Barnaby Basil Boone Bram Branoc Caleb Cassian Cassius Ciaran Cole
Corin Damian Dante Darian Daro David Dax Demetrius Diores Edmund Edward Eirik Eldrin Elian Eliot Elliot Eno Finnian Garrick Gideon
Jack Jax Julian Kaelen Kairo Kareem Kenjiro Ketil Leonidas Liam Lucas Lucian Marco Marcus Martin Mateo Matteo Melanthos Nikandros
Nikolaos Nilo Oliver Orion Orren Oswin Owen Perseus Phaidros Quillan Rafi Roland Rust Sebastian Sevran Sigurd Silas Theron Thoran
Thomas Tobias Toby Tomaz Torin Torstein Valerius Vance Yusuf Zane Kael Elias Lysander Draven Ezra Finn`.toLowerCase().split(/\s+/));

const TITLES = /^(dr|doctor|captain|capt|officer|nurse|professor|prof|sergeant|sgt|sir|lady|lord|madam|mr|mrs|ms|miss)\.?$/i;

/** The given name in "Dr. Evelyn Hart" or "Captain Ramos": the first word that isn't a title. */
export function givenName(full: string): string {
  return full.trim().split(/\s+/).find((w) => !TITLES.test(w)) ?? '';
}

/** 'she', 'he' or undefined for they/them and custom pronouns. */
export function pronounGender(pronouns?: string): 'she' | 'he' | undefined {
  const p = (pronouns ?? '').toLowerCase();
  if (/^she\b/.test(p)) return 'she';
  if (/^he\b/.test(p)) return 'he';
  return undefined;
}

/** False when the name reads as the other gender from the pronouns; neutral names fit any. */
export function nameFitsPronouns(full: string, pronouns?: string): boolean {
  const g = pronounGender(pronouns);
  const n = givenName(full).toLowerCase();
  if (!g || !n) return true;
  return g === 'she' ? !MASCULINE.has(n) : !FEMININE.has(n);
}
