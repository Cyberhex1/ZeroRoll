import { useId, useState } from 'react';
import { PRONOUN_CHOICES, PlayerIdentity, cleanPlayer, lastPlayer } from '../player';

/**
 * "Who are you in this story?": asked before every story begins, with the last answer filled in.
 * Reads the story's skin variables, so it matches whatever story it opens.
 */
export default function PlayerSetup({ initial, busy, onBegin }: { initial?: PlayerIdentity; busy: boolean; onBegin: (p: PlayerIdentity) => void }) {
  const start = initial ?? lastPlayer();
  const [name, setName] = useState(start?.name ?? '');
  const known = (PRONOUN_CHOICES as readonly string[]).includes(start?.pronouns ?? '');
  const [choice, setChoice] = useState<string>(start ? (known ? start.pronouns : 'other') : '');
  const [other, setOther] = useState(start && !known ? start.pronouns : '');
  const ids = useId();
  const pronouns = choice === 'other' ? other : choice;
  const player = cleanPlayer(name, pronouns);
  const ready = Boolean(player && pronouns.trim());

  const pill = (active: boolean) => ({
    borderColor: active ? 'var(--sk-accent)' : 'color-mix(in srgb, var(--sk-text) 25%, transparent)',
    background: active ? 'color-mix(in srgb, var(--sk-accent) 22%, transparent)' : 'transparent',
    color: 'var(--sk-text)'
  });

  return (
    <form
      className="rounded-lg p-4 space-y-3"
      style={{ background: 'var(--sk-surface)' }}
      aria-labelledby={`${ids}-h`}
      onSubmit={(e) => {
        e.preventDefault();
        if (ready && player) onBegin(player);
      }}
    >
      <h2 id={`${ids}-h`} className="text-sm font-semibold" style={{ color: 'var(--sk-accent)', fontFamily: 'var(--sk-font-heading)' }}>Who are you in this story?</h2>
      <div className="space-y-1">
        <label htmlFor={`${ids}-name`} className="text-xs" style={{ color: 'var(--sk-muted)' }}>Your name</label>
        <input
          id={`${ids}-name`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={40}
          autoComplete="off"
          placeholder="What the story calls you"
          className="w-full rounded px-3 py-2 text-sm border bg-transparent"
          style={{ borderColor: 'color-mix(in srgb, var(--sk-text) 25%, transparent)', color: 'var(--sk-text)' }}
        />
      </div>
      <fieldset className="space-y-1">
        <legend className="text-xs" style={{ color: 'var(--sk-muted)' }}>Your pronouns</legend>
        <div className="flex flex-wrap gap-2">
          {[...PRONOUN_CHOICES, 'other'].map((p) => (
            <button key={p} type="button" aria-pressed={choice === p} onClick={() => setChoice(p)} className="text-xs rounded-full px-3 py-1.5 border" style={pill(choice === p)}>
              {p === 'other' ? 'Something else' : p}
            </button>
          ))}
        </div>
        {choice === 'other' && (
          <>
            <label htmlFor={`${ids}-other`} className="sr-only">Your pronouns</label>
            <input
              id={`${ids}-other`}
              value={other}
              onChange={(e) => setOther(e.target.value)}
              maxLength={30}
              placeholder="e.g. xe/xem, she/they"
              className="w-full rounded px-3 py-2 text-sm border bg-transparent"
              style={{ borderColor: 'color-mix(in srgb, var(--sk-text) 25%, transparent)', color: 'var(--sk-text)' }}
            />
          </>
        )}
      </fieldset>
      <button type="submit" disabled={busy || !ready} className="rounded px-4 py-2 text-sm font-semibold disabled:opacity-40" style={{ background: 'var(--sk-accent)', color: 'var(--sk-bg)' }}>
        {busy ? 'The story is starting...' : 'Begin the story'}
      </button>
    </form>
  );
}
