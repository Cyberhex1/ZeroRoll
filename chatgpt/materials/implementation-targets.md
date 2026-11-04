# Where everything lands in the game

This is the map from what ChatGPT makes to the game files that change. The implementation plan in `PLAN.md` follows this map. Claude does the final install, but the plan must be precise enough that the install is mechanical.

## Current state (counted from the repo)

| Category file (`src/content/categories/`) | Openers now | To write |
| --- | --- | --- |
| adventure.ts | 0 | 10 |
| historical_adventure.ts | 0 | 10 |
| ancient_greek.ts | 1 | 9 |
| mythology.ts | 1 | 9 |
| psychedelic_trip.ts | 2 | 8 |
| cosmic_horror.ts | 3 | 7 |
| zombie.ts | 4 | 6 |
| apocalypse.ts | 5 | 5 |
| real_life.ts | 5 | 5 |
| romantic.ts | 7 | 3 |
| revenge.ts | 8 | 2 |
| fantasy.ts, horror.ts, cozy_ghibli.ts, tiktok_drama.ts | 10 | 0 (use as tone examples) |

Total: 74 new openers. `materials/openers-needed.json` holds the ids, voice, banned words and taken names for each.

## Job A: openers

- **Made by ChatGPT:** `chatgpt/output/openers.json`, an object keyed by category id, each value an array of new opener objects only (not the ones already in the file).
- **Installed into:** the `"openers": [ ... ]` array of each `src/content/categories/<id>.ts`, appended after the existing ones, same JSON style (double quotes, 2-space indent), in id order.
- **Shape:** the `Opener` interface in `reference/src/content/types.ts`. Example entries: `reference/src/content/categories/fantasy.ts` (search `"openers"`).
- **Checked by:** `reference/src/content/validate.ts` through `npm run content:check` (`scripts/validate-content.ts`). It fails unless every category has exactly 10.

## Job B: three Story mode stories

- **Made by ChatGPT:** `chatgpt/output/stories/<story id>/story.json` plus `art/<art id>.png`.
- **Installed into:** `stories/<story id>/story.json` and `public/story-art/<story id>/<art id>.webp` (Claude converts PNG to WebP under 250 KB and runs `npm run story:import`).
- **Shape:** `reference/docs/story-authoring/story.schema.json` (generated from `reference/src/story/schema.ts`). Full example: `reference/stories/lantern-of-hollowmere/story.json`.
- **Checked by:** `reference/src/story/validate.ts` through `npm run story:check chatgpt/output/stories/<story id>`.
- **Skin values:** only what `reference/src/story/skins.ts` and the schema allow.

## Job C: Lantern of Hollowmere art

- **Made by ChatGPT:** `chatgpt/output/lantern-of-hollowmere/<name>.png` (8 files, names in `materials/lantern-art.md`).
- **Installed into:** `public/story-art/lantern-of-hollowmere/<name>.webp`, replacing the placeholders. `story.json` does not change.

## Install order (Claude)

1. Openers into the 11 category files, then `npm run content:check`.
2. Each story: `npm run story:check`, convert art, `npm run story:import`.
3. Lantern art: convert and replace.
4. `npx tsc --noEmit`, `npm test`, `npx vite build`, then one pull request.
