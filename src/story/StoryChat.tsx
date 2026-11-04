import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { complete, Tier, TIERS } from '../ai/router';
import { ChatMessage } from '../ai/transport';
import { classifyAIError, describeAIError } from '../lib/aiErrors';
import { reportAIFailure } from '../lib/aiStatus';
import { AI_PROVIDERS } from '../lib/providersConfig';
import { getActiveProvider } from '../lib/geminiService';

interface Turn extends ChatMessage {
  /** "Google Gemini (gemini-flash-latest), good tier" on assistant turns. */
  answeredBy?: string;
}

const SYSTEM = [
  'You are the narrator of a choose-your-own-adventure story in ZeroRoll.',
  'This is a placeholder story used to test the story engine: keep replies under 150 words,',
  'write in second person, and end each reply with two or three numbered choices.'
].join(' ');

const TIER_LABEL: Record<Tier, string> = { basic: 'Basic (fast)', good: 'Good (default)', best: 'Best (strongest)' };

/**
 * Placeholder Story mode screen. It exists to prove the route and the tier router end to end;
 * the real story player (beats, skins, art) replaces it in Phase 2.
 */
export default function StoryChat() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState('');
  const [tier, setTier] = useState<Tier>('good');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => () => abortRef.current?.abort(), []);
  useEffect(() => {
    endRef.current?.scrollIntoView?.({ behavior: 'smooth' });
  }, [turns.length]);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || busy) return;
    const history: Turn[] = [...turns, { role: 'user', content }];
    setTurns(history);
    setDraft('');
    setError(null);
    setBusy(true);
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const reply = await complete(
        history.map(({ role, content: c }) => ({ role, content: c })),
        tier,
        { system: SYSTEM, signal: controller.signal, feature: 'Story chat', temperature: 0.9 }
      );
      const providerName = AI_PROVIDERS[reply.provider]?.name || reply.provider;
      setTurns([...history, { role: 'assistant', content: reply.text, answeredBy: `${providerName} (${reply.model}), ${reply.tier} tier` }]);
    } catch (err) {
      const aiErr = classifyAIError(err, getActiveProvider());
      if (aiErr.kind === 'cancelled') return;
      const message = describeAIError(aiErr, AI_PROVIDERS[getActiveProvider()]?.name || 'The AI provider');
      reportAIFailure(aiErr, message, { feature: 'Story chat', usedFallback: false });
      setError(message);
      // Put the player's words back so they can retry without retyping.
      setTurns(turns);
      setDraft(content);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-4 min-h-[70vh]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-amber-400">Story mode (preview)</h1>
          <p className="text-xs text-slate-400">A test story that runs on the new AI router. Real stories arrive in the next phase.</p>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="story-tier" className="text-xs text-slate-400">Model tier</label>
          <select
            id="story-tier"
            value={tier}
            onChange={(e) => setTier(e.target.value as Tier)}
            className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs"
          >
            {TIERS.map((t) => (
              <option key={t} value={t}>{TIER_LABEL[t]}</option>
            ))}
          </select>
          <Link to="/" className="text-xs text-slate-400 hover:text-amber-400 underline">Home</Link>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-3" aria-live="polite">
        {turns.length === 0 && (
          <button
            type="button"
            onClick={() => send('Begin the story.')}
            className="self-start bg-amber-500 text-slate-950 font-semibold text-sm px-4 py-2 rounded hover:bg-amber-400"
          >
            Begin the story
          </button>
        )}
        {turns.map((t, i) => (
          <div
            key={i}
            className={t.role === 'user'
              ? 'self-end max-w-[85%] bg-slate-800 rounded-lg px-3 py-2 text-sm'
              : 'self-start max-w-[95%] bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm whitespace-pre-wrap'}
          >
            {t.content}
            {t.answeredBy && <div className="mt-1 text-[10px] font-mono text-slate-500">{t.answeredBy}</div>}
          </div>
        ))}
        {busy && <div className="text-xs font-mono text-slate-400">The narrator is writing...</div>}
        {error && (
          <div role="alert" className="text-xs text-red-300 bg-red-950/60 border border-red-800 rounded px-3 py-2">
            {error}
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(draft);
        }}
        className="flex gap-2"
      >
        <label htmlFor="story-input" className="sr-only">Your choice or action</label>
        <input
          id="story-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a choice number or what you do"
          maxLength={500}
          className="flex-1 bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={busy || !draft.trim()}
          className="bg-amber-500 text-slate-950 font-semibold text-sm px-4 py-2 rounded disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
