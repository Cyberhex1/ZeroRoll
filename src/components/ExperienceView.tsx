import React, { useState, useRef, useEffect } from 'react';
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
import { getCategoryFallbackActions } from '../lib/experienceHelpers';
import { NarrativeStream } from './NarrativeStream';
import { CharacterSheetPanel } from './CharacterSheetPanel';
import { DiceRollModal } from './DiceRollModal';
import { GEMINI_MODELS } from '../lib/modelsConfig';
import { rollDice, playAlertSound } from '../lib/diceRoller';
import { executeActionTurn, generateAvatarAI } from '../lib/geminiService';

interface ExperienceViewProps {
  experience: Experience;
  onUpdateExperience: (updated: Experience) => void;
  onBack: () => void;
  selectedModel: string;
  soundEnabled: boolean;
  onStartBookTwo?: (exp: Experience) => void;
}

export const ExperienceView: React.FC<ExperienceViewProps> = ({
  experience,
  onUpdateExperience,
  onBack,
  selectedModel,
  soundEnabled,
  onStartBookTwo
}) => {
  const [activeTab, setActiveTab] = useState<'narrative' | 'character'>('narrative');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeRoll, setActiveRoll] = useState<DiceRollResult | null>(null);
  const [turnCounter, setTurnCounter] = useState(0);

  const latestExpRef = useRef(experience);
  const isGeneratingRef = useRef(isGenerating);

  useEffect(() => {
    latestExpRef.current = experience;
  }, [experience]);

  useEffect(() => {
    isGeneratingRef.current = isGenerating;
  }, [isGenerating]);

  const modelObj = GEMINI_MODELS.find(m => m.id === selectedModel) || GEMINI_MODELS[0];

  // AI Narrative Turn Call
  const handleSendMessage = async (text: string, diceRoll?: DiceRollResult, checkResolved?: boolean) => {
    if (isGeneratingRef.current) return;

    // Append player log
    const currentExp = latestExpRef.current;
    const playerMsg: LogMessage = {
      id: `msg_${Date.now()}`,
      sender: 'player',
      text,
      timestamp: new Date().toISOString(),
      diceRoll
    };

    const updatedLogs = [...currentExp.logs, playerMsg];
    // If check was resolved, clear pendingCheck in temp experience
    const tempExp: Experience = { 
      ...currentExp, 
      logs: updatedLogs,
      pendingCheck: checkResolved ? null : currentExp.pendingCheck
    };
    onUpdateExperience(tempExp);

    setIsGenerating(true);
    setTurnCounter(prev => prev + 1);

    try {
      const data = await executeActionTurn({
        contents: updatedLogs.map(l => `${l.sender.toUpperCase()}: ${l.text}`).join('\n'),
        category: tempExp.category,
        model: selectedModel,
        systemInstruction: tempExp.customSystemPrompt,
        characterState: tempExp.character,
        diceRoll,
        storyOutline: tempExp.storyOutline
      });

      const dmMsg: LogMessage = {
        id: `msg_${Date.now() + 1}`,
        sender: 'dm',
        text: data.text || 'The Game Master pauses thoughtfully...',
        timestamp: new Date().toISOString(),
        modelUsed: data.modelUsed || selectedModel,
        suggestedActions: data.suggestedActions && data.suggestedActions.length > 0
          ? data.suggestedActions
          : getCategoryFallbackActions(experience.category)
      };

      // Check for Course Changing Alert & Required Check
      let newAlert: CourseChangeAlert | null = data.courseChangeAlert || null;
      let newCheck: PendingCheck | null = data.requiredCheck || null;

      // 1. Perform async avatar generation BEFORE reading the final state
      let evoAvatarResult: any = null;
      let evoNewDesc: string | undefined = undefined;

      if (data.avatarEvolution?.evolved) {
        try {
          const curExp = latestExpRef.current;
          evoNewDesc = data.avatarEvolution.updatedPhysicalDescription;
          evoAvatarResult = await generateAvatarAI({
            characterName: curExp.character.name,
            roleClass: curExp.character.roleClass,
            raceOrigin: curExp.character.raceOrigin,
            category: curExp.category,
            physicalDescription: evoNewDesc || curExp.character.physicalDescription,
            recentStoryContext: `${curExp.logs.slice(-2).map(l => l.text).join('\n')}\n${dmMsg.text}`,
            model: selectedModel
          });
        } catch (evoErr) {
          console.warn('Auto avatar evolution error:', evoErr);
        }
      }

      // 2. GET THE ABSOLUTE FRESHEST EXPERIENCE (after all async work is done)
      const finalExp = latestExpRef.current;

      // 3. Apply all dynamic updates (Delta + Avatar) to the fresh state
      let updatedChar = { ...finalExp.character };

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

      // 4. Apply new avatar URL if we successfully generated one
      if (evoAvatarResult?.avatarUrl) {
        updatedChar.avatarUrl = evoAvatarResult.avatarUrl;
        if (evoNewDesc) updatedChar.physicalDescription = evoNewDesc;
      }

      // Trigger alert sound if course change alert or required check was fired
      if ((newAlert || newCheck || data.avatarEvolution?.evolved) && soundEnabled) {
        playAlertSound();
      }

      onUpdateExperience({
        ...finalExp,
        character: updatedChar,
        logs: [...finalExp.logs, dmMsg],
        activeAlert: newAlert || (checkResolved ? null : finalExp.activeAlert),
        pendingCheck: newCheck || (checkResolved ? null : finalExp.pendingCheck)
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
      const finalExp = latestExpRef.current;
      onUpdateExperience({ ...finalExp, logs: [...finalExp.logs, errLog] });
    } finally {
      setIsGenerating(false);
    }
  };

  // AI Rules Adjudicator Referee Call
  const handleAdjudicateAction = async (actionText: string) => {
    if (isGeneratingRef.current) return;
    
    const currentExp = latestExpRef.current;
    const playerMsg: LogMessage = {
      id: `msg_${Date.now()}`,
      sender: 'player',
      text: `[Rules Referee Check]: ${actionText}`,
      timestamp: new Date().toISOString()
    };

    const updatedLogs = [...currentExp.logs, playerMsg];
    onUpdateExperience({ ...currentExp, logs: updatedLogs });

    setIsGenerating(true);

    try {
      const data = await executeActionTurn({
        contents: `[Rules Referee Adjudication Request]\nCharacter Stats: STR ${currentExp.character.stats.str}, DEX ${currentExp.character.stats.dex}, CON ${currentExp.character.stats.con}, INT ${currentExp.character.stats.int}, WIS ${currentExp.character.stats.wis}, CHA ${currentExp.character.stats.cha}.\nProposed Action: ${actionText}`,
        category: currentExp.category,
        model: selectedModel,
        systemInstruction: 'You are the Rule Adjudicator. Parse the player action and explain difficulty (DC) and requirements.'
      });

      const adjudicatorMsg: LogMessage = {
        id: `msg_${Date.now() + 1}`,
        sender: 'adjudicator',
        text: data.text || 'Rule Adjudication complete.',
        timestamp: new Date().toISOString(),
        modelUsed: data.modelUsed || selectedModel
      };

      const finalExp = latestExpRef.current;
      onUpdateExperience({
        ...finalExp,
        logs: [...finalExp.logs, adjudicatorMsg]
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
      const finalExp = latestExpRef.current;
      onUpdateExperience({ ...finalExp, logs: [...finalExp.logs, errLog] });
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
    let newChapter = experience.gameWorldState.currentChapter || 1;
    if (experience.activeAlert?.type === 'chapter_transition') {
      newChapter += 1;
    }

    onUpdateExperience({
      ...experience,
      gameWorldState: {
        ...experience.gameWorldState,
        currentChapter: newChapter
      },
      activeAlert: null
    });
  };

  return (
    <div className="min-h-[calc(100dvh-56px)] bg-[#0F0F12] text-slate-200 p-2 sm:p-4 lg:p-6 space-y-3 sm:space-y-4">
      
      {/* Top Experience Sub-Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-[#111118] border border-white/10 shadow-xl">
        <div className="flex items-center justify-between sm:justify-start gap-2.5 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onBack}
              className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-amber-300 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition shrink-0"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Experiences</span>
            </button>

            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h2 className="text-xs sm:text-base font-serif font-bold text-amber-50 truncate max-w-[180px] xs:max-w-[240px] sm:max-w-none">
                  {experience.title} <span className="text-amber-500/80 font-normal">| Chapter {experience.gameWorldState.currentChapter || 1} of {experience.storyOutline?.chapters?.length || 3}</span>
                </h2>
                <span className="px-1.5 py-0.5 text-[8px] sm:text-[9px] font-mono uppercase font-bold rounded bg-white/5 text-amber-400 border border-white/10 shrink-0">
                  {experience.category.replace('_', ' ')}
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 font-sans">
                Hero: <strong className="text-slate-200">{experience.character.name}</strong> ({experience.character.roleClass}) • <span className="text-emerald-400 font-mono">HP: {experience.character.hp}/{experience.character.maxHp}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Right Status & Mobile View Switcher Tabs */}
        <div className="flex items-center justify-between sm:justify-end gap-2 pt-1 sm:pt-0 border-t border-white/5 sm:border-t-0">
          {/* Status Indicator (Tablet/Desktop) */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Dynamic Encounters Active</span>
          </div>

          {/* Desktop/Mobile View Switcher Tabs */}
          <div className="w-full sm:w-auto grid grid-cols-2 sm:flex items-center gap-1 bg-[#0A0A0F] p-1 rounded-lg border border-white/10 lg:hidden">
            <button
              onClick={() => setActiveTab('narrative')}
              className={`py-1.5 px-3 rounded-md text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'narrative' ? 'bg-amber-600 text-black font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ScrollText className="w-3.5 h-3.5" />
              <span>Narrative</span>
            </button>

            <button
              onClick={() => setActiveTab('character')}
              className={`py-1.5 px-3 rounded-md text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'character' ? 'bg-amber-600 text-black font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Hero Sheet</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-5">
        
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
            onUpdateCharacter={(updater) => onUpdateExperience({ 
              ...latestExpRef.current, 
              character: updater(latestExpRef.current.character) 
            })}
            onRollStat={handleRollStat}
            experienceCategory={experience.category}
            currentLocation={experience.gameWorldState?.currentLocation || 'Starting Area'}
            recentStoryContext={experience.logs.slice(-3).map(l => `${l.sender}: ${l.text}`).join('\n')}
            selectedModel={selectedModel}
          />
        </div>

      </div>

      {/* Dice Roll Modal */}
      {activeRoll && (
        <DiceRollModal
          rollResult={activeRoll}
          onClose={() => setActiveRoll(null)}
          onApplyRoll={handleApplyRoll}
          soundEnabled={soundEnabled}
        />
      )}

      {/* Story Conclusion Modal */}
      {experience.activeAlert?.type === 'story_conclusion' && (
        <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#111118] border border-amber-500/30 rounded-xl p-6 sm:p-8 max-w-lg w-full text-center space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 via-transparent to-purple-900/10 pointer-events-none" />
            
            <Sparkles className="w-12 h-12 text-amber-400 mx-auto animate-pulse" />
            
            <div className="space-y-2 relative z-10">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-amber-50">
                {experience.activeAlert.title}
              </h2>
              <p className="text-amber-200/80 font-medium">
                {experience.activeAlert.subtitle}
              </p>
              {experience.activeAlert.description && (
                <p className="text-sm text-slate-300 mt-4 leading-relaxed">
                  {experience.activeAlert.description}
                </p>
              )}
            </div>

            <div className="pt-4 flex flex-col gap-3 relative z-10">
              {onStartBookTwo && (
                <button
                  onClick={() => onStartBookTwo(experience)}
                  className="w-full py-3 px-4 rounded-lg bg-amber-600 hover:bg-amber-500 text-black font-bold font-serif transition shadow-[0_0_15px_rgba(217,119,6,0.3)] hover:shadow-[0_0_25px_rgba(217,119,6,0.5)] flex items-center justify-center gap-2"
                >
                  <Layers className="w-5 h-5" />
                  Start Book Two
                </button>
              )}
              
              <button
                onClick={onBack}
                className="w-full py-2.5 px-4 rounded-lg bg-white/10 hover:bg-white/15 border border-white/20 text-slate-200 font-semibold transition"
              >
                Start a New Experience
              </button>

              <button
                onClick={handleDismissAlert}
                className="w-full py-2 px-4 rounded-lg text-slate-400 hover:text-slate-200 text-sm font-medium transition"
              >
                Close & Review Logs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
