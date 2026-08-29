import React, { useState } from 'react';
import { 
  User as UserIcon, 
  Upload, 
  Sparkles, 
  Shield, 
  Swords, 
  Wand2, 
  Crown, 
  Skull, 
  Heart, 
  Flame, 
  X, 
  Check, 
  Palette, 
  Camera 
} from 'lucide-react';
import { UserProfile, AvatarConfig } from '../types';

interface UserProfileModalProps {
  profile: UserProfile;
  onSaveProfile: (newProfile: UserProfile) => void;
  onClose: () => void;
}

const DEFAULT_AVATAR: AvatarConfig = {
  hairstyle: 'short_rogue',
  hairColor: '#f59e0b',
  skinTone: '#fde047',
  clothingColor: '#1e1b4b',
  badgeIcon: 'shield'
};

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  profile,
  onSaveProfile,
  onClose
}) => {
  const [displayName, setDisplayName] = useState(profile.displayName || 'Adventurer');
  const [photoURL, setPhotoURL] = useState(profile.photoURL || '');
  const [avatar, setAvatar] = useState<AvatarConfig>(profile.avatar || DEFAULT_AVATAR);
  const [activeTab, setActiveTab] = useState<'profile' | 'avatar'>('avatar');

  // File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Image size must be under 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoURL(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    const updated: UserProfile = {
      ...profile,
      displayName,
      photoURL,
      avatar,
      updatedAt: new Date().toISOString()
    };
    onSaveProfile(updated);
    onClose();
  };

  // Color Swatches
  const HAIR_COLORS = [
    { name: 'Amber Gold', hex: '#f59e0b' },
    { name: 'Crimson Red', hex: '#ef4444' },
    { name: 'Emerald', hex: '#10b981' },
    { name: 'Royal Blue', hex: '#3b82f6' },
    { name: 'Amethyst', hex: '#a855f7' },
    { name: 'Platinum Silver', hex: '#e2e8f0' },
    { name: 'Obsidian Black', hex: '#020617' },
    { name: 'Rose Gold', hex: '#f43f5e' }
  ];

  const SKIN_TONES = [
    { name: 'Fair Ivory', hex: '#fef3c7' },
    { name: 'Warm Sun', hex: '#fde047' },
    { name: 'Olive Bronze', hex: '#f59e0b' },
    { name: 'Deep Mahogany', hex: '#b45309' },
    { name: 'Ebony Realm', hex: '#451a03' },
    { name: 'Arcane Cyber', hex: '#38bdf8' }
  ];

  const CLOTHING_COLORS = [
    { name: 'Midnight Guild', hex: '#1e1b4b' },
    { name: 'Crimson Velvet', hex: '#881337' },
    { name: 'Emerald Ranger', hex: '#064e3b' },
    { name: 'Amethyst Court', hex: '#701a75' },
    { name: 'Leather Brown', hex: '#78350f' },
    { name: 'Obsidian Shadow', hex: '#0f172a' }
  ];

  const HAIRSTYLES = [
    { id: 'short_rogue', label: 'Short Rogue' },
    { id: 'long_braids', label: 'Long Braids' },
    { id: 'wizard_hat', label: 'Wizard Hat' },
    { id: 'cyber_spikes', label: 'Cyber Spikes' },
    { id: 'curly_afro', label: 'Curly Afro' },
    { id: 'bald_monk', label: 'Bald Monk' },
    { id: 'knight_helmet', label: 'Knight Helmet' },
    { id: 'elven_crown', label: 'Elven Crown' }
  ];

  const BADGE_ICONS = [
    { id: 'shield', icon: <Shield className="w-4 h-4" /> },
    { id: 'sword', icon: <Swords className="w-4 h-4" /> },
    { id: 'sparkles', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'wand', icon: <Wand2 className="w-4 h-4" /> },
    { id: 'crown', icon: <Crown className="w-4 h-4" /> },
    { id: 'skull', icon: <Skull className="w-4 h-4" /> },
    { id: 'heart', icon: <Heart className="w-4 h-4" /> },
    { id: 'flame', icon: <Flame className="w-4 h-4" /> }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-[#111118] border border-white/10 rounded-t-2xl sm:rounded-xl max-w-2xl w-full p-4 sm:p-6 space-y-4 sm:space-y-5 shadow-2xl overflow-y-auto max-h-[92dvh] sm:max-h-[90vh] text-slate-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-amber-600/20 text-amber-400 border border-amber-600/40">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-amber-50">Player Profile & Custom Avatar</h2>
              <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
                Customize your hero identity, avatar components, and profile settings
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 p-1 rounded hover:bg-white/5 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Top Profile Preview Summary */}
        <div className="p-4 rounded-lg bg-[#0A0A0F] border border-white/10 flex flex-col sm:flex-row items-center gap-4">
          {/* Avatar Graphic Box */}
          <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-amber-500/50 flex items-center justify-center shadow-xl bg-slate-950 shrink-0">
            {photoURL ? (
              <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <svg className="w-full h-full" viewBox="0 0 100 100">
                {/* Background */}
                <rect width="100" height="100" fill="#09090b" />
                
                {/* Clothing Body */}
                <path 
                  d="M 20 85 Q 50 65 80 85 L 80 100 L 20 100 Z" 
                  fill={avatar.clothingColor} 
                />
                
                {/* Neck & Head */}
                <circle cx="50" cy="45" r="22" fill={avatar.skinTone} />
                
                {/* Hairstyles SVG elements */}
                {avatar.hairstyle === 'short_rogue' && (
                  <path d="M 28 40 Q 50 12 72 40 Q 50 30 28 40 Z" fill={avatar.hairColor} />
                )}
                {avatar.hairstyle === 'long_braids' && (
                  <>
                    <path d="M 26 42 Q 50 10 74 42 L 78 80 L 70 80 Z" fill={avatar.hairColor} />
                    <path d="M 22 80 L 30 80 L 26 42 Z" fill={avatar.hairColor} />
                  </>
                )}
                {avatar.hairstyle === 'wizard_hat' && (
                  <polygon points="50,5 25,35 75,35" fill={avatar.hairColor} />
                )}
                {avatar.hairstyle === 'cyber_spikes' && (
                  <path d="M 28 35 L 35 15 L 45 30 L 55 10 L 65 30 L 72 35 Z" fill={avatar.hairColor} />
                )}
                {avatar.hairstyle === 'curly_afro' && (
                  <circle cx="50" cy="38" r="26" fill={avatar.hairColor} />
                )}
                {avatar.hairstyle === 'bald_monk' && (
                  // Shaved head — subtle sheen highlight ring on the scalp
                  <ellipse cx="50" cy="30" rx="18" ry="8" fill="none" stroke={avatar.skinTone} strokeWidth="3" strokeOpacity="0.35" />
                )}
                {avatar.hairstyle === 'knight_helmet' && (
                  <rect x="28" y="22" width="44" height="28" rx="6" fill="#475569" />
                )}
                {avatar.hairstyle === 'elven_crown' && (
                  <polygon points="30,30 40,20 50,28 60,20 70,30" fill="#f59e0b" />
                )}

                {/* Eyes & Mouth */}
                {avatar.hairstyle !== 'knight_helmet' && (
                  <>
                    <circle cx="42" cy="45" r="2.5" fill="#1e293b" />
                    <circle cx="58" cy="45" r="2.5" fill="#1e293b" />
                    <path d="M 44 54 Q 50 58 56 54" stroke="#1e293b" strokeWidth="2" fill="none" />
                  </>
                )}
              </svg>
            )}

            {/* Badge Icon Overlay */}
            <div className="absolute bottom-1 right-1 p-1 rounded-full bg-amber-600 text-black border border-black shadow">
              {BADGE_ICONS.find(b => b.id === avatar.badgeIcon)?.icon}
            </div>
          </div>

          <div className="space-y-1 text-center sm:text-left flex-1">
            <h3 className="text-lg font-bold font-serif text-amber-50">{displayName}</h3>
            <p className="text-xs text-slate-400 font-mono">
              Avatar Config: <span className="text-amber-400">{avatar.hairstyle.replace('_', ' ')}</span>
            </p>
            <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
              <label className="cursor-pointer px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-amber-300 font-semibold transition flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5" />
                Upload Photo
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileUpload} 
                  className="hidden" 
                />
              </label>

              {photoURL && (
                <button
                  onClick={() => setPhotoURL('')}
                  className="px-2 py-1 text-[10px] rounded bg-red-950/60 text-red-300 border border-red-800"
                >
                  Remove Photo
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-2">
          <button
            onClick={() => setActiveTab('avatar')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'avatar' ? 'bg-amber-600 text-black font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            Avatar Builder
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'profile' ? 'bg-amber-600 text-black font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            User Settings
          </button>
        </div>

        {/* Avatar Customization Tab */}
        {activeTab === 'avatar' && (
          <div className="space-y-4">
            {/* Hairstyle Selection */}
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-1.5">
                Hairstyle & Headwear
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {HAIRSTYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setAvatar({ ...avatar, hairstyle: style.id as any })}
                    className={`p-2 rounded border text-xs text-left font-semibold transition ${
                      avatar.hairstyle === style.id
                        ? 'bg-amber-600/20 border-amber-500 text-amber-300'
                        : 'bg-[#0A0A0F] border-white/10 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Hair Colors */}
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-1.5">
                Hair / Accent Color
              </label>
              <div className="flex flex-wrap gap-2">
                {HAIR_COLORS.map((hc) => (
                  <button
                    key={hc.hex}
                    onClick={() => setAvatar({ ...avatar, hairColor: hc.hex })}
                    className={`w-7 h-7 rounded-full border-2 transition transform hover:scale-110 flex items-center justify-center ${
                      avatar.hairColor === hc.hex ? 'border-amber-400 ring-2 ring-amber-400/50 scale-105' : 'border-white/20'
                    }`}
                    style={{ backgroundColor: hc.hex }}
                    title={hc.name}
                  >
                    {avatar.hairColor === hc.hex && <Check className="w-3.5 h-3.5 text-white drop-shadow" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Skin Tones */}
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-1.5">
                Skin Tone
              </label>
              <div className="flex flex-wrap gap-2">
                {SKIN_TONES.map((st) => (
                  <button
                    key={st.hex}
                    onClick={() => setAvatar({ ...avatar, skinTone: st.hex })}
                    className={`w-7 h-7 rounded-full border-2 transition transform hover:scale-110 flex items-center justify-center ${
                      avatar.skinTone === st.hex ? 'border-amber-400 ring-2 ring-amber-400/50 scale-105' : 'border-white/20'
                    }`}
                    style={{ backgroundColor: st.hex }}
                    title={st.name}
                  >
                    {avatar.skinTone === st.hex && <Check className="w-3.5 h-3.5 text-black drop-shadow" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Clothing Colors */}
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-1.5">
                Clothing Color
              </label>
              <div className="flex flex-wrap gap-2">
                {CLOTHING_COLORS.map((cc) => (
                  <button
                    key={cc.hex}
                    onClick={() => setAvatar({ ...avatar, clothingColor: cc.hex })}
                    className={`w-7 h-7 rounded-full border-2 transition transform hover:scale-110 flex items-center justify-center ${
                      avatar.clothingColor === cc.hex ? 'border-amber-400 ring-2 ring-amber-400/50 scale-105' : 'border-white/20'
                    }`}
                    style={{ backgroundColor: cc.hex }}
                    title={cc.name}
                  >
                    {avatar.clothingColor === cc.hex && <Check className="w-3.5 h-3.5 text-white drop-shadow" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Class Badge Icon */}
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-1.5">
                Avatar Class Badge
              </label>
              <div className="flex flex-wrap gap-2">
                {BADGE_ICONS.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setAvatar({ ...avatar, badgeIcon: b.id as any })}
                    className={`p-2 rounded border transition ${
                      avatar.badgeIcon === b.id 
                        ? 'bg-amber-600 text-black font-bold border-amber-500' 
                        : 'bg-[#0A0A0F] border-white/10 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {b.icon}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* User Profile Settings Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-1">
                Player Username
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-[#0A0A0F] border border-white/10 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-600/50 font-mono"
                placeholder="e.g. Shadowblade_99"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-1">
                Profile Photo URL (Optional)
              </label>
              <input
                type="text"
                value={photoURL}
                onChange={(e) => setPhotoURL(e.target.value)}
                className="w-full bg-[#0A0A0F] border border-white/10 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-600/50 font-mono"
                placeholder="https://..."
              />
            </div>
          </div>
        )}

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded text-xs font-semibold text-slate-400 hover:bg-white/5 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-black text-xs font-bold uppercase tracking-wider rounded transition flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Save Profile
          </button>
        </div>

      </div>
    </div>
  );
};
