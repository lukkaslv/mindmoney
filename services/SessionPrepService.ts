
import { AnalysisResult, Translations, BeliefKey } from '../types';

const getTopItems = (arr: any[], count: number): any[] => {
    const frequency: Record<string, number> = {};
    arr.forEach(item => {
        frequency[item] = (frequency[item] || 0) + 1;
    });
    return Object.entries(frequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, count)
        .map(entry => entry[0]);
};

const formatTemplate = (template: string, replacements: Record<string, string>): string => {
    let formatted = template;
    for (const key in replacements) {
        formatted = formatted.replace(`{{${key}}}`, replacements[key]);
    }
    return formatted;
};

export const SessionPrepService = {
  generate(result: AnalysisResult, t: Translations): string[] {
    const questions: string[] = [];
    const templates = t.session_prep_templates;

    // --- PRIORITY 1: CRITICAL STATE ---
    if (result.state.foundation < 35) {
        const topNegativePattern = getTopItems(result.activePatterns.filter(p => p !== 'default'), 1)[0] as BeliefKey;
        if (topNegativePattern) {
            questions.push(formatTemplate(templates.low_foundation_pattern, {
                pattern: t.beliefs[topNegativePattern] || topNegativePattern
            }));
        } else {
            questions.push(templates.low_foundation_generic);
        }
    }

    // --- PRIORITY 2: HIGH-SEVERITY CONFLICT ---
    const highConflict = result.conflicts.find(c => c.severity === 'high');
    if (highConflict) {
        questions.push(formatTemplate(templates.conflict, {
            conflict_name: t.conflicts[highConflict.key] || highConflict.key,
            metric1: t.domains[highConflict.domain] || highConflict.domain,
            metric2: t.domains.foundation // Dynamically using foundation key from translations
        }));
    }

    // --- PRIORITY 3: SOMATIC DISSONANCE ---
    if (result.somaticDissonance.length > 0) {
        const dissonantPattern = result.somaticDissonance[0];
        questions.push(formatTemplate(templates.somatic_dissonance, {
            pattern: t.beliefs[dissonantPattern] || dissonantPattern
        }));
    }

    // --- PRIORITY 4: INTERACTION ---
    const topPatterns = getTopItems(result.activePatterns.filter(p => p !== 'default'), 2) as BeliefKey[];
    if (topPatterns.length === 2) {
        questions.push(formatTemplate(templates.pattern_interaction, {
            pattern1: t.beliefs[topPatterns[0]] || topPatterns[0],
            pattern2: t.beliefs[topPatterns[1]] || topPatterns[1]
        }));
    }

    const defaultTemplates = [templates.default_latency, templates.default_archetype, templates.default_verdict];
    let defaultIndex = 0;
    while (questions.length < 3 && defaultIndex < defaultTemplates.length) {
        const question = formatTemplate(defaultTemplates[defaultIndex], {
            archetype_shadow: t.archetypes[result.archetypeKey]?.shadow || '...',
            verdict_impact: t.verdicts[result.verdictKey]?.impact || '...'
        });
        if (!questions.includes(question)) {
            questions.push(question);
        }
        defaultIndex++;
    }

    return questions.slice(0, 3);
  }
};
