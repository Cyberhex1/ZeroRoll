import React, { useEffect, useState } from 'react';
import { Lock, Unlock, CloudOff } from 'lucide-react';
import { User } from 'firebase/auth';
import { AI_PROVIDERS, AIProviderId } from '../lib/providersConfig';
import { KeyVault, MIN_PASSPHRASE_LENGTH, checkPassphrase, getSessionPassphrase, isKeySyncEnabled } from '../lib/keyVault';
import { disableKeySync, enableKeySync, fetchVault, unlockKeySync } from '../lib/keySync';

interface KeySyncPanelProps {
  user: User | null;
}

type Note = { kind: 'ok' | 'warn' | 'error'; text: string } | null;

/**
 * Opt-in key sync. Off by default: keys stay in this browser. When on, keys are encrypted
 * here with the player's passphrase and only the encrypted copy is stored in their account.
 */
export const KeySyncPanel: React.FC<KeySyncPanelProps> = ({ user }) => {
  const uid = user && !user.isAnonymous ? user.uid : null;
  const [vault, setVault] = useState<KeyVault | null | undefined>(undefined);
  const [enabled, setEnabled] = useState(isKeySyncEnabled());
  const [unlocked, setUnlocked] = useState(!!getSessionPassphrase());
  const [pass, setPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<Note>(null);
  const [mode, setMode] = useState<'idle' | 'enable'>('idle');

  useEffect(() => {
    if (!uid) return;
    let alive = true;
    fetchVault(uid)
      .then((v) => alive && setVault(v))
      .catch((err) => alive && (setVault(null), setNote({ kind: 'error', text: `Could not check for synced keys: ${err.message}` })));
    return () => {
      alive = false;
    };
  }, [uid]);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setNote(null);
    try {
      await fn();
    } catch (err) {
      setNote({ kind: 'error', text: err instanceof Error ? err.message : String(err) });
    } finally {
      setBusy(false);
    }
  };

  const names = (ids: AIProviderId[]) => ids.map((id) => AI_PROVIDERS[id]?.name || id).join(', ');

  const handleEnable = () =>
    run(async () => {
      const weak = checkPassphrase(pass);
      if (weak) throw new Error(weak);
      if (pass !== confirm) throw new Error('The two passphrases do not match.');
      const v = await enableKeySync(uid!, pass);
      setVault(v);
      setEnabled(true);
      setUnlocked(true);
      setMode('idle');
      setPass('');
      setConfirm('');
      setNote({ kind: 'ok', text: 'Key sync is on. Your keys are encrypted with your passphrase before they leave this browser.' });
    });

  const handleUnlock = () =>
    run(async () => {
      const restored = await unlockKeySync(uid!, pass);
      setEnabled(true);
      setUnlocked(true);
      setPass('');
      setVault(await fetchVault(uid!));
      setNote({ kind: 'ok', text: restored.length ? `Unlocked. Keys copied to this browser: ${names(restored)}.` : 'Unlocked. This browser already had the same keys.' });
    });

  const handleDisable = () =>
    run(async () => {
      await disableKeySync(uid!);
      setVault(null);
      setEnabled(false);
      setUnlocked(false);
      setNote({ kind: 'ok', text: 'Key sync is off and the encrypted copy was deleted from your account. Keys in this browser were kept.' });
    });

  const noteClass = note?.kind === 'error' ? 'text-red-300' : note?.kind === 'warn' ? 'text-amber-300' : 'text-emerald-300';
  const input = 'w-full bg-slate-900 border border-white/10 rounded px-2 py-1.5 text-xs';
  const btn = 'px-3 py-1.5 rounded text-[11px] font-semibold disabled:opacity-50';

  return (
    <div className="p-3 rounded bg-[#0A0A0F] border border-white/10 space-y-2">
      <h3 className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider flex items-center gap-2">
        <Lock className="w-3 h-3" /> Sync API keys across devices
      </h3>

      {!uid ? (
        <p className="text-[11px] text-slate-400">Off. Your keys stay in this browser. Sign in with an account to sync them, encrypted, to your other devices.</p>
      ) : vault === undefined ? (
        <p className="text-[11px] text-slate-400">Checking your account...</p>
      ) : vault && !unlocked ? (
        <div className="space-y-2">
          <p className="text-[11px] text-slate-300">
            Your account has encrypted keys{vault.updatedAt ? ` (updated ${new Date(vault.updatedAt).toLocaleString()})` : ''}. Enter your sync passphrase to use them in this browser.
          </p>
          <label className="block text-[10px] text-slate-400" htmlFor="ks-unlock">Sync passphrase</label>
          <input id="ks-unlock" type="password" autoComplete="current-password" value={pass} onChange={(e) => setPass(e.target.value)} className={input} />
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={busy || !pass} onClick={handleUnlock} className={`${btn} bg-amber-500 text-slate-950`}>
              <Unlock className="w-3 h-3 inline mr-1" />{busy ? 'Unlocking...' : 'Unlock'}
            </button>
            <button type="button" disabled={busy} onClick={handleDisable} className={`${btn} border border-white/10 text-slate-300`}>
              Forgot it: delete the synced copy
            </button>
          </div>
        </div>
      ) : vault && unlocked && enabled ? (
        <div className="space-y-2">
          <p className="text-[11px] text-emerald-300">On. Key changes in this browser are encrypted and synced to your account.</p>
          <button type="button" disabled={busy} onClick={handleDisable} className={`${btn} border border-white/10 text-slate-300`}>
            <CloudOff className="w-3 h-3 inline mr-1" />Turn off and delete the synced copy
          </button>
        </div>
      ) : mode === 'enable' ? (
        <div className="space-y-2">
          <p className="text-[11px] text-slate-300">
            Choose a passphrase of at least {MIN_PASSPHRASE_LENGTH} characters. Keys are encrypted with it in this browser; nobody else, including ZeroRoll, can read them. If you forget it, your synced keys cannot be recovered and you will need to enter them again.
          </p>
          <label className="block text-[10px] text-slate-400" htmlFor="ks-pass">Sync passphrase</label>
          <input id="ks-pass" type="password" autoComplete="new-password" value={pass} onChange={(e) => setPass(e.target.value)} className={input} />
          <label className="block text-[10px] text-slate-400" htmlFor="ks-confirm">Type it again</label>
          <input id="ks-confirm" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={input} />
          <div className="flex gap-2">
            <button type="button" disabled={busy || !pass || !confirm} onClick={handleEnable} className={`${btn} bg-amber-500 text-slate-950`}>
              {busy ? 'Encrypting...' : 'Encrypt and sync'}
            </button>
            <button type="button" disabled={busy} onClick={() => setMode('idle')} className={`${btn} border border-white/10 text-slate-300`}>Cancel</button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-[11px] text-slate-400">Off. Your keys stay in this browser only.</p>
          <button type="button" onClick={() => setMode('enable')} className={`${btn} border border-amber-500/40 text-amber-300`}>Turn on key sync</button>
        </div>
      )}

      {note && <p role="status" className={`text-[11px] ${noteClass}`}>{note.text}</p>}
    </div>
  );
};
