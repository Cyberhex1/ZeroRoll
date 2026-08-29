# D&D AI Experience Engine - Project Changelog & Antigravity Handover Context

This document compiles the complete summary of user requests, system instructions, architectural changes, model configurations, and codebase refinements across all development sessions.

---

## 1. Core Project Overview & Archetype
- **Application Name**: D&D AI Experience Engine (Antigravity Roleplaying Framework)
- **Tech Stack**: React 18, Vite, TypeScript, Tailwind CSS, Express Backend (`server.ts`), Google Gen AI SDK (`@google/genai`), Firebase Firestore & Auth, Lucide React icons, Canvas Confetti.
- **Core Purpose**: A high-fidelity, multimodal AI-powered Tabletop RPG Game Master and Choose Your Own Adventure (CYOA) engine supporting 15 distinct genres/categories with persistent character sheets, inventory management, dynamic D&D 5e dice checks with real mechanical consequences, dynamic portraits/maps, audio ambiance, and multi-session persistence.

---

## 2. Comprehensive Log of User Requests & Implemented Changes

### Turn 1: 5-Field Campaign Setup Randomization & True Story Beginnings (Act I, Scene 1)
- **User Prompt**: "All five fields are still not being randomly generated. Same middle of the story issue."
- **Root Issues Identified**:
  1. Category setup modal was only partially updating fields on modal open, leaving default strings or partial states.
  2. Story seeds occasionally jumped straight into active combat, boss fights, or post-quest scenarios.
- **Implemented Fixes**:
  - Built `src/lib/randomScenarios.ts`: Complete procedural randomization engine covering all 15 campaign categories (`fantasy`, `adventure`, `historical_adventure`, `horror`, `cozy_ghibli`, `romantic`, `revenge`, `apocalypse`, `zombie`, `cosmic_horror`, `psychedelic_trip`, `tiktok_drama`, `ancient_greek`, `mythology`, `real_life`).
  - Added dedicated individual dice buttons for all 5 setup fields:
    1. **Experience Title** (*Roll Title*)
    2. **Hero Name** (*Roll Name*)
    3. **Class / Archetype** (*Roll Role*)
    4. **Race / Origin** (*Roll Race*)
    5. **Starting Scenario Hook (Act I, Scene 1)** (*Roll Hook*)
  - Created a master **"Randomize All 5 Fields"** action button that instantly rolls a cohesive character, starting backstory, equipped items, spells, and opening scene hook.
  - Rewrote all static scenario hooks in `src/lib/scenarioHooks.ts` and `src/lib/seedlists.ts` to strictly begin at the true opening moment (arrival at destination, receiving the introductory summons, meeting quest contacts, reviewing floorplans, etc.).

---

### Turn 2: Choose Your Own Adventure (CYOA) Story Arc & Endgame Pacing Protection
- **User Prompt**: "Have the ai think of it as a choose your adventure story. Start at the beginning and guide the player to its conclusion. Options like this are supposed to be end game 'Step out from behind the catering table, strip off your apron, and casually reveal the $50 Billion Sterling Family Signet Ring on your finger.'"
- **Root Issues Identified**:
  - AI suggested actions occasionally offered high-stakes, climax-level actions in Act I rather than progressive early-game steps.
- **Implemented Fixes**:
  - Structured the Game Master system instructions around a 3-Act Choose Your Own Adventure arc:
    * **Act I (The Beginning / Setup)**: Focuses on immediate 15–45 second micro-actions, examining starting rooms, early NPC dialogues, subtle clues, and low-level hurdles.
    * **Act II (Rising Tension & Mid-Game Trials)**: Expanding map exploration, branching dilemmas, medium-to-hard D&D checks, combat encounters, and accumulating key items.
    * **Act III (Climax & Conclusions)**: Climax reveals, confrontation with arch-villains, grand revelations (such as the Billionaire Signet Ring reveal), and story resolutions.
  - Pacing Rule: Prevented early-game shortcuts, instantaneous teleportation, or skipping straight to the ultimate villain.
  - Dynamic CYOA Options: Guaranteed 3 grounded, distinct choices tailored specifically to the active chapter phase.

---

### Turn 3: Gemini 3.7 Model Migration & Error Resolution
- **User Error Reported**: `models/gemini-2.5-flash is no longer available to new users... 404 NOT_FOUND`.
- **Implemented Fixes**:
  - Migrated avatar generation, vector portrait synthesis, and AI story orchestration to `gemini-3.7-flash` and modern Gen AI SDK endpoints.
  - Added robust fallback cascade: `gemini-3.7-flash` -> `gemini-flash-latest` -> `gemini-pro-latest`.
  - Recompiled and restarted the Express server without deprecation errors.

---

## 3. Key Files & Architecture Reference

| File Path | Description |
|---|---|
| `/server.ts` | Express backend with Vite integration, Gemini AI streaming, GM system prompts, 5e rule adjudication, D20 check DC verification, and AI image/avatar synthesis. |
| `/src/lib/randomScenarios.ts` | 15-category procedural 5-field generator for titles, names, roles, races, items, spells, and Act I Scene 1 hooks. |
| `/src/lib/scenarioHooks.ts` | Extensive library of curated starting hooks across all categories. |
| `/src/lib/seedlists.ts` | Category metadata, tropes, and thematic inspiration prompts. |
| `/src/lib/categoriesData.ts` | UI definitions, visual themes, color palettes, and default character archetypes for each genre. |
| `/src/components/CategoriesGrid.tsx` | Category selection grid, custom experience creation modal, 5-field randomizers, and AI re-roll controls. |
| `/src/components/ExperienceView.tsx` | Active adventure screen, chat history, interactive D20 roll prompts, inventory/condition sheets, and dynamic CYOA choices. |
| `/src/types/index.ts` | TypeScript types for Experiences, CharacterSheets, InventoryItems, DiceRolls, and Category definitions. |

---

## 4. Antigravity Agent Configuration Guidelines

When continuing development or deploying in Antigravity:
1. **Model Defaults**: Always use `gemini-3.7-flash` via `@google/genai`.
2. **Pacing Rules**: Preserve the CYOA pacing rules in `server.ts` so early choices remain focused on immediate scene investigations and dialogue rather than instant climax triggers.
3. **Tabletop Adjudication**: Maintain the D&D 5e DC 10–20 check system with explicit negative HP/inventory/condition penalties on failed checks.
