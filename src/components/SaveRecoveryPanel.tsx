import { useState } from 'react';
import type { User } from 'firebase/auth';
import { LifeBuoy } from 'lucide-react';
import { forgetReplacedDeviceCopy, listReplacedDeviceCopies, saveExperienceToCloud } from '../lib/firebase';
import type { Experience } from '../types';
import { StoryRepository, StorySave } from '../storage/storyRepository';
import { CloudStoryMeta, backupStorySave, listCloudStories, loadCloudStory } from '../storage/storyCloud';

interface StoryRow {
  storyId: string;
  device?: StorySave;
  cloud?: CloudStoryMeta;
}

const when = (t?: number | string) => (t ? new Date(t).toLocaleString() : 'none');

/**
 * "Doesn't look right?": compares this device's saves with the cloud backup and lets the
 * player pick which one to keep, for Story mode saves and D&D campaigns.
 */
export function SaveRecoveryPanel({ user }: { user: User | null }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stories, setStories] = useState<StoryRow[]>([]);
  const [replaced, setReplaced] = useState<Experience[]>([]);
  const [note, setNote] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setNote(null);
    try {
      const [device, cloud] = await Promise.all([StoryRepository.list(), user ? listCloudStories() : Promise.resolve([])]);
      const rows = new Map<string, StoryRow>();
      for (const d of device) rows.set(d.storyId, { storyId: d.storyId, device: d });
      for (const c of cloud) rows.set(c.storyId, { ...(rows.get(c.storyId) ?? { storyId: c.storyId }), cloud: c });
      setStories([...rows.values()].filter((r) => r.device?.updatedAt !== r.cloud?.updatedAt));
      setReplaced(user ? listReplacedDeviceCopies(user.uid) : []);
    } catch (e) {
      setNote(`Could not compare saves: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setLoading(false);
    }
  };

  const keepDevice = async (row: StoryRow) => {
    if (!row.device) return;
    const r = await backupStorySave(row.device, { force: true });
    setNote(r.ok ? `The cloud now holds this device's save of "${row.storyId}".` : r.message);
    if (r.ok) await StoryRepository.markBackedUp(row.storyId, row.device.updatedAt);
    await load();
  };

  const takeCloud = async (row: StoryRow) => {
    try {
      const cloud = await loadCloudStory(row.storyId);
      if (!cloud) return;
      const stamped = await StoryRepository.save({ ...cloud, cloudBase: cloud.updatedAt });
      setNote(`This device now has the cloud save of "${row.storyId}" (${stamped.messages.length} messages).`);
      await load();
    } catch (e) {
      setNote(e instanceof Error ? e.message : String(e));
    }
  };

  const restoreCampaign = async (exp: Experience) => {
    if (!user) return;
    const r = await saveExperienceToCloud(exp);
    if (r.ok) forgetReplacedDeviceCopy(user.uid, exp.id);
    setNote(r.ok ? `"${exp.title}" is back to this device's copy (${exp.logs.length} log entries).` : `Could not restore: ${r.error}`);
    await load();
  };

  const btn = 'text-[11px] rounded border border-white/15 px-2 py-0.5 hover:border-amber-500/60';

  return (
    <div className="p-3 rounded bg-[#0A0A0F] border border-white/10 space-y-2">
      <h3 className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider flex items-center gap-2">
        <LifeBuoy className="w-3.5 h-3.5 text-amber-400" />
        Saves: doesn't look right?
      </h3>
      <p className="text-[11px] text-slate-400">If a story or campaign is missing progress, compare this device's save with the cloud backup and pick the one to keep.</p>
      {!open ? (
        <button type="button" className={btn} onClick={() => { setOpen(true); void load(); }}>Compare saves</button>
      ) : (
        <div className="space-y-3 text-xs text-slate-200">
          {loading && <p className="text-slate-400">Comparing…</p>}
          {!loading && !stories.length && !replaced.length && <p className="text-slate-400">Everything matches: this device and the cloud hold the same saves.</p>}
          {!user && <p className="text-slate-400">Sign in to compare with the cloud backup.</p>}
          {stories.map((r) => (
            <div key={r.storyId} className="rounded border border-white/10 p-2 space-y-1">
              <div className="font-semibold">Story: {r.storyId}</div>
              <div className="text-slate-400">This device: {r.device ? `${r.device.messages.length} messages, ${when(r.device.updatedAt)}` : 'no save'}</div>
              <div className="text-slate-400">Cloud: {r.cloud ? `${r.cloud.messageCount} messages, ${when(r.cloud.updatedAt)}` : 'no backup'}</div>
              <div className="flex gap-2 pt-1">
                {r.device && user && <button type="button" className={btn} onClick={() => void keepDevice(r)}>Keep this device's</button>}
                {r.cloud && <button type="button" className={btn} onClick={() => void takeCloud(r)}>Use the cloud's</button>}
              </div>
            </div>
          ))}
          {replaced.map((e) => (
            <div key={e.id} className="rounded border border-white/10 p-2 space-y-1">
              <div className="font-semibold">Campaign: {e.title}</div>
              <div className="text-slate-400">The cloud replaced this device's copy ({e.logs.length} log entries, {when(e.updatedAt)}).</div>
              <div className="flex gap-2 pt-1">
                <button type="button" className={btn} onClick={() => void restoreCampaign(e)}>Restore this device's copy</button>
                <button type="button" className={btn} onClick={() => { if (user) forgetReplacedDeviceCopy(user.uid, e.id); void load(); }}>Keep the cloud's</button>
              </div>
            </div>
          ))}
          {note && <p role="status" className="text-emerald-300">{note}</p>}
        </div>
      )}
    </div>
  );
}
