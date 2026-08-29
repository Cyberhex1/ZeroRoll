import { DiceRollResult } from '../types';

/**
 * Parses standard notation e.g. "1d20+5", "2d6+3", "1d8", "d20"
 */
export function rollDice(formula: string, reason?: string): DiceRollResult {
  const normalized = formula.toLowerCase().replace(/\s+/g, '');
  const match = normalized.match(/^(\d*)d(\d+)(?:([+-])(\d+))?$/);

  if (!match) {
    // Default 1d20 fallback
    const roll = Math.floor(Math.random() * 20) + 1;
    return {
      formula: '1d20',
      rolls: [roll],
      modifier: 0,
      total: roll,
      isNat20: roll === 20,
      isNat1: roll === 1,
      reason: reason || 'Action Check'
    };
  }

  const count = parseInt(match[1] || '1', 10);
  const sides = parseInt(match[2], 10);
  const sign = match[3] || '+';
  const modValue = match[4] ? parseInt(match[4], 10) : 0;
  const modifier = sign === '-' ? -modValue : modValue;

  const rolls: number[] = [];
  let sum = 0;

  for (let i = 0; i < count; i++) {
    const val = Math.floor(Math.random() * sides) + 1;
    rolls.push(val);
    sum += val;
  }

  const total = sum + modifier;
  const isD20 = sides === 20 && count === 1;

  return {
    formula,
    rolls,
    modifier,
    total,
    isNat20: isD20 && rolls[0] === 20,
    isNat1: isD20 && rolls[0] === 1,
    reason: reason || `${formula} Roll`
  };
}

export function rollWithAdvantage(modifier: number = 0, advantageType: 'advantage' | 'disadvantage' = 'advantage', reason?: string): DiceRollResult {
  const roll1 = Math.floor(Math.random() * 20) + 1;
  const roll2 = Math.floor(Math.random() * 20) + 1;
  const selected = advantageType === 'advantage' ? Math.max(roll1, roll2) : Math.min(roll1, roll2);

  return {
    formula: `1d20${modifier >= 0 ? '+' : ''}${modifier} (${advantageType})`,
    rolls: [roll1, roll2],
    modifier,
    total: selected + modifier,
    isNat20: selected === 20,
    isNat1: selected === 1,
    reason: reason || `1d20 with ${advantageType}`
  };
}

/**
 * Web Audio API synthesizer for realistic dice rolling sound effects
 */
export function playDiceSound(isNat20: boolean = false, isNat1: boolean = false) {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    // Generate a series of small click/clatter impulses
    const numClatters = 6;
    for (let i = 0; i < numClatters; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(300 + Math.random() * 500, ctx.currentTime + i * 0.05);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + i * 0.05 + 0.04);

      gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.05 + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + i * 0.05);
      osc.stop(ctx.currentTime + i * 0.05 + 0.05);
    }

    // Special fanfare chord for Nat 20
    if (isNat20) {
      setTimeout(() => {
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.value = freq;

          gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.6);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(ctx.currentTime + idx * 0.08);
          osc.stop(ctx.currentTime + idx * 0.08 + 0.65);
        });
      }, 300);
    }
  } catch (e) {
    // Audio context muted or blocked
  }
}

/**
 * Dramatic warning sound for course-changing triggers and random surprise encounters
 */
export function playAlertSound() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    // Dramatic dual-pulse low horn / brass pulse
    [220, 293.66, 370].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.06);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.8, ctx.currentTime + i * 0.06 + 0.35);

      gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.06 + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + i * 0.06);
      osc.stop(ctx.currentTime + i * 0.06 + 0.45);
    });
  } catch (e) {}
}
