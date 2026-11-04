import React, { useRef, useState } from 'react';
import { Download, Upload, ShieldCheck } from 'lucide-react';
import { buildBackup, downloadBackup, importBackup, parseBackup } from '../lib/backup';

interface BackupPanelProps {
  compact?: boolean;
}

/** "Export my campaigns" and "Import" controls. Shown in Settings and on the Experiences tab. */
export const BackupPanel: React.FC<BackupPanelProps> = ({ compact = false }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<'export' | 'import' | null>(null);
  const [note, setNote] = useState<{ kind: 'ok' | 'warn' | 'error'; text: string } | null>(null);

  const handleExport = async () => {
    setBusy('export');
    setNote(null);
    try {
      const backup = await buildBackup();
      const filename = downloadBackup(backup);
      const { local, cloud, uniqueCampaigns } = backup.counts;
      if (backup.cloudError) {
        setNote({
          kind: 'warn',
          text: `Saved ${filename} with ${uniqueCampaigns} campaign(s) from this browser only. The cloud copy could not be read: ${backup.cloudError}`,
        });
      } else {
        setNote({
          kind: 'ok',
          text: `Saved ${filename}: ${uniqueCampaigns} campaign(s) (${local} local copies, ${cloud} cloud copies). API keys are not included.`,
        });
      }
    } catch (err) {
      setNote({ kind: 'error', text: `Export failed: ${err instanceof Error ? err.message : String(err)}` });
    } finally {
      setBusy(null);
    }
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy('import');
    setNote(null);
    try {
      const backup = parseBackup(await file.text());
      const r = await importBackup(backup);
      const parts = [`${r.restoredLocal} restored to this browser`];
      if (r.restoredCloud) parts.push(`${r.restoredCloud} uploaded to your account`);
      if (r.skippedNewer) parts.push(`${r.skippedNewer} skipped because this browser already has a newer copy`);
      setNote({
        kind: r.errors.length ? 'warn' : 'ok',
        text: `Import finished: ${parts.join(', ')}.${r.errors.length ? ` Problems: ${r.errors.join(' ')}` : ''} Nothing was deleted.`,
      });
    } catch (err) {
      setNote({ kind: 'error', text: `Import failed: ${err instanceof Error ? err.message : String(err)}` });
    } finally {
      setBusy(null);
    }
  };

  const noteColour =
    note?.kind === 'ok' ? 'text-emerald-300' : note?.kind === 'warn' ? 'text-amber-300' : 'text-red-300';

  return (
    <div className={compact ? 'space-y-2' : 'p-3 rounded bg-[#0A0A0F] border border-white/10 space-y-2'}>
      {!compact && (
        <h3 className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          Back up my campaigns
        </h3>
      )}
      {!compact && (
        <p className="text-[11px] text-slate-400">
          Download a file with every campaign this browser and your account hold. Keep it somewhere safe; Import
          puts campaigns back without deleting or overwriting newer saves. API keys are never included.
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleExport}
          disabled={busy !== null}
          className="px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-black font-bold text-xs font-mono uppercase tracking-wider transition flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5" />
          {busy === 'export' ? 'Exporting…' : 'Export my campaigns'}
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy !== null}
          className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 disabled:opacity-50 border border-white/10 text-slate-200 text-xs font-mono uppercase tracking-wider transition flex items-center gap-1.5"
        >
          <Upload className="w-3.5 h-3.5" />
          {busy === 'import' ? 'Importing…' : 'Import'}
        </button>
        <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={handleFile} />
      </div>
      {note && (
        <p role="status" className={`text-[11px] ${noteColour}`}>
          {note.text}
        </p>
      )}
    </div>
  );
};

export default BackupPanel;
