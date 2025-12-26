
import { AnalysisResult, ClinicalNarrative, ArchetypeKey, BeliefKey, SessionStep } from '../types';
import { translations } from '../translations';

type Lang = 'ru' | 'ka';

// --- DICTIONARIES (NARRATIVE DB) ---

const LABELS = {
  ru: {
    intro: "🧬 GENESIS OS // CLINICAL DECODE REPORT",
    status_crit: "КОМПЕНСАТОРНЫЙ ФОРСАЖ",
    status_surv: "РЕЖИМ ВЫЖИВАНИЯ (ДЕКОМПЕНСАЦИЯ)",
    status_hib: "АДАПТИВНАЯ КОНСЕРВАЦИЯ",
    status_bal: "СБАЛАНСИРОВАННЫЙ ПОТОК (ИНТЕГРАЦИЯ)",
    status_manic: "МАНИАКАЛЬНАЯ ЗАЩИТА (БЕГСТВО)",
    sec1: "1. ГИПОТЕЗА КОНФИГУРАЦИИ",
    sec2: "2. ГИПОТЕЗА СОМАТИЧЕСКОГО СТАТУСА",
    sec3: "3. АРХЕТИПИЧЕСКАЯ СТРАТЕГИЯ",
    sec4: "4. КЛЮЧЕВЫЕ ГИПОТЕЗЫ ДЛЯ СЕССИИ",
    sec5: "5. ВЕРОЯТНЫЕ АКТИВНЫЕ ПАТТЕРНЫ",
    sec6: "6. РЕКОМЕНДОВАННЫЙ ПРОТОКОЛ",
    sec_resistance: "7. ГИПОТЕЗА СОПРОТИВЛЕНИЯ",
    sec_behavior: "8. ВОЗМОЖНЫЕ МАРКЕРЫ В ПОВЕДЕНИИ",
    sec_systemic: "9. ГИПОТЕЗА СИСТЕМНОГО КОРНЯ",
    sec_alliance: "10. РЕКОМЕНДАЦИЯ ПО АЛЬЯНСУ",
    sec_shadow_contract: "11. ТЕНЕВАЯ ГИПОТЕЗА",
    superpower: "Ресурс",
    shadow: "Риск",
    mind: "Когнитивный контур",
    body: "Соматический контур",
    catch: "Клиническая суть",
    hypo_intro: "Следующие гипотезы сформированы на основе выявленных противоречий:",
    disclaimer: "⚠️ DANGER: Этот отчет является инструментом навигации для специалиста. Не использовать для самодиагностики без супервизии."
  },
  ka: {
    intro: "🧬 GENESIS OS // CLINICAL DECODE REPORT",
    status_crit: "კომპენსატორული ფორსაჟი",
    status_surv: "გადარჩენის რეჟიმი (დეკომპენსაცია)",
    status_hib: "ადაპტური კონსერვაცია",
    status_bal: "დაბალანსებული ნაკადი (ინტეგრაცია)",
    status_manic: "მანიაკალური დაცვა (გაქცევა)",
    sec1: "1. კონფიგურაციის ჰიპოთეზა",
    sec2: "2. სომატური სტატუსის ჰიპოთეზა",
    sec3: "3. არქეტიპული სტრატეგია",
    sec4: "4. ძირითადი ჰიპოთეზები სესიისთვის",
    sec5: "5. სავარაუდო აქტიური პატერნები",
    sec6: "6. რეკომენდებული პროტოკოლი",
    sec_resistance: "7. წინააღმდეგობის ჰიპოთეზა",
    sec_behavior: "8. შესაძლო მარკერები ქცევაში",
    sec_systemic: "9. სისტემური ფესვის ჰიპოთეზა",
    sec_alliance: "10. ალიანსის რეკომენდაცია",
    sec_shadow_contract: "11. ჩრდილოვანი ჰიპოთეზა",
    superpower: "რესურსი",
    shadow: "რისკი",
    mind: "კოგნიტური კონტური",
    body: "სომატური კონტური",
    catch: "კლინიკური არსი",
    hypo_intro: "შემდეგი ჰიპოთეზები ჩამოყალიბებულია გამოვლენილი წინააღმდეგობების საფუძველზე:",
    disclaimer: "⚠️ DANGER: ეს რეპორტი არის ნავიგაციის ინსტრუმენტი სპეციალისტისთვის."
  }
};

const PROFILES = {
  ru: {
    compensatory_overdrive: {
      name: "Компенсаторный Форсаж",
      intro: "Гипотеза: Клиент демонстрирует экстремальную эффективность за счет подавления аффекта. Это может быть защитным механизмом, а не признаком ресурса.",
      mechanism: "Гипотеза: Энергия тревоги конвертируется в навязчивое действие. Нулевая энтропия может указывать на ригидность, а не на здоровье.",
      somatic: "Возможно, тело воспринимается как инструмент. Стоит проверить наличие жалоб на внезапные 'отключения' или психосоматику без предвестников.",
      therapy_focus: "Направление для исследования: Легализация слабости и права на ошибку. Поиск доступа к вытесненной части личности.",
      resistance: "Гипотеза сопротивления: Интеллектуализация. Проверьте, не склонен ли клиент объяснять чувства вместо их проживания. Возможно обесценивание через 'это неэффективно'.",
      behavior: "Возможные маркеры: Быстрый темп речи, ригидная поза, отсутствие пауз. Может игнорировать вопросы о телесных ощущениях.",
      systemic: "Системная гипотеза: Могла быть функция 'Героя семьи'. Проверьте лояльность родителю, который требовал результатов, но не давал тепла.",
      alliance: "Рекомендация по альянсу: Недирективное партнерство. Важно не вступать в конкуренцию. Использовать метафоры 'механизма', который нуждается в техобслуживании.",
      shadow_contract: "Теневая гипотеза: «Возможно, клиент бессознательно просит: 'Помогите мне работать еще эффективнее и никогда не чувствовать боль'»."
    },
    survival: {
      name: "Структурный Дефицит (Выживание)",
      intro: "Состояние острого дефицита базовой безопасности. Психика работает в аварийном режиме, блокируя любую активность, не связанную с выживанием.",
      mechanism: "Регрессия к базовым защитам. Низкий Foundation (<35) делает невозможным опираться на прошлый опыт. Тревога поглощает весь ресурс.",
      somatic: "Ощущение 'оголенного нерва', поверхностное дыхание, гипертонус плечевого пояса.",
      therapy_focus: "Контейнирование тревоги. Восстановление режима сна/еды. Работа с 'Внутренним Ребенком' (безопасность).",
      resistance: "Аффективное затопление (Flooding). Клиент может быть переполнен эмоциями и неспособен к когнитивной работе. Или уход в болезнь.",
      behavior: "Бегающий взгляд, суетливые движения рук, сбивчивое дыхание, частая смена темы. Ощущение хрупкости в контакте.",
      systemic: "Идентификация с 'Жертвой' или исключенным членом системы. Несущий симптом тревоги за всю систему.",
      alliance: "Материнская/Опекающая позиция. Клиенту нужен 'хороший родитель', который скажет, что мир безопасен. Избегать конфронтации.",
      shadow_contract: "«Спасите меня, потому что я сам не справляюсь. Возьмите ответственность за мою жизнь»."
    },
    hibernation: {
      name: "Адаптивная Гибернация (Замирание)",
      intro: "Режим 'Low-Power'. Клиент сбалансирован, но на минимальных оборотах. Отсутствие острых конфликтов достигнуто за счет отказа от желаний.",
      mechanism: "Экономия ресурса. Система 'схлопнулась' до ядра, чтобы пережить неблагоприятный период. Это не депрессия, а активное ожидание (Wait-state).",
      somatic: "Ощущение ватности, замедленность, отсутствие импульса, 'стеклянный купол'. Сниженная чувствительность.",
      therapy_focus: "Валидация права на отдых. Запрет на 'достигаторство'. Поиск микродвижений (что вызывает хоть какой-то интерес?).",
      resistance: "Пассивная агрессия в форме 'Да, но...'. Саботаж домашних заданий через 'забыл' или 'не было сил'. Молчание в сессии.",
      behavior: "Тихий голос, замедленные реакции, отсутствие жестикуляции, поза 'эмбриона' (свернутость). Взгляд расфокусирован.",
      systemic: "Лояльность 'неживым' предкам или депрессивному родителю. Запрет быть живее, чем мама/папа.",
      alliance: "Валидирующее зеркало. Необходимо 'разрешить' клиенту его состояние, чтобы снизить вину. Избегать роли 'Мотивационного тренера'.",
      shadow_contract: "«Скажите мне, что со мной все в порядке и можно ничего не менять»."
    },
    manic: {
      name: "Маниакальная Защита (Бегство)",
      intro: "Высокая активность (Agency) при отсутствии опоры (Foundation). Клиент 'бежит по тонкому льду', чтобы не провалиться в тревогу.",
      mechanism: "Отыгрывание (Acting out). Действие используется как способ не чувствовать пустоту или боль. Риск внезапного обрушения.",
      somatic: "Суетливость, невозможность усидеть на месте, быстрый темп речи, игнорирование голода/боли.",
      therapy_focus: "Замедление (Deceleration). Конфронтация с избегаемой болью в безопасной среде.",
      resistance: "Забалтывание. Клиент генерирует столько контента, что терапевт не успевает вставить слово. Обесценивание медленных процессов.",
      behavior: "Чрезмерная экспрессия, быстрые переключения, неспособность выдержать паузу. Смех там, где должно быть больно.",
      systemic: "Замещающий ребенок или 'Праздничный ребенок'. Функция - развлекать систему, чтобы не видеть трагедию.",
      alliance: "Твердые границы (Контейнер). Терапевт должен быть 'скалой', об которую можно замедлиться. Возвращение к реальности.",
      shadow_contract: "«Восхищайтесь мной и моим темпом, но не заставляйте меня смотреть вниз»."
    },
    balanced: {
      name: "Интегрированная Устойчивость",
      intro: "Профиль 'Осознанная Компетентность'. Клиент обладает достаточными ресурсами для глубокой трансформационной работы.",
      mechanism: "Зрелые защиты (сублимация, юмор). Способность выдерживать амбивалентность.",
      somatic: "Хороший контакт с телом. Способность различать нюансы ощущений.",
      therapy_focus: "Работа с экзистенциальными смыслами, масштабирование, тонкая настройка.",
      resistance: "Зрелое сопротивление: прямой отказ идти в тему, честное признание 'не готов'.",
      behavior: "Конгруэнтность позы и речи. Спокойное дыхание. Способность выдерживать зрительный контакт.",
      systemic: "Выход из переплетений. Клиент начинает жить свою судьбу, что может вызывать вину перед системой.",
      alliance: "Коучинг/Партнерство. Работа на равных. Исследование зон ближайшего развития.",
      shadow_contract: "«Помогите мне найти смысл там, где я уже все построил»."
    }
  },
  ka: {
    compensatory_overdrive: {
      name: "კომპენსატორული ფორსაჟი",
      intro: "ჰიპოთეზა: კლიენტი აჩვენებს ექსტრემალურ ეფექტურობას აფექტის დათრგუნვის ხარჯზე.",
      mechanism: "ჰიპოთეზა: შფოთვის ენერგია გარდაიქმნება ქმედებად.",
      somatic: "შესაძლოა, სხეული აღიქმება როგორც ინსტრუმენტი.",
      therapy_focus: "მიმართულება კვლევისთვის: სისუსტისა და შეცდომის უფლების ლეგალიზაცია.",
      resistance: "წინააღმდეგობის ჰიპოთეზა: ინტელექტუალიზაცია.",
      behavior: "შესაძლო მარკერები: სწრაფი საუბარი, რიგიდული პოზა.",
      systemic: "სისტემური ჰიპოთეზა: შესაძლოა 'ოჯახის გმირის' ფუნქცია.",
      alliance: "ალიანსის რეკომენდაცია: არადირექტიული პარტნიორობა.",
      shadow_contract: "ჩრდილოვანი ჰიპოთეზა: «შესაძლოა, კლიენტი ითხოვს: 'დამეხმარეთ უფრო ეფექტურად ვიმუშაო და ტკივილი არ ვიგრძნო'»."
    },
    survival: {
      name: "სტრუქტურული დეფიციტი",
      intro: "უსაფრთხოების მწვავე დეფიციტი.",
      mechanism: "რეგრესია.",
      somatic: "გაშიშვლებული ნერვი.",
      therapy_focus: "უსაფრთხოების აღდგენა.",
      resistance: "აფექტური დატბორვა.",
      behavior: "მოუსვენრობა, არეული სუნთქვა.",
      systemic: "მსხვერპლთან იდენტიფიკაცია.",
      alliance: "მზრუნველი მშობელი.",
      shadow_contract: "«გადამარჩინეთ, მე თვითონ არ შემიძლია»."
    },
    hibernation: {
      name: "ადაპტური ჰიბერნაცია",
      intro: "Low-Power რეჟიმი.",
      mechanism: "რესურსის ეკონომია.",
      somatic: "სიმძიმე, შენელება.",
      therapy_focus: "დასვენების უფლება.",
      resistance: "პასიური აგრესია.",
      behavior: "ჩუმი ხმა, შენელებული რეაქციები.",
      systemic: "ლოიალობა დეპრესიულ მშობელთან.",
      alliance: "ვალიდაცია.",
      shadow_contract: "«მითხარით, რომ ყველაფერი რიგზეა»."
    },
    manic: {
      name: "მანიაკალური დაცვა",
      intro: "აქტივობა საყრდენის გარეშე.",
      mechanism: "Acting out.",
      somatic: "აჩქარება.",
      therapy_focus: "შენელება.",
      resistance: "გადალაპარაკება.",
      behavior: "ექსპრესია, პაუზის ვერ ატანა.",
      systemic: "შემცვლელი ბავშვი.",
      alliance: "მყარი საზღვრები.",
      shadow_contract: "«აღფრთოვანდით ჩემით, ოღონდ არ გამაჩეროთ»."
    },
    balanced: {
      name: "ინტეგრირებული მდგრადობა",
      intro: "გააზრებული კომპეტენცია.",
      mechanism: "მომწიფებული დაცვები.",
      somatic: "კარგი კონტაქტი.",
      therapy_focus: "ეგზისტენციალური აზრები.",
      resistance: "პირდაპირი უარი.",
      behavior: "კონგრუენტულობა.",
      systemic: "გადახლართვებისგან გამოსვლა.",
      alliance: "პარტნიორობა.",
      shadow_contract: "«დამეხმარეთ აზრის პოვნაში»."
    }
  }
};

const SYNC_CONFIGS = {
  ru: {
    high: { title: "Резонанс", desc: "Высокая конгруэнтность. Тело и сознание говорят на одном языке. Сопротивление минимально." },
    mid: { title: "Фоновый Шум", desc: "Умеренный рассинхрон. Клиент слышит сигналы тела, но часто выбирает 'надо' вместо 'хочу'." },
    low: { title: "Диссоциация", desc: "Разрыв связи. Клиент живет в голове, тело объективировано и подавлено." },
    crit: { title: "Соматический Конфликт", desc: "Активное подавление телесных импульсов. Высокий риск психосоматики." }
  },
  ka: {
    high: { title: "რეზონანსი", desc: "მაღალი კონგრუენტობა." },
    mid: { title: "ფონური ხმაური", desc: "ზომიერი დისბალანსი." },
    low: { title: "დისოციაცია", desc: "კავშირის გაწყვეტა." },
    crit: { title: "სომატური კონფლიქტი", desc: "სხეულის იმპულსების აქტიური დათრგუნვა." }
  }
};

// --- LOGIC HELPERS ---

function getProfileKey(state: { foundation: number; agency: number; resource: number; entropy: number }): keyof typeof PROFILES.ru {
  if (state.agency >= 85 && state.resource >= 85 && state.entropy <= 15) return 'compensatory_overdrive';
  if (state.foundation <= 35) return 'survival'; 
  if (state.foundation < 50 && state.agency < 50 && state.resource < 55) return 'hibernation';
  if (state.agency > 80 && state.foundation < 40) return 'manic';
  return 'balanced';
}

function getSyncLevel(sync: number): keyof typeof SYNC_CONFIGS.ru {
  if (sync >= 85) return 'high';
  if (sync >= 65) return 'mid';
  if (sync >= 45) return 'low';
  return 'crit';
}

function getSessionFlow(profileKey: string, lang: Lang): SessionStep[] {
    const flows: Record<string, SessionStep[]> = {
        compensatory_overdrive: [
            { phase: 'ENTRY', title: lang === 'ru' ? 'Снижение темпа' : 'ტემპის დაგდება', action: lang === 'ru' ? '2 минуты молчания. Проверка: не пытается ли клиент "развлекать" терапевта?' : '2 წუთი სიჩუმე.' },
            { phase: 'DECONSTRUCTION', title: lang === 'ru' ? 'Работа с телом' : 'სხეულთან მუშაობა', action: lang === 'ru' ? 'Фокус на дыхании и ощущениях. Вопрос: "Что, если позволить себе быть неэффективным прямо сейчас?"' : 'ფოკუსი სუნთქვაზე.' },
            { phase: 'INTEGRATION', title: lang === 'ru' ? 'Легализация чувств' : 'გრძნობების ლეგალიზაცია', action: lang === 'ru' ? 'Связать телесные сигналы с подавленными эмоциями (усталость, грусть).' : 'სხეულის სიგნალების დაკავშირება ემოციებთან.' }
        ],
        survival: [
            { phase: 'ENTRY', title: lang === 'ru' ? 'Создание безопасности' : 'უსაფრთხოების შექმნა', action: lang === 'ru' ? 'Техники заземления. Установить границы сессии. Валидация всех чувств.' : 'დამიწების ტექნიკები.' },
            { phase: 'STABILIZATION', title: lang === 'ru' ? 'Поиск ресурсов' : 'რესურსების ძიება', action: lang === 'ru' ? 'Вопрос: "Что помогало вам выживать до сих пор?" Работа с "безопасным местом".' : 'კითხვა: რა გეხმარებოდათ აქამდე?' },
            { phase: 'INTEGRATION', title: lang === 'ru' ? 'Малые шаги' : 'მცირე ნაბიჯები', action: lang === 'ru' ? 'Определить одно маленькое действие для восстановления контроля.' : 'კონტროლის აღდგენის ერთი ქმედება.' }
        ],
        hibernation: [
            { phase: 'ENTRY', title: lang === 'ru' ? 'Валидация паузы' : 'პაუზის ვალიდაცია', action: lang === 'ru' ? 'Нормализовать состояние "замирания". Снять вину за "ничегонеделание".' : 'გაყინვის მდგომარეობის ნორმალიზება.' },
            { phase: 'EXPLORATION', title: lang === 'ru' ? 'Исследование желаний' : 'სურვილების კვლევა', action: lang === 'ru' ? 'Работа с образами. "Если бы у вас была волшебная палочка...". Без обязательств.' : 'წარმოსახვითი მუშაობა.' },
            { phase: 'INTEGRATION', title: lang === 'ru' ? 'Микро-импульс' : 'მიკრო-იმპულსი', action: lang === 'ru' ? 'Найти одно действие, которое вызывает 0.1% интереса и разрешить его.' : 'ერთი მოქმედება, რომელიც იწვევს 0.1% ინტერესს.' }
        ],
        manic: [
            { phase: 'ENTRY', title: lang === 'ru' ? 'Замедление' : 'შენელება', action: lang === 'ru' ? 'Предложить говорить в 2 раза медленнее. Наблюдать за дыханием.' : '2-ჯერ ნელა საუბარი.' },
            { phase: 'CONFRONTATION', title: lang === 'ru' ? 'Контакт с пустотой' : 'სიცარიელესთან კონტაქტი', action: lang === 'ru' ? 'Вопрос: "От чего вы так быстро бежите?". Выдерживать паузы.' : 'კითხვა: რას გაურბიხართ?' },
            { phase: 'INTEGRATION', title: lang === 'ru' ? 'Оплакивание' : 'გლოვა', action: lang === 'ru' ? 'Дать пространство для грусти/боли, которую маскировала активность.' : 'სევდისთვის სივრცის მიცემა.' }
        ],
        balanced: [
            { phase: 'ENTRY', title: lang === 'ru' ? 'Контракт на глубину' : 'სიღრმის კონტრაქტი', action: lang === 'ru' ? 'Определить экзистенциальный запрос. "Что за пределами того, что уже работает?"' : 'ეგზისტენციალური მოთხოვნის განსაზღვრა.' },
            { phase: 'EXPLORATION', title: lang === 'ru' ? 'Работа с Тенью' : 'ჩრდილთან მუშაობა', action: lang === 'ru' ? 'Исследование качеств, которые клиент осуждает в других.' : 'სხვაში დაგმობილი თვისებების კვლევა.' },
            { phase: 'INTEGRATION', title: lang === 'ru' ? 'Масштабирование' : 'მასშტაბირება', action: lang === 'ru' ? 'Интеграция теневых аспектов для нового уровня целостности и влияния.' : 'ჩრდილოვანი ასპექტების ინტეგრაცია.' }
        ]
    };
    return flows[profileKey] || flows.balanced;
}

function getArchetypeAnalysis(archetypeKey: ArchetypeKey, t: any, lang: Lang): string {
    const arch = t.archetypes[archetypeKey];
    return `СТРАТЕГИЯ: ${arch.title}. ${arch.desc}\n- ${LABELS[lang].superpower}: ${arch.superpower}\n- ${LABELS[lang].shadow}: ${arch.shadow}`;
}

function getActivePatterns(patterns: BeliefKey[], t: any, lang: Lang): string {
    if (patterns.length === 0) return "Ключевые паттерны не выявлены.";
    return patterns.map(p => `- ${t.beliefs[p]}: ${t.pattern_library[p].protection}`).join('\n');
}

function getVerdict(verdictKey: any, t: any, lang: Lang): string {
    const v = t.verdicts[verdictKey];
    return `ГИПОТЕЗА: ${v.label}. ${v.description}\n${LABELS[lang].catch}: ${v.impact}`;
}

function getSystemicRoot(profile: any, lang: Lang): string {
    return profile.systemic;
}

function getRiskAssessment(profile: any, lang: Lang): string[] {
    const risks = [];
    if (profile.name.includes("Выживание")) risks.push("Риск декомпенсации и срыва адаптации.");
    if (profile.name.includes("Диссоциация")) risks.push("Риск внезапного соматического сбоя.");
    if (profile.name.includes("Маниакальная")) risks.push("Риск выгорания и импульсивных решений.");
    risks.push(profile.resistance);
    return risks;
}

function getTherapeuticEntry(profile: any, lang: Lang): string {
    return profile.therapy_focus;
}


// --- NARRATIVE GENERATOR ---

// FIX: Added 'export' to make the function accessible from other modules.
export function generateClinicalNarrative(result: AnalysisResult, lang: Lang): ClinicalNarrative {
    const t = translations[lang];
    const L = LABELS[lang];
    const { state, neuroSync, archetypeKey, activePatterns, verdictKey, flags } = result;
    
    const profileKey = getProfileKey(state);
    const profile = PROFILES[lang][profileKey];

    const syncLevel = getSyncLevel(neuroSync);
    const sync = SYNC_CONFIGS[lang][syncLevel];
    
    const sessionFlow = getSessionFlow(profileKey, lang);

    // LEVEL 1: Brief Client Narrative
    const clientBrief = {
        title: L.intro,
        statusTag: profile.name,
        summary: profile.intro,
        focusQuestion: profile.therapy_focus,
        tone: (profileKey === 'survival' || profileKey === 'manic') ? 'alert' as const : 'supportive' as const,
        recommendation: profile.therapy_focus,
    };

    // LEVEL 2: Full Clinical Narrative
    const fullNarrative = {
        introduction: L.intro,
        generalConfig: `${L.sec1}: ${profile.name}. ${profile.intro}`,
        deepAnalysis: profile.mechanism,
        archetypeAnalysis: getArchetypeAnalysis(archetypeKey, t, lang),
        clinicalHypotheses: `${L.hypo_intro}\n- ${profile.therapy_focus}`,
        activePatterns: getActivePatterns(activePatterns, t, lang),
        verdictAndRecommendations: getVerdict(verdictKey, t, lang),
        resistanceProfile: profile.resistance,
        behavioralMarkers: profile.behavior,
        systemicRoot: getSystemicRoot(profile, lang),
        therapeuticAlliance: profile.alliance,
        shadowContract: profile.shadow_contract,
        sessionFlow: sessionFlow,
        clinicalProfile: `F:${Math.round(state.foundation)} A:${Math.round(state.agency)} R:${Math.round(state.resource)} E:${Math.round(state.entropy)} | SYNC:${neuroSync}%`,
        mechanismAnalysis: [profile.mechanism],
        somaticMarkers: profile.somatic,
        riskAssessment: getRiskAssessment(profile, lang),
        therapeuticEntry: getTherapeuticEntry(profile, lang),
    };

    // FIX: Added return statement to satisfy the function's return type 'ClinicalNarrative'.
    return {
        level1: clientBrief,
        level2: fullNarrative,
    };
}