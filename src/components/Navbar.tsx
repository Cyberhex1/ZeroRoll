import React, { useState } from 'react';
import { 
  Sparkles, 
  Settings, 
  Volume2, 
  VolumeX, 
  User as UserIcon, 
  LogOut, 
  ChevronDown, 
  ShieldAlert, 
  Layers, 
  Radio, 
  Database,
  Bot,
  Key
} from 'lucide-react';
import { User } from 'firebase/auth';
import { GEMINI_MODELS } from '../lib/modelsConfig';
import { hasActiveGeminiKey, getActiveProvider, getProviderModel } from '../lib/geminiService';
import { AI_PROVIDERS } from '../lib/providersConfig';
import { GeminiModelOption, UserProfile } from '../types';

interface NavbarProps {
  user: User | null;
  userProfile?: UserProfile;
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
  onOpenSettings: () => void;
  onOpenApiKeyModal?: () => void;
  onOpenProfile?: () => void;
  onOpenAuth?: () => void;
  onGoogleSignIn: () => void;
  onSignOut: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  activeExperienceTitle?: string;
  onBackToExperiences?: () => void;
  isSaving?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  userProfile,
  selectedModel,
  onSelectModel,
  onOpenSettings,
  onOpenApiKeyModal,
  onOpenProfile,
  onOpenAuth,
  onGoogleSignIn,
  onSignOut,
  soundEnabled,
  onToggleSound,
  activeExperienceTitle,
  onBackToExperiences,
  isSaving
}) => {
  const [modelDropdownOpen, setModelDropdownOpen] = React.useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = React.useState(false);

  const currentModelObj = GEMINI_MODELS.find(m => m.id === selectedModel) || GEMINI_MODELS[0];

  return (
    <header className="sticky top-0 z-40 h-14 bg-[#16161D] border-b border-white/10 px-2.5 sm:px-6 flex items-center justify-between shrink-0">
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {onBackToExperiences && (
            <button
              onClick={onBackToExperiences}
              className="px-2 py-1 text-xs font-semibold rounded bg-white/5 hover:bg-white/10 text-amber-300 border border-white/10 transition flex items-center gap-1"
              title="Return to Experience Selector"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Experiences</span>
            </button>
          )}

          <div className="flex items-center gap-2 sm:gap-2.5 cursor-pointer" onClick={onBackToExperiences}>
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-amber-600 rounded flex items-center justify-center font-black text-black text-xs sm:text-sm tracking-tighter shadow-sm font-mono shrink-0">
              00
            </div>
            <div>
              <h1 className="text-sm sm:text-base md:text-lg font-serif tracking-tight text-amber-50 flex items-center">
                Roll Zero0
                <span className="text-[9px] font-mono text-amber-500/80 ml-1.5 tracking-widest uppercase font-bold hidden lg:inline">
                  TTRPG ENGINE
                </span>
              </h1>
              {activeExperienceTitle && (
                <p className="text-[10px] sm:text-[11px] text-slate-400 truncate max-w-[100px] xs:max-w-[140px] sm:max-w-[220px]">
                  {activeExperienceTitle}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Center: Save Status & Model Selector (Tablet & Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          {/* Connected Model Badge */}
          <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs">
            <span className={`w-2 h-2 rounded-full ${isSaving ? 'bg-amber-400 animate-ping' : 'bg-emerald-500 animate-pulse'}`} />
            <span className="text-slate-400 text-[10px] uppercase font-mono tracking-wider">
              {isSaving ? 'SAVING...' : 'CONNECTED:'}
            </span>

            <div className="relative">
              <button
                onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
                className="bg-transparent border-none outline-none font-semibold text-amber-400 text-xs flex items-center gap-1 hover:text-amber-300"
              >
                <span>{currentModelObj.name}</span>
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>

              {modelDropdownOpen && (
                <div className="absolute left-0 mt-2 w-72 bg-[#111118] border border-white/10 rounded shadow-2xl p-2 z-50 divide-y divide-white/5">
                  <div className="p-2 text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">
                    Select Gemini Model
                  </div>
                  <div className="py-1 space-y-1">
                    {GEMINI_MODELS.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => {
                          onSelectModel(m.id);
                          setModelDropdownOpen(false);
                        }}
                        className={`w-full text-left p-2 rounded transition text-xs flex flex-col gap-0.5 ${
                          selectedModel === m.id 
                            ? 'bg-amber-600/20 border border-amber-600/50 text-amber-200' 
                            : 'hover:bg-white/5 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-amber-300">{m.name}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/40 text-slate-400 border border-white/5 font-mono">
                            {m.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                          {m.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Controls: Sound, Key, Settings, Account */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className={`p-1.5 sm:p-2 rounded border transition text-xs ${
              soundEnabled 
                ? 'bg-amber-600/20 border-amber-600/40 text-amber-300 hover:bg-amber-600/30' 
                : 'bg-white/5 border-white/10 text-slate-500 hover:bg-white/10'
            }`}
            title={soundEnabled ? 'Mute Sound Effects' : 'Enable Sound Effects'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>

          {/* AI Provider & Key Status Badge */}
          {hasActiveGeminiKey() ? (
            <button
              onClick={onOpenApiKeyModal || onOpenSettings}
              className="px-2 sm:px-2.5 py-1 rounded-lg border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-[10px] font-mono flex items-center gap-1.5 transition shadow-sm"
              title={`Active AI: ${AI_PROVIDERS[getActiveProvider()]?.name || 'AI Engine'} (${getProviderModel(getActiveProvider())}) - Click to Change`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-bold hidden xs:inline">{AI_PROVIDERS[getActiveProvider()]?.name || 'AI Active'}</span>
              <span className="font-bold xs:hidden">AI</span>
            </button>
          ) : (
            <button
              onClick={onOpenApiKeyModal || onOpenSettings}
              className="px-2 sm:px-2.5 py-1 rounded-lg border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-[10px] font-mono flex items-center gap-1 sm:gap-1.5 transition shadow-sm animate-pulse"
              title="Connect an API key (Gemini, OpenAI, Claude, Grok, OpenRouter, Copilot) for AI storytelling"
            >
              <Key className="w-3 h-3 text-amber-400" />
              <span className="hidden xs:inline">Connect AI</span>
              <span className="xs:hidden">Key</span>
            </button>
          )}

          {/* Settings Modal Toggle */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 sm:p-2 rounded border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 transition text-xs"
            title="Game Master & AI Settings"
          >
            <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* User Account Login / Profile */}
          <div className="relative">
            {user ? (
              <div>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-2 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 transition text-xs"
                >
                  {/* Render: Google photo > custom profile photo > custom SVG avatar > text initial */}
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName || 'Player'} 
                      className="w-6 h-6 rounded-full border border-amber-600/50"
                    />
                  ) : userProfile?.photoURL ? (
                    <img
                      src={userProfile.photoURL}
                      alt={userProfile.displayName || 'Player'}
                      className="w-6 h-6 rounded-full border border-amber-600/50 object-cover"
                    />
                  ) : userProfile?.avatar ? (
                    <svg className="w-6 h-6 rounded-full border border-amber-600/50" viewBox="0 0 100 100">
                      <rect width="100" height="100" rx="50" fill="#09090b" />
                      {/* Clothing */}
                      <path d="M 20 85 Q 50 65 80 85 L 80 100 L 20 100 Z" fill={userProfile.avatar.clothingColor} />
                      {/* Head */}
                      <circle cx="50" cy="45" r="22" fill={userProfile.avatar.skinTone} />
                      {/* Hair */}
                      {userProfile.avatar.hairstyle === 'short_rogue' && <path d="M 28 40 Q 50 12 72 40 Q 50 30 28 40 Z" fill={userProfile.avatar.hairColor} />}
                      {userProfile.avatar.hairstyle === 'long_braids' && <><path d="M 26 42 Q 50 10 74 42 L 78 80 L 70 80 Z" fill={userProfile.avatar.hairColor} /><path d="M 22 80 L 30 80 L 26 42 Z" fill={userProfile.avatar.hairColor} /></>}
                      {userProfile.avatar.hairstyle === 'wizard_hat' && <polygon points="50,5 25,35 75,35" fill={userProfile.avatar.hairColor} />}
                      {userProfile.avatar.hairstyle === 'cyber_spikes' && <path d="M 28 35 L 35 15 L 45 30 L 55 10 L 65 30 L 72 35 Z" fill={userProfile.avatar.hairColor} />}
                      {userProfile.avatar.hairstyle === 'curly_afro' && <circle cx="50" cy="38" r="26" fill={userProfile.avatar.hairColor} />}
                      {userProfile.avatar.hairstyle === 'bald_monk' && <circle cx="50" cy="45" r="23" fill={userProfile.avatar.skinTone} />}
                      {userProfile.avatar.hairstyle === 'knight_helmet' && <rect x="28" y="22" width="44" height="28" rx="6" fill="#475569" />}
                      {userProfile.avatar.hairstyle === 'elven_crown' && <polygon points="30,30 40,20 50,28 60,20 70,30" fill="#f59e0b" />}
                      {/* Eyes */}
                      {userProfile.avatar.hairstyle !== 'knight_helmet' && (
                        <><circle cx="42" cy="45" r="2.5" fill="#1e293b" /><circle cx="58" cy="45" r="2.5" fill="#1e293b" /></>
                      )}
                    </svg>
                  ) : (
                    <div className="w-6 h-6 rounded-full border border-amber-600/50 bg-gradient-to-br from-amber-900 to-slate-900 flex items-center justify-center text-[10px] text-amber-200 font-bold">
                      {user.displayName?.[0] || userProfile?.displayName?.[0] || 'A'}
                    </div>
                  )}
                  <span className="text-xs text-slate-200 max-w-[80px] sm:max-w-[120px] truncate hidden sm:inline font-mono">
                    {user.displayName || user.email?.split('@')[0]}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#111118] border border-white/10 rounded shadow-2xl p-2 z-50">
                    <div className="px-3 py-2 border-b border-white/5">
                      <p className="text-xs font-semibold text-slate-200 truncate">
                        {user.displayName || 'Google Account Connected'}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate font-mono">
                        {user.email}
                      </p>
                    </div>

                    {onOpenProfile && (
                      <button
                        onClick={() => {
                          onOpenProfile();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full mt-1 px-3 py-2 text-left text-xs text-amber-300 hover:bg-amber-600/20 rounded flex items-center gap-2 transition font-semibold"
                      >
                        <UserIcon className="w-3.5 h-3.5" />
                        Player Profile & Avatar
                      </button>
                    )}

                    <button
                      onClick={() => {
                        onSignOut();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full mt-1 px-3 py-2 text-left text-xs text-red-400 hover:bg-red-950/40 rounded flex items-center gap-2 transition"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth || onGoogleSignIn}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center gap-1.5 shadow-md active:scale-95"
              >
                <UserIcon className="w-3.5 h-3.5" />
                Sign In / Join
              </button>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
