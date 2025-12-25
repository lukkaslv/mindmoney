
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
  choices: { idSuffix: string; beliefKey: BeliefKey }[];
}

// SEMANTIC MAPPING
const NODE_CONFIGS: Record<string, NodeConfig> = {
  // --- FOUNDATION (0-14) ---
  "foundation_0": { intensity: 3, choices: [{ idSuffix: "c1", beliefKey: "family_loyalty" }, { idSuffix: "c2", beliefKey: "scarcity_mindset" }, { idSuffix: "c3", beliefKey: "self_permission" }] },
  "foundation_1": { intensity: 4, choices: [{ idSuffix: "c1", beliefKey: "fear_of_punishment" }, { idSuffix: "c2", beliefKey: "hard_work_only" }, { idSuffix: "c3", beliefKey: "capacity_expansion" }] },
  "foundation_2": { intensity: 5, choices: [{ idSuffix: "c1", beliefKey: "scarcity_mindset" }, { idSuffix: "c2", beliefKey: "boundary_collapse" }, { idSuffix: "c3", beliefKey: "capacity_expansion" }] },
  "foundation_3": { intensity: 3, choices: [{ idSuffix: "c1", beliefKey: "shame_of_success" }, { idSuffix: "c2", beliefKey: "family_loyalty" }, { idSuffix: "c3", beliefKey: "money_is_tool" }] },
  "foundation_4": { intensity: 5, choices: [{ idSuffix: "c1", beliefKey: "imposter_syndrome" }, { idSuffix: "c2", beliefKey: "fear_of_punishment" }, { idSuffix: "c3", beliefKey: "short_term_bias" }] },
  "foundation_5": { intensity: 4, choices: [{ idSuffix: "c1", beliefKey: "latency_resistance" }, { idSuffix: "c2", beliefKey: "unconscious_fear" }, { idSuffix: "c3", beliefKey: "capacity_expansion" }] },
  "foundation_6": { intensity: 3, choices: [{ idSuffix: "c1", beliefKey: "boundary_collapse" }, { idSuffix: "c2", beliefKey: "fear_of_conflict" }, { idSuffix: "c3", beliefKey: "money_is_tool" }] },
  "foundation_7": { intensity: 2, choices: [{ idSuffix: "c1", beliefKey: "unconscious_fear" }, { idSuffix: "c2", beliefKey: "scarcity_mindset" }, { idSuffix: "c3", beliefKey: "self_permission" }] },
  "foundation_8": { intensity: 4, choices: [{ idSuffix: "c1", beliefKey: "body_mind_conflict" }, { idSuffix: "c2", beliefKey: "hard_work_only" }, { idSuffix: "c3", beliefKey: "capacity_expansion" }] },
  "foundation_9": { intensity: 3, choices: [{ idSuffix: "c1", beliefKey: "poverty_is_virtue" }, { idSuffix: "c2", beliefKey: "imposter_syndrome" }, { idSuffix: "c3", beliefKey: "self_permission" }] },
  "foundation_10": { intensity: 5, choices: [{ idSuffix: "c1", beliefKey: "hard_work_only" }, { idSuffix: "c2", beliefKey: "scarcity_mindset" }, { idSuffix: "c3", beliefKey: "capacity_expansion" }] },
  "foundation_11": { intensity: 4, choices: [{ idSuffix: "c1", beliefKey: "family_loyalty" }, { idSuffix: "c2", beliefKey: "money_is_tool" }, { idSuffix: "c3", beliefKey: "boundary_collapse" }] },
  "foundation_12": { intensity: 4, choices: [{ idSuffix: "c1", beliefKey: "scarcity_mindset" }, { idSuffix: "c2", beliefKey: "imposter_syndrome" }, { idSuffix: "c3", beliefKey: "money_is_tool" }] },
  "foundation_13": { intensity: 5, choices: [{ idSuffix: "c1", beliefKey: "hard_work_only" }, { idSuffix: "c2", beliefKey: "fear_of_punishment" }, { idSuffix: "c3", beliefKey: "body_mind_conflict" }] },
  "foundation_14": { intensity: 3, choices: [{ idSuffix: "c1", beliefKey: "imposter_syndrome" }, { idSuffix: "c2", beliefKey: "impulse_spend" }, { idSuffix: "c3", beliefKey: "capacity_expansion" }] },

  // --- AGENCY ---
  "agency_0": { intensity: 4, choices: [{ idSuffix: "c1", beliefKey: "fear_of_conflict" }, { idSuffix: "c2", beliefKey: "unconscious_fear" }, { idSuffix: "c3", beliefKey: "self_permission" }] },
  "agency_1": { intensity: 5, choices: [{ idSuffix: "c1", beliefKey: "imposter_syndrome" }, { idSuffix: "c2", beliefKey: "fear_of_punishment" }, { idSuffix: "c3", beliefKey: "capacity_expansion" }] },
  "agency_2": { intensity: 4, choices: [{ idSuffix: "c1", beliefKey: "boundary_collapse" }, { idSuffix: "c2", beliefKey: "fear_of_conflict" }, { idSuffix: "c3", beliefKey: "self_permission" }] },
  "agency_3": { intensity: 4, choices: [{ idSuffix: "c1", beliefKey: "betrayal_trauma" }, { idSuffix: "c2", beliefKey: "unconscious_fear" }, { idSuffix: "c3", beliefKey: "capacity_expansion" }] },
  "agency_4": { intensity: 5, choices: [{ idSuffix: "c1", beliefKey: "scarcity_mindset" }, { idSuffix: "c2", beliefKey: "hard_work_only" }, { idSuffix: "c3", beliefKey: "self_permission" }] },
  "agency_5": { intensity: 3, choices: [{ idSuffix: "c1", beliefKey: "shame_of_success" }, { idSuffix: "c2", beliefKey: "imposter_syndrome" }, { idSuffix: "c3", beliefKey: "capacity_expansion" }] },
  "agency_6": { intensity: 4, choices: [{ idSuffix: "c1", beliefKey: "hard_work_only" }, { idSuffix: "c2", beliefKey: "scarcity_mindset" }, { idSuffix: "c3", beliefKey: "money_is_tool" }] },
  "agency_7": { intensity: 4, choices: [{ idSuffix: "c1", beliefKey: "scarcity_mindset" }, { idSuffix: "c2", beliefKey: "betrayal_trauma" }, { idSuffix: "c3", beliefKey: "money_is_tool" }] },
  "agency_8": { intensity: 5, choices: [{ idSuffix: "c1", beliefKey: "fear_of_conflict" }, { idSuffix: "c2", beliefKey: "boundary_collapse" }, { idSuffix: "c3", beliefKey: "capacity_expansion" }] },
  "agency_9": { intensity: 4, choices: [{ idSuffix: "c1", beliefKey: "fear_of_conflict" }, { idSuffix: "c2", beliefKey: "imposter_syndrome" }, { idSuffix: "c3", beliefKey: "self_permission" }] },

  // --- MONEY ---
  "money_0": { intensity: 5, choices: [{ idSuffix: "c1", beliefKey: "money_is_danger" }, { idSuffix: "c2", beliefKey: "impulse_spend" }, { idSuffix: "c3", beliefKey: "capacity_expansion" }] },
  "money_1": { intensity: 4, choices: [{ idSuffix: "c1", beliefKey: "imposter_syndrome" }, { idSuffix: "c2", beliefKey: "poverty_is_virtue" }, { idSuffix: "c3", beliefKey: "money_is_tool" }] },
  "money_2": { intensity: 3, choices: [{ idSuffix: "c1", beliefKey: "shame_of_success" }, { idSuffix: "c2", beliefKey: "scarcity_mindset" }, { idSuffix: "c3", beliefKey: "self_permission" }] },
  "money_3": { intensity: 5, choices: [{ idSuffix: "c1", beliefKey: "impulse_spend" }, { idSuffix: "c2", beliefKey: "short_term_bias" }, { idSuffix: "c3", beliefKey: "money_is_tool" }] },
  "money_4": { intensity: 3, choices: [{ idSuffix: "c1", beliefKey: "boundary_collapse" }, { idSuffix: "c2", beliefKey: "fear_of_conflict" }, { idSuffix: "c3", beliefKey: "capacity_expansion" }] },
  "money_5": { intensity: 4, choices: [{ idSuffix: "c1", beliefKey: "imposter_syndrome" }, { idSuffix: "c2", beliefKey: "scarcity_mindset" }, { idSuffix: "c3", beliefKey: "money_is_tool" }] },
  "money_6": { intensity: 5, choices: [{ idSuffix: "c1", beliefKey: "money_is_danger" }, { idSuffix: "c2", beliefKey: "impulse_spend" }, { idSuffix: "c3", beliefKey: "capacity_expansion" }] },
  "money_7": { intensity: 3, choices: [{ idSuffix: "c1", beliefKey: "resource_toxicity" }, { idSuffix: "c2", beliefKey: "impulse_spend" }, { idSuffix: "c3", beliefKey: "money_is_tool" }] },
  "money_8": { intensity: 4, choices: [{ idSuffix: "c1", beliefKey: "scarcity_mindset" }, { idSuffix: "c2", beliefKey: "hard_work_only" }, { idSuffix: "c3", beliefKey: "capacity_expansion" }] },
  "money_9": { intensity: 3, choices: [{ idSuffix: "c1", beliefKey: "shame_of_success" }, { idSuffix: "c2", beliefKey: "poverty_is_virtue" }, { idSuffix: "c3", beliefKey: "self_permission" }] },

  // --- SOCIAL ---
  "social_0": { intensity: 4, choices: [{ idSuffix: "c1", beliefKey: "shame_of_success" }, { idSuffix: "c2", beliefKey: "body_mind_conflict" }, { idSuffix: "c3", beliefKey: "self_permission" }] },
  "social_1": { intensity: 5, choices: [{ idSuffix: "c1", beliefKey: "boundary_collapse" }, { idSuffix: "c2", beliefKey: "betrayal_trauma" }, { idSuffix: "c3", beliefKey: "capacity_expansion" }] },
  "social_2": { intensity: 3, choices: [{ idSuffix: "c1", beliefKey: "imposter_syndrome" }, { idSuffix: "c2", beliefKey: "fear_of_conflict" }, { idSuffix: "c3", beliefKey: "self_permission" }] },
  "social_3": { intensity: 4, choices: [{ idSuffix: "c1", beliefKey: "fear_of_punishment" }, { idSuffix: "c2", beliefKey: "betrayal_trauma" }, { idSuffix: "c3", beliefKey: "capacity_expansion" }] },
  "social_4": { intensity: 4, choices: [{ idSuffix: "c1", beliefKey: "poverty_is_virtue" }, { idSuffix: "c2", beliefKey: "boundary_collapse" }, { idSuffix: "c3", beliefKey: "money_is_tool" }] },
  "social_5": { intensity: 5, choices: [{ idSuffix: "c1", beliefKey: "scarcity_mindset" }, { idSuffix: "c2", beliefKey: "betrayal_trauma" }, { idSuffix: "c3", beliefKey: "capacity_expansion" }] },
  "social_6": { intensity: 3, choices: [{ idSuffix: "c1", beliefKey: "scarcity_mindset" }, { idSuffix: "c2", beliefKey: "latency_resistance" }, { idSuffix: "c3", beliefKey: "money_is_tool" }] },
  "social_7": { intensity: 3, choices: [{ idSuffix: "c1", beliefKey: "imposter_syndrome" }, { idSuffix: "c2", beliefKey: "shame_of_success" }, { idSuffix: "c3", beliefKey: "self_permission" }] },
  "social_8": { intensity: 4, choices: [{ idSuffix: "c1", beliefKey: "fear_of_conflict" }, { idSuffix: "c2", beliefKey: "betrayal_trauma" }, { idSuffix: "c3", beliefKey: "self_permission" }] },
  "social_9": { intensity: 4, choices: [{ idSuffix: "c1", beliefKey: "scarcity_mindset" }, { idSuffix: "c2", beliefKey: "poverty_is_virtue" }, { idSuffix: "c3", beliefKey: "capacity_expansion" }] },

  // --- LEGACY ---
  "legacy_0": { intensity: 5, choices: [{ idSuffix: "c1", beliefKey: "short_term_bias" }, { idSuffix: "c2", beliefKey: "scarcity_mindset" }, { idSuffix: "c3", beliefKey: "capacity_expansion" }] },
  "legacy_1": { intensity: 5, choices: [{ idSuffix: "c1", beliefKey: "money_is_danger" }, { idSuffix: "c2", beliefKey: "family_loyalty" }, { idSuffix: "c3", beliefKey: "self_permission" }] },
  "legacy_2": { intensity: 4, choices: [{ idSuffix: "c1", beliefKey: "scarcity_mindset" }, { idSuffix: "c2", beliefKey: "family_loyalty" }, { idSuffix: "c3", beliefKey: "money_is_tool" }] },
  "legacy_3": { intensity: 4, choices: [{ idSuffix: "c1", beliefKey: "latency_resistance" }, { idSuffix: "c2", beliefKey: "fear_of_punishment" }, { idSuffix: "c3", beliefKey: "capacity_expansion" }] },
  "legacy_4": { intensity: 5, choices: [{ idSuffix: "c1", beliefKey: "poverty_is_virtue" }, { idSuffix: "c2", beliefKey: "fear_of_conflict" }, { idSuffix: "c3", beliefKey: "self_permission" }] }
};

// DEFAULTS FOR SAFETY
const DEFAULT_NODE_CONFIG: NodeConfig = {
    intensity: 3,
    choices: [
        { idSuffix: "c1", beliefKey: "self_permission" },
        { idSuffix: "c2", beliefKey: "capacity_expansion" },
        { idSuffix: "c3", beliefKey: "scarcity_mindset" }
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

  DOMAIN_SETTINGS.forEach(domain => {
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
          beliefKey: c.beliefKey
        }))
      };
    }
  });

  return registry;
};

export const MODULE_REGISTRY = buildRegistry();
