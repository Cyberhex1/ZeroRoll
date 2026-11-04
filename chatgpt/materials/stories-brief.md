# Three Story mode stories

Read first: `docs/story-authoring/README.md` (how stories work), `docs/story-authoring/story.schema.json` (the exact format), `docs/story-authoring/art-specs.md`, and the complete example `stories/lantern-of-hollowmere/story.json`. The validator is `src/story/validate.ts`.

| Folder (story id) | Category | Mode | Rating | Premise (can be improved, not replaced) |
| --- | --- | --- | --- | --- |
| `spirit-bathhouse-night-shift` | cozy_ghibli | character (player talks with the tanuki owner) | everyone | You are the new night-shift helper at a bathhouse for tired spirits, and the owner, a grumpy old tanuki, has one week to decide whether to keep you. |
| `the-caller-knows-your-house` | horror | story | teen | A late-night radio host keeps getting calls from a listener who describes, in real time, what is happening inside the host's own empty house. |
| `the-truthful-balloon` | adventure | story | everyone | A cartographer's apprentice inherits a half-finished sky map and a balloon that only flies when someone tells it the truth. |

## Each story needs

1. **Design**: title; blurb (2 sentences, no spoilers); world (one paragraph the narrator keeps in mind); tone; the player's role and what they carry; narrator style; 2 to 4 cast members, each with a fixed `appearance` (hair, eyes, build, clothes), a `voice` and a `stance` toward the player. Character mode: set `meta.mode` to `"character"` and `meta.character` to that cast member's id, and write their voice in detail.
2. **Beats**: 6 to 10 beats as a graph, at least 2 endings (3 is better), at least one real branch where a choice changes the next beat. Each beat: id, title, scene brief (what the narrator knows that the player does not), goal as flag conditions, 2 to 4 authored choices (each sets flags and/or targets an exit), exits, and a hint. Every beat reachable from `start`; every non-ending beat has exits and at least one choice that changes a goal flag; endings have `"isEnding": true` and no exits; choice targets are in the beat's exits. Declare every flag (bool or counter) with a one-line description.
3. **Art**: a cover, one portrait per cast member, 8 to 12 art cues (on beat entry, on a choice, or when a flag becomes true). Each `art` entry: `{ "file": "<id>.webp", "alt": "<one sentence>" }`.
4. **Skin**: override only what this story needs, with values the schema allows.
5. `"schemaVersion": 1`, `meta.author` = `"ohnna with ChatGPT"`.

## Where to put it

```
chatgpt/output/stories/<story id>/story.json
chatgpt/output/stories/<story id>/art/<art id>.png   (or .webp)
```

Art names in `story.json` stay `.webp`; Claude converts PNGs to WebP at the right size. See `materials/art-style.md` for the picture style.
