
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
  completed?: boolean;
}

export interface AnalysisResult {
  state: VectorState;
  integrity: number;
  capacity: number;
  entropyScore: number;
  systemHealth: number;
  neuroSync: number;
  phase: 'SANITATION' | 'STABILIZATION' | 'EXPANSION';
  archetype: { ru: string; ka: string; icon: string };
  roadmap: ProtocolStep[];
  graphPoints: { x: number; y: number }[];
  status: 'OPTIMAL' | 'COMPENSATED' | 'UNSTABLE' | 'CRITICAL';
  bugs: string[];
}

const TASKS_DB: Record<string, any[]> = {
  SANITATION: [
    { task: { ru: "Ликвидация утечек", ka: "გაჟონვის ლიკვიდაცია" }, method: { ru: "Отписаться от 5 ненужных рассылок сегодня.", ka: "დღესვე გამოიწერეთ 5 არასაჭირო გზავნილი." }, targetMetric: { ru: "Entropy -5%", ka: "ენტროპია -5%" } },
    { task: { ru: "Телесный сброс", ka: "სხეულებრივი განტვირთვა" }, method: { ru: "10 минут прогрессивной мышечной релаксации.", ka: "10 წუთი პროგრესული კუნთოვანი რელაქსაცია." }, targetMetric: { ru: "Sync +10%", ka: "სინქრონი +10%" } }
  ],
  STABILIZATION: [
    { task: { ru: "Граница ресурсов", ka: "რესურსების საზღვარი" }, method: { ru: "Зафиксировать минимальный несгораемый остаток на счету.", ka: "დააფიქსირეთ ანგარიშზე მინიმალური ხელშეუხებელი ნაშთი." }, targetMetric: { ru: "Foundation +7%", ka: "ფუნდამენტი +7%" } }
  ],
  EXPANSION: [
    { task: { ru: "Масштаб влияния", ka: "გავლენის მასშტაბი" }, method: { ru: "Публичное заявление о своих целях в соцсетях.", ka: "თქვენი მიზნების საჯარო განცხადება სოციალურ ქსელებში." }, targetMetric: { ru: "Capacity +15%", ka: "ტევადობა +15%" } }
  ]
};

export function calculateGenesisCore(history: any[]): AnalysisResult {
  let f = 50, a = 50, r = 50, e = 15;
  let syncScore = 100;
  let latencyPenalties = 0;
  const bugs: string[] = [];

  const weights: Record<string, any> = {
    'fear_of_punishment': { f: -12, a: -8, r: -5, e: 20 },
    'impulse_spend': { f: -8, a: 5, r: 12, e: 18 },
    'money_is_tool': { f: 5, a: 20, r: 18, e: -8 },
    'self_permission': { f: 0, a: 12, r: 30, e: -12 },
    'imposter_syndrome': { f: -5, a: -25, r: -12, e: 22 },
    'scarcity_mindset': { f: -20, a: -8, r: -12, e: 25 },
    'family_loyalty': { f: -25, a: -5, r: -8, e: 15 },
    'debt_trap': { f: -5, a: -20, r: 8, e: 20 },
    'betrayal_trauma': { f: -8, a: -8, r: 12, e: 30 }
  };

  history.forEach(h => {
    const w = weights[h.beliefKey] || { f: 0, a: 0, r: 0, e: 5 };
    
    // LATENCY CONFLICT: Если думал > 5с, это сопротивление
    if (h.latency > 5000) {
      latencyPenalties += 1;
      e += 3;
      bugs.push('latency_resistance');
    }

    f += w.f; a += w.a; r += w.r; e += w.e;

    // NON-LINEAR LOGIC: Если фундамент слаб, ресурсы растят энтропию
    if (f < 35 && w.r > 0) {
      e += w.r * 0.8;
      bugs.push('resource_toxicity');
    }

    // SYNC CHECK
    const syncMap: Record<string, string[]> = {
      's1': ['fear_of_punishment', 'imposter_syndrome', 'scarcity_mindset', 'family_loyalty'],
      's2': ['self_permission', 'money_is_tool', 'capacity_expansion'],
      's3': ['impulse_spend', 'social_conflict'],
      's4': ['fear_of_punishment', 'betrayal_trauma', 'unconscious_fear']
    };

    if (syncMap[h.sensation] && !syncMap[h.sensation].includes(h.beliefKey)) {
      syncScore -= 12;
      bugs.push('body_mind_conflict');
    }

    if (w.e > 15 || w.f < -15) bugs.push(h.beliefKey);
  });

  // Clamp values
  f = Math.max(5, Math.min(95, f));
  a = Math.max(5, Math.min(95, a));
  r = Math.max(5, Math.min(95, r));
  e = Math.max(5, Math.min(95, e));

  const integrity = Math.round(((f + a + r) / 3) * (1 - e / 200));
  const capacity = Math.round((f + r) / 2);
  const neuroSync = Math.max(0, syncScore);
  const systemHealth = Math.round((integrity * (neuroSync / 100)) / (Math.sqrt(e + 1) / 2));

  let phase: 'SANITATION' | 'STABILIZATION' | 'EXPANSION' = 'SANITATION';
  if (e < 30 && integrity > 40) phase = 'STABILIZATION';
  if (integrity > 65 && neuroSync > 70) phase = 'EXPANSION';

  let status: AnalysisResult['status'] = 'OPTIMAL';
  if (systemHealth < 20) status = 'CRITICAL';
  else if (systemHealth < 45) status = 'UNSTABLE';
  else if (e > 40) status = 'COMPENSATED';

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
    integrity, capacity, entropyScore: e, neuroSync, systemHealth, phase,
    archetype: archs[status],
    roadmap,
    graphPoints: [
      { x: 50, y: 50 - f / 2.5 },
      { x: 50 + r / 2.2, y: 50 + r / 3.5 },
      { x: 50 - a / 2.2, y: 50 + a / 3.5 }
    ],
    status,
    bugs: [...new Set(bugs)]
  };
}
