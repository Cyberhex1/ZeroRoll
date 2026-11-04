/**
 * Prompts for Story mode: the story bible (system prompt), the per-turn director block,
 * and the parser for the narrator's structured tail. Local models get a shorter, more
 * directive variant because 12B models follow short lists better than long prose.
 */
import { NarratorTail, StoryState, beatOf, describeCondition, enterableExits, goalStatus } from './engine';
import { Story } from './schema';

export type PromptVariant = 'full' | 'compact';

export const LENGTH_WORDS = { short: 90, medium: 180, long: 320 } as const;

/** Reply length in words for the slider value (0 to 2) or the story's default. */
export function targetWords(story: Story, slider?: number): number {
  const keys = ['short', 'medium', 'long'] as const;
  return LENGTH_WORDS[slider === undefined ? story.lengthTarget : keys[Math.max(0, Math.min(2, Math.round(slider)))]];
}

function castLines(story: Story): string[] {
  return story.cast.map((c) => `- ${c.name}: ${c.appearance} Voice: ${c.voice} Toward the player: ${c.stance}`);
}

function flagLines(story: Story, state: StoryState): string[] {
  return Object.entries(story.flags).map(([k, def]) => `- ${k} = ${JSON.stringify(state.flags[k])} (${def.description})`);
}

const TAIL_SPEC = [
  'After the narration, end every reply with one fenced JSON block and nothing after it:',
  '```json',
  '{"beatReached": "<exit beat id or none>", "flags": {"<flag>": <true|false|number|"+1">}, "artCue": "<art id or none>", "choices": ["<3 or 4 short options>"]}',
  '```',
  'Report only flags whose value changed this turn. Set beatReached only when the scene has truly arrived at that beat.'
];

/** The fixed part of the prompt: who the narrator is and what the story is. */
export function storySystemPrompt(story: Story, variant: PromptVariant, words: number): string {
  const character = story.meta.mode === 'character' ? story.cast.find((c) => c.id === story.meta.character) : undefined;
  const role = character
    ? `You are ${character.name}, talking with the player in a character story. Speak as ${character.name} in first person and describe only what ${character.name} does and notices.`
    : 'You are the narrator of an interactive story. Write in second person ("you") about the player.';

  if (variant === 'compact') {
    return [
      role,
      `Story: ${story.meta.title}. ${story.world}`,
      `Tone: ${story.tone}`,
      `The player is: ${story.playerRole}`,
      'Cast (keep their looks exactly):',
      ...castLines(story),
      'Rules:',
      `- About ${words} words of story per reply.`,
      '- Never act, speak or decide for the player. End on a moment that asks the player to act.',
      '- Follow the DIRECTOR notes. Do not finish the current beat while its goal is unmet.',
      ...TAIL_SPEC
    ].join('\n');
  }
  return [
    role,
    `This is "${story.meta.title}" (${story.meta.category.replace(/_/g, ' ')}, rated ${story.meta.rating}).`,
    '',
    `WORLD\n${story.world}`,
    `TONE\n${story.tone}`,
    `NARRATOR STYLE\n${story.narratorStyle}`,
    `THE PLAYER\n${story.playerRole}`,
    `CAST (their appearance never changes; reuse these details)\n${castLines(story).join('\n')}`,
    '',
    'HOW TO PLAY',
    `- Write about ${words} words of narration per reply, in vivid, concrete prose.`,
    "- The player's words are authoritative for what the player does. Never act, speak, think or decide for the player.",
    '- Let the player wander, talk, experiment and fail inside the current beat. React to exactly what they did.',
    '- The DIRECTOR block below says what the current beat needs. Steer toward it through the world and the cast, never by forcing the player.',
    '- Never narrate the beat as finished, and never move the story on, while a goal condition is unmet.',
    '- Do not reveal the scene brief outright; let the player discover it.',
    '',
    ...TAIL_SPEC
  ].join('\n');
}

/** The per-turn part: where the story is, what the beat needs and what is reachable. */
export function directorBlock(story: Story, state: StoryState, variant: PromptVariant): string {
  const beat = beatOf(story, state.beat);
  if (state.ending) {
    return `DIRECTOR\nThe story has reached its ending "${beat.endingTitle ?? beat.title}". ${beat.sceneBrief}\nWrite a closing scene. Set beatReached to none and choices to [].`;
  }
  const { met, unmet, open } = goalStatus(beat, state.flags);
  const exits = enterableExits(story, beat, state.flags);
  const hintAfter = beat.hintAfterTurns ?? story.hintAfterTurns;
  const lines = ['DIRECTOR', `Current beat: "${beat.title}" (id ${beat.id}).`, `Scene brief (for you, not the player): ${beat.sceneBrief}`];
  if (beat.goal.length) {
    lines.push(`Goal: ${beat.goal.map(describeCondition).join('; ')}.`);
    if (met.length) lines.push(`Already true: ${met.map(describeCondition).join('; ')}.`);
    if (unmet.length) lines.push(`Still needed: ${unmet.map(describeCondition).join('; ')}.`);
  }
  if (open || story.strictness === 'soft') {
    lines.push(exits.length ? `The story may now move to: ${exits.map((b) => `${b.id} ("${b.title}")`).join(', ')}. Report it in beatReached only when the scene gets there.` : 'No exit is open yet.');
  } else {
    lines.push('The goal is not met, so the story stays in this beat. beatReached must be none.');
  }
  lines.push(`Authored options for this beat: ${beat.choices.map((c) => `"${c.label}"`).join(', ')}. Offer these or close variants as choices.`);
  if (variant === 'full' || Object.keys(story.flags).length <= 8) lines.push('Flags now:', ...flagLines(story, state));
  if (beat.hint && state.turnsInBeat >= hintAfter) lines.push(`The player has spent ${state.turnsInBeat} turns here. Work this hint into the scene, in the fiction: ${beat.hint}`);
  if (state.notice) lines.push(`Correction: ${state.notice}`);
  const arts = beat.artCues.map((c) => c.art);
  if (arts.length) lines.push(`Art you may cue when its moment arrives: ${arts.join(', ')}.`);
  return lines.join('\n');
}

/**
 * Splits a reply into narration and the structured tail. Accepts a fenced ```json block,
 * a bare JSON object at the end, or no tail at all (then the tail is empty and the engine
 * treats the turn as narration only).
 */
export function parseNarratorReply(text: string): { narration: string; tail: NarratorTail } {
  const fenced = [...text.matchAll(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/gi)].pop();
  if (fenced) {
    const tail = safeTail(fenced[1]);
    if (tail) return { narration: (text.slice(0, fenced.index) + text.slice(fenced.index! + fenced[0].length)).trim(), tail };
  }
  const start = lastTopLevelObjectStart(text);
  if (start >= 0) {
    const tail = safeTail(text.slice(start));
    if (tail) return { narration: text.slice(0, start).replace(/(STATE|JSON)\s*:?\s*$/i, '').trim(), tail };
  }
  return { narration: text.trim(), tail: {} };
}

function lastTopLevelObjectStart(text: string): number {
  const trimmed = text.trimEnd();
  if (!trimmed.endsWith('}')) return -1;
  let depth = 0;
  let inString = false;
  for (let i = trimmed.length - 1; i >= 0; i--) {
    const ch = trimmed[i];
    if (ch === '"' && trimmed[i - 1] !== '\\') inString = !inString;
    if (inString) continue;
    if (ch === '}') depth++;
    if (ch === '{') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function safeTail(raw: string): NarratorTail | null {
  try {
    const v = JSON.parse(raw.replace(/,\s*([}\]])/g, '$1'));
    if (!v || typeof v !== 'object' || Array.isArray(v)) return null;
    if (!('beatReached' in v || 'flags' in v || 'choices' in v || 'artCue' in v)) return null;
    return {
      beatReached: typeof v.beatReached === 'string' ? v.beatReached : null,
      flags: v.flags && typeof v.flags === 'object' && !Array.isArray(v.flags) ? v.flags : undefined,
      artCue: typeof v.artCue === 'string' && v.artCue !== 'none' ? v.artCue : null,
      choices: Array.isArray(v.choices) ? v.choices.filter((c: unknown): c is string => typeof c === 'string') : undefined
    };
  } catch (_) {
    return null;
  }
}
