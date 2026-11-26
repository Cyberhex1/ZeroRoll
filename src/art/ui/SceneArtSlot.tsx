import { useEffect, useState } from 'react';
import { Brush, RotateCcw, X } from 'lucide-react';
import { resolvePortrait } from '../../lib/portraits';
import { freshSceneRefs, imageModelInfo, pictureCostLabel } from '../sceneArt';

export type SceneArtJob = { status: 'painting'; reason: string } | { status: 'error'; message: string; reason: string };

/**
 * Under a Game Master message: the painted scene, a "painting" placeholder, a failure with a
 * retry button, or (on the newest message only) a button to paint it on request.
 */
export function SceneArtSlot(props: {
  art?: { ref: string; model: string; reason: string };
  job?: SceneArtJob;
  /** Set when the paint button may show for this message. */
  canPaint?: { model: string } | null;
  onPaint?: () => void;
  onDismissError?: () => void;
}) {
  const { art, job, canPaint, onPaint, onDismissError } = props;

  if (art) return <ScenePicture art={art} />;

  if (job?.status === 'painting') {
    return (
      <div role="status" className="mt-2 aspect-video w-full rounded border border-white/10 bg-gradient-to-br from-white/[0.04] to-amber-500/[0.06] animate-pulse flex items-center justify-center text-[11px] text-amber-300/80 font-mono gap-2">
        <Brush className="w-3.5 h-3.5" /> Painting the scene…
      </div>
    );
  }

  if (job?.status === 'error') {
    return (
      <div role="alert" className="mt-2 rounded border border-red-500/30 bg-red-950/30 p-2 text-[11px] text-red-200 flex items-start gap-2">
        <span className="flex-1">Scene art failed: {job.message}</span>
        {onPaint && (
          <button type="button" onClick={onPaint} className="shrink-0 inline-flex items-center gap-1 rounded bg-white/10 px-2 py-0.5 text-red-100 hover:bg-white/20">
            <RotateCcw className="w-3 h-3" /> Retry
          </button>
        )}
        {onDismissError && (
          <button type="button" onClick={onDismissError} aria-label="Dismiss" className="shrink-0 text-red-300 hover:text-red-100">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  }

  if (canPaint && onPaint) {
    return (
      <button
        type="button"
        onClick={onPaint}
        title={`Paint a picture of this moment with ${imageModelInfo(canPaint.model)?.label ?? canPaint.model}`}
        className="mt-1.5 inline-flex items-center gap-1.5 rounded border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-slate-400 hover:border-amber-500/40 hover:text-amber-200"
      >
        <Brush className="w-3 h-3" /> Paint this scene ({pictureCostLabel(canPaint.model)})
      </button>
    );
  }
  return null;
}

function ScenePicture({ art }: { art: { ref: string; model: string; reason: string } }) {
  const [src, setSrc] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);
  const [big, setBig] = useState(false);
  useEffect(() => {
    let live = true;
    void resolvePortrait(art.ref).then((u) => {
      if (!live) return;
      setSrc(u);
      setMissing(!u);
    });
    return () => {
      live = false;
    };
  }, [art.ref]);

  if (missing) {
    return <p className="mt-1.5 text-[10px] text-slate-500 italic">A scene picture was painted here on another device.</p>;
  }
  if (!src) return <div className="mt-2 aspect-video w-full rounded bg-white/[0.03]" />;
  const caption = `Scene art · ${imageModelInfo(art.model)?.label ?? art.model}${art.reason && art.reason !== 'asked' ? ` · ${art.reason}` : ''}`;
  return (
    <>
      <figure className="mt-2">
        <button type="button" onClick={() => setBig(true)} className="block w-full" aria-label="Enlarge the scene picture">
          <img
            src={src}
            alt="A painting of this moment in the story"
            className="w-full rounded border border-white/10 shadow-lg"
            onLoad={(e) => {
              // A picture that just arrived is brought into view once, so the player sees it.
              if (freshSceneRefs.delete(art.ref)) e.currentTarget.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }}
          />
        </button>
        <figcaption className="mt-1 text-[9px] font-mono text-slate-500">{caption}</figcaption>
      </figure>
      {big && (
        <div role="dialog" aria-label="Scene picture" className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setBig(false)}>
          <img src={src} alt="A painting of this moment in the story" className="max-w-full max-h-full rounded" />
        </div>
      )}
    </>
  );
}
