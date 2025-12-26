
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
      if (h.latency > userBaseline * 2.8 && POSITIVE_BELIEFS.includes(h.beliefKey as BeliefKey)) {
        contradictions.push({
          type: 'latency_mask',
          nodeId: h.nodeId,
          beliefKey: h.beliefKey,
          severity: 0.85,
          description: 'High cognitive effort for standard choice'
        });
      }

      // 2. Somatic Clash (Body-Mind Mismatch)
      if ((h.sensation === 's1' || h.sensation === 's4') && POSITIVE_BELIEFS.includes(h.beliefKey as BeliefKey)) {
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
    
    // DYNAMIC PROBING: Scan ALL domains for highest tension
    let domainTension: Record<DomainType, number> = { foundation: 0, agency: 0, money: 0, social: 0, legacy: 0 };
    
    // Calculate tension based on contradictions per domain
    contradictions.forEach(c => {
        const item = history.find(h => h.nodeId === c.nodeId);
        if (item) domainTension[item.domain]++;
    });

    // Find the domain with maximum tension that still has remaining nodes
    const sortedDomains = Object.entries(domainTension)
        .sort((a, b) => b[1] - a[1]) // Descending tension
        .map(([key]) => key as DomainType);

    for (const domainKey of sortedDomains) {
        const domainCfg = DOMAIN_SETTINGS.find(d => d.key === domainKey);
        if (domainCfg) {
             // Check if this domain has remaining nodes
             for (let i = 0; i < domainCfg.count; i++) {
                const id = (domainCfg.startId + i);
                if (!completedIds.includes(id)) {
                    // console.log(`Adaptive Engine: Probing ${domainKey} due to tension score ${domainTension[domainKey]}`);
                    return id.toString();
                }
             }
        }
    }

    // Default linear crawl if no specific tension found or high-tension domains are full
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