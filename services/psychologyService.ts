
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
    { task: { ru: "Ликвидация утечек", ka: "გაჟონვის ლიკვიდაცია" }, method: { ru: "Отключить уведомления во всех чатах на 24 часа.", ka: "გამორთეთ შეტყობინებები ყველა ჩატში 24 საათით." }, targetMetric: { ru: "Entropy -10%", ka: "ენტროპია -10%" } },
    { task: { ru: "Телесный сброс", ka: "სხეულებრივი განტვირთვა" }, method: { ru: "15 минут интенсивной ходьбы в полной тишине.", ka: "15 წუთი ინტენსიური სიარული სრულ სიჩუმეში." }, targetMetric: { ru: "Sync +15%", ka: "სინქრონი +15%" } }
  ],
  STABILIZATION: [
    { task: { ru: "Граница ресурса", ka: "რესურსის საზღვარი" }, method: { ru: "Определить сумму, которую вы НЕ потратите ни при каких условиях.", ka: "განსაზღვრეთ თანხა, რომელსაც არ დახარჯავთ არავითარ შემთხვევაში." }, targetMetric: { ru: "Foundation +12%", ka: "ფუნდამენტი +12%" } }
  ],
  EXPANSION: [
    { task: { ru: "Проявление воли", ka: "ნების გამოვლენა" }, method: { ru: "Заявить о своей цели публично или значимому человеку.", ka: "განაცხადეთ თქვენი მიზნის შესახებ საჯაროდ ან მნიშვნელოვან ადამიანთან." }, targetMetric: { ru: "Agency +20%", ka: "აგენტობა +20%" } }
  ]
};

export function calculateGenesisCore(history: any[]): AnalysisResult {
  let f = 50, a = 50, r = 50, e = 15;
  let syncScore = 100;
  const bugs: string[] = [];

  const weights: Record<string, any> = {
    'scarcity_mindset': { f: -15, a: -5, r: -10, e: 20 },
    'fear_of_punishment': { f: -12, a: -8, r: -5, e: 18 },
    'money_is_tool': { f: 5, a: 18, r: 22, e: -8 },
    'self_permission': { f: 0, a: 15, r: 30, e: -12 },
    'imposter_syndrome': { f: -5, a: -25, r: -10, e: 20 },
    'family_loyalty': { f: -22, a: -5, r: -8, e: 15 },
    'shame_of_success': { f: -10, a: -15, r: 12, e: 25 },
    'betrayal_trauma': { f: -5, a: -12, r: 5, e: 35 },
    'capacity_expansion': { f: 8, a: 15, r: 20, e: -10 },
    
    // MISSING WEIGHTS ADDED:
    'hard_work_only': { f: 10, a: 10, r: 5, e: 15 }, // Строит фундамент, но растит энтропию (усталость)
    'boundary_collapse': { f: -15, a: -15, r: -10, e: 25 }, // Разрушительно для всего
    'money_is_danger': { f: -10, a: -5, r: -25, e: 30 }, // Сильный удар по ресурсам
    'unconscious_fear': { f: -10, a: -10, r: -5, e: 15 },
    'short_term_bias': { f: -5, a: 5, r: 10, e: 20 },
    'impulse_spend': { f: -5, a: 5, r: -15, e: 15 },
    'fear_of_conflict': { f: -5, a: -15, r: 0, e: 10 }
  };

  history.forEach(h => {
    const w = weights[h.beliefKey] || { f: 0, a: 0, r: 0, e: 5 };
    
    // LATENCY RESISTANCE: Штраф за долгое принятие решения (> 5.5с)
    if (h.latency > 5500) {
      e += 5;
      bugs.push('latency_resistance');
    }

    // TOXIC RESOURCE LOGIC: Если фундамент слаб, приток ресурсов растит хаос (энтропию)
    if (f < 35 && w.r > 10) {
      e += w.r * 0.7;
      bugs.push('resource_toxicity');
    }

    f += w.f; a += w.a; r += w.r; e += w.e;

    // BODY-MIND SYNC: Конфликт телесного отклика и когнитивного выбора
    const syncMap: Record<string, string[]> = {
      's1': ['scarcity_mindset', 'fear_of_punishment', 'family_loyalty', 'shame_of_success', 'boundary_collapse', 'hard_work_only'], // Сжатие
      's2': ['self_permission', 'money_is_tool', 'capacity_expansion'], // Расширение
      's3': ['betrayal_trauma', 'money_is_danger', 'impulse_spend'], // Жар (гнев/страх)
      's4': ['imposter_syndrome', 'unconscious_fear', 'fear_of_conflict'] // Холод (замирание)
    };

    if (syncMap[h.sensation] && !syncMap[h.sensation].includes(h.beliefKey)) {
      syncScore -= 18;
      bugs.push('body_mind_conflict');
    }

    if (w.e > 12 || w.f < -15) bugs.push(h.beliefKey);
  });

  f = Math.max(5, Math.min(95, f));
  a = Math.max(5, Math.min(95, a));
  r = Math.max(5, Math.min(95, r));
  e = Math.max(5, Math.min(95, e));

  const integrity = Math.round(((f + a + r) / 3) * (1 - e / 200));
  const neuroSync = Math.max(0, syncScore);
  const systemHealth = Math.round((integrity * (neuroSync / 100)) / (Math.sqrt(e + 1) / 2.5));

  let phase: 'SANITATION' | 'STABILIZATION' | 'EXPANSION' = 'SANITATION';
  if (e < 30 && integrity > 45) phase = 'STABILIZATION';
  if (integrity > 65 && neuroSync > 75) phase = 'EXPANSION';

  const status = systemHealth < 20 ? 'CRITICAL' : systemHealth < 45 ? 'UNSTABLE' : e > 40 ? 'COMPENSATED' : 'OPTIMAL';

  const roadmap: ProtocolStep[] = Array.from({ length: 7 }, (_, i) => {
    const p = i < 2 ? 'SANITATION' : (phase === 'EXPANSION' ? 'EXPANSION' : 'STABILIZATION');
    const pool = TASKS_DB[p] || TASKS_DB['SANITATION'];
    return { day: i + 1, phase: p, ...pool[i % pool.length] };
  });

  return {
    state: { foundation: f, agency: a, resource: r, entropy: e },
    integrity, capacity: Math.round((f + r) / 2), entropyScore: e, neuroSync, systemHealth, phase,
    archetype: { ru: "Архитектор Матрицы", ka: "მატრიცის არქიტექტორი", icon: "🏛️" },
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
