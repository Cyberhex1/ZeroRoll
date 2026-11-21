import { useEffect, useId, useRef, useState } from 'react';

/**
 * A small "i" button that explains something. Tap or click to open (phones have no hover),
 * Escape or a tap elsewhere closes it. Escape here doesn't close the dialog around it.
 */
export function InfoTip({ text, label = 'What does this do?' }: { text: string; label?: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown);
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
      document.removeEventListener('keydown', onKey, true);
    };
  }, [open]);

  return (
    <span ref={ref} className="relative inline-flex">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        onClick={() => setOpen((v) => !v)}
        className="w-5 h-5 rounded-full border border-amber-500/50 text-amber-300 text-[11px] font-serif font-bold italic leading-none flex items-center justify-center hover:bg-amber-500/15 focus:outline-none focus:ring-2 focus:ring-amber-500"
      >
        i
      </button>
      {open && (
        <span
          id={id}
          role="tooltip"
          className="absolute right-0 top-7 z-20 w-64 max-w-[80vw] rounded-lg border border-amber-500/40 bg-[#0A0A0F] p-2.5 text-[11px] leading-relaxed text-slate-200 shadow-2xl normal-case tracking-normal font-sans font-normal"
        >
          {text}
        </span>
      )}
    </span>
  );
}
