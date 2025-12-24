
// Автономный сервис психологического анализа (без ИИ)

export interface AnalysisResult {
  analysisText: string;
  scoreSafety: number;
  scorePermission: number;
  scoreAmbition: number;
  capacity: number;
  keyBelief: string;
  actionStep: string;
  imageTheme: string;
}

// Карта соответствия ключей убеждений и их влияния на показатели
const BELIEF_IMPACT: Record<string, any> = {
  'fear_of_punishment': { safety: -20, permission: -10, ambition: 0, text: "Вы склонны ожидать подвоха от успеха." },
  'impulse_spend': { safety: -10, permission: 20, ambition: 10, text: "Деньги для вас — это способ быстрого получения дофамина." },
  'money_is_danger': { safety: -30, permission: -10, ambition: -10, text: "Ваше подсознание связывает достаток с угрозой жизни." },
  'poverty_is_virtue': { safety: 10, permission: -30, ambition: -20, text: "Связка 'бедность = порядочность' ограничивает ваш рост." },
  'fear_of_conflict': { safety: 0, permission: -20, ambition: -10, text: "Вы жертвуете своим комфортом ради спокойствия окружающих." },
  'money_is_tool': { safety: 20, permission: 20, ambition: 20, text: "У вас здоровая, взрослая позиция по отношению к ресурсам." },
  'imposter_syndrome': { safety: -10, permission: -20, ambition: -5, text: "Вы склонны обесценивать свои реальные достижения." },
  'hard_work_only': { safety: -20, permission: 10, ambition: 15, text: "Вы верите, что деньги можно только 'выстрадать'." },
  'capacity_expansion': { safety: 15, permission: 25, ambition: 30, text: "Вы готовы к масштабированию и делегированию." },
  'family_loyalty': { safety: 10, permission: -30, ambition: -10, text: "Вы живете по финансовому сценарию ваших предков." },
  'guilt_after_pleasure': { safety: -15, permission: -25, ambition: 0, text: "Запрет на радость блокирует приток новой энергии." },
  'self_permission': { safety: 20, permission: 30, ambition: 20, text: "Вы разрешаете себе лучшее по праву рождения." }
};

export async function getPsychologicalFeedback(history: any[]): Promise<AnalysisResult> {
  let safety = 50, permission = 50, ambition = 50;
  let summaryParts: string[] = [];
  
  // Анализируем историю
  history.forEach(item => {
    const impact = BELIEF_IMPACT[item.beliefKey];
    if (impact) {
      safety = Math.max(10, Math.min(100, safety + impact.safety));
      permission = Math.max(10, Math.min(100, permission + impact.permission));
      ambition = Math.max(10, Math.min(100, ambition + impact.ambition));
      summaryParts.push(impact.text);
    }
  });

  const capacity = Math.round((safety + permission + ambition) / 3);
  
  // Определяем доминирующий профиль
  let keyBelief = "Ваши деньги — это ваша энергия";
  let actionStep = "Начните с малого: купите себе то, что давно откладывали.";
  
  if (capacity < 40) {
    keyBelief = "Безопасность важнее расширения";
    actionStep = "Выпишите 10 случаев, когда деньги спасали вас, а не создавали проблемы.";
  } else if (permission < 40) {
    keyBelief = "Я имею право на большее без чувства вины";
    actionStep = "Сегодня потратьте небольшую сумму только на свое удовольствие, не оправдываясь.";
  } else if (ambition > 70) {
    keyBelief = "Масштаб требует доверия";
    actionStep = "Делегируйте одну мелкую задачу на этой неделе.";
  }

  return {
    analysisText: summaryParts.slice(-3).join(" ") + " Ваша текущая стратегия направлена на сохранение привычного статус-кво.",
    scoreSafety: safety,
    scorePermission: permission,
    scoreAmbition: ambition,
    capacity: capacity,
    keyBelief: keyBelief,
    actionStep: actionStep,
    imageTheme: capacity > 60 ? "gold-energy" : "blue-calm"
  };
}

// Локальный TTS через браузер
export async function textToSpeech(text: string): Promise<string | null> {
  return new Promise((resolve) => {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'ru-RU';
    utter.rate = 0.9;
    utter.pitch = 1.0;
    
    // В автономном режиме мы не возвращаем base64, а сразу играем. 
    // Но чтобы не ломать логику App.tsx, вернем фейковую строку.
    window.speechSynthesis.speak(utter);
    utter.onend = () => resolve("played");
  });
}

// Заглушки, чтобы не переписывать весь App.tsx сразу
export function decodeBase64(s: string) { return new Uint8Array(); }
export async function playAudioBuffer(d: any) { return; }

export async function generateMindsetAnchor(prompt: string): Promise<string> {
  // Вместо генерации ИИ возвращаем красивый градиентный фон с иконкой
  const colors = prompt.includes("safety") ? ["#3b82f6", "#1d4ed8"] : ["#6366f1", "#a855f7"];
  return `https://singlecolorimage.com/get/${colors[0].replace('#','')}/1200x675`; 
}
