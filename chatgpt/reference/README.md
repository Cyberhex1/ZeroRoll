# Reference copies

These are read-only copies of the game files ChatGPT needs, taken from branch `claude/project-thread-scl7cq` at commit `24e8c72`. They use the same paths as in the repo. If a copy and the real file disagree, the real file wins. Do not edit anything here.

| Path | Why it is here |
| --- | --- |
| `AGENTS.md`, `.agents/rules/zeroroll-rules.md` | Project rules. |
| `package.json` | The check commands (`content:check`, `story:check`, `story:import`). |
| `src/content/types.ts` | The `Opener` and category types. |
| `src/content/validate.ts`, `scripts/validate-content.ts` | The opener checker. |
| `src/content/categoryIds.ts` | The category ids. |
| `src/content/categories/*.ts` | Every category, with existing openers, voice and banned words. |
| `docs/story-authoring/*` | The story kit: how stories work, the schema, art specs, prompts. |
| `stories/lantern-of-hollowmere/story.json` | Complete example story. |
| `src/story/schema.ts`, `src/story/validate.ts`, `scripts/story-check.ts`, `scripts/story-schema.ts` | The story format and checker. |
| `src/story/skins.ts`, `src/story/art.ts` | Allowed skin values and how art is loaded. |
| `scripts/story-import.ts` | How a finished story is installed. |
