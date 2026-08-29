import React, { useState } from 'react';
import { 
  ScrollText, 
  User as UserIcon, 
  Sparkles, 
  ShieldAlert, 
  Layers, 
  Compass, 
  Settings, 
  Dices,
  RefreshCw,
  AlertTriangle,
  Flame,
  Volume2
} from 'lucide-react';
import { Experience, CharacterSheet, InventoryItem, LogMessage, DiceRollResult, PendingCheck, CourseChangeAlert, StatBlock } from '../types';
import { NarrativeStream } from './NarrativeStream';
import { CharacterSheetPanel } from './CharacterSheetPanel';
import { DiceRollModal } from './DiceRollModal';
import { GEMINI_MODELS } from '../lib/modelsConfig';
import { rollDice, playAlertSound } from '../lib/diceRoller';

interface ExperienceViewProps {
  experience: Experience;
  onUpdateExperience: (updated: Experience) => void;
  onBack: () => void;
  selectedModel: string;
  soundEnabled: boolean;
}

export const ExperienceView: React.FC<ExperienceViewProps> = ({
  experience,
  onUpdateExperience,
  onBack,
  selectedModel,
  soundEnabled
}) => {
  const [activeTab, setActiveTab] = useState<'narrative' | 'character'>('narrative');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeRoll, setActiveRoll] = useState<DiceRollResult | null>(null);
  const [turnCounter, setTurnCounter] = useState(0);

  const modelObj = GEMINI_MODELS.find(m => m.id === selectedModel) || GEMINI_MODELS[0];

  // AI Narrative Turn Call
  const handleSendMessage = async (text: string, diceRoll?: DiceRollResult, checkResolved?: boolean) => {
    // Append player log
    const playerMsg: LogMessage = {
      id: `msg_${Date.now()}`,
      sender: 'player',
      text,
      timestamp: new Date().toISOString(),
      diceRoll
    };

    const updatedLogs = [...experience.logs, playerMsg];
    // If check was resolved, clear pendingCheck in temp experience
    const tempExp: Experience = { 
      ...experience, 
      logs: updatedLogs,
      pendingCheck: checkResolved ? null : experience.pendingCheck
    };
    onUpdateExperience(tempExp);

    setIsGenerating(true);
    setTurnCounter(prev => prev + 1);

    try {
      const res = await fetch('/api/gemini/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: selectedModel,
          actionType: 'turn',
          category: experience.category,
          systemInstruction: experience.customSystemPrompt,
          contents: updatedLogs.map(l => `${l.sender.toUpperCase()}: ${l.text}`).join('\n')
        })
      });

      if (!res.ok) {
        let errorMsg = `Server error (${res.status})`;
        try {
          const errData = await res.json();
          if (errData.error) errorMsg = errData.error;
        } catch (_) {}
        throw new Error(errorMsg);
      }

      const data = await res.json();

      const dmMsg: LogMessage = {
        id: `msg_${Date.now() + 1}`,
        sender: 'dm',
        text: data.text || 'The Game Master pauses thoughtfully...',
        timestamp: new Date().toISOString(),
        modelUsed: data.modelUsed || selectedModel,
        suggestedActions: data.suggestedActions && data.suggestedActions.length > 0 
          ? data.suggestedActions 
          : [
              'Cautiously investigate the immediate surroundings',
              'Interact with the nearest entity or focal point',
              'Ready your weapon/spell and take a guarded stance'
            ]
      };

      // Check for Course Changing Alert & Required Check
      let newAlert: CourseChangeAlert | null = data.courseChangeAlert || null;
      let newCheck: PendingCheck | null = data.requiredCheck || null;

      // Dynamic Character State Updates from Narrative Engine
      let updatedChar = { ...tempExp.character };

      if (data.stateDelta) {
        const delta = data.stateDelta;
        
        // 1. HP Delta changes
        if (typeof delta.hpDelta === 'number' && delta.hpDelta !== 0) {
          const newHp = Math.min(updatedChar.maxHp, Math.max(0, updatedChar.hp + delta.hpDelta));
          updatedChar.hp = newHp;
        }

        // 2. Items gained
        if (Array.isArray(delta.itemsGained) && delta.itemsGained.length > 0) {
          const newItems: InventoryItem[] = delta.itemsGained.map((it: any, idx: number) => {
            if (typeof it === 'string') {
              return {
                id: `item_${Date.now()}_${idx}`,
                name: it,
                type: 'misc',
                quantity: 1,
                isEquipped: false
              };
            }
            return {
              id: `item_${Date.now()}_${idx}`,
              name: it.name || 'Discovered Item',
              type: it.type || 'misc',
              quantity: it.quantity || 1,
              isEquipped: !!it.isEquipped,
              description: it.description
            };
          });
          updatedChar.inventory = [...updatedChar.inventory, ...newItems];
        }

        // 3. Items lost
        if (Array.isArray(delta.itemsLost) && delta.itemsLost.length > 0) {
          const lostNames = delta.itemsLost.map((s: string) => s.toLowerCase());
          updatedChar.inventory = updatedChar.inventory.filter(
            item => !lostNames.some((lost: string) => item.name.toLowerCase().includes(lost) || lost.includes(item.name.toLowerCase()))
          );
        }

        // 4. Conditions added
        if (Array.isArray(delta.conditionsAdded) && delta.conditionsAdded.length > 0) {
          const currentConditions = new Set(updatedChar.statusEffects);
          delta.conditionsAdded.forEach((cond: string) => currentConditions.add(cond));
          updatedChar.statusEffects = Array.from(currentConditions);
        }

        // 5. Conditions removed
        if (Array.isArray(delta.conditionsRemoved) && delta.conditionsRemoved.length > 0) {
          const removeSet = new Set(delta.conditionsRemoved.map((c: string) => c.toLowerCase()));
          updatedChar.statusEffects = updatedChar.statusEffects.filter(c => !removeSet.has(c.toLowerCase()));
        }

        // 6. Spells gained
        if (Array.isArray(delta.spellsGained) && delta.spellsGained.length > 0) {
          const currentSpells = new Set(updatedChar.spells);
          delta.spellsGained.forEach((sp: string) => currentSpells.add(sp));
          updatedChar.spells = Array.from(currentSpells);
        }
      }

      // Trigger alert sound if course change alert or required check was fired
      if ((newAlert || newCheck) && soundEnabled) {
        playAlertSound();
      }

      onUpdateExperience({
        ...tempExp,
        character: updatedChar,
        logs: [...updatedLogs, dmMsg],
        activeAlert: newAlert || (checkResolved ? null : tempExp.activeAlert),
        pendingCheck: newCheck || (checkResolved ? null : tempExp.pendingCheck)
      });
    } catch (err: any) {
      console.error('Narrative turn error:', err);
      const isLoadError = err.message === 'Load failed' || err.message === 'Failed to fetch';
      const cleanMessage = isLoadError
        ? 'Network connectivity issue. Please check your connection and try sending your turn again.'
        : (err.message || 'Failed to reach AI Game Master.');

      const errLog: LogMessage = {
        id: `msg_err_${Date.now()}`,
        sender: 'system',
        text: `⚠️ System Note: ${cleanMessage}`,
        timestamp: new Date().toISOString()
      };
      onUpdateExperience({ ...tempExp, logs: [...updatedLogs, errLog] });
    } finally {
      setIsGenerating(false);
    }
  };

  // AI Rules Adjudicator Referee Call
  const handleAdjudicateAction = async (actionText: string) => {
    const playerMsg: LogMessage = {
      id: `msg_${Date.now()}`,
      sender: 'player',
      text: `[Rules Referee Check]: ${actionText}`,
      timestamp: new Date().toISOString()
    };

    const updatedLogs = [...experience.logs, playerMsg];
    onUpdateExperience({ ...experience, logs: updatedLogs });

    setIsGenerating(true);

    try {
      const res = await fetch('/api/gemini/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: selectedModel,
          actionType: 'adjudicate',
          category: experience.category,
          systemInstruction: experience.customSystemPrompt,
          contents: `Character Stats: STR ${experience.character.stats.str}, DEX ${experience.character.stats.dex}, CON ${experience.character.stats.con}, INT ${experience.character.stats.int}, WIS ${experience.character.stats.wis}, CHA ${experience.character.stats.cha}.\nProposed Action: ${actionText}`
        })
      });

      if (!res.ok) {
        let errorMsg = `Server error (${res.status})`;
        try {
          const errData = await res.json();
          if (errData.error) errorMsg = errData.error;
        } catch (_) {}
        throw new Error(errorMsg);
      }

      const data = await res.json();
      const adjudicatorMsg: LogMessage = {
        id: `msg_${Date.now() + 1}`,
        sender: 'adjudicator',
        text: data.text || 'Rule Adjudication complete.',
        timestamp: new Date().toISOString(),
        modelUsed: data.modelUsed || selectedModel
      };

      onUpdateExperience({
        ...experience,
        logs: [...updatedLogs, adjudicatorMsg]
      });
    } catch (err: any) {
      console.error('Adjudicate error:', err);
      const isLoadError = err.message === 'Load failed' || err.message === 'Failed to fetch';
      const cleanMessage = isLoadError
        ? 'Network connectivity issue. Please try checking your rules again.'
        : (err.message || 'Adjudication check failed.');

      const errLog: LogMessage = {
        id: `msg_err_${Date.now()}`,
        sender: 'system',
        text: `⚠️ System Note: ${cleanMessage}`,
        timestamp: new Date().toISOString()
      };
      onUpdateExperience({ ...experience, logs: [...updatedLogs, errLog] });
    } finally {
      setIsGenerating(false);
    }
  };

  // Stat Roll Trigger
  const handleRollStat = (statName: string, modifier: number) => {
    const result = rollDice(`1d20${modifier >= 0 ? '+' : ''}${modifier}`, `${statName} Check`);
    setActiveRoll(result);
  };

  // Quick Roll D20
  const handleQuickRollD20 = () => {
    handleRollStat('d20 Check', 0);
  };

  // Handle Forced Check Roll
  const handlePerformCheckRoll = (check: PendingCheck) => {
    let statKey: keyof StatBlock = 'wis';
    const s = check.skill.toLowerCase();
    if (check.stat && check.stat.toLowerCase() in experience.character.stats) {
      statKey = check.stat.toLowerCase() as keyof StatBlock;
    } else if (s.includes('athlet') || s.includes('strength')) {
      statKey = 'str';
    } else if (s.includes('acrobat') || s.includes('stealth') || s.includes('dexter') || s.includes('dodge') || s.includes('sleight')) {
      statKey = 'dex';
    } else if (s.includes('constitut') || s.includes('enduran') || s.includes('poison')) {
      statKey = 'con';
    } else if (s.includes('arcana') || s.includes('histor') || s.includes('investig') || s.includes('nature') || s.includes('relig')) {
      statKey = 'int';
    } else if (s.includes('persua') || s.includes('decept') || s.includes('intimid') || s.includes('perform')) {
      statKey = 'cha';
    }

    const statVal = experience.character.stats[statKey] ?? 10;
    const mod = Math.floor((statVal - 10) / 2);

    const result = rollDice(`1d20${mod >= 0 ? '+' : ''}${mod}`, `${check.skill} Check (DC ${check.dc})`);
    setActiveRoll(result);
  };

  // Apply dice roll to story and ask Game Master to narrate consequences
  const handleApplyRoll = (result: DiceRollResult) => {
    setActiveRoll(null);
    const isCheck = !!experience.pendingCheck;
    const currentCheck = experience.pendingCheck;

    let rollPrompt = '';
    if (isCheck && currentCheck) {
      const isSuccess = result.total >= currentCheck.dc;
      const statusText = isSuccess ? 'SUCCESS' : 'FAILURE';
      const critText = result.isNat20 ? '🔥 NATURAL 20 CRITICAL SUCCESS!' : result.isNat1 ? '💀 NATURAL 1 CRITICAL FAILURE!' : '';
      rollPrompt = `🎲 [MANDATORY CHECK RESULT: ${currentCheck.skill} vs DC ${currentCheck.dc}]\nRolled: ${result.total} (${result.formula}) -> Outcome: **${statusText}**! ${critText}\nReason: ${currentCheck.reason}\n\nPlease narrate the dramatic outcome and immediate consequences of this check!`;
    } else {
      rollPrompt = `🎲 [DICE ROLL] I rolled ${result.reason || 'a check'} (${result.formula}) -> Total: ${result.total}${
        result.isNat20 ? ' (NATURAL 20 CRITICAL SUCCESS!)' : result.isNat1 ? ' (NATURAL 1 CRITICAL FAILURE!)' : ''
      }. Please narrate the dramatic outcome and consequences of this roll!`;
    }

    handleSendMessage(rollPrompt, result, isCheck);
  };

  // Dismiss Course Change Alert
  const handleDismissAlert = () => {
    onUpdateExperience({
      ...experience,
      activeAlert: null
    });
  };

  return (
    <div className="min-h-[calc(100vh-56px)] bg-[#0F0F12] text-slate-200 p-3 sm:p-5 lg:p-6 space-y-4">
      
      {/* Top Experience Sub-Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-[#111118] border border-white/10 shadow-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-amber-300 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Change Experience</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-serif font-bold text-amber-50">{experience.title}</h2>
              <span className="px-2 py-0.5 text-[9px] font-mono uppercase font-bold rounded bg-white/5 text-amber-400 border border-white/10">
                {experience.category.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans">
              Hero: <strong className="text-slate-200">{experience.character.name}</strong> ({experience.character.roleClass})
            </p>
          </div>
        </div>

        {/* Right Status & Mobile View Switcher Tabs */}
        <div className="flex items-center gap-2">
          {/* Status Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/5 border border-white/10 text-[11px] font-mono text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Dynamic Encounters Active</span>
          </div>

          {/* Desktop/Mobile View Switcher Tabs */}
          <div className="flex items-center gap-1 bg-[#0A0A0F] p-1 rounded border border-white/10 lg:hidden">
            <button
              onClick={() => setActiveTab('narrative')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'narrative' ? 'bg-amber-600 text-black font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ScrollText className="w-3.5 h-3.5" />
              Narrative & Chat
            </button>

            <button
              onClick={() => setActiveTab('character')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'character' ? 'bg-amber-600 text-black font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserIcon className="w-3.5 h-3.5" />
              Character Sheet
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column (Narrative stream always visible on desktop, tab-switched on mobile) */}
        <div className={`lg:col-span-8 space-y-5 ${activeTab === 'character' ? 'hidden lg:block' : ''}`}>
          <NarrativeStream
            logs={experience.logs}
            onSendMessage={handleSendMessage}
            onAdjudicateAction={handleAdjudicateAction}
            onQuickRollD20={handleQuickRollD20}
            isGenerating={isGenerating}
            activeModelName={modelObj.name}
            experienceCategory={experience.category}
            pendingCheck={experience.pendingCheck}
            activeAlert={experience.activeAlert}
            onDismissAlert={handleDismissAlert}
            onPerformCheckRoll={handlePerformCheckRoll}
            characterStats={experience.character.stats}
          />
        </div>

        {/* Right Column (Character sheet always visible on desktop, tab-switched on mobile) */}
        <div className={`lg:col-span-4 ${activeTab !== 'character' ? 'hidden lg:block' : ''}`}>
          <CharacterSheetPanel
            character={experience.character}
            onUpdateCharacter={(updatedChar) => onUpdateExperience({ ...experience, character: updatedChar })}
            onRollStat={handleRollStat}
            experienceCategory={experience.category}
            currentLocation={experience.gameWorldState?.currentLocation || 'Starting Area'}
            recentStoryContext={experience.logs.slice(-3).map(l => `${l.sender}: ${l.text}`).join('\n')}
            selectedModel={selectedModel}
          />
        </div>

      </div>

      {/* Visual Dice Roll Popup */}
      <DiceRollModal
        rollResult={activeRoll}
        onClose={() => setActiveRoll(null)}
        onApplyRoll={handleApplyRoll}
        soundEnabled={soundEnabled}
      />

    </div>
  );
};
