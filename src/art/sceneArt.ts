/**
 * Scene art: a picture of the moment, painted by one of Google's image models with the
 * player's own Gemini key and shown under the Game Master's text when it is ready.
 *
 * Pictures do not stream and each one costs money (no free tier), so the game paints only
 * at key moments (the opening, a new place, a chapter change, a twist, an ambush or crisis,
 * a hero transformation, the ending), never every turn, and the player can turn it off or
 * paint only on request. A failed picture is shown as failed with a retry button; nothing
 * is substituted (no silent fallback).
 *
 * Which image models are offered: only the ones that answered a probe with this key
 * (ohnna's rule, 2026-11-04). The probe asks for a one-word TEXT reply, so it costs a few
 * text tokens rather than a picture.
 */
import type { CharacterSheet, CourseChangeAlert, ExperienceCategory, StateDelta } from '../types';
import { AIError, classifyAIError } from '../lib/aiErrors';
import { recordGeminiUsage, getGeminiUsageToday, pacificDay } from '../ai/quota';
import { withTimeout } from '../ai/transport';
import { idb } from '../storage/db';
import { uid } from '../lib/ids';
import { IMG_REF } from '../lib/portraits';
import { isMatureContentEnabled } from '../lib/contentRating';

/* --------------------------------- models --------------------------------- */

export interface ImageModelInfo {
  id: string;
  label: string;
  /** Dollars per million output tokens (Google's paid Standard price, late 2026). */
  pricePerMTok: number;
  note: string;
}

/**
 * Known image models, cheapest and fastest first. Prices from
 * https://ai.google.dev/gemini-api/docs/pricing (a 1K picture is about 1,120 output tokens).
 */
export const IMAGE_MODELS: ImageModelInfo[] = [
  { id: 'gemini-3.1-flash-lite-image', label: 'Nano Banana 2 Lite', pricePerMTok: 30, note: 'fast' },
  { id: 'gemini-nano-banana-2.1', label: 'Nano Banana 2.1', pricePerMTok: 30, note: 'newer, same price' },
  { id: 'gemini-3.1-flash-image', label: 'Nano Banana 2', pricePerMTok: 60, note: 'more detail' },
  { id: 'gemini-3-pro-image', label: 'Nano Banana Pro', pricePerMTok: 120, note: 'best, slowest' },
  { id: 'gemini-2.5-flash-image', label: 'Nano Banana (older)', pricePerMTok: 30, note: 'older model' }
];
export const DEFAULT_IMAGE_MODEL = IMAGE_MODELS[0].id;
const TOKENS_PER_PICTURE = 1120;

export function imageModelInfo(id: string): ImageModelInfo | undefined {
  return IMAGE_MODELS.find((m) => m.id === id);
}

export function isImageModel(id: string): boolean {
  return /-image(-|$)|nano-banana|^imagen/.test(id);
}

/** Rough price of one picture, e.g. "about 3¢". */
export function pictureCostLabel(model: string): string {
  const info = imageModelInfo(model);
  if (!info) return 'price unknown';
  const cents = (info.pricePerMTok * TOKENS_PER_PICTURE) / 10_000;
  return `about ${cents < 10 ? cents.toFixed(1).replace(/\.0$/, '') : Math.round(cents)}¢`;
}

/** Dollars spent on pictures today in this browser, from the usage log's output tokens. */
export function pictureSpendToday(now = Date.now()): { pictures: number; dollars: number } {
  const usage = getGeminiUsageToday(now);
  let dollars = 0;
  for (const [model, u] of Object.entries(usage)) {
    if (!isImageModel(model)) continue;
    const rate = imageModelInfo(model)?.pricePerMTok ?? 60;
    dollars += (u.outputTokens * rate) / 1_000_000;
  }
  return { pictures: readPictureLog(now).count, dollars };
}

/* -------------------------------- settings -------------------------------- */

/** off: never; key: key moments plus the paint button; ask: only the paint button. */
export type SceneArtMode = 'off' | 'key' | 'ask';

const MODE_KEY = 'zeroroll_scene_art';
const MODEL_KEY = 'zeroroll_scene_art_model';
const CAP_KEY = 'zeroroll_scene_art_daily_cap';
const USABLE_KEY = 'zeroroll_gemini_usable_image_models';
const PICTURE_LOG_KEY = 'zeroroll_scene_art_today';
export const DEFAULT_DAILY_CAP = 20;

const listeners = new Set<() => void>();
export function subscribeSceneArtSettings(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
const changed = () => listeners.forEach((fn) => fn());

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch (_) {
    return null;
  }
}
function write(key: string, value: string | null): void {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch (_) {}
  changed();
}

/** Off until the player turns it on: pictures cost money on their key (like portraits, opt-in). */
export function getSceneArtMode(): SceneArtMode {
  const v = read(MODE_KEY);
  return v === 'key' || v === 'ask' ? v : 'off';
}
export function setSceneArtMode(mode: SceneArtMode): void {
  write(MODE_KEY, mode);
}

/** Image models that answered the last probe with this key (null = never probed). */
export function getUsableImageModels(): string[] | null {
  try {
    const parsed = JSON.parse(read(USABLE_KEY) || 'null');
    return Array.isArray(parsed?.models) ? parsed.models.filter((m: unknown) => typeof m === 'string') : null;
  } catch (_) {
    return null;
  }
}
export function setUsableImageModels(models: string[] | null): void {
  write(USABLE_KEY, models ? JSON.stringify({ models, checkedAt: Date.now() }) : null);
}

/** The chosen model if the key can use it, else the first usable one in price order. */
export function getSceneArtModel(): string | null {
  const usable = getUsableImageModels();
  if (!usable || !usable.length) return null;
  const chosen = read(MODEL_KEY);
  if (chosen && usable.includes(chosen)) return chosen;
  return IMAGE_MODELS.map((m) => m.id).find((m) => usable.includes(m)) ?? usable[0];
}
export function setSceneArtModel(model: string): void {
  write(MODEL_KEY, model);
}

export function getDailyCap(): number {
  const n = Number(read(CAP_KEY));
  return Number.isFinite(n) && n > 0 ? Math.min(200, Math.round(n)) : DEFAULT_DAILY_CAP;
}
export function setDailyCap(n: number): void {
  write(CAP_KEY, String(Math.max(1, Math.min(200, Math.round(n)))));
}

function readPictureLog(now = Date.now()): { day: string; count: number } {
  const day = pacificDay(now);
  try {
    const parsed = JSON.parse(read(PICTURE_LOG_KEY) || 'null');
    if (parsed?.day === day && typeof parsed.count === 'number') return parsed;
  } catch (_) {}
  return { day, count: 0 };
}
function countPicture(now = Date.now()): void {
  const log = readPictureLog(now);
  write(PICTURE_LOG_KEY, JSON.stringify({ day: log.day, count: log.count + 1 }));
}
export function picturesToday(now = Date.now()): number {
  return readPictureLog(now).count;
}

/* ------------------------------ model probing ----------------------------- */

/** Image models worth probing from the key's model list: current ones, no dated previews. */
export function imageProbeCandidates(listed: string[]): string[] {
  const known = IMAGE_MODELS.map((m) => m.id).filter((m) => listed.includes(m));
  return known;
}

/** Lists the key's image models (the text model list filters them out). */
export async function listImageModels(apiKey: string): Promise<string[]> {
  const res = await withTimeout(
    (signal) => fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=1000', { headers: { 'x-goog-api-key': apiKey.trim() }, signal }),
    20_000,
    'gemini'
  );
  if (!res.ok) throw classifyAIError({ status: res.status, message: `[Google Gemini] API Error (${res.status}) listing models` }, 'gemini');
  const data = await res.json();
  return (data.models || [])
    .filter((m: any) => (m.supportedGenerationMethods || []).includes('generateContent'))
    .map((m: any) => String(m.name).replace(/^models\//, ''))
    .filter(isImageModel);
}

/** A one-word TEXT request to an image model: costs a few tokens, not a picture. */
export async function probeImageModel(apiKey: string, model: string): Promise<{ model: string; ok: boolean; reason?: string }> {
  try {
    const res = await withTimeout(
      (signal) =>
        fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey.trim() },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: 'Reply with the word OK.' }] }],
            generationConfig: { responseModalities: ['TEXT'], maxOutputTokens: 8 }
          }),
          signal
        }),
      20_000,
      'gemini'
    );
    if (res.ok) return { model, ok: true };
    if (res.status === 429) {
      // Image models have no free tier: a free key gets "limit: 0". Any other 429 resets.
      const body = await res.text();
      if (/limit:\s*0\b|free_tier/i.test(body)) return { model, ok: false, reason: 'needs a key with billing turned on' };
      return { model, ok: true, reason: 'rate-limited right now' };
    }
    return { model, ok: false, reason: `HTTP ${res.status}` };
  } catch (e) {
    return { model, ok: false, reason: e instanceof Error ? e.message : String(e) };
  }
}

/** Probes the key's image models and saves the ones that answered. */
export async function refreshUsableImageModels(apiKey: string): Promise<{ usable: string[]; failed: Array<{ model: string; reason?: string }> }> {
  const listed = await listImageModels(apiKey);
  const candidates = imageProbeCandidates(listed);
  const results = await Promise.all(candidates.map((m) => probeImageModel(apiKey, m)));
  const usable = candidates.filter((m) => results.find((r) => r.model === m)?.ok);
  setUsableImageModels(usable);
  return { usable, failed: results.filter((r) => !r.ok).map(({ model, reason }) => ({ model, reason })) };
}

/* ------------------------------- key moments ------------------------------ */

export type SceneReason = 'opening' | 'new place' | 'new chapter' | 'twist' | 'ambush' | 'crisis' | 'transformation' | 'ending' | 'asked';

const ALERT_REASON: Partial<Record<CourseChangeAlert['type'], SceneReason>> = {
  story_conclusion: 'ending',
  chapter_transition: 'new chapter',
  twist: 'twist',
  ambush: 'ambush',
  crisis: 'crisis'
};

// Big moments always earn a picture; the rest wait for a gap so a busy stretch is not a slideshow.
const ALWAYS: SceneReason[] = ['opening', 'new chapter', 'ending'];
export const MIN_TURNS_BETWEEN = 3;

const placeKey = (s?: string) => (s || '').toLowerCase().replace(/^the\s+/, '').replace(/[^a-z0-9]+/g, ' ').trim();

/**
 * Whether this turn is a key moment worth a picture, and why. Code only, from signals the
 * Game Master already sends (LOCATION, COURSE_TRIGGER, AVATAR_EVOLUTION): the play prompt
 * is unchanged.
 */
export function sceneMoment(input: {
  turn: number;
  lastArtTurn?: number;
  previousLocation?: string;
  delta?: StateDelta | null;
  alerts?: CourseChangeAlert[];
  transformed?: boolean;
}): SceneReason | null {
  const { turn, lastArtTurn, previousLocation, delta, alerts = [], transformed } = input;
  const reasons: SceneReason[] = [];
  for (const a of alerts) {
    const r = ALERT_REASON[a.type];
    if (r) reasons.push(r);
  }
  if (delta?.locationUpdate && placeKey(delta.locationUpdate) && placeKey(delta.locationUpdate) !== placeKey(previousLocation)) reasons.push('new place');
  if (transformed) reasons.push('transformation');
  if (!reasons.length) return null;
  const big = reasons.find((r) => ALWAYS.includes(r));
  if (big) return big;
  if (lastArtTurn !== undefined && turn - lastArtTurn < MIN_TURNS_BETWEEN) return null;
  // Order of preference among the rest.
  const order: SceneReason[] = ['twist', 'ambush', 'crisis', 'transformation', 'new place'];
  return order.find((r) => reasons.includes(r)) ?? reasons[0];
}

/* --------------------------------- prompt --------------------------------- */

/** One look per category, on top of the game's anime base style. */
const CATEGORY_LOOK: Record<ExperienceCategory, string> = {
  fantasy: 'high-fantasy anime film, painterly backgrounds, warm magical light',
  adventure: 'adventure anime, bright cinematic skies, sense of motion and scale',
  historical_adventure: 'historical anime drama, period-accurate clothing and architecture, natural light',
  horror: 'dark horror anime, heavy shadows, desaturated colors, dread rather than gore',
  cozy_ghibli: 'cozy hand-painted anime, soft watercolor greens, gentle sunlight, lived-in details',
  romantic: 'romance anime, soft glow, expressive faces, gentle color palette',
  revenge: 'gritty noir anime, hard rim light, rain and neon or firelight, tense framing',
  apocalypse: 'post-apocalyptic anime, ruined landscapes, dust and rust, overcast light',
  zombie: 'survival horror anime, abandoned streets, cold light, tension without gore',
  cosmic_horror: 'cosmic horror anime, impossible geometry, sickly color, vast scale',
  psychedelic_trip: 'psychedelic anime, saturated shifting colors, surreal flowing shapes',
  tiktok_drama: 'modern slice-of-life anime, phone screens and city interiors, bright contemporary palette',
  ancient_greek: 'ancient Greek anime epic, marble and bronze, Mediterranean light',
  mythology: 'mythic anime epic, divine light, legendary scale',
  real_life: 'grounded modern anime, realistic everyday places, natural light'
};

const REASON_FOCUS: Record<SceneReason, string> = {
  opening: 'Establish the place and mood where the story begins.',
  'new place': 'Show the place the hero has just arrived in.',
  'new chapter': 'Show the moment that opens this new chapter.',
  twist: 'Show the reveal at the heart of this passage.',
  ambush: 'Show the danger as it strikes.',
  crisis: 'Show the crisis at its height.',
  transformation: 'Show the hero as they now look.',
  ending: 'Show the final image of this story.',
  asked: 'Show the most striking moment of this passage.'
};

/** The image request: the scene text plus look, focus and the hero's appearance. */
export function buildScenePrompt(params: {
  category: ExperienceCategory;
  sceneText: string;
  reason: SceneReason;
  location?: string;
  hero?: Pick<CharacterSheet, 'raceOrigin' | 'roleClass' | 'physicalDescription' | 'gender'>;
}): string {
  const { category, sceneText, reason, location, hero } = params;
  const look = CATEGORY_LOOK[category] ?? 'anime film still';
  const heroLine = hero
    ? `If the hero is in the picture (the story calls them "you"), they are ${[hero.gender ? `(${hero.gender})` : '', hero.raceOrigin, hero.roleClass].filter(Boolean).join(' ')}${hero.physicalDescription ? `: ${hero.physicalDescription.slice(0, 300)}` : ''}. Show them from behind or at a distance unless the moment is about them.`
    : '';
  const safety = isMatureContentEnabled() ? 'Keep violence implied rather than graphic.' : 'Keep it suitable for teens: no gore and no nudity.';
  const passage = sceneText.replace(/\s+/g, ' ').trim().slice(0, 1800);
  return [
    `Paint one wide illustration of a moment from an interactive story, in the style of a ${look}.`,
    REASON_FOCUS[reason],
    location ? `Place: ${location}.` : '',
    heroLine,
    'Pick a single moment and a strong composition. Do not put any text, captions, speech bubbles, logos, borders or watermarks in the image.',
    safety,
    '',
    `The passage:\n${passage}`
  ]
    .filter((l) => l !== '')
    .join('\n');
}

/* -------------------------------- painting -------------------------------- */

export interface SceneArt {
  /** A zr-img: reference to the picture stored on this device. */
  ref: string;
  model: string;
  reason: SceneReason;
}

/** Pictures painted in this page session; the feed scrolls to them once when they load. */
export const freshSceneRefs = new Set<string>();

export class SceneArtError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SceneArtError';
  }
}

/** Shrinks Google's ~900 KB JPEG to a ~1024px WebP so saves stay small. Keeps the original if it cannot. */
async function shrink(blob: Blob): Promise<Blob> {
  try {
    if (typeof createImageBitmap !== 'function' || typeof document === 'undefined') return blob;
    const bmp = await createImageBitmap(blob);
    const scale = Math.min(1, 1024 / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext('2d')?.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    bmp.close?.();
    const out = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/webp', 0.82));
    return out && out.size > 0 && out.size < blob.size ? out : blob;
  } catch (_) {
    return blob;
  }
}

function b64ToBlob(b64: string, type: string): Blob {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type });
}

/**
 * Paints one picture and stores it on this device. Throws SceneArtError with a reason the
 * player can read; the caller shows it with a retry button.
 */
export async function paintScene(params: { apiKey: string; model: string; prompt: string; reason: SceneReason; signal?: AbortSignal }): Promise<SceneArt> {
  const { apiKey, model, prompt, reason, signal } = params;
  if (!apiKey.trim()) throw new SceneArtError('Scene art needs a Gemini key.');
  let data: any;
  try {
    const res = await withTimeout(
      (s) =>
        fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey.trim() },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: '16:9' } }
          }),
          signal: s
        }),
      90_000,
      'gemini',
      signal
    );
    const body = await res.text();
    if (!res.ok) {
      let msg = body;
      try {
        msg = JSON.parse(body)?.error?.message || body;
      } catch (_) {}
      throw classifyAIError({ status: res.status, message: `[Google Gemini] ${model} (${res.status}): ${String(msg).slice(0, 300)}` }, 'gemini');
    }
    data = JSON.parse(body);
  } catch (e) {
    if (e instanceof AIError) {
      if (e.kind === 'quota' && /limit:\s*0|free/i.test(e.message)) throw new SceneArtError('This key cannot paint pictures: Google\'s image models need a key with billing turned on.');
      if (e.kind === 'quota') throw new SceneArtError('The image model is rate-limited right now. Try again in a minute.');
      if (e.kind === 'overloaded') throw new SceneArtError('Google\'s image model is busy right now. Try again in a minute.');
      if (e.kind === 'timeout') throw new SceneArtError('The picture took too long. Try again.');
      if (e.kind === 'cancelled') throw new SceneArtError('Cancelled.');
      throw new SceneArtError(e.message);
    }
    throw new SceneArtError(e instanceof Error ? e.message : String(e));
  }
  recordGeminiUsage(model, data?.usageMetadata);
  const cand = data?.candidates?.[0];
  const part = cand?.content?.parts?.find((p: any) => p?.inlineData?.data);
  if (!part) {
    const why = data?.promptFeedback?.blockReason || cand?.finishReason;
    throw new SceneArtError(
      why && /SAFETY|PROHIBITED|BLOCK|IMAGE_OTHER|RECITATION/i.test(String(why))
        ? 'Google\'s image model declined to paint this scene.'
        : `No picture came back${why ? ` (${why})` : ''}.`
    );
  }
  countPicture();
  const blob = await shrink(b64ToBlob(part.inlineData.data, part.inlineData.mimeType || 'image/jpeg'));
  const key = `scene-${uid()}`;
  await idb.put('images', key, blob);
  const ref = `${IMG_REF}${key}`;
  freshSceneRefs.add(ref);
  return { ref, model, reason };
}
