
// Автономный сервис психологического анализа v3.0 (Deep Insight)

export interface AnalysisResult {
  analysisText: string;
  scoreSafety: number;
  scorePermission: number;
  scoreAmbition: number;
  capacity: number;
  keyBelief: string;
  actionStep: string;
  profileType: string;
  archetype: string;
  shadowSide: string;
}

const SCENARIO_IMPACT: Record<string, any> = {
  'fear_of_punishment': { safety: -25, permission: -10, ambition: 5, shadow: "Страх проявления", text: "Ваша система безопасности блокирует успех, чтобы избежать воображаемого наказания." },
  'impulse_spend': { safety: -15, permission: 25, ambition: 15, shadow: "Непереносимость ресурса", text: "Слив денег — это способ избавиться от напряжения, которое они вызывают." },
  'money_is_danger': { safety: -35, permission: -15, ambition: -10, shadow: "Инстинкт выживания", text: "Для вашего подсознания быть богатым равносильно тому, чтобы быть мишенью." },
  'poverty_is_virtue': { safety: 15, permission: -35, ambition: -20, shadow: "Моральное превосходство", text: "Вы используете бедность как доказательство своей духовности и чистоты." },
  'fear_of_conflict': { safety: 5, permission: -25, ambition: -15, shadow: "Угодничество", text: "Отказ от денег — это цена, которую вы платите за 'мир' с окружающими." },
  'money_is_tool': { safety: 25, permission: 20, ambition: 20, shadow: "Рационализация", text: "Вы умеете видеть возможности там, где другие видят препятствия." },
  'imposter_syndrome': { safety: -10, permission: -30, ambition: 5, shadow: "Обесценивание", text: "Внутренний критик съедает львиную долю вашей энергии, предназначенной для роста." },
  'hard_work_only': { safety: -15, permission: 10, ambition: 20, shadow: "Мазохизм", text: "Вы верите, что деньги 'законны' только если они получены через страдание." },
  'capacity_expansion': { safety: 20, permission: 30, ambition: 35, shadow: "Гиперответственность", text: "Вы готовы к масштабу, но склонны тянуть всё на своих плечах." },
  'family_loyalty': { safety: 15, permission: -40, ambition: -10, shadow: "Родовое переплетение", text: "Вы бессознательно храните верность тяжелой судьбе ваших предков." },
  'guilt_after_pleasure': { safety: -20, permission: -30, ambition: 5, shadow: "Запрет на радость", text: "Вам кажется, что за каждую минуту счастья придется заплатить горем." },
  'self_permission': { safety: 25, permission: 35, ambition: 25, shadow: "Эгоцентризм", text: "Вы разрешили себе быть главным бенефициаром своей жизни." }
};

export async function getPsychologicalFeedback(history: any[]): Promise<AnalysisResult> {
  let safety = 50, permission = 50, ambition = 50;
  let descriptions: string[] = [];
  let shadows: string[] = [];
  
  history.forEach(item => {
    const impact = SCENARIO_IMPACT[item.beliefKey];
    if (impact) {
      safety = Math.max(0, Math.min(100, safety + impact.safety));
      permission = Math.max(0, Math.min(100, permission + impact.permission));
      ambition = Math.max(0, Math.min(100, ambition + impact.ambition));
      descriptions.push(impact.text);
      shadows.push(impact.shadow);
    }
  });

  const capacity = Math.round((safety + permission + ambition) / 3);
  
  // Определение Архетипа
  let archetype = "Наблюдатель";
  let profileType = "Сбалансированный";
  let actionStep = "Практика благодарности: записывайте 3 способа, как деньги помогли вам сегодня.";

  if (safety < 40) {
    archetype = "Беженец";
    profileType = "Тревожный дефицит";
    actionStep = "Создайте 'фонд безопасности' — небольшую сумму наличными, которую нельзя тратить, чтобы приучить тело к ощущению наличия ресурса.";
  } else if (permission < 40) {
    archetype = "Слуга";
    profileType = "Запрет на владение";
    actionStep = "Купите себе подарок на сумму, которая кажется вам 'неприлично большой' за один раз. Не оправдывайтесь перед собой.";
  } else if (ambition > 70) {
    archetype = "Завоеватель";
    profileType = "Активная экспансия";
    actionStep = "Делегируйте одну задачу, которую вы обычно делаете сами, даже если 'никто не сделает лучше'.";
  }

  const analysisText = descriptions.slice(-2).join(" ") + " Ваша текущая задача — интегрировать право на удовольствие без необходимости заслуживать его через боль.";

  return {
    analysisText,
    scoreSafety: safety,
    scorePermission: permission,
    scoreAmbition: ambition,
    capacity,
    keyBelief: shadows[shadows.length - 1] || "Точка роста",
    actionStep,
    profileType,
    archetype,
    shadowSide: shadows.join(", ")
  };
}

export async function textToSpeech(text: string): Promise<string | null> {
  return new Promise((resolve) => {
    if (!window.speechSynthesis) return resolve(null);
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'ru-RU';
    utter.rate = 0.9;
    utter.pitch = 1.0;
    window.speechSynthesis.speak(utter);
    utter.onend = () => resolve("played");
  });
}

export async function generateMindsetAnchor(prompt: string): Promise<string> {
  return `https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=800`;
}
