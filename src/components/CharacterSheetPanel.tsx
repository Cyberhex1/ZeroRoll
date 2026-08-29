import React, { useState } from 'react';
import { 
  Shield, 
  Heart, 
  Sparkles, 
  Package, 
  BookOpen, 
  Zap,
  Swords,
  RefreshCw,
  Camera,
  User,
  Info
} from 'lucide-react';
import { CharacterSheet, InventoryItem, ExperienceCategory } from '../types';
import { generateAvatarAI } from '../lib/geminiService';

interface CharacterSheetPanelProps {
  character: CharacterSheet;
  onUpdateCharacter: (updated: CharacterSheet) => void;
  onRollStat: (statName: string, modifier: number) => void;
  experienceCategory?: ExperienceCategory;
  currentLocation?: string;
  recentStoryContext?: string;
  selectedModel?: string;
}

export const CharacterSheetPanel: React.FC<CharacterSheetPanelProps> = ({
  character,
  onUpdateCharacter,
  onRollStat,
  experienceCategory = 'fantasy_dnd',
  currentLocation = 'Starting Area',
  recentStoryContext = '',
  selectedModel = 'gemini-2.5-flash'
}) => {
  const [physicalDesc, setPhysicalDesc] = useState(character.physicalDescription || '');
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const computeModifier = (val: number) => {
    const mod = Math.floor((val - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  const getModValue = (val: number) => Math.floor((val - 10) / 2);

  const handleToggleEquip = (itemId: string) => {
    const updatedInv = (character.inventory || []).map(item => {
      if (item.id === itemId) {
        return { ...item, isEquipped: !item.isEquipped };
      }
      return item;
    });
    onUpdateCharacter({ ...character, inventory: updatedInv });
  };

  const handleGenerateOrUpdateAvatar = async () => {
    setIsGeneratingAvatar(true);
    setAvatarError(null);

    try {
      const data = await generateAvatarAI({
        characterName: character.name,
        roleClass: character.roleClass,
        raceOrigin: character.raceOrigin,
        category: (experienceCategory || 'fantasy') as ExperienceCategory,
        physicalDescription: physicalDesc || character.physicalDescription,
        recentStoryContext: recentStoryContext,
        model: selectedModel
      });

      if (data && data.avatarUrl) {
        onUpdateCharacter({
          ...character,
          avatarUrl: data.avatarUrl,
          physicalDescription: physicalDesc || character.physicalDescription
        });
      } else {
        throw new Error('No avatar image was returned.');
      }
    } catch (err: any) {
      console.error('Avatar generation error:', err);
      setAvatarError(err.message || 'Failed to generate character avatar.');
    } finally {
      setIsGeneratingAvatar(false);
    }
  };

  const statsList = [
    { key: 'str', label: 'STR', name: 'Strength', val: character.stats.str },
    { key: 'dex', label: 'DEX', name: 'Dexterity', val: character.stats.dex },
    { key: 'con', label: 'CON', name: 'Constitution', val: character.stats.con },
    { key: 'int', label: 'INT', name: 'Intelligence', val: character.stats.int },
    { key: 'wis', label: 'WIS', name: 'Wisdom', val: character.stats.wis },
    { key: 'cha', label: 'CHA', name: 'Charisma', val: character.stats.cha }
  ];

  return (
    <div className="rounded-lg bg-[#111118] border border-white/10 p-4 space-y-5 shadow-2xl text-slate-200">
      
      {/* Hero Header & Dramatic Portrait */}
      <div className="space-y-3 border-b border-white/10 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5">
            {character.avatarUrl ? (
              <div className="relative group shrink-0">
                <img 
                  src={character.avatarUrl} 
                  alt={character.name} 
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border-2 border-amber-500 shadow-xl transition group-hover:scale-105"
                />
                <button
                  onClick={handleGenerateOrUpdateAvatar}
                  disabled={isGeneratingAvatar}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 rounded-xl flex flex-col items-center justify-center text-amber-300 transition text-[9px] font-bold gap-1"
                  title="Update avatar to reflect current story"
                >
                  <RefreshCw className={`w-4 h-4 ${isGeneratingAvatar ? 'animate-spin' : ''}`} />
                  <span>Update</span>
                </button>
                {isGeneratingAvatar && (
                  <div className="absolute inset-0 bg-black/70 rounded-xl flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 text-amber-400 animate-spin" />
                  </div>
                )}
              </div>
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-amber-600/20 border-2 border-amber-500/40 text-amber-300 font-bold font-serif text-2xl flex items-center justify-center shadow-lg shrink-0">
                {character.name[0] || 'H'}
              </div>
            )}

            <div>
              <h2 className="text-lg sm:text-xl font-bold text-amber-50 font-serif leading-tight">{character.name}</h2>
              <p className="text-xs text-amber-400/90 font-mono mt-0.5">
                Level {character.level} • {character.raceOrigin} • {character.roleClass}
              </p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                {character.gender && (
                  <span className="text-[10px] font-mono text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-600/30 flex items-center gap-1 font-semibold">
                    {character.gender}
                  </span>
                )}
                <span className="text-[10px] font-mono text-slate-300 bg-black/40 px-2 py-0.5 rounded border border-white/5 flex items-center gap-1">
                  <Shield className="w-2.5 h-2.5 text-amber-400" />
                  AC {character.armorClass}
                </span>
                <span className="text-[10px] font-mono text-slate-300 bg-black/40 px-2 py-0.5 rounded border border-white/5 flex items-center gap-1">
                  <Zap className="w-2.5 h-2.5 text-amber-400" />
                  Init +{character.initiativeBonus}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Dramatic Avatar Generator & Story Evolution */}
        <div className="p-3 rounded bg-[#0A0A0F] border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold flex items-center gap-1.5">
              <Camera className="w-3 h-3 text-amber-400" />
              Dramatic Cartoon Character Portrait
            </label>
            {character.avatarUrl && (
              <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-1.5 py-0.5 rounded">
                Story-Synced
              </span>
            )}
          </div>

          <p className="text-[11px] text-slate-400">
            Customize physical details (posture, attire, eyes, heirloom items, scars). Gemini will render a dramatic cartoonized profile picture matched to where you are in the story.
          </p>

          <textarea
            rows={2}
            value={physicalDesc}
            onChange={(e) => setPhysicalDesc(e.target.value)}
            placeholder="e.g. Simple hotel staff attire with impeccable regal posture, piercing sapphire eyes, carrying an antique heirloom ring..."
            className="w-full bg-[#111118] border border-white/10 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-600/50 resize-none font-sans"
          />

          {avatarError && (
            <p className="text-[10px] text-red-400 font-mono">{avatarError}</p>
          )}

          <div className="flex items-center justify-end">
            <button
              onClick={handleGenerateOrUpdateAvatar}
              disabled={isGeneratingAvatar}
              className="px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-black text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 shadow disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingAvatar ? 'animate-spin' : ''}`} />
              {character.avatarUrl ? 'Update Avatar (Reflect Story)' : 'Generate Dramatic Portrait'}
            </button>
          </div>
        </div>
      </div>

      {/* HP Gauge */}
      <div className="p-3 rounded bg-[#0A0A0F] border border-white/10 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-300 font-semibold flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500/20" />
            Hit Points (Story-Driven)
          </span>
          <span className={`font-bold font-mono ${character.hp <= character.maxHp * 0.3 ? 'text-red-400 animate-pulse' : 'text-amber-400'}`}>
            {character.hp} / {character.maxHp} HP
          </span>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full h-2.5 bg-[#111118] rounded-full overflow-hidden border border-white/10">
          <div 
            className={`h-full transition-all duration-300 ${
              character.hp <= character.maxHp * 0.3 
                ? 'bg-red-500' 
                : character.hp <= character.maxHp * 0.6 
                ? 'bg-amber-500' 
                : 'bg-gradient-to-r from-emerald-500 to-emerald-400'
            }`}
            style={{ width: `${Math.min(100, Math.max(0, (character.hp / character.maxHp) * 100))}%` }}
          />
        </div>

        <p className="text-[10px] text-slate-500 font-mono">
          Damage and recovery are adjudicated dynamically by the Game Master during combat and story checks.
        </p>
      </div>

      {/* Primary Stats Grid */}
      <div>
        <h3 className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-2">
          Ability Scores & Skill Checks (Click to Roll)
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-3 xl:grid-cols-6 gap-1.5 sm:gap-2">
          {statsList.map((st) => (
            <button
              key={st.key}
              onClick={() => onRollStat(st.name, getModValue(st.val))}
              className="p-2 sm:p-2.5 rounded-lg bg-[#0A0A0F] border border-white/10 hover:border-amber-600/50 hover:bg-white/5 active:scale-95 transition flex flex-col items-center justify-center text-center group shadow-sm"
            >
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 font-mono group-hover:text-amber-300">
                {st.label}
              </span>
              <span className="text-sm sm:text-base font-extrabold text-amber-300 my-0.5 font-mono">
                {computeModifier(st.val)}
              </span>
              <span className="text-[8px] sm:text-[9px] text-slate-500 font-mono">
                {st.val}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Status Conditions */}
      <div className="p-3 rounded bg-[#0A0A0F] border border-white/10 space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
          <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            Active Conditions ({(character.statusEffects || []).length})
          </span>
          <span className="text-[9px] font-mono text-slate-500">Story-Managed</span>
        </div>
        
        {(character.statusEffects || []).length === 0 ? (
          <p className="text-[11px] text-slate-500 italic">No adverse conditions currently active.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {(character.statusEffects || []).map((st, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded bg-purple-950/80 border border-purple-700/50 text-purple-200 text-[10px] font-mono flex items-center gap-1"
              >
                <Sparkles className="w-2.5 h-2.5 text-purple-400" />
                {st}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Inventory */}
      <div className="p-3 rounded bg-[#0A0A0F] border border-white/10 space-y-2.5">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300 border-b border-white/10 pb-2">
          <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider">
            <Package className="w-3.5 h-3.5 text-amber-400" />
            Equipment & Inventory ({(character.inventory || []).length})
          </span>
          <span className="text-[9px] font-mono text-slate-500">Story-Managed</span>
        </div>

        {(character.inventory || []).length === 0 ? (
          <p className="text-[11px] text-slate-500 italic">Inventory is empty. Items you discover will appear here automatically.</p>
        ) : (
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {(character.inventory || []).map((item) => (
              <div
                key={item.id}
                className="p-2 rounded bg-[#111118] border border-white/5 flex items-center justify-between text-xs group"
              >
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleEquip(item.id)}
                    className={`p-1 rounded border transition ${
                      item.isEquipped 
                        ? 'bg-amber-600/20 text-amber-300 border-amber-600/50' 
                        : 'bg-white/5 text-slate-500 border-white/10 group-hover:text-slate-300'
                    }`}
                    title={item.isEquipped ? 'Equipped (Click to unequip)' : 'Unequipped (Click to equip)'}
                  >
                    <Swords className="w-3 h-3" />
                  </button>
                  <div>
                    <span className={`font-medium ${item.isEquipped ? 'text-amber-300 font-semibold' : 'text-slate-300'}`}>
                      {item.name}
                    </span>
                    {item.description && (
                      <p className="text-[10px] text-slate-500 line-clamp-1">{item.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {item.isEquipped && (
                    <span className="text-[9px] font-mono text-amber-400 bg-amber-950/40 border border-amber-800/40 px-1.5 py-0.5 rounded">
                      Equipped
                    </span>
                  )}
                  <span className="text-[10px] text-slate-500 font-mono">
                    x{item.quantity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono pt-1">
          <Info className="w-3 h-3 text-amber-500/70 shrink-0" />
          <span>New loot, relics, and items are added automatically by the narrative engine.</span>
        </div>
      </div>

      {/* Spells */}
      <div className="p-3 rounded bg-[#0A0A0F] border border-white/10 space-y-2.5">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300 border-b border-white/10 pb-2">
          <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
            Spells & Powers ({(character.spells || []).length})
          </span>
          <span className="text-[9px] font-mono text-slate-500">Story-Managed</span>
        </div>

        {(character.spells || []).length === 0 ? (
          <p className="text-[11px] text-slate-500 italic">No spells or magical powers unlocked yet.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {(character.spells || []).map((sp, idx) => (
              <span
                key={idx}
                className="px-2 py-1 rounded bg-blue-950/80 border border-blue-700/50 text-blue-200 text-[10px] font-mono flex items-center gap-1.5"
              >
                <Zap className="w-2.5 h-2.5 text-blue-400" />
                {sp}
              </span>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
