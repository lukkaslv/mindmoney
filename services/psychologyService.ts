
export interface AnalysisResult {
  archetypeKey: string;
  patternKey: string; // Новое: синтезированный жизненный сценарий
  trapKey: string;    // Новое: скрытая ловушка психики
  scoreSafety: number;
  scorePermission: number;
  scoreAmbition: number;
  levels: {
    safety: 'low' | 'mid' | 'high';
    permission: 'low' | 'mid' | 'high';
    ambition: 'low' | 'mid' | 'high';
  };
  reflectionMirror: {
    sceneTitle: string;
    thought: string;
    sensation: string;
    insight: string; // Новое: терапевтический комментарий к выбору
  }[];
  defenseMechanisms: string[];
  roadmap: {
    title: string;
    steps: { label: string; action: string }[];
  };
  // Fix: Added missing analysisTextKeys to match usage in App.tsx
  analysisTextKeys: string[];
}

const TRAITS: Record<string, any> = {
  'fear_of_punishment': { s: -20, p: -5, a: 0, conflict: 'safety_vs_show', insight: 'insight_punishment' },
  'impulse_spend': { s: -10, p: 15, a: 10, conflict: 'pleasure_vs_stability', insight: 'insight_impulse' },
  'money_is_danger': { s: -30, p: -10, a: -5, conflict: 'survival_vs_growth', insight: 'insight_danger' },
  'poverty_is_virtue': { s: 10, p: -25, a: -15, conflict: 'loyalty_vs_success', insight: 'insight_virtue' },
  'fear_of_conflict': { s: 5, p: -20, a: -10, conflict: 'loyalty_vs_success', insight: 'insight_conflict' },
  'money_is_tool': { s: 15, p: 15, a: 15, conflict: 'autonomy', insight: 'insight_tool' },
  'imposter_syndrome': { s: -5, p: -25, a: 10, conflict: 'self_worth', insight: 'insight_imposter' },
  'hard_work_only': { s: -10, p: 5, a: 20, conflict: 'survival_vs_growth', insight: 'insight_hardwork' },
  'capacity_expansion': { s: 10, p: 25, a: 25, conflict: 'autonomy', insight: 'insight_expansion' },
  'family_loyalty': { s: 10, p: -30, a: -10, conflict: 'loyalty_vs_success', insight: 'insight_loyalty' },
  'guilt_after_pleasure': { s: -15, p: -20, a: 5, conflict: 'pleasure_vs_stability', insight: 'insight_guilt' },
  'self_permission': { s: 20, p: 30, a: 20, conflict: 'self_worth', insight: 'insight_permission' }
};

const getLevel = (val: number): 'low' | 'mid' | 'high' => {
  if (val < 40) return 'low';
  if (val < 70) return 'mid';
  return 'high';
};

export async function getPsychologicalFeedback(history: any[], scenes: any): Promise<AnalysisResult> {
  let safety = 50, permission = 50, ambition = 50;
  let traits: string[] = [];
  let reflectionMirror: any[] = [];
  
  history.forEach(item => {
    const t = TRAITS[item.beliefKey];
    if (t) {
      safety = Math.max(0, Math.min(100, safety + t.s));
      permission = Math.max(0, Math.min(100, permission + t.p));
      ambition = Math.max(0, Math.min(100, ambition + t.a));
      traits.push(item.beliefKey);
      
      reflectionMirror.push({
        sceneTitle: scenes[item.sceneId]?.titleKey || "",
        thought: item.userReflection || "...",
        sensation: item.bodySensation || "",
        insight: t.insight
      });
    }
  });

  const levels = {
    safety: getLevel(safety),
    permission: getLevel(permission),
    ambition: getLevel(ambition)
  };

  // Логика синтеза паттернов (СЛОЖНЫЙ АНАЛИЗ)
  let pattern = "neutral";
  let trap = "none";
  let archetype = "observer";

  if (levels.safety === 'low' && levels.ambition === 'high') {
    pattern = "burnout_marathon";
    trap = "anxious_achievement";
    archetype = "achiever";
  } else if (levels.permission === 'low' && levels.safety === 'high') {
    pattern = "golden_cage";
    trap = "fear_of_joy";
    archetype = "keeper";
  } else if (levels.safety === 'low' && levels.permission === 'low') {
    pattern = "survival_mode";
    trap = "scarcity_mindset";
    archetype = "prisoner";
  } else if (levels.ambition === 'high' && levels.permission === 'high') {
    pattern = "limitless_growth";
    trap = "inflation_of_self";
    archetype = "expander";
  }

  // Динамическая дорожная карта
  const roadmapSteps = [];
  if (levels.safety === 'low') roadmapSteps.push({ label: "step_safety_title", action: "step_safety_desc" });
  if (levels.permission === 'low') roadmapSteps.push({ label: "step_perm_title", action: "step_perm_desc" });
  if (levels.ambition === 'low') roadmapSteps.push({ label: "step_amb_title", action: "step_amb_desc" });
  if (roadmapSteps.length === 0) roadmapSteps.push({ label: "step_master_title", action: "step_master_desc" });

  return {
    archetypeKey: archetype,
    patternKey: pattern,
    trapKey: trap,
    scoreSafety: safety,
    scorePermission: permission,
    scoreAmbition: ambition,
    levels,
    reflectionMirror: reflectionMirror.slice(-4),
    defenseMechanisms: ["Проекция", "Интроекция", "Рационализация"].slice(0, 2),
    roadmap: {
      title: "roadmap_main_title",
      steps: roadmapSteps
    },
    // Fix: Return the collected traits as analysisTextKeys
    analysisTextKeys: traits
  };
}
