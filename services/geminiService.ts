
import { GoogleGenAI, Modality, Type } from "@google/genai";

const getSafeApiKey = () => {
  if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
    return process.env.API_KEY;
  }
  // @ts-ignore
  if (window.process?.env?.API_KEY) {
    // @ts-ignore
    return window.process.env.API_KEY;
  }
  return "";
};

export async function getPsychologicalFeedback(history: any[]) {
  const apiKey = getSafeApiKey();
  if (!apiKey) throw new Error("API_KEY is not configured.");

  const ai = new GoogleGenAI({ apiKey });
  const context = history.map(h => 
    `Ситуация: ${h.sceneId}. Выбор: ${h.choiceId}. Ощущение: ${h.bodySensation}. Мысли: ${h.userReflection}.`
  ).join('\n');
  
  const prompt = `
    Ты — высококвалифицированный психолог, эксперт по финансовому поведению. 
    Твоя задача: провести анализ сессии клиента, используя КПТ и системный подход.
    
    ДАННЫЕ КЛИЕНТА:
    ${context}
    
    ТРЕБОВАНИЯ К ОТВЕТУ:
    - analysisText: 3-4 предложения, глубоких, поддерживающих, без клише.
    - scoreSafety: уровень чувства безопасности (0-100).
    - scorePermission: уровень внутреннего разрешения на богатство (0-100).
    - scoreAmbition: уровень здоровых амбиций (0-100).
    - capacity: общая финансовая емкость (0-100).
    - keyBelief: одна ключевая фраза-инсайт в кавычках.
    - actionStep: конкретное упражнение на 5 минут в день.
    - imagePrompt: описание метафорической картины для генерации ИИ-якоря.
    
    ОТВЕТЬ ТОЛЬКО В JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { 
        temperature: 0.8,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysisText: { type: Type.STRING },
            scoreSafety: { type: Type.NUMBER },
            scorePermission: { type: Type.NUMBER },
            scoreAmbition: { type: Type.NUMBER },
            capacity: { type: Type.NUMBER },
            keyBelief: { type: Type.STRING },
            actionStep: { type: Type.STRING },
            imagePrompt: { type: Type.STRING }
          },
          required: ["analysisText", "scoreSafety", "scorePermission", "scoreAmbition", "capacity", "keyBelief", "actionStep", "imagePrompt"]
        }
      }
    });
    
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
}

export async function generateMindsetAnchor(prompt: string) {
  const apiKey = getSafeApiKey();
  if (!apiKey) return null;
  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { 
        parts: [{ text: `High-end therapeutic digital art, psychological symbol, metaphysical style: ${prompt}. Soft bokeh, ethereal light, gold and deep blue tones, 8k resolution.` }] 
      },
      config: { imageConfig: { aspectRatio: "16:9" } }
    });
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return null;
  } catch (error) { return null; }
}

export async function textToSpeech(text: string) {
  const apiKey = getSafeApiKey();
  if (!apiKey) return null;
  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Спокойный, бархатный голос психолога-наставника. Четкая дикция, мягкие паузы: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch (error) { return null; }
}

export function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function playAudioBuffer(data: Uint8Array): Promise<void> {
  return new Promise((resolve) => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const dataInt16 = new Int16Array(data.buffer);
      const numChannels = 1;
      const sampleRate = 24000;
      const frameCount = dataInt16.length / numChannels;
      const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
      for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
          channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.onended = () => { ctx.close(); resolve(); };
      source.start();
    } catch (e) {
      console.error("Audio Error:", e);
      resolve();
    }
  });
}
