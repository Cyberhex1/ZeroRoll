/**
 * The Director (0.2, plan 4.8): deterministic, zero extra calls. Each play turn may carry one
 * short DIRECTOR NOTE for the game master: advance a front when the story stalls, bring back an
 * NPC who has been off-screen with their planned move, steer toward this chapter's set-piece,
 * ask for dialogue or a quiet beat, or close a chapter that has run long.
 *
 * All pure functions. The state lives on the campaign (Experience.director), created lazily, so
 * campaigns from before 0.2 (no fronts, no NPC moves, no set-pieces) simply never get those notes.
 */
import type { Experience } from '../types';
import { DEFAULT_CHAPTERS } from '../dnd/applyTurn';
import { contentWords, escapeRegex } from './words';

export type DirectorNoteKind = 'chapter_close' | 'front' | 'npc' | 'set_piece' | 'dialogue' | 'quiet';

export interface DirectorState {
  v: 1;
  /** Next portent index per front. */
  frontStep: number[];
  /** Turn each front last moved (or the turn the state was created). */
  frontMovedTurn: number[];
  /** Set-piece index (as a string key) to times offered. */
  setPieceOffers: Record<string, number>;
  setPiecesUsed: number[];
  /** NPC name to the last turn a DM reply mentioned them. */
  npcSeen: Record<string, number>;
  noDialogueStreak: number;
  /** Consecutive turns with a check or HP loss. */
  actionStreak: number;
  lastNoteTurn: number;
  lastNoteKind?: DirectorNoteKind;
  /** Set-piece index offered in the last note (so a following reply can be matched to it). */
  lastSetPiece?: number;
  /** Front index moved in the last note. */
  lastFront?: number;
}

export interface DirectorNote {
  kind: DirectorNoteKind;
  text: string;
  /** Which front, NPC or set-piece the note is about. */
  ref?: number | string;
}

/** Thresholds (plan 4.8); one file, so they are easy to tune if the Director feels pushy. */
export const CHAPTER_LONG_TURNS = 12;
export const FRONT_IDLE_TURNS = 5;
export const NPC_IDLE_TURNS = 6;
export const NPC_FIRST_TURN = 4;
export const SET_PIECE_TURNS = [4, 8];
export const SET_PIECE_MAX_OFFERS = 2;
export const DIALOGUE_STREAK = 3;
export const ACTION_STREAK = 3;
export const SET_PIECE_MATCH = 0.35;

const PREFIX = 'DIRECTOR NOTE (for this turn; never mention it):';

type DirectorExp = Pick<Experience, 'storyOutline' | 'gameWorldState' | 'director'>;

export function initialDirector(exp: Pick<Experience, 'storyOutline'>, turn = 0): DirectorState {
  const fronts = exp.storyOutline?.fronts ?? [];
  return {
    v: 1,
    frontStep: fronts.map(() => 0),
    frontMovedTurn: fronts.map(() => turn),
    setPieceOffers: {},
    setPiecesUsed: [],
    npcSeen: {},
    noDialogueStreak: 0,
    actionStreak: 0,
    lastNoteTurn: -10
  };
}

/** The campaign's director state, created from the outline on first use (`turn`: when the book started). */
export function ensureDirector(exp: Pick<Experience, 'storyOutline' | 'director'>, turn = 0): DirectorState {
  const d = exp.director;
  if (d && d.v === 1) {
    const n = exp.storyOutline?.fronts?.length ?? 0;
    // An outline that grew fronts (or lost them) since the state was made: keep it in step.
    if (d.frontStep.length === n) return d;
    return { ...d, frontStep: Array.from({ length: n }, (_, i) => d.frontStep[i] ?? 0), frontMovedTurn: Array.from({ length: n }, (_, i) => d.frontMovedTurn[i] ?? turn) };
  }
  return initialDirector(exp, turn);
}

/** The highest portent a front may reach in this chapter: fronts escalate with the story, not ahead of it. */
export function maxPortentStep(portents: number, chapter: number, total: number): number {
  return Math.ceil((portents * Math.min(chapter, total)) / Math.max(1, total)) - 1;
}

function npcMentioned(name: string, text: string): boolean {
  const parts = name.replace(/^(?:dr|doctor|captain|lady|lord|sir|madam|mother|father|brother|sister|old)\.?\s+/i, '').split(/\s+/).filter((p) => p.length > 2);
  return parts.some((p) => new RegExp(`\\b${escapeRegex(p)}\\b`).test(text));
}

export function hasDialogue(text: string): boolean {
  return (text.match(/["“”]/g) ?? []).length >= 2;
}

/** True when 35% or more of a set-piece's content words appear in the reply. */
export function setPieceHit(setPiece: string, reply: string): boolean {
  const want = contentWords(setPiece);
  if (!want.size) return false;
  const have = contentWords(reply);
  let n = 0;
  for (const w of want) if (have.has(w)) n++;
  return n / want.size >= SET_PIECE_MATCH;
}

/**
 * At most one note per turn; first match wins. Never on turn 1, and never on the turn right
 * after a note unless the chapter has run long.
 */
export function directorNote(exp: DirectorExp, turn: number): DirectorNote | null {
  const o = exp.storyOutline;
  if (!o || turn <= 1) return null;
  const d = ensureDirector(exp, exp.gameWorldState?.chapterStartedTurn ?? 0);
  const chapter = exp.gameWorldState?.currentChapter ?? 1;
  const total = o.chapters?.length || DEFAULT_CHAPTERS;
  const inChapter = turn - (exp.gameWorldState?.chapterStartedTurn ?? 0);
  const finalChapter = chapter >= total;

  // 1. A chapter that has run long.
  if (inChapter >= CHAPTER_LONG_TURNS && turn - d.lastNoteTurn >= 3) {
    return {
      kind: 'chapter_close',
      text: finalChapter
        ? `${PREFIX} This chapter has run long. Bring its question to a head within a turn or two, then end the story with a story_conclusion COURSE_TRIGGER once it is resolved.`
        : `${PREFIX} This chapter has run long. Bring its question to a head within a turn or two, then close it with a chapter_transition COURSE_TRIGGER.`
    };
  }
  if (turn - d.lastNoteTurn <= 1) return null;

  // 2. A front that has waited too long moves, within the pacing cap.
  const fronts = o.fronts ?? [];
  let best = -1;
  for (let i = 0; i < fronts.length; i++) {
    const step = d.frontStep[i] ?? 0;
    const portents = fronts[i].portents ?? [];
    if (step >= portents.length || step > maxPortentStep(portents.length, chapter, total)) continue;
    if (turn - (d.frontMovedTurn[i] ?? 0) < FRONT_IDLE_TURNS) continue;
    if (best === -1 || (d.frontMovedTurn[i] ?? 0) < (d.frontMovedTurn[best] ?? 0)) best = i;
  }
  if (best !== -1) {
    const f = fronts[best];
    return { kind: 'front', ref: best, text: `${PREFIX} Off-screen, a pressure in this story moves (${f.agenda.replace(/[.\s]+$/, '')}): ${f.portents[d.frontStep[best] ?? 0]} Let the hero notice it in this reply through a sign, a rumor or a consequence, in plain story words (the pressure has no name in the story). Do not resolve it.` };
  }

  // 3. An NPC with a planned move who has been off-screen.
  const npcs = (o.keyNpcs ?? []).filter((n) => n.move?.trim());
  let stalest: { name: string; seen: number } | null = null;
  for (const n of npcs) {
    const seen = d.npcSeen[n.name];
    const idle = seen === undefined ? (turn >= NPC_FIRST_TURN ? Infinity : -1) : turn - seen;
    if (idle < NPC_IDLE_TURNS) continue;
    const key = seen ?? -1;
    if (!stalest || key < stalest.seen) stalest = { name: n.name, seen: key };
  }
  if (stalest) {
    const n = npcs.find((x) => x.name === stalest!.name)!;
    return { kind: 'npc', ref: n.name, text: `${PREFIX} ${n.name}${n.role ? `, ${n.role},` : ''} acts on what they want: ${n.move!.replace(/\.?\s*$/, '.')} Bring them into this scene, or let the hero hear of it.` };
  }

  // 4. This chapter's big scene, offered at turns 4 and 8 of the chapter.
  const pieces = o.setPieces ?? [];
  if (pieces.length && SET_PIECE_TURNS.includes(inChapter)) {
    const usedThisChapter = d.setPiecesUsed.some((i) => i === Math.min(chapter - 1, pieces.length - 1));
    if (!usedThisChapter) {
      const start = Math.min(chapter - 1, pieces.length - 1);
      for (let k = start; k < pieces.length; k++) {
        if (d.setPiecesUsed.includes(k) || (d.setPieceOffers[String(k)] ?? 0) >= SET_PIECE_MAX_OFFERS) continue;
        return { kind: 'set_piece', ref: k, text: `${PREFIX} Build toward a big scene like this one in this chapter, when it fits the player's choices (not necessarily this turn): ${pieces[k]}` };
      }
    }
  }

  // 5. Dialogue, then 6. a quiet beat.
  if (d.noDialogueStreak >= DIALOGUE_STREAK) {
    return { kind: 'dialogue', text: `${PREFIX} Nobody has spoken aloud for a while. Put a short exchange of dialogue in this scene, in voices that fit the speakers.` };
  }
  if (d.actionStreak >= ACTION_STREAK) {
    return { kind: 'quiet', text: `${PREFIX} The last scenes were all action. Give this one a quiet beat (a meal, a confession, a view, a small kindness) before the next push.` };
  }
  return null;
}

/** The state after a reply: who was seen, which set-piece happened, streaks, and the note issued. */
export function updateDirector(exp: DirectorExp, reply: { text: string; check: boolean; hpDelta: number }, turn: number, note: DirectorNote | null): DirectorState {
  const o = exp.storyOutline;
  const d = ensureDirector(exp, exp.gameWorldState?.chapterStartedTurn ?? 0);
  const npcSeen = { ...d.npcSeen };
  for (const n of o?.keyNpcs ?? []) if (npcMentioned(n.name, reply.text)) npcSeen[n.name] = turn;

  const frontStep = [...d.frontStep];
  const frontMovedTurn = [...d.frontMovedTurn];
  if (note?.kind === 'front' && typeof note.ref === 'number') {
    frontStep[note.ref] = (frontStep[note.ref] ?? 0) + 1;
    frontMovedTurn[note.ref] = turn;
  }
  const setPieceOffers = { ...d.setPieceOffers };
  if (note?.kind === 'set_piece' && typeof note.ref === 'number') setPieceOffers[String(note.ref)] = (setPieceOffers[String(note.ref)] ?? 0) + 1;
  const setPiecesUsed = [...d.setPiecesUsed];
  (o?.setPieces ?? []).forEach((p, i) => {
    if (!setPiecesUsed.includes(i) && setPieceHit(p, reply.text)) setPiecesUsed.push(i);
  });

  return {
    ...d,
    frontStep,
    frontMovedTurn,
    setPieceOffers,
    setPiecesUsed,
    npcSeen,
    noDialogueStreak: hasDialogue(reply.text) ? 0 : d.noDialogueStreak + 1,
    actionStreak: reply.check || reply.hpDelta < 0 ? d.actionStreak + 1 : 0,
    ...(note ? { lastNoteTurn: turn, lastNoteKind: note.kind } : {})
  };
}
