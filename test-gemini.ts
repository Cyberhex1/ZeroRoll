import { GoogleGenAI } from '@google/genai';

async function test() {
  const apiKey = "REDACTED_API_KEY_FOR_SECURITY";
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: 'Say hi'
    });
    console.log('Success:', response.text);
  } catch (err: any) {
    console.error('Failed:', err.message);
  }
}

test();
