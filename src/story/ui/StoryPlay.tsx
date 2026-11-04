import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowLeft, Download, Map as MapIcon, RefreshCw, RotateCcw, SkipForward } from 'lucide-react';
import { complete, Tier, TIERS } from '../../ai/router';
import { classifyAIError, describeAIError } from '../../lib/aiErrors';
import { reportAIFailure } from '../../lib/aiStatus';
import { AI_PROVIDERS } from '../../lib/providersConfig';
import { getActiveProvider } from '../../lib/geminiService';
import { isMatureContentEnabled } from '../../lib/contentRating';
import { StoryProgress, StoryRepository } from '../../storage/storyRepository';
import { loadStory } from '../catalog';
import { beatOf } from '../engine';
import { PlaySave, addPlayerInput, currentChips, narrate, newSave, rewindForReroll } from '../play';
import type { Story } from '../schema';
import { resolveSkin, skinVars } from '../skins';
import ArtImage from './ArtImage';
import Particles from './Particles';

const TIER_LABEL: Record<Tier, string> = { basic: 'Basic (fast, local on PC)', good: 'Good (default)', best: 'Best (strongest)' };
const LENGTHS = ['Short', 'Medium', 'Long'];

/** Plays one story. Every component here reads colours and fonts from the skin variables. */
export default function StoryPlay() {
  const { id = '' } = useParams();
  const [story, setStory] = useState<Story | null>(null);
  const [save, setSave] = useState<PlaySave | null>(null);
  const [progress, setProgress] = useState<StoryProgress | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const s = await loadStory(id);
        if (s.meta.rating === 'mature' && !isMatureContentEnabled()) throw new Error('This story is rated mature. Turn on Mature content in Settings to play it.');
        const existing = (await StoryRepository.load(id)) as PlaySave | undefined;
        if (!live) return;
        setStory(s);
        setSave(existing ?? newSave(s));
        setProgress(await StoryRepository.progress(id));
      } catch (e) {
        if (live) setLoadError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      live = false;
      abortRef.current?.abort();
    };
  }, [id]);

  useEffect(() => {
    endRef.current?.scrollIntoView?.({ behavior: 'smooth' });
  }, [save?.messages.length]);

  const persist = useCallback(async (next: PlaySave, finished = false) => {
    setSave(next);
    try {
      await StoryRepository.save(next);
      setProgress(await StoryRepository.recordProgress(next.state, finished));
    } catch (e) {
      setError(`Your progress could not be saved on this device: ${e instanceof Error ? e.message : String(e)}`);
    }
  }, []);

  const runNarrator = async (base: PlaySave) => {
    if (!story) return;
    setBusy(true);
    setError(null);
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const r = await narrate(story, base, complete, { signal: controller.signal });
      await persist(r.save, Boolean(r.save.state.ending && !base.state.ending));
    } catch (err) {
      const aiErr = classifyAIError(err, getActiveProvider());
      if (aiErr.kind === 'cancelled') return;
      const message = describeAIError(aiErr, AI_PROVIDERS[getActiveProvider()]?.name || 'The AI provider');
      reportAIFailure(aiErr, message, { feature: 'Story mode', usedFallback: false });
      setError(message);
      // Keep the player's input on screen and saved, so Reroll (or sending again) retries it.
      await persist(base);
    } finally {
      setBusy(false);
    }
  };

  const send = (input: { text?: string; choiceId?: string }) => {
    if (!story || !save || busy || save.state.ending) return;
    // A new input starts a new turn, so Reroll can no longer go back past it.
    const next = { ...addPlayerInput(story, save, input).save, undo: undefined };
    setDraft('');
    void runNarrator(next);
  };

  const reroll = () => {
    if (!save || busy) return;
    const back = rewindForReroll(save);
    // After a failed call there is no undo snapshot: just ask again from where we are.
    void runNarrator(back ?? save);
  };

  const restart = async () => {
    if (!story || busy) return;
    if (!window.confirm('Start this story again from the beginning? Your endings and map stay.')) return;
    await persist(newSave(story, save?.tier));
  };

  const exportSave = async () => {
    const data = await StoryRepository.exportSave(id);
    if (!data) return;
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `zeroroll-${id}-save.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const skin = useMemo(() => (story ? resolveSkin(story.meta.category, story.skin) : null), [story]);

  if (loadError) {
    return (
      <div className="max-w-xl mx-auto px-4 py-10 space-y-3">
        <p role="alert" className="text-sm text-red-300">{loadError}</p>
        <Link to="/story" className="text-xs underline text-slate-300">Back to stories</Link>
      </div>
    );
  }
  if (!story || !save || !skin) return <div className="min-h-[60vh] flex items-center justify-center text-xs font-mono text-slate-400">Opening the story...</div>;

  const beat = beatOf(story, save.state.beat);
  const chips = currentChips(story, save);
  const ended = Boolean(save.state.ending);
  const lastIsPlayer = save.messages[save.messages.length - 1]?.kind === 'player';
  const btn = 'inline-flex items-center gap-1 rounded px-2.5 py-1.5 text-xs disabled:opacity-40 border';
  const btnStyle = { borderColor: 'color-mix(in srgb, var(--sk-accent) 40%, transparent)', color: 'var(--sk-text)' };

  return (
    <div
      className="relative min-h-[calc(100vh-4rem)]"
      style={{
        ...(skinVars(skin) as React.CSSProperties),
        background: 'var(--sk-bg)',
        color: 'var(--sk-text)',
        fontFamily: 'var(--sk-font-body)',
        backgroundImage: 'var(--sk-pattern)',
        backgroundSize: 'var(--sk-pattern-size)'
      }}
    >
      {skin.backgroundArt && (
        <div className="absolute inset-0 opacity-15 pointer-events-none overflow-hidden" aria-hidden="true">
          <ArtImage story={story} art={skin.backgroundArt} className="w-full h-full object-cover" decorative />
        </div>
      )}
      <Particles kind={skin.particles} />

      <div className="relative max-w-3xl mx-auto px-4 py-5 flex flex-col gap-4">
        <header className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Link to="/story" aria-label="Back to stories" className="p-1 rounded" style={{ color: 'var(--sk-muted)' }}><ArrowLeft className="w-4 h-4" /></Link>
            <div className="min-w-0">
              <h1 className="text-lg font-bold truncate" style={{ fontFamily: 'var(--sk-font-heading)', color: 'var(--sk-accent)' }}>{story.meta.title}</h1>
              <p className="text-[11px]" style={{ color: 'var(--sk-muted)' }}>{ended ? 'The end' : beat.title}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => setShowMap((v) => !v)} aria-expanded={showMap} className={btn} style={btnStyle}><MapIcon className="w-3 h-3" />Map</button>
            <button type="button" onClick={exportSave} className={btn} style={btnStyle}><Download className="w-3 h-3" />Export save</button>
            <button type="button" onClick={restart} disabled={busy} className={btn} style={btnStyle}><RotateCcw className="w-3 h-3" />Restart</button>
          </div>
        </header>

        {showMap && progress && <ProgressMap story={story} save={save} progress={progress} />}

        <section aria-label="Cast" className="flex gap-3 overflow-x-auto pb-1">
          {story.cast.map((c) => (
            <div key={c.id} className="flex items-center gap-2 shrink-0 rounded px-2 py-1.5" style={{ background: 'var(--sk-surface)' }}>
              {c.portrait && <ArtImage story={story} art={c.portrait} className="w-10 h-10 rounded-full object-cover" />}
              <div>
                <div className="text-xs font-semibold">{c.name}</div>
                <div className="text-[10px] max-w-[14rem] truncate" style={{ color: 'var(--sk-muted)' }} title={c.appearance}>{c.appearance}</div>
              </div>
            </div>
          ))}
        </section>

        <div className="flex flex-col gap-3" aria-live="polite">
          {save.messages.length === 0 && (
            <div className="space-y-3">
              {story.meta.cover && <ArtImage story={story} art={story.meta.cover} className="w-full max-h-72 object-cover" />}
              <p className="text-sm" style={{ color: 'var(--sk-muted)' }}>{story.meta.blurb}</p>
              <button type="button" disabled={busy} onClick={() => runNarrator(save)} className="rounded px-4 py-2 text-sm font-semibold" style={{ background: 'var(--sk-accent)', color: 'var(--sk-bg)' }}>
                {busy ? 'The story is starting...' : 'Begin the story'}
              </button>
            </div>
          )}
          {save.messages.map((m) => {
            if (m.kind === 'art' && m.art) {
              return (
                <figure key={m.id} className="self-center w-full">
                  <ArtImage story={story} art={m.art} className="w-full max-h-80 object-cover" />
                  <figcaption className="sr-only">{story.art[m.art]?.alt}</figcaption>
                </figure>
              );
            }
            if (m.kind === 'note') return <div key={m.id} className="self-center text-xs font-semibold px-3 py-1 rounded" style={{ color: 'var(--sk-accent)', background: 'var(--sk-surface)' }}>{m.text}</div>;
            const player = m.kind === 'player';
            const speaker = story.meta.mode === 'character' && !player ? story.cast.find((c) => c.id === story.meta.character) : undefined;
            return (
              <div key={m.id} className={`flex gap-2 ${player ? 'self-end flex-row-reverse max-w-[85%]' : 'self-start max-w-[95%]'}`}>
                {speaker?.portrait && <ArtImage story={story} art={speaker.portrait} className="w-8 h-8 rounded-full object-cover shrink-0 mt-1" />}
                <div className="px-3 py-2 text-sm whitespace-pre-wrap leading-relaxed" style={{ background: player ? 'var(--sk-player)' : 'var(--sk-narrator)', borderRadius: 'var(--sk-radius)' }}>
                  {speaker && <div className="text-[11px] font-semibold mb-0.5" style={{ color: 'var(--sk-accent)' }}>{speaker.name}</div>}
                  {m.text}
                  {m.answeredBy && <div className="mt-1 text-[10px] font-mono" style={{ color: 'var(--sk-muted)' }}>{m.answeredBy}</div>}
                </div>
              </div>
            );
          })}
          {busy && save.messages.length > 0 && <div className="text-xs font-mono" style={{ color: 'var(--sk-muted)' }}>{story.meta.mode === 'character' ? 'Thinking...' : 'The narrator is writing...'}</div>}
          {error && <div role="alert" className="text-xs text-red-200 bg-red-950/70 border border-red-800 rounded px-3 py-2">{error}</div>}
          <div ref={endRef} />
        </div>

        {save.messages.length > 0 && !ended && (
          <div className="space-y-2">
            {!lastIsPlayer && chips.length > 0 && (
              <div className="flex flex-wrap gap-2" role="group" aria-label="Choices">
                {chips.map((c) => (
                  <button
                    key={c.label}
                    type="button"
                    disabled={busy}
                    onClick={() => send(c.choiceId ? { choiceId: c.choiceId } : { text: c.label })}
                    className="text-xs rounded px-3 py-1.5 border text-left disabled:opacity-40"
                    style={{ borderColor: 'var(--sk-accent)', color: 'var(--sk-text)', background: 'var(--sk-surface)' }}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (draft.trim()) send({ text: draft });
              }}
              className="flex gap-2"
            >
              <label htmlFor="story-input" className="sr-only">What you do or say</label>
              <input
                id="story-input"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={story.meta.mode === 'character' ? 'Say something' : 'Or write what you do'}
                maxLength={600}
                className="flex-1 rounded px-3 py-2 text-sm border bg-transparent"
                style={{ borderColor: 'color-mix(in srgb, var(--sk-text) 25%, transparent)' }}
              />
              <button type="submit" disabled={busy || !draft.trim()} className="rounded px-4 py-2 text-sm font-semibold disabled:opacity-40" style={{ background: 'var(--sk-accent)', color: 'var(--sk-bg)' }}>Send</button>
            </form>
            <div className="flex flex-wrap items-center gap-3 text-xs" style={{ color: 'var(--sk-muted)' }}>
              <button type="button" onClick={reroll} disabled={busy || (!save.undo && !lastIsPlayer)} className={btn} style={btnStyle}><RefreshCw className="w-3 h-3" />{lastIsPlayer ? 'Try again' : 'Reroll'}</button>
              <button type="button" onClick={() => send({ text: 'Continue.' })} disabled={busy || lastIsPlayer} className={btn} style={btnStyle}><SkipForward className="w-3 h-3" />Continue</button>
              <label className="flex items-center gap-2">
                Length
                <input
                  type="range"
                  min={0}
                  max={2}
                  step={1}
                  value={save.length}
                  onChange={(e) => void persist({ ...save, length: Number(e.target.value) })}
                  aria-valuetext={LENGTHS[save.length]}
                  style={{ accentColor: 'var(--sk-accent)' }}
                />
                <span className="w-12">{LENGTHS[save.length]}</span>
              </label>
              <label className="flex items-center gap-2">
                Model
                <select value={save.tier} onChange={(e) => void persist({ ...save, tier: e.target.value as Tier })} className="rounded px-2 py-1 border bg-transparent" style={{ borderColor: 'color-mix(in srgb, var(--sk-text) 25%, transparent)' }}>
                  {TIERS.map((t) => (
                    <option key={t} value={t} style={{ background: '#111' }}>{TIER_LABEL[t]}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        )}

        {ended && (
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={restart} className="rounded px-4 py-2 text-sm font-semibold" style={{ background: 'var(--sk-accent)', color: 'var(--sk-bg)' }}>Play again</button>
            <button type="button" onClick={() => setShowMap(true)} className={btn} style={btnStyle}><MapIcon className="w-3 h-3" />See the map</button>
          </div>
        )}
      </div>
    </div>
  );
}

/** Visited beats by title, unvisited ones hidden, and every ending found so far. */
function ProgressMap({ story, save, progress }: { story: Story; save: PlaySave; progress: StoryProgress }) {
  const seen = new Set(progress.beatsSeen);
  const endings = story.beats.filter((b) => b.isEnding);
  return (
    <section aria-label="Story map" className="rounded p-3 space-y-2 text-xs" style={{ background: 'var(--sk-surface)' }}>
      <div className="font-semibold" style={{ color: 'var(--sk-accent)' }}>Map</div>
      <ol className="flex flex-wrap gap-1.5">
        {story.beats.filter((b) => !b.isEnding).map((b) => (
          <li key={b.id} className="px-2 py-1 rounded border" style={{ borderColor: b.id === save.state.beat ? 'var(--sk-accent)' : 'color-mix(in srgb, var(--sk-text) 15%, transparent)', opacity: seen.has(b.id) ? 1 : 0.5 }}>
            {seen.has(b.id) ? b.title : '???'}
          </li>
        ))}
      </ol>
      <div>
        Endings found: {progress.endings.length} of {endings.length}
        <ul className="mt-1 space-y-0.5">
          {endings.map((e) => (
            <li key={e.id}>{progress.endings.includes(e.id) ? `★ ${e.endingTitle ?? e.title}` : '☆ Not found yet'}</li>
          ))}
        </ul>
      </div>
      {progress.playthroughs > 0 && <div style={{ color: 'var(--sk-muted)' }}>Finished {progress.playthroughs} time{progress.playthroughs === 1 ? '' : 's'}.</div>}
    </section>
  );
}
