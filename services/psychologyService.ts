
import { BeliefKey, GameHistoryItem, RawAnalysisResult, NeuralCorrelation, DomainType, IntegrityBreakdown, SystemConflict, MetricLevel, ClinicalWarning, AnalysisFlags, PhaseType } from '../types';

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
  'default':              { f: 0, a: 0, r: 0, e: 0 } // Neutral for skipped questions
};

function updateMetric(current: number, delta: number): number {
    if (delta === 0) return current;
    const resistance = Math.abs(current - 50) / 50; 
    const effectiveDelta = delta * (1 - resistance * 0.4); 
    return Math.max(0, Math.min(100, current + effectiveDelta));
}

// --- CLINICAL DETECTORS ---

const median = (arr: number[]): number => {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
};

function detectAlexithymia(history: GameHistoryItem[]): boolean {
  const somaticItems = history.filter(h => parseInt(h.nodeId) >= 3 && h.sensation !== 's0');
  if (history.length < 15) return false;
  return (somaticItems.length / history.length) < 0.15;
}

function calculateAdaptiveThresholds(latencies: number[]): { slow: number; median: number } {
    if (latencies.length < 5) return { slow: 5000, median: 2000 };
    const sorted = [...latencies].sort((a, b) => a - b);
    const medianVal = median(sorted);
    // A more aggressive threshold that adapts to user speed
    const slowThreshold = Math.max(3500, medianVal * 2.2); 
    return { slow: slowThreshold, median: medianVal };
}

function detectSlowBaseline(history: GameHistoryItem[]): { isDetected: boolean; factor: number } {
  if (history.length < 5) return { isDetected: false, factor: 1.0 };
  const calibrationItems = history.slice(0, 5);
  const medianVal = median(calibrationItems.map(h => h.latency));
  if (medianVal > 5000) return { isDetected: true, factor: 0.7 };
  return { isDetected: false, factor: 1.0 };
}

function detectSocialDesirabilityBias(history: GameHistoryItem[]): boolean {
  let rapidStreak = 0;
  const testItems = history.filter(h => parseInt(h.nodeId) >= 3);
  for (const item of testItems) {
    if (item.latency < 500) {
      rapidStreak++;
      if (rapidStreak >= 5) return true;
    } else {
      rapidStreak = 0;
    }
  }
  return false;
}

export function calculateRawMetrics(history: GameHistoryItem[]): RawAnalysisResult {
  let f = 50, a = 50, r = 50, e = 10;
  let syncScore = 100;
  let skippedCount = 0;
  const activePatterns: BeliefKey[] = [];
  const correlations: NeuralCorrelation[] = [];
  const conflicts: SystemConflict[] = [];
  const somaticDissonance: BeliefKey[] = [];
  const somaticProfile = { blocks: 0, resources: 0, dominantSensation: 's0' };
  const sensationsFreq: Record<string, number> = {};
  const warnings: ClinicalWarning[] = [];
  
  let validLatencies: number[] = [];

  const isAlexithymia = detectAlexithymia(history);
  const slowBaseline = detectSlowBaseline(history);
  const isSocialBias = detectSocialDesirabilityBias(history);
  
  const entropyCompFactor = slowBaseline.factor;

  if (isAlexithymia) {
      warnings.push({ type: 'SOMATIC_BLINDNESS', severity: 'HIGH', messageKey: 'somatic_detection_warning' });
  }
  if (slowBaseline.isDetected) {
      warnings.push({ type: 'PROCESSING_SPEED_NOTE', severity: 'LOW', messageKey: 'slow_processing_detected' });
  }

  let validity: 'VALID' | 'SUSPICIOUS' | 'INVALID' = 'VALID';
  if (isSocialBias) validity = 'SUSPICIOUS';
  
  // HARDENING: Use a sliding window for baseline calculation to prevent start-game manipulation.
  let slidingLatencyWindow: number[] = [];

  history.forEach((h, index) => {
    if (h.latency > 300 && h.latency < 30000) {
        slidingLatencyWindow.push(h.latency);
        if (slidingLatencyWindow.length > 7) slidingLatencyWindow.shift();
    }
    const { slow: adaptiveSlowThreshold, median: medianBaseline } = calculateAdaptiveThresholds(slidingLatencyWindow);
    
    if (h.beliefKey === 'default') {
        skippedCount++;
        return;
    }
    
    if (parseInt(h.nodeId) < 3) return; 

    const beliefKey = h.beliefKey as BeliefKey;
    let w = WEIGHTS[beliefKey] || { f: 0, a: 0, r: 0, e: 1 };
    
    const latencyRatio = h.latency / medianBaseline;
    const latencyFactor = latencyRatio > 2.5 ? 2.0 : latencyRatio < 0.4 ? 0.5 : 1.0;
    const resonance = 1 + (history.slice(0, index).filter(item => item.beliefKey === h.beliefKey).length * 0.2);
    
    f = updateMetric(f, w.f * resonance);
    a = updateMetric(a, w.a * resonance);
    r = updateMetric(r, w.r * resonance);
    e = updateMetric(e, w.e * resonance * latencyFactor * entropyCompFactor);
    
    if (h.sensation === 's1' || h.sensation === 's4') somaticProfile.blocks++;
    if (h.sensation === 's2') somaticProfile.resources++;
    sensationsFreq[h.sensation] = (sensationsFreq[h.sensation] || 0) + 1;

    if (h.latency > adaptiveSlowThreshold) {
        correlations.push({ nodeId: h.nodeId, domain: h.domain, type: 'resistance', descriptionKey: `correlation_resistance_${beliefKey}` });
        e = updateMetric(e, 8 * entropyCompFactor); 
    }
    
    if (h.sensation === 's2' && h.latency < medianBaseline * 1.2) {
        correlations.push({ nodeId: h.nodeId, domain: h.domain, type: 'resonance', descriptionKey: `correlation_resonance_${beliefKey}` });
    }

    // SOMATIC HARDENING: Bidirectional check for contradictions.
    const isPositiveBelief = w.a > 2 || w.f > 1 || w.r > 2;
    const isNegativeBelief = w.f < -1 || w.e > 3 || w.a < -2;

    if (isPositiveBelief && (h.sensation === 's1' || h.sensation === 's4')) {
        syncScore -= 12; // Penalty for mind saying 'yes' but body saying 'no'.
        if (!somaticDissonance.includes(beliefKey)) somaticDissonance.push(beliefKey);
    }
    if (isNegativeBelief && h.sensation === 's2') {
        syncScore -= 15; // Higher penalty for faking positive resonance on a negative topic.
        if (!somaticDissonance.includes(beliefKey)) somaticDissonance.push(beliefKey);
    }
    
    if (history.filter(item => item.beliefKey === h.beliefKey).length > 2) activePatterns.push(beliefKey);
    validLatencies.push(h.latency);
  });

  const { median: finalMedianBaseline } = calculateAdaptiveThresholds(validLatencies);
  
  const latencyVariance = validLatencies.length > 1 
    ? Math.sqrt(validLatencies.reduce((sum, l) => sum + Math.pow(l - finalMedianBaseline, 2), 0) / validLatencies.length) 
    : 0;

  // REFACTOR: Somatic monotony is now handled by PatternDetector. This focuses on latency variance.
  const confidenceScore = Math.max(0, 100 - (latencyVariance / finalMedianBaseline * 100));

  if (a > 75 && f < 35) conflicts.push({ key: 'icarus', severity: 'high', domain: 'agency' });
  if (r > 70 && e > 55) conflicts.push({ key: 'leaky_bucket', severity: 'medium', domain: 'money' });
  if (f > 75 && a < 40) conflicts.push({ key: 'invisible_cage', severity: 'medium', domain: 'foundation' });

  somaticProfile.dominantSensation = Object.entries(sensationsFreq).sort((a, b) => b[1] - a[1])[0]?.[0] || 's0';

  const integrityBase = Math.round(((f + a + r) / 3) * (1 - (e / 150)));
  const systemHealth = Math.round((integrityBase * 0.6) + (syncScore * 0.4));
  const stability = Math.round((f * 0.7) + (a * 0.3));
  
  const status: MetricLevel = systemHealth > 82 ? 'OPTIMAL' : systemHealth > 52 ? 'STABLE' : systemHealth > 32 ? 'STRAINED' : 'PROTECTIVE';

  const integrityBreakdown: IntegrityBreakdown = {
    coherence: Math.round(confidenceScore),
    sync: Math.round(syncScore),
    stability,
    label: systemHealth > 80 ? 'HIGH_COHERENCE' : systemHealth > 50 ? 'COMPENSATED' : 'STRUCTURAL_NOISE',
    description: systemHealth > 80 ? 'audit_desc_high' : systemHealth > 50 ? 'audit_desc_mid' : 'audit_desc_low',
    status
  };
  
  let phase: PhaseType = systemHealth < 35 ? 'SANITATION' : systemHealth < 68 ? 'STABILIZATION' : 'EXPANSION';
  if (f < 32) phase = 'SANITATION';

  let entropyType: AnalysisFlags['entropyType'] = 'NEUTRAL';
  if (e > 40) {
      if (a > 60 && f > 40) entropyType = 'CREATIVE';
      else if (f < 40) entropyType = 'STRUCTURAL';
  }

  const flags: AnalysisFlags = {
      isAlexithymiaDetected: isAlexithymia,
      isSlowProcessingDetected: slowBaseline.isDetected,
      isNeuroSyncReliable: !isAlexithymia,
      isSocialDesirabilityBiasDetected: isSocialBias,
      processingSpeedCompensation: entropyCompFactor,
      entropyType
  };

  return {
    state: { foundation: f, agency: a, resource: r, entropy: e },
    integrity: integrityBase, 
    capacity: Math.round((f + r) / 2), 
    entropyScore: Math.round(e), 
    neuroSync: Math.round(syncScore), 
    systemHealth, 
    phase,
    status: f < 30 ? 'PROTECTIVE' : systemHealth < 55 ? 'UNSTABLE' : 'OPTIMAL',
    validity, 
    activePatterns: [...new Set(activePatterns)],
    correlations: correlations.slice(0, 8),
    conflicts,
    somaticDissonance: [...new Set(somaticDissonance)],
    somaticProfile,
    integrityBreakdown,
    clarity: Math.min(100, history.length * 2),
    confidenceScore: Math.round(confidenceScore),
    warnings,
    flags,
    skippedCount
  };
}