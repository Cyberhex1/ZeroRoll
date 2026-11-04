/**
 * Book Two (and later books) continue inside the same campaign save (S11, S12): the
 * finished book becomes a pinned memory entry, the scenario generator writes a new arc
 * from that recap and the hero as they stand, and a Chapter One scene opens the new book.
 */
import { uid } from '../lib/ids';
import { generateChapterOneAI, generateScenarioAI } from '../lib/geminiService';
import { addEntry } from '../memory/memoryStore';
import type { Experience, LogMessage } from '../types';
import { experienceMemory } from './memory';

const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

/** What happened in the book that just ended, for the new arc and the memory list. */
export function bookRecap(exp: Experience): string {
  const memory = experienceMemory(exp);
  const lastDm = [...exp.logs].reverse().find((l) => l.sender === 'dm')?.text ?? '';
  const outline = exp.storyOutline;
  const parts = [
    memory.summary ? `Story so far: ${clip(memory.summary, 1800)}` : '',
    outline?.chapters?.length ? `Chapters played: ${outline.chapters.join(' | ')}` : '',
    memory.entries.length ? `Facts: ${memory.entries.slice(-15).map((e) => e.text).join('; ')}` : '',
    lastDm ? `How it ended: ${clip(lastDm, 900)}` : ''
  ];
  return parts.filter(Boolean).join('\n');
}

export function nextBookPrompt(exp: Experience): string {
  const book = (exp.book ?? 1) + 1;
  const c = exp.character;
  return [
    `Start Book ${book} of this campaign. It continues the same story with the same hero; it is not a new campaign.`,
    exp.concluded?.reason === 'death' ? 'Book One ended with the hero falling; open with how they survived or were brought back, and what it cost.' : '',
    `RECAP OF THE BOOK THAT ENDED\n${bookRecap(exp)}`,
    `THE HERO NOW: ${c.name}, level ${c.level} ${c.raceOrigin} ${c.roleClass}. Carrying: ${(c.inventory ?? []).map((i) => i.name).join(', ') || 'nothing'}.`,
    'Write a new arc that follows from how the last book ended, with new chapters and a new immediate goal. Keep established names, places and relationships.'
  ]
    .filter(Boolean)
    .join('\n\n');
}

/** The continued campaign: same id, new outline and Chapter One, the old book pinned in memory. */
export async function continueToNextBook(exp: Experience, model: string): Promise<Experience> {
  const book = (exp.book ?? 1) + 1;
  const { scenario } = await generateScenarioAI({
    category: exp.category,
    model,
    userPrompt: nextBookPrompt(exp),
    gender: exp.character.gender || 'they/them',
    characterName: exp.character.name,
    classRole: exp.character.roleClass,
    raceOrigin: exp.character.raceOrigin,
    inspiration: exp.inspiration,
    // A new book must continue this story; never substitute a random procedural one.
    allowFallback: false
  });
  // Between books the hero recovers (S12: HP 0 never carries into a new book).
  const character = { ...exp.character, hp: exp.character.maxHp, deathSaves: undefined };
  const opening = await generateChapterOneAI({
    category: exp.category,
    storyBlurb: scenario.storyBlurb || '',
    storyOutline: scenario.storyOutline,
    characterState: character,
    model,
    inspiration: exp.inspiration
  });
  const now = new Date().toISOString();
  const memory = addEntry(experienceMemory(exp), `Book ${book - 1}: ${clip(bookRecap(exp).replace(/\n/g, ' '), 380)}`, exp.logs.length, 'state', true);
  const divider: LogMessage = { id: `msg_${uid()}`, sender: 'system', text: `📖 Book ${book} begins. ${character.name} has rested and recovered.`, timestamp: now };
  const chapterOne: LogMessage = {
    id: `msg_${uid()}`,
    sender: 'dm',
    text: opening.text || scenario.storyBlurb || 'A new chapter in your legend begins...',
    timestamp: now,
    modelUsed: opening.modelUsed,
    suggestedActions: opening.suggestedActions?.length ? opening.suggestedActions : scenario.suggestedActions
  };
  return {
    ...exp,
    book,
    character,
    storyOutline: scenario.storyOutline ?? exp.storyOutline,
    description: scenario.storyBlurb || exp.description,
    gameWorldState: {
      ...exp.gameWorldState,
      currentChapter: 1,
      activeQuest: scenario.storyOutline?.immediateGoal || exp.gameWorldState.activeQuest,
      customNotes: scenario.storyOutline?.backstory || exp.gameWorldState.customNotes
    },
    memory,
    logs: [...exp.logs, divider, chapterOne],
    concluded: null,
    activeAlert: null,
    pendingCheck: null,
    updatedAt: now
  };
}
