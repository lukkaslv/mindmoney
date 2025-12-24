
import { Scene } from './types';

export const MODULE_REGISTRY: Record<string, Record<string, Scene>> = {
  foundation: Object.fromEntries(Array.from({ length: 10 }, (_, i) => [
    i.toString(),
    {
      id: i.toString(),
      titleKey: `scenes.f${i}.title`,
      descKey: `scenes.f${i}.desc`,
      intensity: 2 + (i % 3),
      choices: [
        { id: `f${i}_c1`, textKey: `scenes.f${i}.c1`, beliefKey: i % 2 === 0 ? 'scarcity_mindset' : 'family_loyalty' },
        { id: `f${i}_c2`, textKey: `scenes.f${i}.c2`, beliefKey: i % 3 === 0 ? 'fear_of_punishment' : 'hard_work_only' },
        { id: `f${i}_c3`, textKey: `scenes.f${i}.c3`, beliefKey: 'self_permission' }
      ]
    }
  ])),
  agency: Object.fromEntries(Array.from({ length: 10 }, (_, i) => [
    (i + 10).toString(),
    {
      id: (i + 10).toString(),
      titleKey: `scenes.a${i + 10}.title`,
      descKey: `scenes.a${i + 10}.desc`,
      intensity: 3,
      choices: [
        { id: `a${i + 10}_c1`, textKey: `scenes.a${i + 10}.c1`, beliefKey: 'imposter_syndrome' },
        { id: `a${i + 10}_c2`, textKey: `scenes.a${i + 10}.c2`, beliefKey: 'fear_of_conflict' },
        { id: `a${i + 10}_c3`, textKey: `scenes.a${i + 10}.c3`, beliefKey: 'capacity_expansion' }
      ]
    }
  ])),
  money: Object.fromEntries(Array.from({ length: 10 }, (_, i) => [
    (i + 20).toString(),
    {
      id: (i + 20).toString(),
      titleKey: `scenes.m${i + 20}.title`,
      descKey: `scenes.m${i + 20}.desc`,
      intensity: 4,
      choices: [
        { id: `m${i + 20}_c1`, textKey: `scenes.m${i + 20}.c1`, beliefKey: 'money_is_danger' },
        { id: `m${i + 20}_c2`, textKey: `scenes.m${i + 20}.c2`, beliefKey: 'impulse_spend' },
        { id: `m${i + 20}_c3`, textKey: `scenes.m${i + 20}.c3`, beliefKey: 'money_is_tool' }
      ]
    }
  ])),
  social: Object.fromEntries(Array.from({ length: 10 }, (_, i) => [
    (i + 30).toString(),
    {
      id: (i + 30).toString(),
      titleKey: `scenes.s${i + 30}.title`,
      descKey: `scenes.s${i + 30}.desc`,
      intensity: 3,
      choices: [
        { id: `s${i + 30}_c1`, textKey: `scenes.s${i + 30}.c1`, beliefKey: 'shame_of_success' },
        { id: `s${i + 30}_c2`, textKey: `scenes.s${i + 30}.c2`, beliefKey: 'betrayal_trauma' },
        { id: `s${i + 30}_c3`, textKey: `scenes.s${i + 30}.c3`, beliefKey: 'self_permission' }
      ]
    }
  ])),
  legacy: Object.fromEntries(Array.from({ length: 10 }, (_, i) => [
    (i + 40).toString(),
    {
      id: (i + 40).toString(),
      titleKey: `scenes.l${i + 40}.title`,
      descKey: `scenes.l${i + 40}.desc`,
      intensity: 5,
      choices: [
        { id: `l${i + 40}_c1`, textKey: `scenes.l${i + 40}.c1`, beliefKey: 'short_term_bias' },
        { id: `l${i + 40}_c2`, textKey: `scenes.l${i + 40}.c2`, beliefKey: 'unconscious_fear' },
        { id: `l${i + 40}_c3`, textKey: `scenes.l${i + 40}.c3`, beliefKey: 'capacity_expansion' }
      ]
    }
  ]))
};
