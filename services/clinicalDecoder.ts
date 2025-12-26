
import { AnalysisResult, ClinicalInterpretation, TherapyHypothesis, Translations } from '../types';

export const ClinicalDecoder = {
  decode(result: AnalysisResult, t: Translations): ClinicalInterpretation {
    const { state, neuroSync, archetypeKey, activePatterns, verdictKey, flags } = result;
    const cd = t.clinical_decoder;

    // 1. EXPERT SYSTEM: CONFIGURATION DETECTION
    let configKey = 'optimal';
    
    // G. God Mode / High Functioning Dissociation -> RENAMED to Compensatory Overdrive
    if (state.agency >= 90 && state.resource >= 90 && state.entropy <= 10) {
        configKey = 'compensatory_overdrive';
    } 
    else if (state.foundation < 30) configKey = 'critical_deficit'; 
    else if (state.foundation < 45 && state.entropy < 35) configKey = 'economy_mode';
    else if (state.agency > 70 && state.foundation < 40) configKey = 'mobilization';
    else if (state.entropy > 55) {
        // Distinguish Chaos type
        if (flags?.entropyType === 'CREATIVE') configKey = 'chaotic_creative'; // Implicitly handled via deepInsights, but key remains general for now or we create new key
        else configKey = 'chaotic';
    }
    else if (state.foundation > 75 && state.agency < 45) configKey = 'rigid';

    // 2. DEEP SYNTHESIS: COMBINATORIAL ANALYSIS
    const deepInsights: string[] = [];
    const patterns = cd.analysis_patterns;

    if (configKey === 'compensatory_overdrive') {
        deepInsights.push(patterns.god_mode_dissociation);
        if (neuroSync < 70) {
            deepInsights.push(patterns.somatic_rebellion);
        }
    }
    // A. The "Naked Wire" Syndrome (F < 30 + Sync > 80)
    else if (state.foundation < 30 && neuroSync > 80) {
        deepInsights.push(patterns.naked_wire);
    } 
    // B. Frozen Will (Agency < 35 + Entropy > 40)
    else if (state.agency < 35 && state.entropy > 40) {
        deepInsights.push(patterns.frozen_will);
    }
    // C. Intellectual Bypass (High F/R + Low Sync)
    else if (state.foundation > 60 && neuroSync < 50) {
        deepInsights.push(patterns.intellectual_bypass);
    }
    // D. Resource Anxiety (High R + High E)
    else if (state.resource > 70 && state.entropy > 50) {
        deepInsights.push(patterns.resource_anxiety);
    }
    // E. Foundation Void (F < 35) - General Catch
    else if (state.foundation < 35) {
        deepInsights.push(patterns.foundation_void);
    }
    // F. Manic Defense (High A + Low F)
    else if (state.agency > 80 && state.foundation < 40) {
        deepInsights.push(patterns.manic_defense);
    } 
    
    // G. Creative Chaos (Specific Check)
    if (flags?.entropyType === 'CREATIVE') {
        deepInsights.push("КРЕАТИВНЫЙ ХАОС: Высокая энтропия в сочетании с высокой волей указывает на процесс активной пересборки системы. Это не патология, а 'ремонтные работы' на высокой скорости.");
    } else if (state.entropy > 50) {
        deepInsights.push("СТРУКТУРНЫЙ ШУМ: Энергия системы тратится на внутреннее трение (тревогу). КПД действий снижен.");
    }

    if (deepInsights.length === 0) {
        deepInsights.push("Система находится в режиме штатного функционирования. Выраженных патологических паттернов в данной конфигурации не выявлено.");
    }

    // Add Somatic Context
    if (configKey !== 'compensatory_overdrive') {
        if (neuroSync > 90) deepInsights.push("СОМАТИЧЕСКИЙ РЕЗОНАНС: Абсолютная честность тела. Клиент не врет себе, даже если правда неприятна. Это мощнейший ресурс для терапии.");
        if (neuroSync < 40) deepInsights.push("ДИССОЦИАЦИЯ: Тело «молчит». Вероятно наличие сильного травматического опыта, блокирующего чувствительность.");
    }

    // 3. METRIC INTERACTIONS & SYNC
    let syncKey = 'coherent';
    if (neuroSync < 65) syncKey = 'dissociation';
    else if (neuroSync > 85 && state.foundation < 40) syncKey = 'honest_weakness';

    // 4. HYPOTHESES GENERATION
    const hypotheses: TherapyHypothesis[] = [];
    
    if (configKey === 'compensatory_overdrive') {
        hypotheses.push({
            id: 'h_anesthesia',
            hypothesis: cd.common_hypotheses.anesthesia.h,
            basedOn: `Entropy ${Math.round(state.entropy)} + Agency ${Math.round(state.agency)}`,
            focusForSession: cd.common_hypotheses.anesthesia.q
        });
        hypotheses.push({
            id: 'h_func_val',
            hypothesis: cd.common_hypotheses.functional_value.h,
            basedOn: `High Agency / High Resource`,
            focusForSession: cd.common_hypotheses.functional_value.q
        });
    }

    if (configKey === 'critical_deficit') {
        hypotheses.push({
            id: 'h_survival',
            hypothesis: "Приоритет выживания",
            basedOn: `Foundation ${Math.round(state.foundation)} (Критический уровень)`,
            focusForSession: "Обсудите: где вы берете силы, когда кажется, что опор больше нет?"
        });
    }

    if (state.foundation < 40 && (archetypeKey === 'THE_DRIFTER' || archetypeKey === 'THE_GUARDIAN')) {
        hypotheses.push({
            id: 'h_visibility',
            hypothesis: cd.common_hypotheses.visibility_fear.h,
            basedOn: `Foundation ${Math.round(state.foundation)} + ${t.archetypes[archetypeKey].title}`,
            focusForSession: cd.common_hypotheses.visibility_fear.q
        });
    }

    if (configKey === 'economy_mode' || verdictKey === 'PARALYZED_GIANT') {
        hypotheses.push({
            id: 'h_min',
            hypothesis: cd.common_hypotheses.adaptation_to_min.h,
            basedOn: "Low Agency + Moderate Entropy",
            focusForSession: cd.common_hypotheses.adaptation_to_min.q
        });
    }

    if (syncKey === 'dissociation' && configKey !== 'compensatory_overdrive') {
        hypotheses.push({
            id: 'h_dissociation',
            hypothesis: "Разрыв соматического контакта",
            basedOn: `Sync ${neuroSync}%`,
            focusForSession: "Фокус на теле: что вы чувствуете прямо сейчас, когда мы говорим о результатах?"
        });
    }

    // 5. RISKS
    const risks: string[] = [];
    if (configKey === 'compensatory_overdrive') risks.push(cd.risks.burnout_blindness);
    if (state.foundation < 30) risks.push("Критический риск эмоционального выгорания.");
    if (state.entropy < 25 && state.foundation < 40) risks.push(cd.risks.normalization);
    if (state.entropy > 55 && flags?.entropyType !== 'CREATIVE') risks.push(cd.risks.intellectualization);
    if (state.agency < 40) risks.push(cd.risks.premature_action);
    if (neuroSync < 55) risks.push(cd.risks.role_play);

    // 6. SESSION ENTRY
    let sessionEntry = cd.session_entries.reality_check;
    if (configKey === 'compensatory_overdrive') sessionEntry = cd.session_entries.decelerate;
    else if (state.foundation < 30) sessionEntry = "ТЕРАПЕВТИЧЕСКИЙ ПРИОРИТЕТ: Создание безопасного контейнера. Любые интервенции по изменениям (Agency) сейчас могут разрушить систему. Сначала — стабилизация и поиск опор.";
    else if (state.foundation < 45) sessionEntry = cd.session_entries.security_first;
    else if (neuroSync < 65) sessionEntry = cd.session_entries.body_focus;
    else if (configKey === 'economy_mode') sessionEntry = cd.session_entries.validate_deficit;

    return {
        systemConfiguration: {
            title: cd.configs[configKey]?.title || "Balanced",
            description: cd.configs[configKey]?.desc || "Normal functioning",
            limitingFactor: state.foundation < 35 ? "Foundation (Безопасность)" : state.agency < 40 ? "Agency (Воля)" : "Resource (Емкость)"
        },
        deepMechanism: {
            title: cd.headers.mechanism,
            analysis: deepInsights
        },
        metricInteractions: {
            farDescription: `F${Math.round(state.foundation)} / A${Math.round(state.agency)} / R${Math.round(state.resource)}`,
            syncDescription: cd.sync_patterns[syncKey]
        },
        archetypeClinical: {
            strategy: cd.archetype_strategies[archetypeKey].strategy,
            functionality: cd.archetype_strategies[archetypeKey].func,
            limit: cd.archetype_strategies[archetypeKey].limit
        },
        beliefImpact: activePatterns.length > 0 ? activePatterns.map(p => t.beliefs[p]).join(", ") : "Не выявлено явных когнитивных искажений",
        hypotheses: hypotheses.length > 0 ? hypotheses : [{
            id: 'default',
            hypothesis: "Сбалансированная система",
            basedOn: "Все метрики в норме",
            focusForSession: "Работа с целями роста."
        }],
        risks,
        sessionEntry
    };
  }
};