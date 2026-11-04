import { useEffect, useRef } from 'react';

const FOCUSABLE = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Modal dialog behaviour (M9): focus moves into the dialog and stays there (Tab wraps),
 * Escape closes it unless `dismissable` is false, and focus returns to whatever opened it.
 * Spread `dialogProps` on the panel and `overlayProps` on the backdrop.
 */
export function useDialog(onClose: () => void, opts: { labelledBy?: string; dismissable?: boolean; active?: boolean } = {}) {
  const { labelledBy, dismissable = true, active = true } = opts;
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!active) return;
    const opener = document.activeElement as HTMLElement | null;
    const panel = ref.current;
    const first = panel?.querySelector<HTMLElement>('[autofocus], [data-autofocus]') ?? panel?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? panel)?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (!ref.current) return;
      if (e.key === 'Escape' && dismissable) {
        e.stopPropagation();
        closeRef.current();
        return;
      }
      if (e.key !== 'Tab') return;
      const items = Array.from(ref.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null || el === document.activeElement);
      if (!items.length) {
        e.preventDefault();
        return;
      }
      const firstEl = items[0];
      const lastEl = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === firstEl || !ref.current.contains(document.activeElement))) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && (document.activeElement === lastEl || !ref.current.contains(document.activeElement))) {
        e.preventDefault();
        firstEl.focus();
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('keydown', onKey, true);
      if (opener && document.contains(opener)) opener.focus({ preventScroll: true });
    };
  }, [active, dismissable]);

  return {
    dialogProps: { ref, role: 'dialog' as const, 'aria-modal': true as const, tabIndex: -1, ...(labelledBy ? { 'aria-labelledby': labelledBy } : {}) },
    overlayProps: {
      onMouseDown: (e: React.MouseEvent) => {
        if (dismissable && e.target === e.currentTarget) closeRef.current();
      }
    }
  };
}
