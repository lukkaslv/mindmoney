
export interface LatticeEdge {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  stress: number; // 0-1 (влияет на цвет и толщину)
}

export interface AnalysisResult {
  archetypeKey: string;
  scenarioKey: string;
  resistanceLevel: number; // 0-100 (Кривизна пути)
  coherenceScore: number; // 0-100 (Целостность)
  lattice: LatticeEdge[];
  reflectionMirror: any[];
  stats: { safety: number; power: number; permission: number };
}

// Векторные веса для тел (Body Vectors)
const BODY_MAP: Record<string, { s: number, p: number, a: number }> = {
  'throat': { s: -0.5, p: -0.8, a: -0.2 }, // Блок голоса
  'chest': { s: -0.3, p: -0.2, a: -0.7 },  // Страх проявления
  'stomach': { s: -0.9, p: -0.1, a: -0.1 }, // Базовая небезопасность
  'shoulders': { s: -0.2, p: -0.6, a: 0.2 }, // Груз ответственности
  'warmth': { s: 0.6, p: 0.8, a: 0.9 },    // Поток
  'none': { s: 0, p: 0, a: 0 }             // Диссоциация
};

const BELIEF_MAP: Record<string, { s: number, p: number, a: number }> = {
  'capacity_expansion': { s: 0.2, p: 0.5, a: 1.0 },
  'self_permission': { s: 0.3, p: 1.0, a: 0.4 },
  'money_is_tool': { s: 0.8, p: 0.4, a: 0.4 },
  'imposter_syndrome': { s: -0.2, p: -0.8, a: 0.1 },
  'money_is_danger': { s: -1.0, p: -0.2, a: -0.4 },
  'poverty_is_virtue': { s: 0.4, p: -1.0, a: -0.6 }
};

export async function getPsychologicalFeedback(history: any[], scenes: any): Promise<AnalysisResult> {
  let s = 50, p = 50, a = 50;
  let points: {x: number, y: number, stress: number}[] = [{x: 50, y: 50, stress: 0}];
  let totalCurvature = 0;
  
  const processed = history.map((h, i) => {
    const bWeights = BELIEF_MAP[h.beliefKey] || { s: 0, p: 0, a: 0 };
    
    const bodyStr = h.bodySensation || "";
    let bKey = 'none';
    if (bodyStr.includes('горле') || bodyStr.includes('ყელში')) bKey = 'throat';
    else if (bodyStr.includes('тепла') || bodyStr.includes('სითბოს')) bKey = 'warmth';
    else if (bodyStr.includes('Холод') || bodyStr.includes('სიცივე')) bKey = 'stomach';
    else if (bodyStr.includes('плечах') || bodyStr.includes('მხრებზე')) bKey = 'shoulders';
    else if (bodyStr.includes('груди') || bodyStr.includes('მკერდში')) bKey = 'chest';
    
    const bodyWeights = BODY_MAP[bKey];
    
    // Расчет угла между намерением (Belief) и состоянием (Body)
    // Скалярное произведение для оценки когерентности
    const dotProduct = (bWeights.s * bodyWeights.s) + (bWeights.p * bodyWeights.p) + (bWeights.a * bodyWeights.a);
    const stress = dotProduct < 0 ? Math.abs(dotProduct) : 0;
    totalCurvature += stress;

    // Обновляем координаты
    s = Math.max(10, Math.min(100, s + (bWeights.s * 15) + (bodyWeights.s * 5)));
    p = Math.max(10, Math.min(100, p + (bWeights.p * 15) + (bodyWeights.p * 5)));
    a = Math.max(10, Math.min(100, a + (bWeights.a * 15) + (bodyWeights.a * 5)));

    // Генерация точки в 2D проекции 3D пространства
    const angle = (i / history.length) * Math.PI * 2;
    const radius = 10 + (s + p + a) / 6;
    points.push({
      x: 50 + Math.cos(angle) * radius,
      y: 50 + Math.sin(angle) * radius,
      stress
    });

    return { ...h, stress };
  });

  // Генерация решетки (Lattice)
  const lattice: LatticeEdge[] = [];
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const dist = Math.sqrt(Math.pow(points[i].x - points[j].x, 2) + Math.pow(points[i].y - points[j].y, 2));
      if (dist < 45) { // Связываем только близкие узлы
        lattice.push({
          x1: points[i].x, y1: points[i].y,
          x2: points[j].x, y2: points[j].y,
          stress: (points[i].stress + points[j].stress) / 2
        });
      }
    }
  }

  const coherence = Math.max(0, 100 - (totalCurvature * 15));
  const finalStats = { safety: Math.round(s), power: Math.round(a), permission: Math.round(p) };

  let archetype = "observer";
  if (finalStats.power > 75 && coherence < 50) archetype = "achiever";
  else if (finalStats.permission < 40 && finalStats.safety > 60) archetype = "keeper";
  else if (finalStats.power > 70 && finalStats.permission > 70) archetype = "expander";
  else if (finalStats.safety < 35) archetype = "prisoner";

  return {
    archetypeKey: archetype,
    scenarioKey: finalStats.safety > 50 ? "stable_path" : "constant_crisis",
    resistanceLevel: Math.round(totalCurvature * 20),
    coherenceScore: Math.round(coherence),
    lattice,
    stats: finalStats,
    reflectionMirror: processed.slice(-3).map(p => ({
      sceneTitle: scenes[p.sceneId]?.titleKey,
      thought: p.userReflection,
      isConflict: p.stress > 0.3
    })),
  };
}
