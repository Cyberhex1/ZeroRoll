# Prompt pack for ChatGPT

Use these in order in one ChatGPT conversation. Attach `story.schema.json` and the example
`story.json` at the start. Replace the parts in angle brackets.

## 1. Story design

> You are designing an interactive story for ZeroRoll's Story mode. Category:
> <category id from the schema>. Rating: <everyone|teen|mature>. Mode: <story|character>.
> Premise: <one or two sentences, or "surprise me">.
>
> Write: a title; a blurb (2 sentences, no spoilers); the world (one paragraph the narrator
> keeps in mind); the tone; the player's role and what they carry; the narrator's style;
> and 2 to 4 cast members, each with a fixed physical appearance (hair, eyes, build,
> clothes), a voice and their stance toward the player.

## 2. Beat graph

> Now design 6 to 10 beats as a graph, with at least 2 endings (3 is better) and at least
> one real branch where the player's choice changes which beat comes next.
>
> For each beat give: id, title, a scene brief (what the narrator knows that the player
> does not), the goal as flag conditions, 2 to 4 authored choices (each sets flags and/or
> targets an exit), its exits, and a hint for players who get stuck.
>
> Rules: every beat must be reachable from the start; every non-ending beat needs exits and
> at least one choice that changes a goal flag; endings have no exits; choice targets must
> be in the beat's exits. Declare every flag (bool or counter) with a one-line description.

## 3. Art list

> List every image the story needs: a cover, one portrait per cast member, and one image per
> art cue (on beat entry, on a choice, or when a flag becomes true). For each give an art
> id, a file name (`<id>.webp`), alt text (one sentence) and an image prompt that repeats
> the cast appearance lines exactly. Then generate the images: WebP, 1024 px wide
> (portraits 768 x 768), 250 KB or less.

## 4. Skin

> Pick the look of the play screen. Start from the category's base skin and override only
> what this story needs: palette (background, surface, accent, text, muted, playerBubble,
> narratorBubble as #rrggbb, with readable contrast between text and the bubbles), fonts
> (heading: serif, sans, mono, display or hand; body: serif, sans or mono), bubble (rounded,
> square, soft or scroll), pattern (none, dots, grid, grain, stars, waves), backgroundArt
> (an art id or leave out), particles (none, embers, snow, petals, rain, motes, ash).

## 5. Assemble

> Assemble everything into one `story.json` that follows `story.schema.json` exactly, with
> `"schemaVersion": 1`. Output only the JSON.

## 6. Fix these errors

> `story:check` reported the problems below. Fix every ERROR without changing anything
> else, and fix warnings where it makes sense. Output the whole corrected `story.json`.
>
> <paste the story:check output>
