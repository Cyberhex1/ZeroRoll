/**
 * Gemini response schemas for the setup menu's calls (structured output; JSON mode elsewhere).
 */
import { STORY_SHAPES } from './storyShape';

export const S = (description?: string) => ({ type: 'STRING', ...(description ? { description } : {}) });
export const LIST = (description?: string) => ({ type: 'ARRAY', items: { type: 'STRING' }, ...(description ? { description } : {}) });
// Bounded so a model can't run away writing one huge number (seen on Flash-Lite, 2026-11-21:
// a quantity of 0000…0001 that used up the output limit and broke the JSON).
export const INT = (minimum: number, maximum: number) => ({ type: 'INTEGER', minimum, maximum });

export const SHEET_SCHEMA = {
  type: 'OBJECT',
  properties: {
    abilityScores: {
      type: 'OBJECT',
      properties: { str: INT(3, 20), dex: INT(3, 20), con: INT(3, 20), int: INT(3, 20), wis: INT(3, 20), cha: INT(3, 20) },
      required: ['str', 'dex', 'con', 'int', 'wis', 'cha']
    },
    skills: LIST('Exactly 4 skill names from the list given'),
    gear: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          name: S(),
          type: { type: 'STRING', enum: ['weapon', 'armor', 'potion', 'scroll', 'relic', 'misc'] },
          quantity: INT(1, 99),
          equipped: { type: 'BOOLEAN' },
          description: S()
        },
        required: ['name', 'type']
      }
    },
    spells: LIST('0 to 4 spells; empty unless the class really casts spells')
  },
  required: ['abilityScores', 'skills', 'gear', 'spells']
};

export const HERO_SCHEMA = {
  type: 'OBJECT',
  properties: { name: S(), roleClass: S(), origin: S(), appearance: S() },
  required: ['name', 'roleClass', 'origin', 'appearance']
};

/** The full story package (0.2: NPC moves, fronts and set-pieces added). */
export const STORY_SCHEMA = {
  type: 'OBJECT',
  properties: {
    title: S(),
    premise: S('3 or 4 sentences to the player as you; only what the hero knows; ends on a question'),
    outline: {
      type: 'OBJECT',
      properties: {
        startingCircumstances: S('Shown as "Where you start": who you are and how your life stands as the premise scene begins. Same time and place as the premise; never an earlier scene'),
        backstory: S(),
        incitingIncident: S(),
        immediateGoal: S('Shown as "Your first goal": what you want in the first scene, true whichever way the premise question is answered; nothing the premise has not set up'),
        keyNpcs: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: { name: S(), role: S(), motivation: S('What they want'), secret: S(), move: S('What they do next if the hero does nothing') },
            required: ['name', 'role', 'motivation', 'secret', 'move']
          }
        },
        fronts: {
          type: 'ARRAY',
          description: '2 pressures that move on their own',
          items: {
            type: 'OBJECT',
            properties: { name: S(), agenda: S(), portents: LIST('3 or 4 escalating signs, in order') },
            required: ['name', 'agenda', 'portents']
          }
        },
        setPieces: LIST('4 big scenes for later chapters'),
        majorConflicts: LIST(),
        secretsAndReveals: LIST(),
        chapters: LIST('4 or 5 chapters; the last resolves the story'),
        potentialEndings: LIST(),
        storyShape: { type: 'STRING', enum: STORY_SHAPES.map((x) => x.id), description: 'Where the player joins the arc' },
        turningPoint: S('The defining event the story builds to, and the chapter where it lands')
      },
      required: ['startingCircumstances', 'incitingIncident', 'immediateGoal', 'keyNpcs', 'fronts', 'setPieces', 'chapters', 'storyShape', 'turningPoint']
    },
    openingActions: LIST('Three short first moves of different kinds'),
    hero: HERO_SCHEMA,
    sheet: SHEET_SCHEMA
  },
  required: ['title', 'premise', 'outline', 'openingActions', 'hero', 'sheet']
};
