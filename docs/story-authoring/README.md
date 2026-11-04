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

## Ratings

`everyone`, `teen` or `mature`. Mature stories are hidden unless the player turns on
Mature content in Settings.
