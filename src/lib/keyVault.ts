/**
 * Opt-in key sync. Provider keys are encrypted in the browser with a passphrase only
 * the player knows (PBKDF2-SHA256 -> AES-256-GCM, Web Crypto) and only the ciphertext
 * goes to Firestore. Without the passphrase the cloud copy is useless, including to us.
 * Keys never leave the device in plain text, and sync is off unless the player turns it on.
 */
import { AIProviderId, AI_PROVIDERS } from './providersConfig';

export const VAULT_VERSION = 1;
// OWASP 2023 guidance for PBKDF2-HMAC-SHA256.
export const PBKDF2_ITERATIONS = 600_000;
export const MIN_PASSPHRASE_LENGTH = 10;

export interface KeyVault {
  v: typeof VAULT_VERSION;
  kdf: 'PBKDF2-SHA256';
  iterations: number;
  /** base64 */
  salt: string;
  /** base64 */
  iv: string;
  /** base64 AES-GCM ciphertext (includes the auth tag) of a JSON object { provider: key }. */
  ciphertext: string;
  updatedAt: string;
}

export type ProviderKeys = Partial<Record<AIProviderId, string>>;

export class VaultError extends Error {
  constructor(public kind: 'wrong_passphrase' | 'bad_vault' | 'weak_passphrase' | 'no_crypto', message: string) {
    super(message);
    this.name = 'VaultError';
  }
}

function subtle(): SubtleCrypto {
  const s = globalThis.crypto?.subtle;
  if (!s) throw new VaultError('no_crypto', 'This browser cannot encrypt keys (Web Crypto is unavailable). Use HTTPS or a newer browser.');
  return s;
}

function toB64(bytes: Uint8Array): string {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

function fromB64(s: string): Uint8Array<ArrayBuffer> {
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function checkPassphrase(passphrase: string): string | null {
  if (passphrase.length < MIN_PASSPHRASE_LENGTH) return `Use at least ${MIN_PASSPHRASE_LENGTH} characters.`;
  if (/^(.)\1+$/.test(passphrase)) return 'Use more than one repeated character.';
  return null;
}

async function deriveKey(passphrase: string, salt: Uint8Array<ArrayBuffer>, iterations: number): Promise<CryptoKey> {
  const base = await subtle().importKey('raw', new TextEncoder().encode(passphrase.normalize('NFKC')), 'PBKDF2', false, ['deriveKey']);
  return subtle().deriveKey(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/** Only real provider ids with non-empty keys go in the vault. */
export function cleanKeys(keys: ProviderKeys): ProviderKeys {
  const out: ProviderKeys = {};
  for (const [id, key] of Object.entries(keys)) {
    if (id in AI_PROVIDERS && typeof key === 'string' && key.trim()) out[id as AIProviderId] = key.trim();
  }
  return out;
}

export async function sealKeys(keys: ProviderKeys, passphrase: string, iterations = PBKDF2_ITERATIONS): Promise<KeyVault> {
  const weak = checkPassphrase(passphrase);
  if (weak) throw new VaultError('weak_passphrase', weak);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt, iterations);
  const plain = new TextEncoder().encode(JSON.stringify(cleanKeys(keys)));
  const ct = new Uint8Array(await subtle().encrypt({ name: 'AES-GCM', iv }, key, plain));
  return {
    v: VAULT_VERSION,
    kdf: 'PBKDF2-SHA256',
    iterations,
    salt: toB64(salt),
    iv: toB64(iv),
    ciphertext: toB64(ct),
    updatedAt: new Date().toISOString()
  };
}

export function isKeyVault(value: unknown): value is KeyVault {
  const v = value as KeyVault;
  return !!v && v.v === VAULT_VERSION && v.kdf === 'PBKDF2-SHA256' && Number.isInteger(v.iterations) && v.iterations >= 100_000
    && typeof v.salt === 'string' && typeof v.iv === 'string' && typeof v.ciphertext === 'string';
}

export async function openVault(vault: unknown, passphrase: string): Promise<ProviderKeys> {
  if (!isKeyVault(vault)) throw new VaultError('bad_vault', 'The synced key file is damaged or from a newer version of ZeroRoll.');
  let plain: ArrayBuffer;
  try {
    const key = await deriveKey(passphrase, fromB64(vault.salt), vault.iterations);
    plain = await subtle().decrypt({ name: 'AES-GCM', iv: fromB64(vault.iv) }, key, fromB64(vault.ciphertext));
  } catch (_) {
    // AES-GCM fails the auth check for a wrong passphrase and for tampered data alike.
    throw new VaultError('wrong_passphrase', 'That passphrase does not unlock your synced keys.');
  }
  try {
    return cleanKeys(JSON.parse(new TextDecoder().decode(plain)));
  } catch (_) {
    throw new VaultError('bad_vault', 'The synced key file is damaged.');
  }
}

/* ----------------------------- player preference ---------------------------- */

const SYNC_PREF_KEY = 'zeroroll_key_sync';

/** Off unless the player turned it on. */
export function isKeySyncEnabled(): boolean {
  try {
    return localStorage.getItem(SYNC_PREF_KEY) === 'on';
  } catch (_) {
    return false;
  }
}

export function setKeySyncEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(SYNC_PREF_KEY, enabled ? 'on' : 'off');
  } catch (_) {}
}

// The passphrase is kept in memory for this tab only, so key changes can be re-sealed
// without asking again. It is never written to storage.
let sessionPassphrase: string | null = null;

export function rememberPassphraseForSession(passphrase: string | null): void {
  sessionPassphrase = passphrase;
}

export function getSessionPassphrase(): string | null {
  return sessionPassphrase;
}
