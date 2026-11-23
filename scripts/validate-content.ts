/**
 * Validates src/content (run in CI: npm run content:check; add --strict to require
 * the full 10 openers per category). Also checks the 0.2 story decks.
 */
import { CATEGORY_CONTENT } from '../src/content/categories';
import { validateContent } from '../src/content/validate';
import { CATEGORY_IDS } from '../src/content/categoryIds';
import { STORY_DECKS } from '../src/content/forge/decks';
import { validateDecks } from '../src/content/forge/validateDecks';
import { FAMILY_TRADITIONS, NAME_TRADITIONS } from '../src/content/forge/names';

const strict = process.argv.includes('--strict');
const { errors, gaps } = validateContent(CATEGORY_CONTENT, [...CATEGORY_IDS], { strict });
const decks = validateDecks(STORY_DECKS, CATEGORY_CONTENT, CATEGORY_IDS, { traditions: NAME_TRADITIONS, familyMap: FAMILY_TRADITIONS });
for (const g of gaps) console.log(`gap   ${g}`);
for (const w of decks.warnings) console.log(`warn  ${w}`);
for (const e of [...errors, ...decks.errors]) console.log(`error ${e}`);
const n = errors.length + decks.errors.length;
console.log(`\n${n} error(s), ${gaps.length} gap(s), ${decks.warnings.length} deck warning(s).`);
process.exit(n ? 1 : 0);
