
import { BeliefKey, GameHistoryItem, RawAnalysisResult, NeuralCorrelation, DomainType, IntegrityBreakdown, SystemConflict, MetricLevel, ClinicalWarning, AnalysisFlags, PhaseType } from '../types';
import { SYSTEM_METADATA, STORAGE_KEYS } from '../constants';

const WEIGHTS: Record<BeliefKey, { f: number; a: number; r: number; e: number }> = {
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
  'golden_cage':          { f: 0, a: -5, r: 0, e: 5 },
  'default':              { f: 0, a: 0, r: 0, e: 0 } 
};

// A/B VARIANT OVERRIDES (SLC LOOP)
// FIXED: Use valid BeliefKey constants instead of Node IDs in WEIGHT_VARIANT_B to resolve type error
const WEIGHT_VARIANT_B: Partial<Record<BeliefKey, Partial<{ f: number; a: number; r: number; e: number }>>> = {
    'imposter_syndrome': { a: 15 }, // Variant B test: highly sensitive agency detection
    'ambivalence_loop': { e: 12 }
};

function updateMetric(current: number, delta: number, nodeReliability: number = 1.0): number {
    if (delta === 0) return current;
    const effectiveDelta = delta * nodeReliability;
    return Math.max(0, Math.min(100, current + effectiveDelta));
}

const median = (arr: number[]): number => {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
};

function calculateAdaptiveThresholds(latencies: number[]): { slow: number; median: number } {
    if (latencies.length < 5) return { slow: 5000, median: 2000 };
    const sorted = [...latencies].sort((a, b) => a - b);
    const medianVal = median(sorted);
    const slowThreshold = Math.max(3500, medianVal * 2.2); 
    return { slow: slowThreshold, median: medianVal };
}

// Deterministic variant assignment based on simple string hash
function getABVariant(userId: string): 'A' | 'B' {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) hash = ((hash << 5) - hash) + userId.charCodeAt(i);
    return (Math.abs(hash) % 2 === 0) ? 'A' : 'B';
}

export function calculateRawMetrics(history: GameHistoryItem[]): RawAnalysisResult & { variantId: string } {
  let f = 50, a = 50, r = 50, e = 10;
  let syncScore = 100;
  let skippedCount = 0;
  const activePatterns: BeliefKey[] = [];
  const correlations: NeuralCorrelation[] = [];
  const conflicts: SystemConflict[] = [];
  const somaticDissonance: BeliefKey[] = [];
  const somaticProfile = { blocks: 0, resources: 0, dominantSensation: 's0' };
  const warnings: ClinicalWarning[] = [];
  
  const currentLang = (localStorage.getItem(STORAGE_KEYS.LANG) || 'ru') as 'ru' | 'ka';
  const langHealth = SYSTEM_METADATA.LANG_HEALTH[currentLang];
  const nodeOverrides = SYSTEM_METADATA.SEMANTIC_RELIABILITY_OVERRIDE;

  // A/B Logic
  const sessionId = localStorage.getItem(STORAGE_KEYS.SESSION) || 'anonymous';
  const variantId = getABVariant(sessionId);

  let validLatencies: number[] = [];
  let slidingLatencyWindow: number[] = [];

  if (langHealth.status === 'BETA_RISK' || langHealth.status === 'LEARNING') {
      warnings.push({ type: 'L10N_ACCURACY_LOW', severity: 'LOW', messageKey: 'L10n accuracy under SLC audit.' });
  }

  history.forEach((h) => {
    if (h.latency > 300 && h.latency < 30000) {
        slidingLatencyWindow.push(h.latency);
        if (slidingLatencyWindow.length > 7) slidingLatencyWindow.shift();
    }
    const { slow: adaptiveSlowThreshold, median: medianBaseline } = calculateAdaptiveThresholds(slidingLatencyWindow);
    
    if (h.beliefKey === 'default') {
        skippedCount++;
        return;
    }
    
    const nodeReliability = (nodeOverrides[h.nodeId] !== undefined) ? nodeOverrides[h.nodeId] : 1.0;
    const beliefKey = h.beliefKey as BeliefKey;
    
    // Weight Application with A/B Variant support
    let w = { ...WEIGHTS[beliefKey] || { f: 0, a: 0, r: 0, e: 1 } };
    if (variantId === 'B' && WEIGHT_VARIANT_B[beliefKey]) {
        w = { ...w, ...WEIGHT_VARIANT_B[beliefKey] };
    }
    
    const latencyRatio = h.latency / medianBaseline;
    const latencyFactor = latencyRatio > 2.5 ? 2.0 : latencyRatio < 0.4 ? 0.5 : 1.0;
    
    f = updateMetric(f, w.f, nodeReliability);
    a = updateMetric(a, w.a, nodeReliability);
    r = updateMetric(r, w.r, nodeReliability);
    e = updateMetric(e, w.e * latencyFactor, nodeReliability);
    
    if (h.sensation === 's1' || h.sensation === 's4') somaticProfile.blocks++;
    if (h.sensation === 's2') somaticProfile.resources++;

    if (h.latency > adaptiveSlowThreshold && h.sensation !== 's2') {
        correlations.push({ nodeId: h.nodeId, domain: h.domain, type: 'resistance', descriptionKey: `correlation_resistance_${beliefKey}` });
        e = updateMetric(e, 8, nodeReliability); 
    }
    
    if (h.sensation === 's2' && h.latency < medianBaseline * 1.2) {
        correlations.push({ nodeId: h.nodeId, domain: h.domain, type: 'resonance', descriptionKey: `correlation_resonance_${beliefKey}` });
    }

    const isPositiveBelief = w.a > 2 || w.f > 1 || w.r > 2;
    if (isPositiveBelief && (h.sensation === 's1' || h.sensation === 's4')) {
        syncScore -= (12 * nodeReliability); 
        if (!somaticDissonance.includes(beliefKey)) somaticDissonance.push(beliefKey);
    }
    
    if (history.filter(item => item.beliefKey === h.beliefKey).length > 2) activePatterns.push(beliefKey);
    validLatencies.push(h.latency);
  });

  const { median: finalMedianBaseline } = calculateAdaptiveThresholds(validLatencies);
  const technicalConfidence = Math.max(0, 100 - (validLatencies.length > 5 ? 20 : 0));
  const confidenceScore = Math.min(technicalConfidence, langHealth.reliability * 100);

  const integrityBase = Math.round(((f + a + r) / 3) * (1 - (e / 150)));
  const systemHealth = Math.round((integrityBase * 0.6) + (syncScore * 0.4));
  
  const status: MetricLevel = systemHealth > 82 ? 'OPTIMAL' : systemHealth > 52 ? 'STABLE' : systemHealth > 32 ? 'STRAINED' : 'PROTECTIVE';

  return {
    variantId,
    state: { foundation: f, agency: a, resource: r, entropy: e },
    integrity: integrityBase, 
    capacity: Math.round((f + r) / 2), 
    entropyScore: Math.round(e), 
    neuroSync: Math.round(syncScore), 
    systemHealth, 
    phase: f < 32 ? 'SANITATION' : systemHealth < 68 ? 'STABILIZATION' : 'EXPANSION',
    status,
    validity: confidenceScore < 40 ? 'SUSPICIOUS' : 'VALID', 
    activePatterns: [...new Set(activePatterns)],
    correlations: correlations.slice(0, 8),
    conflicts,
    somaticDissonance: [...new Set(somaticDissonance)],
    somaticProfile,
    integrityBreakdown: { coherence: Math.round(technicalConfidence), sync: Math.round(syncScore), stability: f, label: status, description: '', status },
    clarity: Math.min(100, history.length * 2),
    confidenceScore: Math.round(confidenceScore),
    warnings,
    flags: {
      isAlexithymiaDetected: false,
      isSlowProcessingDetected: false,
      isNeuroSyncReliable: true,
      isSocialDesirabilityBiasDetected: false,
      processingSpeedCompensation: 1.0,
      entropyType: e > 40 ? (a > 60 ? 'CREATIVE' : 'STRUCTURAL') : 'NEUTRAL',
      isL10nRiskDetected: langHealth.status === 'BETA_RISK'
    },
    skippedCount
  };
}
