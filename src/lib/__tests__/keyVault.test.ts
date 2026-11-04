import { describe, it, expect } from 'vitest';
import { sealKeys, openVault, checkPassphrase, isKeyVault, VaultError } from '../keyVault';

// Low iteration count keeps the suite fast; production uses PBKDF2_ITERATIONS.
const IT = 100_000;
const PASS = 'correct horse battery';

describe('keyVault', () => {
  it('round-trips keys with the right passphrase', async () => {
    const vault = await sealKeys({ gemini: 'AIzaKey123', anthropic: ' sk-ant-x ' }, PASS, IT);
    expect(isKeyVault(vault)).toBe(true);
    expect(await openVault(vault, PASS)).toEqual({ gemini: 'AIzaKey123', anthropic: 'sk-ant-x' });
  });

  it('never stores a key in plain text', async () => {
    const vault = await sealKeys({ gemini: 'AIzaSecretValue999' }, PASS, IT);
    expect(JSON.stringify(vault)).not.toContain('AIzaSecretValue999');
  });

  it('uses a fresh salt and IV every time', async () => {
    const a = await sealKeys({ gemini: 'k1' }, PASS, IT);
    const b = await sealKeys({ gemini: 'k1' }, PASS, IT);
    expect(a.salt).not.toBe(b.salt);
    expect(a.iv).not.toBe(b.iv);
    expect(a.ciphertext).not.toBe(b.ciphertext);
  });

  it('rejects the wrong passphrase', async () => {
    const vault = await sealKeys({ gemini: 'k1' }, PASS, IT);
    await expect(openVault(vault, 'wrong passphrase!')).rejects.toMatchObject({ kind: 'wrong_passphrase' });
  });

  it('detects tampering', async () => {
    const vault = await sealKeys({ gemini: 'k1' }, PASS, IT);
    const bytes = atob(vault.ciphertext).split('');
    bytes[0] = String.fromCharCode(bytes[0].charCodeAt(0) ^ 1);
    await expect(openVault({ ...vault, ciphertext: btoa(bytes.join('')) }, PASS)).rejects.toBeInstanceOf(VaultError);
  });

  it('refuses weak passphrases and damaged vaults', async () => {
    expect(checkPassphrase('short')).toMatch(/at least/);
    expect(checkPassphrase('aaaaaaaaaaaa')).toMatch(/repeated/);
    await expect(sealKeys({ gemini: 'k' }, 'short', IT)).rejects.toMatchObject({ kind: 'weak_passphrase' });
    await expect(openVault({ v: 1 }, PASS)).rejects.toMatchObject({ kind: 'bad_vault' });
  });

  it('drops unknown providers and empty keys', async () => {
    const vault = await sealKeys({ gemini: '', openai: 'sk-1', bogus: 'x' } as any, PASS, IT);
    expect(await openVault(vault, PASS)).toEqual({ openai: 'sk-1' });
  });
});
