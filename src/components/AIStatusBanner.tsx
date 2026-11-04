import React from 'react';
import { AlertTriangle, Info, Key, WifiOff, X } from 'lucide-react';
import { dismissAINotice, dismissAIStatus, useAIStatus } from '../lib/aiStatus';
import { setOfflineMode } from '../lib/geminiService';

interface AIStatusBannerProps {
  onOpenApiKeyModal: () => void;
}

/**
 * Tells the player when an AI call failed and whether offline content was used instead,
 * so a broken key or model never degrades the game silently.
 */
export const AIStatusBanner: React.FC<AIStatusBannerProps> = ({ onOpenApiKeyModal }) => {
  const status = useAIStatus();
  if (status.state !== 'error' || !status.visible) {
    // Soft problems on calls that worked: model swap, cut-off reply, generic chips, substitute portrait engine.
    if (!status.notice?.visible) return null;
    return (
      <div
        className="fixed top-16 left-1/2 -translate-x-1/2 z-[60] w-[calc(100%-2rem)] max-w-xl bg-amber-950/95 border border-amber-700/60 text-amber-100 text-xs px-3.5 py-2.5 rounded-lg shadow-xl backdrop-blur-md flex items-start gap-2.5"
        role="status"
      >
        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="flex-1 leading-relaxed">
          <span className="font-bold">{status.notice.feature}: </span>
          {status.notice.message}
        </p>
        <button
          type="button"
          onClick={dismissAINotice}
          className="p-0.5 text-amber-300 hover:text-amber-100 transition"
          title="Dismiss"
          aria-label="Dismiss notice"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  const isKeyProblem = status.kind === 'no_key' || status.kind === 'auth' || status.kind === 'model_not_found';

  return (
    <div
      className="fixed top-16 left-1/2 -translate-x-1/2 z-[60] w-[calc(100%-2rem)] max-w-xl bg-red-950/95 border border-red-700/60 text-red-100 text-xs px-3.5 py-3 rounded-lg shadow-xl backdrop-blur-md flex items-start gap-2.5"
      role="alert"
    >
      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
      <div className="flex-1 space-y-1.5">
        <p className="leading-relaxed">
          <span className="font-bold">{status.feature ? `${status.feature} failed. ` : 'AI request failed. '}</span>
          {status.message}
          {status.usedFallback && <span className="text-red-200/80"> Used the offline generator instead.</span>}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              dismissAIStatus();
              onOpenApiKeyModal();
            }}
            className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-black font-bold text-[10px] font-mono uppercase tracking-wider transition flex items-center gap-1"
          >
            <Key className="w-3 h-3" />
            AI settings
          </button>
          {isKeyProblem && (
            <button
              type="button"
              onClick={() => setOfflineMode(true)}
              className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/15 border border-white/15 text-slate-200 text-[10px] font-mono uppercase tracking-wider transition flex items-center gap-1"
            >
              <WifiOff className="w-3 h-3" />
              Play offline
            </button>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={dismissAIStatus}
        className="p-0.5 text-red-300 hover:text-red-100 transition"
        title="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
