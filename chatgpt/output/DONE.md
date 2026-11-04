# ZeroRoll content handoff — complete

Completed 2026-11-04. All requested Phase 2 files are saved in chatgpt/output/. Nothing has been installed into the game. The content handoff contains **106 files**: 74 new openers in one JSON collection, three complete story JSON packages, 50 PNG illustrations, their 50 WebP conversions, the deterministic auditor, and this report.

## Deliverables

- **Job A:** 74 new opener objects across exactly 11 category keys. Every reserved ID, title, hero name, role and origin follows PLAN.md. The live 76 existing openers plus these 74 give exactly 10 in each of the 15 categories. New objects only; source categories are untouched.
- **Job B:** The Seventh Night at the Spirit Bathhouse (cozy character mode, Genzo), The Caller Knows Your House (teen horror), and The Truthful Balloon (everyone adventure). Each has 3 cast members, 9 reachable beats, 3 endings, 8 declared flags, a real location branch, 10 art cues, a cover and 3 cast portraits. All six route/ending combinations in each story complete through authored choices using the current engine.
- **Job C:** All eight Hollowmere replacement pictures, with their exact existing IDs and unchanged story JSON. Odda has cropped iron-grey hair; Maelis retains her fixed water-and-blue-light design. Dawn has no supernatural blue lights. The underwater-lights image contains drowned houses and drifting lights; the bell image focuses on the flooded chamber and blue glass shard.
- **Art:** 50 actual finished illustrations, each separately generated; no placeholder or reused file standing in for another requested image. PNG portraits are 768×768, landscape PNGs are 1024×576, and every WebP matches its PNG dimensions. WebPs range from 76,276 to 246,300 bytes, all below the stricter 250,000-byte cap. All files were decoded with Pillow; PNG hashes and unique-image checks pass. Exact per-image dimensions, quality and hashes are in ../work/art-audit.json.
- **Racial diversity:** Per the user's production steering, the human casts explicitly include South Asian Mira, white Hal, mixed Black/white Ren, white Siv and Black Pavo. Skin tones and appearance descriptions are repeated consistently in subsequent scene prompts and portraits are used as identity references. Race does not determine character virtue, skill or outcome. Lantern's established cast descriptions were preserved.

## Checks actually run

| Check | Result |
| --- | --- |
| npx tsx chatgpt/output/check-handoff.ts --text-only | PASS: strict in-memory merged content validator, all additional brief rules, all story schemas/graphs, prompt-context checks and text contrast. |
| npx tsx chatgpt/output/check-handoff.ts | PASS: the same checks plus all 50 PNG/WebP pairs, exact dimensions, file signatures, byte limits and image uniqueness. |
| npm run story:check -- chatgpt/output/stories/spirit-bathhouse-night-shift | OK; no warnings. |
| npm run story:check -- chatgpt/output/stories/the-caller-knows-your-house | OK; no warnings. |
| npm run story:check -- chatgpt/output/stories/the-truthful-balloon | OK; no warnings. |
| npm run story:check with all three directories in one final run | All three OK; no warnings. |
| npm test -- src/story/__tests__/storyEngine.test.ts | PASS: 20/20 existing engine tests. |
| npm test | PASS: 195/195 tests in 20 files. The suite's expected mocked provider/audio error logs are not failed tests. |
| npx tsc --noEmit --project chatgpt/work/tsconfig.handoff.json | PASS: live src/, scripts, Vite config and the new handoff auditor. |
| npx tsc --noEmit | FAIL: the same five pre-existing unresolved imports in the incomplete chatgpt/reference copies; details below. No new live-source or handoff-auditor errors. |
| Vite production build | PASS: 2,039 modules. Current config used without edits, runner loader with globalThis.__dirname set to the repo directory, output redirected to chatgpt/work/build-proof. Existing >500 KB chunk warning remains. Temporary build output removed. |
| python chatgpt/work/convert-art.py, followed by commit-normalized-art.ps1 | PASS: 50/50 pairs decoded, correctly sized, under the byte cap, and normalized PNG copies hash-verified. |
| 12-word sequence comparison against all 76 existing opener premises | PASS: zero exact long-phrase matches. This is a bounded duplication check, not a universal originality guarantee. |
| Local browser preview | Vite printed ready on port 3001, but in-app browser, Edge and loopback curl could not connect. No browser/console success or model playthrough is claimed. The task-owned server was stopped. |

The ordinary root typecheck includes reference copies that intentionally omit dependencies. Its five TS2307 errors are in reference/src/content/categories/index.ts, reference/src/content/categoryIds.ts, reference/src/content/types.ts, reference/src/story/art.ts and reference/src/story/skins.ts, referring to omitted types or storage/db modules. I did not alter reference files or root tsconfig to hide these errors. The separate handoff config verifies the real game source and new auditor.

The audit measures normal and muted text against every resolved main surface and bubble. Minimum contrast: bathhouse **4.85:1**, caller **8.43:1**, balloon **6.68:1**. All pass 4.5:1. Both full and compact prompt paths contain the story world and current scene brief; Genzo's character mode retains first-person direction. Engine witness paths print in the auditor output. These are deterministic engine/prompt checks, not proof of a particular model's narration quality.

## Departures from PLAN.md and resolved issues

1. The user requested racially diverse casts during production. PLAN.md now records the explicit human identities; existing finished portraits were preserved, and Pavo plus subsequent scenes use the clarified appearances.
2. Added only a muted-text colour override to each story's planned skin to make secondary text pass contrast on player bubbles as well as other surfaces. Other planned overrides and category styling remain intact.
3. Kept authoring inputs, image prompts, conversion tools, the scoped typecheck and a local review page under chatgpt/work/ for reproducibility. These are not game runtime files.
4. npm ci was not run: the approved plan documented its conflict with the instruction not to write outside chatgpt/, and existing dependencies were usable. Claude may perform a clean install during integration.
5. Conversion is delivered now, in addition to PNG masters, so package checking can succeed before Claude installs anything. This follows the approved solution to the PNG-versus-WebP checker mismatch.
6. Corrected five generated-image continuity errors with targeted edits: Odda's initial long hair; an accidental second balloon in route-wind; stray ferry props in Lantern lights and bell; and lingering blue flames in dawn. Final assets follow the approved compositions and ending state.
7. Windows temporarily held some referenced PNGs in file mappings during normalization. Conversion was changed to stage normalized masters and use checked native copies, with a reversible task-folder backup fallback. Final target hashes and dimensions all pass. No other process was stopped to release an image handle.
8. Early auditor failures were corrected in the auditor itself: valid opening verbs were added to its editorial whitelist, and serialization checks compare meaningful state fields rather than treating an absent optional field differently from undefined. All final audits pass.

No unresolved content/schema/art-format errors remain. Browser/model behavior, installed save/reload, picker integration, visual contrast after background dimming and final hosting remain Claude's integration checks, as planned.

## Installation handoff

Follow ../PLAN.md Section 5. Append each new opener array into the matching src/content/categories/<category>.ts openers array in ID order. Then run npm run content:check -- --strict; the unchanged live categories will continue to report gaps until these objects are installed. The auditor has already validated that exact merge in memory.

Each story directory is now import-ready: story.json references the real WebPs in its art/ folder. Run story:import with --dry-run first to inspect the existing local/R2 destination, then install through the current importer. Do not copy authoring tools into src/. Replace public/story-art/lantern-of-hollowmere/<id>.webp with the eight delivered Lantern WebPs; Lantern story.json needs no edits. No R2 upload, source installation, commit, PR or message to another person was performed in this content-only task.

## Complete output manifest (106 files)

- chatgpt/output/DONE.md
- chatgpt/output/check-handoff.ts
- chatgpt/output/lantern-of-hollowmere/bell.png
- chatgpt/output/lantern-of-hollowmere/bell.webp
- chatgpt/output/lantern-of-hollowmere/cover.png
- chatgpt/output/lantern-of-hollowmere/cover.webp
- chatgpt/output/lantern-of-hollowmere/crossing.png
- chatgpt/output/lantern-of-hollowmere/crossing.webp
- chatgpt/output/lantern-of-hollowmere/dawn.png
- chatgpt/output/lantern-of-hollowmere/dawn.webp
- chatgpt/output/lantern-of-hollowmere/landing.png
- chatgpt/output/lantern-of-hollowmere/landing.webp
- chatgpt/output/lantern-of-hollowmere/lights.png
- chatgpt/output/lantern-of-hollowmere/lights.webp
- chatgpt/output/lantern-of-hollowmere/maelis.png
- chatgpt/output/lantern-of-hollowmere/maelis.webp
- chatgpt/output/lantern-of-hollowmere/odda.png
- chatgpt/output/lantern-of-hollowmere/odda.webp
- chatgpt/output/openers.json
- chatgpt/output/stories/spirit-bathhouse-night-shift/art/cover.png
- chatgpt/output/stories/spirit-bathhouse-night-shift/art/cover.webp
- chatgpt/output/stories/spirit-bathhouse-night-shift/art/first-kettle.png
- chatgpt/output/stories/spirit-bathhouse-night-shift/art/first-kettle.webp
- chatgpt/output/stories/spirit-bathhouse-night-shift/art/genzo.png
- chatgpt/output/stories/spirit-bathhouse-night-shift/art/genzo.webp
- chatgpt/output/stories/spirit-bathhouse-night-shift/art/guest-tokens.png
- chatgpt/output/stories/spirit-bathhouse-night-shift/art/guest-tokens.webp
- chatgpt/output/stories/spirit-bathhouse-night-shift/art/morning-path.png
- chatgpt/output/stories/spirit-bathhouse-night-shift/art/morning-path.webp
- chatgpt/output/stories/spirit-bathhouse-night-shift/art/raku.png
- chatgpt/output/stories/spirit-bathhouse-night-shift/art/raku.webp
- chatgpt/output/stories/spirit-bathhouse-night-shift/art/river-bath.png
- chatgpt/output/stories/spirit-bathhouse-night-shift/art/river-bath.webp
- chatgpt/output/stories/spirit-bathhouse-night-shift/art/settled-apron.png
- chatgpt/output/stories/spirit-bathhouse-night-shift/art/settled-apron.webp
- chatgpt/output/stories/spirit-bathhouse-night-shift/art/seventh-night.png
- chatgpt/output/stories/spirit-bathhouse-night-shift/art/seventh-night.webp
- chatgpt/output/stories/spirit-bathhouse-night-shift/art/shared-rota.png
- chatgpt/output/stories/spirit-bathhouse-night-shift/art/shared-rota.webp
- chatgpt/output/stories/spirit-bathhouse-night-shift/art/steam-roof.png
- chatgpt/output/stories/spirit-bathhouse-night-shift/art/steam-roof.webp
- chatgpt/output/stories/spirit-bathhouse-night-shift/art/suzu.png
- chatgpt/output/stories/spirit-bathhouse-night-shift/art/suzu.webp
- chatgpt/output/stories/spirit-bathhouse-night-shift/art/visiting-lantern.png
- chatgpt/output/stories/spirit-bathhouse-night-shift/art/visiting-lantern.webp
- chatgpt/output/stories/spirit-bathhouse-night-shift/art/warm-cup.png
- chatgpt/output/stories/spirit-bathhouse-night-shift/art/warm-cup.webp
- chatgpt/output/stories/spirit-bathhouse-night-shift/story.json
- chatgpt/output/stories/the-caller-knows-your-house/art/answered.png
- chatgpt/output/stories/the-caller-knows-your-house/art/answered.webp
- chatgpt/output/stories/the-caller-knows-your-house/art/caller.png
- chatgpt/output/stories/the-caller-knows-your-house/art/caller.webp
- chatgpt/output/stories/the-caller-knows-your-house/art/choose-check.png
- chatgpt/output/stories/the-caller-knows-your-house/art/choose-check.webp
- chatgpt/output/stories/the-caller-knows-your-house/art/closed-loop.png
- chatgpt/output/stories/the-caller-knows-your-house/art/closed-loop.webp
- chatgpt/output/stories/the-caller-knows-your-house/art/cover.png
- chatgpt/output/stories/the-caller-knows-your-house/art/cover.webp
- chatgpt/output/stories/the-caller-knows-your-house/art/dead-air.png
- chatgpt/output/stories/the-caller-knows-your-house/art/dead-air.webp
- chatgpt/output/stories/the-caller-knows-your-house/art/delay-room.png
- chatgpt/output/stories/the-caller-knows-your-house/art/delay-room.webp
- chatgpt/output/stories/the-caller-knows-your-house/art/hal.png
- chatgpt/output/stories/the-caller-knows-your-house/art/hal.webp
- chatgpt/output/stories/the-caller-knows-your-house/art/last-ring.png
- chatgpt/output/stories/the-caller-knows-your-house/art/last-ring.webp
- chatgpt/output/stories/the-caller-knows-your-house/art/mira.png
- chatgpt/output/stories/the-caller-knows-your-house/art/mira.webp
- chatgpt/output/stories/the-caller-knows-your-house/art/open-line.png
- chatgpt/output/stories/the-caller-knows-your-house/art/open-line.webp
- chatgpt/output/stories/the-caller-knows-your-house/art/patch-board.png
- chatgpt/output/stories/the-caller-knows-your-house/art/patch-board.webp
- chatgpt/output/stories/the-caller-knows-your-house/art/porch-watch.png
- chatgpt/output/stories/the-caller-knows-your-house/art/porch-watch.webp
- chatgpt/output/stories/the-caller-knows-your-house/art/return-trace.png
- chatgpt/output/stories/the-caller-knows-your-house/art/return-trace.webp
- chatgpt/output/stories/the-caller-knows-your-house/story.json
- chatgpt/output/stories/the-truthful-balloon/art/blank-margin.png
- chatgpt/output/stories/the-truthful-balloon/art/blank-margin.webp
- chatgpt/output/stories/the-truthful-balloon/art/careful-return.png
- chatgpt/output/stories/the-truthful-balloon/art/careful-return.webp
- chatgpt/output/stories/the-truthful-balloon/art/cover.png
- chatgpt/output/stories/the-truthful-balloon/art/cover.webp
- chatgpt/output/stories/the-truthful-balloon/art/long-survey.png
- chatgpt/output/stories/the-truthful-balloon/art/long-survey.webp
- chatgpt/output/stories/the-truthful-balloon/art/map-table.png
- chatgpt/output/stories/the-truthful-balloon/art/map-table.webp
- chatgpt/output/stories/the-truthful-balloon/art/mooring.png
- chatgpt/output/stories/the-truthful-balloon/art/mooring.webp
- chatgpt/output/stories/the-truthful-balloon/art/pavo.png
- chatgpt/output/stories/the-truthful-balloon/art/pavo.webp
- chatgpt/output/stories/the-truthful-balloon/art/post-island.png
- chatgpt/output/stories/the-truthful-balloon/art/post-island.webp
- chatgpt/output/stories/the-truthful-balloon/art/reef-thermal.png
- chatgpt/output/stories/the-truthful-balloon/art/reef-thermal.webp
- chatgpt/output/stories/the-truthful-balloon/art/ren.png
- chatgpt/output/stories/the-truthful-balloon/art/ren.webp
- chatgpt/output/stories/the-truthful-balloon/art/route-wind.png
- chatgpt/output/stories/the-truthful-balloon/art/route-wind.webp
- chatgpt/output/stories/the-truthful-balloon/art/shared-chart.png
- chatgpt/output/stories/the-truthful-balloon/art/shared-chart.webp
- chatgpt/output/stories/the-truthful-balloon/art/siv.png
- chatgpt/output/stories/the-truthful-balloon/art/siv.webp
- chatgpt/output/stories/the-truthful-balloon/art/truthful-lift.png
- chatgpt/output/stories/the-truthful-balloon/art/truthful-lift.webp
- chatgpt/output/stories/the-truthful-balloon/story.json

## Additional files created for planning/verification

- chatgpt/PLAN.md (created in Phase 1, updated with production steering and actual limitations).
- chatgpt/work/art-audit.json
- chatgpt/work/art-generation-log.jsonl
- chatgpt/work/art-jobs.json
- chatgpt/work/build-content.mjs
- chatgpt/work/commit-normalized-art.ps1
- chatgpt/work/convert-art.py
- chatgpt/work/opener-details.txt
- chatgpt/work/review.html
- chatgpt/work/tsconfig.handoff.json
- chatgpt/work/verification-record.json

Pre-existing chatgpt/output/.gitkeep was preserved. MASTER_PROMPT.md, README.md, materials, reference copies and all game source/installed assets were preserved. Generated-image originals also remain in the tool's default generated_images directory; the project deliverables are the selected, normalized copies listed above. Task-owned temporary build and normalization folders were removed.
