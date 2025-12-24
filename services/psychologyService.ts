
export interface VectorState {
  foundation: number;
  momentum: number;
  space: number;
  friction: number;
}

export interface ProtocolStep {
  day: number;
  type: 'CLEANUP' | 'STABILIZE' | 'EXPAND';
  task: { ru: string; ka: string };
  method: { ru: string; ka: string };
  metrics: { ru: string; ka: string };
}

export interface AnalysisResult {
  state: VectorState;
  integrity: number;
  homeostasis: number;
  potential: number;
  phase: 'SANITATION' | 'STABILIZATION' | 'EXPANSION';
  archetype: { ru: string; ka: string; icon: string };
  metaphorSummary: { ru: string; ka: string };
  roadmap: ProtocolStep[];
  graphPoints: { x: number; y: number }[];
  status: 'OPTIMAL' | 'COMPENSATED' | 'UNSTABLE' | 'CRITICAL';
  detectedViruses: string[];
}

const SCIENTIFIC_PROTOCOLS: Record<string, any[]> = {
  CLEANUP: [
    {
      task: { ru: "Детокс контактов", ka: "კონტაქტების დეტოქსი" },
      method: { ru: "Идентифицировать 1 узел, запрашивающий ресурс без отдачи. Ограничить доступ на 48ч.", ka: "მოახდინეთ იდენტიფიცირება 1 კვანძის, რომელიც მოითხოვს რესურსს უკუგების გარეშე. შეზღუდეთ წვდომა 48 სთ-ით." },
      metrics: { ru: "Снижение Энтропии на 0.05", ka: "ენტროპიის შემცირება 0.05-ით" }
    },
    {
      task: { ru: "Финансовая Санация", ka: "ფინანსური სანაცია" },
      method: { ru: "Найти автоматическую трату, которая не приносит пользы. Удалить.", ka: "იპოვეთ ავტომატური ხარჯი, რომელიც სარგებელს არ მოგიტანთ. წაშალეთ." },
      metrics: { ru: "Рост Integrity +2%", ka: "Integrity-ს ზრდა +2%" }
    }
  ],
  STABILIZE: [
    {
      task: { ru: "Укрепление Контейнера", ka: "კონტეინერის გამაგრება" },
      method: { ru: "Выполнить одно обязательство перед собой, данное более месяца назад.", ka: "შეასრულეთ ერთი პირობა საკუთარი თავის წინაშე, რომელიც ერთ თვეზე მეტი ხნის წინ დადეთ." },
      metrics: { ru: "Рост Homeostasis +10%", ka: "Homeostasis-ის ზრდა +10%" }
    }
  ],
  EXPAND: [
    {
      task: { ru: "Контролируемый Риск", ka: "კონტროლირებადი რისკი" },
      method: { ru: "Инвестировать 1 час в изучение навыка, который пугает своим масштабом.", ka: "დააბანდეთ 1 საათი იმ უნარის შესწავლაში, რომელიც თავისი მასშტაბით გაშინებთ." },
      metrics: { ru: "Рост Capacity +5%", ka: "Capacity-ს ზრდა +5%" }
    }
  ]
};

export function calculateGenesisCore(history: any[]): AnalysisResult {
  let f = 50, m = 50, s = 50, e = 15;
  const viruses: string[] = [];

  const weightMatrix: Record<string, any> = {
    'fear_of_punishment': { f: -12, m: -4, s: -10, e: 22 },
    'impulse_spend': { f: -8, m: 20, s: 12, e: 18 },
    'money_is_danger': { f: -25, m: -10, s: -5, e: 30 },
    'poverty_is_virtue': { f: 15, m: -20, s: -25, e: 8 },
    'money_is_tool': { f: 10, m: 25, s: 15, e: -10 },
    'self_permission': { f: 0, m: 15, s: 30, e: -15 },
    'imposter_syndrome': { f: -10, m: -22, s: -15, e: 20 },
    'hard_work_only': { f: 30, m: -5, s: -30, e: 15 },
    'capacity_expansion': { f: 10, m: 22, s: 25, e: 5 },
    'guilt_after_pleasure': { f: -15, m: -10, s: -25, e: 22 },
    'family_loyalty': { f: 25, m: -15, s: -20, e: 10 }
  };

  history.forEach(h => {
    const w = weightMatrix[h.beliefKey];
    if (w) {
      f = Math.max(0, Math.min(100, f + w.f));
      m = Math.max(0, Math.min(100, m + w.m));
      s = Math.max(0, Math.min(100, s + w.s));
      e = Math.max(0, Math.min(100, e + w.e));
      if (w.e > 15) viruses.push(h.beliefKey);
    }
  });

  const imbalance = (Math.abs(f - m) + Math.abs(m - s) + Math.abs(s - f)) / 3;
  const integrity = Math.round(((f + m + s) / 3) * (1 - e / 150) * (1 - imbalance / 150));
  const homeostasis = Math.round(100 - imbalance - (e * 0.4));
  const potential = Math.round((f + m + s) / 3 + integrity / 2);

  let phase: 'SANITATION' | 'STABILIZATION' | 'EXPANSION' = 'SANITATION';
  if (e < 20 && integrity > 50) phase = 'STABILIZATION';
  if (integrity > 75 && homeostasis > 70) phase = 'EXPANSION';

  let status: AnalysisResult['status'] = 'OPTIMAL';
  if (integrity < 30) status = 'CRITICAL';
  else if (integrity < 50) status = 'UNSTABLE';
  else if (imbalance > 35) status = 'COMPENSATED';

  const roadmap: ProtocolStep[] = Array.from({ length: 7 }, (_, i) => {
    let pType: 'CLEANUP' | 'STABILIZE' | 'EXPAND' = 'CLEANUP';
    if (phase === 'SANITATION') pType = 'CLEANUP';
    else if (phase === 'STABILIZATION') pType = i % 2 === 0 ? 'STABILIZE' : 'CLEANUP';
    else pType = i % 3 === 0 ? 'EXPAND' : 'STABILIZE';

    const pool = SCIENTIFIC_PROTOCOLS[pType];
    const item = pool[i % pool.length];
    return { day: i + 1, type: pType, ...item };
  });

  const archetypes = {
    CRITICAL: { ru: "Разрушенный Узел", ka: "დანგრეული კვანძი", icon: "⚠️" },
    UNSTABLE: { ru: "Адаптивный Скиталец", ka: "ადაპტური მოხეტე", icon: "🌑" },
    COMPENSATED: { ru: "Жесткая Структура", ka: "მყარი სტრუქტურა", icon: "🛡️" },
    OPTIMAL: { ru: "Архитектор Матрицы", ka: "მატრიცის არქიტექტორი", icon: "🏛️" }
  };

  return {
    state: { foundation: f, momentum: m, space: s, friction: e },
    integrity,
    homeostasis,
    potential,
    phase,
    archetype: archetypes[status],
    metaphorSummary: {
      ru: status === 'CRITICAL' ? "Система в режиме выживания. Экспансия невозможна." : "Ядро синхронизировано. Доступен переход к следующей фазе.",
      ka: status === 'CRITICAL' ? "სისტემა გადარჩენის რეჟიმშია. ექსპანსია შეუძლებელია." : "ბირთვი სინქრონიზებულია. ხელმისაწვდომია შემდეგ ფაზაზე გადასვლა."
    },
    graphPoints: [
      { x: 50, y: 50 - f/2 },
      { x: 50 + s/2, y: 50 + s/4 },
      { x: 50 - m/2, y: 50 + m/4 }
    ],
    status,
    roadmap,
    detectedViruses: [...new Set(viruses)]
  };
}
