
import { RawAnalysisResult, AnalysisResult, ArchetypeKey, VerdictKey, ProtocolStep, PhaseType, TaskKey, PatternFlags } from '../types';
import { SecurityCore } from '../utils/crypto';

const ARCHETYPE_INDEX_MAP: ArchetypeKey[] = [
  'THE_ARCHITECT', 'THE_DRIFTER', 'THE_BURNED_HERO',
  'THE_GOLDEN_PRISONER', 'THE_CHAOS_SURFER', 'THE_GUARDIAN'
];

const VERDICT_INDEX_MAP: VerdictKey[] = [
  'HEALTHY_SCALE', 'BRILLIANT_SABOTAGE', 'INVISIBILE_CEILING',
  'LEAKY_BUCKET', 'PARALYZED_GIANT', 'FROZEN_POTENTIAL', 'CRITICAL_DEFICIT'
];

const TASKS_LOGIC: Record<PhaseType, Array<{ taskKey: TaskKey, targetMetricKey: string }>> = {
  SANITATION: [{ taskKey: "sanitation_1", targetMetricKey: "Focus" }, { taskKey: "sanitation_2", targetMetricKey: "Sync" }, { taskKey: "sanitation_3", targetMetricKey: "Space" }, { taskKey: "sanitation_4", targetMetricKey: "Clarity" }, { taskKey: "sanitation_5", targetMetricKey: "Control" }, { taskKey: "sanitation_6", targetMetricKey: "Awareness" }, { taskKey: "sanitation_7", targetMetricKey: "Space" }],
  STABILIZATION: [{ taskKey: "stabilization_1", targetMetricKey: "Agency" }, { taskKey: "stabilization_2", targetMetricKey: "Foundation" }, { taskKey: "stabilization_3", targetMetricKey: "Will" }, { taskKey: "stabilization_4", targetMetricKey: "Stability" }, { taskKey: "stabilization_5", targetMetricKey: "Focus" }, { taskKey: "stabilization_6", targetMetricKey: "Agency" }, { taskKey: "stabilization_7", targetMetricKey: "Integrity" }],
  EXPANSION: [{ taskKey: "expansion_1", targetMetricKey: "Courage" }, { taskKey: "expansion_2", targetMetricKey: "Resource" }, { taskKey: "expansion_3", targetMetricKey: "Agency" }, { taskKey: "expansion_4", targetMetricKey: "Visibility" }, { taskKey: "expansion_5", targetMetricKey: "Scale" }, { taskKey: "expansion_6", targetMetricKey: "Vision" }, { taskKey: "expansion_7", targetMetricKey: "Integrity" }]
};

export const DiagnosticEngine = {
  interpret(raw: RawAnalysisResult, patternFlags: PatternFlags & { isInconsistentRhythm?: boolean }): AnalysisResult {
    const { state, phase, conflicts } = raw;
    const { foundation: f, agency: a, resource: r, entropy: e } = state;

    const archetypeSpectrum = ([
      { key: 'THE_CHAOS_SURFER', score: e },
      { key: 'THE_DRIFTER', score: 100 - a },
      { key: 'THE_BURNED_HERO', score: (a + (100 - r)) / 2 },
      { key: 'THE_GOLDEN_PRISONER', score: (r + (100 - a)) / 2 },
      { key: 'THE_GUARDIAN', score: (f + (100 - a)) / 2 },
      { key: 'THE_ARCHITECT', score: (a + f + r) / 3 }
    ] as { key: ArchetypeKey; score: number }[]).sort((a, b) => b.score - a.score);

    const primary = archetypeSpectrum[0];
    const secondary = archetypeSpectrum[1];
    const matchPercent = Math.round((primary.score / (primary.score + (secondary?.score || 0))) * 100);

    let verdictKey: VerdictKey = 'HEALTHY_SCALE';
    if (f <= 35) verdictKey = 'CRITICAL_DEFICIT';
    else if (a > 75 && f < 45) verdictKey = 'BRILLIANT_SABOTAGE';
    else if (f > 75 && a < 40) verdictKey = 'INVISIBILE_CEILING';
    else if (r > 70 && e > 55) verdictKey = 'LEAKY_BUCKET';
    else if (a < 35 && e > 45) verdictKey = 'PARALYZED_GIANT';
    else if (f < 50 && a < 50 && r < 50 && e < 40) verdictKey = 'FROZEN_POTENTIAL';

    const pool = TASKS_LOGIC[phase];
    const roadmap = Array.from({ length: 7 }, (_, i) => ({ day: i + 1, phase, ...pool[i % pool.length] }));

    const archIndex = ARCHETYPE_INDEX_MAP.indexOf(primary.key);
    const verdictIndex = VERDICT_INDEX_MAP.indexOf(verdictKey);
    
    const dataStr = `${Math.round(f)}|${Math.round(a)}|${Math.round(r)}|${Math.round(e)}|${archIndex}|${Math.round(raw.neuroSync)}|${verdictIndex}`;
    const sig = SecurityCore.generateChecksum(dataStr);
    const shareCode = btoa(`${dataStr}#${sig}`).replace(/=/g, '');

    const coreConflict = conflicts.length > 0 ? conflicts[0].key : (verdictKey !== 'HEALTHY_SCALE' ? verdictKey.toLowerCase() : 'none');
    
    // BLUE TEAM PROTOCOL: Aggressive Anomaly Detection
    let finalValidity = raw.validity;
    let anomalyCount = 0;
    if (patternFlags.isMonotonic) anomalyCount += 2;
    if (patternFlags.isRoboticTiming) anomalyCount += 3;
    if (patternFlags.isInconsistentRhythm) anomalyCount += 2;
    if (patternFlags.isHighSkipRate) anomalyCount += 1;
    if (patternFlags.isEarlyTermination) anomalyCount += 2;

    if (anomalyCount >= 4) {
        finalValidity = 'INVALID';
    } else if (anomalyCount >= 2) {
        finalValidity = 'SUSPICIOUS';
    }

    return {
      ...raw,
      validity: finalValidity,
      timestamp: Date.now(),
      createdAt: Date.now(),
      shareCode,
      archetypeKey: primary.key,
      secondaryArchetypeKey: secondary?.key,
      archetypeMatch: matchPercent,
      archetypeSpectrum,
      verdictKey,
      lifeScriptKey: `${verdictKey}_${primary.key}`.toLowerCase(),
      roadmap,
      graphPoints: [{ x: 50, y: 50 - f / 2.5 }, { x: 50 + r / 2.2, y: 50 + r / 3.5 }, { x: 50 - a / 2.2, y: 50 + a / 3.5 }],
      interventionStrategy: f < 40 ? 'stabilize_foundation' : e > 50 ? 'lower_entropy' : 'activate_will',
      coreConflict: coreConflict,
      shadowDirective: 'integrity_boost',
      patternFlags
    };
  }
};
