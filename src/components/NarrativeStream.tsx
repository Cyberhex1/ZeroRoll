import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Dices, 
  Bot, 
  User as UserIcon, 
  ShieldAlert, 
  Sparkles, 
  Flame, 
  ScrollText, 
  HelpCircle,
  Clock,
  AlertTriangle,
  Zap,
  Lock,
  XCircle,
  CheckCircle2,
  Volume2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { LogMessage, DiceRollResult, PendingCheck, CourseChangeAlert, StatBlock } from '../types';
import { getCategoryIcon } from '../lib/categoryIcons';

interface NarrativeStreamProps {
  logs: LogMessage[];
  onSendMessage: (text: string) => void;
  onAdjudicateAction: (text: string) => void;
  onQuickRollD20: () => void;
  isGenerating: boolean;
  activeModelName: string;
  experienceCategory?: string;
  pendingCheck?: PendingCheck | null;
  activeAlert?: CourseChangeAlert | null;
  onDismissAlert?: () => void;
  onPerformCheckRoll?: (check: PendingCheck) => void;
  characterStats?: StatBlock;
}

export const NarrativeStream: React.FC<NarrativeStreamProps> = ({
  logs,
  onSendMessage,
  onAdjudicateAction,
  onQuickRollD20,
  isGenerating,
  activeModelName,
  experienceCategory,
  pendingCheck,
  activeAlert,
  onDismissAlert,
  onPerformCheckRoll,
  characterStats
}) => {
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs, isGenerating, pendingCheck, activeAlert]);

  const handleSend = () => {
    if (pendingCheck || !inputText.trim() || isGenerating) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleAdjudicate = () => {
    if (pendingCheck || !inputText.trim() || isGenerating) return;
    onAdjudicateAction(inputText.trim());
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!pendingCheck) {
        handleSend();
      }
    }
  };

  // Helper to determine stat and modifier
  const getSkillModInfo = (check: PendingCheck) => {
    if (!characterStats) return { statKey: 'D20', modifier: 0 };
    let key: keyof StatBlock = 'wis';
    const s = check.skill.toLowerCase();
    if (check.stat && check.stat.toLowerCase() in characterStats) {
      key = check.stat.toLowerCase() as keyof StatBlock;
    } else if (s.includes('athlet') || s.includes('strength') || s.includes('lift') || s.includes('climb')) {
      key = 'str';
    } else if (s.includes('acrobat') || s.includes('stealth') || s.includes('dexter') || s.includes('dodge') || s.includes('sleight') || s.includes('reflex')) {
      key = 'dex';
    } else if (s.includes('constitut') || s.includes('enduran') || s.includes('poison') || s.includes('stamina')) {
      key = 'con';
    } else if (s.includes('arcana') || s.includes('histor') || s.includes('investig') || s.includes('nature') || s.includes('relig') || s.includes('intel')) {
      key = 'int';
    } else if (s.includes('persua') || s.includes('decept') || s.includes('intimid') || s.includes('perform') || s.includes('charm') || s.includes('cha')) {
      key = 'cha';
    } else {
      key = 'wis';
    }

    const statVal = characterStats[key] ?? 10;
    const mod = Math.floor((statVal - 10) / 2);
    return { statKey: key.toUpperCase(), modifier: mod };
  };

  return (
    <div className="flex flex-col h-[600px] lg:h-[720px] rounded-lg bg-[#111118] border border-white/10 shadow-2xl overflow-hidden text-slate-200">
      
      {/* Stream Header */}
      <div className="px-4 py-2.5 bg-[#16161D] border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-white/5 text-amber-400 border border-white/10">
            {getCategoryIcon(experienceCategory, "w-4 h-4 text-amber-400")}
          </div>
          <div>
            <h3 className="text-xs font-serif font-bold text-amber-50">Narrative Experience Log</h3>
            <p className="text-[9px] text-slate-400 font-mono uppercase tracking-wider">
              {experienceCategory ? `${experienceCategory.replace('_', ' ')} • Real-Time Engine` : 'AI Game Master • Real-Time Engine'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {pendingCheck && (
            <span className="px-2 py-0.5 rounded bg-red-950/80 border border-red-600/50 text-[10px] font-mono text-red-300 font-bold flex items-center gap-1 animate-pulse">
              <Lock className="w-3 h-3 text-red-400" />
              Check Required: DC {pendingCheck.dc}
            </span>
          )}

          <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-amber-300 flex items-center gap-1.5">
            <Bot className="w-3 h-3 text-amber-400" />
            {activeModelName}
          </span>
        </div>
      </div>

      {/* Course-Changing Trigger Alert Banner */}
      {activeAlert && (
        <div className="p-3.5 bg-gradient-to-r from-red-950/90 via-amber-950/80 to-purple-950/90 border-b border-amber-500/40 text-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl animate-fadeIn">
          <div className="flex items-start gap-2.5">
            <div className="p-2 rounded bg-amber-500/20 border border-amber-400/40 text-amber-300 shrink-0 mt-0.5 animate-pulse">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-red-600 text-white">
                  Course-Changing Trigger
                </span>
                <span className="text-xs font-serif font-bold text-amber-200">
                  {activeAlert.title}
                </span>
              </div>
              <p className="text-xs text-amber-100/90 font-medium">
                {activeAlert.subtitle}
              </p>
              {activeAlert.description && (
                <p className="text-[11px] text-slate-300/80 italic">
                  {activeAlert.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            {onDismissAlert && (
              <button
                onClick={onDismissAlert}
                className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 border border-white/15 text-xs text-slate-200 font-semibold transition"
              >
                Acknowledge
              </button>
            )}
          </div>
        </div>
      )}

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0A0A0F]">
        {logs.map((log) => {
          const isPlayer = log.sender === 'player';
          const isAdjudicator = log.sender === 'adjudicator';

          return (
            <div
              key={log.id}
              className={`flex gap-2.5 ${isPlayer ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar Icon */}
              <div className={`w-7 h-7 rounded flex items-center justify-center shrink-0 font-bold text-xs shadow ${
                isPlayer 
                  ? 'bg-amber-600 text-black' 
                  : isAdjudicator
                  ? 'bg-purple-900 border border-purple-500 text-purple-200'
                  : 'bg-white/5 border border-white/10 text-amber-400'
              }`}>
                {isPlayer ? (
                  <UserIcon className="w-3.5 h-3.5" />
                ) : isAdjudicator ? (
                  <ShieldAlert className="w-3.5 h-3.5" />
                ) : (
                  getCategoryIcon(experienceCategory, "w-3.5 h-3.5 text-amber-400")
                )}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-[85%] sm:max-w-[78%] space-y-1.5`}>
                <div className={`flex items-center gap-2 text-[9px] font-mono text-slate-500 ${isPlayer ? 'justify-end' : 'justify-start'}`}>
                  <span className="uppercase tracking-wider font-bold">
                    {isPlayer ? 'Player Action' : isAdjudicator ? 'Rules Referee' : 'Game Master'}
                  </span>
                  <span>•</span>
                  <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                <div className={`p-3 rounded text-xs sm:text-sm leading-relaxed ${
                  isPlayer
                    ? 'bg-amber-950/70 border border-amber-600/40 text-amber-100 rounded-tr-none'
                    : isAdjudicator
                    ? 'bg-purple-950/70 border border-purple-600/40 text-purple-100 rounded-tl-none font-mono text-xs'
                    : 'bg-[#111118] border border-white/10 text-slate-200 rounded-tl-none shadow-md'
                }`}>
                  {isPlayer ? (
                    <div className="whitespace-pre-wrap">{log.text}</div>
                  ) : (
                    <div className="prose prose-invert max-w-none text-xs sm:text-sm leading-relaxed text-slate-200">
                      <ReactMarkdown
                        components={{
                          p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                          strong: ({ node, ...props }) => <strong className="text-amber-400 font-semibold" {...props} />,
                          em: ({ node, ...props }) => <em className="text-slate-300 italic" {...props} />,
                          ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                          ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
                          li: ({ node, ...props }) => <li className="text-slate-300" {...props} />,
                          h1: ({ node, ...props }) => <h1 className="text-base font-bold text-amber-100 mt-2 mb-1 font-serif" {...props} />,
                          h2: ({ node, ...props }) => <h2 className="text-sm font-bold text-amber-100 mt-2 mb-1 font-serif" {...props} />,
                          h3: ({ node, ...props }) => <h3 className="text-xs font-bold text-amber-100 mt-2 mb-1 font-serif" {...props} />,
                        }}
                      >
                        {log.text}
                      </ReactMarkdown>
                    </div>
                  )}

                  {/* Embedded Dice Roll Result Card */}
                  {log.diceRoll && (
                    <div className="mt-2.5 p-2.5 rounded bg-[#0A0A0F] border border-amber-600/30 font-mono text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-semibold text-[11px]">{log.diceRoll.reason}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.diceRoll.isNat20
                            ? 'bg-amber-500 text-black animate-bounce'
                            : log.diceRoll.isNat1
                            ? 'bg-red-600 text-white'
                            : 'bg-white/10 text-amber-300 border border-white/10'
                        }`}>
                          {log.diceRoll.isNat20 ? 'CRITICAL SUCCESS! (NAT 20)' : log.diceRoll.isNat1 ? 'CRITICAL FAILURE! (NAT 1)' : `Total: ${log.diceRoll.total}`}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Formula: {log.diceRoll.formula} • Rolls: [{log.diceRoll.rolls.join(', ')}] {log.diceRoll.modifier ? `+ ${log.diceRoll.modifier}` : ''}
                      </div>
                    </div>
                  )}
                </div>

                {/* Suggested Action Chips (Hidden if pending check) */}
                {!pendingCheck && log.suggestedActions && log.suggestedActions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {log.suggestedActions.map((sa, idx) => (
                      <button
                        key={idx}
                        onClick={() => onSendMessage(sa)}
                        className="text-[11px] bg-white/5 hover:bg-amber-500/10 text-amber-300 hover:text-amber-200 border border-white/10 hover:border-amber-500/50 px-2.5 py-1 rounded transition text-left shadow-sm flex items-center gap-1.5"
                      >
                        <span className="text-amber-500 font-bold">›</span>
                        <span>{sa}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isGenerating && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-white/5 border border-white/10 text-amber-400 flex items-center justify-center">
              {getCategoryIcon(experienceCategory, "w-3.5 h-3.5 animate-spin text-amber-400")}
            </div>
            <div className="p-2.5 rounded bg-[#111118] border border-white/10 text-xs text-amber-300 font-mono flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>AI Game Master is composing narrative...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Action Bar Input Area with Forced Roll Barrier */}
      <div className="p-3 bg-[#16161D] border-t border-white/10 space-y-2">
        
        {/* MANDATORY CHECK REQUIRED BARRIER */}
        {pendingCheck ? (
          <div className="p-3.5 rounded-lg bg-gradient-to-r from-red-950/90 via-amber-950/70 to-slate-900 border-2 border-amber-500/80 shadow-2xl space-y-2.5 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-amber-500 text-black font-bold">
                  <Lock className="w-3.5 h-3.5" />
                </span>
                <span className="text-xs font-serif font-bold text-amber-200 uppercase tracking-wide">
                  Mandatory Check Required
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                DC {pendingCheck.dc} • {pendingCheck.difficultyLabel || 'Medium'}
              </span>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed font-sans">
              <strong className="text-amber-300">{pendingCheck.skill} Check:</strong> {pendingCheck.reason}
            </p>

            {/* Big Action Roll Button */}
            {(() => {
              const { statKey, modifier } = getSkillModInfo(pendingCheck);
              return (
                <button
                  onClick={() => onPerformCheckRoll && onPerformCheckRoll(pendingCheck)}
                  className="w-full py-2.5 px-4 rounded bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-amber-500/20 transition transform hover:-translate-y-0.5"
                >
                  <Dices className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Roll {pendingCheck.skill} (d20 {modifier >= 0 ? `+ ${modifier}` : `- ${Math.abs(modifier)}`} [{statKey}])</span>
                </button>
              );
            })()}

            <p className="text-[10px] text-center text-slate-400 italic">
              Free-form actions are paused until this check is resolved.
            </p>
          </div>
        ) : (
          /* Normal Action Bar */
          <div className="relative flex items-center gap-2">
            <textarea
              rows={2}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your hero's action or dialogue (e.g. 'I cast Shield and draw my blade...')"
              className="flex-1 bg-[#0A0A0F] border border-white/10 rounded p-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-600/50 leading-relaxed resize-none"
            />

            <div className="flex flex-col gap-1">
              <button
                onClick={handleSend}
                disabled={!inputText.trim() || isGenerating}
                className="p-2.5 rounded bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-black font-bold transition shadow"
                title="Send Turn"
              >
                <Send className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleAdjudicate}
                disabled={!inputText.trim() || isGenerating}
                className="p-2.5 rounded bg-purple-900/80 hover:bg-purple-800 disabled:opacity-40 text-purple-200 border border-purple-700/50 transition"
                title="Rules Referee Check (Adjudicate Action)"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Quick Toolbar */}
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-0.5">
          <div className="flex items-center gap-2">
            <button
              onClick={onQuickRollD20}
              className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-amber-300 font-bold flex items-center gap-1 transition"
            >
              <Dices className="w-3 h-3 text-amber-400" />
              Roll d20
            </button>
            <span className="hidden sm:inline">Press Enter to send</span>
          </div>

          <div className="uppercase tracking-widest text-[9px]">
            Real-Time Adjudication Engine
          </div>
        </div>
      </div>

    </div>
  );
};
