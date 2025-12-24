
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
  sceneId: string; 
  choiceKey: string; 
  beliefKey: string;
  userReflection?: string;
  bodySensation?: string;
}
