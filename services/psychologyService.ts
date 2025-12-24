
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
  neuroSync: number; // Новый показатель
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
    }
  ],
  STABILIZATION: [
    {
      task: { ru: "Фиксация прибыли", ka: "მოგების ფიქსაცია" },
      method: { ru: "Отложить 10% от любого прихода в 'Фонд Устойчивости'.", ka: "გადადეთ ნებისმიერი შემოსავლის 10% 'მდგრადობის ფონდში'." },
      targetMetric: { ru: "Рост Целостности +8%", ka: "მთლიანობის ზრდა +8%" }
    }
  ],
  EXPANSION: [
    {
      task: { ru: "Инвестиция в масштаб", ka: "ინვესტიცია მასშტაბში" },
      method: { ru: "Купить обучение или инструмент, который ускорит ваш результат в 2 раза.", ka: "შეიძინეთ ტრენინგი ან ინსტრუმენტი, რომელიც თქვენს შედეგს 2-ჯერ დააჩქარებს." },
      targetMetric: { ru: "Рост Емкости +15%", ka: "ტევადობის ზრდა +15%" }
    }
  ]
};

export function calculateGenesisCore(history: any[]): AnalysisResult {
  let f = 50, a = 50, r = 50, e = 15;
  let syncScore = 100;
  const bugs: string[] = [];

  const weights: Record<string, any> = {
    'fear_of_punishment': { f: -15, a: -10, r: -5, e: 25, syncMap: ['s1', 's4'] },
    'impulse_spend': { f: -10, a: 5, r: 15, e: 20, syncMap: ['s2', 's3'] },
    'money_is_tool': { f: 5, a: 25, r: 20, e: -10, syncMap: ['s2'] },
    'self_permission': { f: 0, a: 15, r: 35, e: -15, syncMap: ['s2'] },
    'imposter_syndrome': { f: -5, a: -30, r: -15, e: 25, syncMap: ['s1', 's4'] },
    'scarcity_mindset': { f: -25, a: -10, r: -15, e: 30, syncMap: ['s1'] }
  };

  history.forEach(h => {
    const w = weights[h.beliefKey];
    if (w) {
      f = Math.max(5, Math.min(95, f + w.f));
      a = Math.max(5, Math.min(95, a + w.a));
      r = Math.max(5, Math.min(95, r + w.r));
      e = Math.max(5, Math.min(95, e + w.e));

      // Детектор конфликта: если ощущение (sensation) не совпадает с ожидаемым для этого убеждения
      if (w.syncMap && !w.syncMap.includes(h.sensation)) {
        syncScore -= 15;
        bugs.push('body_mind_conflict');
      }

      if (w.e > 15) bugs.push(h.beliefKey);
    }
  });

  const integrity = Math.round(((f + a + r) / 3) * (1 - e / 200));
  const capacity = Math.round((f + r) / 2);
  const neuroSync = Math.max(0, syncScore);
  const systemHealth = Math.round((integrity * capacity * (neuroSync / 100)) / (e + 1));

  let phase: 'SANITATION' | 'STABILIZATION' | 'EXPANSION' = 'SANITATION';
  if (e < 25 && integrity > 45) phase = 'STABILIZATION';
  if (integrity > 70 && systemHealth > 50) phase = 'EXPANSION';

  let status: AnalysisResult['status'] = 'OPTIMAL';
  if (systemHealth < 15) status = 'CRITICAL';
  else if (systemHealth < 35) status = 'UNSTABLE';
  else if (e > 35) status = 'COMPENSATED';

  const roadmap: ProtocolStep[] = Array.from({ length: 7 }, (_, i) => {
    const p = i < 2 ? 'SANITATION' : (phase === 'EXPANSION' ? 'EXPANSION' : 'STABILIZATION');
    const pool = TASKS_DB[p] || TASKS_DB['SANITATION'];
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
    neuroSync,
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
