/** npm run story:schema: writes docs/story-authoring/story.schema.json from the zod schema. */
import { writeFileSync } from 'node:fs';
import { z } from 'zod';
import { StorySchema } from '../src/story/schema';

const schema = z.toJSONSchema(StorySchema, { io: 'input', unrepresentable: 'any' });
writeFileSync('docs/story-authoring/story.schema.json', JSON.stringify({ title: 'ZeroRoll story package', ...schema }, null, 2) + '\n');
console.log('wrote docs/story-authoring/story.schema.json');
