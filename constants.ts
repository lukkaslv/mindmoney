

import { Scene, BeliefKey, DomainType, DomainRawConfig, DomainConfig } from './types';

// SYSTEM THRESHOLDS (SSOT for Psychology Service)
export const PSYCHO_CONFIG = {
  // LATENCY_THRESHOLD_MS removed in favor of dynamic baseline
  DISTRACTION_THRESHOLD_MS: 30000, // Latencies > 30s are ignored (outliers/distractions)
  IMPULSE_THRESHOLD_MS: 1000,      // < 1s is impulse/autoclick
  LATENCY_PENALTY: 3,         
  IMPULSE_PENALTY: 5,         
  MAX_LATENCY_PENALTY: 30,
  ENTROPY_DIVISOR: 120,       
  FOUNDATION_CRITICAL: 35,
  RESOURCE_GROWTH_TRIGGER: 4, 
  BODY_MIND_PENALTY: 12,
  BUG_ENTROPY_THRESHOLD: 8,
  VOLATILITY_THRESHOLD: 20,        // TUNED: Lowered from 25 to 20 to detect ambivalence earlier
  PHASE_THRESHOLDS: {
      STABILIZATION: { entropy: 30, integrity: 45 },
      EXPANSION: { integrity: 65, sync: 75 },
      SANITATION_FORCED: { entropy: 55 }
  }
};

export const ONBOARDING_NODES_COUNT = 5;

// --- SINGLE SOURCE OF TRUTH FOR BELIEFS ---
export const ALL_BELIEFS: BeliefKey[] = [
  'family_loyalty', 'scarcity_mindset', 'fear_of_punishment', 'imposter_syndrome', 'poverty_is_virtue',
  'hard_work_only', 'self_permission', 'fear_of_conflict', 'betrayal_trauma', 'unconscious_fear',
  'money_is_danger', 'impulse_spend', 'resource_toxicity', 'short_term_bias', 'capacity_expansion',
  'boundary_collapse', 'shame_of_success', 'hero_martyr', 'latency_resistance', 'body_mind_conflict',
  'ambivalence_loop', 'autopilot_mode', 'golden_cage', 'money_is_tool'
];

// 1. RAW CONFIGURATION (Human Input Only)
const RAW_DOMAINS: DomainRawConfig[] = [
  { key: 'foundation', count: 15, color: 'rgba(239, 68, 68, 0.08)' },
  { key: 'agency', count: 10, color: 'rgba(34, 197, 94, 0.08)' },
  { key: 'money', count: 10, color: 'rgba(99, 102, 241, 0.08)' },
  { key: 'social', count: 10, color: 'rgba(168, 85, 247, 0.08)' },
  { key: 'legacy', count: 5, color: 'rgba(236, 72, 153, 0.08)' }
];

// 2. COMPUTED SETTINGS (System Truth)
export const DOMAIN_SETTINGS: DomainConfig[] = RAW_DOMAINS.reduce((acc, domain, index) => {
  const startId = index === 0 ? 0 : acc[index - 1].startId + acc[index - 1].count;
  acc.push({ ...domain, startId });
  return acc;
}, [] as DomainConfig[]);

export const TOTAL_NODES = DOMAIN_SETTINGS.reduce((acc, d) => acc + d.count, 0);

// CONFIGURATION MAP
// Maps RELATIVE Node Keys to specific belief keys.
interface NodeConfig {
  intensity: number;
  choices: { idSuffix: string; beliefKey: BeliefKey; position: number }[];
}

// SEMANTIC MAPPING
export const NODE_CONFIGS: Record<string, NodeConfig> = {
  // --- FOUNDATION (0-14) ---
  "foundation_0": { intensity: 3, choices: [{ idSuffix: "c1", beliefKey: "family_loyalty", position: 0 }, { idSuffix: "c2", beliefKey: "scarcity_mindset", position: 1 }, { idSuffix: "c3", beliefKey: "self_permission", position: 2 }] },
  "foundation_1": { intensity: 4, choices: [{ idSuffix: "c1", beliefKey: "fear_of_punishment", position: 0 }, { idSuffix: "c2", beliefKey: "hard_work_only", position: 1 }, { idSuffix: "c3", beliefKey: "capacity_expansion", position: 2 }] },
  "foundation_2": { intensity: 5, choices: [{ idSuffix: "c1", beliefKey: "scarcity_mindset", position: 0 }, { idSuffix: "c2", beliefKey: "boundary_collapse", position: 1 }, { idSuffix: "c3", beliefKey: "capacity_expansion", position: 2 }] },
  "foundation_3": { intensity: 3, choices: [{ idSuffix: "c1", beliefKey: "shame_of_success", position: 0 }, { idSuffix: "c2", beliefKey: "family_loyalty", position: 1 }, { idSuffix: "c3", beliefKey: "money_is_tool", position: 2 }] },
  "foundation_4": { intensity: 5, choices: [{ idSuffix: "c1", beliefKey: "imposter_syndrome", position: 0 }, { idSuffix: "c2", beliefKey: "fear_of_punishment", position: 1 }, { idSuffix: "c3", beliefKey: "short_term_bias", position: 2 }] },
  "foundation_5": { intensity: 4, choices: [{ idSuffix: "c1", beliefKey: "latency_resistance", position: 0 }, { idSuffix: "c2", beliefKey: "unconscious_fear", position: 1 }, { idSuffix: "c3", beliefKey: "capacity_expansion", position: 2 }] },
  "foundation_6": { intensity: 3, choices: [{ idSuffix: "c1", beliefKey: "boundary_collapse", position: 0 }, { idSuffix: "c2", beliefKey: "fear_of_conflict", position: 1 }, { idSuffix: "c3", beliefKey: "money_is_tool", position: 2 }] },
  "foundation_7": { intensity: 2, choices: [{ idSuffix: "c1", beliefKey: "unconscious_fear", position: 0 }, { idSuffix: "c2", beliefKey: "scarcity_mindset", position: 1 }, { idSuffix: "c3", beliefKey: "self_permission", position: 2 }] },
  "foundation_8": { intensity: 4, choices: [{ idSuffix: "c1", beliefKey: "body_mind_conflict", position: 0 }, { idSuffix: "c2", beliefKey: "hard_work_only", position: 1 }, { idSuffix: "c3", beliefKey: "capacity_expansion", position: 2 }] },
  "foundation_9": { intensity: 3, choices: [{ idSuffix: "c1", beliefKey: "poverty_is_virtue", position: 0 }, { idSuffix: "c2", beliefKey: "imposter_syndrome", position: 1 }, { idSuffix: "c3", beliefKey: "self_permission", position: 2 }] },
  "foundation_10": { intensity: 5, choices: [{ idSuffix: "c1", beliefKey: "hard_work_only", position: 0 }, { idSuffix: "c2", beliefKey: "scarcity_mindset", position: 1 }, { idSuffix: "c3", beliefKey: "capacity_expansion", position: 2 }] },
  "foundation_11": { intensity: 4, choices: [{ idSuffix: "c1", beliefKey: "family_loyalty", position: 0 }, { idSuffix: "c2", beliefKey: "money_is_tool", position: 1 }, { idSuffix: "c3", beliefKey: "boundary_collapse", position: 2 }] },
  "foundation_12": { intensity: 4, choices: [{ idSuffix: "c1", beliefKey: "scarcity_mindset", position: 0 }, { idSuffix: "c2", beliefKey: "imposter_syndrome", position: 1 }, { idSuffix: "c3", beliefKey: "money_is_tool", position: 2 }] },
  "foundation_13": { intensity: 5, choices: [{ idSuffix: "c1", beliefKey: "hard_work_only", position: 0 }, { idSuffix: "c2", beliefKey: "fear_of_punishment", position: 1 }, { idSuffix: "c3", beliefKey: "body_mind_conflict", position: 2 }] },
  "foundation_14": { intensity: 3, choices: [{ idSuffix: "c1", beliefKey: "imposter_syndrome", position: 0 }, { idSuffix: "c2", beliefKey: "impulse_spend", position: 1 }, { idSuffix: "c3", beliefKey: "capacity_expansion", position: 2 }] },

  // --- AGENCY ---
  "agency_0": { intensity: 4, choices: [{ idSuffix: "c1", beliefKey: "fear_of_conflict", position: 0 }, { idSuffix: "c2", beliefKey: "unconscious_fear", position: 1 }, { idSuffix: "c3", beliefKey: "self_permission", position: 2 }] },
  "agency_1": { intensity: 5, choices: [{ idSuffix: "c1", beliefKey: "imposter_syndrome", position: 0 }, { idSuffix: "c2", beliefKey: "fear_of_punishment", position: 1 }, { idSuffix: "c3", beliefKey: "capacity_expansion", position: 2 }] },
  "agency_2": { intensity: 4, choices: [{ idSuffix: "c1", beliefKey: "boundary_collapse", position: 0 }, { idSuffix: "c2", beliefKey: "fear_of_conflict", position: 1 }, { idSuffix: "c3", beliefKey: "self_permission", position: 2 }] },
  "agency_3": { intensity: 4, choices: [{ idSuffix: "c1", beliefKey: "betrayal_trauma", position: 0 }, { idSuffix: "c2", beliefKey: "unconscious_fear", position: 1 }, { idSuffix: "c3", beliefKey: "capacity_expansion", position: 2 }] },
  "agency_4": { intensity: 5, choices: [{ idSuffix: "c1", beliefKey: "scarcity_mindset", position: 0 }, { idSuffix: "c2", beliefKey: "hard_work_only", position: 1 }, { idSuffix: "c3", beliefKey: "self_permission", position: 2 }] },
  "agency_5": { intensity: 3, choices: [{ idSuffix: "c1", beliefKey: "shame_of_success", position: 0 }, { idSuffix: "c2", beliefKey: "imposter_syndrome", position: 1 }, { idSuffix: "c3", beliefKey: "capacity_expansion", position: 2 }] },
  "agency_6": { intensity: 4, choices: [{ idSuffix: "c1", beliefKey: "hard_work_only", position: 0 }, { idSuffix: "c2", beliefKey: "scarcity_mindset", position: 1 }, { idSuffix: "c3", beliefKey: "money_is_tool", position: 2 }] },
  "agency_7": { intensity: 4, choices: [{ idSuffix: "c1", beliefKey: "scarcity_mindset", position: 0 }, { idSuffix: "c2", beliefKey: "betrayal_trauma", position: 1 }, { idSuffix: "c3", beliefKey: "money_is_tool", position: 2 }] },
  "agency_8": { intensity: 5, choices: [{ idSuffix: "c1", beliefKey: "fear_of_conflict", position: 0 }, { idSuffix: "c2", beliefKey: "boundary_collapse", position: 1 }, { idSuffix: "c3", beliefKey: "capacity_expansion", position: 2 }] },
  "agency_9": { intensity: 4, choices: [{ idSuffix: "c1", beliefKey: "fear_of_conflict", position: 0 }, { idSuffix: "c2", beliefKey: "imposter_syndrome", position: 1 }, { idSuffix: "c3", beliefKey: "self_permission", position: 2 }] },

  // --- MONEY ---
  "money_0": { intensity: 5, choices: [{ idSuffix: "c1", beliefKey: "money_is_danger", position: 0 }, { idSuffix: "c2", beliefKey: "impulse_spend", position: 1 }, { idSuffix: "c3", beliefKey: "capacity_expansion", position: 2 }] },
  "money_1": { intensity: 4, choices: [{ idSuffix: "c1", beliefKey: "imposter_syndrome", position: 0 }, { idSuffix: "c2", beliefKey: "poverty_is_virtue", position: 1 }, { idSuffix: "c3", beliefKey: "money_is_tool", position: 2 }] },
  "money_2": { intensity: 3, choices: [{ idSuffix: "c1", beliefKey: "shame_of_success", position: 0 }, { idSuffix: "c2", beliefKey: "scarcity_mindset", position: 1 }, { idSuffix: "c3", beliefKey: "self_permission", position: 2 }] },
  "money_3": { intensity: 5, choices: [{ idSuffix: "c1", beliefKey: "impulse_spend", position: 0 }, { idSuffix: "c2", beliefKey: "short_term_bias", position: 1 }, { idSuffix: "c3", beliefKey: "money_is_tool", position: 2 }] },
  "money_4": { intensity: 3, choices: [{ idSuffix: "c1", beliefKey: "boundary_collapse", position: 0 }, { idSuffix: "c2", beliefKey: "fear_of_conflict", position: 1 }, { idSuffix: "c3", beliefKey: "capacity_expansion", position: 2 }] },
  "money_5": { intensity: 4, choices: [{ idSuffix: "c1", beliefKey: "imposter_syndrome", position: 0 }, { idSuffix: "c2", beliefKey: "scarcity_mindset", position: 1 }, { idSuffix: "c3", beliefKey: "money_is_tool", position: 2 }] },
  "money_6": { intensity: 5, choices: [{ idSuffix: "c1", beliefKey: "money_is_danger", position: 0 }, { idSuffix: "c2", beliefKey: "impulse_spend", position: 1 }, { idSuffix: "c3", beliefKey: "capacity_expansion", position: 2 }] },
  "money_7": { intensity: 3, choices: [{ idSuffix: "c1", beliefKey: "resource_toxicity", position: 0 }, { idSuffix: "c2", beliefKey: "impulse_spend", position: 1 }, { idSuffix: "c3", beliefKey: "money_is_tool", position: 2 }] },
  "money_8": { intensity: 4, choices: [{ idSuffix: "c1", beliefKey: "scarcity_mindset", position: 0 }, { idSuffix: "c2", beliefKey: "hard_work_only", position: 1 }, { idSuffix: "c3", beliefKey: "capacity_expansion", position: 2 }] },
  "money_9": { intensity: 3, choices: [{ idSuffix: "c1", beliefKey: "shame_of_success", position: 0 }, { idSuffix: "c2", beliefKey: "poverty_is_virtue", position: 1 }, { idSuffix: "c3", beliefKey: "self_permission", position: 2 }] },

  // --- SOCIAL ---
  "social_0": { intensity: 4, choices: [{ idSuffix: "c1", beliefKey: "shame_of_success", position: 0 }, { idSuffix: "c2", beliefKey: "body_mind_conflict", position: 1 }, { idSuffix: "c3", beliefKey: "self_permission", position: 2 }] },
  "social_1": { intensity: 5, choices: [{ idSuffix: "c1", beliefKey: "boundary_collapse", position: 0 }, { idSuffix: "c2", beliefKey: "betrayal_trauma", position: 1 }, { idSuffix: "c3", beliefKey: "capacity_expansion", position: 2 }] },
  "social_2": { intensity: 3, choices: [{ idSuffix: "c1", beliefKey: "imposter_syndrome", position: 0 }, { idSuffix: "c2", beliefKey: "fear_of_conflict", position: 1 }, { idSuffix: "c3", beliefKey: "self_permission", position: 2 }] },
  "social_3": { intensity: 4, choices: [{ idSuffix: "c1", beliefKey: "fear_of_punishment", position: 0 }, { idSuffix: "c2", beliefKey: "betrayal_trauma", position: 1 }, { idSuffix: "c3", beliefKey: "capacity_expansion", position: 2 }] },
  "social_4": { intensity: 4, choices: [{ idSuffix: "c1", beliefKey: "poverty_is_virtue", position: 0 }, { idSuffix: "c2", beliefKey: "boundary_collapse", position: 1 }, { idSuffix: "c3", beliefKey: "money_is_tool", position: 2 }] },
  "social_5": { intensity: 5, choices: [{ idSuffix: "c1", beliefKey: "scarcity_mindset", position: 0 }, { idSuffix: "c2", beliefKey: "betrayal_trauma", position: 1 }, { idSuffix: "c3", beliefKey: "capacity_expansion", position: 2 }] },
  "social_6": { intensity: 3, choices: [{ idSuffix: "c1", beliefKey: "scarcity_mindset", position: 0 }, { idSuffix: "c2", beliefKey: "latency_resistance", position: 1 }, { idSuffix: "c3", beliefKey: "money_is_tool", position: 2 }] },
  "social_7": { intensity: 3, choices: [{ idSuffix: "c1", beliefKey: "imposter_syndrome", position: 0 }, { idSuffix: "c2", beliefKey: "shame_of_success", position: 1 }, { idSuffix: "c3", beliefKey: "self_permission", position: 2 }] },
  "social_8": { intensity: 4, choices: [{ idSuffix: "c1", beliefKey: "fear_of_conflict", position: 0 }, { idSuffix: "c2", beliefKey: "betrayal_trauma", position: 1 }, { idSuffix: "c3", beliefKey: "self_permission", position: 2 }] },
  "social_9": { intensity: 4, choices: [{ idSuffix: "c1", beliefKey: "scarcity_mindset", position: 0 }, { idSuffix: "c2", beliefKey: "poverty_is_virtue", position: 1 }, { idSuffix: "c3", beliefKey: "capacity_expansion", position: 2 }] },

  // --- LEGACY ---
  "legacy_0": { intensity: 5, choices: [{ idSuffix: "c1", beliefKey: "short_term_bias", position: 0 }, { idSuffix: "c2", beliefKey: "scarcity_mindset", position: 1 }, { idSuffix: "c3", beliefKey: "capacity_expansion", position: 2 }] },
  "legacy_1": { intensity: 5, choices: [{ idSuffix: "c1", beliefKey: "money_is_danger", position: 0 }, { idSuffix: "c2", beliefKey: "family_loyalty", position: 1 }, { idSuffix: "c3", beliefKey: "self_permission", position: 2 }] },
  "legacy_2": { intensity: 4, choices: [{ idSuffix: "c1", beliefKey: "scarcity_mindset", position: 0 }, { idSuffix: "c2", beliefKey: "family_loyalty", position: 1 }, { idSuffix: "c3", beliefKey: "money_is_tool", position: 2 }] },
  "legacy_3": { intensity: 4, choices: [{ idSuffix: "c1", beliefKey: "latency_resistance", position: 0 }, { idSuffix: "c2", beliefKey: "fear_of_punishment", position: 1 }, { idSuffix: "c3", beliefKey: "capacity_expansion", position: 2 }] },
  "legacy_4": { intensity: 5, choices: [{ idSuffix: "c1", beliefKey: "poverty_is_virtue", position: 0 }, { idSuffix: "c2", beliefKey: "fear_of_conflict", position: 1 }, { idSuffix: "c3", beliefKey: "self_permission", position: 2 }] }
};

// DEFAULTS FOR SAFETY
const DEFAULT_NODE_CONFIG: NodeConfig = {
    intensity: 3,
    choices: [
        { idSuffix: "c1", beliefKey: "self_permission", position: 0 },
        { idSuffix: "c2", beliefKey: "capacity_expansion", position: 1 },
        { idSuffix: "c3", beliefKey: "scarcity_mindset", position: 2 }
    ]
};

const DOMAIN_DEFAULTS: Record<string, NodeConfig> = {
    foundation: DEFAULT_NODE_CONFIG,
    agency: DEFAULT_NODE_CONFIG,
    money: DEFAULT_NODE_CONFIG,
    social: DEFAULT_NODE_CONFIG,
    legacy: DEFAULT_NODE_CONFIG
};

// FACTORY
const buildRegistry = () => {
  const registry: Record<string, Record<string, Scene>> = {};

  DOMAIN_SETTINGS.forEach((domain) => {
    registry[domain.key] = {};
    for (let i = 0; i < domain.count; i++) {
      const absoluteId = (domain.startId + i).toString();
      const relativeKey = `${domain.key}_${i}`;
      const config = NODE_CONFIGS[relativeKey] || DOMAIN_DEFAULTS[domain.key];
      const translationKeyBase = `scenes.${relativeKey}`;

      registry[domain.key][absoluteId] = {
        id: absoluteId,
        key: relativeKey,
        titleKey: `${translationKeyBase}.title`,
        descKey: `${translationKeyBase}.desc`,
        intensity: config.intensity,
        choices: config.choices.map((c, idx) => ({
          id: `${absoluteId}_${c.idSuffix}`, 
          textKey: `${translationKeyBase}.c${idx + 1}`,
          beliefKey: c.beliefKey,
          position: c.position
        }))
      };
    }
  });

  return registry;
};

export const MODULE_REGISTRY = buildRegistry();