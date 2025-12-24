
export interface AnalysisResult {
  archetypeKey: string;
  conflictKey: string;
  bodyAnalysisKey: string;
  analysisTextKeys: string[];
  scoreSafety: number;
  scorePermission: number;
  scoreAmbition: number;
  reflectionMirror: {
    sceneTitle: string;
    thought: string;
    sensation: string;
  }[];
  defenseMechanisms: string[];
  roadmapKeys: {
    now: string;
    month1: string;
    month6: string;
  };
}

const TRAITS: Record<string, any> = {
  'fear_of_punishment': { s: -25, p: -5, a: 0, conflict: 'safety_vs_show', defense: 'Проекция' },
  'impulse_spend': { s: -15, p: 20, a: 10, conflict: 'pleasure_vs_stability', defense: 'Отыгрывание' },
  'money_is_danger': { s: -35, p: -10, a: -5, conflict: 'survival_vs_growth', defense: 'Избегание' },
  'poverty_is_virtue': { s: 15, p: -30, a: -20, conflict: 'loyalty_vs_success', defense: 'Морализация' },
  'fear_of_conflict': { s: 10, p: -25, a: -15, conflict: 'loyalty_vs_success', defense: 'Конформизм' },
  'money_is_tool': { s: 20, p: 20, a: 20, conflict: 'autonomy', defense: 'Рационализация' },
  'imposter_syndrome': { s: -10, p: -30, a: 15, conflict: 'self_worth', defense: 'Обесценивание' },
  'hard_work_only': { s: -15, p: 10, a: 25, conflict: 'survival_vs_growth', defense: 'Мазохизм' },
  'capacity_expansion': { s: 15, p: 30, a: 30, conflict: 'autonomy', defense: 'Интеллектуализация' },
  'family_loyalty': { s: 15, p: -35, a: -15, conflict: 'loyalty_vs_success', defense: 'Интроекция' },
  'guilt_after_pleasure': { s: -20, p: -25, a: 10, conflict: 'pleasure_vs_stability', defense: 'Аннулирование' },
  'self_permission': { s: 25, p: 35, a: 25, conflict: 'self_worth', defense: 'Принятие' }
};

export async function getPsychologicalFeedback(history: any[], scenes: any): Promise<AnalysisResult> {
  let safety = 50, permission = 50, ambition = 50;
  let traits: string[] = [];
  let defenses: string[] = [];
  let reflectionMirror: any[] = [];

  history.forEach(item => {
    const t = TRAITS[item.beliefKey];
    if (t) {
      safety = Math.max(0, Math.min(100, safety + t.s));
      permission = Math.max(0, Math.min(100, permission + t.p));
      ambition = Math.max(0, Math.min(100, ambition + t.a));
      traits.push(item.beliefKey);
      defenses.push(t.defense);
    }
    
    // Собираем "Зеркало" только если есть осмысленный ввод
    if (item.userReflection || item.bodySensation) {
      reflectionMirror.push({
        sceneTitle: scenes[item.sceneId]?.titleKey || "",
        thought: item.userReflection || "...",
        sensation: item.bodySensation || ""
      });
    }
  });

  let archetype = "observer";
  if (safety < 45 && permission < 45) archetype = "prisoner";
  else if (safety < 45 && ambition > 60) archetype = "achiever";
  else if (permission < 45 && safety > 65) archetype = "keeper";
  else if (permission > 65 && ambition > 65) archetype = "expander";
  else if (ambition > 70 && safety < 40) archetype = "architect";

  return {
    archetypeKey: archetype,
    conflictKey: TRAITS[traits[traits.length - 1] || 'money_is_tool'].conflict,
    bodyAnalysisKey: (history[history.length-1]?.bodySensation || "none"),
    analysisTextKeys: Array.from(new Set(traits.slice(-3))),
    scoreSafety: safety,
    scorePermission: permission,
    scoreAmbition: ambition,
    reflectionMirror: reflectionMirror.slice(-4), // Берем последние ключевые моменты
    defenseMechanisms: Array.from(new Set(defenses)).slice(0, 3),
    roadmapKeys: {
      now: safety < 45 ? "grounding" : "permission",
      month1: permission < 45 ? "separation" : "delegation",
      month6: ambition > 60 ? "investment" : "passive"
    }
  };
}
