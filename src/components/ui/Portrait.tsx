import { useEffect, useState } from 'react';
import { resolvePortrait } from '../../lib/portraits';

/**
 * A hero portrait from a saved value (an image stored on this device, or an older URL).
 * While it loads, when it is missing on this device, or when the URL no longer works, it
 * shows the hero's initial instead of a broken image (PS6).
 */
export function Portrait({ value, name, className = '', loading = false }: { value?: string; name: string; className?: string; loading?: boolean }) {
  const [src, setSrc] = useState<string | null>(null);
  const [broken, setBroken] = useState(false);
  useEffect(() => {
    let live = true;
    setBroken(false);
    void resolvePortrait(value).then((u) => live && setSrc(u));
    return () => {
      live = false;
    };
  }, [value]);
  if (!src || broken || loading) {
    return (
      <div className={`flex items-center justify-center bg-amber-950/40 text-amber-300 font-serif font-bold ${loading ? 'animate-pulse' : ''} ${className}`} aria-label={loading ? `Drawing a portrait of ${name}` : `${name}, no portrait`} role="img">
        {(name || '?').trim().charAt(0).toUpperCase()}
      </div>
    );
  }
  return <img src={src} alt={`Portrait of ${name}`} className={`object-cover ${className}`} onError={() => setBroken(true)} />;
}
