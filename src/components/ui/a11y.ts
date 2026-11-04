/** Props that make a clickable non-button element reachable and usable by keyboard (PS5). */
export function clickable(fn: () => void, label?: string) {
  return {
    role: 'button' as const,
    tabIndex: 0,
    ...(label ? { 'aria-label': label } : {}),
    onClick: fn,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.target !== e.currentTarget) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        fn();
      }
    }
  };
}
