import React, { useState, useRef, useEffect } from 'react';
import { uid } from '../lib/ids';
import {
  ScrollText,
  User as UserIcon,
  Sparkles,
  Layers
} from 'lucide-react';
import {
  Experience,
  LogMessage,
  DiceRollResult,
  PendingCheck,
  CourseChangeAlert,
} from '../types';
import { getCategoryFallbackActions, pickInspiration } from '../content';
import { NarrativeStream } from './NarrativeStream';
import { CharacterSheetPanel } from './CharacterSheetPanel';
import { DiceRollModal } from './DiceRollModal';
import { rollDice, playAlertSound } from '../lib/diceRoller';
import { executeActionTurn, generateAvatarAI, getLastModelUsedLabel, refereeAdjudicate } from '../lib/geminiService';
import { complete } from '../ai/router';
import { applyDelta, applyWorld, nextAlert, rulesModeOf } from '../dnd/applyTurn';
import { RULES_MODES, RulesMode, checkOutcome, deathSave, naturalOf, planCheck, rollPlan } from '../dnd/rules';
import { resolveSkin, skinVars } from '../story/skins';
import { turnRecallScores } from '../memory/recallService';
import { REFEREE_PREFIX, buildDndContext, dndTurns, experienceMemory, maybeSummarizeExperience, memoryFromTurn } from '../dnd/memory';
import { mergeMemories } from '../memory/summarizer';
import MemoryPanel from '../memory/ui/MemoryPanel';
import { useDialog } from './ui/useDialog';

interface ExperienceViewProps {
  experience: Experience;
  onUpdateExperience: (updated: Experience) => void;
  onBack: () => void;
  selectedModel: string;
  soundEnabled: boolean;
  onStartBookTwo?: (exp: Experience) => void | Promise<void>;
}

export const ExperienceView: React.FC<ExperienceViewProps> = ({
  experience,
  onUpdateExperience: saveExperience,
  onBack,
  selectedModel,
  soundEnabled,
  onStartBookTwo
}) => {
  const [activeTab, setActiveTab] = useState<'narrative' | 'character'>('narrative');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeRoll, setActiveRoll] = useState<DiceRollResult | null>(null);

  const latestExpRef = useRef(experience);
  const isGeneratingRef = useRef(isGenerating);

  useEffect(() => {
    latestExpRef.current = experience;
  }, [experience]);

  // Every update goes through here, so handlers that run right after one see it.
  const onUpdateExperience = (next: Experience) => {
    latestExpRef.current = next;
    saveExperience(next);
  };

  useEffect(() => {
    isGeneratingRef.current = isGenerating;
  }, [isGenerating]);

  const [continuing, setContinuing] = useState(false);
  const endDialog = useDialog(() => handleDismissAlert(), { labelledBy: 'ending-title', active: experience.activeAlert?.type === 'story_conclusion' });
  const continueBook = async () => {
    if (!onStartBookTwo || continuing) return;
    setContinuing(true);
    try {
      await onStartBookTwo(latestExpRef.current);
    } finally {
      setContinuing(false);
    }
  };
  const mode = rulesModeOf(experience);
  const skin = React.useMemo(() => resolveSkin(experience.category), [experience.category]);
  const pendingPlan = experience.pendingCheck && experience.pendingCheck.kind !== 'death_save'
    ? planCheck(experience.character, experience.pendingCheck.skill, experience.pendingCheck.stat, mode, experience.pendingCheck.roll)
    : null;
  const lockedReason = experience.concluded
    ? experience.concluded.reason === 'death'
      ? `${experience.character.name} has died. The story of this book is over.`
      : `Book ${experience.book ?? 1} has ended.`
    : undefined;

  const memoryMeter = React.useMemo(() => buildDndContext(experience).meter, [experience]);

  // Show who actually answered, not the picker's label (the cascade can swap models).
  const lastAnsweredBy =
    [...experience.logs].reverse().find((l) => l.sender !== 'player' && l.modelUsed)?.modelUsed ||
    getLastModelUsedLabel();

  // AI Narrative Turn Call
  const handleSendMessage = async (text: string, diceRoll?: DiceRollResult, checkResolved?: boolean) => {
    if (isGeneratingRef.current) return;

    // Append player log
    const currentExp = latestExpRef.current;
    const playerMsg: LogMessage = {
      id: `msg_${uid()}`,
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
      pendingCheck: checkResolved ? null : currentExp.pendingCheck,
      // Campaigns from before inspiration was stored get theirs now and keep it from here on.
      inspiration: currentExp.inspiration ?? pickInspiration(currentExp.category)
    };
    onUpdateExperience(tempExp);

    setIsGenerating(true);

    try {
      const tempMemory = experienceMemory(tempExp);
      const recallScores = await turnRecallScores(tempMemory, dndTurns(updatedLogs).slice(tempMemory.summarizedThrough));
      const data = await executeActionTurn({
        contents: buildDndContext(tempExp, updatedLogs, recallScores).contents,
        category: tempExp.category,
        model: selectedModel,
        systemInstruction: tempExp.customSystemPrompt,
        characterState: tempExp.character,
        world: tempExp.gameWorldState,
        rulesMode: rulesModeOf(tempExp),
        diceRoll,
        storyOutline: tempExp.storyOutline,
        inspiration: tempExp.inspiration
      });

      const dmMsg: LogMessage = {
        id: `msg_${uid()}`,
        sender: 'dm',
        text: data.text || 'The Game Master pauses thoughtfully...',
        timestamp: new Date().toISOString(),
        modelUsed: data.modelUsed || selectedModel,
        suggestedActions: data.suggestedActions && data.suggestedActions.length > 0
          ? data.suggestedActions
          : getCategoryFallbackActions(experience.category)
      };

      // Check for Course Changing Alert & Required Check
      const newAlert: CourseChangeAlert | null = data.courseChangeAlert || null;
      const newCheck: PendingCheck | null = data.requiredCheck || null;

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
      // The player may have left this campaign while the reply was on its way (S4).
      if (finalExp.id !== tempExp.id) return;
      const mode = rulesModeOf(finalExp);

      // 3. Hero sheet, world and alerts, all through the rules module.
      const sheet = applyDelta(finalExp.character, data.stateDelta, mode);
      const updatedChar = { ...sheet.character };
      if (evoAvatarResult?.avatarUrl) {
        updatedChar.avatarUrl = evoAvatarResult.avatarUrl;
        if (evoNewDesc) updatedChar.physicalDescription = evoNewDesc;
      }
      const alerts = data.alerts ?? (newAlert ? [newAlert] : []);
      const world = applyWorld(finalExp, data.stateDelta, alerts);
      const ruleNotes: LogMessage[] = sheet.notes.map((text) => ({ id: `msg_${uid()}`, sender: 'system', text: `🎲 ${text}`, timestamp: new Date().toISOString() }));
      // Full 5e: dropping to 0 HP starts death saves, which take over the check slot.
      const deathCheck: PendingCheck | null = sheet.downed
        ? { skill: 'Death Saving Throw', dc: 10, reason: 'The hero is down at 0 HP.', kind: 'death_save' }
        : null;

      // Trigger alert sound if course change alert or required check was fired
      if ((newAlert || newCheck || deathCheck || data.avatarEvolution?.evolved) && soundEnabled) {
        playAlertSound();
      }

      const turnNumber = finalExp.logs.filter((l) => l.sender === 'player').length;
      let memory = memoryFromTurn(experienceMemory(finalExp), turnNumber, data.stateDelta, null);
      for (const a of alerts) memory = memoryFromTurn(memory, turnNumber, null, a);
      const afterTurn: Experience = {
        ...finalExp,
        character: updatedChar,
        ...world,
        memory,
        logs: [...finalExp.logs, dmMsg, ...ruleNotes],
        activeAlert: nextAlert(checkResolved ? null : finalExp.activeAlert, newAlert),
        pendingCheck: deathCheck || newCheck || (checkResolved ? null : finalExp.pendingCheck)
      };
      onUpdateExperience(afterTurn);
      // The memory worker runs after the reply is on screen, so it never slows a turn.
      void maybeSummarizeExperience(afterTurn, complete).then((apply) => {
        if (apply && latestExpRef.current.id === afterTurn.id) onUpdateExperience(apply(latestExpRef.current));
      });
    } catch (err: any) {
      console.error('Narrative turn error:', err);
      const isLoadError = err.message === 'Load failed' || err.message === 'Failed to fetch';
      const cleanMessage = isLoadError
        ? 'Network connectivity issue. Please check your connection and try sending your turn again.'
        : (err.message || 'Failed to reach AI Game Master.');

      const errLog: LogMessage = {
        id: `msg_err_${uid()}`,
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

  // Rules Referee: its own prompt and the real hero sheet. Its exchange is kept out of
  // the narrator's transcript (S13).
  const handleAdjudicateAction = async (actionText: string) => {
    if (isGeneratingRef.current) return;

    const currentExp = latestExpRef.current;
    const playerMsg: LogMessage = {
      id: `msg_${uid()}`,
      sender: 'player',
      text: `${REFEREE_PREFIX} ${actionText}`,
      timestamp: new Date().toISOString()
    };
    onUpdateExperience({ ...currentExp, logs: [...currentExp.logs, playerMsg] });
    setIsGenerating(true);

    try {
      const data = await refereeAdjudicate({
        action: actionText,
        character: currentExp.character,
        category: currentExp.category,
        rulesMode: rulesModeOf(currentExp),
        world: currentExp.gameWorldState
      });
      const finalExp = latestExpRef.current;
      if (finalExp.id !== currentExp.id) return;
      onUpdateExperience({
        ...finalExp,
        logs: [...finalExp.logs, { id: `msg_${uid()}`, sender: 'adjudicator', text: data.text || 'No ruling came back. Try again.', timestamp: new Date().toISOString(), modelUsed: data.modelUsed }]
      });
    } catch (err: any) {
      const finalExp = latestExpRef.current;
      onUpdateExperience({ ...finalExp, logs: [...finalExp.logs, { id: `msg_err_${uid()}`, sender: 'system', text: `⚠️ System Note: ${err?.message || 'The Rules Referee could not answer.'}`, timestamp: new Date().toISOString() }] });
    } finally {
      setIsGenerating(false);
    }
  };

  /** Rolls a check under the campaign's rules mode. */
  const rollCheck = (check: PendingCheck) => {
    const exp = latestExpRef.current;
    if (check.kind === 'death_save') {
      setActiveRoll(rollPlan({ ability: 'con', modifier: 0, proficient: false, formula: '1d20', breakdown: 'no modifier' }, 'Death Saving Throw (DC 10)'));
      return;
    }
    const plan = planCheck(exp.character, check.skill, check.stat, rulesModeOf(exp), check.roll);
    const roll = rulesModeOf(exp) === 'full5e' ? check.roll ?? 'normal' : 'normal';
    setActiveRoll(rollPlan(plan, `${check.skill} check (DC ${check.dc}), ${plan.breakdown}${roll !== 'normal' ? `, ${roll}` : ''}`, roll));
  };

  // Stat Roll Trigger. While a check is pending every roll button rolls that check (S7).
  const handleRollStat = (statName: string, modifier: number) => {
    const pending = latestExpRef.current.pendingCheck;
    if (pending) {
      rollCheck(pending);
      return;
    }
    setActiveRoll(rollDice(`1d20${modifier >= 0 ? '+' : ''}${modifier}`, `${statName} Check`));
  };

  // Quick Roll D20
  const handleQuickRollD20 = () => {
    handleRollStat('d20 Check', 0);
  };

  // Handle Forced Check Roll
  const handlePerformCheckRoll = (check: PendingCheck) => rollCheck(check);

  // Apply dice roll to story and ask Game Master to narrate consequences
  const handleApplyRoll = (result: DiceRollResult) => {
    setActiveRoll(null);
    const exp = latestExpRef.current;
    const currentCheck = exp.pendingCheck;

    if (currentCheck?.kind === 'death_save') {
      const natural = naturalOf(result);
      const saved = deathSave(exp.character.deathSaves ?? { successes: 0, failures: 0 }, natural);
      const character = {
        ...exp.character,
        deathSaves: saved.result === 'continue' ? saved.saves : undefined,
        hp: saved.result === 'revived' ? 1 : exp.character.hp
      };
      const dead = saved.result === 'dead';
      const nextCheck: PendingCheck | null = saved.result === 'continue' ? currentCheck : null;
      onUpdateExperience({
        ...exp,
        character,
        pendingCheck: nextCheck,
        concluded: dead ? { reason: 'death', at: new Date().toISOString() } : exp.concluded ?? null
      });
      if (saved.result !== 'continue') {
        // Let the state land before the narrator hears about it.
        setTimeout(() => handleSendMessage(`🎲 [DEATH SAVE] ${saved.text} Narrate what happens.`, result, true), 0);
      } else {
        const exp2 = latestExpRef.current;
        onUpdateExperience({ ...exp2, logs: [...exp2.logs, { id: `msg_${uid()}`, sender: 'system', text: `🎲 ${saved.text}`, timestamp: new Date().toISOString(), diceRoll: result }] });
      }
      return;
    }

    let rollPrompt = '';
    if (currentCheck) {
      const outcome = checkOutcome(result.total, currentCheck.dc, naturalOf(result));
      rollPrompt = `🎲 [CHECK RESULT: ${currentCheck.skill}] Rolled ${result.total} (${result.formula}): **${outcome.text}**\nReason: ${currentCheck.reason}\n\nNarrate the outcome and its immediate consequences.`;
    } else {
      rollPrompt = `🎲 [DICE ROLL] I rolled ${result.reason || 'a check'} (${result.formula}) -> Total: ${result.total}. Narrate what this roll means.`;
    }

    handleSendMessage(rollPrompt, result, !!currentCheck);
  };

  // Dismiss Course Change Alert. The chapter already advanced when the transition arrived.
  const handleDismissAlert = () => {
    onUpdateExperience({ ...latestExpRef.current, activeAlert: null });
  };

  return (
    <div
      className="min-h-[calc(100dvh-56px)] text-slate-200 p-2 sm:p-4 lg:p-6 space-y-3 sm:space-y-4"
      style={{
        ...(skinVars(skin) as React.CSSProperties),
        // The category skin (D&D skins are per category): background, pattern and accent.
        background: 'color-mix(in srgb, var(--sk-bg) 70%, #0F0F12)',
        backgroundImage: 'var(--sk-pattern)',
        backgroundSize: 'var(--sk-pattern-size)'
      }}
    >
      
      {/* Top Experience Sub-Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-[#111118] border border-white/10 shadow-xl" style={{ borderTop: '2px solid var(--sk-accent)' }}>
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
                <h2 className="text-xs sm:text-base font-bold truncate max-w-[180px] xs:max-w-[240px] sm:max-w-none" style={{ fontFamily: 'var(--sk-font-heading)', color: 'var(--sk-accent)' }}>
                  {experience.title} <span className="text-amber-500/80 font-normal">| {(experience.book ?? 1) > 1 ? `Book ${experience.book}, ` : ''}Chapter {experience.gameWorldState.currentChapter || 1} of {experience.storyOutline?.chapters?.length || 3}</span>
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
          <label className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-slate-400">
            Rules
            <select
              value={mode}
              onChange={(e) => {
                const next = e.target.value as RulesMode;
                if (next === mode) return;
                if (!window.confirm(`Switch this campaign to ${RULES_MODES[next].name}? ${RULES_MODES[next].blurb}`)) return;
                const cur = latestExpRef.current;
                onUpdateExperience({
                  ...cur,
                  rulesMode: next,
                  character: next === 'full5e' ? { ...cur.character, xp: cur.character.xp ?? 0, gold: cur.character.gold ?? 0 } : { ...cur.character, deathSaves: undefined },
                  pendingCheck: cur.pendingCheck?.kind === 'death_save' ? null : cur.pendingCheck
                });
              }}
              className="bg-transparent text-slate-200 focus:outline-none"
              aria-label="Rules mode for this campaign"
            >
              {(Object.keys(RULES_MODES) as RulesMode[]).map((m) => (
                <option key={m} value={m} style={{ background: '#111' }}>{RULES_MODES[m].name}</option>
              ))}
            </select>
          </label>

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
            activeModelName={lastAnsweredBy}
            experienceCategory={experience.category}
            pendingCheck={experience.pendingCheck}
            activeAlert={experience.activeAlert}
            onDismissAlert={handleDismissAlert}
            onPerformCheckRoll={handlePerformCheckRoll}
            characterStats={experience.character.stats}
            checkModifierLabel={pendingPlan ? `${pendingPlan.formula.replace(/^\S*d20(kh1|kl1)?/, '') || '+0'}: ${pendingPlan.breakdown}${experience.pendingCheck?.roll && mode === 'full5e' ? `, ${experience.pendingCheck.roll}` : ''}` : undefined}
            lockedReason={lockedReason}
            lockedAction={
              onStartBookTwo ? (
                <button type="button" onClick={continueBook} disabled={continuing} className="px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-black font-semibold disabled:opacity-50">
                  {continuing ? 'Writing the next book…' : `Continue to Book ${(experience.book ?? 1) + 1}`}
                </button>
              ) : null
            }
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
            rulesMode={mode}
          />
          <details className="mt-4 rounded-lg border border-white/10 bg-[#0A0A0F] p-3">
            <summary className="cursor-pointer text-xs font-semibold text-amber-400">
              Memory{experienceMemory(experience).pending.length ? ` (${experienceMemory(experience).pending.length} new)` : ''}
            </summary>
            <div className="pt-3 text-slate-200">
              <MemoryPanel
                memory={experienceMemory(experience)}
                meter={memoryMeter}
                turn={experience.logs.filter((l) => l.sender === 'player').length}
                onChange={(memory) => onUpdateExperience({ ...latestExpRef.current, memory })}
                onMerge={async () => {
                  const cur = latestExpRef.current;
                  try {
                    const r = await mergeMemories(experienceMemory(cur), cur.logs.length, complete);
                    if (!r.ok) return 'The model did not send a usable list, so nothing changed. Try again.';
                    const latest = latestExpRef.current;
                    onUpdateExperience({ ...latest, memory: { ...experienceMemory(latest), entries: r.memory.entries } });
                    return null;
                  } catch (e) {
                    return e instanceof Error ? e.message : String(e);
                  }
                }}
              />
            </div>
          </details>
        </div>

      </div>

      {/* Dice Roll Modal */}
      {activeRoll && (
        <DiceRollModal
          rollResult={activeRoll}
          onClose={() => setActiveRoll(null)}
          onApplyRoll={handleApplyRoll}
          soundEnabled={soundEnabled}
          mandatory={!!experience.pendingCheck}
        />
      )}

      {/* Story Conclusion Modal */}
      {experience.activeAlert?.type === 'story_conclusion' && (
        <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-center justify-center p-4" {...endDialog.overlayProps}>
          <div className="bg-[#111118] border border-amber-500/30 rounded-xl p-6 sm:p-8 max-w-lg w-full text-center space-y-6 shadow-2xl relative overflow-hidden" {...endDialog.dialogProps}>
            <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 via-transparent to-purple-900/10 pointer-events-none" />
            
            <Sparkles className="w-12 h-12 text-amber-400 mx-auto animate-pulse" />
            
            <div className="space-y-2 relative z-10">
              <h2 id="ending-title" className="text-2xl sm:text-3xl font-serif font-bold text-amber-50">
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
                  onClick={continueBook}
                  disabled={continuing}
                  className="disabled:opacity-50 w-full py-3 px-4 rounded-lg bg-amber-600 hover:bg-amber-500 text-black font-bold font-serif transition shadow-[0_0_15px_rgba(217,119,6,0.3)] hover:shadow-[0_0_25px_rgba(217,119,6,0.5)] flex items-center justify-center gap-2"
                >
                  <Layers className="w-5 h-5" />
                  {continuing ? 'Writing the next book…' : `Continue to Book ${(experience.book ?? 1) + 1}`}
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
