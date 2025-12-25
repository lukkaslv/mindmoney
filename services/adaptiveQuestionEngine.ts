
import { GameHistoryItem, Contradiction, AdaptiveState, BeliefKey, DomainType } from '../types';
import { MODULE_REGISTRY, ONBOARDING_NODES_COUNT, TOTAL_NODES, DOMAIN_SETTINGS } from '../constants';

const CLARITY_PER_NODE = 3.0; 
const CONTRADICTION_PENALTY = 2.0; 

const POSITIVE_BELIEFS: BeliefKey[] = ['money_is_tool', 'self_permission', 'capacity_expansion', 'money_is_tool'];

export const AdaptiveQuestionEngine = {
  analyzeContradictions(history: GameHistoryItem[], userBaseline: number): Contradiction[] {
    const contradictions: Contradiction[] = [];

    history.forEach(h => {
      const numericId = parseInt(h.nodeId);
      if (numericId < 3) return; // Ignore calibration nodes

      // 1. Latency Mask (Cognitive Dissonance)
      if (h.latency > userBaseline * 2.8 && POSITIVE_BELIEFS.includes(h.beliefKey)) {
        contradictions.push({
          type: 'latency_mask',
          nodeId: h.nodeId,
          beliefKey: h.beliefKey,
          severity: 0.85,
          description: 'High cognitive effort for standard choice'
        });
      }

      // 2. Somatic Clash (Body-Mind Mismatch)
      if ((h.sensation === 's1' || h.sensation === 's4') && POSITIVE_BELIEFS.includes(h.beliefKey)) {
        contradictions.push({
          type: 'somatic_clash',
          nodeId: h.nodeId,
          beliefKey: h.beliefKey,
          severity: 0.95,
          description: 'Physical friction detected'
        });
      }
    });

    return contradictions;
  },

  selectNextQuestion(history: GameHistoryItem[], contradictions: Contradiction[]): string | null {
    const completedIds = history.map(h => parseInt(h.nodeId));
    
    // Strict Calibration Phase (Nodes 0, 1, 2)
    for (let i = 0; i < 3; i++) {
        if (!completedIds.includes(i)) return i.toString();
    }
    
    // Probing logic: If tension found in a domain, prioritize that domain's remaining nodes
    const problematicDomain = contradictions.length > 0 
      ? history.find(h => h.nodeId === contradictions[contradictions.length - 1].nodeId)?.domain 
      : null;

    if (problematicDomain) {
      const domainCfg = DOMAIN_SETTINGS.find(d => d.key === problematicDomain);
      if (domainCfg) {
        for (let i = 0; i < domainCfg.count; i++) {
          const id = (domainCfg.startId + i);
          if (!completedIds.includes(id)) return id.toString();
        }
      }
    }

    // Default linear crawl (skipping calibration which is already checked)
    for (let i = 3; i < TOTAL_NODES; i++) {
        if (!completedIds.includes(i)) return i.toString();
    }

    return null;
  },

  getAdaptiveState(history: GameHistoryItem[], userBaseline: number): AdaptiveState {
    const contradictions = this.analyzeContradictions(history, userBaseline);
    const rawClarity = history.length * CLARITY_PER_NODE;
    const penalty = contradictions.length * CONTRADICTION_PENALTY;
    
    const clarity = Math.min(100, Math.max(0, rawClarity - penalty));
    const suggestedNextNodeId = this.selectNextQuestion(history, contradictions);

    // Calculate Variance for Confidence Score
    const latencies = history.map(h => h.latency).filter(l => l > 400);
    const avg = latencies.reduce((a,b) => a+b, 0) / Math.max(1, latencies.length);
    const variance = Math.sqrt(latencies.reduce((a,b) => a + Math.pow(b - avg, 2), 0) / Math.max(1, latencies.length));
    const confidenceScore = Math.max(0, 100 - (variance / Math.max(1, avg) * 140));

    return {
      clarity,
      contradictions,
      isComplete: clarity >= 100 || suggestedNextNodeId === null || history.length >= 60,
      suggestedNextNodeId,
      confidenceScore: Math.round(confidenceScore)
    };
  }
};
