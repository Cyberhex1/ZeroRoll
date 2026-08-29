import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
dotenv.config();

async function test() {
  const apiKey = process.env.VITE_GEMINI_API_KEY || '';
  const ai = new GoogleGenAI({ apiKey });
  const res = await ai.models.generateContent({
    model: 'gemini-3.5-flash',
    contents: 'Say: Ready'
  });
  console.log('Result:', res.text?.trim());
}

test();
