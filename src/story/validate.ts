/**
 * Checks a story package: the zod schema first, then the graph. The messages are written
 * for whoever fixes the package (ChatGPT through the authoring kit), so each one names
 * the beat, choice or art id and says what to change.
 */
import { Condition, FlagEffect, Story, StorySchema } from './schema';

export interface StoryIssue {
  /** Where the problem is, e.g. "beats.cave.choices.flee". */
  at: string;
  message: string;
}

export interface StoryCheck {
  ok: boolean;
  story?: Story;
  issues: StoryIssue[];
  /** Not errors, but worth a look (an ending nobody can reach easily, unused art). */
  warnings: StoryIssue[];
}

/**
 * Parses and checks a package. `artFiles`, when given, is the list of file names in the
 * package's art folder; every art entry must have its file there.
 */
export function checkStory(raw: unknown, artFiles?: string[]): StoryCheck {
  const parsed = StorySchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      issues: parsed.error.issues.map((i) => ({ at: i.path.join('.') || '(root)', message: i.message })),
      warnings: []
    };
  }
  const story = parsed.data;
  const issues: StoryIssue[] = [];
  const warnings: StoryIssue[] = [];
  const err = (at: string, message: string) => issues.push({ at, message });
  const warn = (at: string, message: string) => warnings.push({ at, message });

  const beats = new Map(story.beats.map((b) => [b.id, b]));
  const flagIds = new Set(Object.keys(story.flags));
  const artIds = new Set(Object.keys(story.art));
  const castIds = new Set(story.cast.map((c) => c.id));
  const usedArt = new Set<string>();

  const dupes = (ids: string[], what: string, at: string) => {
    const seen = new Set<string>();
    for (const i of ids) {
      if (seen.has(i)) err(at, `Two ${what} share the id "${i}". Ids must be unique.`);
      seen.add(i);
    }
  };
  dupes(story.beats.map((b) => b.id), 'beats', 'beats');
  dupes(story.cast.map((c) => c.id), 'cast members', 'cast');

  const checkArt = (artId: string | undefined, at: string) => {
    if (!artId) return;
    usedArt.add(artId);
    if (!artIds.has(artId)) err(at, `Art "${artId}" is not in the art list. Add it to "art" or fix the id.`);
  };
  const checkCondition = (c: Condition, at: string) => {
    const def = story.flags[c.flag];
    if (!def) return err(at, `Flag "${c.flag}" is not declared in "flags".`);
    if (def.type === 'bool' && c.is === undefined) err(at, `"${c.flag}" is a true/false flag, so test it with "is".`);
    if (def.type === 'counter' && c.is !== undefined) err(at, `"${c.flag}" is a counter, so test it with atLeast, atMost or equals.`);
  };
  const checkEffect = (e: FlagEffect, at: string) => {
    const def = story.flags[e.flag];
    if (!def) return err(at, `Flag "${e.flag}" is not declared in "flags".`);
    if (def.type === 'bool' && typeof e.set !== 'boolean') err(at, `"${e.flag}" is a true/false flag, so use "set": true or false.`);
    if (def.type === 'counter' && typeof e.set === 'boolean') err(at, `"${e.flag}" is a counter, so use "set" with a number or "add".`);
  };

  for (const [fid, def] of Object.entries(story.flags)) {
    if ((def.type === 'bool') !== (typeof def.initial === 'boolean')) err(`flags.${fid}`, `The initial value must match the type (${def.type}).`);
  }

  if (!beats.has(story.start)) err('start', `The start beat "${story.start}" does not exist.`);
  if (beats.get(story.start)?.isEnding) err('start', 'The story cannot start on an ending.');

  if (story.meta.mode === 'character') {
    if (!story.meta.character) err('meta.character', 'A character-mode story names the cast member the player talks with.');
    else if (!castIds.has(story.meta.character)) err('meta.character', `"${story.meta.character}" is not in the cast.`);
  }
  checkArt(story.meta.cover, 'meta.cover');
  checkArt(story.skin.backgroundArt, 'skin.backgroundArt');
  story.cast.forEach((c) => checkArt(c.portrait, `cast.${c.id}.portrait`));

  for (const b of story.beats) {
    const at = `beats.${b.id}`;
    b.goal.forEach((c, i) => checkCondition(c, `${at}.goal.${i}`));
    b.entry.forEach((c, i) => checkCondition(c, `${at}.entry.${i}`));
    dupes(b.choices.map((c) => c.id), 'choices', `${at}.choices`);
    for (const x of b.exits) if (!beats.has(x)) err(`${at}.exits`, `Exit "${x}" is not a beat.`);
    if (b.exits.includes(b.id)) err(`${at}.exits`, 'A beat cannot exit to itself.');

    for (const c of b.choices) {
      c.sets.forEach((e, i) => checkEffect(e, `${at}.choices.${c.id}.sets.${i}`));
      if (c.target && !b.exits.includes(c.target)) err(`${at}.choices.${c.id}`, `Its target "${c.target}" is not in this beat's exits.`);
    }
    for (const [i, cue] of b.artCues.entries()) {
      checkArt(cue.art, `${at}.artCues.${i}`);
      if (cue.on === 'choice' && !b.choices.some((c) => c.id === cue.choice)) err(`${at}.artCues.${i}`, `"on": "choice" needs "choice" set to one of this beat's choice ids.`);
      if (cue.on === 'flag') {
        if (!cue.when) err(`${at}.artCues.${i}`, '"on": "flag" needs a "when" condition.');
        else checkCondition(cue.when, `${at}.artCues.${i}.when`);
      }
    }

    if (b.isEnding) {
      if (b.exits.length) err(`${at}.exits`, 'An ending has no exits.');
      if (b.choices.some((c) => c.target)) err(`${at}.choices`, 'An ending has no choices that lead anywhere.');
    } else {
      if (!b.exits.length) err(`${at}.exits`, 'This beat has no exits and is not an ending, so the player would be stuck. Add exits or mark it isEnding.');
      if (!b.choices.length) err(`${at}.choices`, 'Every beat that is not an ending needs at least one authored choice.');
      // Hard gates must never trap the player: some authored choice has to move each unmet goal flag.
      if (b.goal.length) {
        const moved = new Set(b.choices.flatMap((c) => c.sets.map((e) => e.flag)));
        const stuck = b.goal.filter((g) => !moved.has(g.flag));
        if (stuck.length === b.goal.length) {
          err(`${at}.goal`, `No authored choice here changes ${stuck.map((g) => `"${g.flag}"`).join(', ')}. Add a choice that sets it, so the hard gate cannot trap the player.`);
        } else if (stuck.length) {
          warn(`${at}.goal`, `Only the narrator can set ${stuck.map((g) => `"${g.flag}"`).join(', ')}; consider an authored choice that does.`);
        }
      }
    }
  }

  // Every beat must be reachable from the start, and every non-ending beat must lead to an ending.
  if (beats.has(story.start)) {
    const reached = new Set<string>([story.start]);
    const queue = [story.start];
    while (queue.length) {
      for (const x of beats.get(queue.shift()!)?.exits ?? []) {
        if (beats.has(x) && !reached.has(x)) {
          reached.add(x);
          queue.push(x);
        }
      }
    }
    for (const b of story.beats) if (!reached.has(b.id)) err(`beats.${b.id}`, 'This beat cannot be reached from the start beat. Add it to some beat\'s exits or remove it.');

    const endings = story.beats.filter((b) => b.isEnding);
    if (endings.length < 2) err('beats', `A story needs at least two endings; this one has ${endings.length}.`);
    const reachesEnding = new Set(endings.map((b) => b.id));
    let grew = true;
    while (grew) {
      grew = false;
      for (const b of story.beats) {
        if (!reachesEnding.has(b.id) && b.exits.some((x) => reachesEnding.has(x))) {
          reachesEnding.add(b.id);
          grew = true;
        }
      }
    }
    for (const b of story.beats) if (reached.has(b.id) && !reachesEnding.has(b.id)) err(`beats.${b.id}`, 'No path leads from this beat to an ending (a dead end). Add an exit toward an ending.');
    for (const e of endings) if (!reached.has(e.id)) err(`beats.${e.id}`, 'This ending cannot be reached.');
  }

  for (const a of artIds) if (!usedArt.has(a)) warn(`art.${a}`, 'This art is never shown (no cover, portrait, background or cue uses it).');
  if (artFiles) {
    const files = new Set(artFiles);
    for (const [aid, a] of Object.entries(story.art)) if (!a.url && !files.has(a.file)) err(`art.${aid}`, `The file "${a.file}" is not in the art folder.`);
  }
  for (const f of flagIds) {
    const used = story.beats.some((b) => [...b.goal, ...b.entry].some((c) => c.flag === f) || b.choices.some((c) => c.sets.some((e) => e.flag === f)) || b.artCues.some((c) => c.when?.flag === f));
    if (!used) warn(`flags.${f}`, 'This flag is never tested or set by any beat.');
  }

  return { ok: issues.length === 0, story: issues.length ? undefined : story, issues, warnings };
}

export function formatIssues(check: StoryCheck): string {
  const lines = check.issues.map((i) => `ERROR ${i.at}: ${i.message}`);
  for (const w of check.warnings) lines.push(`warn  ${w.at}: ${w.message}`);
  return lines.join('\n');
}
