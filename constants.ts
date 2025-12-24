
import { Scene } from './types';

// Карта узлов: каждый узел в App.tsx будет ссылаться на соответствующий индекс в массиве сцен домена
export const MODULE_REGISTRY: Record<string, Record<string, Scene>> = {
  foundation: {
    // Node 0
    "0": {
      id: '0', titleKey: 'scenes.foundation_origin.title', descKey: 'scenes.foundation_origin.desc',
      choices: [
        { id: 'f0_1', textKey: 'scenes.foundation_origin.c1', beliefKey: 'scarcity_mindset', nextSceneId: 'end' },
        { id: 'f0_2', textKey: 'scenes.foundation_origin.c2', beliefKey: 'hard_work_only', nextSceneId: 'end' },
        { id: 'f0_3', textKey: 'scenes.foundation_origin.c3', beliefKey: 'self_permission', nextSceneId: 'end' }
      ],
      intensity: 3 // Added intensity for psychometric depth
    },
    // Node 1
    "1": {
      id: '1', titleKey: 'scenes.mistake.title', descKey: 'scenes.mistake.desc',
      choices: [
        { id: 'f1_1', textKey: 'scenes.mistake.c1', beliefKey: 'error_intolerance', nextSceneId: 'end' },
        { id: 'f1_2', textKey: 'scenes.mistake.c2', beliefKey: 'fear_of_punishment', nextSceneId: 'end' },
        { id: 'f1_3', textKey: 'scenes.mistake.c3', beliefKey: 'self_permission', nextSceneId: 'end' }
      ],
      intensity: 3
    },
    // Node 2
    "2": {
      id: '2', titleKey: 'scenes.foundation_taboo.title', descKey: 'scenes.foundation_taboo.desc',
      choices: [
        { id: 'f2_1', textKey: 'scenes.foundation_taboo.c1', beliefKey: 'family_loyalty', nextSceneId: 'end' },
        { id: 'f2_2', textKey: 'scenes.foundation_taboo.c2', beliefKey: 'family_taboo', nextSceneId: 'end' },
        { id: 'f2_3', textKey: 'scenes.foundation_taboo.c3', beliefKey: 'self_permission', nextSceneId: 'end' }
      ],
      intensity: 3
    },
    // Node 3-9 (Fillers for coverage)
    "3": { id: '3', titleKey: 'scenes.node_safety.title', descKey: 'scenes.node_safety.desc', intensity: 3, choices: [{ id: 'f3_1', textKey: 'scenes.node_safety.c1', beliefKey: 'fear_of_punishment', nextSceneId: 'end' }, { id: 'f3_2', textKey: 'scenes.node_safety.c2', beliefKey: 'self_permission', nextSceneId: 'end' }, { id: 'f3_3', textKey: 'scenes.node_safety.c3', beliefKey: 'imposter_syndrome', nextSceneId: 'end' }] },
    "4": { id: '4', titleKey: 'scenes.node_body.title', descKey: 'scenes.node_body.desc', intensity: 3, choices: [{ id: 'f4_1', textKey: 'scenes.node_body.c1', beliefKey: 'hard_work_only', nextSceneId: 'end' }, { id: 'f4_2', textKey: 'scenes.node_body.c2', beliefKey: 'self_permission', nextSceneId: 'end' }, { id: 'f4_3', textKey: 'scenes.node_body.c3', beliefKey: 'short_term_bias', nextSceneId: 'end' }] },
    "5": { id: '5', titleKey: 'scenes.foundation_origin.title', descKey: 'scenes.foundation_origin.desc', intensity: 3, choices: [{ id: 'f5_1', textKey: 'scenes.foundation_origin.c1', beliefKey: 'scarcity_mindset', nextSceneId: 'end' }, { id: 'f5_2', textKey: 'scenes.foundation_origin.c2', beliefKey: 'family_loyalty', nextSceneId: 'end' }, { id: 'f5_3', textKey: 'scenes.foundation_origin.c3', beliefKey: 'self_permission', nextSceneId: 'end' }] },
    "6": { id: '6', titleKey: 'scenes.node_secret.title', descKey: 'scenes.node_secret.desc', intensity: 3, choices: [{ id: 'f6_1', textKey: 'scenes.node_secret.c1', beliefKey: 'shame_of_success', nextSceneId: 'end' }, { id: 'f6_2', textKey: 'scenes.node_secret.c2', beliefKey: 'fear_of_punishment', nextSceneId: 'end' }, { id: 'f6_3', textKey: 'scenes.node_secret.c3', beliefKey: 'self_permission', nextSceneId: 'end' }] },
    "7": { id: '7', titleKey: 'scenes.mistake.title', descKey: 'scenes.mistake.desc', intensity: 3, choices: [{ id: 'f7_1', textKey: 'scenes.mistake.c1', beliefKey: 'error_intolerance', nextSceneId: 'end' }, { id: 'f7_2', textKey: 'scenes.mistake.c2', beliefKey: 'money_is_danger', nextSceneId: 'end' }, { id: 'f7_3', textKey: 'scenes.mistake.c3', beliefKey: 'self_permission', nextSceneId: 'end' }] },
    "8": { id: '8', titleKey: 'scenes.foundation_taboo.title', descKey: 'scenes.foundation_taboo.desc', intensity: 3, choices: [{ id: 'f8_1', textKey: 'scenes.foundation_taboo.c1', beliefKey: 'family_taboo', nextSceneId: 'end' }, { id: 'f8_2', textKey: 'scenes.foundation_taboo.c2', beliefKey: 'family_loyalty', nextSceneId: 'end' }, { id: 'f8_3', textKey: 'scenes.foundation_taboo.c3', beliefKey: 'self_permission', nextSceneId: 'end' }] },
    "9": { id: '9', titleKey: 'scenes.node_safety.title', descKey: 'scenes.node_safety.desc', intensity: 3, choices: [{ id: 'f9_1', textKey: 'scenes.node_safety.c1', beliefKey: 'scarcity_mindset', nextSceneId: 'end' }, { id: 'f9_2', textKey: 'scenes.node_safety.c2', beliefKey: 'unconscious_fear', nextSceneId: 'end' }, { id: 'f9_3', textKey: 'scenes.node_safety.c3', beliefKey: 'self_permission', nextSceneId: 'end' }] }
  },
  agency: {
    "10": {
      id: '10', titleKey: 'scenes.agency_start.title', descKey: 'scenes.agency_start.desc',
      choices: [
        { id: 'a10_1', textKey: 'scenes.agency_start.c1', beliefKey: 'fear_of_conflict', nextSceneId: 'end' },
        { id: 'a10_2', textKey: 'scenes.agency_start.c2', beliefKey: 'self_permission', nextSceneId: 'end' },
        { id: 'a10_3', textKey: 'scenes.agency_start.c3', beliefKey: 'imposter_syndrome', nextSceneId: 'end' }
      ],
      intensity: 3
    },
    "11": { id: '11', titleKey: 'scenes.agency_no.title', descKey: 'scenes.agency_no.desc', intensity: 3, choices: [{ id: 'a11_1', textKey: 'scenes.agency_no.c1', beliefKey: 'boundary_collapse', nextSceneId: 'end' }, { id: 'a11_2', textKey: 'scenes.agency_no.c2', beliefKey: 'self_permission', nextSceneId: 'end' }, { id: 'a11_3', textKey: 'scenes.agency_no.c3', beliefKey: 'fear_of_conflict', nextSceneId: 'end' }] },
    "12": { id: '12', titleKey: 'scenes.visibility.title', descKey: 'scenes.visibility.desc', intensity: 3, choices: [{ id: 'a12_1', textKey: 'scenes.visibility.c1', beliefKey: 'shame_of_success', nextSceneId: 'end' }, { id: 'a12_2', textKey: 'scenes.visibility.c2', beliefKey: 'imposter_syndrome', nextSceneId: 'end' }, { id: 'a12_3', textKey: 'scenes.visibility.c3', beliefKey: 'capacity_expansion', nextSceneId: 'end' }] },
    "13": { id: '13', titleKey: 'scenes.agency_gift.title', descKey: 'scenes.agency_gift.desc', intensity: 3, choices: [{ id: 'a13_1', textKey: 'scenes.agency_gift.c1', beliefKey: 'debt_trap', nextSceneId: 'end' }, { id: 'a13_2', textKey: 'scenes.agency_gift.c2', beliefKey: 'unconscious_fear', nextSceneId: 'end' }, { id: 'a13_3', textKey: 'scenes.agency_gift.c3', beliefKey: 'self_permission', nextSceneId: 'end' }] },
    "14": { id: '14', titleKey: 'scenes.node_risk.title', descKey: 'scenes.node_risk.desc', intensity: 3, choices: [{ id: 'a14_1', textKey: 'scenes.node_risk.c1', beliefKey: 'short_term_bias', nextSceneId: 'end' }, { id: 'a14_2', textKey: 'scenes.node_risk.c2', beliefKey: 'capacity_expansion', nextSceneId: 'end' }, { id: 'a14_3', textKey: 'scenes.node_risk.c3', beliefKey: 'money_is_tool', nextSceneId: 'end' }] },
    "15": { id: '15', titleKey: 'scenes.shame_success.title', descKey: 'scenes.shame_success.desc', intensity: 3, choices: [{ id: 'a15_1', textKey: 'scenes.shame_success.c1', beliefKey: 'poverty_is_virtue', nextSceneId: 'end' }, { id: 'a15_2', textKey: 'scenes.shame_success.c2', beliefKey: 'fear_of_punishment', nextSceneId: 'end' }, { id: 'a15_3', textKey: 'scenes.shame_success.c3', beliefKey: 'self_permission', nextSceneId: 'end' }] },
    "16": { id: '16', titleKey: 'scenes.agency_start.title', descKey: 'scenes.agency_start.desc', intensity: 3, choices: [{ id: 'a16_1', textKey: 'scenes.agency_start.c1', beliefKey: 'fear_of_power', nextSceneId: 'end' }, { id: 'a16_2', textKey: 'scenes.agency_start.c2', beliefKey: 'self_permission', nextSceneId: 'end' }, { id: 'a16_3', textKey: 'scenes.agency_start.c3', beliefKey: 'imposter_syndrome', nextSceneId: 'end' }] },
    "17": { id: '17', titleKey: 'scenes.agency_no.title', descKey: 'scenes.agency_no.desc', intensity: 3, choices: [{ id: 'a17_1', textKey: 'scenes.agency_no.c1', beliefKey: 'boundary_collapse', nextSceneId: 'end' }, { id: 'a17_2', textKey: 'scenes.agency_no.c2', beliefKey: 'self_permission', nextSceneId: 'end' }, { id: 'a17_3', textKey: 'scenes.agency_no.c3', beliefKey: 'family_loyalty', nextSceneId: 'end' }] },
    "18": { id: '18', titleKey: 'scenes.node_body.title', descKey: 'scenes.node_body.desc', intensity: 3, choices: [{ id: 'a18_1', textKey: 'scenes.node_body.c1', beliefKey: 'hard_work_only', nextSceneId: 'end' }, { id: 'a18_2', textKey: 'scenes.node_body.c2', beliefKey: 'self_permission', nextSceneId: 'end' }, { id: 'a18_3', textKey: 'scenes.node_body.c3', beliefKey: 'body_mind_conflict', nextSceneId: 'end' }] },
    "19": { id: '19', titleKey: 'scenes.node_power.title', descKey: 'scenes.node_power.desc', intensity: 3, choices: [{ id: 'a19_1', textKey: 'scenes.node_power.c1', beliefKey: 'fear_of_power', nextSceneId: 'end' }, { id: 'a19_2', textKey: 'scenes.node_power.c2', beliefKey: 'self_permission', nextSceneId: 'end' }, { id: 'a19_3', textKey: 'scenes.node_power.c3', beliefKey: 'power_corruption', nextSceneId: 'end' }] }
  },
  money: {
    "20": {
      id: '20', titleKey: 'scenes.welcome.title', descKey: 'scenes.welcome.desc',
      choices: [
        { id: 'm20_1', textKey: 'scenes.welcome.c1', beliefKey: 'fear_of_punishment', nextSceneId: 'end' },
        { id: 'm20_2', textKey: 'scenes.welcome.c2', beliefKey: 'impulse_spend', nextSceneId: 'end' },
        { id: 'm20_3', textKey: 'scenes.welcome.c3', beliefKey: 'money_is_danger', nextSceneId: 'end' }
      ],
      intensity: 3
    },
    "21": { id: '21', titleKey: 'scenes.dinner.title', descKey: 'scenes.dinner.desc', intensity: 3, choices: [{ id: 'm21_1', textKey: 'scenes.dinner.c1', beliefKey: 'poverty_is_virtue', nextSceneId: 'end' }, { id: 'm21_2', textKey: 'scenes.dinner.c2', beliefKey: 'fear_of_conflict', nextSceneId: 'end' }, { id: 'm21_3', textKey: 'scenes.dinner.c3', beliefKey: 'money_is_tool', nextSceneId: 'end' }] },
    "22": { id: '22', titleKey: 'scenes.luxury.title', descKey: 'scenes.luxury.desc', intensity: 3, choices: [{ id: 'm22_1', textKey: 'scenes.luxury.c1', beliefKey: 'imposter_syndrome', nextSceneId: 'end' }, { id: 'm22_2', textKey: 'scenes.luxury.c2', beliefKey: 'fear_of_punishment', nextSceneId: 'end' }, { id: 'm22_3', textKey: 'scenes.luxury.c3', beliefKey: 'self_permission', nextSceneId: 'end' }] },
    "23": { id: '23', titleKey: 'scenes.inheritance.title', descKey: 'scenes.inheritance.desc', intensity: 3, choices: [{ id: 'm23_1', textKey: 'scenes.inheritance.c1', beliefKey: 'family_loyalty', nextSceneId: 'end' }, { id: 'm23_2', textKey: 'scenes.inheritance.c2', beliefKey: 'poverty_is_virtue', nextSceneId: 'end' }, { id: 'm23_3', textKey: 'scenes.inheritance.c3', beliefKey: 'money_is_tool', nextSceneId: 'end' }] },
    "24": { id: '24', titleKey: 'scenes.node_risk.title', descKey: 'scenes.node_risk.desc', intensity: 3, choices: [{ id: 'm24_1', textKey: 'scenes.node_risk.c1', beliefKey: 'short_term_bias', nextSceneId: 'end' }, { id: 'm24_2', textKey: 'scenes.node_risk.c2', beliefKey: 'capacity_expansion', nextSceneId: 'end' }, { id: 'm24_3', textKey: 'scenes.node_risk.c3', beliefKey: 'money_is_tool', nextSceneId: 'end' }] },
    "25": { id: '25', titleKey: 'scenes.welcome.title', descKey: 'scenes.welcome.desc', intensity: 3, choices: [{ id: 'm25_1', textKey: 'scenes.welcome.c1', beliefKey: 'impulse_spend', nextSceneId: 'end' }, { id: 'm25_2', textKey: 'scenes.welcome.c2', beliefKey: 'money_is_danger', nextSceneId: 'end' }, { id: 'm25_3', textKey: 'scenes.welcome.c3', beliefKey: 'self_permission', nextSceneId: 'end' }] },
    "26": { id: '26', titleKey: 'scenes.dinner.title', descKey: 'scenes.dinner.desc', intensity: 3, choices: [{ id: 'm26_1', textKey: 'scenes.dinner.c1', beliefKey: 'poverty_is_virtue', nextSceneId: 'end' }, { id: 'm26_2', textKey: 'scenes.dinner.c2', beliefKey: 'scarcity_mindset', nextSceneId: 'end' }, { id: 'm26_3', textKey: 'scenes.dinner.c3', beliefKey: 'money_is_tool', nextSceneId: 'end' }] },
    "27": { id: '27', titleKey: 'scenes.luxury.title', descKey: 'scenes.luxury.desc', intensity: 3, choices: [{ id: 'm27_1', textKey: 'scenes.luxury.c1', beliefKey: 'imposter_syndrome', nextSceneId: 'end' }, { id: 'm27_2', textKey: 'scenes.luxury.c2', beliefKey: 'shame_of_success', nextSceneId: 'end' }, { id: 'm27_3', textKey: 'scenes.luxury.c3', beliefKey: 'self_permission', nextSceneId: 'end' }] },
    "28": { id: '28', titleKey: 'scenes.inheritance.title', descKey: 'scenes.inheritance.desc', intensity: 3, choices: [{ id: 'm28_1', textKey: 'scenes.inheritance.c1', beliefKey: 'ancestral_debt', nextSceneId: 'end' }, { id: 'm28_2', textKey: 'scenes.inheritance.c2', beliefKey: 'family_loyalty', nextSceneId: 'end' }, { id: 'm28_3', textKey: 'scenes.inheritance.c3', beliefKey: 'money_is_tool', nextSceneId: 'end' }] },
    "29": { id: '29', titleKey: 'scenes.node_risk.title', descKey: 'scenes.node_risk.desc', intensity: 3, choices: [{ id: 'm29_1', textKey: 'scenes.node_risk.c1', beliefKey: 'short_term_bias', nextSceneId: 'end' }, { id: 'm29_2', textKey: 'scenes.node_risk.c2', beliefKey: 'money_is_danger', nextSceneId: 'end' }, { id: 'm29_3', textKey: 'scenes.node_risk.c3', beliefKey: 'capacity_expansion', nextSceneId: 'end' }] }
  },
  social: {
    "30": {
      id: '30', titleKey: 'scenes.social_conflict.title', descKey: 'scenes.social_conflict.desc',
      choices: [
        { id: 's30_1', textKey: 'scenes.social_conflict.c1', beliefKey: 'fear_of_power', nextSceneId: 'end' },
        { id: 's30_2', textKey: 'scenes.social_conflict.c2', beliefKey: 'self_permission', nextSceneId: 'end' },
        { id: 's30_3', textKey: 'scenes.social_conflict.c3', beliefKey: 'money_is_tool', nextSceneId: 'end' }
      ],
      intensity: 3
    },
    "31": { id: '31', titleKey: 'scenes.social_betrayal.title', descKey: 'scenes.social_betrayal.desc', intensity: 3, choices: [{ id: 's31_1', textKey: 'scenes.social_betrayal.c1', beliefKey: 'short_term_bias', nextSceneId: 'end' }, { id: 's31_2', textKey: 'scenes.social_betrayal.c2', beliefKey: 'fear_of_conflict', nextSceneId: 'end' }, { id: 's31_3', textKey: 'scenes.social_betrayal.c3', beliefKey: 'betrayal_trauma', nextSceneId: 'end' }] },
    "32": { id: '32', titleKey: 'scenes.node_envy.title', descKey: 'scenes.node_envy.desc', intensity: 3, choices: [{ id: 's32_1', textKey: 'scenes.node_envy.c1', beliefKey: 'envy_block', nextSceneId: 'end' }, { id: 's32_2', textKey: 'scenes.node_envy.c2', beliefKey: 'scarcity_mindset', nextSceneId: 'end' }, { id: 's32_3', textKey: 'scenes.node_envy.c3', beliefKey: 'self_permission', nextSceneId: 'end' }] },
    "33": { id: '33', titleKey: 'scenes.visibility.title', descKey: 'scenes.visibility.desc', intensity: 3, choices: [{ id: 's33_1', textKey: 'scenes.visibility.c1', beliefKey: 'imposter_syndrome', nextSceneId: 'end' }, { id: 's33_2', textKey: 'scenes.visibility.c2', beliefKey: 'shame_of_success', nextSceneId: 'end' }, { id: 's33_3', textKey: 'scenes.visibility.c3', beliefKey: 'capacity_expansion', nextSceneId: 'end' }] },
    "34": { id: '34', titleKey: 'scenes.social_conflict.title', descKey: 'scenes.social_conflict.desc', intensity: 3, choices: [{ id: 's34_1', textKey: 'scenes.social_conflict.c1', beliefKey: 'fear_of_power', nextSceneId: 'end' }, { id: 's34_2', textKey: 'scenes.social_conflict.c2', beliefKey: 'self_permission', nextSceneId: 'end' }, { id: 's34_3', textKey: 'scenes.social_conflict.c3', beliefKey: 'money_is_tool', nextSceneId: 'end' }] },
    "35": { id: '35', titleKey: 'scenes.social_betrayal.title', descKey: 'scenes.social_betrayal.desc', intensity: 3, choices: [{ id: 's35_1', textKey: 'scenes.social_betrayal.c1', beliefKey: 'betrayal_trauma', nextSceneId: 'end' }, { id: 's35_2', textKey: 'scenes.social_betrayal.c2', beliefKey: 'short_term_bias', nextSceneId: 'end' }, { id: 's35_3', textKey: 'scenes.social_betrayal.c3', beliefKey: 'money_is_tool', nextSceneId: 'end' }] },
    "36": { id: '36', titleKey: 'scenes.node_envy.title', descKey: 'scenes.node_envy.desc', intensity: 3, choices: [{ id: 's36_1', textKey: 'scenes.node_envy.c1', beliefKey: 'envy_block', nextSceneId: 'end' }, { id: 's36_2', textKey: 'scenes.node_envy.c2', beliefKey: 'fear_of_conflict', nextSceneId: 'end' }, { id: 's36_3', textKey: 'scenes.node_envy.c3', beliefKey: 'self_permission', nextSceneId: 'end' }] },
    "37": { id: '37', titleKey: 'scenes.visibility.title', descKey: 'scenes.visibility.desc', intensity: 3, choices: [{ id: 's37_1', textKey: 'scenes.visibility.c1', beliefKey: 'shame_of_success', nextSceneId: 'end' }, { id: 's37_2', textKey: 'scenes.visibility.c2', beliefKey: 'imposter_syndrome', nextSceneId: 'end' }, { id: 's37_3', textKey: 'scenes.visibility.c3', beliefKey: 'capacity_expansion', nextSceneId: 'end' }] },
    "38": { id: '38', titleKey: 'scenes.node_power.title', descKey: 'scenes.node_power.desc', intensity: 3, choices: [{ id: 's38_1', textKey: 'scenes.node_power.c1', beliefKey: 'fear_of_power', nextSceneId: 'end' }, { id: 's38_2', textKey: 'scenes.node_power.c2', beliefKey: 'self_permission', nextSceneId: 'end' }, { id: 's38_3', textKey: 'scenes.node_power.c3', beliefKey: 'power_corruption', nextSceneId: 'end' }] },
    "39": { id: '39', titleKey: 'scenes.social_conflict.title', descKey: 'scenes.social_conflict.desc', intensity: 3, choices: [{ id: 's39_1', textKey: 'scenes.social_conflict.c1', beliefKey: 'boundary_collapse', nextSceneId: 'end' }, { id: 's39_2', textKey: 'scenes.social_conflict.c2', beliefKey: 'self_permission', nextSceneId: 'end' }, { id: 's39_3', textKey: 'scenes.social_conflict.c3', beliefKey: 'money_is_tool', nextSceneId: 'end' }] }
  },
  legacy: {
    "40": {
      id: '40', titleKey: 'scenes.legacy_vision.title', descKey: 'scenes.legacy_vision.desc',
      choices: [
        { id: 'l40_1', textKey: 'scenes.legacy_vision.c1', beliefKey: 'short_term_bias', nextSceneId: 'end' },
        { id: 'l40_2', textKey: 'scenes.legacy_vision.c2', beliefKey: 'family_loyalty', nextSceneId: 'end' },
        { id: 'l40_3', textKey: 'scenes.legacy_vision.c3', beliefKey: 'capacity_expansion', nextSceneId: 'end' }
      ],
      intensity: 3
    },
    "41": { id: '41', titleKey: 'scenes.legacy_sacrifice.title', descKey: 'scenes.legacy_sacrifice.desc', intensity: 3, choices: [{ id: 'l41_1', textKey: 'scenes.legacy_sacrifice.c1', beliefKey: 'short_term_bias', nextSceneId: 'end' }, { id: 'l41_2', textKey: 'scenes.legacy_sacrifice.c2', beliefKey: 'ancestral_debt', nextSceneId: 'end' }, { id: 'l41_3', textKey: 'scenes.legacy_sacrifice.c3', beliefKey: 'capacity_expansion', nextSceneId: 'end' }] },
    "42": { id: '42', titleKey: 'scenes.node_death.title', descKey: 'scenes.node_death.desc', intensity: 3, choices: [{ id: 'l42_1', textKey: 'scenes.node_death.c1', beliefKey: 'unconscious_fear', nextSceneId: 'end' }, { id: 'l42_2', textKey: 'scenes.node_death.c2', beliefKey: 'self_permission', nextSceneId: 'end' }, { id: 'l42_3', textKey: 'scenes.node_death.c3', beliefKey: 'short_term_bias', nextSceneId: 'end' }] },
    "43": { id: '43', titleKey: 'scenes.legacy_vision.title', descKey: 'scenes.legacy_vision.desc', intensity: 3, choices: [{ id: 'l43_1', textKey: 'scenes.legacy_vision.c1', beliefKey: 'short_term_bias', nextSceneId: 'end' }, { id: 'l43_2', textKey: 'scenes.legacy_vision.c2', beliefKey: 'family_loyalty', nextSceneId: 'end' }, { id: 'l43_3', textKey: 'scenes.legacy_vision.c3', beliefKey: 'capacity_expansion', nextSceneId: 'end' }] },
    "44": { id: '44', titleKey: 'scenes.legacy_sacrifice.title', descKey: 'scenes.legacy_sacrifice.desc', intensity: 3, choices: [{ id: 'l44_1', textKey: 'scenes.legacy_sacrifice.c1', beliefKey: 'poverty_is_virtue', nextSceneId: 'end' }, { id: 'l44_2', textKey: 'scenes.legacy_sacrifice.c2', beliefKey: 'ancestral_debt', nextSceneId: 'end' }, { id: 'l44_3', textKey: 'scenes.legacy_sacrifice.c3', beliefKey: 'self_permission', nextSceneId: 'end' }] },
    "45": { id: '45', titleKey: 'scenes.node_death.title', descKey: 'scenes.node_death.desc', intensity: 3, choices: [{ id: 'l45_1', textKey: 'scenes.node_death.c1', beliefKey: 'fear_of_punishment', nextSceneId: 'end' }, { id: 'l45_2', textKey: 'scenes.node_death.c2', beliefKey: 'capacity_expansion', nextSceneId: 'end' }, { id: 'l45_3', textKey: 'scenes.node_death.c3', beliefKey: 'unconscious_fear', nextSceneId: 'end' }] },
    "46": { id: '46', titleKey: 'scenes.legacy_vision.title', descKey: 'scenes.legacy_vision.desc', intensity: 3, choices: [{ id: 'l46_1', textKey: 'scenes.legacy_vision.c1', beliefKey: 'short_term_bias', nextSceneId: 'end' }, { id: 'l46_2', textKey: 'scenes.legacy_vision.c2', beliefKey: 'family_loyalty', nextSceneId: 'end' }, { id: 'l46_3', textKey: 'scenes.legacy_vision.c3', beliefKey: 'self_permission', nextSceneId: 'end' }] },
    "47": { id: '47', titleKey: 'scenes.legacy_sacrifice.title', descKey: 'scenes.legacy_sacrifice.desc', intensity: 3, choices: [{ id: 'l47_1', textKey: 'scenes.legacy_sacrifice.c1', beliefKey: 'short_term_bias', nextSceneId: 'end' }, { id: 'l47_2', textKey: 'scenes.legacy_sacrifice.c2', beliefKey: 'capacity_expansion', nextSceneId: 'end' }, { id: 'l47_3', textKey: 'scenes.legacy_sacrifice.c3', beliefKey: 'money_is_tool', nextSceneId: 'end' }] },
    "48": { id: '48', titleKey: 'scenes.node_death.title', descKey: 'scenes.node_death.desc', intensity: 3, choices: [{ id: 'l48_1', textKey: 'scenes.node_death.c1', beliefKey: 'scarcity_mindset', nextSceneId: 'end' }, { id: 'l48_2', textKey: 'scenes.node_death.c2', beliefKey: 'self_permission', nextSceneId: 'end' }, { id: 'l48_3', textKey: 'scenes.node_death.c3', beliefKey: 'capacity_expansion', nextSceneId: 'end' }] },
    "49": { id: '49', titleKey: 'scenes.legacy_vision.title', descKey: 'scenes.legacy_vision.desc', intensity: 3, choices: [{ id: 'l49_1', textKey: 'scenes.legacy_vision.c1', beliefKey: 'short_term_bias', nextSceneId: 'end' }, { id: 'l49_2', textKey: 'scenes.legacy_vision.c2', beliefKey: 'ancestral_debt', nextSceneId: 'end' }, { id: 'l49_3', textKey: 'scenes.legacy_vision.c3', beliefKey: 'capacity_expansion', nextSceneId: 'end' }] }
  }
};
