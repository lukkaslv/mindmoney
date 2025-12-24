
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
  image?: string;
}

export interface GameHistoryItem {
  beliefKey: string;
  sensation: string;
}

export interface Node {
  id: number;
  domain: 'foundation' | 'agency' | 'money' | 'social' | 'legacy';
  active: boolean;
  done: boolean;
  linkedTo?: number[];
}
