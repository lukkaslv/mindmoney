
import { Scene, BeliefKey, DomainType, DomainConfig } from './types';

export const STORAGE_KEYS = {
  LANG: 'genesis_lang',
  SESSION: 'genesis_session',
  SESSION_STATE: 'genesis_session_state',
  SCAN_HISTORY: 'genesis_scan_history',
  AUDIT_LOG: 'genesis_audit_log',
  ROADMAP_STATE: 'genesis_roadmap_state',
  TELEMETRY_DATA: 'genesis_telemetry',
  CLINICAL_FEEDBACK: 'genesis_clinical_feedback'
} as const;

// SYSTEM VERSIONING & OVERSIGHT
export const SYSTEM_METADATA = {
    VERSION: '9.8.0-SLC-LOOP',
    LAST_UPDATED: '2024-12-26',
    CODENAME: 'A/B Evolution Core',
    LANG_HEALTH: {
        ru: { status: 'VERIFIED', reliability: 0.98, notes: 'A/B Testing Active.' },
        ka: { status: 'LEARNING', reliability: 0.72, notes: 'Telemetry collecting for variant comparison.' }
    },
    LEARNING_CONFIG: {
        FRICTION_THRESHOLD: 2.5,
        CONFLICT_THRESHOLD: 0.4,
        MIN_SAMPLES: 5,
        AB_ENABLED: true
    },
    // A/B EXPERIMENTS DEFINITION
    EXPERIMENTS: {
        "CORE_WEIGHTS_V2": {
            active: true,
            description: "Testing adjusted Foundation/Agency sensitivity.",
            variants: {
                "A": "Control (v9.7)",
                "B": "Aggressive Agency Expansion"
            }
        }
    } as Record<string, { active: boolean, description: string, variants: Record<string, string> }>,
    
    SEMANTIC_RELIABILITY_OVERRIDE: {
        "foundation_1": 0.8,
        "money_0": 0.4, 
    } as Record<string, number>,
    
    CHANGELOG: [
        { v: '9.8.0', note: 'Implemented Deterministic A/B Framework. Clinical Feedback loop active.' },
        { v: '9.7.0', note: 'Implemented Self-Learning Core (SLC). Telemetry active.' }
    ]
};

// SYSTEM THRESHOLDS
export const PSYCHO_CONFIG = {
  DISTRACTION_THRESHOLD_MS: 30000, 
  IMPULSE_THRESHOLD_MS: 1000,      
  LATENCY_PENALTY: 3,         
  IMPULSE_PENALTY: 5,         
  MAX_LATENCY_PENALTY: 30,
  ENTROPY_DIVISOR: 120,       
  FOUNDATION_CRITICAL: 35,
  RESOURCE_GROWTH_TRIGGER: 4, 
  BODY_MIND_PENALTY: 12,
  BUG_ENTROPY_THRESHOLD: 8,
  VOLATILITY_THRESHOLD: 20
};

export const ONBOARDING_NODES_COUNT = 5;

export const ALL_BELIEFS: BeliefKey[] = [
  'family_loyalty', 'scarcity_mindset', 'fear_of_punishment', 'imposter_syndrome', 'poverty_is_virtue',
  'hard_work_only', 'self_permission', 'fear_of_conflict', 'betrayal_trauma', 'unconscious_fear',
  'money_is_danger', 'impulse_spend', 'resource_toxicity', 'short_term_bias', 'capacity_expansion',
  'boundary_collapse', 'shame_of_success', 'hero_martyr', 'latency_resistance', 'body_mind_conflict',
  'ambivalence_loop', 'autopilot_mode', 'golden_cage', 'money_is_tool'
];

const RAW_DOMAINS: DomainType[] = ['foundation', 'agency', 'money', 'social', 'legacy'];
const DOMAIN_COUNTS: Record<DomainType, number> = {
  foundation: 15, agency: 10, money: 10, social: 10, legacy: 5
};
const DOMAIN_COLORS: Record<DomainType, string> = {
  foundation: 'rgba(239, 68, 68, 0.08)',
  agency: 'rgba(34, 197, 94, 0.08)',
  money: 'rgba(99, 102, 241, 0.08)',
  social: 'rgba(168, 85, 247, 0.08)',
  legacy: 'rgba(236, 72, 153, 0.08)'
};

export const DOMAIN_SETTINGS: DomainConfig[] = RAW_DOMAINS.reduce((acc, key, index) => {
  const startId = index === 0 ? 0 : acc[index - 1].startId + acc[index - 1].count;
  acc.push({ key, count: DOMAIN_COUNTS[key], color: DOMAIN_COLORS[key], startId });
  return acc;
}, [] as DomainConfig[]);

export const TOTAL_NODES = DOMAIN_SETTINGS.reduce((acc, d) => acc + d.count, 0);

interface NodeConfig {
  intensity: number;
  choices: { idSuffix: string; beliefKey: BeliefKey; position: number }[];
}

// INTEGRITY FIX: All 24 beliefs are now reachable across domains
export const NODE_CONFIGS: Record<string, NodeConfig> = {
  // FOUNDATION
  "foundation_0": { intensity: 3, choices: [{ idSuffix: "c1", beliefKey: "family_loyalty", position: 0 }, { idSuffix: "c2", beliefKey: "autopilot_mode", position: 1 }, { idSuffix: "c3", beliefKey: "self_permission", position: 2 }] },
  "foundation_1": { intensity: 4, choices: [{ idSuffix: "c1", beliefKey: "fear_of_punishment", position: 0 }, { idSuffix: "c2", beliefKey: "hard_work_only", position: 1 }, { idSuffix: "c3", beliefKey: "capacity_expansion", position: 2 }] },
  "foundation_2": { intensity: 5, choices: [{ idSuffix: "c1", beliefKey: "scarcity_mindset", position: 0 }, { idSuffix: "c2", beliefKey: "boundary_collapse", position: 1 }, { idSuffix: "c3", beliefKey: "capacity_expansion", position: 2 }] },
  "foundation_3": { intensity: 3, choices: [{ idSuffix: "c1", beliefKey: "fear_of_conflict", position: 0 }, { idSuffix: "c2", beliefKey: "latency_resistance", position: 1 }, { idSuffix: "c3", beliefKey: "money_is_tool", position: 2 }] },
  "foundation_4": { intensity: 4, choices: [{ idSuffix: "c1", beliefKey: "betrayal_trauma", position: 0 }, { idSuffix: "c2", beliefKey: "unconscious_fear", position: 1 }, { idSuffix: "c3", beliefKey: "self_permission", position: 2 }] },
  
  // MONEY
  "money_0": { intensity: 5, choices: [{ idSuffix: "c1", beliefKey: "money_is_danger", position: 0 }, { idSuffix: "c2", beliefKey: "poverty_is_virtue", position: 1 }, { idSuffix: "c3", beliefKey: "money_is_tool", position: 2 }] },
  "money_1": { intensity: 4, choices: [{ idSuffix: "c1", beliefKey: "impulse_spend", position: 0 }, { idSuffix: "c2", beliefKey: "scarcity_mindset", position: 1 }, { idSuffix: "c3", beliefKey: "resource_toxicity", position: 2 }] },
  "money_2": { intensity: 3, choices: [{ idSuffix: "c1", beliefKey: "shame_of_success", position: 0 }, { idSuffix: "c2", beliefKey: "hard_work_only", position: 1 }, { idSuffix: "c3", beliefKey: "money_is_tool", position: 2 }] },
  "money_3": { intensity: 5, choices: [{ idSuffix: "c1", beliefKey: "resource_toxicity", position: 0 }, { idSuffix: "c2", beliefKey: "short_term_bias", position: 1 }, { idSuffix: "c3", beliefKey: "capacity_expansion", position: 2 }] },
  
  // AGENCY
  "agency_0": { intensity: 4, choices: [{ idSuffix: "c1", beliefKey: "imposter_syndrome", position: 0 }, { idSuffix: "c2", beliefKey: "autopilot_mode", position: 1 }, { idSuffix: "c3", beliefKey: "self_permission", position: 2 }] },
  "agency_1": { intensity: 5, choices: [{ idSuffix: "c1", beliefKey: "ambivalence_loop", position: 0 }, { idSuffix: "c2", beliefKey: "hero_martyr", position: 1 }, { idSuffix: "c3", beliefKey: "capacity_expansion", position: 2 }] },
  "agency_2": { intensity: 3, choices: [{ idSuffix: "c1", beliefKey: "golden_cage", position: 0 }, { idSuffix: "c2", beliefKey: "body_mind_conflict", position: 1 }, { idSuffix: "c3", beliefKey: "self_permission", position: 2 }] },
};

const DEFAULT_NODE_CONFIG: NodeConfig = {
    intensity: 3,
    choices: [
        { idSuffix: "c1", beliefKey: "self_permission", position: 0 },
        { idSuffix: "c2", beliefKey: "capacity_expansion", position: 1 },
        { idSuffix: "c3", beliefKey: "scarcity_mindset", position: 2 }
    ]
};

const buildRegistry = () => {
  const registry: Record<string, Record<string, Scene>> = {};
  DOMAIN_SETTINGS.forEach((domain) => {
    registry[domain.key] = {};
    for (let i = 0; i < domain.count; i++) {
      const absoluteId = (domain.startId + i).toString();
      const relativeKey = `${domain.key}_${i}`;
      const config = NODE_CONFIGS[relativeKey] || DEFAULT_NODE_CONFIG;
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
