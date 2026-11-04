import { describe, it, expect } from 'vitest';
import { suggestModelUpdates, parseGemini, parseAnthropic, formatSuggestions } from '../modelCheck';

describe('model check', () => {
  it('parses Gemini and Claude ids', () => {
    expect(parseGemini('gemini-3.8-flash')).toEqual({ family: 'flash', version: [3, 8], preview: false });
    expect(parseGemini('gemini-3.5-flash-lite')?.family).toBe('flash-lite');
    expect(parseGemini('gemini-3.1-pro-preview')?.preview).toBe(true);
    expect(parseGemini('gemini-flash-latest')).toBeNull();
    expect(parseAnthropic('claude-sonnet-5-5')).toEqual({ family: 'sonnet', version: [5, 5], preview: false });
    expect(parseAnthropic('claude-opus-5')?.version).toEqual([5, 0]);
  });

  it('suggests a newer stable release in the same family', () => {
    const s = suggestModelUpdates('gemini', { basic: 'gemini-3.5-flash-lite' }, ['gemini-3.5-flash-lite', 'gemini-3.9-flash-lite', 'gemini-4.0-flash-lite-preview', 'gemini-4.0-flash']);
    expect(s).toEqual([{ provider: 'gemini', tier: 'basic', current: 'gemini-3.5-flash-lite', suggested: 'gemini-3.9-flash-lite', reason: 'newer' }]);
  });

  it('treats previews as candidates only for a preview model', () => {
    const s = suggestModelUpdates('gemini', { best: 'gemini-3.1-pro-preview' }, ['gemini-3.1-pro-preview', 'gemini-3.4-pro-preview']);
    expect(s[0]?.suggested).toBe('gemini-3.4-pro-preview');
  });

  it('flags a retired model with its closest replacement', () => {
    const s = suggestModelUpdates('anthropic', { good: 'claude-sonnet-5-5' }, ['claude-sonnet-6', 'claude-haiku-5-5']);
    expect(s).toEqual([{ provider: 'anthropic', tier: 'good', current: 'claude-sonnet-5-5', suggested: 'claude-sonnet-6', reason: 'retired' }]);
  });

  it('leaves aliases alone while they exist, and reports nothing when current', () => {
    expect(suggestModelUpdates('gemini', { good: 'gemini-flash-latest' }, ['gemini-flash-latest', 'gemini-9-flash'])).toEqual([]);
    expect(formatSuggestions([])).toMatch(/current/);
  });

  it('checks providers without version parsing for retirement only', () => {
    expect(suggestModelUpdates('openai', { good: 'gpt-5' }, ['gpt-6'])).toEqual([
      { provider: 'openai', tier: 'good', current: 'gpt-5', suggested: null, reason: 'retired' }
    ]);
  });
});
