import { GoogleGenAI } from '@google/genai';

async function test() {
  const apiKey = "AIzaSyAz1iLblwW3nqiffTrEWuRtP2Rxdd9A8t0";
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Say hi'
    });
    console.log('Success:', response.text);
  } catch (err: any) {
    console.error('Failed:', err.message);
  }
}

test();
