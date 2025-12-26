import { AnalysisResult, CompatibilityReport, DomainType, ArchetypeKey, VerdictKey } from '../types';
import { SecurityCore } from '../utils/crypto';

const ARCHETYPE_INDEX_MAP: ArchetypeKey[] = [
  'THE_ARCHITECT', 'THE_DRIFTER', 'THE_BURNED_HERO',
  'THE_GOLDEN_PRISONER', 'THE_CHAOS_SURFER', 'THE_GUARDIAN'
];

const VERDICT_INDEX_MAP: VerdictKey[] = [
  'HEALTHY_SCALE', 'BRILLIANT_SABOTAGE', 'INVISIBILE_CEILING',
  'LEAKY_BUCKET', 'PARALYZED_GIANT', 'FROZEN_POTENTIAL', 'CRITICAL_DEFICIT'
];

export const CompatibilityEngine = {
  analyzeCompatibility(b1: AnalysisResult, b2: AnalysisResult): CompatibilityReport {
    return {
      overallScore: 0,
      domainSynergies: [],
      domainConflicts: [],
      recommendations: [],
      relationshipType: 'Neutral',
      partnerArchetype: b2.archetypeKey
    };
  },

  decodeSmartCode(textInput: string): AnalysisResult | null {
    try {
        if (!textInput) return null;
        
        let codeToDecode = textInput.trim();
        const idMatch = textInput.match(/(?:CLIENT ID|Share Code|CODE|ID):\s*([A-Za-z0-9+/=]+)/i);
        if (idMatch && idMatch[1]) codeToDecode = idMatch[1].trim();
        
        const sanitized = codeToDecode.replace(/[^A-Za-z0-9+/=]/g, '');
        const decoded = atob(sanitized);
        
        // BLUE_TEAM CHECK: Split by signature anchor
        const [data, sig] = decoded.split('#');
        if (!data || !sig) return null; // Old format or tampered
        
        if (SecurityCore.generateChecksum(data) !== sig) {
            console.error("BLUE_TEAM_ALERT: CODE_TAMPERING_DETECTED");
            return null;
        }

        const parts = data.split('|').map(Number);
        if (parts.length < 7) return null;

        const [f, a, r, e, archIdx, sync, verdictIdx] = parts;

        const archetypeKey = ARCHETYPE_INDEX_MAP[archIdx] || 'THE_CHAOS_SURFER';
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
            archetypeKey,
            archetypeMatch: 100,
            archetypeSpectrum: [],
            verdictKey, 
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
            integrityBreakdown: { coherence: 100, sync, stability: f, label: 'SECURE_IMPORT', description: '', status: 'STABLE' },
            interventionStrategy: '',
            coreConflict: '',
            shadowDirective: '',
            clarity: 100,
            confidenceScore: 100,
            warnings: [],
            // Fixed typo in isSocialDesirabilityBiasDetected property
            flags: { isAlexithymiaDetected: false, isSlowProcessingDetected: false, isNeuroSyncReliable: true, isSocialDesirabilityBiasDetected: false, processingSpeedCompensation: 1.0, entropyType: 'NEUTRAL', isL10nRiskDetected: false },
            patternFlags: { isMonotonic: false, isHighSkipRate: false, isFlatline: false, dominantPosition: null, isRoboticTiming: false, isSomaticMonotony: false, isEarlyTermination: false },
            skippedCount: 0
        };
    } catch (e) {
        return null;
    }
  }
};