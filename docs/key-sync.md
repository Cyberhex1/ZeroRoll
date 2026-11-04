# Key sync (opt-in)

ZeroRoll has no server and never holds a player's AI keys. By default a key lives only in the
browser it was entered in. Players who want the same keys on several devices can turn on
**Settings > Sync API keys across devices**.

## How it works

1. The player picks a sync passphrase (at least 10 characters).
2. The browser derives an AES-256 key from it with PBKDF2-SHA256 (600,000 iterations, random
   16-byte salt) and encrypts the keys with AES-GCM (random 12-byte IV). Code: `src/lib/keyVault.ts`.
3. Only the result (`users/{uid}.keyVault`: version, salt, IV, ciphertext, timestamp) is written
   to Firestore. The passphrase and the plain keys never leave the device.
4. On another device the player signs in, enters the passphrase, and the keys are decrypted
   locally and copied into that browser.
5. While unlocked, changing a key re-encrypts and uploads the vault. The passphrase is kept in
   memory for the tab only; after a reload, sync resumes on the next unlock.

## Limits

- A forgotten passphrase cannot be recovered. "Forgot it: delete the synced copy" removes the
  vault; keys already in each browser are kept.
- Turning sync off deletes the vault from the account.
- Firestore rules already restrict `users/{uid}` to its owner; the encryption means even a
  leaked document does not reveal keys.
- Older builds stored plain-text keys under `settings.providerKeys`. Phase 0 deletes those on sign-in.
