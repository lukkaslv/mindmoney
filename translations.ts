import { Translations } from './types';

// Genesis OS Translations (RU/KA)
// Clinical focus for psychologists and their clients.
const ru: Translations = {
  subtitle: "Clinical Bridge // Professional Screening",
  onboarding: {
    title: "Genesis OS",
    promo_title: "Профессиональный скрининг",
    promo_desc: "Для психологов и их клиентов",
    protocol_btn: "Начать протокол",
    start_btn: "Запуск системы",
    pricing_btn: "Тарифы и доступ",
    solo_plan: "Solo",
    clinical_plan: "Clinical",
    lab_plan: "Lab",
    price_solo: "19$",
    price_clinical: "49$",
    price_lab: "99$",
    price_per_month: "/ мес"
  },
  invalid_results: {
    title: "Нарушение Протокола",
    message: "Система зафиксировала нетипичные паттерны ввода, указывающие на возможную фальсификацию или техническую аномалию.",
    reason_monotonic: "Повторяющийся выбор позиций (Механический паттерн).",
    reason_robotic: "Сверхвысокая точность тайминга (Искусственный ритм).",
    reason_rhythm: "Нестабильный когнитивный ритм (Попытка обхода латентности).",
    reason_skip: "Высокий уровень игнорирования значимых стимулов.",
    reason_early_termination: "Недостаточный объем данных для клинического вывода.",
    recommendation: "Для корректной диагностики требуется спонтанность и контакт с телом. Пожалуйста, сбросьте сессию и пройдите исследование без попыток 'угадать' результат.",
    reset_button: "Восстановить целостность"
  },
  boot_sequence: ["Инициализация ядра...", "Загрузка модулей...", "Проверка целостности...", "Система готова"],
  ui: {
    system_build: "Сборка системы",
    reset_session_btn: "Сброс сессии",
    status_report_title: "Отчет о состоянии",
    module_label: "Модуль",
    progress_label: "Прогресс",
    secured_label: "Защищено",
    agree_terms_btn: "Принять условия",
    mode_client: "Клиент",
    mode_pro: "Специалист",
    access_restricted: "Доступ ограничен",
    decrypt_btn: "Расшифровать",
    paste_code: "Вставьте код",
    evolution_title: "Эволюция",
    sessions_secured: "Сессий проведено",
    first_investigation_hint: "Первое исследование даст базовую линию",
    integrity_drift: "Дрейф целостности",
    noise_tracking: "Трекинг шума",
    evolution_insight_optimizing: "Система оптимизируется",
    evolution_insight_stabilizing: "Система стабилизируется",
    evolution_insight_desc: "Данные показывают динамику изменений",
    copy_brief: "Копировать",
    brief_copied: "Скопировано",
    system_audit_title: "Аудит системы",
    status_active: "Активен",
    status_expired: "Истек",
    upgrade_btn: "Обновить",
    skip_button: "Пропустить"
  },
  admin: {
    kernel: "Ядро",
    integrity: "Целостность",
    billing: "Биллинг",
    learning: "Обучение",
    logs: "Логи",
    integrity_audit: "Аудит",
    license_key: "Лицензионный ключ",
    tier_label: "Тип лицензии",
    status_active: "Активна",
    status_expired: "Истекла",
    upgrade_btn: "Обновить"
  },
  guide: {
    title: "Руководство",
    subtitle: "Для клиентов",
    sections: [
      { title: "Как это работает", content: ["Отвечайте быстро", "Будьте честны", "Слушайте тело"] }
    ],
    metaphor: "Ваше подсознание знает кратчайший путь."
  },
  pro_guide: {
    title: "Про-Гайд",
    subtitle: "Для специалистов",
    sections: [
      { title: "Интерпретация", content: ["Смотрите на Entropy", "Foundation - это база вашей работы", "NeuroSync показывает готовность к изменениям"] }
    ],
    closing: "Genesis OS — это профессиональный инструмент, а не развлечение."
  },
  brief_explainer: {
    title: "Краткий экскурс",
    subtitle: "Основы системы",
    intro_title: "Что это?",
    intro_text: "Это система профессионального психологического скрининга.",
    blocks_title: "Блоки",
    archetype_label: "Архетип",
    archetype_desc: "Ваш доминирующий паттерн поведения.",
    metrics_title: "Метрики",
    foundation_desc: "Базовая безопасность и опоры.",
    agency_desc: "Воля и способность к действию.",
    resource_desc: "Ваш потенциал и емкость.",
    entropy_desc: "Уровень шума и тревоги в системе.",
    neurosync_label: "НейроСинхрон",
    neurosync_desc: "Связь тела и разума.",
    latency_label: "Латентность",
    latency_desc: "Время реакции на стимулы.",
    combinations_title: "Комбинации",
    combinations_text: "Метрики работают в связке.",
    action_title: "Действие",
    action_text: "Используйте результаты для терапии.",
    limits_title: "Ограничения",
    limits_text: "Не является медицинским диагнозом.",
    closing: "Ваш путь к осознанности начинается здесь."
  },
  clinical_decoder: {
    somatic_dissonance_title: "Соматический диссонанс",
    somatic_dissonance_desc: "Разрыв между сознательным выбором и реакцией тела.",
    disclaimer: "Только для профессионального использования квалифицированным специалистом.",
    analysis_patterns: {
        god_mode_dissociation: "Компенсаторная сверхпродуктивность как защита от травмы.",
        somatic_rebellion: "Тело бунтует против волевого давления.",
        naked_wire: "Высокая чувствительность при полном отсутствии опор.",
        frozen_will: "Паралич воли при критическом уровне внутреннего шума.",
        intellectual_bypass: "Интеллектуальный обход чувств и ощущений.",
        resource_anxiety: "Тревога, вызванная обладанием ресурсом.",
        foundation_void: "Вакуум в базовой безопасности.",
        manic_defense: "Маниакальная защита через гиперактивность."
    },
    common_hypotheses: {
        anesthesia: { h: "Функциональная анестезия", q: "Что вы перестаете чувствовать, когда вы успешны?" },
        functional_value: { h: "Функциональная самооценка", q: "Кто вы без ваших достижений и функции?" },
        visibility_fear: { h: "Страх видимости", q: "Что самое страшное случится, если вас заметят?" },
        adaptation_to_min: { h: "Адаптация к минимуму", q: "Как вы научились выживать на малом?" }
    },
    configs: {
        compensatory_overdrive: { title: "Сверхкомпенсация", desc: "Система работает на износ для удержания контроля." },
        critical_deficit: { title: "Критический дефицит", desc: "Система истощена, опоры разрушены." },
        economy_mode: { title: "Режим экономии", desc: "Минимальный расход энергии для выживания." },
        mobilization: { title: "Мобилизация", desc: "Активный поиск новых опор и ресурсов." },
        chaotic: { title: "Хаос", desc: "Высокий уровень неопределенности." },
        chaotic_creative: { title: "Креативный хаос", desc: "Активная пересборка внутренних смыслов." },
        rigid: { title: "Ригидность", desc: "Чрезмерная жесткость структур." }
    },
    headers: { mechanism: "Глубинные Механизмы" },
    sync_patterns: {
        coherent: "Когерентность",
        dissociation: "Диссоциация",
        honest_weakness: "Честная слабость"
    },
    archetype_strategies: {
        THE_ARCHITECT: { strategy: "Структурирование", func: "Порядок", limit: "Контроль" },
        THE_DRIFTER: { strategy: "Адаптация", func: "Гибкость", limit: "Размытость" },
        THE_BURNED_HERO: { strategy: "Жертвенность", func: "Подвиг", limit: "Выгорание" },
        THE_GOLDEN_PRISONER: { strategy: "Накопление", func: "Стабильность", limit: "Застой" },
        THE_CHAOS_SURFER: { strategy: "Импровизация", func: "Драйв", limit: "Дезорганизация" },
        THE_GUARDIAN: { strategy: "Сохранение", func: "Безопасность", limit: "Страх перемен" }
    },
    risks: {
        burnout_blindness: "Слепота к признакам выгорания",
        normalization: "Нормализация дефицитарного состояния",
        intellectualization: "Уход в бесплодные рассуждения",
        premature_action: "Преждевременное или импульсивное действие",
        role_play: "Игра в 'хорошего клиента' для терапевта"
    },
    session_entries: {
        reality_check: "Проверка реальности и заземление.",
        decelerate: "Замедление и фокус на дыхании.",
        security_first: "Приоритет: создание безопасности.",
        body_focus: "Возвращение контакта с телом.",
        validate_deficit: "Признание и валидация дефицита."
    }
  },
  global: {
    back: "Назад",
    complete: "Завершено",
    calibrating: "Калибровка",
    calib_desc: "Настройка сенсоров системы и базовой линии.",
    skip_button: "Пропустить"
  },
  sync: {
    title: "Body Sync",
    desc: "Синхронизация с телесными ощущениями.",
    s0: "Нейтрально",
    s1: "Напряжение / Сжатие",
    s2: "Тепло / Энергия",
    s3: "Холод / Онемение",
    s4: "Дрожь / Тремор",
    guidance_tip: "Прислушайтесь к своему телу прямо сейчас.",
    processing: "Обработка сигнала..."
  },
  sensation_feedback: {
    s0: "Сигнал принят",
    s1: "Зафиксирован блок",
    s2: "Ресурс активирован",
    s3: "Обнаружена заморозка",
    s4: "Волнение системы"
  },
  domains: {
    foundation: "Опоры",
    agency: "Воля",
    money: "Ресурсы",
    social: "Социум",
    legacy: "Наследие"
  },
  dashboard: {
    desc: "Система готова к глубокому анализу.",
    insight_coherence: "Высокая когерентность системы.",
    insight_noise: "Обнаружен избыточный шум в каналах.",
    insight_somatic_dissonance: "Зафиксирован соматический диссонанс.",
    retest_ready: "Готовность к повторному тесту",
    retest_desc: "Прошло достаточно времени для новой оценки.",
    select_domain: "Выберите домен",
    open_terminal: "Терминал",
    manual_btn: "Инструкция"
  },
  results: {
    integrity: "Целостность",
    neuro_sync: "НейроСинхрон",
    capacity: "Емкость",
    entropy: "Энтропия",
    share_url: "https://genesis-os.app",
    share_button: "Поделиться",
    back: "В дашборд",
    disclaimer_title: "Важное уведомление",
    disclaimer_body: "Результаты скрининга требуют интерпретации квалифицированным специалистом. Это не диагноз.",
    brief_instruction: "Передайте этот код вашему специалисту.",
    copy_brief: "Копировать код",
    brief_copied: "Код скопирован",
    active_patterns_title: "Активные паттерны",
    tap_to_decode: "Нажмите для расшифровки",
    decoder_title: "Сигнальный декодер",
    signal_resistance: "Сопротивление",
    signal_resonance: "Резонанс",
    protection_label: "Защита",
    cost_label: "Цена",
    antidote_label: "Антидот",
    origin_measured: "Системный замер",
    origin_reported: "Отчет клиента",
    session_prep: "Подготовка к сессии",
    session_prep_desc: "Ключевые вопросы для терапии",
    status: "Статус системы"
  },
  phases: {
    SANITATION: "Санация",
    STABILIZATION: "Стабилизация",
    EXPANSION: "Экспансия"
  },
  tasks: {
      sanitation_1: "Аудит лояльностей",
      sanitation_2: "Соматическая разгрузка",
      stabilization_1: "Границы и опоры",
      expansion_1: "Масштабирование воли"
  },
  scenes: {
      "foundation_0": {
          title: "Точка Входа",
          desc: "Вы неожиданно получаете крупную сумму. Первое чувство в теле?",
          c1: "Желание спрятать (Лояльность)",
          c2: "Растерянность (Автопилот)",
          c3: "Спокойное принятие (Разрешение)"
      },
      "foundation_1": {
          title: "Граница Видимости",
          desc: "О вашем успехе узнали все близкие. Ваша первая мысль?",
          c1: "Будут завидовать (Страх)",
          c2: "Нужно оправдаться (Труд)",
          c3: "Это естественно (Право)"
      },
      "foundation_2": {
          title: "Ресурсная Емкость",
          desc: "Предложили проект мечты с высоким риском. Реакция?",
          c1: "Слишком опасно (Дефицит)",
          c2: "Соглашусь, но буду страдать (Границы)",
          c3: "Иду в расширение (Емкость)"
      }
  },
  beliefs: {
    family_loyalty: "Семейная лояльность",
    scarcity_mindset: "Дефицитарное мышление",
    fear_of_punishment: "Страх наказания",
    imposter_syndrome: "Синдром самозванца",
    poverty_is_virtue: "Бедность как добродетель",
    hard_work_only: "Только тяжелый труд",
    self_permission: "Разрешение себе",
    fear_of_conflict: "Страх конфликта",
    betrayal_trauma: "Травма предательства",
    unconscious_fear: "Бессознательный страх",
    money_is_danger: "Деньги — это опасность",
    impulse_spend: "Импульсивные траты",
    resource_toxicity: "Токсичность ресурса",
    short_term_bias: "Краткосрочное видение",
    capacity_expansion: "Расширение емкости",
    boundary_collapse: "Коллапс границ",
    shame_of_success: "Стыд успеха",
    hero_martyr: "Герой-мученик",
    latency_resistance: "Латентное сопротивление",
    body_mind_conflict: "Конфликт души и тела",
    ambivalence_loop: "Петля амбивалентности",
    autopilot_mode: "Автопилот",
    golden_cage: "Золотая клетка",
    money_is_tool: "Деньги как инструмент",
    default: "Пропуск"
  },
  explanations: {
      latency: "Время, необходимое психике для обработки стимула.",
      resonance: "Совпадение когнитивного ответа и телесного импульса."
  },
  pattern_library: {
    default: { protection: "Стабильность", cost: "Застой", antidote: "Движение" },
    family_loyalty: { protection: "Принадлежность к роду через повторение судьбы", cost: "Запрет на личное счастье и успех", antidote: "Я выбираю свою жизнь с уважением к вашей." },
  },
  archetypes: {
    THE_ARCHITECT: { title: "Архитектор", desc: "Строит системы и структуры.", quote: "Порядок в системе — порядок в жизни.", superpower: "Структурирование", shadow: "Ригидность" },
    THE_DRIFTER: { title: "Скиталец", desc: "Ищет путь, избегая привязанностей.", quote: "Путь открывается идущему.", superpower: "Поиск", shadow: "Нестабильность" },
    THE_BURNED_HERO: { title: "Выгоревший герой", desc: "Спас всех ценой собственного ресурса.", quote: "Я все сделаю сам, любой ценой.", superpower: "Самоотверженность", shadow: "Истощение" },
    THE_GOLDEN_PRISONER: { title: "Золотой узник", desc: "Заперт в комфорте, боится потерять стабильность.", quote: "Мне здесь хорошо, но очень тесно.", superpower: "Стабильность", shadow: "Застой" },
    THE_CHAOS_SURFER: { title: "Серфер хаоса", desc: "Управляет неопределенностью на интуиции.", quote: "Лови волну, пока она есть.", superpower: "Гибкость", shadow: "Дезорганизация" },
    THE_GUARDIAN: { title: "Хранитель", desc: "Оберегает существующие границы и ценности.", quote: "Ни шагу назад от того, что имеем.", superpower: "Защита", shadow: "Изоляция" }
  },
  verdicts: {
    HEALTHY_SCALE: { label: "Здоровый баланс", impact: "Система в ресурсном состоянии." },
    CRITICAL_DEFICIT: { label: "Критический дефицит", impact: "Высокий риск системного сбоя." },
    BRILLIANT_SABOTAGE: { label: "Блестящий саботаж", impact: "Скрытое сопротивление росту." },
    INVISIBILE_CEILING: { label: "Невидимый потолок", impact: "Ограничение масштаба." },
    LEAKY_BUCKET: { label: "Дырявое ведро", impact: "Потеря ресурса через тревогу." },
    PARALYZED_GIANT: { label: "Парализованный гигант", impact: "Огромный потенциал без воли." },
    FROZEN_POTENTIAL: { label: "Замерзший потенциал", impact: "Стагнация на всех уровнях." }
  },
  metric_definitions: {
    foundation: "Ваша внутренняя безопасность и опоры.",
    integrity: "Общая целостность и устойчивость системы."
  },
  conflicts: {
      foundation_agency: "Конфликт Безопасности и Действия",
      agency_resource: "Конфликт Воли и Емкости"
  },
  system_commentary: ["Сигнал стабилен", "Анализ латентности продолжается", "Обнаружен паттерн сопротивления"],
  auth_hint: "Используйте ваш ключ доступа для дешифровки данных.",
  legal_disclaimer: "Genesis OS v3.0 // Только для профессионального использования.",
  safety: {
      alert: "Внимание: Обнаружен критический дефицит опор."
  },
  session_prep_templates: {
      low_foundation_pattern: "Как паттерн '{{pattern}}' влияет на ваше чувство безопасности?",
      low_foundation_generic: "Что сейчас является вашей главной опорой?",
      conflict: "Как вы ощущаете конфликт между сфер {{metric1}} и {{metric2}}?",
      somatic_dissonance: "Ваше тело реагирует на '{{pattern}}' напряжением. О чем этот сигнал?",
      pattern_interaction: "Как '{{pattern1}}' подкрепляет '{{pattern2}}' в вашей жизни?",
      default_latency: "Мы заметили задержку при ответе на вопросы о тени вашего архетипа ({{archetype_shadow}}). Что там скрыто?",
      default_archetype: "Ваш архетип проявляет теневую сторону: {{archetype_shadow}}. Как это мешает прогрессу?",
      default_verdict: "Ваш вердикт '{{verdict_impact}}'. С чего бы вы хотели начать обсуждение?"
  },
  synthesis_categories: {},
  synthesis: {},
  interventions: {},
  directives: {},
  interferences: {},
  correlation_types: {},
  integrity_audit: {}
};

const ka: Translations = {
  subtitle: "კლინიკური ხიდი // პროფესიული სკრინინგი",
  onboarding: {
    title: "Genesis OS",
    promo_title: "პროფესიული სკრინინგი",
    promo_desc: "ფსიქოლოგებისა და მათი კლიენტებისთვის",
    protocol_btn: "პროტოკოლის დაწყება",
    start_btn: "სისტემის გაშვება",
    pricing_btn: "ტარიფები და წვდომა",
    solo_plan: "Solo",
    clinical_plan: "Clinical",
    lab_plan: "Lab",
    price_solo: "19$",
    price_clinical: "49$",
    price_lab: "99$",
    price_per_month: "/ თვეში"
  },
  invalid_results: {
    title: "პროტოკოლის დარღვევა",
    message: "სისტემამ დააფიქსირა არატიპიური პატერნები, რაც მიუთითებს მონაცემების შესაძლო მანიპულაციაზე.",
    reason_monotonic: "განმეორებადი არჩევანი (მექანიკური პატერნი).",
    reason_robotic: "ზეზუსტი ტაიმინგი (ხელოვნური რიტმი).",
    reason_rhythm: "არასტაბილური კოგნიტური რიტმი.",
    reason_skip: "მნიშვნელოვანი სტიმულების იგნორირების მაღალი დონე.",
    reason_early_termination: "არასაკმარისი მონაცემები კლინიკური დასკვნისთვის.",
    recommendation: "კორექტული დიაგნოსტიკისთვის საჭიროა სპონტანურობა. გთხოვთ, თავიდან გაიაროთ კვლევა 'სწორი' პასუხების გამოცნობის გარეშე.",
    reset_button: "მთლიანობის აღდგენა"
  },
  boot_sequence: ["ბირთვის ინიციალიზაცია...", "მოდულების ჩატვირთვა...", "მთლიანობის შემოწმება...", "სისტემა მზად არის"],
  ui: {
    system_build: "სისტემის ვერსია",
    reset_session_btn: "სესიის გადატვირთვა",
    status_report_title: "მდგომარეობის ანგარიში",
    module_label: "მოდული",
    progress_label: "პროგრესი",
    secured_label: "დაცულია",
    agree_terms_btn: "პირობებზე დათანხმება",
    mode_client: "კლიენტი",
    mode_pro: "სპეციალისტი",
    access_restricted: "წვდომა შეზღუდულია",
    decrypt_btn: "დეშიფრაცია",
    paste_code: "ჩასვით კოდი",
    evolution_title: "ევოლუცია",
    sessions_secured: "სესიები დასრულებულია",
    first_investigation_hint: "პირველი კვლევა მოგცემთ საბაზისო ხაზს",
    integrity_drift: "მთლიანობის დრეიფი",
    noise_tracking: "ხმაურის თრექინგი",
    evolution_insight_optimizing: "სისტემა ოპტიმიზირდება",
    evolution_insight_stabilizing: "სისტემა სტაბილიზირდება",
    evolution_insight_desc: "მონაცემები აჩვენებს ცვლილებების დინამიკას",
    copy_brief: "კოპირება",
    brief_copied: "დაკოპირდა",
    system_audit_title: "სისტემის აუდიტი",
    status_active: "აქტიური",
    status_expired: "ვადაგასული",
    upgrade_btn: "განახლება",
    skip_button: "გამოტოვება"
  },
  admin: {
    kernel: "ბირთვი",
    integrity: "მთლიანობა",
    billing: "ბილინგი",
    learning: "სწავლება",
    logs: "ლოგები",
    integrity_audit: "აუდიტი",
    license_key: "ლიცენზიის გასაღები",
    tier_label: "ლიცენზიის ტიპი",
    status_active: "აქტიური",
    status_expired: "ვადაგასული",
    upgrade_btn: "განახლება"
  },
  guide: {
    title: "სახელმძღვანელო",
    subtitle: "კლიენტებისთვის",
    sections: [
      { title: "როგორ მუშაობს", content: ["უპასუხეთ სწრაფად", "იყავით გულწრფელი", "მოუსმინეთ სხეულს"] }
    ],
    metaphor: "თქვენმა ქვეცნობიერმა იცის უმოკლესი გზა."
  },
  pro_guide: {
    title: "პრო-გაიდი",
    subtitle: "სპეციალისტებისთვის",
    sections: [
      { title: "ინტერპრეტაცია", content: ["აკონტროლეთ Entropy", "Foundation არის თქვენი მუშაობის საფუძველი", "NeuroSync აჩვენებს ცვლილებებისთვის მზაობას"] }
    ],
    closing: "Genesis OS პროფესიული ინსტრუმენტია."
  },
  brief_explainer: {
    title: "მოკლე ექსკურსი",
    subtitle: "სისტემის საფუძვლები",
    intro_title: "რა არის ეს?",
    intro_text: "ეს არის პროფესიული ფსიქოლოგიური სკრინინგის სისტემა.",
    blocks_title: "ბლოკები",
    archetype_label: "არქეტიპი",
    archetype_desc: "თქვენი დომინანტური ქცევის პატერნი.",
    metrics_title: "მეტრიკები",
    foundation_desc: "ბაზისური უსაფრთხოება და საყრდენები.",
    agency_desc: "ნება და ქმედითობის უნარი.",
    resource_desc: "თქვენი პოტენციალი და ტევადობა.",
    entropy_desc: "ხმაურისა და შფოთვის დონე სისტემაში.",
    neurosync_label: "ნეირო-სინქრონი",
    neurosync_desc: "კავშირი სხეულსა და გონებას შორის.",
    latency_label: "ლატენტურობა",
    latency_desc: "რეაქციის დრო სტიმულებზე.",
    combinations_title: "კომბინაციები",
    combinations_text: "მეტრიკები მუშაობენ ერთობლიობაში.",
    action_title: "ქმედება",
    action_text: "გამოიყენეთ შედეგები თერაპიისთვის.",
    limits_title: "შეზღუდვები",
    limits_text: "არ წარმოადგენს სამედიცინო დიაგნოზს.",
    closing: "თქვენი გზა გაცნობიერებულობისკენ აქ იწყება."
  },
  clinical_decoder: {
    somatic_dissonance_title: "სომატური დისონანსი",
    somatic_dissonance_desc: "გაწყვეტა ცნობიერ არჩევანსა და სხეულის რეაქციას შორის.",
    disclaimer: "მხოლოდ პროფესიული გამოყენებისთვის კვალიფიციური სპეციალისტის მიერ.",
    analysis_patterns: {
        god_mode_dissociation: "კომპენსატორული ზე-პროდუქტიულობა, როგორც ტრავმისგან დაცვა.",
        somatic_rebellion: "სხეული ჯანყდება ნებისყოფის წნეხის წინააღმდეგ.",
        naked_wire: "მაღალი მგრძნობელობა საყრდენების არარსებობისას.",
        frozen_will: "ნების პარალიზი მაღალი შინაგანი ხმაურის ფონზე.",
        intellectual_bypass: "გრძნობების ინტელექტუალური გვერდის ავლა.",
        resource_anxiety: "შფოთვა, გამოწვეული რესურსის ფლობით.",
        foundation_void: "ვაკუუმი ბაზისურ უსაფრთხოებაში.",
        manic_defense: "მანიაკალური დაცვა ჰიპერაქტიურობის მეშვეობით."
    },
    common_hypotheses: {
        anesthesia: { h: "ფუნქციური ანესთეზია", q: "რისი გრძნობა გიწყდებათ, როცა წარმატებული ხართ?" },
        functional_value: { h: "ფუნქციური თვითშეფასება", q: "ვინ ხართ თქვენი მიღწევების გარეშე?" },
        visibility_fear: { h: "ხილვადობის შიში", q: "რა მოხდება, თუ სხვები შეგამჩნევენ?" },
        adaptation_to_min: { h: "მინიმუმთან ადაპტაცია", q: "როგორ ისწავლეთ მცირედით გადარჩენა?" }
    },
    configs: {
        compensatory_overdrive: { title: "ზე-კომპენსაცია", desc: "სისტემა მუშაობს გადაწვაზე კონტროლის შესანარჩუნებლად." },
        critical_deficit: { title: "კრიტიკული დეფიციტი", desc: "სისტემა გამოფიტულია, საყრდენები დანგრეულია." },
        economy_mode: { title: "ეკონმიის რეჟიმი", desc: "ენერგიის მინიმალური ხარჯვა გადარჩენისთვის." },
        mobilization: { title: "მობილიზაცია", desc: "ახალი საყრდენებისა და რესურსების აქტიური ძიება." },
        chaotic: { title: "ქაოსი", desc: "გაურკვევლობის მაღალი დონე." },
        chaotic_creative: { title: "კრეატიული ქაოსი", desc: "შინაგანი მნიშვნელობების აქტიური გადაწყობა." },
        rigid: { title: "რიგიდულობა", desc: "სტრუქტურების ზედმეტი სიხისტე." }
    },
    headers: { mechanism: "ღრმა მექანიზმები" },
    sync_patterns: {
        coherent: "კოჰერენტულობა",
        dissociation: "დისოციაცია",
        honest_weakness: "გულწრფელი სისუსტე"
    },
    archetype_strategies: {
        THE_ARCHITECT: { strategy: "სტრუქტურირება", func: "წესრიგი", limit: "კონტროლი" },
        THE_DRIFTER: { strategy: "ადაპტაცია", func: "მოქნილობა", limit: "ბუნდოვანება" },
        THE_BURNED_HERO: { strategy: "თავგანწირვა", func: "გმირობა", limit: "გადაწვა" },
        THE_GOLDEN_PRISONER: { strategy: "დაგროვება", func: "სტაბილურობა", limit: "სტაგნაცია" },
        THE_CHAOS_SURFER: { strategy: "იმპროვიზაცია", func: "დრაივი", limit: "დეზორგანიზაცია" },
        THE_GUARDIAN: { strategy: "შენარჩუნება", func: "უსაფრთხოება", limit: "ცვლილებების შიში" }
    },
    risks: {
        burnout_blindness: "გადაწვის ნიშნების იგნორირება",
        normalization: "დეფიციტური მდგომარეობის ნორმალიზაცია",
        intellectualization: "უნაყოფო მსჯელობებში წასვლა",
        premature_action: "ნაადრევი ან იმპულსური ქმედება",
        role_play: "'კარგი კლიენტის' თამაში თერაპევტთან"
    },
    session_entries: {
        reality_check: "რეალობის შემოწმება და დამიწება.",
        decelerate: "შენელება და სუნთქვაზე ფოკუსი.",
        security_first: "პრიორიტეტი: უსაფრთხოების შექმნა.",
        body_focus: "სხეულთან კონტაქტის აღდგენა.",
        validate_deficit: "დეფიციტის აღიარება და ვალიდაცია."
    }
  },
  global: {
    back: "უკან",
    complete: "დასრულებულია",
    calibrating: "კალიბრაცია",
    calib_desc: "სისტემის სენსორების გასწორება.",
    skip_button: "გამოტოვება"
  },
  sync: {
    title: "Body Sync",
    desc: "სხეულებრივ შეგრძნებებთან სინქრონიზაცია.",
    s0: "ნეიტრალური",
    s1: "დაჭიმულობა / შეკუმშვა",
    s2: "სითბო / ენერგია",
    s3: "სიცივე / დაბუჟება",
    s4: "კანკალი / თრთოლვა",
    guidance_tip: "მოუსმინეთ თქვენს სხეულს ამ მომენტში.",
    processing: "სიგნალის დამუშავება..."
  },
  sensation_feedback: {
    s0: "სიგნალი მიღებულია",
    s1: "ბლოკი დაფიქსირდა",
    s2: "რესურსი გააქტიურდა",
    s3: "გაყინვა აღმოჩენილია",
    s4: "სისტემის აღგზნება"
  },
  domains: {
    foundation: "საყრდენები",
    agency: "ნება",
    money: "რესურსები",
    social: "სოციუმი",
    legacy: "მემკვიდრეობა"
  },
  dashboard: {
    desc: "სისტემა მზად არის ღრმა ანალიზისთვის.",
    insight_coherence: "სისტემის მაღალი კოჰერენტულობა.",
    insight_noise: "აღმოჩენილია ჭარბი ხმაური.",
    insight_somatic_dissonance: "დაფიქსირდა სომატური დისონანსი.",
    retest_ready: "მზადყოფნა განმეორებითი ტესტისთვის",
    retest_desc: "ახალი შეფასებისთვის საკმარისი დრო გავიდა.",
    select_domain: "აირჩიეთ დომენი",
    open_terminal: "ტერმინალი",
    manual_btn: "ინსტრუქცია"
  },
  results: {
    integrity: "მთლიანობა",
    neuro_sync: "ნეირო-სინქრონი",
    capacity: "ტევადობა",
    entropy: "ენტროპია",
    share_url: "https://genesis-os.app",
    share_button: "გაზიარება",
    back: "დაშბორდზე",
    disclaimer_title: "მნიშვნელოვანი შეტყობინება",
    disclaimer_body: "შედეგები საჭიროებს სპეციალისტის ინტერპრეტაციას. ეს არ არის დიაგნოზი.",
    brief_instruction: "გადაეცით ეს კოდი თქვენს სპეციალისტს.",
    copy_brief: "კოდის კოპირება",
    brief_copied: "კოდი დაკოპირდა",
    active_patterns_title: "აქტიური პატერნები",
    tap_to_decode: "დააჭირეთ დეშიფრაციისთვის",
    decoder_title: "სიგნალის დეკოდერი",
    signal_resistance: "წინააღმდეგობა",
    signal_resonance: "რეზონანსი",
    protection_label: "დაცვა",
    cost_label: "ფასი",
    antidote_label: "ანტიდოტი",
    origin_measured: "სისტემური გაზომვა",
    origin_reported: "კლიენტის რეპორტი",
    session_prep: "სესიისთვის მომზადება",
    session_prep_desc: "საკვანძო კითხვები თერაპიისთვის",
    status: "სისტემის სტატუსი"
  },
  phases: {
    SANITATION: "სანაცია",
    STABILIZATION: "სტაბილიზაცია",
    EXPANSION: "ექსპანსია"
  },
  tasks: {
      sanitation_1: "ლოიალობების აუდიტი",
      sanitation_2: "სომატური განტვირთვა",
      stabilization_1: "საზღვრები და საყრდენები",
      expansion_1: "ნების მასშტაბირება"
  },
  scenes: {
      "foundation_0": {
          title: "შესვლის წერტილი",
          desc: "მოულოდნელად იღებთ დიდ თანხას. პირველი შეგრძნება სხეულში?",
          c1: "დამალვის სურვილი (ლოიალობა)",
          c2: "დაბნეულობა (ავტოპილოტი)",
          c3: "მშვიდი მიღება (უფლება)"
      },
      "foundation_1": {
          title: "ხილვადობის საზღვარი",
          desc: "თქვენი წარმატების შესახებ ყველამ გაიგო. თქვენი პირველი აზრი?",
          c1: "შემშურდებათ (შიში)",
          c2: "თავი უნდა ვიმართლო (შრომა)",
          c3: "ეს ბუნებრივია (უფლება)"
      },
      "foundation_2": {
          title: "რესურსული ტევადობა",
          desc: "შემოგთავაზეს ოცნების პროექტი მაღალი რისკით. რეაქცია?",
          c1: "ზედმეტად სახიფათოა (დეფიციტი)",
          c2: "დავთანხმდები, მაგრამ ვიტანჯები (საზღვრები)",
          c3: "მივდივარ გაფართოებაზე (ტევადობა)"
      }
  },
  beliefs: {
    family_loyalty: "ოჯახური ლოიალობა",
    scarcity_mindset: "დეფიციტური აზროვნება",
    fear_of_punishment: "დასჯის შიში",
    imposter_syndrome: "თვითმარქვიას სინდრომი",
    poverty_is_virtue: "სიღარიბე როგორც სათნოება",
    hard_work_only: "მხოლოდ მძიმე შრომა",
    self_permission: "საკუთარი თავისთვის ნების დართვა",
    fear_of_conflict: "კონფლიქტის შიში",
    betrayal_trauma: "ღალატის ტრავმა",
    unconscious_fear: "ქვეცნობიერი შიში",
    money_is_danger: "ფული საფრთხეა",
    impulse_spend: "იმპულსური ხარჯვა",
    resource_toxicity: "რესურსის ტოქსიკურობა",
    short_term_bias: "მოკლევადიანი ხედვა",
    capacity_expansion: "ტევადობის გაფართოება",
    boundary_collapse: "საზღვრების კოლაფსი",
    shame_of_success: "წარმატების სირცხვილი",
    hero_martyr: "გმირი-წამებული",
    latency_resistance: "ლატენტური წინააღმდეგობა",
    body_mind_conflict: "კონფლიქტი სულისა და სხეულის კონფლიქტი",
    ambivalence_loop: "ამბივალენტობის მარყუჟი",
    autopilot_mode: "ავტოპილოტი",
    golden_cage: "ოქროს გალია",
    money_is_tool: "ფული როგორც ინსტრუმენტი",
    default: "გამოტოვება"
  },
  explanations: {
      latency: "დრო, რომელიც ფსიქიკას სჭირდება სტიმულის დასამუშავებლად.",
      resonance: "კოგნიტური პასუხისა და სხეულებრივი იმპულსის თანხვედრა."
  },
  pattern_library: {
    default: { protection: "სტაბილურობა", cost: "სტაგნაცია", antidote: "მოძრაობა" },
    family_loyalty: { protection: "გვარისადმი კუთვნილება ბედის გამეორებით", cost: "პირად ბედნიერებაზე აკრძალვა", antidote: "მე ვირჩევ ჩემს ცხოვრებას თქვენი პატივისცემით." },
  },
  archetypes: {
    THE_ARCHITECT: { title: "არქიტექტორი", desc: "აშენებს სისტემებსა და სტრუქტურებს.", quote: "წესრიგი სისტემაში — წესრიგი ცხოვრებაში.", superpower: "სტრუქტურირება", shadow: "რიგიდულობა" },
    THE_DRIFTER: { title: "მოხეტიალე", desc: "ეძებს გზას მიჯაჭვულობის გარეშე.", quote: "გზა მიმავალს ემორჩილება.", superpower: "ძიება", shadow: "არასტაბილურობა" },
    THE_BURNED_HERO: { title: "გადამწვარი გმირი", desc: "გადაარჩინა ყველა საკუთარი რესურსის ფასად.", quote: "ყველაფერს თავად გავაკეთებ, ნებისმიერ ფასად.", superpower: "თავდადება", shadow: "გამოფიტვა" },
    THE_GOLDEN_PRISONER: { title: "ოქროს ტყვე", desc: "ჩაკეტილია კომფორტში, ეშინია სტაბილურობის დაკარგვის.", quote: "აქ კარგია, მაგრამ ძალიან ვიწრო.", superpower: "სტაბილურობა", shadow: "სტაგნაცია" },
    THE_CHAOS_SURFER: { title: "ქაოსის სერფერი", desc: "მართავს გაურკვევლობას ინტუიციით.", quote: "დაიჭირე ტალღა, სანამ ის არის.", superpower: "მოქნილობა", shadow: "დეზორგანიზაცია" },
    THE_GUARDIAN: { title: "მცველი", desc: "იცავს არსებულ საზღვრებსა და ღირებულებებს.", quote: "არცერთი ნაბიჯი უკან იმისგან, რაც გვაქვს.", superpower: "დაცვა", shadow: "იზოლაცია" }
  },
  verdicts: {
    HEALTHY_SCALE: { label: "ჯანსაღი ბალანსი", impact: "სისტემა რესურსულ მდგომარეობაშია." },
    CRITICAL_DEFICIT: { label: "კრიტიკული დეფიციტი", impact: "სისტემური ჩავარდნის მაღალი რისკი." },
    BRILLIANT_SABOTAGE: { label: "ბრწყინვალე საბოტაჟი", impact: "ფარული წინააღმდეგობა ზრდისადმი." },
    INVISIBILE_CEILING: { label: "უხილავი ჭერი", impact: "მასშტაბის შეზღუდვა." },
    LEAKY_BUCKET: { label: "გახვრეტილი ვედრო", impact: "რესურსის კარგვა შფოთვის გამო." },
    PARALYZED_GIANT: { label: "პარალიზებული გიგანტი", impact: "დიდი პოტენციალი ნების გარეშე." },
    FROZEN_POTENTIAL: { label: "გაყინული პოტენციალი", impact: "სტაგნაცია ყველა დონეზე." }
  },
  metric_definitions: {
    foundation: "თქვენი შინაგანი უსაფრთხოება და საყრდენები.",
    integrity: "სისტემის საერთო მთლიანობა და მდგრადობა."
  },
  conflicts: {
      foundation_agency: "უსაფრთხოებისა და ქმედების კონფლიქტი",
      agency_resource: "ნებისა და ტევადობის კონფლიქტი"
  },
  system_commentary: ["სიგნალი სტაბილურია", "ლატენტურობის ანალიზი გრძელდება", "აღმოჩენილია წინააღმდეგობის პატერნი"],
  auth_hint: "გამოიყენეთ თქვენი წვდომის გასაღები მონაცემთა დეშიფრაციისთვის.",
  legal_disclaimer: "Genesis OS v3.0 // მხოლოდ პროფესიული გამოყენებისთვის.",
  safety: {
      alert: "ყურადღება: საყრდენების კრიტიკული დეფიციტი."
  },
  session_prep_templates: {
      low_foundation_pattern: "როგორ მოქმედებს პატერნი '{{pattern}}' თქვენს უსაფრთხოების განცდაზე?",
      low_foundation_generic: "რა არის თქვენი მთავარი საყრდენი ამჟამად?",
      conflict: "როგორ გრძნობთ კონფლიქტს {{metric1}}-სა და {{metric2}}-ს შორის?",
      somatic_dissonance: "თქვენი სხეული რეაგირებს '{{pattern}}'-ზე დაჭიმულობით. რაზეა ეს სიგნალი?",
      pattern_interaction: "როგორ აძლიერებს '{{pattern1}}' '{{pattern2}}'-ს თქვენს ცხოვრებაში?",
      default_latency: "ჩვენ შევამჩნიეთ დაყოვნება თქვენი არქეტიპის ჩრდილოვან მხარეზე ({{archetype_shadow}}). რა იმალება იქ?",
      default_archetype: "თქვენი არქეტიპი ავლენს ჩრდილოვან მხარეს: {{archetype_shadow}}. როგორ უშლის ეს ხელს პროგრესს?",
      default_verdict: "თქვენი ვერდიქტია '{{verdict_impact}}'. რით გსურთ საუბრის დაწყება?"
  },
  synthesis_categories: {},
  synthesis: {},
  interventions: {},
  directives: {},
  interferences: {},
  correlation_types: {},
  integrity_audit: {}
};

export const translations: Record<string, Translations> = { ru, ka };
