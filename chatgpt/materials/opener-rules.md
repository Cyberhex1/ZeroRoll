# Opener rules

An opener is a ready-to-play D&D campaign start. Picking one on the setup screen fills every setup field. The type is `Opener` in `src/content/types.ts`; `src/content/validate.ts` enforces these rules, and `npm run content:check` runs it.

Each category needs **exactly 10** openers. `materials/openers-needed.json` lists, per category, how many to write, the ids to use, the voice and atmosphere, the banned words, and the titles and hero names already taken.

## Fields and limits

| Field | Rule |
| --- | --- |
| `id` | The id given in `openers-needed.json` (lower-case letters, digits, underscores). |
| `title` | 3 to 70 characters. Unique across all categories. |
| `tagline` | 10 to 140 characters, one punchy line. |
| `premise` | 80 to 700 characters, second person ("you"), the situation at the moment play starts, ending on pressure that demands a choice. Unique. |
| `hero.name` | 2 to 40 characters, a fresh name. Unique across all categories. |
| `hero.role` | 3 to 60 characters, what the hero does ("Smuggler Pilot"). |
| `hero.origin` | 3 to 60 characters, a people, species or background ("Harbor-born human", "Spartan"). **Never** a job or rank: none of chief, director, officer, ceo, chairman, curator, historian, detective, agent, captain, doctor, dr, professor, manager, executive, heir, heiress, sovereign, knight, lord, lady, king, queen, prince, princess, commander, sergeant, general, priest, priestess, analyst, engineer, lawyer, attorney, nurse, surgeon, scholar, clerk, intern, assistant. |
| `actions` | Exactly 3 different first moves, each 8 to 160 characters, starting with a verb. |
| `gear` | 2 to 4 items `{ "name", "type" }`, type one of `weapon`, `armor`, `potion`, `scroll`, `relic`, `misc`; one weapon has `"isEquipped": true`. |
| `spells` | 0 to 3 short ability names that fit the category; `[]` when magic does not fit (real_life, apocalypse, zombie). |
| `hp` | Whole number, 6 to 18 (the validator allows 4 to 40). |

## Also

- Every opener in a category is a different situation, place and hero.
- None of the category's banned words anywhere (title, tagline, premise, role, origin, actions, gear names). Whole words, plus plurals; a word ending in `*` bans every word starting that way.
- No square brackets, curly braces, backticks or HTML tags in any text.
- Match the style of the openers already in the category file.
