/**
 * Hero portraits are stored as images on this device (H6): a generated portrait is fetched
 * once and kept in IndexedDB, and the save holds a `zr-img:` reference instead of a URL
 * that expires (DALL-E) or depends on a third party staying up. Images do not sync between
 * devices yet; another device shows the initial tile.
 *
 * The free portrait engine (pollinations.ai) is a third party that receives the prompt in
 * a URL, so it is opt-in (S18) and the prompt never carries the hero's name or story text.
 */
import { idb } from '../storage/db';
import { uid } from './ids';

export const IMG_REF = 'zr-img:';
const ALLOW_KEY = 'zeroroll_allow_free_portraits';

export function freePortraitsAllowed(): boolean {
  try {
    return localStorage.getItem(ALLOW_KEY) === '1';
  } catch (_) {
    return false;
  }
}

export function setFreePortraitsAllowed(on: boolean): void {
  try {
    localStorage.setItem(ALLOW_KEY, on ? '1' : '0');
  } catch (_) {
    /* the choice lasts for this page only */
  }
}

/** Thrown when a portrait needs the free engine and the player has not allowed it. */
export class PortraitsOffError extends Error {
  constructor() {
    super('Free portraits are off. They are drawn by pollinations.ai, a third-party service; turn them on in the portrait panel or Settings to use them.');
    this.name = 'PortraitsOffError';
  }
}

export async function storePortraitBlob(blob: Blob): Promise<string> {
  const key = `portrait-${uid()}`;
  await idb.put('images', key, blob);
  return `${IMG_REF}${key}`;
}

/** Fetches a generated image and stores it; throws if it cannot be fetched. */
export async function storePortraitFromUrl(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`The portrait service answered ${res.status}.`);
  const blob = await res.blob();
  if (!blob.type.startsWith('image/')) throw new Error('The portrait service did not send an image.');
  return storePortraitBlob(blob);
}

export function base64ToBlob(b64: string, type = 'image/png'): Blob {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type });
}

const objectUrls = new Map<string, string>();

/** A displayable URL for a saved portrait value, or null when it cannot be shown here. */
export async function resolvePortrait(value: string | undefined): Promise<string | null> {
  if (!value) return null;
  if (!value.startsWith(IMG_REF)) return value;
  const hit = objectUrls.get(value);
  if (hit) return hit;
  try {
    const blob = await idb.get<Blob>('images', value.slice(IMG_REF.length));
    if (!blob) return null;
    const url = URL.createObjectURL(blob);
    objectUrls.set(value, url);
    return url;
  } catch (_) {
    return null;
  }
}
