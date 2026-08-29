import { GoogleGenAI } from '@google/genai';
import firebaseConfig from './firebase-applet-config.json' with { type: "json" };

async function test() {
  const apiKey = firebaseConfig.apiKey;
  console.log('Testing with API Key:', apiKey.substring(0, 10) + '...');
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Say hi'
    });
    console.log('Success (2.5-flash):', response.text);
  } catch (err: any) {
    console.error('Failed (2.5-flash):', err.message, err);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: 'Say hi'
    });
    console.log('Success (3.1-pro-preview):', response.text);
  } catch (err: any) {
    console.error('Failed (3.1-pro-preview):', err.message, err);
  }
}

test();
