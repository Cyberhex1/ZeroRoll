import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowLeft, Wand2 } from 'lucide-react';
import ModeSwitch from '../../components/ModeSwitch';
import { isMatureContentEnabled } from '../../lib/contentRating';
import { hasActiveAIKey, reportFeatureFailure } from '../../lib/geminiService';
import { ANIME_SKIN, skinVars } from '../skins';
import Particles from './Particles';
import { FanficStep, createFanfic } from '../createFanfic';
import { MEDIUMS, Medium, Story } from '../schema';
import { MEDIUM_NAMES } from '../prompt';
import { installPackages } from '../importPackage';
import { AIError } from '../../lib/aiErrors';
import { forgetStory } from '../catalog';

const STEP_TEXT: Record<FanficStep, string> = {
  writing: 'Writing your story. A whole branching story takes the AI a minute or two...',
  fixing: 'A branch was broken, so the AI is fixing it...',
  checking: 'Reading the story over for problems...',
  revising: 'Fixing what the read-through found...',
  saving: 'Saving it on this device...'
};

/** "Create your own fanfic": the player names a work and the AI writes a branching story set in it. */
export default function FanficCreator() {
  const mature = isMatureContentEnabled();
  const [media, setMedia] = useState('');
  const [medium, setMedium] = useState<Medium | ''>('');
  const [idea, setIdea] = useState('');
  const [rating, setRating] = useState<Story['meta']['rating']>('teen');
  const [step, setStep] = useState<FanficStep | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const navigate = useNavigate();
  useEffect(() => () => abortRef.current?.abort(), []);

  const busy = step !== null;
  const field = 'w-full rounded px-3 py-2 text-sm border bg-transparent';
  const fieldStyle = { borderColor: 'color-mix(in srgb, var(--sk-text) 25%, transparent)', color: 'var(--sk-text)' };

  const write = async () => {
    if (busy || !media.trim()) return;
    if (!hasActiveAIKey()) {
      setError('Add an AI key in Settings first: the story is written by your AI provider.');
      return;
    }
    setError(null);
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const story = await createFanfic({ media, medium: medium || undefined, idea, rating, signal: controller.signal, onStep: setStep });
      await installPackages([{ result: { dir: story.meta.id, id: story.meta.id, title: story.meta.title, ok: true, report: '' }, story, art: [] }]);
      forgetStory(story.meta.id);
      navigate(`/story/${story.meta.id}`);
    } catch (e) {
      if (controller.signal.aborted) return;
      const msg = e instanceof Error && !(e instanceof AIError) ? e.message : reportFeatureFailure(e, 'Create your own fanfic', false, { banner: false }).message;
      setError(msg);
    } finally {
      setStep(null);
    }
  };

  return (
    <div
      className="relative min-h-[calc(100vh-4rem)]"
      style={{
        ...(skinVars(ANIME_SKIN) as React.CSSProperties),
        background: 'radial-gradient(1200px 500px at 15% -10%, color-mix(in srgb, var(--sk-accent) 22%, transparent), transparent 60%), var(--sk-bg)',
        color: 'var(--sk-text)',
        fontFamily: 'var(--sk-font-body)'
      }}
    >
      <Particles kind={ANIME_SKIN.particles} />
      <div className="relative max-w-xl mx-auto px-4 py-6 space-y-5">
        <ModeSwitch />
        <Link to="/story" className="inline-flex items-center gap-1 text-xs underline" style={{ color: 'var(--sk-muted)' }}><ArrowLeft className="w-3 h-3" /> All stories</Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ fontFamily: 'var(--sk-font-heading)', color: 'var(--sk-accent)' }}><Wand2 className="w-5 h-5" /> Create your own fanfic</h1>
          <p className="text-xs mt-1" style={{ color: 'var(--sk-muted)' }}>
            Name something you love. The AI writes a new choose-your-own-adventure story set in its world, with branching choices and more than one ending, and you play a new character in it. It is saved on this device only.
          </p>
        </div>
        <form
          className="space-y-4 rounded-lg p-4"
          style={{ background: 'var(--sk-surface)' }}
          onSubmit={(e) => {
            e.preventDefault();
            void write();
          }}
        >
          <div className="space-y-1">
            <label htmlFor="ff-media" className="text-xs font-semibold">What is it set in?</label>
            <input id="ff-media" value={media} onChange={(e) => setMedia(e.target.value)} maxLength={80} required placeholder="e.g. Baldur's Gate 3, Lookism, Pride and Prejudice" className={field} style={fieldStyle} disabled={busy} />
          </div>
          <div className="space-y-1">
            <label htmlFor="ff-medium" className="text-xs font-semibold">What kind of work is it?</label>
            <select id="ff-medium" value={medium} onChange={(e) => setMedium(e.target.value as Medium | '')} className={field} style={fieldStyle} disabled={busy}>
              <option value="" style={{ background: '#111' }}>Not sure</option>
              {MEDIUMS.map((m) => (
                <option key={m} value={m} style={{ background: '#111' }}>{MEDIUM_NAMES[m][0].toUpperCase() + MEDIUM_NAMES[m].slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label htmlFor="ff-idea" className="text-xs font-semibold">What should it be about? <span className="font-normal" style={{ color: 'var(--sk-muted)' }}>(optional)</span></label>
            <textarea id="ff-idea" value={idea} onChange={(e) => setIdea(e.target.value)} maxLength={600} rows={3} placeholder="A character you want to meet, a place, a kind of story... or leave it to the AI." className={field} style={fieldStyle} disabled={busy} />
          </div>
          <fieldset className="space-y-1">
            <legend className="text-xs font-semibold">Rating</legend>
            <div className="flex flex-wrap gap-2">
              {(['everyone', 'teen', ...(mature ? (['mature'] as const) : [])] as Array<Story['meta']['rating']>).map((r) => (
                <button
                  key={r}
                  type="button"
                  aria-pressed={rating === r}
                  disabled={busy}
                  onClick={() => setRating(r)}
                  className="text-xs rounded-full px-3 py-1.5 border capitalize"
                  style={{ borderColor: rating === r ? 'var(--sk-accent)' : 'color-mix(in srgb, var(--sk-text) 25%, transparent)', background: rating === r ? 'color-mix(in srgb, var(--sk-accent) 22%, transparent)' : 'transparent' }}
                >
                  {r}
                </button>
              ))}
            </div>
          </fieldset>
          <p className="text-[11px]" style={{ color: 'var(--sk-muted)' }}>You'll pick your name and pronouns when the story starts. Writing uses a few calls to your AI provider (the story model in Settings writes it).</p>
          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" disabled={busy || !media.trim()} className="rounded px-4 py-2 text-sm font-semibold disabled:opacity-40" style={{ background: 'var(--sk-accent)', color: 'var(--sk-bg)' }}>
              {busy ? 'Writing...' : 'Write my story'}
            </button>
            {busy && (
              <button type="button" onClick={() => abortRef.current?.abort()} className="text-xs underline" style={{ color: 'var(--sk-muted)' }}>Cancel</button>
            )}
          </div>
          {step && <p role="status" className="text-xs" style={{ color: 'var(--sk-accent)' }}>{STEP_TEXT[step]}</p>}
          {error && <p role="alert" className="text-xs text-red-200 bg-red-950/70 border border-red-800 rounded px-3 py-2">{error}</p>}
        </form>
      </div>
    </div>
  );
}
