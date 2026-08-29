---
name: zeroroll-dev
description: >-
  Expert guidelines and developer runbooks for ZeroRoll — an AI-powered tabletop roleplaying (TTRPG) engine.
  Use this skill whenever creating or modifying categories, story generation prompts, narrative profiles,
  D&D 5e mechanics, avatar generation, multi-provider LLM integrations, or UI components in ZeroRoll.
---

# ZeroRoll Development Skill

This skill provides step-by-step procedures, architectural invariants, and runbooks for working on the ZeroRoll codebase.

---

## 1. Codebase Map

| File / Folder | Purpose |
| :--- | :--- |
| [`src/lib/geminiService.ts`](file:///c:/Users/kdlin/OneDrive/Old/Apps/Documents/AVIBECODE/ZeroRoll/src/lib/geminiService.ts) | Universal LLM executor, multi-model fallback cascade, turn execution, scenario setup, and Flux/DALL-E avatar generator. |
| [`src/lib/narrativeProfiles.ts`](file:///c:/Users/kdlin/OneDrive/Old/Apps/Documents/AVIBECODE/ZeroRoll/src/lib/narrativeProfiles.ts) | 15 Category Narrative Profiles (Voice, Atmosphere, Sensory Anchors, Scene Architecture, Story Beats, Avoid lists) & compiler. |
| [`src/lib/seedlists.ts`](file:///c:/Users/kdlin/OneDrive/Old/Apps/Documents/AVIBECODE/ZeroRoll/src/lib/seedlists.ts) | Category seed corpus (Themes, Tropes, Encounters, Opening Hooks) across all 15 genres. |
| [`src/lib/categoriesData.ts`](file:///c:/Users/kdlin/OneDrive/Old/Apps/Documents/AVIBECODE/ZeroRoll/src/lib/categoriesData.ts) | Category definitions, icons, color gradients, and default character stat blocks. |
| [`src/lib/providersConfig.ts`](file:///c:/Users/kdlin/OneDrive/Old/Apps/Documents/AVIBECODE/ZeroRoll/src/lib/providersConfig.ts) | Multi-provider AI configurations (Gemini, OpenAI, Claude, Grok, Copilot, OpenRouter, Custom). |
| [`src/components/CategoriesGrid.tsx`](file:///c:/Users/kdlin/OneDrive/Old/Apps/Documents/AVIBECODE/ZeroRoll/src/components/CategoriesGrid.tsx) | Category selection, campaign setup modal, gender/pronoun selector, and live portrait preview. |
| [`src/components/NarrativeStream.tsx`](file:///c:/Users/kdlin/OneDrive/Old/Apps/Documents/AVIBECODE/ZeroRoll/src/components/NarrativeStream.tsx) | Game Master story feed, action bar, forced D&D roll barrier, and course-change alert banner. |
| [`src/components/CharacterSheetPanel.tsx`](file:///c:/Users/kdlin/OneDrive/Old/Apps/Documents/AVIBECODE/ZeroRoll/src/components/CharacterSheetPanel.tsx) | Character stats, D&D 5e modifiers, avatar portrait, and live physical prompt re-renderer. |

---

## 2. Adding or Modifying a Category

When adding or updating a category in ZeroRoll:
1. **Define in [`src/types/index.ts`](file:///c:/Users/kdlin/OneDrive/Old/Apps/Documents/AVIBECODE/ZeroRoll/src/types/index.ts)**:
   Add category identifier to `ExperienceCategory` union.
2. **Add Seed Data in [`src/lib/seedlists.ts`](file:///c:/Users/kdlin/OneDrive/Old/Apps/Documents/AVIBECODE/ZeroRoll/src/lib/seedlists.ts)**:
   Provide `coreThemes`, `narrativeTropes`, `encounterSeeds`, and `openingHooks`.
3. **Add Narrative Profile in [`src/lib/narrativeProfiles.ts`](file:///c:/Users/kdlin/OneDrive/Old/Apps/Documents/AVIBECODE/ZeroRoll/src/lib/narrativeProfiles.ts)**:
   Define `voice`, `atmosphere`, `sceneStructure`, `storyBeats`, `characterDynamics`, `encounterPatterns`, `sensoryMotifs`, and `avoid`.
4. **Register in [`src/lib/categoriesData.ts`](file:///c:/Users/kdlin/OneDrive/Old/Apps/Documents/AVIBECODE/ZeroRoll/src/lib/categoriesData.ts)**:
   Add entry with icon, colors, default character sheet, and sample prompts.
5. **Add Fallback Procedural Rollers in [`src/lib/randomScenarios.ts`](file:///c:/Users/kdlin/OneDrive/Old/Apps/Documents/AVIBECODE/ZeroRoll/src/lib/randomScenarios.ts)**.

---

## 3. Story Generation & Turn Adjudication Protocol

### Scenario Generation (`generateScenarioAI`)
- Compiles grounded seed context via `buildGroundedSeedContext(category, userPrompt)`.
- Respects chosen `gender` (`she/her`, `he/him`, `they/them`, or custom).
- Emforces scene architecture (Arrival -> Salient Object/Person -> Immediate Stakes -> Choice Fork).

### Action Turn Execution (`executeActionTurn`)
- Compiles grounded seed context into the Game Master system instruction.
- Addresses the player as "you" in present tense.
- Parsed delimiters:
  - `---STATE_UPDATE---` (HP deltas, item changes, condition changes, location).
  - `---AVATAR_EVOLUTION---` (Visual appearance updates after major milestones).
  - `---COURSE_TRIGGER---` (Course-changing dramatic events).
  - `---CHECK_REQUIRED---` (Mandatory D&D 5e check with DC).
  - `---OPTIONS---` (3 suggested player actions).

---

## 4. Verification Checklist

Before completing any task:
1. Run `npx tsc --noEmit` to verify type integrity.
2. Run `npx vite build` to ensure production assets compile.
3. Check that the dev server is live on `http://localhost:3001`.
