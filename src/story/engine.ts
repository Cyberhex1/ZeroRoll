/**
 * The beat engine. Pure functions over a story and a play state, so every rule here is
 * unit-tested and the screen only renders what they return.
 *
 * Beats gate hard: a beat's exits open only when its goal conditions hold. Flags change
 * through authored choices or through flags the narrator reports. The narrator may claim
 * it reached an exit; the engine accepts the claim only when the graph and the gate allow
 * it, and otherwise drops it and says why in the next director block.
 */
import { Beat, Choice, Condition, FlagEffect, Flags, FlagValue, Story } from './schema';

export interface StoryState {
  storyId: string;
  beat: string;
  flags: Flags;
  /** Beats entered this playthrough, in order. */
  visited: string[];
  turnsInBeat: number;
  turns: number;
  /** Set when a playthrough reaches an ending. */
  ending?: string;
  /** Why the narrator's last claim was refused; shown to it once on the next turn. */
  notice?: string;
}

export type EngineEvent =
  | { kind: 'beat'; from: string; to: string; ending: boolean }
  | { kind: 'art'; art: string }
  | { kind: 'flag'; flag: string; value: FlagValue }
  | { kind: 'rejected'; reason: string };

export interface TurnResult {
  state: StoryState;
  events: EngineEvent[];
}

/** What the narrator reports in its structured tail. */
export interface NarratorTail {
  beatReached?: string | null;
  flags?: Record<string, unknown>;
  artCue?: string | null;
  choices?: string[];
}

export function beatOf(story: Story, id: string): Beat {
  const b = story.beats.find((x) => x.id === id);
  if (!b) throw new Error(`Story ${story.meta.id} has no beat "${id}".`);
  return b;
}

export function newState(story: Story): StoryState {
  const flags: Flags = {};
  for (const [k, def] of Object.entries(story.flags)) flags[k] = def.initial;
  return { storyId: story.meta.id, beat: story.start, flags, visited: [story.start], turnsInBeat: 0, turns: 0 };
}

export function holds(c: Condition, flags: Flags): boolean {
  const v = flags[c.flag];
  if (c.is !== undefined) return Boolean(v) === c.is;
  const n = typeof v === 'number' ? v : v ? 1 : 0;
  if (c.atLeast !== undefined && n < c.atLeast) return false;
  if (c.atMost !== undefined && n > c.atMost) return false;
  if (c.equals !== undefined && n !== c.equals) return false;
  return true;
}

export function goalStatus(beat: Beat, flags: Flags): { met: Condition[]; unmet: Condition[]; open: boolean } {
  const met = beat.goal.filter((c) => holds(c, flags));
  const unmet = beat.goal.filter((c) => !holds(c, flags));
  return { met, unmet, open: unmet.length === 0 };
}

/** Exits whose own entry conditions hold. Whether the gate is open is a separate question. */
export function enterableExits(story: Story, beat: Beat, flags: Flags): Beat[] {
  return beat.exits.map((x) => beatOf(story, x)).filter((b) => b.entry.every((c) => holds(c, flags)));
}

/** Why moving from the current beat to `to` is not allowed, or null when it is. */
export function gateRefusal(story: Story, state: StoryState, to: string): string | null {
  const beat = beatOf(story, state.beat);
  if (state.ending) return 'The story has ended.';
  if (!beat.exits.includes(to)) return `"${to}" is not reachable from "${beat.title}".`;
  const target = beatOf(story, to);
  const blocked = target.entry.filter((c) => !holds(c, state.flags));
  if (blocked.length) return `"${target.title}" needs ${blocked.map(describeCondition).join(' and ')} first.`;
  if (story.strictness === 'hard') {
    const { unmet } = goalStatus(beat, state.flags);
    if (unmet.length) return `The goal of "${beat.title}" is not met yet: ${unmet.map(describeCondition).join('; ')}.`;
  }
  return null;
}

export function describeCondition(c: Condition): string {
  if (c.is !== undefined) return c.is ? c.flag : `not ${c.flag}`;
  const parts = [];
  if (c.atLeast !== undefined) parts.push(`${c.flag} at least ${c.atLeast}`);
  if (c.atMost !== undefined) parts.push(`${c.flag} at most ${c.atMost}`);
  if (c.equals !== undefined) parts.push(`${c.flag} = ${c.equals}`);
  return parts.join(', ');
}

function applyEffect(story: Story, flags: Flags, e: FlagEffect): FlagValue | undefined {
  const def = story.flags[e.flag];
  if (!def) return undefined;
  if (def.type === 'bool') return typeof e.set === 'boolean' ? e.set : undefined;
  const cur = typeof flags[e.flag] === 'number' ? (flags[e.flag] as number) : 0;
  if (typeof e.set === 'number') return e.set;
  if (typeof e.add === 'number') return cur + e.add;
  return undefined;
}

/**
 * Turns the narrator's reported flags into effects. Only declared flags count; booleans
 * take true/false, counters take a number, "+N" or "-N".
 */
export function effectsFromNarrator(story: Story, reported: Record<string, unknown> | undefined, current: Record<string, unknown> = {}): FlagEffect[] {
  const out: FlagEffect[] = [];
  for (const [flag, raw] of Object.entries(reported ?? {})) {
    const def = story.flags[flag];
    if (!def) continue;
    if (def.type === 'bool') {
      if (typeof raw === 'boolean') out.push({ flag, set: raw });
      else if (raw === 'true' || raw === 'false') out.push({ flag, set: raw === 'true' });
    } else if (typeof raw === 'number' && Number.isInteger(raw)) {
      // Models restate counters from memory and get them wrong (trust 3 reported as 2), so an
      // absolute number only moves the counter one step toward it; the same number is no change.
      const now = typeof current[flag] === 'number' ? (current[flag] as number) : undefined;
      if (now === undefined) out.push({ flag, set: raw });
      else if (raw !== now) out.push({ flag, add: raw > now ? 1 : -1 });
    } else if (typeof raw === 'string' && /^[+-]\d+$/.test(raw.trim())) {
      out.push({ flag, add: parseInt(raw.trim(), 10) });
    }
  }
  return out;
}

function setFlags(story: Story, state: StoryState, effects: FlagEffect[], events: EngineEvent[]): StoryState {
  const before = state.flags;
  const flags = { ...before };
  for (const e of effects) {
    const v = applyEffect(story, flags, e);
    if (v === undefined || flags[e.flag] === v) continue;
    flags[e.flag] = v;
    events.push({ kind: 'flag', flag: e.flag, value: v });
  }
  if (flags === before) return state;
  // Flag cues fire when their condition starts to hold.
  const beat = beatOf(story, state.beat);
  for (const cue of beat.artCues) {
    if (cue.on === 'flag' && cue.when && holds(cue.when, flags) && !holds(cue.when, before)) events.push({ kind: 'art', art: cue.art });
  }
  return { ...state, flags };
}

function enter(story: Story, state: StoryState, to: string, events: EngineEvent[]): StoryState {
  const target = beatOf(story, to);
  events.push({ kind: 'beat', from: state.beat, to, ending: target.isEnding });
  for (const cue of target.artCues) if (cue.on === 'enter') events.push({ kind: 'art', art: cue.art });
  return {
    ...state,
    beat: to,
    visited: [...state.visited, to],
    turnsInBeat: 0,
    ending: target.isEnding ? to : undefined
  };
}

/**
 * The player picked an authored choice. Its flags apply at once; if it targets an exit and
 * the gate is open, the story moves there before the narrator writes the turn.
 */
export function applyChoice(story: Story, state: StoryState, choiceId: string): TurnResult & { choice?: Choice } {
  const events: EngineEvent[] = [];
  const beat = beatOf(story, state.beat);
  const choice = beat.choices.find((c) => c.id === choiceId);
  if (!choice || state.ending) return { state, events };
  let next = setFlags(story, state, choice.sets, events);
  for (const cue of beat.artCues) if (cue.on === 'choice' && cue.choice === choice.id) events.push({ kind: 'art', art: cue.art });
  if (choice.target) {
    const refusal = gateRefusal(story, next, choice.target);
    if (refusal) {
      events.push({ kind: 'rejected', reason: refusal });
      next = { ...next, notice: `The player chose "${choice.label}", but ${lowerFirst(refusal)} Narrate why it does not work yet.` };
    } else {
      next = enter(story, next, choice.target, events);
    }
  }
  return { state: next, events, choice };
}

/** After the narrator's reply: apply its flags, then check its beat claim against the gate. */
export function applyNarratorTail(story: Story, state: StoryState, tail: NarratorTail): TurnResult {
  const events: EngineEvent[] = [];
  let next: StoryState = { ...state, notice: undefined, turns: state.turns + 1, turnsInBeat: state.turnsInBeat + 1 };
  if (state.ending) return { state: next, events };
  next = setFlags(story, next, effectsFromNarrator(story, tail.flags, next.flags), events);

  // Naming the beat the story is already in is not a move (local models often do this).
  const raw = typeof tail.beatReached === 'string' ? tail.beatReached.trim() : '';
  const claim = raw && raw !== 'none' && raw !== next.beat ? raw : null;
  if (claim) {
    const refusal = gateRefusal(story, next, claim);
    if (refusal) {
      events.push({ kind: 'rejected', reason: refusal });
      next = { ...next, notice: `Your last reply claimed the story reached "${claim}", but ${lowerFirst(refusal)} The story is still in "${beatOf(story, next.beat).title}". Keep playing this beat.` };
    } else {
      next = enter(story, next, claim, events);
    }
  }

  // The narrator may point at a cue authored for the current beat; unknown art is ignored.
  if (tail.artCue && beatOf(story, next.beat).artCues.some((c) => c.art === tail.artCue) && !events.some((e) => e.kind === 'art' && e.art === tail.artCue)) {
    events.push({ kind: 'art', art: tail.artCue });
  }
  return { state: next, events };
}

/** The narrator's offered choices, falling back to the beat's authored ones (at most four). */
export function chipsFor(story: Story, state: StoryState, offered: string[] | undefined): Array<{ label: string; choiceId?: string }> {
  if (state.ending) return [];
  const beat = beatOf(story, state.beat);
  const authored = beat.choices.map((c) => ({ label: c.label, choiceId: c.id }));
  const extra = (offered ?? [])
    .map((s) => (typeof s === 'string' ? s.trim() : ''))
    .filter((s) => s && s.length <= 160 && !authored.some((a) => a.label.toLowerCase() === s.toLowerCase()))
    .map((label) => ({ label }));
  // Authored choices first: they are the ones guaranteed to move the beat's goal.
  return [...authored, ...extra].slice(0, 4);
}

export function restart(story: Story): StoryState {
  return newState(story);
}

function lowerFirst(s: string): string {
  return s ? s[0].toLowerCase() + s.slice(1) : s;
}
