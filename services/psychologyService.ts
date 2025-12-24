
export interface LatticeEdge {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  stress: number;
}

export interface RoadmapStep {
  titleKey: string;
  descKey: string;
  homeworkKey: string;
}

export interface AnalysisResult {
  archetypeKey: string;
  scenarioKey: string;
  resistanceLevel: number;
  coherenceScore: number;
  elasticityIndex: number; // 0-100 (Насколько система выдержит рост)
  lattice: LatticeEdge[];
  reflectionMirror: any[];
  stats: { safety: number; power: number; permission: number };
  roadmap: RoadmapStep[];
}

const BODY_MAP: Record<string, { s: number, p: number, a: number }> = {
  'throat': { s: -0.5, p: -0.8, a: -0.2 },
  'chest': { s: -0.3, p: -0.2, a: -0.7 },
  'stomach': { s: -0.9, p: -0.1, a: -0.1 },
  'shoulders': { s: -0.2, p: -0.6, a: 0.2 },
  'warmth': { s: 0.6, p: 0.8, a: 0.9 },
  'none': { s: 0, p: 0, a: 0 }
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
  let maxStressPoint = 0;
  
  const processed = history.map((h, i) => {
    const bWeights = BELIEF_MAP[h.beliefKey] || { s: 0, p: 0, a: 0 };
    const bodyStr = h.bodySensation || "";
    let bKey = 'none';
    if (bodyStr.includes('горле') || bodyStr.includes('ყელში')) bKey = 'throat';
    else if (bodyStr.includes('тепла') || bodyStr.includes('სითბოს')) bKey = 'warmth';
    else if (bodyStr.includes('Холод') || bodyStr.includes('სიცივე')) bKey = 'stomach';
    else if (bodyStr.includes('плечах') || bodyStr.includes('მხрებზე')) bKey = 'shoulders';
    else if (bodyStr.includes('груди') || bodyStr.includes('მკერდში')) bKey = 'chest';
    
    const bodyWeights = BODY_MAP[bKey];
    const dotProduct = (bWeights.s * bodyWeights.s) + (bWeights.p * bodyWeights.p) + (bWeights.a * bodyWeights.a);
    const stress = dotProduct < 0 ? Math.abs(dotProduct) : 0;
    
    totalCurvature += stress;
    if (stress > maxStressPoint) maxStressPoint = stress;

    s = Math.max(10, Math.min(100, s + (bWeights.s * 15) + (bodyWeights.s * 5)));
    p = Math.max(10, Math.min(100, p + (bWeights.p * 15) + (bodyWeights.p * 5)));
    a = Math.max(10, Math.min(100, a + (bWeights.a * 15) + (bodyWeights.a * 5)));

    const angle = (i / history.length) * Math.PI * 2;
    const radius = 15 + (s + p + a) / 8;
    points.push({ x: 50 + Math.cos(angle) * radius, y: 50 + Math.sin(angle) * radius, stress });

    return { ...h, stress };
  });

  const lattice: LatticeEdge[] = [];
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const dist = Math.sqrt(Math.pow(points[i].x - points[j].x, 2) + Math.pow(points[i].y - points[j].y, 2));
      if (dist < 40) {
        lattice.push({
          x1: points[i].x, y1: points[i].y,
          x2: points[j].x, y2: points[j].y,
          stress: (points[i].stress + points[j].stress) / 2
        });
      }
    }
  }

  const coherence = Math.max(0, 100 - (totalCurvature * 15));
  const elasticity = Math.round((coherence * s) / 100); // Формула: Целостность * Базовая безопасность

  const stats = { safety: Math.round(s), power: Math.round(a), permission: Math.round(p) };

  // Генерация Дорожной Карты (Roadmap)
  const roadmap: RoadmapStep[] = [];
  
  // Шаг 1: Фундамент (на основе Safety)
  if (stats.safety < 60) {
    roadmap.push({ titleKey: 'roadmap.safety.title', descKey: 'roadmap.safety.desc', homeworkKey: 'roadmap.safety.hw' });
  } else {
    roadmap.push({ titleKey: 'roadmap.stabilization.title', descKey: 'roadmap.stabilization.desc', homeworkKey: 'roadmap.stabilization.hw' });
  }

  // Шаг 2: Разрешение (на основе Permission)
  if (stats.permission < 60) {
    roadmap.push({ titleKey: 'roadmap.permission.title', descKey: 'roadmap.permission.desc', homeworkKey: 'roadmap.permission.hw' });
  } else {
    roadmap.push({ titleKey: 'roadmap.pleasure.title', descKey: 'roadmap.pleasure.desc', homeworkKey: 'roadmap.pleasure.hw' });
  }

  // Шаг 3: Масштаб (на основе Power)
  if (stats.power < 60) {
    roadmap.push({ titleKey: 'roadmap.power.title', descKey: 'roadmap.power.desc', homeworkKey: 'roadmap.power.hw' });
  } else {
    roadmap.push({ titleKey: 'roadmap.dominance.title', descKey: 'roadmap.dominance.desc', homeworkKey: 'roadmap.dominance.hw' });
  }

  let archetype = "observer";
  if (stats.power > 75 && coherence < 50) archetype = "achiever";
  else if (stats.permission < 40 && stats.safety > 60) archetype = "keeper";
  else if (stats.power > 70 && stats.permission > 70) archetype = "expander";
  else if (stats.safety < 35) archetype = "prisoner";

  return {
    archetypeKey: archetype,
    scenarioKey: stats.safety > 50 ? "stable_path" : "constant_crisis",
    resistanceLevel: Math.round(totalCurvature * 20),
    coherenceScore: Math.round(coherence),
    elasticityIndex: elasticity,
    lattice,
    stats,
    reflectionMirror: processed.slice(-3).map(p => ({
      sceneTitle: scenes[p.sceneId]?.titleKey,
      thought: p.userReflection,
      isConflict: p.stress > 0.3
    })),
    roadmap
  };
}
