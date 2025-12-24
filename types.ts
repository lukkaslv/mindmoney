
export interface Choice {
  id: string;
  text: string;
  feedback: string;
  nextSceneId?: string;
  beliefKey: string;
}

export interface Scene {
  id: string;
  title: string;
  description: string;
  choices: Choice[];
  image?: string;
}

export interface GameHistoryItem {
  sceneId: string; 
  choiceId: string; 
  beliefKey: string;
  userReflection?: string;
  bodySensation?: string; // Новое поле для телесного отклика
}

export interface GameState {
  currentSceneId: string;
  history: GameHistoryItem[];
  isFinished: boolean;
}
