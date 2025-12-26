

export type DomainType = 'foundation' | 'agency' | 'money' | 'social' | 'legacy';

export type ArchetypeKey = 
  | 'THE_ARCHITECT' 
  | 'THE_DRIFTER' 
  | 'THE_BURNED_HERO' 
  | 'THE_GOLDEN_PRISONER' 
  | 'THE_CHAOS_SURFER' 
  | 'THE_GUARDIAN';

export type BeliefKey = 
  | 'family_loyalty' | 'scarcity_mindset' | 'fear_of_punishment' | 'imposter_syndrome' | 'poverty_is_virtue'
  | 'hard_work_only' | 'self_permission' | 'fear_of_conflict' | 'betrayal_trauma' | 'unconscious_fear'
  | 'money_is_danger' | 'impulse_spend' | 'resource_toxicity' | 'short_term_bias' | 'capacity_expansion'
  | 'boundary_collapse' | 'shame_of_success' | 'hero_martyr' | 'latency_resistance' | 'body_mind_conflict'
  | 'ambivalence_loop' | 'autopilot_mode' | 'golden_cage' | 'money_is_tool' | 'default';

export type PhaseType = 'SANITATION' | 'STABILIZATION' | 'EXPANSION';

export type TaskKey = string;

export type VerdictKey = 
  | 'HEALTHY_SCALE' 
  | 'BRILLIANT_SABOTAGE' 
  | 'INVISIBILE_CEILING' 
  | 'LEAKY_BUCKET' 
  | 'PARALYZED_GIANT' 
  | 'FROZEN_POTENTIAL' 
  | 'CRITICAL_DEFICIT';

export class DataCorruptionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DataCorruptionError';
  }
}

export interface Choice {
  id: string;
  textKey: string;
  beliefKey: BeliefKey;
  position: number; // 0, 1, or 2
}

export interface ChoiceWithLatency extends Choice {
  latency: number;
}

export interface Scene {
  id: string;
  key: string;
  titleKey: string;
  descKey: string;
  intensity: number;
  choices: Choice[];
}

export interface DomainRawConfig {
  key: DomainType;
  count: number;
  color: string;
}

export interface DomainConfig extends DomainRawConfig {
  startId: number;
}

export interface GameHistoryItem {
  beliefKey: string;
  sensation: string;
  latency: number;
  nodeId: string;
  domain: DomainType;
  choicePosition: number; // 0, 1, or 2
}

export interface NeuralCorrelation {
  nodeId: string;
  domain: DomainType;
  type: 'resistance' | 'resonance';
  descriptionKey: string;
}

export interface SystemConflict {
  key: string;
  severity: 'high' | 'medium' | 'low';
  domain: DomainType;
}

export type MetricLevel = 'OPTIMAL' | 'STABLE' | 'STRAINED' | 'PROTECTIVE' | 'UNSTABLE';

export interface ClinicalWarning {
  type: string;
  severity: 'HIGH' | 'LOW';
  messageKey: string;
}

export interface AnalysisFlags {
  isAlexithymiaDetected: boolean;
  isSlowProcessingDetected: boolean;
  isNeuroSyncReliable: boolean;
  isSocialDesirabilityBiasDetected: boolean;
  processingSpeedCompensation: number;
  entropyType: 'NEUTRAL' | 'CREATIVE' | 'STRUCTURAL';
}

export interface PatternFlags {
    isMonotonic: boolean;
    isHighSkipRate: boolean;
    isFlatline: boolean;
    isRoboticTiming: boolean;
    isSomaticMonotony: boolean;
    dominantPosition: number | null;
}

export interface IntegrityBreakdown {
  coherence: number;
  sync: number;
  stability: number;
  label: string;
  description: string;
  status: MetricLevel;
}

export interface ProtocolStep {
  day: number;
  phase: PhaseType;
  taskKey: TaskKey;
  targetMetricKey: string;
}

// Raw result from psychologyService before interpretation
export interface RawAnalysisResult {
  state: { foundation: number; agency: number; resource: number; entropy: number };
  integrity: number;
  capacity: number;
  entropyScore: number;
  neuroSync: number;
  systemHealth: number;
  phase: PhaseType;
  status: MetricLevel;
  validity: 'VALID' | 'SUSPICIOUS' | 'INVALID';
  activePatterns: BeliefKey[];
  correlations: NeuralCorrelation[];
  conflicts: SystemConflict[];
  somaticDissonance: BeliefKey[];
  somaticProfile: { blocks: number; resources: number; dominantSensation: string };
  integrityBreakdown: IntegrityBreakdown;
  clarity: number;
  confidenceScore: number;
  warnings: ClinicalWarning[];
  flags?: AnalysisFlags;
  skippedCount: number;
}


export interface AnalysisResult extends RawAnalysisResult {
  timestamp: number;
  createdAt: number;
  shareCode: string;
  archetypeKey: ArchetypeKey;
  secondaryArchetypeKey?: ArchetypeKey;
  archetypeMatch: number;
  archetypeSpectrum: { key: ArchetypeKey; score: number }[];
  verdictKey: VerdictKey;
  lifeScriptKey: string;
  roadmap: ProtocolStep[];
  graphPoints: { x: number; y: number }[];
  interventionStrategy: string;
  coreConflict: string;
  shadowDirective: string;
  interferenceInsight?: string;
  patternFlags: PatternFlags;
}

export interface ScanHistory {
  scans: AnalysisResult[];
  latestScan: AnalysisResult | null;
  evolutionMetrics: {
    entropyTrend: number[];
    integrityTrend: number[];
    dates: string[];
  };
}

export interface Contradiction {
  type: string;
  nodeId: string;
  beliefKey: string;
  severity: number;
  description: string;
}

export interface AdaptiveState {
  clarity: number;
  contradictions: Contradiction[];
  isComplete: boolean;
  suggestedNextNodeId: string | null;
  confidenceScore: number;
}

export interface CompatibilityReport {
  overallScore: number;
  domainSynergies: DomainType[];
  domainConflicts: DomainType[];
  recommendations: string[];
  relationshipType: string;
  partnerArchetype: string;
}

export interface SessionStep {
  phase: string;
  title: string;
  action: string;
}

export interface TherapyHypothesis {
  id: string;
  hypothesis: string;
  basedOn: string;
  focusForSession: string;
}

export interface ClinicalInterpretation {
  systemConfiguration: { title: string; description: string; limitingFactor: string };
  deepMechanism: { title: string; analysis: string[] };
  metricInteractions: { farDescription: string; syncDescription: string };
  archetypeClinical: { strategy: string; functionality: string; limit: string };
  beliefImpact: string;
  hypotheses: TherapyHypothesis[];
  risks: string[];
  sessionEntry: string;
}

export interface ClinicalNarrative {
  level1: {
    title: string;
    statusTag: string;
    summary: string;
    focusQuestion: string;
    tone: 'alert' | 'supportive' | 'neutral';
    recommendation: string;
  };
  level2: {
    introduction: string;
    generalConfig: string;
    deepAnalysis: string;
    archetypeAnalysis: string;
    clinicalHypotheses: string;
    activePatterns: string;
    verdictAndRecommendations: string;
    resistanceProfile: string;
    behavioralMarkers: string;
    systemicRoot: string;
    therapeuticAlliance: string;
    shadowContract: string;
    sessionFlow: SessionStep[];
    clinicalProfile: string;
    mechanismAnalysis: string[];
    somaticMarkers: string;
    riskAssessment: string[];
    therapeuticEntry: string;
  };
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
  invalid_results: {
      title: string;
      subtitle: string;
      message: string;
      reason_monotonic: string;
      reason_skip: string;
      reason_flatline: string;
      reason_robotic: string;
      reason_somatic: string;
      recommendation: string;
      reset_button: string;
  };
  guide: {
    title: string;
    subtitle: string;
    sections: {
      title: string;
      content: string[];
    }[];
    metaphor: string;
  };
  pro_guide: {
    title: string;
    subtitle: string;
    sections: {
      title: string;
      content: string[];
    }[];
    closing: string;
  };
  brief_explainer: {
    title: string;
    subtitle: string;
    intro_title: string;
    intro_text: string;
    blocks_title: string;
    archetype_label: string;
    archetype_desc: string;
    metrics_title: string;
    foundation_desc: string;
    agency_desc: string;
    resource_desc: string;
    entropy_desc: string;
    neurosync_label: string;
    neurosync_desc: string;
    latency_label: string;
    latency_desc: string;
    combinations_title: string;
    combinations_text: string;
    action_title: string;
    action_text: string;
    limits_title: string;
    limits_text: string;
    closing: string;
  };
  clinical_decoder: {
    title: string;
    subtitle: string;
    headers: {
        config: string;
        mechanism: string;
        interactions: string;
        archetype: string;
        hypotheses: string;
        risks: string;
        session: string;
    };
    configs: Record<string, { title: string; desc: string }>;
    analysis_patterns: Record<string, string>; 
    sync_patterns: Record<string, string>;
    archetype_strategies: Record<ArchetypeKey, { strategy: string; func: string; limit: string }>;
    risks: Record<string, string>;
    session_entries: Record<string, string>;
    common_hypotheses: Record<string, { h: string; q: string }>;
    disclaimer: string;
    somatic_dissonance_title: string;
    somatic_dissonance_desc: string;
  };
  admin: Record<string, string>;
  global: Record<string, string>;
  sync: Record<string, string>;
  sensation_feedback: Record<string, string>; 
  domains: Record<DomainType, string>;
  dashboard: Record<string, string>;
  results: Record<string, string> & {
    active_patterns_title: string;
    tap_to_decode: string;
    protection_label: string;
    cost_label: string;
    antidote_label: string;
    close_btn: string;
  };
  phases: Record<Lowercase<PhaseType>, string>;
  tasks: Record<TaskKey, { title: string; method: string; metric: string }>; 
  scenes: Record<string, { title: string; desc: string; c1: string; c2: string; c3: string }>;
  beliefs: Record<BeliefKey, string>; 
  explanations: Record<string, string>;
  pattern_library: Record<string, { protection: string; cost: string; antidote: string }>;
  archetypes: Record<ArchetypeKey, { title: string; desc: string; superpower: string; shadow: string; quote: string; root_command: string }>;
  verdicts: Record<VerdictKey, { label: string; description: string; impact: string; supportive_context: string }>; 
  metric_definitions: Record<string, string>;
  synthesis_categories: Record<string, string>;
  synthesis: Record<string, string>; 
  interventions: Record<string, string>;
  conflicts: Record<string, string>;
  directives: Record<string, string>;
  interferences: Record<string, string>;
  correlation_types: Record<string, string>;
  integrity_audit: Record<string, string>;
  system_commentary: string[];
  auth_hint: string;
  legal_disclaimer: string;
  safety: {
    mode_title: string;
    mode_desc: string;
    external_help: string;
    somatic_detection_warning: string;
    slow_processing_detected: string;
    important_context_title: string;
    important_context_body: string;
  };
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
        ready: () => void;
        expand: () => void;
        HapticFeedback?: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
        openLink: (url: string) => void;
      };
    };
  }
}