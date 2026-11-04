# Master prompt for ChatGPT

Point ChatGPT at the folder `C:\code\zeroroll`, then paste everything inside the box.

```
You are the content designer and implementation planner for ZeroRoll, an AI storytelling game. The folder C:\code\zeroroll is the full game repository (branch claude/project-thread-scl7cq). Everything you need is inside chatgpt/. Claude built the game and will check and install what you make. Your job is the creative content and a precise plan for putting it into the game. Do not change any file outside chatgpt/.

READ FIRST, IN THIS ORDER
1. chatgpt/README.md: what this handoff is.
2. chatgpt/materials/implementation-targets.md: what exists now, what to make, and which game file each piece ends up in.
3. chatgpt/materials/opener-rules.md and chatgpt/materials/openers-needed.json: the D&D opener rules and, per category, the ids, voice, banned words and titles/hero names already taken.
4. chatgpt/materials/stories-brief.md, then chatgpt/reference/docs/story-authoring/README.md, story.schema.json, art-specs.md and prompts.md, then chatgpt/reference/stories/lantern-of-hollowmere/story.json (a complete example).
5. chatgpt/materials/art-style.md and chatgpt/materials/lantern-art.md.
6. The checkers, so you know exactly what fails: chatgpt/reference/src/content/types.ts, chatgpt/reference/src/content/validate.ts, chatgpt/reference/src/story/schema.ts, chatgpt/reference/src/story/validate.ts, chatgpt/reference/src/story/skins.ts.
7. For tone: chatgpt/reference/src/content/categories/fantasy.ts, horror.ts and cozy_ghibli.ts (each already has 10 openers), plus the category file of every category you write for.
chatgpt/reference/README.md lists every reference file. Those files are copies. If a copy differs from the real file in the repo, the real file wins.

THE WORK
A. 74 new D&D openers across 11 categories (counts and ids in openers-needed.json).
B. Three complete Story mode stories with all their pictures (stories-brief.md).
C. Eight new pictures for The Lantern of Hollowmere (lantern-art.md).

PHASE 1: PLAN. Write no final content yet. Create chatgpt/PLAN.md with these sections:

1. Summary: what you will deliver, file by file, with counts.
2. Job A plan: for each category, one line per opener (id, title, hero name, hero role, hero origin, the situation in a sentence). Before writing it down, check each line against the banned words, the taken titles and names, and the forbidden origin words. Say that you checked.
3. Job B plan: for each story, give:
   - the title, blurb, world, tone and player role
   - the cast, with appearance, voice and stance
   - the beat graph as a table (beat id, what happens, goal flags, exits, ending or not), with the branch point marked
   - the flag list
   - the art list (art id, what it shows, the cue that triggers it)
   - the skin overrides
   Then prove that every beat is reachable from start and that every non-ending beat has a choice that changes a goal flag.
4. Job C plan: one line per picture on composition and palette.
5. Implementation plan: for every output file, the exact game file it goes into, how it is merged (for openers, appended to the "openers" array of src/content/categories/<id>.ts in id order), the command that checks it, and what "done" looks like. Follow implementation-targets.md.
6. Work order and self-checks: the order you will build in, and the checklist you will run on each file before saving it.
7. Risks and questions: anything unclear, contradictory or missing in the materials.
Then stop and wait for me to say "go".

PHASE 2: BUILD, after I say "go". Follow PLAN.md and write:
- chatgpt/output/openers.json: one JSON object. Keys are category ids. Values are arrays of only the NEW opener objects, exactly as described in opener-rules.md.
- chatgpt/output/stories/<story id>/story.json for each story, valid against the schema, plus its pictures in chatgpt/output/stories/<story id>/art/<art id>.png.
- chatgpt/output/lantern-of-hollowmere/<name>.png for the 8 pictures.
Before saving each file, re-check it against every rule:
- character limits and banned words
- origins that are not jobs
- titles and hero names unique across all categories
- each category reaching exactly 10 openers
- every beat reachable, endings without exits, choice targets inside exits
- every flag declared, every art id both referenced and listed
If you can run commands in this folder, run `npm ci` once, then `npm run story:check chatgpt/output/stories/<story id>` for each story and fix every error. Ignore only one kind of error: "The file "<id>.webp" is not in the art folder" when you saved that picture as <id>.png. story.json must keep the .webp names, because Claude converts the pictures. (`npm run content:check` reads src/, which you must not edit, so it will keep reporting the short categories until Claude installs your openers. Check openers by reading src/content/validate.ts.) If you cannot run commands, check by reading the validators.
When everything is saved, write chatgpt/output/DONE.md with:
- every file you created
- the result of each check you ran
- anything you were unsure about
- any place where you departed from PLAN.md, and why
```

When `chatgpt/PLAN.md` is written, read it (or ask Claude to review it) before you say "go". When ChatGPT has written `chatgpt/output/DONE.md`, tell Claude in the project thread. Claude will check everything, convert the pictures and install it all in one pull request.
