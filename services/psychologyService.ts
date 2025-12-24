
export interface VectorState {
  foundation: number; // Stability/Safety
  momentum: number;   // Power/Action
  space: number;      // Permission/Freedom
  friction: number;   // Entropy/Stress
}

export interface ProtocolStep {
  day: number;
  task: { ru: string; ka: string };
  metaphor: { ru: string; ka: string };
  why: { ru: string; ka: string };
}

export interface AnalysisResult {
  state: VectorState;
  integrity: number;
  archetype: { ru: string; ka: string; icon: string };
  metaphorSummary: { ru: string; ka: string };
  roadmap: ProtocolStep[];
  graphPoints: { x: number; y: number }[];
}

// Реестр заданий по векторам
const TASK_POOL = {
  STABILITY: {
    task: { ru: "Заземление: Режим 8/8/8", ka: "დამიწება: რეჟიმი 8/8/8" },
    metaphor: { ru: "Укрепление фундамента дома", ka: "სახლის საძირკვლის გამაგრება" },
    why: { ru: "Ваша нервная система перегружена. Нужно вернуть чувство опоры.", ka: "თქვენი ნერვული სისტემა გადატვირთულია. საჭიროა საყრდენის დაბრუნება." }
  },
  MOMENTUM: {
    task: { ru: "Микро-победа за 15 минут", ka: "მიკრო-გამარჯვება 15 წუთში" },
    metaphor: { ru: "Запуск двигателя после простоя", ka: "ძრავის ამუშავება გაჩერების შემდეგ" },
    why: { ru: "Потенциал заблокирован страхом ошибки. Начните с малого действия.", ka: "პოტენციალი დაბლოკილია შეცდომის შიშით. დაიწყეთ მცირე ქმედებით." }
  },
  SPACE: {
    task: { ru: "День 'Никому ничего не должен'", ka: "დღე 'არავის არაფერს ვალდებული არ ვარ'" },
    metaphor: { ru: "Расширение границ сада", ka: "ბაღის საზღვრების გაფართოება" },
    why: { ru: "Ваше 'Я' зажато чужими ожиданиями. Верните себе право на выбор.", ka: "თქვენი 'მე' მოქცეულია სხვების მოლოდინებში. დაიბრუნეთ არჩევანის უფლება." }
  },
  FRICTION: {
    task: { ru: "Цифровой детокс (3 часа)", ka: "ციფრული დეტოქსი (3 საათი)" },
    metaphor: { ru: "Очистка фильтров от пыли", ka: "ფილტრების გაწმენდა მტვრისგან" },
    why: { ru: "Слишком много шума. Система искрит. Нужно снизить энтропию.", ka: "ზედმეტი ხმაურია. სისტემა ნაპერწკლებს ყრის. ენტროპია უნდა შემცირდეს." }
  }
};

export function calculateGenesisCore(history: any[]): AnalysisResult {
  let f = 50, m = 50, s = 50, e = 20;

  const weights: Record<string, any> = {
    'fear_of_punishment': { f: -15, m: -5, s: -10, e: 20 },
    'impulse_spend': { f: -10, m: 10, s: 15, e: 15 },
    'money_is_danger': { f: -20, m: -10, s: -5, e: 25 },
    'poverty_is_virtue': { f: 10, m: -15, s: -20, e: 5 },
    'fear_of_conflict': { f: 5, m: -20, s: -15, e: 10 },
    'money_is_tool': { f: 5, m: 15, s: 10, e: -5 },
    'self_permission': { f: 0, m: 5, s: 25, e: -10 },
    'capacity_expansion': { f: 5, m: 20, s: 10, e: 5 },
    'imposter_syndrome': { f: -5, m: -10, s: -15, e: 20 }
  };

  history.forEach(h => {
    const w = weights[h.beliefKey] || { f: 0, m: 0, s: 0, e: 5 };
    f = Math.max(0, Math.min(100, f + w.f));
    m = Math.max(0, Math.min(100, m + w.m));
    s = Math.max(0, Math.min(100, s + w.s));
    e = Math.max(0, Math.min(100, e + w.e));
  });

  const integrity = Math.round(((f + m + s) / 3) * (1 - e / 100));

  // Определение архетипа
  let arch = { ru: "Наблюдатель", ka: "დამკვირვებელი", icon: "👁️" };
  if (m > 70 && f > 60) arch = { ru: "Архитектор", ka: "არქიტექტორი", icon: "🏛️" };
  else if (m > 70 && f < 40) arch = { ru: "Азартный Игрок", ka: "აზარტული მოთამაშე", icon: "🎲" };
  else if (f > 80) arch = { ru: "Хранитель", ka: "მცველი", icon: "🛡️" };

  // Генерация дорожной карты
  const roadmap: ProtocolStep[] = Array.from({ length: 7 }, (_, i) => {
    let focus = TASK_POOL.STABILITY;
    if (e > 50) focus = TASK_POOL.FRICTION;
    else if (s < 40) focus = TASK_POOL.SPACE;
    else if (m < 40) focus = TASK_POOL.MOMENTUM;
    
    return { day: i + 1, ...focus };
  });

  return {
    state: { foundation: f, momentum: m, space: s, friction: e },
    integrity,
    archetype: arch,
    metaphorSummary: {
      ru: f < 40 ? "Ваш фундамент требует укрепления." : "Ваш внутренний дом устойчив.",
      ka: f < 40 ? "თქვენი საძირკველი გამაგრებას საჭიროებს." : "თქვენი შინაგანი სახლი მდგრადია."
    },
    graphPoints: [
      { x: 50, y: 50 - f / 2 },
      { x: 50 + s / 2, y: 50 + s / 4 },
      { x: 50 - m / 2, y: 50 + m / 4 }
    ],
    roadmap
  };
}
