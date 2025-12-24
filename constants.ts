
import { Scene } from './types';

export const MODULE_REGISTRY: Record<string, Record<string, Scene>> = {
  foundation: {
    "0": {
      id: "0", titleKey: "scenes.f0.title", descKey: "scenes.f0.desc", intensity: 3,
      choices: [
        { id: "f0_c1", textKey: "scenes.f0.c1", beliefKey: "family_loyalty" },
        { id: "f0_c2", textKey: "scenes.f0.c2", beliefKey: "scarcity_mindset" },
        { id: "f0_c3", textKey: "scenes.f0.c3", beliefKey: "self_permission" }
      ]
    },
    "1": {
      id: "1", titleKey: "scenes.f1.title", descKey: "scenes.f1.desc", intensity: 4,
      choices: [
        { id: "f1_c1", textKey: "scenes.f1.c1", beliefKey: "fear_of_punishment" },
        { id: "f1_c2", textKey: "scenes.f1.c2", beliefKey: "hard_work_only" },
        { id: "f1_c3", textKey: "scenes.f1.c3", beliefKey: "capacity_expansion" }
      ]
    },
    // Nodes 2-9 generated automatically
    ...Object.fromEntries(Array.from({ length: 8 }, (_, i) => [
      (i + 2).toString(),
      { id: (i + 2).toString(), titleKey: `scenes.f${i + 2}.title`, descKey: `scenes.f${i + 2}.desc`, intensity: 2, 
        choices: [{ id: "c1", textKey: "c1", beliefKey: "scarcity_mindset" }, { id: "c2", textKey: "c2", beliefKey: "family_loyalty" }, { id: "c3", textKey: "c3", beliefKey: "self_permission" }] }
    ])),
    // New Nodes 10-14
    "10": {
      id: "10", titleKey: "scenes.f10.title", descKey: "scenes.f10.desc", intensity: 5,
      choices: [
        { id: "f10_c1", textKey: "scenes.f10.c1", beliefKey: "hard_work_only" },
        { id: "f10_c2", textKey: "scenes.f10.c2", beliefKey: "scarcity_mindset" },
        { id: "f10_c3", textKey: "scenes.f10.c3", beliefKey: "capacity_expansion" }
      ]
    },
    "11": {
      id: "11", titleKey: "scenes.f11.title", descKey: "scenes.f11.desc", intensity: 4,
      choices: [
        { id: "f11_c1", textKey: "scenes.f11.c1", beliefKey: "family_loyalty" },
        { id: "f11_c2", textKey: "scenes.f11.c2", beliefKey: "boundary_collapse" },
        { id: "f11_c3", textKey: "scenes.f11.c3", beliefKey: "self_permission" }
      ]
    },
    "12": {
      id: "12", titleKey: "scenes.f12.title", descKey: "scenes.f12.desc", intensity: 4,
      choices: [
        { id: "f12_c1", textKey: "scenes.f12.c1", beliefKey: "scarcity_mindset" },
        { id: "f12_c2", textKey: "scenes.f12.c2", beliefKey: "imposter_syndrome" },
        { id: "f12_c3", textKey: "scenes.f12.c3", beliefKey: "money_is_tool" }
      ]
    },
    "13": {
      id: "13", titleKey: "scenes.f13.title", descKey: "scenes.f13.desc", intensity: 5,
      choices: [
        { id: "f13_c1", textKey: "scenes.f13.c1", beliefKey: "hard_work_only" },
        { id: "f13_c2", textKey: "scenes.f13.c2", beliefKey: "fear_of_punishment" },
        { id: "f13_c3", textKey: "scenes.f13.c3", beliefKey: "self_permission" }
      ]
    },
    "14": {
      id: "14", titleKey: "scenes.f14.title", descKey: "scenes.f14.desc", intensity: 3,
      choices: [
        { id: "f14_c1", textKey: "scenes.f14.c1", beliefKey: "imposter_syndrome" },
        { id: "f14_c2", textKey: "scenes.f14.c2", beliefKey: "unconscious_fear" },
        { id: "f14_c3", textKey: "scenes.f14.c3", beliefKey: "capacity_expansion" }
      ]
    }
  },
  // SHIFTED: Agency now 15-24 (mapped to a10-a19 translations)
  agency: Object.fromEntries(Array.from({ length: 10 }, (_, i) => [
    (i + 15).toString(),
    {
      id: (i + 15).toString(), titleKey: `scenes.a${i + 10}.title`, descKey: `scenes.a${i + 10}.desc`, intensity: 3,
      choices: [
        { id: "c1", textKey: "c1", beliefKey: "imposter_syndrome" },
        { id: "c2", textKey: "c2", beliefKey: "fear_of_conflict" },
        { id: "c3", textKey: "c3", beliefKey: "capacity_expansion" }
      ]
    }
  ])),
  // SHIFTED: Money now 25-34 (mapped to m20-m29 translations)
  money: Object.fromEntries(Array.from({ length: 10 }, (_, i) => [
    (i + 25).toString(),
    {
      id: (i + 25).toString(), titleKey: `scenes.m${i + 20}.title`, descKey: `scenes.m${i + 20}.desc`, intensity: 4,
      choices: [
        { id: "c1", textKey: "c1", beliefKey: "money_is_danger" },
        { id: "c2", textKey: "c2", beliefKey: "impulse_spend" },
        { id: "c3", textKey: "c3", beliefKey: "money_is_tool" }
      ]
    }
  ])),
  // SHIFTED: Social now 35-44 (mapped to s30-s39 translations)
  social: Object.fromEntries(Array.from({ length: 10 }, (_, i) => [
    (i + 35).toString(),
    {
      id: (i + 35).toString(), titleKey: `scenes.s${i + 30}.title`, descKey: `scenes.s${i + 30}.desc`, intensity: 3,
      choices: [
        { id: "c1", textKey: "c1", beliefKey: "shame_of_success" },
        { id: "c2", textKey: "c2", beliefKey: "betrayal_trauma" },
        { id: "c3", textKey: "c3", beliefKey: "self_permission" }
      ]
    }
  ])),
  // SHIFTED: Legacy now 45-49 (mapped to l40-l44 translations)
  legacy: Object.fromEntries(Array.from({ length: 5 }, (_, i) => [
    (i + 45).toString(),
    {
      id: (i + 45).toString(), titleKey: `scenes.l${i + 40}.title`, descKey: `scenes.l${i + 40}.desc`, intensity: 5,
      choices: [
        { id: "c1", textKey: "c1", beliefKey: "short_term_bias" },
        { id: "c2", textKey: "c2", beliefKey: "unconscious_fear" },
        { id: "c3", textKey: "c3", beliefKey: "capacity_expansion" }
      ]
    }
  ]))
};
