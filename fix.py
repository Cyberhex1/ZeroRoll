import os

with open('src/lib/geminiService.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Imports
content = content.replace("import { GoogleGenAI } from '@google/genai';", "import { getAI, getGenerativeModel, AgentPlatformBackend } from 'firebase/ai';\nimport { app } from './firebase';")
content = content.replace("import firebaseConfig from '../../firebase-applet-config.json';\n", "")

# 2. Model resolution
content = content.replace("if (clean.includes('pro')) return 'gemini-3.1-pro-preview';", "if (clean.includes('pro')) return 'gemini-2.5-pro';")

# 3. API Key methods
content = content.replace("""export function getStoredApiKey(): string {
  try {
    const custom = localStorage.getItem('dnd_gemini_api_key');
    if (custom && custom.trim()) return custom.trim();
    const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
    if (envKey && envKey.trim()) return envKey.trim();
    if (firebaseConfig && firebaseConfig.apiKey) return firebaseConfig.apiKey.trim();
  } catch (_) {}
  return '';
}""", """export function getStoredApiKey(): string {
  return '';
}""")

content = content.replace("""export function saveStoredApiKey(apiKey: string): void {
  try {
    if (apiKey && apiKey.trim()) {
      localStorage.setItem('dnd_gemini_api_key', apiKey.trim());
    } else {
      localStorage.removeItem('dnd_gemini_api_key');
    }
  } catch (_) {}
}""", """export function saveStoredApiKey(apiKey: string): void {
  // Deprecated
}""")

content = content.replace("""export function hasActiveGeminiKey(): boolean {
  return getStoredApiKey().length > 5;
}""", """export function hasActiveGeminiKey(): boolean {
  return true;
}""")

# 4. executeActionTurn
content = content.replace("const apiKey = getStoredApiKey();\n  const targetModel = resolveGeminiModelName(model);\n\n  // 1. Direct client-side Gemini AI Execution\n  if (apiKey) {\n    try {\n      const ai = new GoogleGenAI({ apiKey });", """  const targetModel = resolveGeminiModelName(model);

  // 1. Direct client-side Gemini AI Execution
  try {
    const ai = getAI(app, { backend: new AgentPlatformBackend() });""")

content = content.replace("""      const response = await ai.models.generateContent({
        model: targetModel,
        contents: [{ role: 'user', parts: [{ text: userMessage }] }],
        config: {
          systemInstruction: promptInstruction,
          temperature: 0.9
        }
      });""", """      const aiModel = getGenerativeModel(ai, { 
        model: targetModel,
        generationConfig: { temperature: 0.9 },
        systemInstruction: promptInstruction
      });
      const response = await aiModel.generateContent(userMessage);""")

content = content.replace("""      let text = response.text || '';""", """      let text = response.response.text() || '';""")

content = content.replace("""    } catch (err: any) {
      console.warn('Gemini API execution error:', err);
      // We explicitly throw here so the UI can display API errors (e.g., "API Not Enabled")
      throw new Error(`Gemini AI Error: ${err.message || 'Failed to generate content'}`);
    }
  }

  // Fallback procedural turn if NO api key is provided at all""", """    } catch (err: any) {
      console.warn('Vertex AI API execution error:', err);
      throw new Error(`Gemini AI Error: ${err.message || 'Failed to generate content'}`);
    }

  // Fallback procedural turn if Vertex AI fails""")

# 5. generateScenarioAI
content = content.replace("""  const apiKey = getStoredApiKey();
  const targetModel = resolveGeminiModelName(model);

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });""", """  const targetModel = resolveGeminiModelName(model);

  try {
    const ai = getAI(app, { backend: new AgentPlatformBackend() });
    const aiModel = getGenerativeModel(ai, { 
      model: targetModel,
      generationConfig: { temperature: 1.0 }
    });""")

content = content.replace("""      const response = await ai.models.generateContent({
        model: targetModel,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: 'application/json',
          temperature: 1.0
        }
      });

      const text = response.text || '{}';""", """      const response = await aiModel.generateContent(prompt);
      const text = response.response.text() || '{}';""")

content = content.replace("""    } catch (err: any) {
      console.warn('Gemini Scenario generation error:', err);
      throw new Error(`Gemini AI Error: ${err.message || 'Failed to generate scenario'}`);
    }
  }

  // Fallback to high-entropy procedural generator if NO key provided""", """    } catch (err: any) {
      console.warn('Vertex AI Scenario generation error:', err);
      throw new Error(`Gemini AI Error: ${err.message || 'Failed to generate scenario'}`);
    }

  // Fallback to high-entropy procedural generator if Vertex AI fails""")

# 6. generateSeedlistAI
content = content.replace("""  const apiKey = getStoredApiKey();
  const targetModel = resolveGeminiModelName(model);

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });""", """  const targetModel = resolveGeminiModelName(model);

  try {
    const ai = getAI(app, { backend: new AgentPlatformBackend() });
    const aiModel = getGenerativeModel(ai, { 
      model: targetModel,
      generationConfig: { temperature: 1.0 }
    });""")

content = content.replace("""      const response = await ai.models.generateContent({
        model: targetModel,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: 'application/json',
          temperature: 1.0
        }
      });

      const text = response.text || '{}';""", """      const response = await aiModel.generateContent(prompt);
      let text = response.response.text() || '{}';
      text = text.replace(/```json|```/g, '').trim();""")

content = content.replace("""    } catch (err: any) {
      console.warn('Gemini Seedlist generation error:', err);
      throw new Error(`Gemini AI Error: ${err.message || 'Failed to generate seedlist'}`);
    }
  }

  // Fallback to dynamic procedural seedlist if NO key provided""", """    } catch (err: any) {
      console.warn('Vertex AI Seedlist generation error:', err);
      throw new Error(`Gemini AI Error: ${err.message || 'Failed to generate seedlist'}`);
    }

  // Fallback to dynamic procedural seedlist if Vertex AI fails""")

# 7. rollSingleFieldAI
content = content.replace("""  const apiKey = getStoredApiKey();
  const targetModel = resolveGeminiModelName(model);

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });""", """  const targetModel = resolveGeminiModelName(model);

  try {
    const ai = getAI(app, { backend: new AgentPlatformBackend() });
    const aiModel = getGenerativeModel(ai, { 
      model: targetModel,
      generationConfig: { temperature: 1.0 }
    });""")

content = content.replace("""      const res = await ai.models.generateContent({
        model: targetModel,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: { temperature: 1.0 }
      });

      const text = res.text?.trim().replace(/^["']|["']$/g, '');""", """      const res = await aiModel.generateContent(prompt);
      const text = res.response.text()?.trim().replace(/^["']|["']$/g, '');""")

content = content.replace("""    } catch (err: any) {
      console.warn('Gemini Roll Field error:', err);
      throw new Error(`Gemini AI Error: ${err.message || 'Failed to roll field'}`);
    }
  }

  // Fallback if NO key provided""", """    } catch (err: any) {
      console.warn('Vertex AI Roll Field error:', err);
      throw new Error(`Gemini AI Error: ${err.message || 'Failed to roll field'}`);
    }

  // Fallback if Vertex AI fails""")

# 8. generateAvatarAI
content = content.replace("""  const apiKey = getStoredApiKey();

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });""", """  try {
    const ai = getAI(app, { backend: new AgentPlatformBackend() });
    const aiModel = getGenerativeModel(ai, { 
      model: 'gemini-2.5-flash',
      generationConfig: { temperature: 0.8 }
    });""")

content = content.replace("""      const res = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: { temperature: 0.8 }
      });

      const text = res.text?.trim() || '';""", """      const res = await aiModel.generateContent(prompt);
      const text = res.response.text()?.trim() || '';""")

content = content.replace("""    } catch (err: any) {
      console.warn('Gemini Avatar generation error:', err);
      throw new Error(`Gemini AI Error: ${err.message || 'Failed to generate avatar'}`);
    }
  }

  // Beautiful geometric avatar fallback if NO key provided""", """  } catch (err: any) {
    console.warn('Vertex AI Avatar generation error:', err);
    throw new Error(`Gemini AI Error: ${err.message || 'Failed to generate avatar'}`);
  }

  // Beautiful geometric avatar fallback if Vertex AI fails""")


with open('src/lib/geminiService.ts', 'w', encoding='utf-8') as f:
    f.write(content)
