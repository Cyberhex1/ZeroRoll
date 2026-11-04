# Master prompt for ChatGPT

Paste everything inside the box into ChatGPT, after pointing it at this folder (`C:\code\zeroroll`).

```
You are the content designer for ZeroRoll, an AI storytelling game. This folder is the full game repository. Claude built the game and will check and install whatever you make; your job is the creative content. Do not change any game code.

Start by reading, in this order:
1. chatgpt/README.md (what this handoff is)
2. chatgpt/materials/opener-rules.md and chatgpt/materials/openers-needed.json
3. chatgpt/materials/stories-brief.md, then docs/story-authoring/README.md, docs/story-authoring/story.schema.json, docs/story-authoring/art-specs.md and stories/lantern-of-hollowmere/story.json
4. chatgpt/materials/art-style.md and chatgpt/materials/lantern-art.md
5. For tone, two or three of the category files in src/content/categories/ that already have 10 openers (fantasy.ts, horror.ts, cozy_ghibli.ts).

There are three jobs:
A. 74 new D&D openers across 11 categories (counts and ids in openers-needed.json).
B. Three complete Story mode stories with all their pictures (stories-brief.md).
C. Eight new pictures for The Lantern of Hollowmere (lantern-art.md).

PHASE 1: PLAN. Do not write any final content yet. Write chatgpt/PLAN.md containing:
- For job A: per category, a one-line concept for each opener (title, hero name, the situation), checked against the banned words and the titles and hero names already taken.
- For job B: per story, the title, blurb, cast (with appearance lines), the beat graph (beat ids, what happens, goal flags, exits, which beats are endings, where the branch is), the flag list, and the art list (art id, what it shows, which cue triggers it).
- For job C: one line per picture on how you will compose it.
- The order you will work in and how you will check each piece against the rules and the schema before handing it over.
- Any question or problem you see in the materials.
Then stop and wait for me to say "go".

PHASE 2: BUILD, after I say "go". Follow the plan and write:
- chatgpt/output/openers.json: one JSON object, keys are category ids, values are arrays of opener objects exactly as described in opener-rules.md.
- chatgpt/output/stories/<story id>/story.json for each story, valid against docs/story-authoring/story.schema.json, plus its pictures in chatgpt/output/stories/<story id>/art/.
- chatgpt/output/lantern-of-hollowmere/ with the 8 pictures.
Before saving each file, re-check it against every rule in the materials (character limits, banned words, origins that are not jobs, unique titles and names, exactly 10 openers per category, every beat reachable, endings without exits, choice targets inside exits, every art id referenced and listed). If the repo's tools can run, run `npm run content:check` and `npm run story:check <folder>`; otherwise check by reading. When everything is saved, write chatgpt/output/DONE.md listing every file you created and anything you were unsure about.
```

When ChatGPT has written `chatgpt/output/DONE.md`, tell Claude in the project thread. Claude checks everything, converts the pictures, and puts it into the site in one pull request.
