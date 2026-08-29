import React, { useState } from 'react';
import {
  User,
  Lock,
  Mail,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  UserPlus,
  LogIn,
  Eye,
  EyeOff,
  Globe,
  ExternalLink
} from 'lucide-react';
import {
  signInWithGoogle,
  signInWithGoogleRedirect,
  signInWithEmail,
  signUpWithEmail,
  signInAsGuestUser,
  getFriendlyAuthErrorMessage
} from '../lib/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type AuthTab = 'signin' | 'signup' | 'guest';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [activeTab, setActiveTab] = useState<AuthTab>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [guestName, setGuestName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDomainError, setIsDomainError] = useState(false);

  if (!isOpen) return null;

  const resetState = () => {
    setErrorMsg(null);
    setIsDomainError(false);
    setIsLoading(false);
  };

  const handleGoogleSignIn = async () => {
    resetState();
    setIsLoading(true);
    try {
      await signInWithGoogle();
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      const msg = getFriendlyAuthErrorMessage(err);
      setErrorMsg(msg);
      if (err?.code === 'auth/unauthorized-domain' || String(err?.message || '').includes('unauthorized-domain')) {
        setIsDomainError(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRedirectSignIn = async () => {
    resetState();
    setIsLoading(true);
    try {
      await signInWithGoogleRedirect();
    } catch (err: any) {
      setErrorMsg(getFriendlyAuthErrorMessage(err));
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both your email and password.');
      return;
    }
    resetState();
    setIsLoading(true);
    try {
      await signInWithEmail(email.trim(), password);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(getFriendlyAuthErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter an email and password.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    resetState();
    setIsLoading(true);
    try {
      await signUpWithEmail(email.trim(), password, displayName.trim() || 'Adventurer');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(getFriendlyAuthErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    resetState();
    setIsLoading(true);
    try {
      await signInAsGuestUser(guestName.trim() || 'Adventurer');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(getFriendlyAuthErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#111118] border border-amber-500/20 rounded-xl max-w-md w-full p-6 space-y-5 shadow-2xl relative overflow-hidden text-slate-200 animate-in fade-in zoom-in-95 duration-200">

        {/* Top ambient glow */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-32 bg-amber-500/10 blur-3xl pointer-events-none rounded-full" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-white/5 font-mono text-sm transition"
        >
          ✕
        </button>

        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-1">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold font-serif text-amber-50 tracking-wide">
            ZeroRoll Authentication
          </h2>
          <p className="text-xs text-slate-400 font-sans">
            Save campaigns, sync character sheets, and continue your quest anywhere.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 text-xs font-semibold">
          <button
            onClick={() => { setActiveTab('signin'); resetState(); }}
            className={`flex-1 py-2 text-center border-b-2 transition flex items-center justify-center gap-1.5 ${activeTab === 'signin'
                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            Sign In
          </button>
          <button
            onClick={() => { setActiveTab('signup'); resetState(); }}
            className={`flex-1 py-2 text-center border-b-2 transition flex items-center justify-center gap-1.5 ${activeTab === 'signup'
                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Create Account
          </button>
          <button
            onClick={() => { setActiveTab('guest'); resetState(); }}
            className={`flex-1 py-2 text-center border-b-2 transition flex items-center justify-center gap-1.5 ${activeTab === 'guest'
                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Guest Play
          </button>
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-red-200 text-xs space-y-1.5 animate-in fade-in duration-150">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1 font-sans leading-relaxed">
                {errorMsg}
              </div>
            </div>
            {isDomainError && (
              <div className="mt-2 pt-2 border-t border-red-800/40 text-[11px] text-amber-200/90 font-mono space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-400">
                  <Globe className="w-3.5 h-3.5" />
                  Authorized Domain Setup:
                </div>
                <p>1. Open Firebase Console &rarr; Authentication &rarr; Settings &rarr; Authorized Domains.</p>
                <p>2. Add: <span className="text-white underline font-bold">{currentHostname}</span></p>
                <p>Or simply use <strong>Email & Password</strong> or <strong>Guest Mode</strong> below to play instantly!</p>
              </div>
            )}
          </div>
        )}

        {/* Primary Google 1-Click Sign-In (For Sign-in and Sign-up tabs) */}
        {activeTab !== 'guest' && (
          <div className="space-y-3">
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-lg bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs transition flex items-center justify-center gap-2.5 shadow-md active:scale-[0.99] disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-slate-700" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>Continue with Google</span>
            </button>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleGoogleRedirectSignIn}
                disabled={isLoading}
                className="text-[10px] text-amber-400/80 hover:text-amber-300 hover:underline font-mono transition flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                Popup not opening? Sign in via Full-Page Redirect
              </button>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink mx-3 text-[10px] uppercase font-mono text-slate-500">Or use email</span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>
          </div>
        )}

        {/* Tab 1: Sign In Form */}
        {activeTab === 'signin' && (
          <form onSubmit={handleEmailSignIn} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-slate-400 uppercase">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="adventurer@realm.com"
                  className="w-full bg-[#0A0A0F] border border-white/10 focus:border-amber-500 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none transition"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono text-slate-400 uppercase">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0A0A0F] border border-white/10 focus:border-amber-500 rounded-lg pl-9 pr-9 py-2 text-xs text-white placeholder-slate-600 focus:outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-lg bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
            >
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Sign In to Account</span>
            </button>
          </form>
        )}

        {/* Tab 2: Sign Up Form */}
        {activeTab === 'signup' && (
          <form onSubmit={handleEmailSignUp} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-slate-400 uppercase">Adventurer / Player Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Sir Cedric the Bold"
                  className="w-full bg-[#0A0A0F] border border-white/10 focus:border-amber-500 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none transition"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono text-slate-400 uppercase">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="adventurer@realm.com"
                  className="w-full bg-[#0A0A0F] border border-white/10 focus:border-amber-500 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none transition"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono text-slate-400 uppercase">Password (min 6 chars)</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0A0A0F] border border-white/10 focus:border-amber-500 rounded-lg pl-9 pr-9 py-2 text-xs text-white placeholder-slate-600 focus:outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-lg bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
            >
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Create Account</span>
            </button>
          </form>
        )}

        {/* Tab 3: Guest Mode Form */}
        {activeTab === 'guest' && (
          <form onSubmit={handleGuestSignIn} className="space-y-4">
            <div className="p-3 rounded-lg bg-[#0A0A0F] border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
                <Sparkles className="w-4 h-4" />
                <span>Instant Guest Mode</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Play immediately without needing an email or cloud account. Your campaigns and character profiles will be saved locally to this browser!
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono text-slate-400 uppercase">Guest Adventurer Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Adventurer"
                  className="w-full bg-[#0A0A0F] border border-white/10 focus:border-amber-500 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-lg bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
            >
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Play as Guest</span>
            </button>
          </form>
        )}

        {/* Footer info */}
        <div className="text-center pt-2 text-[10px] text-slate-500 font-mono">
          ZeroRoll TTRPG Engine &bull; Local &amp; Cloud Hybrid Persistence
        </div>

      </div>
    </div>
  );
};
