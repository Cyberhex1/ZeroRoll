import React, { useState, useEffect } from 'react';
import { 
  Key, 
  Sparkles, 
  Bot, 
  Zap, 
  Globe, 
  Server, 
  ExternalLink, 
  Check, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Cpu, 
  HelpCircle, 
  RefreshCw, 
  ChevronRight,
  Feather,
  Info,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { 
  AIProviderId, 
  AI_PROVIDERS, 
  AIProviderConfig 
} from '../lib/providersConfig';
import { 
  getActiveProvider, 
  setActiveProvider, 
  getProviderKey, 
  setProviderKey, 
  getProviderModel, 
  setProviderModel, 
  getProviderBaseUrl, 
  setProviderBaseUrl,
  testProviderConnection,
  exportAllProviderSettings
} from '../lib/geminiService';
import { auth, saveUserSettingsToCloud } from '../lib/firebase';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProviderChanged?: (providerId: AIProviderId, modelId: string) => void;
  initialProvider?: AIProviderId;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  onProviderChanged,
  initialProvider
}) => {
  const [selectedProvider, setSelectedProvider] = useState<AIProviderId>(() => {
    return initialProvider || getActiveProvider();
  });

  const [apiKey, setApiKey] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [customModelInput, setCustomModelInput] = useState<string>('');
  const [isCustomModel, setIsCustomModel] = useState<boolean>(false);
  const [baseUrl, setBaseUrl] = useState<string>('');
  const [showKey, setShowKey] = useState<boolean>(false);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  // Connection testing state
  const [testing, setTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    latencyMs: number;
    message: string;
    reply?: string;
  } | null>(null);

  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Sync state when provider changes
  useEffect(() => {
    const key = getProviderKey(selectedProvider);
    const model = getProviderModel(selectedProvider);
    const url = getProviderBaseUrl(selectedProvider);
    const config = AI_PROVIDERS[selectedProvider];

    setApiKey(key);
    setBaseUrl(url || config?.defaultBaseUrl || '');

    const knownModel = config?.models.find(m => m.id === model);
    if (knownModel) {
      setSelectedModel(model);
      setIsCustomModel(false);
      setCustomModelInput('');
    } else {
      setSelectedModel(config?.defaultModel || '');
      setIsCustomModel(true);
      setCustomModelInput(model);
    }

    setTestResult(null);
    setShowKey(false);
  }, [selectedProvider]);

  if (!isOpen) return null;

  const currentConfig: AIProviderConfig = AI_PROVIDERS[selectedProvider];

  const getProviderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles': return <Sparkles className="w-4 h-4" />;
      case 'Bot': return <Bot className="w-4 h-4" />;
      case 'Feather': return <Feather className="w-4 h-4" />;
      case 'Zap': return <Zap className="w-4 h-4" />;
      case 'Globe': return <Globe className="w-4 h-4" />;
      case 'Server': return <Server className="w-4 h-4" />;
      default: return <Cpu className="w-4 h-4" />;
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    const activeModel = isCustomModel && customModelInput.trim() 
      ? customModelInput.trim() 
      : selectedModel || currentConfig.defaultModel;

    const res = await testProviderConnection({
      provider: selectedProvider,
      apiKey: apiKey.trim(),
      model: activeModel,
      baseUrl: baseUrl.trim() || undefined
    });

    setTesting(false);
    setTestResult(res);
  };

  const handleSaveAndApply = () => {
    const activeModel = isCustomModel && customModelInput.trim()
      ? customModelInput.trim()
      : selectedModel || currentConfig.defaultModel;

    setActiveProvider(selectedProvider);
    setProviderKey(selectedProvider, apiKey.trim());
    setProviderModel(selectedProvider, activeModel);
    
    if (baseUrl.trim()) {
      setProviderBaseUrl(selectedProvider, baseUrl.trim());
    } else {
      setProviderBaseUrl(selectedProvider, '');
    }

    if (auth.currentUser) {
      const allSettings = exportAllProviderSettings();
      saveUserSettingsToCloud(auth.currentUser.uid, allSettings);
    }

    setSavedSuccess(true);
    if (onProviderChanged) {
      onProviderChanged(selectedProvider, activeModel);
    }

    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  const handleClearKey = () => {
    setApiKey('');
    setProviderKey(selectedProvider, '');
    setTestResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-[#111118] border border-white/15 rounded-t-2xl sm:rounded-xl max-w-2xl w-full p-4 sm:p-6 space-y-4 sm:space-y-5 shadow-2xl relative my-0 sm:my-auto max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto text-slate-200">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-600/20 text-amber-400 border border-amber-500/30">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-amber-50 font-serif flex items-center gap-2">
                Connect AI Provider & API Key
              </h2>
              <p className="text-xs text-slate-400 font-sans">
                Choose your AI engine to power dynamic Game Master narration, character generation & encounters.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded bg-white/5 hover:bg-white/10 font-mono text-sm transition"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Security & Privacy Banner */}
        <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs font-sans">
          <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>
            <strong>100% Client-Side Privacy:</strong> Your keys are stored strictly in your local browser storage. They are never sent to or logged on any intermediate server.
          </span>
        </div>

        {/* Provider Selection Tabs */}
        <div>
          <label className="block text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold mb-2">
            1. Select AI Provider
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(Object.keys(AI_PROVIDERS) as AIProviderId[]).map((provId) => {
              const prov = AI_PROVIDERS[provId];
              const isSelected = selectedProvider === provId;
              const hasSavedKey = getProviderKey(provId).length > 5;

              return (
                <button
                  key={provId}
                  type="button"
                  onClick={() => setSelectedProvider(provId)}
                  className={`p-2.5 rounded-lg border text-left transition flex flex-col justify-between space-y-1.5 relative ${
                    isSelected
                      ? 'bg-amber-950/60 border-amber-500/80 text-amber-100 shadow-md ring-1 ring-amber-500/50'
                      : 'bg-[#16161F] border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div 
                      className="p-1.5 rounded border border-white/10"
                      style={{ color: prov.accentColor, backgroundColor: `${prov.accentColor}15` }}
                    >
                      {getProviderIcon(prov.iconName)}
                    </div>
                    {hasSavedKey && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400" title="Key Configured" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold truncate text-slate-200">{prov.name}</div>
                    <div className="text-[9px] text-slate-400 font-mono truncate">{prov.badge}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step-by-Step Guide Card for Selected Provider */}
        <div className="p-4 rounded-lg bg-[#0A0A0F] border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span 
                className="p-1 rounded text-xs"
                style={{ color: currentConfig.accentColor }}
              >
                {getProviderIcon(currentConfig.iconName)}
              </span>
              <h3 className="text-xs font-bold text-slate-200 font-serif">
                How to get your {currentConfig.name} API Key
              </h3>
            </div>
            {currentConfig.keyPortalUrl && (
              <a
                href={currentConfig.keyPortalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 text-[11px] font-mono flex items-center gap-1.5 transition font-semibold"
              >
                Open {currentConfig.name} Portal
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            {currentConfig.guide.overview}
          </p>

          <div className="space-y-2 pt-1">
            {currentConfig.guide.steps.map((step) => (
              <div key={step.stepNumber} className="flex items-start gap-2.5 text-xs text-slate-300">
                <div className="w-5 h-5 rounded-full bg-white/10 text-amber-400 font-mono font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5 border border-white/10">
                  {step.stepNumber}
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="font-semibold text-slate-200 flex items-center gap-2">
                    {step.title}
                    {step.link && (
                      <a
                        href={step.link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-amber-400 hover:text-amber-300 underline font-mono inline-flex items-center gap-0.5"
                      >
                        {step.link.label} ↗
                      </a>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{step.description}</p>
                  {step.tip && (
                    <div className="text-[10px] text-amber-400/90 font-mono bg-amber-950/30 p-1.5 rounded border border-amber-800/30 mt-1">
                      💡 Tip: {step.tip}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {currentConfig.guide.pricingNote && (
            <div className="text-[10px] text-slate-400 font-mono border-t border-white/5 pt-2 flex items-center gap-1.5">
              <Info className="w-3 h-3 text-slate-400 shrink-0" />
              <span>{currentConfig.guide.pricingNote}</span>
            </div>
          )}
        </div>

        {/* API Key Input & Model Configuration */}
        <div className="space-y-3">
          <label className="block text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">
            2. Enter {currentConfig.name} API Key & Model
          </label>

          {/* Key Input */}
          <div className="space-y-1.5">
            <div className="relative flex items-center">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={currentConfig.keyPlaceholder}
                className="w-full bg-[#0A0A0F] border border-white/15 rounded-lg pl-3 pr-20 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/50"
              />
              <div className="absolute right-2 flex items-center gap-1">
                {apiKey && (
                  <button
                    type="button"
                    onClick={handleClearKey}
                    className="p-1 text-slate-400 hover:text-red-400 transition"
                    title="Clear key"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="p-1 text-slate-400 hover:text-slate-200 transition"
                  title={showKey ? 'Hide key' : 'Show key'}
                >
                  {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            {currentConfig.keyPrefixHint && !apiKey.startsWith(currentConfig.keyPrefixHint) && apiKey.length > 3 && (
              <p className="text-[10px] text-amber-400/90 font-mono">
                ⚠️ Standard {currentConfig.name} keys typically begin with &quot;{currentConfig.keyPrefixHint}&quot;.
              </p>
            )}
          </div>

          {/* Model Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <div>
              <label className="block text-[10px] uppercase font-mono text-slate-400 font-bold mb-1">
                Model Choice
              </label>
              {!isCustomModel ? (
                <select
                  value={selectedModel}
                  onChange={(e) => {
                    if (e.target.value === 'custom_write_in') {
                      setIsCustomModel(true);
                      setCustomModelInput('');
                    } else {
                      setSelectedModel(e.target.value);
                    }
                  }}
                  className="w-full bg-[#0A0A0F] border border-white/15 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-500/80"
                >
                  {currentConfig.models.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} {m.badge ? `(${m.badge})` : ''}
                    </option>
                  ))}
                  <option value="custom_write_in">+ Custom Model ID...</option>
                </select>
              ) : (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={customModelInput}
                    onChange={(e) => setCustomModelInput(e.target.value)}
                    placeholder="e.g. deepseek/deepseek-r1, llama3.3"
                    className="w-full bg-[#0A0A0F] border border-white/15 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-500/80"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomModel(false);
                      setSelectedModel(currentConfig.defaultModel);
                    }}
                    className="px-2 py-2 text-[10px] rounded bg-white/5 hover:bg-white/10 text-slate-300 font-mono"
                  >
                    Reset
                  </button>
                </div>
              )}
            </div>

            {/* Base URL (for custom / Ollama / Azure endpoints) */}
            <div>
              <label className="block text-[10px] uppercase font-mono text-slate-400 font-bold mb-1 flex items-center justify-between">
                <span>API Endpoint URL</span>
                {currentConfig.id !== 'custom' && (
                  <button 
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)} 
                    className="text-[9px] text-amber-400/80 hover:text-amber-300 font-mono underline"
                  >
                    {showAdvanced ? 'Hide' : 'Edit URL'}
                  </button>
                )}
              </label>
              <input
                type="text"
                value={baseUrl}
                disabled={currentConfig.id !== 'custom' && !showAdvanced}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder={currentConfig.defaultBaseUrl || 'https://api.openai.com/v1'}
                className="w-full bg-[#0A0A0F] border border-white/15 rounded-lg px-3 py-2 text-xs text-slate-300 font-mono focus:outline-none focus:border-amber-500/80 disabled:opacity-60"
              />
            </div>
          </div>
        </div>

        {/* Test Connection Button & Live Feedback */}
        <div className="pt-1">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 p-3 rounded-lg bg-[#0A0A0F] border border-white/10">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-amber-400" />
                Verify Connection
              </div>
              <p className="text-[11px] text-slate-400">
                Pings {currentConfig.name} to confirm key validity and latency before saving.
              </p>
            </div>

            <button
              type="button"
              disabled={testing || (!apiKey.trim() && selectedProvider !== 'custom')}
              onClick={handleTestConnection}
              className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-mono text-amber-300 flex items-center justify-center gap-1.5 transition font-semibold disabled:opacity-40 shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
              {testing ? 'Testing Endpoint...' : 'Test Connection'}
            </button>
          </div>

          {/* Test Results Notification */}
          {testResult && (
            <div className={`mt-2 p-3 rounded-lg border text-xs flex items-start gap-2.5 animate-fadeIn ${
              testResult.success 
                ? 'bg-emerald-950/40 border-emerald-700/50 text-emerald-200' 
                : 'bg-red-950/40 border-red-800/50 text-red-200'
            }`}>
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1 flex-1">
                <div className="font-bold flex items-center justify-between">
                  <span>{testResult.success ? 'Connection Successful!' : 'Connection Failed'}</span>
                  <span className="font-mono text-[10px] opacity-80">{testResult.latencyMs}ms</span>
                </div>
                <p className="text-[11px] leading-relaxed opacity-90">{testResult.message}</p>
                {testResult.reply && (
                  <div className="text-[10px] font-mono bg-black/40 p-1.5 rounded border border-white/10 text-slate-300 mt-1">
                    AI Response: &quot;{testResult.reply}&quot;
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={() => {
              // Quick dismiss to procedural
              onClose();
            }}
            className="text-[11px] font-mono text-slate-400 hover:text-slate-200 transition"
          >
            Play Offline / Procedural Mode
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs font-mono text-slate-400 hover:bg-white/5 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveAndApply}
              className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs uppercase tracking-wider transition shadow-lg flex items-center gap-1.5"
            >
              {savedSuccess ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4 text-black" />}
              {savedSuccess ? 'Provider Activated!' : 'Save & Activate Provider'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
