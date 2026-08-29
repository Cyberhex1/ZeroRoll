const fs = require('fs');
let content = fs.readFileSync('src/lib/geminiService.ts', 'utf8');

// 1. Update imports
content = content.replace("import { GoogleGenAI } from '@google/genai';", "import { getVertexAI, getGenerativeModel } from 'firebase/vertexai';\nimport { app } from './firebase';");

// 2. Remove config import
content = content.replace("import firebaseConfig from '../../firebase-applet-config.json';", "");

// 3. Update resolveGeminiModelName
content = content.replace("if (clean.includes('pro')) return 'gemini-3.1-pro-preview';", "if (clean.includes('pro')) return 'gemini-2.5-pro';");

// 4. Update API key functions
content = content.replace(/export function getStoredApiKey\(\)[\s\S]*?return '';\n\}/, `export function getStoredApiKey(): string {\n  return '';\n}`);
content = content.replace(/export function saveStoredApiKey[\s\S]*?catch \(\_\) \{\}\n\}/, `export function saveStoredApiKey(apiKey: string): void {\n  // Deprecated\n}`);
content = content.replace(/export function hasActiveGeminiKey\(\): boolean \{\n  return getStoredApiKey\(\)\.length > 5;\n\}/, `export function hasActiveGeminiKey(): boolean {\n  return true;\n}`);

// 5. Replace executeActionTurn
content = content.replace("const apiKey = getStoredApiKey();", "");
content = content.replace("if (apiKey) {", "try {");
content = content.replace("const ai = new GoogleGenAI({ apiKey });", `const vertexAI = getVertexAI(app);
      const aiModel = getGenerativeModel(vertexAI, { 
        model: targetModel, 
        generationConfig: { temperature: 0.9 }, 
        systemInstruction: promptInstruction 
      });`);
content = content.replace(/const response = await ai\.models\.generateContent\(\{\s*model: targetModel,\s*contents: \[\{ role: 'user', parts: \[\{ text: userMessage \}\] \}\],\s*config: \{\s*systemInstruction: promptInstruction,\s*temperature: 0\.9\s*\}\s*\}\);/g, "const response = await aiModel.generateContent(userMessage);");
content = content.replace("let text = response.text || '';", "let text = response.response.text() || '';");
content = content.replace("console.warn('Gemini API execution error:', err);", "console.warn('Vertex AI API execution error:', err);");
content = content.replace(/}\n\n  \/\/ Fallback procedural turn if NO api key is provided at all/g, "  // Fallback procedural turn if Vertex AI fails");
content = content.replace(/\} catch \(err: any\) \{/g, "} catch (err: any) {");

// 6. Replace generateRandomScenarioSetup
content = content.replace(/if \(apiKey\) \{[\s\S]*?try \{[\s\S]*?const ai = new GoogleGenAI\(\{ apiKey \}\);/, `try {\n      const vertexAI = getVertexAI(app);\n      const aiModel = getGenerativeModel(vertexAI, { model: targetModel, generationConfig: { temperature: 1.0 } });`);
content = content.replace(/const response = await ai\.models\.generateContent\(\{\s*model: targetModel,\s*contents: \[\{ role: 'user', parts: \[\{ text: prompt \}\] \}\],\s*config: \{\s*temperature: 1\.0\s*\}\s*\}\);/g, "const response = await aiModel.generateContent(prompt);");

// 7. Replace generateDynamicSeedlist
content = content.replace(/if \(apiKey\) \{[\s\S]*?try \{[\s\S]*?const ai = new GoogleGenAI\(\{ apiKey \}\);/, `try {\n      const vertexAI = getVertexAI(app);\n      const aiModel = getGenerativeModel(vertexAI, { model: targetModel, generationConfig: { temperature: 1.0 } });`);
content = content.replace(/const response = await ai\.models\.generateContent\(\{\s*model: targetModel,\s*contents: \[\{ role: 'user', parts: \[\{ text: prompt \}\] \}\],\s*config: \{\s*responseMimeType: 'application\/json',\s*temperature: 1\.0\s*\}\s*\}\);/g, "const response = await aiModel.generateContent(prompt);");

// 8. Replace rollSingleFieldAI
content = content.replace(/if \(apiKey\) \{[\s\S]*?try \{[\s\S]*?const ai = new GoogleGenAI\(\{ apiKey \}\);/, `try {\n      const vertexAI = getVertexAI(app);\n      const aiModel = getGenerativeModel(vertexAI, { model: targetModel, generationConfig: { temperature: 1.0 } });`);
content = content.replace(/const res = await ai\.models\.generateContent\(\{\s*model: targetModel,\s*contents: \[\{ role: 'user', parts: \[\{ text: prompt \}\] \}\],\s*config: \{ temperature: 1\.0 \}\s*\}\);/g, "const res = await aiModel.generateContent(prompt);");
content = content.replace("const text = res.text?.trim()", "const text = res.response.text()?.trim()");

// 9. Replace generateAvatarAI
content = content.replace(/if \(apiKey\) \{[\s\S]*?try \{[\s\S]*?const ai = new GoogleGenAI\(\{ apiKey \}\);/, `try {\n      const vertexAI = getVertexAI(app);\n      const aiModel = getGenerativeModel(vertexAI, { model: 'gemini-2.5-flash', generationConfig: { temperature: 0.8 } });`);
content = content.replace(/const res = await ai\.models\.generateContent\(\{\s*model: 'gemini-2.5-flash',\s*contents: \[\{ role: 'user', parts: \[\{ text: prompt \}\] \}\],\s*config: \{ temperature: 0\.8 \}\s*\}\);/g, "const res = await aiModel.generateContent(prompt);");


fs.writeFileSync('src/lib/geminiService.ts', content);
