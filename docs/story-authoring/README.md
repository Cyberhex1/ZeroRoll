# Story authoring kit (v1)

This kit is for writing Story mode stories outside the app (with ChatGPT or by hand) so
they drop straight in. A story is a **package**: one `story.json` plus an `art/` folder of
`.webp` images.

```
my-story/
  story.json
  art/
    cover.webp
    odda.webp
    ...
```

## Files in this kit

| File | What it is |
| --- | --- |
| `story.schema.json` | The JSON Schema for `story.json`. Give it to ChatGPT with the prompts. |
| `prompts.md` | The prompt pack: story design, beat graph, art list, skin values, fixing errors. |
| `art-specs.md` | Image sizes, format and naming. |
| `../../stories/lantern-of-hollowmere/story.json` | A complete example story to copy from. |

## How a story works

- **Beats** are the fixed moments of the story. The player is free inside a beat (talk,
  explore, fail) but leaves it only through its **exits**.
- A beat's **goal** is a list of flag conditions. With `"strictness": "hard"` (the default)
  the exits stay closed until every condition holds. The narrator is told what is still
  needed and steers toward it; it cannot move the story on early, and if it claims a beat
  it is not allowed to reach, the app ignores the claim and corrects it next turn.
- **Flags** are the story's memory: true/false (`bool`) or numbers (`counter`). Authored
  **choices** set them, and the narrator can report changes too.
- Every beat that is not an ending needs at least one authored choice that changes a goal
  flag, so a hard gate can never trap the player. Add a `hint` for beats players might
  circle in; it is worked into the scene after `hintAfterTurns` turns.
- **Endings** are beats with `"isEnding": true` and no exits. A story needs at least two.
- **Art cues** show an image in the chat when a beat is entered (`enter`), a choice is
  picked (`choice`), or a flag condition starts to hold (`flag`).
- **Character mode** (`"mode": "character"` plus `"character": "<cast id>"`) makes the
  player talk with one cast member instead of a narrator. Beats work the same way.
- **Skin**: each category has a base look; the story's `skin` block overrides any part of
  it (palette colours, fonts, bubble shape, pattern, background art, particles).

## Book pages (play offline)

A story whose every beat has a `page` can be read like a choose-your-own-adventure book, with
no AI and no connection. `page` is the written text shown when the player enters the beat (20
to 5000 characters; `{name}` is replaced with the player's name). A choice without a `target`
(it stays in the same beat) should have an `outcome`: the short text shown after it is picked.

In book mode the authored choices are the buttons. A choice whose way is still shut (an ending
that needs an earlier discovery) is hidden, and a stay-here choice already made is not offered
again. Typing your own action hands that turn to the AI narrator ("going off the rails", which
needs an AI key); picking a book choice afterwards goes back to the written pages from wherever
the story now is. The play screen's "Story text" setting can switch a story to "AI narrator every turn".
Write pages so they read right whichever way the player arrived. `src/story/__tests__/book.test.ts`
checks that every built-in story has pages and that its choices alone reach every ending.

## Checking and installing

```
npm run story:check path/to/my-story     # prints every problem and how to fix it
npm run story:import path/to/my-story    # checks, uploads art, installs into stories/
```

`story:check` exits with an error while anything is wrong, so paste its output back to
ChatGPT with the "Fix these errors" prompt until it prints `OK`. Warnings are worth a look
but do not block the import.

`story:import` uploads the art to Cloudflare R2 when the `R2_*` environment variables are
set (see `scripts/story-import.ts`); otherwise it copies the art into `public/story-art/`
for local testing. It then writes `stories/<id>/story.json`, and the story shows up in the
Story mode picker.

## Fan fiction

A story with `meta.source` is fan fiction: `{ "title": "Baldur's Gate 3", "medium": "game",
"owner": "Larian Studios", "aka": ["BG3"] }` (medium is one of game, anime, manga, manhwa, tv,
film, book). The picker pins stories without a source as **Originals** and lists fan fiction
below them by kind of work, with search (title, blurb, genre, the work and its `aka` names) and
genre chips. The narrator gets a SOURCE block: use the work's world and canon characters as
fans know them, but tell a new story and never quote the original. Fan fiction is always new
writing with the player as a new character; art shows places, moods and original characters,
never logos or copies of official character designs. The player is a self-insert, so art never shows the player's character: draw what they see, or the scene without them.

**Create your own fanfic** (`/story/create`, `src/story/createFanfic.ts`) asks for the work and
an optional idea, and the player's story model writes a whole story in this format. The code
checks the beat graph (one rewrite if it is broken), a second model reads the story against the
prompt (one rewrite if it finds problems), and the story is saved on the device with
`meta.created: true` and no art. Any failure shows an error; there is no stand-in story.
`npx vite-node scripts/fanfic-eval.ts "Lookism:manhwa"` runs it on real Gemini output.

## Player name and pronouns

Every story asks "Who are you in this story?" before it begins. The answer is kept on the save
(`player`) and sent in the story prompt every turn, so `playerRole` must never name the player
or fix their gender.

## Ratings

`everyone`, `teen` or `mature`. Mature stories are hidden unless the player turns on
Mature content in Settings.
