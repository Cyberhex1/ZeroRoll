# Story Forge and the Director (0.2)

ZeroRoll 0.2 replaced the single "write me a story" call with a pipeline where code makes the
choices that need variety and the AI does the writing. Story mode (hand-made stories) is not
part of this; it covers D&D campaigns only.

## Setup: the Story Forge

`src/forge/forge.ts`, called through `rollStory` in `src/setup/storyRoll.ts`.

1. **Spread** (`src/forge/spread.ts`, code). Draws from the category's deck: a story family, a
   primary DNA card and sometimes a second influence (always from the family's own sources), a
   plot engine, a hook, a place, a complication, set-pieces, a story shape, an opening card and a
   closing card, and names from the name bank. Recently used cards are skipped
   (`src/forge/recent.ts`, localStorage key `zeroroll_forge_recent_v1`).

   The prompt splits the spread into **the core** (family, hook, primary DNA), which the story is
   built from, and **optional cards** (hero idea, place idea, plot engine, second influence,
   palette), which the model takes only when they fit. Cards are drawn independently, so before
   2026-11-25 the model stitched them all into one premise and rolls stopped making sense. The
   build also runs a same-moment check so "Where you start" and "Your first goal" agree with the
   premise, and the closing question has to offer a choice with something at stake.
2. **Pitch** (1 call, fresh cloud rolls only). Four short pitches from the spread, each a
   different take. `pickPitch` scores them in code. The three not picked are offered on the
   Seeds tab as "More ideas from this roll".
3. **Build** (1 call). The full package: title, premise, outline with NPC moves, fronts and
   set-pieces, hero and hero sheet.
4. **Names** (code). Stock AI names in NPCs, title and premise are replaced from the name bank.
5. **Gate** (`src/forge/gate.ts`, code). Checks the premise for stock openings, narrator irony,
   spoilers of the turning point, shape, a thin closing question, samey first words, tic words,
   off-genre words, and worn words in the title.
6. **Repair** (at most 1 call). Fixes only what the gate flagged; the version with fewer
   failures wins.

7. **Continuity read** (1 call, `src/forge/continuity.ts`). Reads the story card as the player
   will (title, premise, "Where you start", "Your first goal", hero) and returns fixes for
   contradictions, stitched-in elements, things that appear from nowhere and a closing question
   with nothing at stake. Only the fields it changed are applied; a rewritten premise must pass the
   gate; the player's own premise is never touched; a failed call keeps the card.

Build and the continuity read use the **story model** when the player picked one in settings
("Write new stories with", stored in `zeroroll_story_model_gemini`) and their key can use it;
otherwise the player's model. The pitch and repair stay on the basic tier.

A roll is 3 calls most of the time, 4 when the gate asks for a repair. Local models skip the
pitch and get a shorter spread.

The campaign keeps a `ForgeRecord` in `inspiration.forge`, so Chapter One, every turn and Book
Two stay in the voice the story was built from. The story card shows it as "Inspired by …" and
lists what the AI was given, except the complication and set-pieces (spoilers).

## Decks

One file per category in `src/content/forge/decks/`, typed by `src/content/forge/types.ts`.
`npm run content:check` validates them (`src/content/forge/validateDecks.ts`).

To add a card, add it to the right list in the category's deck:

* **DNA card**: `{ id, title, medium, dna }`. `title` and `medium` match the category's media
  list; `dna` is 18 to 70 words on what makes the work tick (structure, pressure, feel), never
  its plot or names.
* **Hook, place, complication, set-piece**: one line each. No stock names (see
  `OVERUSED_NAMES`) and no words from the category's `avoidKeywords`.
* **Family tags**: a hook, place or set-piece that only fits some families goes in `CARD_FAMILIES`
  (`src/content/forge/familyTags.ts`) with those family ids; untagged cards fit every family, and
  complications are never tagged, so they must fit every family. Each family needs at least 3 hooks,
  2 places and 3 set-pieces after filtering (aim for 6 or more hooks).
* **Hero cards**: `HERO_CARDS` in the same file, keyed `<category>.<family>`. Keep them specific and
  gender-neutral where you can (the player picks pronouns), and never a role from `WORN_ROLES`.
* The check also fails a card listed twice and a card using a worn word (ledger, trembling, ozone,
  hum, rhythmic, tapestry, testament, palpable).
* **Family**: needs a name, a palette (things to draw from), the DNA ids it uses, and the shapes
  it allows.

## Play: the Director

`src/forge/director.ts` and `src/forge/turnContext.ts`, pure code, no extra calls. Each turn it
may add one short DIRECTOR NOTE to the player message, in this order of priority:

* **chapter_close**: the chapter has run long; steer toward its end.
* **front**: a front (a pressure that moves on its own) has been quiet; show its next portent
  as a sign or rumor. Portents are paced to the chapter.
* **npc**: a key NPC has not been seen; they act on their next move.
* **set_piece**: around turns 4 and 8 of a chapter, build toward one of the set-pieces.
* **dialogue**: three replies without anyone speaking.
* **quiet**: three turns of checks or damage in a row; give a quiet beat.

Every turn also gets a FRESH LANGUAGE line (phrases the last replies repeated) and names on hand
for new characters. `Experience.director` holds the state; campaigns from before 0.2 build it
lazily, and Book Two resets it.

## Measuring

* `npm run story:eval -- [perCategory] [--no-pitch] [category …]`: real rolls with a summary table.
* `npm run turn:eval -- [turns] [category …]`: Chapter One plus scripted turns, Director on vs off.

* `npx vite-node scripts/story-judge.ts <eval.json> [model]`: rates each story card from a
  story:eval run for coherence, consistency, stakes and clarity (measurement only).

All need `GEMINI_API_KEY` and `NODE_USE_ENV_PROXY=1` in the cloud environment, and should run on
Flash-Lite (the free Flash quota is about 20 requests a day).
