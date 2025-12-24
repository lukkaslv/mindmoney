
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
  // Координаты для SVG кристалла (0-100)
  crystalPoints: { x: number; y: number }[];
  roadmap: {
    title: string;
    steps: { label: string; action: string; homework: string }[];
  };
  // Added missing fields to fix TypeScript error in getPsychologicalFeedback return value
  analysisTextKeys: string[];
  defenseMechanisms: string[];
}

const CONFRONTATIONS: Record<string, string> = {
  'fear_of_punishment_throat': 'confront_voice_block',
  'impulse_spend_warmth': 'confront_euphoria_trap',
  'money_is_danger_cold': 'confront_survival_chill',
  'poverty_is_virtue_shoulders': 'confront_moral_burden',
  'imposter_syndrome_chest': 'confront_imposter_pressure',
  'hard_work_only_shoulders': 'confront_work_weight',
  'capacity_expansion_warmth': 'confront_expansion_glow',
  'family_loyalty_throat': 'confront_loyalty_strangle'
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
  let reflectionMirror: any[] = [];
  
  history.forEach(item => {
    const t = TRAITS[item.beliefKey];
    if (t) {
      safety = Math.max(10, Math.min(100, safety + t.s));
      permission = Math.max(10, Math.min(100, permission + t.p));
      ambition = Math.max(10, Math.min(100, ambition + t.a));
      
      const s = item.bodySensation || "";
      const sKey = (s.includes('горле') || s.includes('ყელში')) ? 'throat' :
                   (s.includes('тепла') || s.includes('სითბოს')) ? 'warmth' :
                   (s.includes('Холод') || s.includes('სიცივე')) ? 'cold' :
                   (s.includes('плечах') || s.includes('მხრებზე')) ? 'shoulders' :
                   (s.includes('Давление') || s.includes('ზეწოლა')) ? 'chest' : 'none';

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

  // Расчет точек кристалла (Radar Chart Geometry)
  // 3 оси: Safety (Top), Permission (Bottom Right), Ambition (Bottom Left)
  const centerX = 50, centerY = 50, radius = 40;
  const crystalPoints = [
    { x: centerX, y: centerY - (radius * safety / 100) }, // Safety
    { x: centerX + (radius * permission / 100) * Math.cos(Math.PI/6), y: centerY + (radius * permission / 100) * Math.sin(Math.PI/6) }, // Permission
    { x: centerX - (radius * ambition / 100) * Math.cos(Math.PI/6), y: centerY + (radius * ambition / 100) * Math.sin(Math.PI/6) } // Ambition
  ];

  const levels = {
    safety: getLevel(safety),
    permission: getLevel(permission),
    ambition: getLevel(ambition)
  };

  let scenario = "stable_path";
  if (levels.safety === 'low' && levels.ambition === 'high') scenario = "sacrifice_run";
  if (levels.permission === 'low' && levels.safety === 'high') scenario = "invisible_wealth";
  if (levels.safety === 'low' && levels.permission === 'low') scenario = "constant_crisis";

  let archetype = "observer";
  let trap = "none";
  let pattern = "neutral";

  if (levels.safety === 'low' && levels.ambition === 'high') { archetype = "achiever"; trap = "anxious_achievement"; pattern = "burnout"; }
  else if (levels.permission === 'low' && levels.safety === 'high') { archetype = "keeper"; trap = "fear_of_joy"; pattern = "golden_cage"; }
  else if (levels.safety === 'low' && levels.permission === 'low') { archetype = "prisoner"; trap = "scarcity_mindset"; pattern = "survival"; }
  else if (levels.ambition === 'high' && levels.permission === 'high') { archetype = "expander"; trap = "inflation_of_self"; pattern = "expansion"; }

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
    analysisTextKeys: [],
    defenseMechanisms: [],
    crystalPoints,
    roadmap: {
      title: "roadmap_main_title",
      steps: roadmapSteps
    }
  };
}
