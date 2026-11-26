# Story rolls: the master prompt

Since 2026-11-26 (replacing the 0.2 Story Forge), a D&D story roll is two or three AI calls:

1. **Writer** (`tier: 'story'`, the "Write new stories with" model). The prompt holds only:
   - who the model is (the game master of a one-on-one choose-your-own-adventure RPG),
   - the category's genre line (`GENRE_LINES` in `src/setup/masterPrompt.ts`),
   - 6 titles picked at random from the category's seed list (`media` in `src/content/categories/<id>.ts`) as examples, with "do not recreate these; come up with your own",
   - the setup screen's fields to fill (player-facing ones, then private DM notes, then the hero sheet rules),
   - any fields already filled in (the player's own story, an opener, Book Two's hero), to keep word for word,
   - one line asking for human, non-AI-sounding writing, plus the list of names and places AI models overuse (with the list, Carbon's name failures fell from 10/15 to 2/15).
2. **Story check** (`tier: 'check'`, 3.8 Flash when the key can use it). It gets the writer's exact prompt and reply and is asked: did it follow the prompt, and is it logical?
3. **Rewrite** (only when the check fails): the writer's prompt, its first draft and the problems the check named. Taken as is.

A failed writer call throws a player-facing error (no stand-in story). A check that cannot run keeps the story and says so on the status line.

Single-field rerolls (title, name, class with its sheet, origin with looks) send the same genre intro, the story as it stands, and ask to change only that field (`buildRerollPrompt`). Which fields a reroll replaces is still decided by `REPLACES` in `src/setup/draft.ts`.

Real-output eval: `NODE_USE_ENV_PROXY=1 STORY_MODEL=gemini-4-carbon npx vite-node scripts/story-eval.ts [perCategory] [category ...]`.

## Play: the DM sheet

Every turn the game master gets the DM outline (roadmap), the CURRENT STATE sheet, the memory list, the rolling summary and the recent log. Since 2026-11-26 the memory worker (every 10 turns, `src/memory/summarizer.ts`) also rewrites a **DM sheet**: where the story stands against the plan, the people met and how they stand, open threads, and what has been revealed. It is sent with every turn after the summary.
