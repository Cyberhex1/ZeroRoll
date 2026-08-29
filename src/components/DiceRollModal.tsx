import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Dices, Sparkles, Trophy, Skull } from 'lucide-react';
import { DiceRollResult } from '../types';
import { playDiceSound } from '../lib/diceRoller';

interface DiceRollModalProps {
  rollResult: DiceRollResult | null;
  onClose: () => void;
  onApplyRoll?: (result: DiceRollResult) => void;
  soundEnabled?: boolean;
}

export const DiceRollModal: React.FC<DiceRollModalProps> = ({
  rollResult,
  onClose,
  onApplyRoll,
  soundEnabled = true
}) => {
  const [isRolling, setIsRolling] = useState(true);

  useEffect(() => {
    if (!rollResult) return;
    setIsRolling(true);

    if (soundEnabled) {
      playDiceSound(rollResult.isNat20, rollResult.isNat1);
    }

    const timer = setTimeout(() => {
      setIsRolling(false);
      if (rollResult.isNat20) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [rollResult, soundEnabled]);

  if (!rollResult) return null;

  const handleApply = () => {
    if (onApplyRoll && rollResult) {
      onApplyRoll(rollResult);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#111118] border border-white/10 rounded-lg max-w-sm w-full p-5 text-center space-y-4 shadow-2xl relative overflow-hidden text-slate-200">
        
        {/* Glow Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-purple-500/5 pointer-events-none" />

        <div className="space-y-1">
          <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-amber-400">
            {rollResult.reason || 'Dice Roll Check'}
          </span>
          <h3 className="text-lg font-bold text-amber-50 font-serif">
            {rollResult.formula}
          </h3>
        </div>

        {/* Animated Visual Dice Box */}
        <div className="py-4 flex items-center justify-center">
          <div className={`w-20 h-20 rounded bg-amber-600 text-black font-black font-mono text-3xl flex items-center justify-center shadow-xl transform transition-all duration-300 ${
            isRolling 
              ? 'animate-spin scale-90 opacity-80' 
              : rollResult.isNat20 
              ? 'scale-110 ring-2 ring-amber-300 ring-offset-2 ring-offset-[#0A0A0F] animate-bounce' 
              : rollResult.isNat1 
              ? 'bg-red-700 text-white ring-2 ring-red-500' 
              : ''
          }`}>
            {isRolling ? '?' : rollResult.total}
          </div>
        </div>

        {/* Outcome Breakdown */}
        {!isRolling && (
          <div className="space-y-2">
            {rollResult.isNat20 && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-600/40 text-[10px] font-bold font-mono uppercase tracking-wider">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                CRITICAL SUCCESS! (NAT 20)
              </div>
            )}

            {rollResult.isNat1 && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-800 text-[10px] font-bold font-mono uppercase tracking-wider">
                <Skull className="w-3.5 h-3.5 text-red-400" />
                CRITICAL FAILURE! (NAT 1)
              </div>
            )}

            <p className="text-[11px] text-slate-400 font-mono">
              Individual Rolls: [{rollResult.rolls.join(', ')}] {rollResult.modifier ? `+ ${rollResult.modifier}` : ''}
            </p>
          </div>
        )}

        <div className="space-y-2 pt-1">
          <button
            onClick={handleApply}
            className="w-full py-2.5 rounded bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs uppercase tracking-wider transition shadow flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Apply Roll to Story (Ask Game Master)
          </button>

          <button
            onClick={onClose}
            className="w-full py-1.5 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 text-[11px] font-mono transition"
          >
            Close / Log Result Only
          </button>
        </div>

      </div>
    </div>
  );
};
