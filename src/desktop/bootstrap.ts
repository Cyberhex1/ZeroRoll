/**
 * PC app start-up: start the local model if the player left it on, and stop the router
 * from calling a port from an earlier session. The Rust side stops llama-server on exit.
 */
import { invoke } from '@tauri-apps/api/core';
import { getLocalModelSettings, saveLocalModelSettings, LlamaStatus } from './localModel';
import { reportAINotice } from '../lib/aiStatus';

export async function bootstrapDesktop(): Promise<void> {
  const s = getLocalModelSettings();
  saveLocalModelSettings({ ...s, baseUrl: undefined });
  if (!s.enabled || !s.serverPath || !s.modelPath) return;
  try {
    const status = await invoke<LlamaStatus>('start_llama', { server: s.serverPath, model: s.modelPath, context: s.context ?? 8192 });
    saveLocalModelSettings({ ...getLocalModelSettings(), baseUrl: status.base_url ?? undefined });
  } catch (err) {
    reportAINotice('Local model', `The local model did not start: ${err instanceof Error ? err.message : String(err)} Quick replies use your AI provider instead.`);
  }
}
