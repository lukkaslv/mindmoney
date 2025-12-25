
import { BeliefKey, ProtocolStep, GameHistoryItem, PhaseType, AnalysisResult, TaskKey, ArchetypeKey, VerdictKey, NeuralCorrelation, DomainType, IntegrityBreakdown, SystemConflict, MetricLevel } from '../types';
import { PSYCHO_CONFIG, ONBOARDING_NODES_COUNT, DOMAIN_SETTINGS } from '../constants';
import { CompatibilityEngine } from './compatibilityEngine';

const TASKS_LOGIC: Record<PhaseType, Array<{ taskKey: TaskKey, targetMetricKey: string }>> = {
  SANITATION: [
    { taskKey: "sanitation_1", targetMetricKey: "Focus +10%" },
    { taskKey: "sanitation_2", targetMetricKey: "Sync +15%" },
    { taskKey: "sanitation_3", targetMetricKey: "Space +15%" }
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
  const conflicts: SystemConflict[] = [];
  const somaticProfile = { blocks: 0, resources: 0, dominantSensation: 's0' };
  const sensationsFreq: Record<string, number> = {};

  const latencies = history.map(h => h.latency).filter(l => l > 400 && l < 15000);
  const userBaseline = latencies.slice(0, 3).reduce((sum, l) => sum + l, 0) / Math.max(1, Math.min(3, latencies.length)) || 2000;
  const avgLatency = latencies.reduce((sum, l) => sum + l, 0) / latencies.length || userBaseline;
  
  const latencyVariance = latencies.length > 1 
    ? Math.sqrt(latencies.reduce((sum, l) => sum + Math.pow(l - avgLatency, 2), 0) / latencies.length) 
    : 0;

  // Confidence Score calculation (higher variance = lower confidence)
  const confidenceScore = Math.max(0, 100 - (latencyVariance / avgLatency * 120));

  history.forEach((h, index) => {
    // Calibration bypass: first 3 nodes have no effect on metrics, only baseline
    if (parseInt(h.nodeId) < 3) return;

    const beliefKey = h.beliefKey as BeliefKey;
    let w = WEIGHTS[beliefKey] || { f: 0, a: 0, r: 0, e: 1 };
    
    const latencyRatio = h.latency / userBaseline;
    const latencyFactor = latencyRatio > 2.2 ? 1.6 : latencyRatio < 0.5 ? 0.6 : 1.0;
    
    const resonance = 1 + (history.slice(0, index).filter(item => item.beliefKey === h.beliefKey).length * 0.2);
    
    f = updateMetric(f, w.f * resonance);
    a = updateMetric(a, w.a * resonance);
    r = updateMetric(r, w.r * resonance);
    e = updateMetric(e, w.e * resonance * latencyFactor);
    
    if (h.sensation === 's1' || h.sensation === 's4') somaticProfile.blocks++;
    if (h.sensation === 's2') somaticProfile.resources++;
    sensationsFreq[h.sensation] = (sensationsFreq[h.sensation] || 0) + 1;

    const nodeId = h.nodeId;
    const domain = h.domain;

    if (h.latency > userBaseline * 2.5) {
        correlations.push({ nodeId, domain: domain as DomainType, type: 'resistance', descriptionKey: `correlation_resistance_${beliefKey}` });
        e = updateMetric(e, 7); 
    }
    
    if (h.sensation === 's2' && h.latency < userBaseline * 1.2) {
        correlations.push({ nodeId, domain: domain as DomainType, type: 'resonance', descriptionKey: `correlation_resonance_${beliefKey}` });
    }

    if (w.a > 2 && (h.sensation === 's1' || h.sensation === 's4')) syncScore -= 6;
    if (history.filter(item => item.beliefKey === h.beliefKey).length > 2) bugs.push(beliefKey);
  });

  if (a > 75 && f < 35) conflicts.push({ key: 'icarus', severity: 'high', domain: 'agency' });
  if (r > 70 && e > 55) conflicts.push({ key: 'leaky_bucket', severity: 'medium', domain: 'money' });
  if (f > 75 && a < 40) conflicts.push({ key: 'invisible_cage', severity: 'medium', domain: 'foundation' });

  somaticProfile.dominantSensation = Object.entries(sensationsFreq).sort((a, b) => b[1] - a[1])[0]?.[0] || 's0';

  const integrityBase = Math.round(((f + a + r) / 3) * (1 - (e / 130)));
  const systemHealth = Math.round((integrityBase * 0.55) + (syncScore * 0.45));
  const coherence = Math.max(0, 100 - (latencyVariance / avgLatency * 80));
  const stability = Math.round((f * 0.65) + (a * 0.35));
  
  // Qualitative status level (Crucial for Reflective tone)
  const status: MetricLevel = systemHealth > 80 ? 'OPTIMAL' : systemHealth > 50 ? 'STABLE' : systemHealth > 30 ? 'STRAINED' : 'DISRUPTED';

  const integrityBreakdown: IntegrityBreakdown = {
    coherence: Math.round(coherence),
    sync: Math.round(syncScore),
    stability: Math.round(stability),
    label: systemHealth > 80 ? 'HIGH_COHERENCE' : systemHealth > 50 ? 'COMPENSATED' : 'STRUCTURAL_NOISE',
    description: systemHealth > 80 ? 'audit_desc_high' : systemHealth > 50 ? 'audit_desc_mid' : 'audit_desc_low',
    status
  };

  const archetypeSpectrum: {key: ArchetypeKey, score: number}[] = ([
    { key: 'THE_CHAOS_SURFER', score: e },
    { key: 'THE_DRIFTER', score: 100 - a },
    { key: 'THE_BURNED_HERO', score: (a + (100 - r)) / 2 },
    { key: 'THE_GOLDEN_PRISONER', score: (r + (100 - a)) / 2 },
    { key: 'THE_GUARDIAN', score: (f + (100 - a)) / 2 },
    { key: 'THE_ARCHITECT', score: (a + f + r) / 3 }
  ] as { key: ArchetypeKey; score: number }[]).sort((a, b) => b.score - a.score);

  const primary = archetypeSpectrum[0];
  const secondary = archetypeSpectrum[1];
  const totalWeight = Math.max(1, primary.score + secondary.score);
  const matchPercent = Math.round((primary.score / totalWeight) * 100);

  let phase: PhaseType = systemHealth < 35 ? 'SANITATION' : systemHealth < 68 ? 'STABILIZATION' : 'EXPANSION';
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

  const partialResult = {
    timestamp: Date.now(),
    state: { foundation: f, agency: a, resource: r, entropy: e },
    integrity: integrityBase, capacity: Math.round((f + r) / 2), entropyScore: Math.round(e), neuroSync: Math.round(syncScore), systemHealth, phase,
    archetypeKey: primary.key,
    secondaryArchetypeKey: secondary.key,
    archetypeMatch: matchPercent,
    archetypeSpectrum,
    verdictKey: a > 75 && f < 35 ? 'BRILLIANT_SABOTAGE' : f > 75 && a < 40 ? 'INVISIBILE_CEILING' : r > 70 && e > 55 ? 'LEAKY_BUCKET' : 'HEALTHY_SCALE',
    roadmap,
    graphPoints: [{ x: 50, y: 50 - f / 2.5 }, { x: 50 + r / 2.2, y: 50 + r / 3.5 }, { x: 50 - a / 2.2, y: 50 + a / 3.5 }],
    status: systemHealth < 25 ? 'CRITICAL' : systemHealth < 55 ? 'UNSTABLE' : 'OPTIMAL',
    bugs: [...new Set(bugs)],
    correlations: correlations.slice(0, 5),
    conflicts,
    somaticProfile,
    integrityBreakdown,
    interventionStrategy: f < 40 ? 'stabilize_foundation' : e > 50 ? 'lower_entropy' : 'activate_will',
    coreConflict: a > 75 && f < 40 ? 'icarus' : r > 70 && e > 55 ? 'leaky_bucket' : 'invisible_cage',
    shadowDirective: bugs.includes('hero_martyr') ? 'self_sabotage_fix' : 'integrity_boost',
    interferenceInsight: bugs.includes('family_loyalty') ? 'family_vs_money' : undefined,
    clarity: Math.min(100, history.length * 2.5),
    confidenceScore: Math.round(confidenceScore)
  } as AnalysisResult;

  partialResult.shareCode = CompatibilityEngine.generateShareCode(partialResult);
  return partialResult;
}
