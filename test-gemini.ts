import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
dotenv.config();

async function testScenario() {
  const apiKey = process.env.VITE_GEMINI_API_KEY || '';
  const ai = new GoogleGenAI({ apiKey });
  
  console.log('Calling generateContent for scenario JSON...');
  const prompt = `You are a master tabletop RPG Game Master and worldbuilder.
Generate a COMPLETELY ORIGINAL, randomized starting campaign setup for a "fantasy" tabletop roleplaying experience.
Output MUST be strictly valid JSON matching this schema:
{
  "title": "Campaign Title",
  "heroName": "Hero Name",
  "roleClass": "Role Class",
  "raceOrigin": "Race Origin",
  "hookText": "Hook text"
}`;

  try {
    const start = Date.now();
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json',
        temperature: 1.0
      }
    });
    console.log(`Success in ${Date.now() - start}ms:`, response.text);
  } catch (err: any) {
    console.error('Failed:', err);
  }
}

testScenario();
