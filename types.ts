
export interface Choice {
  id: string;
  textKey: string;
  nextSceneId?: string;
  beliefKey: string;
}

export interface Scene {
  id: string;
  titleKey: string;
  descKey: string;
  choices: Choice[];
  intensity: number; // 1-5: глубина влияния на систему
}

export interface GameHistoryItem {
  beliefKey: string;
  sensation: string;
  latency: number; // Время раздумий в мс
}

export interface Snapshot {
  timestamp: number;
  completedNodes: number[];
  globalProgress: number;
  lastState: any;
}

export interface Node {
  id: number;
  domain: 'foundation' | 'agency' | 'money' | 'social' | 'legacy';
  active: boolean;
  done: boolean;
  intensity: number;
}
