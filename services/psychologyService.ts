
// Автономный глубокий психологический движок v4.0 (Deterministic Analysis)

export interface AnalysisResult {
  archetype: string;
  coreConflict: string;
  bodyAnalysis: string;
  analysisText: string;
  scoreSafety: number;
  scorePermission: number;
  scoreAmbition: number;
  keyBelief: string;
  actionStep: string;
  shadowSide: string;
}

const TRAITS: Record<string, any> = {
  'fear_of_punishment': { 
    safety: -20, permission: -5, ambition: 0, 
    conflict: "Безопасность vs Проявление", 
    body: "Зажим в горле и плечах как попытка 'сжаться' и стать незаметным для 'карающей' системы.",
    shadow: "Подавленная агрессия и желание бунта против правил.",
    text: "Ваш выбор продиктован древним страхом: успех ассоциируется с опасностью быть замеченным и наказанным."
  },
  'impulse_spend': { 
    safety: -10, permission: +20, ambition: +10, 
    conflict: "Удовольствие vs Стабильность", 
    body: "Тремор в руках и учащенное сердцебиение — возбуждение, граничащее с тревогой потери контроля.",
    shadow: "Страх перед будущим и неспособность выдерживать напряжение от обладания ресурсом.",
    text: "Слив денег — это защитный механизм: вы избавляетесь от ресурса, чтобы избавиться от ответственности за него."
  },
  'money_is_danger': { 
    safety: -30, permission: -10, ambition: -5, 
    conflict: "Выживание vs Рост", 
    body: "Холод в животе и сжатие диафрагмы. Тело готовится к нападению извне при малейшем достатке.",
    shadow: "Паранойя и недоверие к миру, скрытое под маской 'скромности'.",
    text: "Для вас деньги — это мишень. Вы бессознательно выбираете невидимость, чтобы сохранить жизнь."
  },
  'poverty_is_virtue': { 
    safety: +10, permission: -25, ambition: -15, 
    conflict: "Мораль vs Потребности", 
    body: "Тяжесть в груди — 'камень' морального превосходства, мешающий дышать полной грудью.",
    shadow: "Гордыня и презрение к тем, кто позволил себе больше, чем вы.",
    text: "Вы используете нехватку денег как доказательство своей духовной чистоты, боясь стать 'испорченным'."
  },
  'fear_of_conflict': { 
    safety: +5, permission: -20, ambition: -10, 
    conflict: "Принадлежность vs Автономия", 
    body: "Комок в горле — невысказанное право на свое мнение и свои границы.",
    shadow: "Глубокая обида на близких за то, что ради них приходится предавать свои интересы.",
    text: "Вы платите своим благополучием за право оставаться 'хорошим' и принятым в своей стае."
  },
  'money_is_tool': { 
    safety: +15, permission: +15, ambition: +15, 
    conflict: "Инструментальный подход", 
    body: "Тепло и расслабление в конечностях. Способность действовать точно и без лишнего пафоса.",
    shadow: "Излишняя рационализация чувств, страх перед глубокой эмоциональной близостью.",
    text: "Вы видите в деньгах рычаг. Это взрослая позиция, позволяющая управлять реальностью без драмы."
  },
  'imposter_syndrome': { 
    safety: -5, permission: -25, ambition: +10, 
    conflict: "Компетентность vs Признание", 
    body: "Напряжение в челюсти — попытка удержать маску 'знающего', боясь разоблачения.",
    shadow: "Зависть к тем, кто проявляется легко и без самобичевания.",
    text: "Внутренний критик обесценивает каждый ваш шаг, заставляя бесконечно 'готовиться' вместо того, чтобы жить."
  },
  'hard_work_only': { 
    safety: -10, permission: +5, ambition: +20, 
    conflict: "Страдание vs Результат", 
    body: "Хроническое напряжение в пояснице — вы несете на себе груз 'заслуженности' каждой копейки.",
    shadow: "Мазохистическое удовольствие от преодоления трудностей.",
    text: "Вы верите, что легкие деньги — грязные. Вы буквально 'покупаете' право на доход своим здоровьем."
  },
  'capacity_expansion': { 
    safety: +10, permission: +25, ambition: +25, 
    conflict: "Масштабирование", 
    body: "Расширение в грудной клетке, глубокое дыхание. Готовность занимать больше места в мире.",
    shadow: "Гиперответственность и страх потерять контроль над выстроенной структурой.",
    text: "Вы расширяете свои границы. Это путь лидера, который готов делегировать и доверять."
  },
  'family_loyalty': { 
    safety: +10, permission: -30, ambition: -10, 
    conflict: "Род vs Я", 
    body: "Тяжесть в ногах — корни, которые не дают уйти от сценария бедности предков.",
    shadow: "Страх предательства семьи через свой успех.",
    text: "Ваша верность роду проявляется через повторение их тяжелой судьбы. Быть богаче родителей для вас значит бросить их."
  },
  'guilt_after_pleasure': { 
    safety: -15, permission: -20, ambition: +5, 
    conflict: "Радость vs Расплата", 
    body: "Холод в конечностях после покупки — ожидание немедленного 'удара судьбы' за проявленную дерзость.",
    shadow: "Убежденность, что за всё хорошее в жизни нужно платить страданиями.",
    text: "Удовольствие для вас связано с тревогой. Вы не умеете присваивать себе радость, не разрушая ее виной."
  },
  'self_permission': { 
    safety: +20, permission: +30, ambition: +20, 
    conflict: "Право на бытие", 
    body: "Чувство центрированности. Опора на себя и свои желания как на главную ценность.",
    shadow: "Склонность к эгоцентризму и потере связи с потребностями окружающих.",
    text: "Вы разрешили себе быть. Это фундамент финансового здоровья — признание своей ценности по праву рождения."
  }
};

export async function getPsychologicalFeedback(history: any[]): Promise<AnalysisResult> {
  let safety = 50, permission = 50, ambition = 50;
  let summaryTexts: string[] = [];
  let shadowSides: string[] = [];
  let conflicts: string[] = [];
  let bodyNotes: string[] = [];

  history.forEach(item => {
    const trait = TRAITS[item.beliefKey];
    if (trait) {
      safety = Math.max(0, Math.min(100, safety + trait.safety));
      permission = Math.max(0, Math.min(100, permission + trait.permission));
      ambition = Math.max(0, Math.min(100, ambition + trait.ambition));
      summaryTexts.push(trait.text);
      shadowSides.push(trait.shadow);
      conflicts.push(trait.conflict);
      bodyNotes.push(trait.body);
    }
  });

  // Логика определения Архетипа на основе баланса шкал
  let archetype = "Наблюдатель";
  if (safety < 40 && permission < 40) archetype = "Пленник Дефицита";
  else if (safety < 40 && ambition > 60) archetype = "Тревожный Достигатор";
  else if (permission < 40 && safety > 60) archetype = "Смиренный Хранитель";
  else if (permission > 70 && ambition > 70) archetype = "Денежный Экспандер";
  else if (ambition < 40) archetype = "Мирный Созерцатель";

  const keyBelief = history[history.length - 1] ? 
    `"${TRAITS[history[history.length - 1].beliefKey]?.shadow || 'Точка роста'}"` : 
    "Я имею право на большее";

  const actionStep = safety < 50 ? 
    "Создайте список из 10 вещей, которые дают вам чувство опоры, не связанные с деньгами." :
    "Позвольте себе одну импульсивную покупку-подарок, которая не несет 'пользы', а только радость.";

  return {
    archetype,
    coreConflict: conflicts[conflicts.length - 1] || "Поиск баланса",
    bodyAnalysis: bodyNotes.slice(-2).join(" "),
    analysisText: summaryTexts.slice(-2).join(" ") + " Интеграция этих осознаний позволит вам перестать тратить энергию на внутреннюю борьбу.",
    scoreSafety: safety,
    scorePermission: permission,
    scoreAmbition: ambition,
    keyBelief,
    actionStep,
    shadowSide: Array.from(new Set(shadowSides)).slice(-2).join(", ")
  };
}
