/**
 * Glue between the key vault, the player's local keys and Firestore.
 * Nothing here runs unless the player has turned key sync on.
 */
import { AIProviderId, AI_PROVIDERS } from './providersConfig';
import { getProviderKey, setProviderKey, subscribeProviderKeyChanges } from './geminiService';
import { loadKeyVaultFromCloud, saveKeyVaultToCloud } from './firebase';
import {
  KeyVault,
  ProviderKeys,
  getSessionPassphrase,
  isKeySyncEnabled,
  isKeyVault,
  openVault,
  rememberPassphraseForSession,
  sealKeys,
  setKeySyncEnabled
} from './keyVault';

export function collectLocalKeys(): ProviderKeys {
  const keys: ProviderKeys = {};
  for (const id of Object.keys(AI_PROVIDERS) as AIProviderId[]) {
    const k = getProviderKey(id);
    if (k.trim()) keys[id] = k.trim();
  }
  return keys;
}

export async function fetchVault(uid: string): Promise<KeyVault | null> {
  const raw = await loadKeyVaultFromCloud(uid);
  return isKeyVault(raw) ? raw : null;
}

/** Turn sync on: seal this browser's keys and upload them. */
export async function enableKeySync(uid: string, passphrase: string): Promise<KeyVault> {
  const vault = await sealKeys(collectLocalKeys(), passphrase);
  await saveKeyVaultToCloud(uid, vault);
  setKeySyncEnabled(true);
  rememberPassphraseForSession(passphrase);
  return vault;
}

/** Unlock the cloud copy on this device and copy its keys here. Returns the providers restored. */
export async function unlockKeySync(uid: string, passphrase: string): Promise<AIProviderId[]> {
  const vault = await fetchVault(uid);
  if (!vault) throw new Error('There is no synced key file on your account.');
  const keys = await openVault(vault, passphrase);
  const restored: AIProviderId[] = [];
  for (const [id, key] of Object.entries(keys) as [AIProviderId, string][]) {
    if (getProviderKey(id) !== key) {
      setProviderKey(id, key);
      restored.push(id);
    }
  }
  // Keys only this device had go up too, so every device ends with the same set.
  const local = collectLocalKeys();
  if (Object.keys(local).some((id) => !(id in keys))) {
    await saveKeyVaultToCloud(uid, await sealKeys(local, passphrase));
  }
  setKeySyncEnabled(true);
  rememberPassphraseForSession(passphrase);
  return restored;
}

/** Turn sync off and delete the cloud copy. Keys on this device stay. */
export async function disableKeySync(uid: string): Promise<void> {
  await saveKeyVaultToCloud(uid, null);
  setKeySyncEnabled(false);
  rememberPassphraseForSession(null);
}

/**
 * While signed in with sync on and unlocked, re-seal and upload whenever a key changes.
 * Returns an unsubscribe function. `onError` receives upload failures so they are shown.
 */
export function watchKeyChanges(uid: string, onError: (message: string) => void): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const unsubscribe = subscribeProviderKeyChanges(() => {
    if (!isKeySyncEnabled()) return;
    const passphrase = getSessionPassphrase();
    if (!passphrase) return; // Locked this session: the next unlock or enable uploads the current keys.
    clearTimeout(timer);
    timer = setTimeout(async () => {
      try {
        await saveKeyVaultToCloud(uid, await sealKeys(collectLocalKeys(), passphrase));
      } catch (err) {
        onError(`Key sync could not upload your changed key: ${err instanceof Error ? err.message : String(err)}`);
      }
    }, 800);
  });
  return () => {
    clearTimeout(timer);
    unsubscribe();
  };
}
