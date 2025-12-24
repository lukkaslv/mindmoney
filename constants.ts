
import { Scene } from './types';

export const INITIAL_SCENES: Record<string, Scene> = {
  welcome: {
    id: 'welcome',
    titleKey: 'scenes.welcome.title',
    descKey: 'scenes.welcome.desc',
    choices: [
      { id: 'c1', textKey: 'scenes.welcome.c1', beliefKey: 'fear_of_punishment', nextSceneId: 'dinner' },
      { id: 'c2', textKey: 'scenes.welcome.c2', beliefKey: 'impulse_spend', nextSceneId: 'dinner' },
      { id: 'c3', textKey: 'scenes.welcome.c3', beliefKey: 'money_is_danger', nextSceneId: 'dinner' }
    ]
  },
  dinner: {
    id: 'dinner',
    titleKey: 'scenes.dinner.title',
    descKey: 'scenes.dinner.desc',
    choices: [
      { id: 'd1', textKey: 'scenes.dinner.c1', beliefKey: 'poverty_is_virtue', nextSceneId: 'debt' },
      { id: 'd2', textKey: 'scenes.dinner.c2', beliefKey: 'fear_of_conflict', nextSceneId: 'debt' },
      { id: 'd3', textKey: 'scenes.dinner.c3', beliefKey: 'money_is_tool', nextSceneId: 'debt' }
    ]
  },
  debt: {
    id: 'debt',
    titleKey: 'scenes.debt.title',
    descKey: 'scenes.debt.desc',
    choices: [
      { id: 'db1', textKey: 'scenes.debt.c1', beliefKey: 'fear_of_conflict', nextSceneId: 'promotion' },
      { id: 'db2', textKey: 'scenes.debt.c2', beliefKey: 'guilt_after_pleasure', nextSceneId: 'promotion' },
      { id: 'db3', textKey: 'scenes.debt.c3', beliefKey: 'self_permission', nextSceneId: 'promotion' }
    ]
  },
  promotion: {
    id: 'promotion',
    titleKey: 'scenes.promotion.title',
    descKey: 'scenes.promotion.desc',
    choices: [
      { id: 'p1', textKey: 'scenes.promotion.c1', beliefKey: 'imposter_syndrome', nextSceneId: 'error' },
      { id: 'p2', textKey: 'scenes.promotion.c2', beliefKey: 'hard_work_only', nextSceneId: 'error' },
      { id: 'p3', textKey: 'scenes.promotion.c3', beliefKey: 'capacity_expansion', nextSceneId: 'error' }
    ]
  },
  error: {
    id: 'error',
    titleKey: 'scenes.error.title',
    descKey: 'scenes.error.desc',
    choices: [
      { id: 'e1', textKey: 'scenes.error.c1', beliefKey: 'fear_of_punishment', nextSceneId: 'investment' },
      { id: 'e2', textKey: 'scenes.error.c2', beliefKey: 'impulse_spend', nextSceneId: 'investment' },
      { id: 'e3', textKey: 'scenes.error.c3', beliefKey: 'money_is_tool', nextSceneId: 'investment' }
    ]
  },
  investment: {
    id: 'investment',
    titleKey: 'scenes.investment.title',
    descKey: 'scenes.investment.desc',
    choices: [
      { id: 'i1', textKey: 'scenes.investment.c1', beliefKey: 'family_loyalty', nextSceneId: 'shopping' },
      { id: 'i2', textKey: 'scenes.investment.c2', beliefKey: 'impulse_spend', nextSceneId: 'shopping' },
      { id: 'i3', textKey: 'scenes.investment.c3', beliefKey: 'capacity_expansion', nextSceneId: 'shopping' }
    ]
  },
  shopping: {
    id: 'shopping',
    titleKey: 'scenes.shopping.title',
    descKey: 'scenes.shopping.desc',
    choices: [
      { id: 's1', textKey: 'scenes.shopping.c1', beliefKey: 'family_loyalty', nextSceneId: 'legacy' },
      { id: 's2', textKey: 'scenes.shopping.c2', beliefKey: 'guilt_after_pleasure', nextSceneId: 'legacy' },
      { id: 's3', textKey: 'scenes.shopping.c3', beliefKey: 'self_permission', nextSceneId: 'legacy' }
    ]
  },
  legacy: {
    id: 'legacy',
    titleKey: 'scenes.legacy.title',
    descKey: 'scenes.legacy.desc',
    choices: [
      { id: 'l1', textKey: 'scenes.legacy.c1', beliefKey: 'money_is_danger', nextSceneId: 'end' },
      { id: 'l2', textKey: 'scenes.legacy.c2', beliefKey: 'money_is_danger', nextSceneId: 'end' },
      { id: 'l3', textKey: 'scenes.legacy.c3', beliefKey: 'self_permission', nextSceneId: 'end' }
    ]
  }
};
