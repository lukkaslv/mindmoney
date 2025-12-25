
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
  nextSceneId?: string;
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
}

export type PhaseType = 'SANITATION' | 'STABILIZATION' | 'EXPANSION';

export interface ProtocolStep {
  day: number;
  phase: PhaseType;
  taskKey: TaskKey;
  targetMetricKey: string;
  completed?: boolean;
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
  verdictKey: VerdictKey; 
  roadmap: ProtocolStep[];
  graphPoints: { x: number; y: number }[];
  status: 'OPTIMAL' | 'COMPENSATED' | 'UNSTABLE' | 'CRITICAL';
  bugs: BeliefKey[];
  deepAnalysis: {
    category: string;
    key: string;
    intensity: number;
  }[]; 
  interventionStrategy: string; 
  coreConflict: string; 
  shadowDirective: string;
  interferenceInsight?: string;
}

export interface VerdictDef {
  label: string;
  description: string;
  impact: string;
}

export interface Translations {
  subtitle: string;
  global: {
    stats: string; uptime: string; level: string; progress: string; achievements: string;
    export: string; import: string; copy: string; close: string;
    save_success: string; import_prompt: string;
    latency_warn: string;
    next_node: string;
    complete: string;
  };
  sync: {
    title: string; desc: string; s0: string; s1: string; s2: string; s3: string; s4: string;
    proceed: string; processing: string;
  };
  sensation_feedback: Record<string, string>; 
  domains: Record<DomainType, string>;
  dashboard: {
    title: string; 
    desc: string; 
    nodes_found: string; 
    sync_status: string; 
    locked: string; 
    select_domain: string;
    insight_noise: string;
    insight_coherence: string;
    insight_progress: string;
    insight_somatic_dissonance: string;
  };
  results: {
    integrity: string; entropy: string; capacity: string; roadmap: string;
    logTitle: string; back: string; stability: string; neuro_sync: string;
    conflict_warn: string; click_info: string;
    share_button: string; share_url: string; blueprint_title: string;
    shadow_zone: string; light_zone: string;
    verdict_title: string; 
    root_command: string;
    deep_analysis_title: string;
    intervention_title: string;
    conflict_title: string;
    shadow_directive_title: string;
    interference_title: string;
  };
  phases: Record<Lowercase<PhaseType>, string>;
  tasks: Record<TaskKey, { title: string; method: string; metric: string }>; 
  scenes: Record<string, { title: string; desc: string; c1: string; c2: string; c3: string }>;
  beliefs: Record<BeliefKey, string>; 
  explanations: Record<string, string>;
  archetypes: Record<ArchetypeKey, { title: string; desc: string; superpower: string; shadow: string; quote: string; root_command: string }>;
  verdicts: Record<VerdictKey, VerdictDef>; 
  metric_definitions: Record<string, string>;
  synthesis_categories: Record<string, string>;
  synthesis: Record<string, string>; 
  interventions: Record<string, string>;
  conflicts: Record<string, string>;
  directives: Record<string, string>;
  interferences: Record<string, string>;
  system_commentary: string[];
  auth_hint: string;
  legal_disclaimer: string;
}
