
import { GoogleGenAI, Modality, Type } from "@google/genai";

const getApiKey = () => {
  try {
    return process.env.API_KEY || "";
  } catch (e) {
    return "";
  }
};

// Инициализируем AI только если ключ есть
const ai = new GoogleGenAI({ apiKey: getApiKey() });

export async function getPsychologicalFeedback(history: any[]) {
  const context = history.map(h => 
    `Ситуация: ${h.sceneId}. Выбор: ${h.choiceId}. Тело: ${h.bodySensation}. Рефлексия: ${h.userReflection}.`
  ).join('\n');
  
  const prompt = `
    Ты — ведущий эксперт по психологии денег. Твой подход: синтез КПТ (когнитивно-поведенческая терапия) и ОРКТ (ориентированная на решение краткосрочная терапия).
    
    ПЕРЕД ТОБОЙ ДАННЫЕ СЕССИИ КЛИЕНТА:
    ${context}
    
    ТВОЯ ЗАДАЧА:
    1. Проведи глубокий психологический анализ (analysisText). Используй мягкий, поддерживающий тон. Подсвети связь между телесными зажимами и финансовыми страхами.
    2. Выдай 4 оценки (0-100): 
       - scoreSafety (насколько безопасно клиенту иметь деньги)
       - scorePermission (разрешение на успех)
       - scoreAmbition (уровень здоровых амбиций)
       - capacity (финансовая емкость)
    3. Сформулируй одно ключевое ОГРАНИЧИВАЮЩЕЕ УБЕЖДЕНИЕ (keyBelief).
    4. Предложи ОДНУ микро-практику на сегодня (actionStep), основанную на ОРКТ (маленький шаг к изменениям).
    5. Опиши метафорический образ "Денежного Источника" клиента для генерации картинки (imagePrompt).
    
    ОТВЕТЬ ТОЛЬКО В JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { 
        temperature: 0.7,
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
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { 
        parts: [{ text: `Professional therapeutic art, abstract psychological metaphor: ${prompt}. Dreamy, cinematic lighting, 8k, serene colors, gold accents, symmetrical composition.` }] 
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
      contents: [{ parts: [{ text: `Говори как очень мудрый, теплый и спокойный наставник. Делай паузы. Голос должен звучать дорого и уверенно: ${text}` }] }],
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
