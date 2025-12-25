
import { BeliefKey, ProtocolStep, GameHistoryItem, PhaseType, AnalysisResult, TaskKey, ArchetypeKey, VerdictKey } from '../types';
import { PSYCHO_CONFIG, ONBOARDING_NODES_COUNT, DOMAIN_SETTINGS } from '../constants';

const TASKS_LOGIC: Record<PhaseType, Array<{ taskKey: TaskKey, targetMetricKey: string }>> = {
  SANITATION: [
    { taskKey: "sanitation_1", targetMetricKey: "Entropy -10%" },
    { taskKey: "sanitation_2", targetMetricKey: "Sync +15%" },
    { taskKey: "sanitation_3", targetMetricKey: "Entropy -15%" }
  ],
  STABILIZATION: [
    { taskKey: "stabilization_1", targetMetricKey: "Foundation +12%" },
    { taskKey: "stabilization_2", targetMetricKey: "Foundation +8%" },
    { taskKey: "stabilization_3", targetMetricKey: "Foundation +15%" }
  ],
  EXPANSION: [
    { taskKey: "expansion_1", targetMetricKey: "Agency +20%" },
    { taskKey: "expansion_2", targetMetricKey: "Agency +15%" },
    { taskKey: "expansion_3", targetMetricKey: "Agency +25%" }
  ]
};

// Vector weights representation
interface Vector4 { f: number; a: number; r: number; e: number }

const WEIGHTS: Record<BeliefKey, Vector4> = {
  'scarcity_mindset':     { f: -4, a: -2, r: -3, e: 4 },
  'fear_of_punishment':   { f: -3, a: -3, r: -2, e: 4 },
  'money_is_tool':        { f: 2, a: 4, r: 5, e: -2 },
  'self_permission':      { f: 0, a: 3, r: 6, e: -3 },
  'imposter_syndrome':    { f: -2, a: -6, r: -2, e: 5 },
  'family_loyalty':       { f: -6, a: -2, r: -2, e: 3 },
  'shame_of_success':     { f: -3, a: -4, r: 3, e: 6 },
  'betrayal_trauma':      { f: -2, a: -3, r: 2, e: 8 },
  'capacity_expansion':   { f: 3, a: 4, r: 4, e: -3 },
  'hard_work_only':       { f: 3, a: 2, r: 1, e: 3 },
  'boundary_collapse':    { f: -4, a: -5, r: -2, e: 6 }, 
  'money_is_danger':      { f: -3, a: -2, r: -6, e: 7 }, 
  'unconscious_fear':     { f: -3, a: -3, r: -2, e: 4 },
  'short_term_bias':      { f: -2, a: 2, r: 3, e: 5 },
  'impulse_spend':        { f: -2, a: 2, r: -4, e: 4 },
  'fear_of_conflict':     { f: -2, a: -4, r: 0, e: 3 },
  'poverty_is_virtue':    { f: -3, a: -3, r: -3, e: 3 },
  'latency_resistance':   { f: 0, a: 0, r: 0, e: 2 },
  'resource_toxicity':    { f: -2, a: 0, r: -2, e: 4 },
  'body_mind_conflict':   { f: 0, a: -1, r: 0, e: 4 },
  'ambivalence_loop':     { f: -2, a: -5, r: 0, e: 10 },
  'hero_martyr':          { f: 0, a: 0, r: 0, e: 5 },
  'autopilot_mode':       { f: 0, a: -5, r: 0, e: 5 },
  'golden_cage':          { f: 0, a: -5, r: 0, e: 5 }
};

const BUG_FIX_TASKS: Partial<Record<BeliefKey, TaskKey>> = {
    'family_loyalty': 'bug_fix_family',
    'shame_of_success': 'bug_fix_family',
    'imposter_syndrome': 'bug_fix_imposter',
    'fear_of_punishment': 'bug_fix_fear',
    'unconscious_fear': 'bug_fix_fear',
    'boundary_collapse': 'bug_fix_boundary',
    'fear_of_conflict': 'bug_fix_boundary'
};

function generateDeepAnalysis(f: number, a: number, r: number, e: number, sync: number) {
  const synthesis: { category: string; key: string; intensity: number }[] = [];
  if (a > 65 && f < 40) synthesis.push({ category: 'structural', key: 'high_agency_low_foundation', intensity: 3 });
  else if (f > 65 && a < 40) synthesis.push({ category: 'structural', key: 'low_agency_high_foundation', intensity: 2 });
  else if (a > 60 && f > 60 && e < 30) synthesis.push({ category: 'structural', key: 'healthy_integration', intensity: 1 });
  if (r > 60 && e > 50) synthesis.push({ category: 'energy', key: 'high_resource_high_entropy', intensity: 3 });
  if (sync < 50 && a > 50) synthesis.push({ category: 'cognitive', key: 'somatic_dissonance', intensity: 3 });
  return synthesis;
}

function selectInterference(bugs: BeliefKey[]): string | undefined {
    // Interference Matrix 2.0: Deep matching
    if (bugs.includes('family_loyalty') && (bugs.includes('money_is_danger') || bugs.includes('scarcity_mindset'))) return 'family_vs_money';
    if (bugs.includes('fear_of_punishment') && (bugs.includes('imposter_syndrome') || bugs.includes('shame_of_success'))) return 'social_vs_worth';
    if (bugs.includes('boundary_collapse') && bugs.includes('unconscious_fear')) return 'will_vs_safety';
    if (bugs.includes('resource_toxicity') && bugs.includes('shame_of_success')) return 'money_vs_shame';
    if (bugs.includes('autopilot_mode') && bugs.includes('latency_resistance')) return 'agency_vs_logic';
    return undefined;
}

export function calculateGenesisCore(history: GameHistoryItem[]): AnalysisResult {
  let f = 50, a = 50, r = 50, e = 10;
  let syncScore = 100;
  const bugs: BeliefKey[] = [];
  
  const validLatencies = history.slice(0, ONBOARDING_NODES_COUNT + 3)
    .map(h => h.latency)
    .filter(l => l > 600 && l < 8000)
    .sort((a, b) => a - b);
  
  let baselineLatency = 2000;
  if (validLatencies.length > 2) baselineLatency = validLatencies.slice(1, -1).reduce((acc, v) => acc + v, 0) / (validLatencies.length - 2);
  
  history.forEach((h, index) => {
    let w = WEIGHTS[h.beliefKey as BeliefKey] || { f: 0, a: 0, r: 0, e: 1 };
    f += w.f; a += w.a; r += w.r; e += w.e;
    
    // Penalize latency spikes deterministically
    if (index >= ONBOARDING_NODES_COUNT && h.latency > baselineLatency * 1.5) e += 3;
    
    // Penalize somatic dissonance
    if (w.a > 2 && (h.sensation === 's1' || h.sensation === 's4')) syncScore -= 5;
    
    // Track bug frequency
    const freq = history.filter(item => item.beliefKey === h.beliefKey).length;
    if (freq > 2 || w.e > PSYCHO_CONFIG.BUG_ENTROPY_THRESHOLD) bugs.push(h.beliefKey);
  });

  f = Math.max(0, Math.min(100, f)); a = Math.max(0, Math.min(100, a));
  r = Math.max(0, Math.min(100, r)); e = Math.max(0, Math.min(100, e));
  syncScore = Math.max(0, Math.min(100, syncScore));

  const pillarsAvg = (f + a + r) / 3;
  let integrity = Math.round(pillarsAvg * (1 - Math.pow(e / PSYCHO_CONFIG.ENTROPY_DIVISOR, 1.2)));
  const systemHealth = Math.round((integrity * 0.6) + (syncScore * 0.4));

  let archetypeKey: ArchetypeKey = 'THE_ARCHITECT';
  if (e > 65) archetypeKey = 'THE_CHAOS_SURFER';
  else if (a < 35) archetypeKey = 'THE_DRIFTER';
  else if (a > 70 && r < 40) archetypeKey = 'THE_BURNED_HERO';
  else if (r > 70 && a < 40) archetypeKey = 'THE_GOLDEN_PRISONER';
  else if (f > 70 && a < 50) archetypeKey = 'THE_GUARDIAN';

  let verdictKey: VerdictKey = 'HEALTHY_SCALE';
  if (a > 65 && f < 40) verdictKey = 'BRILLIANT_SABOTAGE';
  else if (f > 65 && a < 45) verdictKey = 'INVISIBILE_CEILING';
  else if (r > 60 && e > 50) verdictKey = 'LEAKY_BUCKET';

  let phase: PhaseType = systemHealth < 40 ? 'SANITATION' : systemHealth < 70 ? 'STABILIZATION' : 'EXPANSION';
  const uniqueBugs = [...new Set(bugs)];
  const roadmap: ProtocolStep[] = Array.from({ length: 7 }, (_, i) => {
    const day = i + 1;
    if (day % 3 === 0 && uniqueBugs.length > 0) {
        const fixTask = BUG_FIX_TASKS[uniqueBugs.shift()!];
        if (fixTask) return { day, phase: 'SANITATION', taskKey: fixTask, targetMetricKey: "Recovery" };
    }
    const pool = TASKS_LOGIC[phase];
    return { day, phase, ...pool[i % pool.length] };
  });

  return {
    state: { foundation: f, agency: a, resource: r, entropy: e },
    integrity, capacity: Math.round((f + r) / 2), entropyScore: Math.round(e), neuroSync: Math.round(syncScore), systemHealth, phase,
    archetypeKey, verdictKey, roadmap,
    graphPoints: [{ x: 50, y: 50 - f / 2.5 }, { x: 50 + r / 2.2, y: 50 + r / 3.5 }, { x: 50 - a / 2.2, y: 50 + a / 3.5 }],
    status: systemHealth < 40 ? 'CRITICAL' : systemHealth < 60 ? 'UNSTABLE' : 'OPTIMAL',
    bugs: [...new Set(bugs)],
    deepAnalysis: generateDeepAnalysis(f, a, r, e, syncScore),
    interventionStrategy: f < 35 ? 'stabilize_foundation' : e > 55 ? 'lower_entropy' : 'activate_will',
    coreConflict: a > 70 && f < 45 ? 'icarus' : r > 60 && e > 50 ? 'leaky_bucket' : 'invisible_cage',
    shadowDirective: bugs.includes('hero_martyr') ? 'self_sabotage_fix' : 'integrity_boost',
    interferenceInsight: selectInterference([...new Set(bugs)])
  };
}
