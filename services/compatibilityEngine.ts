
import { AnalysisResult, CompatibilityReport, DomainType } from '../types';

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

    let score = 70; // Start at neutral-high
    score += synergies.length * 8;
    score -= conflicts.length * 12;
    score = Math.min(100, Math.max(0, score));

    if (conflicts.includes('agency')) {
        recommendations.push("Define clear decision-making boundaries to avoid power struggles.");
    }
    if (synergies.includes('foundation')) {
        recommendations.push("Leverage your joint stability for high-risk long-term investments.");
    }
    if (b1.entropyScore > 50 && b2.entropyScore > 50) {
        recommendations.push("Urgent: Both systems lack structural grounding. Implement shared routines.");
    }

    let relType: CompatibilityReport['relationshipType'] = 'Neutral';
    if (score > 85) relType = 'Synergy';
    else if (score > 65) relType = 'Complementary';
    else if (score < 40) relType = 'Challenging';

    return {
      overallScore: Math.round(score),
      domainSynergies: synergies,
      domainConflicts: conflicts,
      recommendations: recommendations.length > 0 ? recommendations : ["Maintain open communication about somatic triggers."],
      relationshipType: relType,
      partnerArchetype: b2.archetypeKey
    };
  },

  generateShareCode(result: AnalysisResult): string {
    // Deterministic short hash of the essential metrics
    const str = `${result.archetypeKey}-${result.integrity}-${result.entropyScore}`;
    return btoa(str).slice(0, 8).toUpperCase();
  }
};
