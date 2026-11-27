/**
 * Who the player is in a story (ohnna, 2026-11-26): every story asks for a name and pronouns
 * before it starts, so the player is written into it. The last answer is offered again next
 * time, but the question is always asked.
 */
export interface PlayerIdentity {
  name: string;
  /** e.g. "she/her", or what the player typed. */
  pronouns: string;
}

export const PRONOUN_CHOICES = ['she/her', 'he/him', 'they/them'] as const;

const KEY = 'zeroroll_story_player';

export function lastPlayer(): PlayerIdentity | null {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || 'null');
    return v && typeof v.name === 'string' && typeof v.pronouns === 'string' ? { name: v.name, pronouns: v.pronouns } : null;
  } catch {
    return null;
  }
}

export function rememberPlayer(p: PlayerIdentity): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    // private mode: asked again with nothing filled in
  }
}

/** Trims and limits what the player typed. Null when the name is empty. */
export function cleanPlayer(name: string, pronouns: string): PlayerIdentity | null {
  const n = name.replace(/\s+/g, ' ').trim().slice(0, 40);
  const p = pronouns.replace(/\s+/g, ' ').trim().slice(0, 30) || 'they/them';
  return n ? { name: n, pronouns: p } : null;
}

/** The prompt line that writes the player into the story. */
export function playerLine(p: PlayerIdentity | undefined): string {
  if (!p) return '';
  return `The player's character is called ${p.name} and uses ${p.pronouns} pronouns. Everyone in the story calls them ${p.name} and refers to them with those pronouns. This overrides any other name or wording above.`;
}
