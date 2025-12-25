
import { BeliefKey, ProtocolStep, GameHistoryItem, PhaseType, AnalysisResult, TaskKey, ArchetypeKey, VerdictKey, NeuralCorrelation, DomainType } from '../types';
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

function updateMetric(current: number, delta: number): number {
    if (delta === 0) return current;
    const resistance = Math.abs(current - 50) / 50; 
    const effectiveDelta = delta * (1 - resistance * 0.4); 
    return Math.max(0, Math.min(100, current + effectiveDelta));
}

export function calculateGenesisCore(history: GameHistoryItem[]): AnalysisResult {
  let f = 50, a = 50, r = 50, e = 10;
  let syncScore = 100;
  const bugs: BeliefKey[] = [];
  const correlations: NeuralCorrelation[] = [];
  const somaticProfile = { blocks: 0, resources: 0, dominantSensation: 's0' };
  const sensationsFreq: Record<string, number> = {};

  const calibrationSamples = history.slice(0, Math.max(8, history.length))
    .map(h => h.latency)
    .filter(l => l > 400 && l < 12000)
    .sort((a, b) => a - b);
  
  let baselineLatency = 2200;
  if (calibrationSamples.length > 4) {
      const mid = Math.floor(calibrationSamples.length / 2);
      baselineLatency = calibrationSamples[mid];
  }
  
  history.forEach((h, index) => {
    const beliefKey = h.beliefKey as BeliefKey;
    let w = WEIGHTS[beliefKey] || { f: 0, a: 0, r: 0, e: 1 };
    
    const resonance = 1 + (history.slice(0, index).filter(item => item.beliefKey === h.beliefKey).length * 0.25);
    
    f = updateMetric(f, w.f * resonance);
    a = updateMetric(a, w.a * resonance);
    r = updateMetric(r, w.r * resonance);
    e = updateMetric(e, w.e * resonance);
    
    // SOMATIC TRACKING
    if (h.sensation === 's1' || h.sensation === 's4') somaticProfile.blocks++;
    if (h.sensation === 's2') somaticProfile.resources++;
    sensationsFreq[h.sensation] = (sensationsFreq[h.sensation] || 0) + 1;

    // NEURAL CORRELATION TRACKING
    const nodeId = h.nodeId || index.toString();
    const domain = DOMAIN_SETTINGS.find(d => parseInt(nodeId) >= d.startId && parseInt(nodeId) < d.startId + d.count)?.key || 'foundation';

    if (h.latency > baselineLatency * 2.5) {
        correlations.push({
            nodeId,
            domain: domain as DomainType,
            type: 'resistance',
            descriptionKey: `correlation_resistance_${beliefKey}`
        });
        e = updateMetric(e, 5);
    }
    
    if (h.sensation === 's2' && h.latency < baselineLatency * 0.8) {
        correlations.push({
            nodeId,
            domain: domain as DomainType,
            type: 'resonance',
            descriptionKey: `correlation_resonance_${beliefKey}`
        });
    }

    if (w.a > 2 && (h.sensation === 's1' || h.sensation === 's4')) syncScore -= 6;
    if (history.filter(item => item.beliefKey === h.beliefKey).length > 2) bugs.push(beliefKey);
  });

  somaticProfile.dominantSensation = Object.entries(sensationsFreq).sort((a, b) => b[1] - a[1])[0]?.[0] || 's0';

  const integrity = Math.round(((f + a + r) / 3) * (1 - (e / 110)));
  const systemHealth = Math.round((integrity * 0.6) + (syncScore * 0.4));

  const archetypeSpectrum: {key: ArchetypeKey, score: number}[] = (
    [
      { key: 'THE_CHAOS_SURFER', score: e },
      { key: 'THE_DRIFTER', score: 100 - a },
      { key: 'THE_BURNED_HERO', score: (a + (100 - r)) / 2 },
      { key: 'THE_GOLDEN_PRISONER', score: (r + (100 - a)) / 2 },
      { key: 'THE_GUARDIAN', score: (f + (100 - a)) / 2 },
      { key: 'THE_ARCHITECT', score: (a + f + r) / 3 }
    ] as {key: ArchetypeKey, score: number}[]
  ).sort((a, b) => b.score - a.score);

  const primary = archetypeSpectrum[0];
  const secondary = archetypeSpectrum[1];
  const totalWeight = primary.score + secondary.score;
  const matchPercent = Math.round((primary.score / totalWeight) * 100);

  let phase: PhaseType = systemHealth < 42 ? 'SANITATION' : systemHealth < 72 ? 'STABILIZATION' : 'EXPANSION';
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
    archetypeKey: primary.key,
    secondaryArchetypeKey: secondary.key,
    archetypeMatch: matchPercent,
    archetypeSpectrum,
    verdictKey: a > 70 && f < 40 ? 'BRILLIANT_SABOTAGE' : f > 70 && a < 45 ? 'INVISIBILE_CEILING' : r > 65 && e > 50 ? 'LEAKY_BUCKET' : 'HEALTHY_SCALE',
    roadmap,
    graphPoints: [{ x: 50, y: 50 - f / 2.5 }, { x: 50 + r / 2.2, y: 50 + r / 3.5 }, { x: 50 - a / 2.2, y: 50 + a / 3.5 }],
    status: systemHealth < 40 ? 'CRITICAL' : systemHealth < 60 ? 'UNSTABLE' : 'OPTIMAL',
    bugs: [...new Set(bugs)],
    correlations: correlations.slice(0, 5), // Only show top 5 correlations
    somaticProfile,
    interventionStrategy: f < 40 ? 'stabilize_foundation' : e > 50 ? 'lower_entropy' : 'activate_will',
    coreConflict: a > 70 && f < 45 ? 'icarus' : r > 65 && e > 55 ? 'leaky_bucket' : 'invisible_cage',
    shadowDirective: bugs.includes('hero_martyr') ? 'self_sabotage_fix' : 'integrity_boost',
    interferenceInsight: bugs.includes('family_loyalty') ? 'family_vs_money' : undefined
  };
}
