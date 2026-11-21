import { useState } from 'react';
import { approxFreeDailyLimit, clearModelsOut, formatResetTime, getGeminiUsageToday, modelOutUntil, nextPacificMidnight } from '../ai/quota';

/**
 * Today's Gemini requests from this browser, per model, against the rough free-tier daily
 * limits, and any model that is out of requests until Google's daily reset.
 * Counts only this browser: other devices using the same key are not included.
 */
export default function GeminiUsageMeter() {
  const [, setTick] = useState(0);
  const usage = getGeminiUsageToday();
  const models = Object.keys(usage).sort((a, b) => usage[b].requests - usage[a].requests);
  const outModels = models.filter((m) => modelOutUntil(m));
  const reset = formatResetTime(nextPacificMidnight());

  return (
    <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.03] p-3 text-[11px] text-slate-300" data-testid="gemini-usage">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="font-semibold text-slate-200">Gemini use today</span>
        <span className="text-slate-500">resets {reset}</span>
      </div>
      {models.length === 0 ? (
        <p className="text-slate-500">No requests from this browser yet today.</p>
      ) : (
        <ul className="space-y-1">
          {models.map((m) => {
            const u = usage[m];
            const limit = approxFreeDailyLimit(m);
            const out = modelOutUntil(m);
            const near = limit && u.requests >= limit * 0.75;
            return (
              <li key={m} className="flex items-center justify-between gap-2 font-mono">
                <span className="truncate">{m}</span>
                <span className={out ? 'text-red-400' : near ? 'text-amber-300' : 'text-slate-400'}>
                  {out
                    ? out.scope === 'zero' ? 'needs a paid key' : `used up until ${formatResetTime(out.until)}`
                    : `${u.requests}${limit ? ` of about ${limit} free` : ''} requests`}
                </span>
              </li>
            );
          })}
        </ul>
      )}
      <p className="mt-1.5 text-[10px] text-slate-500">
        Free limits are rough; a key with billing turned on gets far more. Counts this browser only.
      </p>
      {outModels.length > 0 && (
        <button
          type="button"
          onClick={() => {
            clearModelsOut();
            setTick((t) => t + 1);
          }}
          className="mt-1.5 rounded bg-white/5 px-2 py-1 text-[10px] text-slate-300 hover:bg-white/10"
        >
          Try those models again now
        </button>
      )}
    </div>
  );
}
