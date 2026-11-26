# Story rolls: the master prompt

Since 2026-11-26 (replacing the 0.2 Story Forge), a D&D story roll is two or three AI calls:

1. **Writer** (`tier: 'story'`, the "Write new stories with" model). The prompt holds only:
   - who the model is (the game master of a one-on-one choose-your-own-adventure RPG),
   - what the category means, as a list: kinds of story and characters (`GENRE_KINDS` in `src/setup/masterPrompt.ts`) plus 6 titles picked at random from the category's seed list (`media` in `src/content/categories/<id>.ts`). They ground the category only; the model is told it is expected to write an original story and never borrow from them,
   - the fields to fill: title, the premise as an "about" blurb, the hero (class and origin with examples for this category), private DM notes, and the hero sheet. There are no "Where you start", "Your first goal" or opening moves: Chapter One writes the first moves,
   - the pronoun line (or, when the player chose none, a unisex name and they/them),
   - any fields already filled in (the player's own story, an opener, Book Two's hero), to keep word for word,
   - one line asking for human, non-AI-sounding writing, plus the list of names and places AI models overuse (with the list, Carbon's name failures fell from 10/15 to 2/15).

   ohnna (2026-11-26): keep it short. Long explanations box the AI in. The "start before the turning point" line is held back in `START_BEFORE_TURNING_POINT`; add it again only if rolls start at the climax.
2. **Story check** (`tier: 'check'`, 3.8 Flash when the key can use it). It gets the writer's exact prompt and reply and is asked: did it follow the prompt, and is it logical?
3. **Rewrite** (only when the check fails): the writer's prompt, its first draft and the problems the check named. Taken as is.

A failed writer call throws a player-facing error (no stand-in story). A check that cannot run keeps the story and says so on the status line.

Single-field rerolls (title, name, class with its sheet, origin with looks) send the category name, the story as it stands and "make sure it is cohesive with the story below" (no example titles), and ask to change only that field (`buildRerollPrompt`). Which fields a reroll replaces is still decided by `REPLACES` in `src/setup/draft.ts`.

## Rules by category

Only the **Dungeons & Dragons** category (`dnd`) plays by full 5e (proficiency, advantage, XP and levels, death saves) and gets a D&D sheet in the prompt. Every other category uses narrative dice, and its sheet is described in plain words with that category's own examples (`src/setup/heroRules.ts`). `rulesModeFor(category)` in `src/dnd/rules.ts` decides it; there is no player setting, and older saves follow their category.

## The setup screen

The menu opens with only the pronoun picker and **Roll story** live; the story, hero and sheet stay greyed out until the first roll. "No preference" means the hero gets a unisex name.

Real-output eval: `NODE_USE_ENV_PROXY=1 STORY_MODEL=gemini-4-carbon npx vite-node scripts/story-eval.ts [perCategory] [category ...]`.

## Play: the DM sheet

Every turn the game master gets the DM outline (roadmap), the CURRENT STATE sheet, the memory list, the rolling summary and the recent log. Since 2026-11-26 the memory worker (every 10 turns, `src/memory/summarizer.ts`) also rewrites a **DM sheet**: where the story stands against the plan, the people met and how they stand, open threads, and what has been revealed. It is sent with every turn after the summary.
