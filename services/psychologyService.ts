
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
    { task: { ru: "Ликвидация утечек", ka: "გაჟონვის ლიკვიდაცია" }, method: { ru: "Удалить 3 приложения, отнимающих время.", ka: "წაშალეთ 3 აპლიკაცია, რომელიც დროს გართმევთ." }, targetMetric: { ru: "Entropy -8%", ka: "ენტროპია -8%" } },
    { task: { ru: "Телесный аудит", ka: "სხეულის აუდიტი" }, method: { ru: "5 минут сканирования зажимов в теле.", ka: "5 წუთი სხეულში დაძაბულობის სკანირება." }, targetMetric: { ru: "Sync +15%", ka: "სინქრონი +15%" } }
  ],
  STABILIZATION: [
    { task: { ru: "Опора ресурсов", ka: "რესურსების საყრდენი" }, method: { ru: "Зафиксировать 10% дохода как 'неприкасаемые'.", ka: "დააფიქსირეთ შემოსავლის 10% როგორც 'ხელშეუხებელი'." }, targetMetric: { ru: "Foundation +10%", ka: "ფუნდამენტი +10%" } }
  ],
  EXPANSION: [
    { task: { ru: "Декларация воли", ka: "ნების დეკლარაცია" }, method: { ru: "Принять решение, которое откладывали месяц.", ka: "მიიღეთ გადაწყვეტილება, რომელსაც ერთი თვე აჭიანურებდით." }, targetMetric: { ru: "Agency +20%", ka: "აგენტობა +20%" } }
  ]
};

export function calculateGenesisCore(history: any[]): AnalysisResult {
  let f = 50, a = 50, r = 50, e = 15;
  let syncScore = 100;
  const bugs: string[] = [];

  const weights: Record<string, any> = {
    'fear_of_punishment': { f: -12, a: -5, r: -5, e: 15 },
    'impulse_spend': { f: -5, a: 5, r: 15, e: 20 },
    'money_is_tool': { f: 5, a: 15, r: 20, e: -5 },
    'self_permission': { f: 0, a: 10, r: 25, e: -10 },
    'imposter_syndrome': { f: -5, a: -20, r: -10, e: 18 },
    'scarcity_mindset': { f: -15, a: -5, r: -10, e: 22 },
    'family_loyalty': { f: -20, a: -5, r: -5, e: 12 },
    'shame_of_success': { f: -8, a: -12, r: 10, e: 25 },
    'betrayal_trauma': { f: -5, a: -10, r: 5, e: 30 },
    'short_term_bias': { f: -5, a: 5, r: 10, e: 15 },
    'unconscious_fear': { f: -10, a: -10, r: -5, e: 20 },
    'capacity_expansion': { f: 5, a: 12, r: 15, e: -12 }
  };

  history.forEach(h => {
    const w = weights[h.beliefKey] || { f: 0, a: 0, r: 0, e: 5 };
    
    // LATENCY PENALTY
    if (h.latency > 5000) {
      e += 2;
      bugs.push('latency_resistance');
    }

    // NON-LINEAR LOGIC
    if (f < 40 && w.r > 10) {
      e += w.r * 0.5;
      bugs.push('resource_toxicity');
    }

    f += w.f; a += w.a; r += w.r; e += w.e;

    // SYNC CHECK
    const syncMap: Record<string, string[]> = {
      's1': ['fear_of_punishment', 'imposter_syndrome', 'scarcity_mindset', 'shame_of_success'],
      's2': ['self_permission', 'money_is_tool', 'capacity_expansion'],
      's3': ['impulse_spend', 'betrayal_trauma'],
      's4': ['fear_of_punishment', 'unconscious_fear']
    };

    if (syncMap[h.sensation] && !syncMap[h.sensation].includes(h.beliefKey)) {
      syncScore -= 15;
      bugs.push('body_mind_conflict');
    }

    if (w.e > 10) bugs.push(h.beliefKey);
  });

  f = Math.max(5, Math.min(95, f));
  a = Math.max(5, Math.min(95, a));
  r = Math.max(5, Math.min(95, r));
  e = Math.max(5, Math.min(95, e));

  const integrity = Math.round(((f + a + r) / 3) * (1 - e / 200));
  const capacity = Math.round((f + r) / 2);
  const neuroSync = Math.max(0, syncScore);
  const systemHealth = Math.round((integrity * (neuroSync / 100)) / (Math.sqrt(e + 1) / 3));

  let phase: 'SANITATION' | 'STABILIZATION' | 'EXPANSION' = 'SANITATION';
  if (e < 35 && integrity > 45) phase = 'STABILIZATION';
  if (integrity > 65 && neuroSync > 75) phase = 'EXPANSION';

  const status = systemHealth < 25 ? 'CRITICAL' : systemHealth < 50 ? 'UNSTABLE' : e > 45 ? 'COMPENSATED' : 'OPTIMAL';

  const roadmap: ProtocolStep[] = Array.from({ length: 7 }, (_, i) => {
    const p = i < 2 ? 'SANITATION' : (phase === 'EXPANSION' ? 'EXPANSION' : 'STABILIZATION');
    const pool = TASKS_DB[p] || TASKS_DB['SANITATION'];
    const item = pool[i % pool.length];
    return { day: i + 1, phase: p, ...item };
  });

  return {
    state: { foundation: f, agency: a, resource: r, entropy: e },
    integrity, capacity, entropyScore: e, neuroSync, systemHealth, phase,
    archetype: { ru: "Архитектор Матрицы", ka: "მატრიცის არქიტექტორი", icon: "🏛️" }, // Динамика в App.tsx
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
