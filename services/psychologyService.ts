
export interface AnalysisResult {
  archetypeKey: string;
  patternKey: string;
  trapKey: string;
  scenarioKey: string;
  scoreSafety: number;
  scorePermission: number;
  scoreAmbition: number;
  stressLevel: number;
  levels: {
    safety: 'low' | 'mid' | 'high';
    permission: 'low' | 'mid' | 'high';
    ambition: 'low' | 'mid' | 'high';
  };
  reflectionMirror: {
    sceneTitle: string;
    thought: string;
    sensation: string;
    insight: string;
    confrontation: string;
  }[];
  analysisTextKeys: string[];
  defenseMechanisms: string[];
  roadmap: {
    title: string;
    steps: { label: string; action: string; homework: string }[];
  };
}

const CONFRONTATIONS: Record<string, string> = {
  'fear_of_punishment_throat': 'confront_voice_block',
  'impulse_spend_warmth': 'confront_euphoria_trap',
  'money_is_danger_cold': 'confront_survival_chill',
  'poverty_is_virtue_shoulders': 'confront_moral_burden'
};

const TRAITS: Record<string, any> = {
  'fear_of_punishment': { s: -20, p: -5, a: 0, insight: 'insight_punishment' },
  'impulse_spend': { s: -10, p: 15, a: 10, insight: 'insight_impulse' },
  'money_is_danger': { s: -30, p: -10, a: -5, insight: 'insight_danger' },
  'poverty_is_virtue': { s: 10, p: -25, a: -15, insight: 'insight_virtue' },
  'fear_of_conflict': { s: 5, p: -20, a: -10, insight: 'insight_conflict' },
  'money_is_tool': { s: 15, p: 15, a: 15, insight: 'insight_tool' },
  'imposter_syndrome': { s: -5, p: -25, a: 10, insight: 'insight_imposter' },
  'hard_work_only': { s: -10, p: 5, a: 20, insight: 'insight_hardwork' },
  'capacity_expansion': { s: 10, p: 25, a: 25, insight: 'insight_expansion' },
  'family_loyalty': { s: 10, p: -30, a: -10, insight: 'insight_loyalty' },
  'guilt_after_pleasure': { s: -15, p: -20, a: 5, insight: 'insight_guilt' },
  'self_permission': { s: 20, p: 30, a: 20, insight: 'insight_permission' }
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
      
      const s = item.bodySensation || "";
      const sKey = (s.includes('горле') || s.includes('ყელში')) ? 'throat' :
                   (s.includes('тепла') || s.includes('სითბოს')) ? 'warmth' :
                   (s.includes('Холод') || s.includes('სიცივე')) ? 'cold' :
                   (s.includes('плечах') || s.includes('მხრებზე')) ? 'shoulders' : 'none';

      const confKey = `${item.beliefKey}_${sKey}`;

      reflectionMirror.push({
        sceneTitle: scenes[item.sceneId]?.titleKey || "",
        thought: item.userReflection || "...",
        sensation: item.bodySensation || "",
        insight: t.insight,
        confrontation: CONFRONTATIONS[confKey] || 'confront_default'
      });
    }
  });

  const levels = {
    safety: getLevel(safety),
    permission: getLevel(permission),
    ambition: getLevel(ambition)
  };

  let scenario = "stable_path";
  if (levels.safety === 'low' && levels.ambition === 'high') scenario = "sacrifice_run";
  if (levels.permission === 'low' && levels.safety === 'high') scenario = "invisible_wealth";
  if (levels.safety === 'low' && levels.permission === 'low') scenario = "constant_crisis";

  let pattern = "neutral", trap = "none", archetype = "observer";
  if (levels.safety === 'low' && levels.ambition === 'high') { pattern = "burnout_marathon"; trap = "anxious_achievement"; archetype = "achiever"; }
  else if (levels.permission === 'low' && levels.safety === 'high') { pattern = "golden_cage"; trap = "fear_of_joy"; archetype = "keeper"; }
  else if (levels.safety === 'low' && levels.permission === 'low') { pattern = "survival_mode"; trap = "scarcity_mindset"; archetype = "prisoner"; }
  else if (levels.ambition === 'high' && levels.permission === 'high') { pattern = "limitless_growth"; trap = "inflation_of_self"; archetype = "expander"; }

  const roadmapSteps = [];
  if (levels.safety === 'low') roadmapSteps.push({ label: "step_safety_title", action: "step_safety_desc", homework: "hw_safety" });
  if (levels.permission === 'low') roadmapSteps.push({ label: "step_perm_title", action: "step_perm_desc", homework: "hw_perm" });
  if (levels.ambition === 'low') roadmapSteps.push({ label: "step_amb_title", action: "step_amb_desc", homework: "hw_amb" });
  if (roadmapSteps.length === 0) roadmapSteps.push({ label: "step_master_title", action: "step_master_desc", homework: "hw_master" });

  return {
    archetypeKey: archetype,
    patternKey: pattern,
    trapKey: trap,
    scenarioKey: scenario,
    scoreSafety: safety,
    scorePermission: permission,
    scoreAmbition: ambition,
    stressLevel: 100 - safety,
    levels,
    reflectionMirror: reflectionMirror.slice(-4),
    analysisTextKeys: Array.from(new Set(traits)).slice(-3),
    defenseMechanisms: ["Проекция", "Интроекция"],
    roadmap: {
      title: "roadmap_main_title",
      steps: roadmapSteps
    }
  };
}
