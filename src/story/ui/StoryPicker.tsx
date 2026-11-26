import { useEffect, useRef, useState } from 'react';
import ModeSwitch from '../../components/ModeSwitch';
import { Link, useNavigate } from 'react-router';
import { BookOpen, FolderOpen, PackagePlus, Pin, Search, Share2, Sparkles, Trash2, Upload, Wand2 } from 'lucide-react';
import { CATEGORIES_DATA } from '../../content';
import { isMatureContentEnabled } from '../../lib/contentRating';
import { StoryProgress, StoryRepository, StorySave } from '../../storage/storyRepository';
import { StoryMeta, builtInIds, coverUrl, forgetStory, importedStories, listStories, loadAllStories, loadStory, storyCoverUrl } from '../catalog';
import { cachedArtUrl } from '../art';
import { ImportResult, PreparedPackage, installPackages, readPicked, removeImportedStory, reviewPackages } from '../importPackage';
import { exportStoryPackage } from '../share';
import ImportReview from './ImportReview';
import type { ExperienceCategory } from '../../types';
import { ANIME_SKIN, skinVars } from '../skins';
import Particles from './Particles';
import { FANFIC_GROUPS, groupBySource, matchesSearch } from '../sections';

/** Story mode home: every installed story by category, with resume and progress. */
export default function StoryPicker() {
  const mature = isMatureContentEnabled();
  const [imported, setImported] = useState<Array<{ meta: StoryMeta; cover: string | null }>>([]);
  const [query, setQuery] = useState('');
  const [genre, setGenre] = useState<ExperienceCategory | 'all'>('all');
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<ImportResult[]>([]);
  const [review, setReview] = useState<PreparedPackage[] | null>(null);
  const pkgRef = useRef<HTMLInputElement>(null);
  const folderRef = useRef<HTMLInputElement>(null);
  const refreshImported = () =>
    importedStories().then((all) => setImported(all.map((st) => ({ meta: st.meta, cover: storyCoverUrl(st) }))));
  useEffect(() => {
    void refreshImported();
  }, []);
  const importedIds = new Set(imported.map((i) => i.meta.id));

  const resetInputs = () => {
    if (pkgRef.current) pkgRef.current.value = '';
    if (folderRef.current) folderRef.current.value = '';
  };

  // Step 1: check the packages and show them for review; nothing is installed yet.
  const addStories = async (list: FileList | null) => {
    if (!list?.length) return;
    setImporting(true);
    setResults([]);
    try {
      const prepared = reviewPackages(await readPicked(list), builtInIds());
      if (prepared.some((p) => p.story)) setReview(prepared);
      else setResults(prepared.map((p) => p.result));
    } catch (e) {
      setResults([{ dir: '(import)', ok: false, report: e instanceof Error ? e.message : String(e) }]);
    } finally {
      setImporting(false);
      resetInputs();
    }
  };

  // Step 2: install what the player ticked.
  const confirmStories = async (chosen: PreparedPackage[]) => {
    const all = review ?? [];
    setReview(null);
    setImporting(true);
    try {
      const done = await installPackages(chosen);
      done.forEach((x) => x.id && forgetStory(x.id));
      const skipped = all.filter((p) => !chosen.includes(p)).map((p) => (p.story ? { ...p.result, ok: false, report: 'Skipped at review.' } : p.result));
      setResults([...done, ...skipped]);
      await refreshImported();
    } catch (e) {
      setResults([{ dir: '(import)', ok: false, report: e instanceof Error ? e.message : String(e) }]);
    } finally {
      setImporting(false);
    }
  };

  const shareStory = async (m: StoryMeta) => {
    try {
      const { blob, fileName, missingArt } = await exportStoryPackage(await loadStory(m.id));
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = fileName;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 10_000);
      setNote({
        kind: 'ok',
        text: missingArt.length
          ? `Saved ${fileName}. ${missingArt.length} image${missingArt.length === 1 ? ' was' : 's were'} not on this device and ${missingArt.length === 1 ? 'is' : 'are'} not in the zip: ${missingArt.join(', ')}.`
          : `Saved ${fileName}. Anyone can add it with "Add stories (zip)".`
      });
    } catch (e) {
      setNote({ kind: 'error', text: `Could not export "${m.title}": ${e instanceof Error ? e.message : String(e)}` });
    }
  };

  const removeStory = async (m: StoryMeta) => {
    const ask = m.created
      ? `Delete "${m.title}"? It was made on this device, so it cannot be brought back unless you shared it as a zip first.`
      : `Remove "${m.title}" from this device? Your save for it stays, and importing it again brings it back.`;
    if (!window.confirm(ask)) return;
    await removeImportedStory(m.id);
    forgetStory(m.id);
    await refreshImported();
  };
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

  const visible = (m: StoryMeta) => (mature || m.rating !== 'mature') && (genre === 'all' || m.category === genre) && matchesSearch(m, query);
  const all = [...listStories(), ...imported.map((i) => i.meta)];
  const ratedOk = all.filter((m) => mature || m.rating !== 'mature');
  const genres = CATEGORIES_DATA.filter((c) => ratedOk.some((m) => m.category === c.id));
  const originals = all.filter((m) => !m.source && visible(m));
  const yours = all.filter((m) => m.source && m.created && visible(m));
  const fanfic = all.filter((m) => m.source && !m.created && visible(m));
  const searching = Boolean(query.trim()) || genre !== 'all';
  const coverOf = (m: StoryMeta) => (importedIds.has(m.id) ? imported.find((i) => i.meta.id === m.id)?.cover ?? null : coverUrl(m));

  const renderCard = (m: StoryMeta) => {
    const save = saves[m.id];
    const p = progress[m.id];
    const cover = coverOf(m);
    return (
      <Link
        key={m.id}
        to={`/story/${m.id}`}
        className="block rounded-2xl border overflow-hidden transition hover:-translate-y-0.5 focus:outline-none focus:ring-2"
        style={{ background: 'color-mix(in srgb, var(--sk-surface) 85%, transparent)', borderColor: 'color-mix(in srgb, var(--sk-accent) 25%, transparent)', boxShadow: '0 8px 24px -12px color-mix(in srgb, var(--sk-accent) 40%, transparent)' }}
      >
        {cover && <CoverImage url={cover} />}
        <div className="p-3 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-sm" style={{ color: 'var(--sk-text)' }}>{m.title}</span>
            <span className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--sk-muted)' }}>{m.mode === 'character' ? 'Character' : 'Story'} · {m.rating}</span>
          </div>
          {m.source && <div className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--sk-accent)' }}>{m.created ? 'Your fanfic' : 'Fan fiction'} · {m.source.title}</div>}
          <p className="text-xs line-clamp-3" style={{ color: 'var(--sk-muted)' }}>{m.blurb}</p>
          <div className="text-[11px]" style={{ color: 'var(--sk-accent)' }}>
            {save ? (save.state.ending ? 'Finished. Open to play again' : 'Resume where you stopped') : 'Start'}
            {p?.endings.length ? ` · ${p.endings.length} ending${p.endings.length === 1 ? '' : 's'} found` : ''}
          </div>
          <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              void shareStory(m);
            }}
            className="text-[10px] inline-flex items-center gap-1 underline"
            style={{ color: 'var(--sk-muted)' }}
            aria-label={`Share ${m.title} as a zip`}
          >
            <Share2 className="w-3 h-3" /> Share
          </button>
          {importedIds.has(m.id) && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                void removeStory(m);
              }}
              className="text-[10px] inline-flex items-center gap-1 underline"
              style={{ color: 'var(--sk-muted)' }}
              aria-label={`Remove imported story ${m.title}`}
            >
              <Trash2 className="w-3 h-3" /> {m.created ? 'Delete' : 'Imported · remove'}
            </button>
          )}
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div
      className="relative min-h-[calc(100vh-4rem)]"
      style={{
        ...(skinVars(ANIME_SKIN) as React.CSSProperties),
        background: 'radial-gradient(1200px 500px at 15% -10%, color-mix(in srgb, var(--sk-accent) 22%, transparent), transparent 60%), radial-gradient(900px 400px at 100% 0%, rgba(110, 200, 255, 0.16), transparent 60%), var(--sk-bg)',
        color: 'var(--sk-text)',
        fontFamily: 'var(--sk-font-body)'
      }}
    >
    <Particles kind={ANIME_SKIN.particles} />
    {review && <ImportReview prepared={review} onCancel={() => setReview(null)} onConfirm={(c) => void confirmStories(c)} />}
    <div className="relative max-w-5xl mx-auto px-4 py-6 space-y-6">
      <ModeSwitch />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ fontFamily: 'var(--sk-font-heading)', color: 'var(--sk-accent)', textShadow: '0 0 18px color-mix(in srgb, var(--sk-accent) 45%, transparent)' }}><BookOpen className="w-5 h-5" /> Story mode</h1>
          <p className="text-xs" style={{ color: 'var(--sk-muted)' }}>Choose-your-own-adventure stories with fixed beats, several endings and their own look.</p>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" disabled={importing} onClick={() => pkgRef.current?.click()} className="text-xs inline-flex items-center gap-1 border border-slate-700 rounded px-3 py-1.5 text-slate-300 hover:border-amber-500/60 disabled:opacity-50" title="A story package zip, or a zip of many packages">
            <PackagePlus className="w-3 h-3" /> {importing ? 'Adding…' : 'Add stories (zip)'}
          </button>
          <input ref={pkgRef} type="file" accept=".zip,application/zip,.json,.webp" multiple className="hidden" onChange={(e) => void addStories(e.target.files)} />
          <button type="button" disabled={importing} onClick={() => folderRef.current?.click()} className="text-xs inline-flex items-center gap-1 border border-slate-700 rounded px-3 py-1.5 text-slate-300 hover:border-amber-500/60 disabled:opacity-50" title="A package folder (story.json and art/), or a folder of packages">
            <FolderOpen className="w-3 h-3" /> Add a folder
          </button>
          <input ref={folderRef} type="file" multiple className="hidden" {...({ webkitdirectory: '', directory: '' } as Record<string, string>)} onChange={(e) => void addStories(e.target.files)} />
          <button type="button" onClick={() => fileRef.current?.click()} className="text-xs inline-flex items-center gap-1 border border-slate-700 rounded px-3 py-1.5 text-slate-300 hover:border-amber-500/60">
            <Upload className="w-3 h-3" /> Import a save
          </button>
          <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => e.target.files?.[0] && importSave(e.target.files[0])} />
          <Link to="/" className="text-xs text-slate-400 hover:text-amber-400 underline">Home</Link>
        </div>
      </div>
 {results.length > 0 && (
        <div role="status" className="rounded-lg border p-3 space-y-2 text-xs" style={{ borderColor: 'color-mix(in srgb, var(--sk-accent) 30%, transparent)', background: 'var(--sk-surface)' }}>
          <p className="font-semibold">
            {results.filter((r) => r.ok).length} of {results.length} stor{results.length === 1 ? 'y' : 'ies'} added
          </p>
          <ul className="space-y-1">
            {results.map((r, i) => (
              <li key={i}>
                <span style={{ color: r.ok ? '#86efac' : '#fca5a5' }}>{r.ok ? (r.replaced ? 'Updated' : 'Added') : 'Not added'}</span>{' '}
                {r.title ? `"${r.title}"` : r.dir}
                {r.report && <pre className="whitespace-pre-wrap mt-1 text-[11px]" style={{ color: 'var(--sk-muted)' }}>{r.report}</pre>}
              </li>
            ))}
          </ul>
        </div>
      )}
      {note && <p role="alert" className={`text-xs ${note.kind === 'error' ? 'text-red-300' : 'text-emerald-300'}`}>{note.text}</p>}


      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Search stories</span>
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--sk-muted)' }} aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search stories, games, shows, books..."
            className="w-full rounded-full pl-9 pr-3 py-2 text-sm border bg-transparent"
            style={{ borderColor: 'color-mix(in srgb, var(--sk-accent) 35%, transparent)', color: 'var(--sk-text)' }}
          />
        </label>
      </div>
      {genres.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter by genre">
          {[{ id: 'all' as const, name: 'All genres' }, ...genres].map((g) => (
            <button
              key={g.id}
              type="button"
              aria-pressed={genre === g.id}
              onClick={() => setGenre(g.id)}
              className="shrink-0 text-xs rounded-full px-3 py-1 border"
              style={{
                borderColor: genre === g.id ? 'var(--sk-accent)' : 'color-mix(in srgb, var(--sk-text) 20%, transparent)',
                background: genre === g.id ? 'color-mix(in srgb, var(--sk-accent) 20%, transparent)' : 'transparent',
                color: 'var(--sk-text)'
              }}
            >
              {g.name}
            </button>
          ))}
        </div>
      )}

      {originals.length > 0 && (
        <section aria-labelledby="sec-originals" className="space-y-2">
          <h2 id="sec-originals" className="text-lg font-bold flex items-center gap-2" style={{ fontFamily: 'var(--sk-font-heading)', color: 'var(--sk-text)' }}>
            <Pin className="w-4 h-4" style={{ color: 'var(--sk-accent)' }} aria-hidden="true" /> Originals
          </h2>
          <p className="text-xs" style={{ color: 'var(--sk-muted)' }}>ZeroRoll's own stories.</p>
          {/* A swipeable row on phones, so the fan fiction below is not pushed off screen. */}
          <div className="flex gap-3 overflow-x-auto snap-x pb-1 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:overflow-visible">
            {originals.map((m) => (
              <div key={m.id} className="shrink-0 w-[80%] snap-start sm:w-auto">{renderCard(m)}</div>
            ))}
          </div>
        </section>
      )}

      <section aria-labelledby="sec-fanfic" className="space-y-4">
        <div>
          <h2 id="sec-fanfic" className="text-lg font-bold flex items-center gap-2" style={{ fontFamily: 'var(--sk-font-heading)', color: 'var(--sk-text)' }}>
            <Sparkles className="w-4 h-4" style={{ color: 'var(--sk-accent)' }} aria-hidden="true" /> Fan fiction
          </h2>
          <p className="text-xs" style={{ color: 'var(--sk-muted)' }}>Unofficial spin-offs set in worlds you know. You play a new character in a new story.</p>
        </div>
        {!searching && (
          <Link
            to="/story/create"
            className="flex items-center gap-3 rounded-2xl border border-dashed p-4 transition hover:-translate-y-0.5"
            style={{ borderColor: 'var(--sk-accent)', background: 'color-mix(in srgb, var(--sk-accent) 8%, transparent)' }}
          >
            <Wand2 className="w-6 h-6 shrink-0" style={{ color: 'var(--sk-accent)' }} aria-hidden="true" />
            <span>
              <span className="block font-semibold text-sm">Create your own fanfic</span>
              <span className="block text-xs" style={{ color: 'var(--sk-muted)' }}>Name a game, show, anime or book. The AI writes a branching story set in it, starring you.</span>
            </span>
          </Link>
        )}
        {yours.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Your fanfics</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{yours.map(renderCard)}</div>
          </div>
        )}
        {FANFIC_GROUPS.map((g) => {
          const inGroup = fanfic.filter((m) => g.mediums.includes(m.source!.medium));
          if (!inGroup.length) return null;
          return (
            <div key={g.id} className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--sk-accent)' }}>{g.name}</h3>
              {!query.trim() && (
                <div className="flex flex-wrap gap-1.5" role="group" aria-label={`${g.name}: jump to a work`}>
                  {groupBySource(inGroup).map(([title, list]) => (
                    <button
                      key={title}
                      type="button"
                      onClick={() => setQuery(title)}
                      className="text-[11px] rounded-full px-2.5 py-1 border"
                      style={{ borderColor: 'color-mix(in srgb, var(--sk-text) 20%, transparent)', color: 'var(--sk-text)' }}
                    >
                      {title} <span style={{ color: 'var(--sk-muted)' }}>{list.length}</span>
                    </button>
                  ))}
                </div>
              )}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{groupBySource(inGroup).flatMap(([, list]) => list).map(renderCard)}</div>
            </div>
          );
        })}
        {searching && !fanfic.length && !yours.length && !originals.length && <p className="text-sm" style={{ color: 'var(--sk-muted)' }}>No stories match. Try another word or genre.</p>}
        {!searching && !fanfic.length && <p className="text-xs" style={{ color: 'var(--sk-muted)' }}>No fan fiction is installed yet.</p>}
      </section>
    </div>
    </div>
  );
}

/** A cover from the network, the art cache, or an imported package. */
function CoverImage({ url }: { url: string }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    void cachedArtUrl(url).then((u) => live && setSrc(u || null));
    return () => {
      live = false;
    };
  }, [url]);
  return src ? <img src={src} alt="" className="w-full h-32 object-cover" loading="lazy" /> : <div className="w-full h-32" style={{ background: 'color-mix(in srgb, var(--sk-accent) 10%, transparent)' }} />;
}
