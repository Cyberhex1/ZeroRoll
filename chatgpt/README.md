# ChatGPT handoff: story and opener content

This folder holds everything ChatGPT needs to write ZeroRoll's missing content (to-do section 3). Start with `MASTER_PROMPT.md`.

| Path | What it is |
| --- | --- |
| `MASTER_PROMPT.md` | The prompt to paste into ChatGPT. Plan first, then build after "go". |
| `materials/opener-rules.md` | Every rule the D&D openers must follow. |
| `materials/openers-needed.json` | The 11 categories short of 10 openers: how many to write, ids, voice, banned words, titles and hero names already taken. |
| `materials/stories-brief.md` | The three Story mode stories to write. |
| `materials/art-style.md` | Picture style, sizes and naming for all art. |
| `materials/lantern-art.md` | The 8 replacement pictures for The Lantern of Hollowmere. |
| `output/` | Where ChatGPT saves its work. Claude reads it from here. |

Elsewhere in the repo: `docs/story-authoring/` (story kit and schema), `stories/lantern-of-hollowmere/story.json` (example story), `src/content/categories/` (existing openers), `src/content/validate.ts` and `src/story/validate.ts` (the checkers).
