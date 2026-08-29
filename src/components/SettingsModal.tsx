import React, { useState } from 'react';
import { 
  Bot, 
  User as UserIcon, 
  Sparkles, 
  Sliders, 
  Check, 
  SlidersHorizontal,
  Key
} from 'lucide-react';
import { User } from 'firebase/auth';
import { GEMINI_MODELS } from '../lib/modelsConfig';
import { getCustomApiKey, saveStoredApiKey, getActiveProvider, getProviderModel } from '../lib/geminiService';
import { AI_PROVIDERS } from '../lib/providersConfig';

interface SettingsModalProps {
  user: User | null;
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
  customSystemPrompt: string;
  onSaveSystemPrompt: (prompt: string) => void;
  onClose: () => void;
  onOpenAuth?: () => void;
  onOpenApiKeyModal?: () => void;
  onGoogleSignIn: () => void;
  onSignOut: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  user,
  selectedModel,
  onSelectModel,
  customSystemPrompt,
  onSaveSystemPrompt,
  onClose,
  onOpenAuth,
  onOpenApiKeyModal,
  onGoogleSignIn,
  onSignOut
}) => {
  const [promptInput, setPromptInput] = useState(customSystemPrompt);
  const [apiKeyInput, setApiKeyInput] = useState(getCustomApiKey());
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    onSaveSystemPrompt(promptInput.trim());
    saveStoredApiKey(apiKeyInput.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-[#111118] border border-white/10 rounded-t-2xl sm:rounded-xl max-w-xl w-full p-4 sm:p-6 space-y-4 sm:space-y-5 shadow-2xl relative overflow-y-auto max-h-[92dvh] sm:max-h-[90vh] text-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-white/5 text-amber-400 border border-white/10">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-amber-50 font-serif">Game Master & Account Settings</h2>
              <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Configure Gemini Engine, AI Directives & Cloud Profile</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 font-mono text-sm"
          >
            ✕
          </button>
        </div>

        {/* Section 1: Google Account Connection */}
        <div className="p-3 rounded bg-[#0A0A0F] border border-white/10 space-y-2">
          <h3 className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider flex items-center gap-2">
            <UserIcon className="w-3.5 h-3.5 text-amber-400" />
            Player Google Account
          </h3>

          {user ? (
            <div className="flex items-center justify-between p-2.5 rounded bg-[#111118] border border-white/10">
              <div className="flex items-center gap-3">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} className="w-7 h-7 rounded-full ring-1 ring-amber-400" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-amber-600 font-bold text-xs flex items-center justify-center text-black">
                    {user.displayName?.[0] || 'P'}
                  </div>
                )}
                <div>
                  <div className="text-xs font-semibold text-slate-200">{user.displayName || 'Google Account'}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{user.email}</div>
                </div>
              </div>
              <button
                onClick={onSignOut}
                className="px-2.5 py-1 rounded bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800 text-[10px] font-mono transition font-semibold"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-2.5 rounded bg-[#111118] border border-white/10">
              <p className="text-xs text-slate-400">
                Sign in to enable real-time cross-platform cloud sync for all your campaigns.
              </p>
              <button
                onClick={() => {
                  if (onOpenAuth) {
                    onOpenAuth();
                  } else {
                    onGoogleSignIn();
                  }
                }}
                className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-500 text-black text-xs font-bold uppercase tracking-wider transition shadow shrink-0"
              >
                Sign In
              </button>
            </div>
          )}
        </div>

        {/* Section 2: AI Provider & Engine Configuration */}
        <div className="p-3.5 rounded bg-[#0A0A0F] border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider flex items-center gap-2">
              <Bot className="w-3.5 h-3.5 text-amber-400" />
              AI Storyteller & Key Configuration
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40 text-emerald-300 font-mono">
              Active: {AI_PROVIDERS[getActiveProvider()]?.name || 'Gemini'}
            </span>
          </div>

          <div className="p-3 rounded bg-[#111118] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-200">
                {AI_PROVIDERS[getActiveProvider()]?.name || 'Google Gemini'} ({getProviderModel(getActiveProvider())})
              </div>
              <p className="text-[11px] text-slate-400">
                Supports Gemini, OpenAI (ChatGPT), Anthropic Claude, xAI Grok, OpenRouter, Copilot, and Local LLMs (Ollama).
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                if (onOpenApiKeyModal) {
                  onClose();
                  onOpenApiKeyModal();
                }
              }}
              className="px-3.5 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs font-mono uppercase tracking-wider transition shadow shrink-0 flex items-center gap-1.5"
            >
              <Key className="w-3.5 h-3.5" />
              Manage Providers & Keys
            </button>
          </div>
        </div>

        {/* Section 4: Custom Game Master Directives */}
        <div className="p-3 rounded bg-[#0A0A0F] border border-white/10 space-y-2">
          <h3 className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider flex items-center gap-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
            Global Game Master Directives (Optional)
          </h3>
          <textarea
            rows={3}
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            placeholder="Add custom DM rules, tone preferences, or storytelling styles (e.g., 'Emphasize gritty realism with lethal combat' or 'Describe magic with poetic sensory imagery')..."
            className="w-full bg-[#111118] border border-white/10 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-600/50 font-sans leading-relaxed resize-none"
          />
        </div>

        {/* Save Footer */}
        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded text-xs font-mono text-slate-400 hover:bg-white/5 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs uppercase tracking-wider transition shadow flex items-center gap-1.5"
          >
            {savedSuccess ? <Check className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5 text-black" />}
            {savedSuccess ? 'Settings Saved!' : 'Save & Apply'}
          </button>
        </div>

      </div>
    </div>
  );
};
