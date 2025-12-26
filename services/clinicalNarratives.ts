
import { AnalysisResult, ClinicalNarrative, SystemicVector, Intervention } from '../types';
import { translations } from '../translations';

type Lang = 'ru' | 'ka';

const INTERVENTION_LIBRARY: Record<Lang, {
    systemic: Intervention[];
    confrontation: Intervention[];
    paradox: Intervention[];
    support: Intervention[];
}> = {
    ru: {
        systemic: [
            { type: 'SYSTEMIC_ORDER', text: "Я — это я, а вы — это вы. Я оставляю вам вашу судьбу.", purpose: "Разрыв патологической лояльности." },
            { type: 'SYSTEMIC_ORDER', text: "Я даю место вашей боли, но я больше не буду платить за нее своей жизнью.", purpose: "Снятие идентификации с жертвой." },
            { type: 'SYSTEMIC_ORDER', text: "Мама, папа, пожалуйста, посмотрите на меня с любовью, если я буду богаче вас.", purpose: "Снятие вины за успех." }
        ],
        confrontation: [
            { type: 'CONFRONTATION', text: "Похоже, ваша эффективность — это способ не чувствовать, как вам страшно.", purpose: "Вскрытие компенсации." },
            { type: 'CONFRONTATION', text: "Что будет, если вы перестанете спасать этого терапевта своими хорошими ответами?", purpose: "Работа с переносом." }
        ],
        paradox: [
            { type: 'PARADOX', text: "Попробуйте на этой неделе саботировать свой успех еще эффективнее.", purpose: "Легализация сопротивления." }
        ],
        support: [
            { type: 'SUPPORT', text: "Я вижу твою усталость. Ты не должен справляться в одиночку прямо сейчас.", purpose: "Валидация дефицита." }
        ]
    },
    ka: {
        systemic: [
            { type: 'SYSTEMIC_ORDER', text: "მე მე ვარ, თქვენ კი თქვენ ხართ. მე გიტოვებთ თქვენს ბედს.", purpose: "პათოლოგიური ლოიალობის გაწყვეტა." }
        ],
        confrontation: [
            { type: 'CONFRONTATION', text: "როგორც ჩანს, თქვენი ეფექტურობა გზაა იმისათვის, რომ არ იგრძნოთ შიში.", purpose: "კომპენსაციის გახსნა." }
        ],
        paradox: [
            { type: 'PARADOX', text: "სცადეთ ამ კვირაში კიდევ უფრო ეფექტურად მოახდინოთ თქვენი წარმატების საბოტაჟი.", purpose: "წინააღმდეგობის ლეგალიზაცია." }
        ],
        support: [
            { type: 'SUPPORT', text: "მე ვხედავ შენს დაღლილობას.", purpose: "ვალიდაცია." }
        ]
    }
};

export function generateClinicalNarrative(result: AnalysisResult, lang: Lang): ClinicalNarrative {
    const t = translations[lang];
    const { state, neuroSync, activePatterns, archetypeKey } = result;

    // --- SYSTEMIC VECTOR CALCULATION ---
    const systemicVectors: SystemicVector[] = [];
    if (activePatterns.includes('family_loyalty') || state.foundation < 45) {
        systemicVectors.push({ 
            origin: 'SYSTEMIC', 
            strength: activePatterns.includes('family_loyalty') ? 92 : 65, 
            description: lang === 'ru' ? "Лояльность родовому сценарию дефицита." : "სისტემური ლოიალობა." 
        });
    }
    if (state.foundation < 35) {
        systemicVectors.push({ 
            origin: 'MATERNAL', 
            strength: 85, 
            description: lang === 'ru' ? "Дефицит базовой безопасности (материнский объект)." : "ბაზისური ნდობის დეფიციტი." 
        });
    }
    if (state.agency > 80 && state.foundation < 40) {
        systemicVectors.push({ 
            origin: 'PATERNAL', 
            strength: 75, 
            description: lang === 'ru' ? "Поиск признания через сверх-достижения." : "აღიარების ძიება მიღწევებით." 
        });
    }

    // --- INTERVENTION SELECTION ---
    const interventions: Intervention[] = [];
    const lib = INTERVENTION_LIBRARY[lang];
    
    if (state.agency > 85 && state.foundation < 40) interventions.push(lib.confrontation[0]);
    if (activePatterns.includes('family_loyalty')) interventions.push(lib.systemic[1]);
    if (activePatterns.includes('poverty_is_virtue')) interventions.push(lib.systemic[2]);
    if (state.entropy > 50) interventions.push(lib.paradox[0]);
    if (state.foundation < 30) interventions.push(lib.support[0]);

    // Ensure we always have at least 2 interventions
    if (interventions.length < 2) interventions.push(lib.systemic[0]);

    // --- DIFFERENTIAL HYPOTHESES ---
    const diffMap = [
        { label: lang === 'ru' ? "Аффективная диссоциация" : "აფექტური დისოციაცია", prob: neuroSync < 45 ? 0.85 : 0.15 },
        { label: lang === 'ru' ? "Нарциссическое расширение" : "ნარცისული გაფართოება", prob: state.agency > 85 ? 0.75 : 0.1 },
        { label: lang === 'ru' ? "Маниакальная защита" : "მანიაკალური დაცვა", prob: (state.agency > 75 && state.foundation < 40) ? 0.9 : 0.05 },
        { label: lang === 'ru' ? "Системная лояльность" : "სისტემური ლოიალობა", prob: activePatterns.includes('family_loyalty') ? 0.95 : 0.3 },
        { label: lang === 'ru' ? "Дефицит идентичности" : "იდენტობის დეფიციტი", prob: archetypeKey === 'THE_DRIFTER' ? 0.7 : 0.2 }
    ];

    const differentialHypotheses = diffMap
        .sort((a, b) => b.prob - a.prob)
        .map(h => ({ label: h.label, probability: h.prob }));

    // Placeholder profile detection for dossier
    const profileName = state.foundation < 35 ? "CRITICAL_DEFICIT" : state.agency > 85 ? "MANIC_DRIVE" : "STABLE_FLOW";

    return {
        level1: {
            title: "CLINICAL SUMMARY",
            statusTag: profileName,
            summary: lang === 'ru' ? "Анализ выявил структурные разрывы." : "სტრუქტურული ანალიზი.",
            focusQuestion: lang === 'ru' ? "От чего вы бежите в свою эффективность?" : "რას გაურბიხართ?",
            tone: state.foundation < 40 ? 'alert' : 'supportive',
            recommendation: lang === 'ru' ? "Приоритет: стабилизация." : "პრიორიტეტი: სტაბილიზაცია.",
        },
        level2: {
            introduction: "🧬 GENESIS OS // SUPERVISOR DOSSIER v3.1",
            generalConfig: `System Profile: ${profileName}. FARE Signature: [F:${state.foundation} A:${state.agency} R:${state.resource} E:${state.entropy}]`,
            deepAnalysis: lang === 'ru' ? "Механизм компенсации через волевые усилия при дефиците опор." : "კომპენსაციის მექანიზმი.",
            archetypeAnalysis: `Dominant: ${archetypeKey}. Strategy: ${t.archetypes[archetypeKey]?.superpower}. Limit: ${t.archetypes[archetypeKey]?.shadow}.`,
            clinicalHypotheses: lang === 'ru' ? "1. Игнорирование соматических сигналов усталости. 2. Перенос функции родителя на финансовый ресурс." : "კლინიკური ჰიპოთეზები.",
            activePatterns: activePatterns.join(', '),
            verdictAndRecommendations: `Verdict: ${result.verdictKey}. Focus: Attachment security & boundaries.`,
            resistanceProfile: lang === 'ru' ? "Интеллектуализация. Клиент склонен 'понимать' вместо 'чувствовать'." : "ინტელექტუალიზაცია.",
            behavioralMarkers: lang === 'ru' ? "Быстрая речь, отсутствие пауз, игнорирование вопросов о теле." : "სწრაფი საუბარი.",
            systemicRoot: lang === 'ru' ? "Идентификация с исключенным членом рода (по материнской линии)." : "სისტემური ფესვი.",
            therapeuticAlliance: lang === 'ru' ? "Недирективная позиция. Избегать конкуренции за 'правильные ответы'." : "არადირექტიული ალიანსი.",
            shadowContract: lang === 'ru' ? "Помогите мне работать вечно и никогда не чувствовать боль." : "ჩრდილოვანი კონტრაქტი.",
            sessionFlow: [
                { phase: 'ENTRY', title: lang === 'ru' ? 'Замедление' : 'შენელება', action: lang === 'ru' ? 'Синхронизация дыхания.' : 'სუნთქვა.' },
                { phase: 'EXPLORATION', title: lang === 'ru' ? 'Контакт с дефицитом' : 'დეფიციტი', action: lang === 'ru' ? 'Признание нехватки сил.' : 'აღიარება.' },
                { phase: 'RESOLUTION', title: lang === 'ru' ? 'Разрешающая фраза' : 'ფრაზა', action: lang === 'ru' ? 'Проговаривание системной фразы.' : 'ფრაზის თქმა.' }
            ],
            clinicalProfile: `F:${state.foundation} A:${state.agency} R:${state.resource} E:${state.entropy}`,
            systemicVectors,
            interventions,
            differentialHypotheses
        },
    };
}
