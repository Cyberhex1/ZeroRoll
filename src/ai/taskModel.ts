/**
 * Which Gemini model a short task uses. Free keys get about 20 Flash requests a day but about
 * 500 Flash-Lite requests, so name rolls, seed lists and the Rules Referee go to the basic-tier
 * model (Flash-Lite) even when the player picked Flash for the story itself.
 */
import modelsJson from './models.json';
import { getUsableGeminiModels } from './transport';
import { isModelOut } from './quota';
import { getLadderPatch } from './weeklyModelCheck';

export function geminiBasicModel(playerModel: string): string {
  // The player already picked a Flash-Lite model: keep it.
  if (/flash-lite/.test(playerModel)) return playerModel;
  const ladder = (modelsJson as { providers: { gemini?: { basic?: string } } }).providers.gemini;
  const basic = getLadderPatch('gemini').basic || ladder?.basic;
  if (!basic) return playerModel;
  const usable = getUsableGeminiModels();
  if (usable && usable.length && !usable.includes(basic)) {
    // The ladder's basic model doesn't work with this key; use any Flash-Lite that does.
    return usable.find((m) => /flash-lite/.test(m) && !isModelOut(m)) || playerModel;
  }
  return isModelOut(basic) ? playerModel : basic;
}
