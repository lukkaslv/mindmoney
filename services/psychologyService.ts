
export interface Vector3 { x: number; y: number; z: number; }

export interface RoadmapAction {
  id: string;
  domain: 'body' | 'mind' | 'action';
  instruction: string;
  scientificBasis: string;
}

export interface AnalysisResult {
  archetypeKey: string;
  entropy: number; // 0-1 (уровень хаоса/противоречий)
  kineticPotential: number; // Скорость возможного роста (0-100)
  integrityScore: number; // Общая связность системы
  fractureLimit: number; // Предел прочности (в условных единицах нагрузки)
  lattice: any[];
  stats: { safety: number; power: number; permission: number };
  prescription: RoadmapAction[];
  vectorField: Vector3[];
}

const DOMAIN_MULTIPLIERS = {
  SAFETY: 1.4,
  PERMIT: 1.2,
  POWER: 1.0
};

export async function getPsychologicalFeedback(history: any[]): Promise<AnalysisResult> {
  let s = 40, p = 40, a = 40;
  let entropySum = 0;
  let coherencePoints = 0;
  
  // Математические веса для соматики и убеждений
  const weights = {
    'throat': { s: -0.1, p: -0.8, a: -0.1, e: 0.9 },
    'stomach': { s: -1.0, p: -0.1, a: -0.1, e: 1.0 },
    'warmth': { s: 0.5, p: 0.6, a: 0.8, e: 0.1 },
    'chest': { s: -0.2, p: -0.3, a: -0.9, e: 0.7 },
    'none': { s: 0, p: 0, a: 0, e: 0.5 }
  };

  const beliefImpact = {
    'capacity_expansion': { s: 0.1, p: 0.4, a: 1.2 },
    'self_permission': { s: 0.2, p: 1.2, a: 0.3 },
    'money_is_tool': { s: 0.8, p: 0.3, a: 0.3 },
    'money_is_danger': { s: -1.2, p: -0.2, a: -0.5 },
    'imposter_syndrome': { s: -0.1, p: -1.0, a: 0.2 }
  };

  const processed = history.map((step, i) => {
    const b = beliefImpact[step.beliefKey as keyof typeof beliefImpact] || { s: 0, p: 0, a: 0 };
    const bodyKey = step.bodySensation?.includes('горле') ? 'throat' :
                    step.bodySensation?.includes('Холод') ? 'stomach' :
                    step.bodySensation?.includes('тепла') ? 'warmth' :
                    step.bodySensation?.includes('груди') ? 'chest' : 'none';
    const body = weights[bodyKey as keyof typeof weights];

    // Расчет локального конфликта (энтропии)
    // Если выбор направлен на рост (a > 0), а тело на сжатие (body.a < 0), энтропия растет
    const conflict = (b.a > 0 && body.a < 0) || (b.s > 0 && body.s < 0) ? body.e : body.e * 0.5;
    entropySum += conflict;

    s = Math.max(0, Math.min(100, s + b.s * 15 + body.s * 8));
    p = Math.max(0, Math.min(100, p + b.p * 15 + body.p * 8));
    a = Math.max(0, Math.min(100, a + b.a * 15 + body.a * 8));

    return { conflict, s, p, a };
  });

  const finalEntropy = Math.min(1, entropySum / history.length);
  const integrity = Math.round((1 - finalEntropy) * 100);
  const kinetic = Math.round((a * (1 - finalEntropy)));
  const fracture = Math.round(s * DOMAIN_MULTIPLIERS.SAFETY * (1 - finalEntropy));

  // Рецептурный план (Prescription)
  const prescription: RoadmapAction[] = [];
  
  if (finalEntropy > 0.6) {
    prescription.push({
      id: 'e_1',
      domain: 'mind',
      instruction: 'Мораторий на новые проекты на 14 дней. Ваша система в состоянии дефолта.',
      scientificBasis: 'Высокая психическая энтропия блокирует когнитивные функции префронтальной коры.'
    });
  }

  if (s < 50) {
    prescription.push({
      id: 's_1',
      domain: 'body',
      instruction: 'Ежедневная практика "Вес тела". 10 минут ощущать давление стоп в пол.',
      scientificBasis: 'Стимуляция проприоцепции для снижения уровня кортизола и активации парасимпатики.'
    });
  }

  if (p < 50) {
    prescription.push({
      id: 'p_1',
      domain: 'action',
      instruction: 'Микро-трата "Запрещенное удовольствие" (до 5% дохода) без обоснования пользы.',
      scientificBasis: 'Разрыв нейронной связи "Радость = Вина" через дофаминовую стимуляцию.'
    });
  }

  return {
    archetypeKey: a > 70 ? 'expander' : (s < 40 ? 'prisoner' : 'observer'),
    entropy: finalEntropy,
    kineticPotential: kinetic,
    integrityScore: integrity,
    fractureLimit: fracture,
    stats: { safety: Math.round(s), power: Math.round(a), permission: Math.round(p) },
    lattice: [], // Решетка генерируется на фронте
    prescription,
    vectorField: []
  };
}
