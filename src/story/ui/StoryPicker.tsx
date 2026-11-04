import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { BookOpen, Upload } from 'lucide-react';
import { CATEGORIES_DATA } from '../../content';
import { isMatureContentEnabled } from '../../lib/contentRating';
import { StoryProgress, StoryRepository, StorySave } from '../../storage/storyRepository';
import { StoryMeta, coverUrl, loadAllStories, storiesByCategory } from '../catalog';

/** Story mode home: every installed story by category, with resume and progress. */
export default function StoryPicker() {
  const mature = isMatureContentEnabled();
  const byCategory = storiesByCategory();
  const [saves, setSaves] = useState<Record<string, StorySave>>({});
  const [progress, setProgress] = useState<Record<string, StoryProgress>>({});
  const [note, setNote] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    StoryRepository.list()
      .then((all) => setSaves(Object.fromEntries(all.map((s) => [s.storyId, s]))))
      .catch((e) => setNote({ kind: 'error', text: String(e?.message ?? e) }));
    StoryRepository.allProgress()
      .then((all) => setProgress(Object.fromEntries(all.map((p) => [p.storyId, p]))))
      .catch(() => {});
  }, []);

  const importSave = async (file: File) => {
    try {
      const save = await StoryRepository.importSave(JSON.parse(await file.text()), await loadAllStories());
      navigate(`/story/${save.storyId}`);
    } catch (e) {
      setNote({ kind: 'error', text: e instanceof Error ? e.message : String(e) });
    }
  };

  const visible = (m: StoryMeta) => mature || m.rating !== 'mature';
  const categories = CATEGORIES_DATA.filter((c) => (byCategory.get(c.id) ?? []).some(visible));

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-amber-400 flex items-center gap-2"><BookOpen className="w-5 h-5" /> Story mode</h1>
          <p className="text-xs text-slate-400">Choose-your-own-adventure stories with fixed beats, several endings and their own look.</p>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => fileRef.current?.click()} className="text-xs inline-flex items-center gap-1 border border-slate-700 rounded px-3 py-1.5 text-slate-300 hover:border-amber-500/60">
            <Upload className="w-3 h-3" /> Import a save
          </button>
          <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => e.target.files?.[0] && importSave(e.target.files[0])} />
          <Link to="/" className="text-xs text-slate-400 hover:text-amber-400 underline">Home</Link>
        </div>
      </div>
      {note && <p role="alert" className={`text-xs ${note.kind === 'error' ? 'text-red-300' : 'text-emerald-300'}`}>{note.text}</p>}
      {!categories.length && <p className="text-sm text-slate-400">No stories are installed yet.</p>}

      {categories.map((cat) => (
        <section key={cat.id} aria-labelledby={`cat-${cat.id}`} className="space-y-2">
          <h2 id={`cat-${cat.id}`} className="text-sm font-semibold text-slate-200">{cat.name}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(byCategory.get(cat.id) ?? []).filter(visible).map((m) => {
              const save = saves[m.id];
              const p = progress[m.id];
              const cover = coverUrl(m);
              return (
                <Link
                  key={m.id}
                  to={`/story/${m.id}`}
                  className="block rounded-lg border border-slate-800 bg-slate-900/60 overflow-hidden hover:border-amber-500/60 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {cover && <img src={cover} alt="" className="w-full h-32 object-cover" loading="lazy" />}
                  <div className="p-3 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-sm text-slate-100">{m.title}</span>
                      <span className="text-[10px] uppercase tracking-wide text-slate-500">{m.mode === 'character' ? 'Character' : 'Story'} · {m.rating}</span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-3">{m.blurb}</p>
                    <div className="text-[11px] text-amber-300/90">
                      {save ? (save.state.ending ? 'Finished. Open to play again' : 'Resume where you stopped') : 'Start'}
                      {p?.endings.length ? ` · ${p.endings.length} ending${p.endings.length === 1 ? '' : 's'} found` : ''}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
