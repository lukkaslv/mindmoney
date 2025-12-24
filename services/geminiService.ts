
import { GoogleGenAI, Modality, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getPsychologicalFeedback(history: any[]) {
  const context = history.map(h => 
    `Сцена: ${h.sceneId}. Выбор: ${h.choiceId}. Тело: ${h.bodySensation}. Мысли: ${h.userReflection}.`
  ).join('\n');
  
  const prompt = `
    Ты — экспертный психолог в нише психологии денег (КПТ, ОРКТ, НЛП).
    Проанализируй сессию клиента:
    ${context}
    
    Сформируй глубокий, но бережный анализ.
    Твоя задача:
    1. Написать анализ (analysisText) — используй метафоры, подчеркни связь тела и мыслей.
    2. Оцени по шкале 0-100: 
       - scoreSafety (безопасность больших денег)
       - scorePermission (разрешение на успех)
       - scoreAmbition (здоровые амбиции)
       - capacity (текущая финансовая емкость)
    3. Выдели главное ограничивающее убеждение (keyBelief).
    4. Дай ОДИН мощный коучинговый вопрос для ОРКТ-проработки (actionStep).
    5. Создай imagePrompt для генерации образа "внутреннего денежного сада" клиента на основе его выборов.
    
    Верни строго JSON.
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
    console.error("Gemini analysis error", error);
    return null;
  }
}

export async function generateMindsetAnchor(prompt: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { 
        parts: [{ text: `High-end therapeutic digital art, meditative, calm, symbolic representation of: ${prompt}, soft focus, dreamy lighting, pastel and gold colors, 4k` }] 
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
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Говори как мудрый, добрый наставник, делай паузы в важных местах: ${text}` }] }],
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
  });
}
