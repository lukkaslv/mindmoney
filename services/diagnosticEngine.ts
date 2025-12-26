
import { RawAnalysisResult, AnalysisResult, ArchetypeKey, VerdictKey, ProtocolStep, PhaseType, TaskKey, PatternFlags } from '../types';

const ARCHETYPE_INDEX_MAP: ArchetypeKey[] = [
  'THE_ARCHITECT', 'THE_DRIFTER', 'THE_BURNED_HERO',
  'THE_GOLDEN_PRISONER', 'THE_CHAOS_SURFER', 'THE_GUARDIAN'
];

const VERDICT_INDEX_MAP: VerdictKey[] = [
  'HEALTHY_SCALE', 'BRILLIANT_SABOTAGE', 'INVISIBILE_CEILING',
  'LEAKY_BUCKET', 'PARALYZED_GIANT', 'FROZEN_POTENTIAL', 'CRITICAL_DEFICIT'
];

const TASKS_LOGIC: Record<PhaseType, Array<{ taskKey: TaskKey, targetMetricKey: string }>> = {
  SANITATION: [
    { taskKey: "sanitation_1", targetMetricKey: "Focus +10%" }, { taskKey: "sanitation_2", targetMetricKey: "Sync +15%" },
    { taskKey: "sanitation_3", targetMetricKey: "Space +15%" }, { taskKey: "sanitation_4", targetMetricKey: "Clarity +20%" },
    { taskKey: "sanitation_5", targetMetricKey: "Control +10%" }, { taskKey: "sanitation_6", targetMetricKey: "Awareness +12%" },
    { taskKey: "sanitation_7", targetMetricKey: "Space +25%" }
  ],
  STABILIZATION: [
    { taskKey: "stabilization_1", targetMetricKey: "Agency +12%" }, { taskKey: "stabilization_2", targetMetricKey: "Foundation +15%" },
    { taskKey: "stabilization_3", targetMetricKey: "Will +10%" }, { taskKey: "stabilization_4", targetMetricKey: "Stability +15%" },
    { taskKey: "stabilization_5", targetMetricKey: "Focus +12%" }, { taskKey: "stabilization_6", targetMetricKey: "Agency +15%" },
    { taskKey: "stabilization_7", targetMetricKey: "Integrity +15%" }
  ],
  EXPANSION: [
    { taskKey: "expansion_1", targetMetricKey: "Courage +20%" }, { taskKey: "expansion_2", targetMetricKey: "Resource +15%" },
    { taskKey: "expansion_3", targetMetricKey: "Agency +20%" }, { taskKey: "expansion_4", targetMetricKey: "Visibility +25%" },
    { taskKey: "expansion_5", targetMetricKey: "Scale +30%" }, { taskKey: "expansion_6", targetMetricKey: "Vision +20%" },
    { taskKey: "expansion_7", targetMetricKey: "Integrity +25%" }
  ]
};

export const DiagnosticEngine = {
  interpret(raw: RawAnalysisResult, patternFlags: PatternFlags): AnalysisResult {
    const { state, phase, conflicts, activePatterns } = raw;
    const { foundation: f, agency: a, resource: r, entropy: e } = state;

    // 1. Archetype Determination
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

    // 2. Verdict Determination (Single Source of Truth)
    let verdictKey: VerdictKey = 'HEALTHY_SCALE';
    if (f <= 35) verdictKey = 'CRITICAL_DEFICIT';
    else if (a > 75 && f < 45) verdictKey = 'BRILLIANT_SABOTAGE';
    else if (f > 75 && a < 40) verdictKey = 'INVISIBILE_CEILING';
    else if (r > 70 && e > 55) verdictKey = 'LEAKY_BUCKET';
    else if (a < 35 && e > 45) verdictKey = 'PARALYZED_GIANT';
    else if (f < 50 && a < 50 && r < 50 && e < 40) verdictKey = 'FROZEN_POTENTIAL';

    // 3. Roadmap Generation
    const pool = TASKS_LOGIC[phase];
    const roadmap = Array.from({ length: 7 }, (_, i) => ({ day: i + 1, phase, ...pool[i % pool.length] }));

    // 4. Share Code Generation
    const archIndex = ARCHETYPE_INDEX_MAP.indexOf(primary.key);
    const verdictIndex = VERDICT_INDEX_MAP.indexOf(verdictKey);
    const payload = new Uint8Array([
        Math.round(f), Math.round(a), Math.round(r), Math.round(e),
        archIndex !== -1 ? archIndex : 4, // Default to Chaos Surfer
        Math.round(raw.neuroSync),
        verdictIndex !== -1 ? verdictIndex : 0 // Default to Healthy
    ]);
    const shareCode = btoa(String.fromCharCode(...payload)).replace(/=/g, '');

    // 5. Narrative & Strategic Fields
    const coreConflict = conflicts.length > 0 ? conflicts[0].key : (verdictKey !== 'HEALTHY_SCALE' ? verdictKey.toLowerCase() : 'none');
    
    // 6. Validity Override
    let finalValidity = raw.validity;
    if (patternFlags.isMonotonic || patternFlags.isHighSkipRate || patternFlags.isFlatline || patternFlags.isRoboticTiming || patternFlags.isSomaticMonotony) {
        finalValidity = 'INVALID';
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
      shadowDirective: activePatterns.includes('hero_martyr') ? 'self_sabotage_fix' : 'integrity_boost',
      interferenceInsight: activePatterns.includes('family_loyalty') ? 'family_vs_money' : undefined,
      patternFlags
    };
  }
};