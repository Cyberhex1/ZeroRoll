/**
 * Book mode: a story with written pages plays like a choose-your-own-adventure book, offline
 * and without AI. Each beat's page is shown on entering it, and its authored choices are the
 * buttons. Typing a free action hands that turn to the AI narrator ("going off the rails"), and
 * picking a book choice again goes back to the written pages from wherever the story now is.
 */
import { StoryState, applyChoice, beatOf, holds } from './engine';
import type { Choice, Story } from './schema';
import type { StoryMessage } from '../storage/storyRepository';
import type { PlayerIdentity } from './player';
import { PlaySave, addPlayerInput } from './play';

let seq = 0;
const mid = () => `b${Date.now().toString(36)}-${(seq++).toString(36)}`;

export const BOOK_LABEL = 'Book page';

/** True when every beat has a written page, so the story can be read start to end offline. */
export function hasBook(story: Story): boolean {
  return story.beats.length > 0 && story.beats.every((b) => Boolean(b.page));
}

/** Whether this save reads book pages (the default for a story that has them). */
export function usesBook(story: Story, save: Pick<PlaySave, 'book'>): boolean {
  return hasBook(story) && save.book !== false;
}

/** Puts the player's name into a page. */
export function fillPage(text: string, player?: PlayerIdentity): string {
  return text.replace(/\{name\}/g, player?.name?.trim() || 'you');
}

function wouldPass(story: Story, state: StoryState, c: Choice): boolean {
  return !c.target || applyChoice(story, state, c.id).state.beat === c.target;
}

function alreadyDone(story: Story, state: StoryState, c: Choice): boolean {
  if (c.target || !c.sets.length) return false;
  return c.sets.every((e) => {
    const def = story.flags[e.flag];
    if (!def || e.add !== undefined) return false;
    return def.type === 'bool' ? holds({ flag: e.flag, is: Boolean(e.set) }, state.flags) : state.flags[e.flag] === e.set;
  });
}

/**
 * The book's choices in this beat: the authored ones the player can actually take now.
 * A choice whose way is shut (an ending that needs an earlier discovery) is left out, and a
 * stay-here choice the player already made is not offered again.
 */
export function bookChips(story: Story, state: StoryState): Array<{ label: string; choiceId: string }> {
  if (state.ending) return [];
  const beat = beatOf(story, state.beat);
  const open = beat.choices.filter((c) => wouldPass(story, state, c) && !alreadyDone(story, state, c));
  return open.map((c) => ({ label: c.label, choiceId: c.id }));
}

function pageMessage(story: Story, save: PlaySave, text: string): StoryMessage {
  return { id: mid(), kind: 'narrator', text: fillPage(text, save.player), beat: save.state.beat, answeredBy: BOOK_LABEL, chips: bookChips(story, save.state), at: Date.now() };
}

/** Opens the book: the opening art and the first page. */
export function openBook(story: Story, save: PlaySave): PlaySave {
  const start = beatOf(story, save.state.beat);
  const art: StoryMessage[] = start.artCues
    .filter((c) => c.on === 'enter')
    .map((c) => ({ id: mid(), kind: 'art' as const, art: c.art, beat: start.id, at: Date.now() }));
  const messages = [...save.messages, ...art, pageMessage(story, save, start.page ?? start.sceneBrief)];
  return { ...save, messages, undo: undefined };
}

/** One book turn: the player's choice, then the page it leads to (or what happens if it stays here). */
export function turnBook(story: Story, save: PlaySave, choiceId: string): PlaySave {
  const before = save.state;
  const beat = beatOf(story, before.beat);
  const choice = beat.choices.find((c) => c.id === choiceId);
  const { save: next, events } = addPlayerInput(story, save, { choiceId });
  const state: StoryState = { ...next.state, notice: undefined, turns: next.state.turns + 1, turnsInBeat: next.state.beat === before.beat ? next.state.turnsInBeat + 1 : 0 };
  const moved = state.beat !== before.beat;
  const rejected = events.find((e) => e.kind === 'rejected');
  let text: string;
  if (moved) text = beatOf(story, state.beat).page ?? beatOf(story, state.beat).sceneBrief;
  else if (rejected) text = beat.hint ? `Not yet. ${beat.hint}` : 'That way is not open yet. Try something else first.';
  else text = choice?.outcome ?? `You ${choice ? choice.label[0].toLowerCase() + choice.label.slice(1) : 'wait'}.`;
  const withState = { ...next, state };
  const messages = [...next.messages, pageMessage(story, withState, text)];
  if (state.ending && !before.ending) {
    const end = beatOf(story, state.ending);
    messages.push({ id: mid(), kind: 'note', text: `Ending reached: ${end.endingTitle ?? end.title}`, beat: state.beat, at: Date.now() });
  }
  return { ...withState, messages, undo: undefined };
}

/**
 * Every way through the book by its choices alone, for checks: walks the choice graph from
 * the start and returns the endings reached and any state where no choice is left.
 */
export function walkBook(story: Story, limit = 5000): { endings: Set<string>; stuck: string[] } {
  const endings = new Set<string>();
  const stuck: string[] = [];
  const seen = new Set<string>();
  const start: StoryState = { storyId: story.meta.id, beat: story.start, flags: Object.fromEntries(Object.entries(story.flags).map(([k, d]) => [k, d.initial])), visited: [story.start], turnsInBeat: 0, turns: 0 };
  const queue = [start];
  while (queue.length && seen.size < limit) {
    const s = queue.shift()!;
    const key = `${s.beat}|${JSON.stringify(s.flags)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    if (s.ending) {
      endings.add(s.ending);
      continue;
    }
    const chips = bookChips(story, s);
    if (!chips.length) stuck.push(s.beat);
    for (const c of chips) {
      const r = applyChoice(story, s, c.choiceId);
      if (r.state.beat !== s.beat || JSON.stringify(r.state.flags) !== JSON.stringify(s.flags)) queue.push(r.state);
    }
  }
  return { endings, stuck: [...new Set(stuck)] };
}
