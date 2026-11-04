/** Read-only acceptance audit. Run at repository root: npx tsx chatgpt/output/check-handoff.ts */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { CATEGORY_CONTENT } from '../../src/content/categories';
import { CATEGORY_IDS } from '../../src/content/categoryIds';
import { validateContent } from '../../src/content/validate';
import type { CategoryContent, Opener } from '../../src/content/types';
import { checkStory, formatIssues } from '../../src/story/validate';
import { applyChoice, newState, goalStatus } from '../../src/story/engine';
import { resolveSkin } from '../../src/story/skins';
import { directorBlock, parseNarratorReply, storySystemPrompt } from '../../src/story/prompt';
import type { StoryState } from '../../src/story/engine';

const root = 'chatgpt/output';
const textOnly = process.argv.includes('--text-only');
const read = (file: string): any => JSON.parse(readFileSync(file, 'utf8'));
const strings = (v: unknown): string[] => typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(strings) : v && typeof v === 'object' ? Object.values(v).flatMap(strings) : [];
const normalized = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const noJobs = /\b(chief|director|officer|ceo|chairman|curator|historian|detective|agent|captain|doctor|dr|professor|manager|executive|heir|heiress|sovereign|knight|lord|lady|king|queen|prince|princess|commander|sergeant|general|priest|priestess|analyst|engineer|lawyer|attorney|nurse|surgeon|scholar|clerk|intern|assistant)\b/i;
const actionVerbs = new Set('Approach Arrange Carry Fold Leave Observe Raise Radio Tell Watch Board Trim Question Trace Stall Slip Secure Bargain Descend Compare Climb Ask Catch Reinforce Signal Offer Inspect Follow Copy Lash Brace Call Release Examine Hire Present Study Lever Pass Turn Send Show Lead Measure Clear Unroll Rotate Request Open Lift Listen Lay Gather Read Pour Seal Speak Hear Shore Light Sing Taste Hum Sketch Match Unfasten Answer Tilt Test Trade Calculate Rig Check Move Stop Close Cover Record Mark Prepare Take Enter Warn Stretch Grasp Fit Tie Set Turn Unfasten Ration Identify Organize Discuss Rehearse Request Locate'.toLowerCase().split(' '));
const inRange = (s: unknown, min: number, max: number, where: string) => {
  assert.equal(typeof s, 'string', where);
  assert.ok((s as string).trim().length >= min && (s as string).trim().length <= max, `${where}: length ${(s as string).length}`);
};
const keyword = (text: string, word: string) => {
  const prefix = word.endsWith('*');
  const escaped = (prefix ? word.slice(0, -1) : word).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(prefix ? `\\b${escaped}` : `\\b${escaped}(?:s|es)?\\b`, 'i').test(text);
};
const payload = read(join(root, 'openers.json')) as Record<string, Opener[]>;
const spec = read('chatgpt/materials/openers-needed.json');
assert.deepEqual(Object.keys(payload).sort(), Object.keys(spec).sort(), 'Exactly the eleven requested categories');
const merged: Record<string, CategoryContent> = { ...CATEGORY_CONTENT };
let openerCount = 0;
for (const [category, added] of Object.entries(payload)) {
  const c = (CATEGORY_CONTENT as Record<string, CategoryContent>)[category];
  assert.equal(c.openers.length, spec[category].have, `${category}: live snapshot changed; do not install blindly`);
  assert.equal(added.length, spec[category].write, category);
  assert.deepEqual(added.map(o => o.id), spec[category].ids_to_use, `${category}: ID order`);
  for (const o of added) {
    const at = `${category}/${o.id}`;
    assert.deepEqual(Object.keys(o).sort(), ['id', 'title', 'tagline', 'premise', 'hero', 'actions', 'gear', 'spells', 'hp'].sort(), `${at}: fields`);
    inRange(o.title, 3, 70, at + ' title'); inRange(o.tagline, 10, 140, at + ' tagline'); inRange(o.premise, 80, 700, at + ' premise');
    inRange(o.hero.name, 2, 40, at + ' hero'); inRange(o.hero.role, 3, 60, at + ' role'); inRange(o.hero.origin, 3, 60, at + ' origin');
    assert.ok(!noJobs.test(o.hero.origin), `${at}: occupational origin`);
    assert.ok(/\byou\b/i.test(o.premise), `${at}: second person`);
    assert.equal(o.actions.length, 3, at);
    assert.equal(new Set(o.actions.map(normalized)).size, 3, `${at}: distinct first moves`);
    for (const a of o.actions) { inRange(a, 8, 160, at + ' action'); assert.ok(actionVerbs.has(a.split(' ')[0].toLowerCase()), `${at}: verb-led action: ${a}`); }
    assert.ok(o.gear.length >= 2 && o.gear.length <= 4, at + ' gear count');
    assert.ok(o.gear.some(g => g.type === 'weapon' && g.isEquipped === true), at + ' equipped weapon');
    for (const g of o.gear) { assert.ok(['weapon', 'armor', 'potion', 'scroll', 'relic', 'misc'].includes(g.type), at + ' gear type'); inRange(g.name, 2, 100, at + ' gear name'); }
    assert.ok(Number.isInteger(o.hp) && o.hp >= 6 && o.hp <= 18, at + ' hp');
    assert.ok(Array.isArray(o.spells) && o.spells.length <= 3, at + ' abilities');
    if (['real_life', 'apocalypse', 'zombie', 'historical_adventure'].includes(category)) assert.deepEqual(o.spells, [], at + ' grounded abilities');
    for (const s of strings(o)) assert.ok(!/[\[\]{}<>`]/.test(s), at + ' parser/markup characters');
    for (const word of c.profile.avoidKeywords) assert.ok(!keyword(strings(o).join('\n'), word), `${at}: forbidden ${word}`);
    openerCount++;
  }
  merged[category] = { ...c, openers: [...c.openers, ...added] };
}
assert.equal(openerCount, 74);
const content = validateContent(merged, [...CATEGORY_IDS], { strict: true });
assert.deepEqual(content, { errors: [], gaps: [] }, JSON.stringify(content));
const allOpeners = Object.values(merged).flatMap(c => c.openers);
assert.equal(allOpeners.length, 150);
for (const key of ['id', 'title', 'premise'] as const) assert.equal(new Set(allOpeners.map(o => normalized(o[key]))).size, 150, key + ' unique');
assert.equal(new Set(allOpeners.map(o => normalized(o.hero.name))).size, 150, 'hero names unique');
console.log('OPENERS OK: 74 new + 76 existing; all 15 categories have 10; strict validator and brief checks pass.');

const luminance = (hex: string) => {
  const values = hex.slice(1).match(/../g)!.map(h => parseInt(h, 16) / 255).map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722;
};
const contrast = (a: string, b: string) => (Math.max(luminance(a), luminance(b)) + 0.05) / (Math.min(luminance(a), luminance(b)) + 0.05);
const hashes = new Set<string>();
let imagePairs = 0;
const checkImages = (dir: string, id: string, portraits: Set<string>) => {
  const png = readFileSync(join(dir, id + '.png'));
  const webp = readFileSync(join(dir, id + '.webp'));
  assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', id + ' PNG signature');
  const width = png.readUInt32BE(16), height = png.readUInt32BE(20);
  assert.equal(width, portraits.has(id) ? 768 : 1024, id + ' width');
  assert.equal(height, portraits.has(id) ? 768 : 576, id + ' height');
  assert.equal(webp.subarray(0, 4).toString('ascii'), 'RIFF');
  assert.equal(webp.subarray(8, 12).toString('ascii'), 'WEBP');
  assert.ok(webp.length <= 250000, id + ' <=250000 bytes');
  const digest = createHash('sha256').update(png).digest('hex');
  assert.ok(!hashes.has(digest), id + ' is not a duplicate image'); hashes.add(digest);
  imagePairs++;
};
const ids = ['spirit-bathhouse-night-shift', 'the-caller-knows-your-house', 'the-truthful-balloon'];
for (const id of ids) {
  const dir = join(root, 'stories', id), raw = read(join(dir, 'story.json'));
  const checked = checkStory(raw, textOnly ? undefined : readdirSync(join(dir, 'art')));
  assert.ok(checked.ok, formatIssues(checked));
  assert.deepEqual(checked.warnings, [], formatIssues(checked));
  const story = checked.story!;
  assert.equal(story.meta.id, id); assert.equal(story.meta.author, 'ohnna with ChatGPT');
  assert.equal(story.beats.length, 9); assert.equal(story.cast.length, 3); assert.equal(Object.keys(story.flags).length, 8);
  assert.equal(story.beats.filter(b => b.isEnding).length, 3);
  assert.equal(Object.keys(story.art).length, 14);
  assert.equal(story.beats.flatMap(b => b.artCues).length, 10);
  assert.equal(story.meta.blurb.match(/[.!?](?:\s|$)/g)?.length, 2, id + ' two-sentence blurb');
  for (const b of story.beats) if (!b.isEnding) {
    assert.ok(b.choices.length >= 2 && b.choices.length <= 4);
    assert.ok(b.hint && b.goal.length > 0);
    for (const c of b.choices) assert.ok(c.target && b.exits.includes(c.target));
  }
  const queue: { state: StoryState; path: string[] }[] = [{ state: newState(story), path: [] }];
  const seen = new Set<string>(), reached = new Set<string>(), combinations = new Map<string, string[]>();
  while (queue.length) {
    const { state, path: witness } = queue.shift()!;
    const key = JSON.stringify([state.beat, state.flags]);
    if (seen.has(key)) continue;
    seen.add(key); reached.add(state.beat);
    const restored = JSON.parse(JSON.stringify(state)) as StoryState;
    for (const field of ['storyId', 'beat', 'flags', 'visited', 'turnsInBeat', 'turns', 'ending', 'notice'] as const) {
      assert.deepEqual(restored[field], state[field], id + ' state survives serialization: ' + field);
    }
    if (state.ending) { combinations.set(`${state.flags.route}:${state.ending}`, witness); continue; }
    const b = story.beats.find(b => b.id === state.beat)!;
    for (const c of b.choices) {
      const result = applyChoice(story, state, c.id);
      assert.ok(!result.events.some(e => e.kind === 'rejected'), id + '/' + c.id);
      assert.ok(goalStatus(b, result.state.flags).open, id + ': goal satisfied by ' + c.id);
      queue.push({ state: result.state, path: [...witness, c.id] });
    }
    for (const variant of ['full', 'compact'] as const) {
      const prompt = storySystemPrompt(story, variant, 180) + '\n' + directorBlock(story, state, variant);
      assert.ok(prompt.includes(story.world) && prompt.includes(b.sceneBrief));
      if (id === ids[0]) assert.ok(prompt.includes('You are Genzo') && prompt.includes('first person'));
    }
  }
  assert.equal(reached.size, 9); assert.equal(combinations.size, 6);
  const parsed = parseNarratorReply('A quiet moment.\n```json\n{"beatReached":"none","flags":{},"choices":[]}\n```');
  assert.equal(parsed.narration, 'A quiet moment.');
  const skin = resolveSkin(story.meta.category, story.skin);
  let minContrast = Infinity;
  for (const foreground of ['text', 'muted'] as const) for (const background of ['background', 'surface', 'playerBubble', 'narratorBubble'] as const) {
    const ratio = contrast(skin.palette[foreground], skin.palette[background]);
    assert.ok(ratio >= 4.5, `${id}: ${foreground}/${background} contrast ${ratio.toFixed(2)}`);
    minContrast = Math.min(minContrast, ratio);
  }
  if (!textOnly) {
    const portraits = new Set(story.cast.map(c => c.portrait!));
    for (const artId of Object.keys(story.art)) checkImages(join(dir, 'art'), artId, portraits);
  }
  console.log(`STORY OK ${id}: 9 reachable beats; 6 route/ending combinations; 14 art entries; 10 cues; minimum text contrast ${minContrast.toFixed(2)}:1; no warnings.`);
  for (const [combo, witness] of combinations) console.log(`  ${combo}: ${witness.join(' -> ')}`);
}
const lantern = read('stories/lantern-of-hollowmere/story.json');
assert.deepEqual(Object.keys(lantern.art).sort(), ['bell', 'cover', 'crossing', 'dawn', 'landing', 'lights', 'maelis', 'odda']);
if (!textOnly) {
  for (const id of Object.keys(lantern.art)) checkImages(join(root, 'lantern-of-hollowmere'), id, new Set(['odda', 'maelis']));
  assert.equal(imagePairs, 50);
  console.log('ART OK: all 50 unique PNG masters and 50 WebPs have correct signatures, dimensions and byte limits.');
} else console.log('TEXT-ONLY AUDIT: image existence, dimensions, encoding and size intentionally not certified.');
assert.ok(existsSync('chatgpt/PLAN.md'));
console.log('HANDOFF AUDIT OK');
