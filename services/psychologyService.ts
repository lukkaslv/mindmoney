
// Автономный сервис психологического анализа v2.0

export interface AnalysisResult {
  analysisText: string;
  scoreSafety: number;
  scorePermission: number;
  scoreAmbition: number;
  capacity: number;
  keyBelief: string;
  actionStep: string;
  imageTheme: string;
  profileType: string;
}

const BELIEF_IMPACT: Record<string, any> = {
  'fear_of_punishment': { safety: -20, permission: -10, ambition: 0, text: "Страх наказания блокирует спонтанность." },
  'impulse_spend': { safety: -10, permission: 20, ambition: 10, text: "Импульсивность как попытка 'сбежать' от ресурса." },
  'money_is_danger': { safety: -30, permission: -10, ambition: -10, text: "Деньги считываются системой как угроза выживанию." },
  'poverty_is_virtue': { safety: 10, permission: -30, ambition: -20, text: "Скромность как защита от социального осуждения." },
  'fear_of_conflict': { safety: 0, permission: -20, ambition: -10, text: "Границы размыты в угоду чужому мнению." },
  'money_is_tool': { safety: 20, permission: 20, ambition: 20, text: "Ресурс воспринимается как нейтральный инструмент." },
  'imposter_syndrome': { safety: -10, permission: -20, ambition: -5, text: "Обесценивание мешает занять свое место в иерархии." },
  'hard_work_only': { safety: -20, permission: 10, ambition: 15, text: "Сценарий 'выживания через сверхусилия'." },
  'capacity_expansion': { safety: 15, permission: 25, ambition: 30, text: "Готовность к управлению большими потоками." },
  'family_loyalty': { safety: 10, permission: -30, ambition: -10, text: "Верность дефицитарному сценарию рода." },
  'guilt_after_pleasure': { safety: -15, permission: -25, ambition: 0, text: "Запрет на витальную энергию и радость." },
  'self_permission': { safety: 20, permission: 30, ambition: 20, text: "Внутренняя легализация права на изобилие." }
};

export async function getPsychologicalFeedback(history: any[]): Promise<AnalysisResult> {
  let safety = 50, permission = 50, ambition = 50;
  let summaryParts: string[] = [];
  
  history.forEach(item => {
    const impact = BELIEF_IMPACT[item.beliefKey];
    if (impact) {
      safety = Math.max(5, Math.min(100, safety + impact.safety));
      permission = Math.max(5, Math.min(100, permission + impact.permission));
      ambition = Math.max(5, Math.min(100, ambition + impact.ambition));
      summaryParts.push(impact.text);
    }
  });

  const capacity = Math.round((safety + permission + ambition) / 3);
  
  let keyBelief = "Деньги приходят на запрос";
  let actionStep = "Сделайте список из 100 желаний, не думая о цене.";
  let profileType = "Исследователь";
  
  if (capacity < 35) {
    profileType = "Хранитель дефицита";
    keyBelief = "Безопасность — это отсутствие изменений";
    actionStep = "Найдите 3 безопасных способа потратить 10% дохода на себя.";
  } else if (permission < 45) {
    profileType = "Аскет";
    keyBelief = "Мне нельзя больше, чем другим";
    actionStep = "Купите вещь, которая кажется 'слишком хорошей' для вас.";
  } else if (ambition > 75) {
    profileType = "Архитектор систем";
    keyBelief = "Масштаб — это вопрос структуры, а не усилий";
    actionStep = "Опишите ваш бизнес-процесс так, чтобы его понял ребенок.";
  }

  return {
    analysisText: summaryParts.slice(-2).join(" ") + " Ваш текущий фокус — балансировка между сохранением накопленного и риском расширения.",
    scoreSafety: safety,
    scorePermission: permission,
    scoreAmbition: ambition,
    capacity: capacity,
    keyBelief: keyBelief,
    actionStep: actionStep,
    imageTheme: "zen-abstract",
    profileType
  };
}

export async function textToSpeech(text: string): Promise<string | null> {
  return new Promise((resolve) => {
    if (!window.speechSynthesis) return resolve(null);
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'ru-RU';
    utter.rate = 0.95;
    utter.pitch = 1.0;
    window.speechSynthesis.speak(utter);
    utter.onend = () => resolve("played");
  });
}

export function decodeBase64(s: string) { return new Uint8Array(); }
export async function playAudioBuffer(d: any) { return; }

export async function generateMindsetAnchor(prompt: string): Promise<string> {
  return `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800`; // Эстетичная абстракция
}
