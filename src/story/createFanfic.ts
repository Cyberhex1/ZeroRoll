/**
 * "Create your own fanfic" (ohnna, 2026-11-26): the player names a work (a game, show, anime,
 * book...) and the AI writes a whole branching Story mode story set in it, in the same format
 * as the pre-written ones (src/story/schema.ts), so it plays the same way.
 *
 * Calls, in the style of the setup master prompt (src/setup/masterPrompt.ts on PR #26):
 *   1. the writer ('story' tier, the player's story model) writes the story as JSON;
 *   2. the code checks it (checkStory); if the beat graph is broken, the writer gets one
 *      rewrite with the list of problems;
 *   3. the story check ('check' tier) reads the prompt and the story and says whether the
 *      story follows the prompt and makes sense; if not, one rewrite with its notes.
 * Any failure throws a player-facing Error. There is no stand-in story.
 */
import { CATEGORY_IDS } from '../content/categoryIds';
import { getContent } from '../content';
import { OVERUSED_NAMES } from '../content/names';
import { executeUniversalPrompt, parseJsonReply } from '../lib/geminiService';
import { Medium, MEDIUMS, Story } from './schema';
import { StoryIssue, checkStory, formatIssues } from './validate';
import { MEDIUM_NAMES } from './prompt';

export interface FanficRequest {
  /** What the player typed, e.g. "Baldur's Gate 3". */
  media: string;
  /** The player's pick, or undefined for "not sure". */
  medium?: Medium;
  /** Optional: what the player wants the story to be about. */
  idea?: string;
  rating: Story['meta']['rating'];
  signal?: AbortSignal;
  /** Progress lines for the screen. */
  onStep?: (step: FanficStep) => void;
}

export type FanficStep = 'writing' | 'fixing' | 'checking' | 'revising' | 'saving';

/** A whole story is long: give the writer most of the turn deadline. */
const WRITE_TIMEOUT_MS = 170_000;
const WRITE_MAX_TOKENS = 32_000;

const RATING_LINES: Record<Story['meta']['rating'], string> = {
  everyone: 'Rating: everyone. Nothing graphic: danger and conflict are fine, gore, sex and cruelty are not.',
  teen: 'Rating: teen. Violence, fear and romance can be on the page, but nothing graphic or sexual.',
  mature: 'Rating: mature. Adult themes, violence and romance are allowed, written with care; no sexual content involving anyone under 18, ever.'
};

export const PLAIN_WRITING =
  'Write like a good human novelist, not like an AI. Use plain, specific words and avoid the stock phrases and flowery filler AI writing is known for. Give new people names that real people in this world would have, never the names AI models reach for by habit.';

function workName(req: Pick<FanficRequest, 'media' | 'medium'>): string {
  return req.medium ? `${req.media.trim()} (${MEDIUM_NAMES[req.medium]})` : req.media.trim();
}

const CATEGORY_LIST = () => CATEGORY_IDS.map((id) => `${id} (${getContent(id).card.name})`).join(', ');

const SHAPE = `{
  "meta": { "title": "…", "category": "<one id from the list>", "blurb": "…", "source": { "title": "<the work's usual name>", "medium": "<${MEDIUMS.join('|')}>", "owner": "<who owns it>" } },
  "world": "…",
  "tone": "…",
  "playerRole": "…",
  "narratorStyle": "…",
  "cast": [{ "id": "…", "name": "…", "appearance": "…", "voice": "…", "stance": "…" }],
  "flags": { "<flag_id>": { "type": "bool", "initial": false, "description": "…" }, "<counter_id>": { "type": "counter", "initial": 0, "description": "…" } },
  "start": "<beat id>",
  "beats": [{
    "id": "…", "title": "…", "sceneBrief": "…",
    "goal": [{ "flag": "<flag_id>", "is": true }],
    "entry": [],
    "choices": [{ "id": "…", "label": "…", "target": "<one of this beat's exits>", "sets": [{ "flag": "<flag_id>", "set": true }] }],
    "exits": ["<beat id>"],
    "hint": "…",
    "isEnding": false
  }, {
    "id": "…", "title": "…", "sceneBrief": "…", "isEnding": true, "endingTitle": "…", "goal": [], "entry": [{ "flag": "<counter_id>", "atLeast": 2 }], "choices": [], "exits": []
  }]
}`;

/** The writer's prompt. */
export function fanficWriterPrompt(req: FanficRequest): string {
  const work = workName(req);
  return `You are the writer of a choose-your-own-adventure story for ZeroRoll, played one-on-one by a single player, with an AI narrator who runs each scene from your plan.

Today your player asked for fan fiction set in ${work}.${req.idea?.trim() ? `\nWhat they would like it to be about: """${req.idea.trim().slice(0, 600)}"""` : ''}
Use what fans know of it: its world, rules, places, tone, and how its characters look, talk and act. Canon characters may appear and must stay true to who they are. The player is a new character in that world and this is a new story of your own: never retell the original's plot, and never quote its dialogue or song lyrics.
If you do not know ${req.media.trim()} well enough to write it faithfully, reply only with {"unknown": true, "reason": "<one sentence>"}.

${RATING_LINES[req.rating]}
${PLAIN_WRITING}
Never use these names AI models overuse: ${OVERUSED_NAMES.join(', ')}.

HOW THE STORY WORKS
- Beats are the fixed moments of the story. Inside a beat the player can do anything; they leave only through its exits.
- A beat's goal is a list of flag conditions. Its exits stay closed until every condition holds, and the narrator steers toward them.
- Flags are the story's memory: "bool" (true/false, tested with "is") or "counter" (a number, tested with atLeast, atMost or equals; changed with "set" or "add").
- Choices are the options the player sees. Each sets flags and can move to one of the beat's exits ("target").
- Every beat that is not an ending has 2 to 4 choices, at least one exit, and at least one choice that makes its goal true.
- Endings have "isEnding": true, an endingTitle, and no exits or choices. "entry" conditions on an ending (or on the beat before it) make the ending depend on what the player did earlier.
- Every beat can be reached from the start, and every path reaches an ending.
- Every beat keeps at least one exit with no entry conditions, so the player can never be stuck.

WHAT TO WRITE
- meta.title: one to five words. meta.blurb: two or three sentences, like the back of a book; no spoilers.
- meta.category: the genre that fits best, one of: ${CATEGORY_LIST()}.
- meta.source: the work's usual name, its kind, and who owns it.
- world: one paragraph the narrator keeps in mind, including the secret that drives the story.
- tone and narratorStyle: a sentence or two each.
- playerRole: who the player is in this world and what they carry. Their name and pronouns are given when they start, so never name them or fix their gender here.
- cast: 2 to 4 people (canon or new), each with an appearance that never changes (hair, eyes, build, clothes), a voice, and their stance toward the player.
- beats: 8 to 11 in all, with at least one real branch where a choice changes which beat comes next, and 2 or 3 endings that differ because of earlier choices. Each sceneBrief tells the narrator what happens and what the player does not know yet.
- Ids are lowercase letters, digits and underscores.

Reply with only this JSON:
${SHAPE}`;
}

/** The second read: did the writer follow the prompt, and does the story make sense? */
export function fanficCheckPrompt(writerPrompt: string, storyJson: string): string {
  return `You are checking a story another writer wrote for ZeroRoll. Below are the writer's instructions and the story they sent back.

Say whether the story follows the instructions and makes sense as a story. Only flag real problems a player would notice:
- it retells the original work's plot, quotes it, or gets its world or canon characters wrong;
- it ignores the player's request or the rating;
- the plan contradicts itself, a choice leads somewhere that does not follow, or an ending does not fit the path that reaches it;
- the player is named or given a fixed gender in playerRole;
- stock AI names or phrasing.

Reply with only {"ok": true} or {"ok": false, "problems": ["<a specific problem and how to fix it>", "…"]}.

THE WRITER'S INSTRUCTIONS
${writerPrompt}

THE STORY
${storyJson}`;
}

function fixPrompt(writerPrompt: string, storyJson: string, problems: string): string {
  return `${writerPrompt}

You already wrote the story below, but it has these problems:
${problems}

Fix every problem and change nothing else. Reply with only the whole corrected JSON.

YOUR STORY
${storyJson}`;
}

/** A unique id from the title. */
export function fanficId(title: string, now = Date.now()): string {
  const slug = title.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'fanfic';
  return `my-${slug}-${now.toString(36)}`.slice(0, 64);
}

/**
 * Turns the writer's JSON into a full package: fixed fields the player chose, no art, and
 * this device's id. The schema and graph are checked after this.
 */
export function shapeFanfic(raw: any, req: FanficRequest, id: string): unknown {
  const v = raw && typeof raw === 'object' ? raw : {};
  const meta = v.meta && typeof v.meta === 'object' ? v.meta : {};
  const source = meta.source && typeof meta.source === 'object' ? meta.source : {};
  const medium = req.medium ?? (MEDIUMS.includes(source.medium) ? source.medium : 'game');
  return {
    schemaVersion: 1,
    meta: {
      id,
      title: typeof meta.title === 'string' ? meta.title.slice(0, 80) : meta.title,
      category: meta.category,
      rating: req.rating,
      mode: 'story',
      blurb: meta.blurb,
      author: 'You, with Create your own fanfic',
      source: {
        title: (typeof source.title === 'string' && source.title.trim() ? source.title.trim() : req.media.trim()).slice(0, 80),
        medium,
        ...(typeof source.owner === 'string' && source.owner.trim() ? { owner: source.owner.trim().slice(0, 80) } : {})
      },
      created: true
    },
    world: v.world,
    tone: v.tone,
    playerRole: v.playerRole,
    lengthTarget: 'medium',
    narratorStyle: v.narratorStyle,
    strictness: 'hard',
    hintAfterTurns: 5,
    // No art in a story made on the device: drop any portraits or cues the writer invented.
    cast: Array.isArray(v.cast) ? v.cast.map((c: any) => (c && typeof c === 'object' ? { id: c.id, name: c.name, appearance: c.appearance, voice: c.voice, stance: c.stance } : c)) : v.cast,
    flags: v.flags,
    start: v.start,
    beats: Array.isArray(v.beats) ? v.beats.map((b: any) => (b && typeof b === 'object' ? { ...b, artCues: [] } : b)) : v.beats,
    art: {},
    skin: {}
  };
}

/**
 * Beats whose every exit has entry conditions. Hand-written stories use that on purpose (a route
 * counter the goal always sets), but in a story written in one go it is how players get stuck,
 * so the writer is told to avoid it and gets one fix when it happens anyway.
 */
export function trappedBeats(story: unknown): StoryIssue[] {
  const beats: any[] = Array.isArray((story as any)?.beats) ? (story as any).beats : [];
  const byId = new Map(beats.map((b) => [b?.id, b]));
  return beats
    .filter((b) => b && !b.isEnding && Array.isArray(b.exits) && b.exits.length && b.exits.every((x: string) => (byId.get(x)?.entry?.length ?? 0) > 0))
    .map((b) => ({ at: `beats.${b.id}.exits`, message: 'Every exit has entry conditions, so a player who met none of them is stuck. Leave at least one exit with no entry conditions.' }));
}

function parse(raw: string): any {
  try {
    return parseJsonReply(raw);
  } catch {
    throw new Error('The AI sent something that was not a story, so nothing was saved. Try again.');
  }
}

/** Writes, checks and returns a new fan fiction story. Throws a player-facing Error on failure. */
export async function createFanfic(req: FanficRequest): Promise<Story> {
  if (!req.media.trim()) throw new Error('Name the game, show, anime or book first.');
  const prompt = fanficWriterPrompt(req);
  const id = fanficId(req.media);
  const call = (userPrompt: string, tier: 'story' | 'check') =>
    executeUniversalPrompt({
      userPrompt,
      tier,
      responseJson: true,
      temperature: tier === 'story' ? 0.9 : 0.2,
      maxTokens: tier === 'story' ? WRITE_MAX_TOKENS : 4096,
      timeoutMs: tier === 'story' ? WRITE_TIMEOUT_MS : undefined,
      feature: 'Create your own fanfic',
      signal: req.signal
    });

  req.onStep?.('writing');
  let reply = parse(await call(prompt, 'story'));
  if (reply?.unknown) throw new Error(`The AI says it doesn't know ${req.media.trim()} well enough to write it: ${String(reply.reason ?? 'no reason given')}`);

  let shaped = shapeFanfic(reply, req, id);
  let check = checkStory(shaped);
  if (!check.ok || trappedBeats(shaped).length) {
    req.onStep?.('fixing');
    reply = parse(await call(fixPrompt(prompt, JSON.stringify(reply), formatIssues({ ...check, warnings: trappedBeats(shaped) })), 'story'));
    shaped = shapeFanfic(reply, req, id);
    check = checkStory(shaped);
    if (!check.ok) throw new Error(`The AI's story still had broken branches after one fix, so nothing was saved. Try again. (${check.issues[0].at}: ${check.issues[0].message})`);
  }

  req.onStep?.('checking');
  const verdict = parse(await call(fanficCheckPrompt(prompt, JSON.stringify(reply)), 'check'));
  const problems: string[] = Array.isArray(verdict?.problems) ? verdict.problems.filter((p: unknown) => typeof p === 'string' && p.trim()) : [];
  if (verdict?.ok === false && problems.length) {
    req.onStep?.('revising');
    const revised = parse(await call(fixPrompt(prompt, JSON.stringify(reply), problems.map((p) => `- ${p}`).join('\n')), 'story'));
    const again = checkStory(shapeFanfic(revised, req, id));
    // A rewrite that breaks the branches is worse than the checked story it replaces.
    if (again.ok) check = again;
  }
  req.onStep?.('saving');
  return check.story!;
}
