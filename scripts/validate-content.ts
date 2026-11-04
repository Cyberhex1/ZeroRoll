/**
 * Validates src/content (run in CI: npm run content:check; add --strict to require
 * the full 10 openers per category).
 */
import { CATEGORY_CONTENT } from '../src/content/categories';
import { validateContent } from '../src/content/validate';
import { CATEGORY_IDS } from '../src/content/categoryIds';

const strict = process.argv.includes('--strict');
const { errors, gaps } = validateContent(CATEGORY_CONTENT, [...CATEGORY_IDS], { strict });
for (const g of gaps) console.log(`gap   ${g}`);
for (const e of errors) console.log(`error ${e}`);
console.log(`\n${errors.length} error(s), ${gaps.length} gap(s).`);
process.exit(errors.length ? 1 : 0);
