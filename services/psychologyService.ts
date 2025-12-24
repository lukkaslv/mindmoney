
export interface VectorState {
  foundation: number; // Stability
  momentum: number;   // Power
  space: number;      // Permission
  friction: number;   // Entropy
}

export interface ProtocolStep {
  day: number;
  type: string;
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
  status: 'stable' | 'warning' | 'critical';
}

const EXTENDED_TASK_POOL: Record<string, any[]> = {
  STABILITY: [
    {
      task: { ru: "Фиксация Базиса: Ритм 8/8/8", ka: "ბაზისის ფიქსაცია: რიტმი 8/8/8" },
      metaphor: { ru: "Закладка фундамента крепости", ka: "ციხესიმაგრის საძირკვლის ჩაყრა" },
      why: { ru: "Ваша система дестабилизирована. Жесткий график — единственный способ вернуть контроль.", ka: "თქვენი სისტემა დესტაბილიზებულია. მკაცრი გრაფიკი კონტროლის დაბრუნების ერთადერთი გზაა." }
    },
    {
      task: { ru: "Аудит физических опор", ka: "ფიზიკური საყრდენების აუდიტი" },
      metaphor: { ru: "Проверка несущих стен", ka: "მზიდი კედლების შემოწმება" },
      why: { ru: "Тело сигналит о дефиците безопасности. Вернитесь в физический мир.", ka: "სხეული უსაფრთხოების დეფიციტზე მიანიშნებს. დაბრუნდით ფიზიკურ სამყაროში." }
    }
  ],
  MOMENTUM: [
    {
      task: { ru: "Экспансия: Микро-действие", ka: "ექსპანსია: მიკრო-ქმედება" },
      metaphor: { ru: "Запуск спящего реактора", ka: "მძინარე რეაქტორის გაშვება" },
      why: { ru: "Энергия застаивается. Нужно одно действие, которое вы откладывали месяц.", ka: "ენერგია სტაგნაციას განიცდის. საჭიროა ერთი ქმედება, რომელსაც ერთი თვეა დებთ." }
    },
    {
      task: { ru: "Вектор воли: Отказ", ka: "ნების ვექტორი: უარი" },
      metaphor: { ru: "Направление потока в русло", ka: "ნაკადის კალაპოტში მიმართვა" },
      why: { ru: "Сила тратится впустую. Скажите 'нет' одному второстепенному делу сегодня.", ka: "ძალა ტყუილად იხარჯება. უთხარით 'არა' ერთ მეორეხარისხოვან საქმეს დღეს." }
    }
  ],
  SPACE: [
    {
      task: { ru: "Право на объем: Тишина", ka: "მოცულობის უფლება: სიჩუმე" },
      metaphor: { ru: "Расширение купола", ka: "გუმბათის გაფართოება" },
      why: { ru: "Вам тесно в собственных границах. Создайте час абсолютной тишины.", ka: "თქვენს საზღვრებში გიჭერთ. შექმენით აბსოლუტური სიჩუმის საათი." }
    }
  ]
};

export function calculateGenesisCore(history: any[]): AnalysisResult {
  let f = 50, m = 50, s = 50, e = 20;

  const weights: Record<string, any> = {
    'fear_of_punishment': { f: -12, m: -4, s: -8, e: 18 },
    'impulse_spend': { f: -8, m: 12, s: 10, e: 12 },
    'money_is_danger': { f: -18, m: -8, s: -4, e: 22 },
    'poverty_is_virtue': { f: 8, m: -12, s: -15, e: 6 },
    'money_is_tool': { f: 4, m: 14, s: 12, e: -6 },
    'self_permission': { f: 0, m: 8, s: 22, e: -12 },
    'capacity_expansion': { f: 4, m: 18, s: 14, e: 4 },
    'imposter_syndrome': { f: -6, m: -12, s: -10, e: 18 },
    'guilt_after_pleasure': { f: -8, m: -6, s: -18, e: 14 },
    'hard_work_only': { f: 12, m: -4, s: -22, e: 12 },
    'family_loyalty': { f: 18, m: -12, s: -10, e: 4 }
  };

  history.forEach(h => {
    const w = weights[h.beliefKey] || { f: 0, m: 0, s: 0, e: 4 };
    f = Math.max(5, Math.min(95, f + w.f));
    m = Math.max(5, Math.min(95, m + w.m));
    s = Math.max(5, Math.min(95, s + w.s));
    e = Math.max(5, Math.min(95, e + w.e));
  });

  // Нелинейный расчет целостности
  const imbalance = (Math.abs(f - m) + Math.abs(m - s) + Math.abs(s - f)) / 3;
  const integrity = Math.round(((f + m + s) / 3) * (1 - (e / 100)) * (1 - (imbalance / 150)));

  const status = integrity < 40 ? 'critical' : integrity < 70 ? 'warning' : 'stable';

  let arch = { ru: "Наблюдатель", ka: "დამკვირვებელი", icon: "👁️" };
  if (m > 60 && f > 60 && s > 60) arch = { ru: "Архитектор", ka: "არქიტექტორი", icon: "🏛️" };
  else if (m > 70 && f < 40) arch = { ru: "Азартный Игрок", ka: "აზარტული მოთამაშე", icon: "🎲" };
  else if (f > 80) arch = { ru: "Хранитель", ka: "მცველი", icon: "🛡️" };
  else if (e > 50) arch = { ru: "Теневой Скиталец", ka: "ჩრდილოვანი მოხეტე", icon: "🌑" };

  // Генерация уникальной дорожной карты
  const roadmap: ProtocolStep[] = [];
  const usedTasks = new Set();

  for (let i = 1; i <= 7; i++) {
    let category = 'STABILITY';
    if (e > 40 && i % 3 === 0) category = 'STABILITY'; // Очистка при энтропии
    else if (f < m && f < s) category = 'STABILITY';
    else if (m < f && m < s) category = 'MOMENTUM';
    else category = 'SPACE';

    const pool = EXTENDED_TASK_POOL[category];
    const taskIndex = (i + Math.floor(f/10)) % pool.length;
    roadmap.push({ day: i, type: category, ...pool[taskIndex] });
  }

  return {
    state: { foundation: f, momentum: m, space: s, friction: e },
    integrity,
    archetype: arch,
    metaphorSummary: {
      ru: status === 'critical' ? "Система на пределе износа. Нужна полная остановка." : "Ядро стабильно, но требует тонкой калибровки.",
      ka: status === 'critical' ? "სისტემა ცვეთის ზღვარზეა. საჭიროა სრული გაჩერება." : "ბირთვი სტაბილურია, თუმცა საჭიროებს ნატიფ კალიბრაციას."
    },
    graphPoints: [
      { x: 50, y: 50 - f / 2 },
      { x: 50 + s / 2, y: 50 + s / 4 },
      { x: 50 - m / 2, y: 50 + m / 4 }
    ],
    roadmap,
    status
  };
}
