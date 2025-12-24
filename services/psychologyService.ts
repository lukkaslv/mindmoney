
export interface VectorState {
  foundation: number;
  agency: number;
  resource: number;
  entropy: number;
}

export interface ProtocolStep {
  day: number;
  phase: 'SANITATION' | 'STABILIZATION' | 'EXPANSION';
  task: { ru: string; ka: string };
  method: { ru: string; ka: string };
  targetMetric: { ru: string; ka: string };
}

export interface AnalysisResult {
  state: VectorState;
  integrity: number;
  capacity: number;
  entropyScore: number;
  systemHealth: number;
  phase: 'SANITATION' | 'STABILIZATION' | 'EXPANSION';
  archetype: { ru: string; ka: string; icon: string };
  roadmap: ProtocolStep[];
  graphPoints: { x: number; y: number }[];
  status: 'OPTIMAL' | 'COMPENSATED' | 'UNSTABLE' | 'CRITICAL';
  bugs: string[];
}

const TASKS_DB: Record<string, any[]> = {
  SANITATION: [
    {
      task: { ru: "Ликвидация утечек", ka: "გაჟონვის ლიკვიდაცია" },
      method: { ru: "Отписаться от 5 ненужных рассылок и 1 токсичного блогера сегодня.", ka: "დღესვე გამოიწერეთ 5 არასაჭირო გზავნილი და 1 ტოქსიკური ბლოგერი." },
      targetMetric: { ru: "Снижение шума (Entropy) -5%", ka: "ხმაურის შემცირება -5%" }
    },
    {
      task: { ru: "Ревизия границ", ka: "საზღვრების რევიზია" },
      method: { ru: "Сказать 'нет' одной просьбе, которая нарушает ваш комфорт.", ka: "უთხარით 'არა' ერთ თხოვნას, რომელიც არღვევს თქვენს კომფორტს." },
      targetMetric: { ru: "Рост Агентности +3%", ka: "აგენტურობის ზრდა +3%" }
    },
    {
        task: { ru: "Цифровой детокс", ka: "ციფრული დეტოქსი" },
        method: { ru: "2 часа без уведомлений и гаджетов перед сном.", ka: "2 საათი შეტყობინებების და გაჯეტების გარეშე ძილის წინ." },
        targetMetric: { ru: "Восстановление Фундамента +4%", ka: "ფუნდამენტის აღდგენა +4%" }
    }
  ],
  STABILIZATION: [
    {
      task: { ru: "Фиксация прибыли", ka: "მოგების ფიქსაცია" },
      method: { ru: "Отложить 10% от любого прихода в 'Фонд Устойчивости'.", ka: "გადადეთ ნებისმიერი შემოსავლის 10% 'მდგრადობის ფონდში'." },
      targetMetric: { ru: "Рост Целостности +8%", ka: "მთლიანობის ზრდა +8%" }
    },
    {
        task: { ru: "Декларация воли", ka: "ნების დეკლარაცია" },
        method: { ru: "Записать 3 своих желания, которые вы игнорировали месяц.", ka: "ჩაწერეთ თქვენი 3 სურვილი, რომლებსაც ერთი თვე უგულებელყოფდით." },
        targetMetric: { ru: "Рост Агентности +6%", ka: "აგენტურობის ზრდა +6%" }
    }
  ],
  EXPANSION: [
    {
      task: { ru: "Инвестиция в масштаб", ka: "ინვესტიცია მასშტაბში" },
      method: { ru: "Купить обучение или инструмент, который ускорит ваш результат в 2 раза.", ka: "შეიძინეთ ტრენინგი ან ინსტრუმენტი, რომელიც თქვენს შედეგს 2-ჯერ დააჩქარებს." },
      targetMetric: { ru: "Рост Емкости +15%", ka: "ტევადობის ზრდა +15%" }
    },
    {
        task: { ru: "Делегирование хаоса", ka: "ქაოსის დელეგირება" },
        method: { ru: "Передать 1 рутинную задачу другому исполнителю.", ka: "გადაეცით 1 რუტინული დავალება სხვა შემსრულებელს." },
        targetMetric: { ru: "Свободная Емкость +10%", ka: "თავისუფალი ტევადობა +10%" }
    }
  ]
};

export function calculateGenesisCore(history: any[]): AnalysisResult {
  let f = 50, a = 50, r = 50, e = 15;
  const bugs: string[] = [];

  const weights: Record<string, any> = {
    'fear_of_punishment': { f: -15, a: -10, r: -5, e: 25 },
    'impulse_spend': { f: -10, a: 5, r: 15, e: 20 },
    'money_is_danger': { f: -30, a: -15, r: -5, e: 35 },
    'poverty_is_virtue': { f: 10, a: -25, r: -30, e: 10 },
    'money_is_tool': { f: 5, a: 25, r: 20, e: -10 },
    'self_permission': { f: 0, a: 15, r: 35, e: -15 },
    'imposter_syndrome': { f: -5, a: -30, r: -15, e: 25 },
    'hard_work_only': { f: 25, a: -5, r: -35, e: 15 },
    'capacity_expansion': { f: 10, a: 25, r: 25, e: 5 },
    'family_loyalty': { f: 30, a: -15, r: -20, e: 12 },
    'boundary_collapse': { f: -20, a: -40, r: 0, e: 30 },
    'fear_of_power': { f: 0, a: -20, r: -10, e: 20 },
    'scarcity_mindset': { f: -25, a: -10, r: -15, e: 30 },
    'short_term_bias': { f: 0, a: 10, r: -20, e: 15 }
  };

  history.forEach(h => {
    const w = weights[h.beliefKey];
    if (w) {
      f = Math.max(5, Math.min(95, f + w.f));
      a = Math.max(5, Math.min(95, a + w.a));
      r = Math.max(5, Math.min(95, r + w.r));
      e = Math.max(5, Math.min(95, e + w.e));
      if (w.e > 15) bugs.push(h.beliefKey);
    }
  });

  const integrity = Math.round(((f + a + r) / 3) * (1 - e / 200));
  const capacity = Math.round((f + r) / 2);
  const systemHealth = Math.round((integrity * capacity) / (e + 1));

  let phase: 'SANITATION' | 'STABILIZATION' | 'EXPANSION' = 'SANITATION';
  if (e < 25 && integrity > 45) phase = 'STABILIZATION';
  if (integrity > 70 && systemHealth > 50) phase = 'EXPANSION';

  let status: AnalysisResult['status'] = 'OPTIMAL';
  if (systemHealth < 20) status = 'CRITICAL';
  else if (systemHealth < 40) status = 'UNSTABLE';
  else if (e > 40) status = 'COMPENSATED';

  const roadmap: ProtocolStep[] = Array.from({ length: 7 }, (_, i) => {
    let p = phase;
    if (i < 2) p = 'SANITATION';
    else if (i < 5 && phase !== 'SANITATION') p = 'STABILIZATION';
    else if (phase === 'EXPANSION') p = 'EXPANSION';
    else p = 'SANITATION';

    const pool = TASKS_DB[p];
    const item = pool[i % pool.length];
    return { day: i + 1, phase: p, ...item };
  });

  const archs = {
    CRITICAL: { ru: "Разрушенный Узел", ka: "დანგრეული კვანძი", icon: "⚠️" },
    UNSTABLE: { ru: "Хаотичная Система", ka: "ქაოტური სისტემა", icon: "🌀" },
    COMPENSATED: { ru: "Жесткая Структура", ka: "ხისტი სტრუქტურა", icon: "🛡️" },
    OPTIMAL: { ru: "Архитектор Матрицы", ka: "მატრიცის არქიტექტორი", icon: "🏛️" }
  };

  return {
    state: { foundation: f, agency: a, resource: r, entropy: e },
    integrity,
    capacity,
    entropyScore: e,
    systemHealth,
    phase,
    archetype: archs[status],
    roadmap,
    graphPoints: [
      { x: 50, y: 50 - f / 2.2 },
      { x: 50 + r / 2.2, y: 50 + r / 4 },
      { x: 50 - a / 2.2, y: 50 + a / 4 }
    ],
    status,
    bugs: [...new Set(bugs)]
  };
}
