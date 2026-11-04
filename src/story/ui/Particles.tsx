import { useMemo } from 'react';
import type { Skin } from '../skins';

const LOOK: Record<Exclude<Skin['particles'], 'none'>, { size: [number, number]; dur: [number, number]; color: string; dir: 'up' | 'down' }> = {
  embers: { size: [2, 4], dur: [6, 12], color: '#ff8a3d', dir: 'up' },
  snow: { size: [2, 5], dur: [10, 18], color: '#ffffff', dir: 'down' },
  petals: { size: [4, 7], dur: [12, 20], color: '#f7b6c8', dir: 'down' },
  rain: { size: [1, 2], dur: [1.2, 2.2], color: '#9fc3e6', dir: 'down' },
  motes: { size: [2, 3], dur: [14, 24], color: 'var(--sk-accent)', dir: 'up' },
  ash: { size: [2, 4], dur: [12, 20], color: '#9a9a9a', dir: 'down' }
};

/** Light ambient particles behind the chat. Hidden for players who prefer reduced motion. */
export default function Particles({ kind }: { kind: Skin['particles'] }) {
  const dots = useMemo(() => {
    if (kind === 'none') return [];
    const l = LOOK[kind];
    const r = (a: number, b: number) => a + Math.random() * (b - a);
    return Array.from({ length: 22 }, (_, i) => ({ i, left: r(0, 100), size: r(...l.size), dur: r(...l.dur), delay: -r(0, l.dur[1]), opacity: r(0.25, 0.7) }));
  }, [kind]);
  if (kind === 'none') return null;
  const l = LOOK[kind];
  return (
    <div className="sk-particles pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {dots.map((d) => (
        <span
          key={d.i}
          className={l.dir === 'up' ? 'sk-rise' : 'sk-fall'}
          style={{ left: `${d.left}%`, width: d.size, height: kind === 'rain' ? d.size * 8 : d.size, background: l.color, opacity: d.opacity, animationDuration: `${d.dur}s`, animationDelay: `${d.delay}s` }}
        />
      ))}
    </div>
  );
}
