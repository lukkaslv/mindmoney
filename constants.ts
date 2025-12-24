
import { Scene } from './types';

export const MODULE_REGISTRY: Record<string, Record<string, Scene>> = {
  foundation: {
    origin: {
      id: 'origin',
      titleKey: 'scenes.foundation_origin.title',
      descKey: 'scenes.foundation_origin.desc',
      choices: [
        { id: 'f1', textKey: 'scenes.foundation_origin.c1', beliefKey: 'scarcity_mindset', nextSceneId: 'mistake' },
        { id: 'f2', textKey: 'scenes.foundation_origin.c2', beliefKey: 'hard_work_only', nextSceneId: 'mistake' },
        { id: 'f3', textKey: 'scenes.foundation_origin.c3', beliefKey: 'self_permission', nextSceneId: 'mistake' }
      ]
    },
    mistake: {
      id: 'mistake',
      titleKey: 'scenes.mistake.title',
      descKey: 'scenes.mistake.desc',
      choices: [
        { id: 'm1', textKey: 'scenes.mistake.c1', beliefKey: 'error_intolerance', nextSceneId: 'end' },
        { id: 'm2', textKey: 'scenes.mistake.c2', beliefKey: 'fear_of_punishment', nextSceneId: 'end' },
        { id: 'm3', textKey: 'scenes.mistake.c3', beliefKey: 'self_permission', nextSceneId: 'end' }
      ]
    }
  },
  money: {
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
        { id: 'd1', textKey: 'scenes.dinner.c1', beliefKey: 'poverty_is_virtue', nextSceneId: 'luxury' },
        { id: 'd2', textKey: 'scenes.dinner.c2', beliefKey: 'fear_of_conflict', nextSceneId: 'luxury' },
        { id: 'd3', textKey: 'scenes.dinner.c3', beliefKey: 'money_is_tool', nextSceneId: 'luxury' }
      ]
    },
    luxury: {
      id: 'luxury',
      titleKey: 'scenes.luxury.title',
      descKey: 'scenes.luxury.desc',
      choices: [
        { id: 'l1', textKey: 'scenes.luxury.c1', beliefKey: 'imposter_syndrome', nextSceneId: 'inheritance' },
        { id: 'l2', textKey: 'scenes.luxury.c2', beliefKey: 'fear_of_punishment', nextSceneId: 'inheritance' },
        { id: 'l3', textKey: 'scenes.luxury.c3', beliefKey: 'self_permission', nextSceneId: 'inheritance' }
      ]
    },
    inheritance: {
      id: 'inheritance',
      titleKey: 'scenes.inheritance.title',
      descKey: 'scenes.inheritance.desc',
      choices: [
        { id: 'in1', textKey: 'scenes.inheritance.c1', beliefKey: 'family_loyalty', nextSceneId: 'end' },
        { id: 'in2', textKey: 'scenes.inheritance.c2', beliefKey: 'poverty_is_virtue', nextSceneId: 'end' },
        { id: 'in3', textKey: 'scenes.inheritance.c3', beliefKey: 'money_is_tool', nextSceneId: 'end' }
      ]
    }
  },
  agency: {
    start: {
      id: 'start',
      titleKey: 'scenes.agency_start.title',
      descKey: 'scenes.agency_start.desc',
      choices: [
        { id: 'a1', textKey: 'scenes.agency_start.c1', beliefKey: 'fear_of_conflict', nextSceneId: 'agency_no' },
        { id: 'a2', textKey: 'scenes.agency_start.c2', beliefKey: 'self_permission', nextSceneId: 'agency_no' },
        { id: 'a3', textKey: 'scenes.agency_start.c3', beliefKey: 'imposter_syndrome', nextSceneId: 'agency_no' }
      ]
    },
    agency_no: {
      id: 'agency_no',
      titleKey: 'scenes.agency_no.title',
      descKey: 'scenes.agency_no.desc',
      choices: [
        { id: 'an1', textKey: 'scenes.agency_no.c1', beliefKey: 'boundary_collapse', nextSceneId: 'visibility' },
        { id: 'an2', textKey: 'scenes.agency_no.c2', beliefKey: 'self_permission', nextSceneId: 'visibility' },
        { id: 'an3', textKey: 'scenes.agency_no.c3', beliefKey: 'fear_of_conflict', nextSceneId: 'visibility' }
      ]
    },
    visibility: {
      id: 'visibility',
      titleKey: 'scenes.visibility.title',
      descKey: 'scenes.visibility.desc',
      choices: [
        { id: 'v1', textKey: 'scenes.visibility.c1', beliefKey: 'shame_of_success', nextSceneId: 'end' },
        { id: 'v2', textKey: 'scenes.visibility.c2', beliefKey: 'imposter_syndrome', nextSceneId: 'end' },
        { id: 'v3', textKey: 'scenes.visibility.c3', beliefKey: 'capacity_expansion', nextSceneId: 'end' }
      ]
    }
  },
  social: {
    conflict: {
      id: 'conflict',
      titleKey: 'scenes.social_conflict.title',
      descKey: 'scenes.social_conflict.desc',
      choices: [
        { id: 'sc1', textKey: 'scenes.social_conflict.c1', beliefKey: 'fear_of_power', nextSceneId: 'end' },
        { id: 'sc2', textKey: 'scenes.social_conflict.c2', beliefKey: 'self_permission', nextSceneId: 'end' },
        { id: 'sc3', textKey: 'scenes.social_conflict.c3', beliefKey: 'money_is_tool', nextSceneId: 'end' }
      ]
    }
  },
  legacy: {
    vision: {
      id: 'vision',
      titleKey: 'scenes.legacy_vision.title',
      descKey: 'scenes.legacy_vision.desc',
      choices: [
        { id: 'v1', textKey: 'scenes.legacy_vision.c1', beliefKey: 'short_term_bias', nextSceneId: 'end' },
        { id: 'v2', textKey: 'scenes.legacy_vision.c2', beliefKey: 'family_loyalty', nextSceneId: 'end' },
        { id: 'v3', textKey: 'scenes.legacy_vision.c3', beliefKey: 'capacity_expansion', nextSceneId: 'end' }
      ]
    }
  }
};
