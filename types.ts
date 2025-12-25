
export type DomainType = 'foundation' | 'agency' | 'money' | 'social' | 'legacy';

export interface DomainRawConfig {
  key: DomainType;
  count: number;
  color: string;
}

export interface DomainConfig extends DomainRawConfig {
  startId: number;
}

export type BeliefKey = 
  | 'family_loyalty' | 'scarcity_mindset' | 'self_permission'
  | 'fear_of_punishment' | 'hard_work_only' | 'capacity_expansion'
  | 'boundary_collapse' | 'imposter_syndrome' | 'money_is_tool'
  | 'unconscious_fear' | 'fear_of_conflict' | 'money_is_danger'
  | 'impulse_spend' | 'shame_of_success' | 'betrayal_trauma'
  | 'short_term_bias' | 'poverty_is_virtue' | 'latency_resistance'
  | 'resource_toxicity' | 'body_mind_conflict'
  | 'ambivalence_loop' | 'hero_martyr' | 'autopilot_mode' | 'golden_cage';     

export type TaskKey = 
  | 'sanitation_1' | 'sanitation_2' | 'sanitation_3'
  | 'stabilization_1' | 'stabilization_2' | 'stabilization_3'
  | 'expansion_1' | 'expansion_2' | 'expansion_3'
  | 'bug_fix_family' | 'bug_fix_fear' | 'bug_fix_imposter' | 'bug_fix_boundary'
  | 'shadow_work_1' | 'shadow_work_2';

export type ArchetypeKey = 
  | 'THE_ARCHITECT' | 'THE_DRIFTER' | 'THE_BURNED_HERO'
  | 'THE_GOLDEN_PRISONER' | 'THE_CHAOS_SURFER' | 'THE_GUARDIAN';

export type VerdictKey = 
  | 'BRILLIANT_SABOTAGE' 
  | 'INVISIBILE_CEILING' 
  | 'LEAKY_BUCKET'      
  | 'PARALYZED_GIANT'   
  | 'FROZEN_POTENTIAL'  
  | 'HEALTHY_SCALE';     

export interface Choice {
  id: string;
  textKey: string;
  beliefKey: BeliefKey;
}

export interface ChoiceWithLatency extends Choice {
  latency: number;
}

export interface Scene {
  id: string;
  key: string;
  titleKey: string;
  descKey: string;
  choices: Choice[];
  intensity: number;
}

export interface GameHistoryItem {
  beliefKey: BeliefKey;
  sensation: string;
  latency: number;
  nodeId?: string; // Added to track correlations
}

export type PhaseType = 'SANITATION' | 'STABILIZATION' | 'EXPANSION';

export interface ProtocolStep {
  day: number;
  phase: PhaseType;
  taskKey: TaskKey;
  targetMetricKey: string;
  completed?: boolean;
}

export interface NeuralCorrelation {
  nodeId: string;
  domain: DomainType;
  type: 'resistance' | 'resonance';
  descriptionKey: string;
}

export interface AnalysisResult {
  state: { foundation: number; agency: number; resource: number; entropy: number };
  integrity: number;
  capacity: number;
  entropyScore: number;
  systemHealth: number;
  neuroSync: number;
  phase: PhaseType;
  archetypeKey: ArchetypeKey;
  secondaryArchetypeKey?: ArchetypeKey;
  archetypeMatch: number; 
  archetypeSpectrum: { key: ArchetypeKey; score: number }[]; // Full spectrum
  verdictKey: VerdictKey; 
  roadmap: ProtocolStep[];
  graphPoints: { x: number; y: number }[];
  status: 'OPTIMAL' | 'COMPENSATED' | 'UNSTABLE' | 'CRITICAL';
  bugs: BeliefKey[];
  correlations: NeuralCorrelation[]; // Tracked "Why"
  somaticProfile: {
    blocks: number;
    resources: number;
    dominantSensation: string;
  };
  interventionStrategy: string; 
  coreConflict: string; 
  shadowDirective: string;
  interferenceInsight?: string;
}

export interface Translations {
  subtitle: string;
  onboarding: {
    title: string;
    step1_t: string;
    step1_d: string;
    step2_t: string;
    step2_d: string;
    step3_t: string;
    step3_d: string;
    protocol_btn: string;
    protocol_init: string;
    protocol_ready: string;
    start_btn: string;
  };
  admin: Record<string, string>;
  global: Record<string, string>;
  sync: Record<string, string>;
  sensation_feedback: Record<string, string>; 
  domains: Record<DomainType, string>;
  dashboard: Record<string, string>;
  results: Record<string, string>;
  phases: Record<Lowercase<PhaseType>, string>;
  tasks: Record<TaskKey, { title: string; method: string; metric: string }>; 
  scenes: Record<string, { title: string; desc: string; c1: string; c2: string; c3: string }>;
  beliefs: Record<BeliefKey, string>; 
  explanations: Record<string, string>;
  archetypes: Record<ArchetypeKey, { title: string; desc: string; superpower: string; shadow: string; quote: string; root_command: string }>;
  verdicts: Record<VerdictKey, { label: string; description: string; impact: string }>; 
  metric_definitions: Record<string, string>;
  synthesis_categories: Record<string, string>;
  synthesis: Record<string, string>; 
  interventions: Record<string, string>;
  conflicts: Record<string, string>;
  directives: Record<string, string>;
  interferences: Record<string, string>;
  correlation_types: Record<string, string>;
  system_commentary: string[];
  auth_hint: string;
  legal_disclaimer: string;
}
