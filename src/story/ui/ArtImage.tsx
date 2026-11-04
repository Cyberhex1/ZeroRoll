import { useEffect, useState } from 'react';
import { artUrl, cachedArtUrl } from '../art';
import type { Story } from '../schema';

/** An authored image, loaded from the offline cache when it has been seen before. */
export default function ArtImage({ story, art, className, decorative }: { story: Story; art: string; className?: string; decorative?: boolean }) {
  const url = artUrl(story, art);
  const [src, setSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let live = true;
    setFailed(false);
    if (url) void cachedArtUrl(url).then((u) => live && setSrc(u));
    return () => {
      live = false;
    };
  }, [url]);
  const alt = story.art[art]?.alt ?? '';
  if (!url || failed) {
    return decorative ? null : <div className={`${className ?? ''} flex items-center justify-center text-xs p-3 text-center`} style={{ color: 'var(--sk-muted)' }}>{alt}</div>;
  }
  if (!src) return <div className={`${className ?? ''} animate-pulse`} style={{ background: 'var(--sk-surface)' }} aria-hidden="true" />;
  return <img src={src} alt={decorative ? '' : alt} className={className} onError={() => setFailed(true)} loading="lazy" />;
}
