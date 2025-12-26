
import { AnalysisResult, CompatibilityReport, DomainType, ArchetypeKey, VerdictKey } from '../types';

const ARCHETYPE_INDEX_MAP: ArchetypeKey[] = [
  'THE_ARCHITECT', 
  'THE_DRIFTER', 
  'THE_BURNED_HERO',
  'THE_GOLDEN_PRISONER', 
  'THE_CHAOS_SURFER', 
  'THE_GUARDIAN'
];

const VERDICT_INDEX_MAP: VerdictKey[] = [
  'HEALTHY_SCALE',
  'BRILLIANT_SABOTAGE',
  'INVISIBILE_CEILING',
  'LEAKY_BUCKET',
  'PARALYZED_GIANT',
  'FROZEN_POTENTIAL',
  'CRITICAL_DEFICIT'
];

export const CompatibilityEngine = {
  analyzeCompatibility(b1: AnalysisResult, b2: AnalysisResult): CompatibilityReport {
    const synergies: DomainType[] = [];
    const conflicts: DomainType[] = [];
    const recommendations: string[] = [];

    const domains: DomainType[] = ['foundation', 'agency', 'money', 'social', 'legacy'];

    domains.forEach(d => {
      const v1 = b1.state[d as keyof typeof b1.state] || 50;
      const v2 = b2.state[d as keyof typeof b2.state] || 50;
      const diff = Math.abs(v1 - v2);

      if (diff < 15 && v1 > 60) synergies.push(d);
      if (diff > 40) conflicts.push(d);
    });

    let score = 70;
    score += synergies.length * 8;
    score -= conflicts.length * 12;
    score = Math.min(100, Math.max(0, score));

    if (conflicts.includes('agency')) {
        recommendations.push("Define clear decision-making boundaries to avoid power struggles.");
    }
    if (b1.entropyScore > 50 && b2.entropyScore > 50) {
        recommendations.push("Urgent: Both systems lack structural grounding.");
    }

    let relType: CompatibilityReport['relationshipType'] = 'Neutral';
    if (score > 85) relType = 'Synergy';
    else if (score > 65) relType = 'Complementary';
    else if (score < 40) relType = 'Challenging';

    return {
      overallScore: Math.round(score),
      domainSynergies: synergies,
      domainConflicts: conflicts,
      recommendations: recommendations.length > 0 ? recommendations : ["Maintain somatic awareness."],
      relationshipType: relType,
      partnerArchetype: b2.archetypeKey
    };
  },

  decodeSmartCode(textInput: string): AnalysisResult | null {
    try {
        if (!textInput) return null;
        
        let codeToDecode = textInput.trim();

        const idMatch = textInput.match(/(?:CLIENT ID|Share Code|CODE|ID):\s*([A-Za-z0-9+/=]+)/i);
        if (idMatch && idMatch[1]) {
            codeToDecode = idMatch[1].trim();
        } 
        
        const sanitized = codeToDecode.replace(/[^A-Za-z0-9+/=]/g, '');
        
        if (sanitized.length > 40 && !idMatch) {
            return null;
        }

        const paddedCode = sanitized.padEnd(Math.ceil(sanitized.length / 4) * 4, '=');
        const binaryString = atob(paddedCode);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        if (bytes.length < 6) return null;

        const f = bytes[0];
        const a = bytes[1];
        const r = bytes[2];
        const e = bytes[3];
        const archIdx = bytes[4];
        const sync = bytes[5];
        const verdictIdx = bytes.length > 6 ? bytes[6] : 0;

        if (f > 200 || a > 200) return null;

        const archetypeKey = ARCHETYPE_INDEX_MAP[archIdx] || 'THE_CHAOS_SURFER';
        // INTEGRITY FIX: The verdict is now trusted directly from the share code.
        // The "Safety Override Logic" has been removed to ensure a single source of truth from psychologyService.
        const verdictKey = VERDICT_INDEX_MAP[verdictIdx] || 'HEALTHY_SCALE';

        return {
            timestamp: Date.now(),
            createdAt: Date.now(),
            shareCode: sanitized,
            state: { foundation: f, agency: a, resource: r, entropy: e },
            integrity: Math.round(((f + a + r) / 3) * (1 - (e / 150))),
            capacity: Math.round((f + r) / 2),
            entropyScore: e,
            neuroSync: sync,
            systemHealth: Math.round(((f + a + r) / 3) * 0.6 + sync * 0.4),
            phase: 'STABILIZATION',
            archetypeKey: archetypeKey,
            archetypeMatch: 100,
            archetypeSpectrum: [],
            verdictKey: verdictKey, 
            lifeScriptKey: 'healthy_integration',
            roadmap: [],
            graphPoints: [{ x: 50, y: 50 - f / 2.5 }, { x: 50 + r / 2.2, y: 50 + r / 3.5 }, { x: 50 - a / 2.2, y: 50 + a / 3.5 }],
            status: f < 25 ? 'PROTECTIVE' : 'OPTIMAL',
            validity: 'VALID',
            activePatterns: [],
            correlations: [],
            conflicts: [],
            somaticDissonance: [],
            somaticProfile: { blocks: 0, resources: 0, dominantSensation: 's0' },
            integrityBreakdown: { coherence: 100, sync, stability: f, label: 'IMPORTED', description: '', status: 'STABLE' },
            interventionStrategy: '',
            coreConflict: '',
            shadowDirective: '',
            clarity: 100,
            confidenceScore: 100,
            warnings: [],
            flags: {
                isAlexithymiaDetected: false,
                isSlowProcessingDetected: false,
                isNeuroSyncReliable: true,
                isSocialDesirabilityBiasDetected: false,
                processingSpeedCompensation: 1.0,
                entropyType: 'NEUTRAL'
            },
            patternFlags: { isMonotonic: false, isHighSkipRate: false, isFlatline: false, dominantPosition: null, isRoboticTiming: false, isSomaticMonotony: false },
            skippedCount: 0
        };
    } catch (e) {
        console.error("Decoder Error:", e);
        return null;
    }
  }
};