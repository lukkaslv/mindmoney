
import React, { useState, memo, useCallback, useMemo } from 'react';
import { AnalysisResult, Translations, AdaptiveState } from '../../types';
import { RadarChart } from '../RadarChart';
import { StorageService, STORAGE_KEYS } from '../../services/storageService';
import { ContradictionInsights } from '../ContradictionInsights';
import { CompatibilityView } from '../CompatibilityView';

interface ResultsViewProps {
  t: Translations;
  result: AnalysisResult;
  isGlitchMode: boolean;
  onContinue: () => void;
  onShare: () => void;
  onBack: () => void;
  getSceneText: (path: string) => string;
  adaptiveState: AdaptiveState;
}

export const ResultsView = memo<ResultsViewProps>(({ 
  t, result, isGlitchMode, onContinue, onShare, onBack, getSceneText, adaptiveState
}) => {
  const [showMetricInfo, setShowMetricInfo] = useState<string | null>(null);
  const [showDecoder, setShowDecoder] = useState(false);
  const [showPrep, setShowPrep] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<number[]>(() => StorageService.load<number[]>(STORAGE_KEYS.ROADMAP_STATE, []));

  const archetype = t.archetypes[result.archetypeKey];
  const audit = result.integrityBreakdown;
  const isCritical = result.status === 'CRITICAL';

  const toggleTask = useCallback((day: number) => {
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.('light');
    setCompletedTasks(prev => {
        const next = prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day];
        StorageService.save(STORAGE_KEYS.ROADMAP_STATE, next);
        return next;
    });
  }, []);

  const decoderItems = useMemo(() => {
    const items: { text: string; score: number }[] = [];
    if (result.integrityBreakdown.coherence < 50) {
        items.push({ text: t.explanations.latency_resistance, score: 100 - result.integrityBreakdown.coherence });
    }
    if (result.neuroSync < 50) {
        items.push({ text: t.explanations.body_mind_conflict, score: 100 - result.neuroSync });
    }
    if (result.activePatterns.includes('family_loyalty')) {
        items.push({ text: t.explanations.shame_of_success, score: 60 });
    }
    if (result.entropyScore > 50) {
        items.push({ text: t.explanations.ambivalence_loop, score: result.entropyScore });
    }
    return items.sort((a, b) => b.score - a.score).slice(0, 3).map(i => i.text);
  }, [result, t]);

  const prepQuestions = useMemo(() => {
    const questions = [isCritical ? "Что сейчас больше всего нуждается в вашей поддержке и внимании?" : "Что вы чувствуете прямо сейчас, глядя на этот Blueprint вашего состояния?"];
    if (result.coreConflict) {
        questions.push(`Какую защитную функцию выполняет узел "${t.conflicts[result.coreConflict]}" в вашей жизни?`);
    }
    if (result.activePatterns.length > 0) {
        questions.push(`За что вы могли бы поблагодарить паттерн "${t.beliefs[result.activePatterns[0]]}" (ведь он когда-то вам помогал)?`);
    }
    return questions;
  }, [result, t, isCritical]);

  if (!disclaimerAccepted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-in px-4 text-center">
         <div className="w-16 h-16 bg-indigo-50 rounded-3xl flex items-center justify-center text-3xl shadow-inner border border-indigo-100/50 animate-pulse">⚖️</div>
         <div className="space-y-4 max-w-sm">
            <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 leading-tight italic">
                {t.results.disclaimer_title}
            </h2>
            <p className="text-sm font-medium text-slate-500 leading-relaxed italic">
                {t.results.disclaimer_body}
            </p>
         </div>
         <button 
           onClick={() => {
             setDisclaimerAccepted(true);
             window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.('success');
           }}
           className="w-full max-w-xs py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all"
         >
            СОГЛАСЕН С УСЛОВИЯМИ
         </button>
      </div>
    );
  }

  return (
    <div className={`space-y-10 pb-32 animate-in px-1 pt-2 font-sans ${isGlitchMode ? 'glitch' : ''}`}>
      
      <header className={`${isCritical ? 'bg-slate-950 ring-2 ring-red-500/30' : 'dark-glass-card'} p-8 rounded-[2.5rem] shadow-2xl space-y-6 relative overflow-hidden border-b-4 ${isCritical ? 'border-red-600' : 'border-indigo-500/30'}`}>
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="relative z-10 space-y-4">
            <div className="flex justify-between items-center">
              <span className={`text-[10px] font-black ${isCritical ? 'text-red-400 border-red-500/20' : 'text-indigo-400 border-indigo-500/20'} uppercase tracking-[0.4em] bg-white/5 px-3 py-1.5 rounded-full border`}>
                  {t.results.blueprint_title}
              </span>
              <div className="flex flex-col items-end">
                  <span className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-tighter">Signal Trust</span>
                  <span className={`text-[10px] font-mono font-bold ${result.confidenceScore > 80 ? 'text-emerald-400' : result.confidenceScore > 50 ? 'text-amber-400' : 'text-red-400'}`}>
                    {result.confidenceScore}%
                  </span>
              </div>
            </div>
            <div className="space-y-1">
              <h1 className="text-4xl font-black italic uppercase text-white leading-none tracking-tighter drop-shadow-lg">
                  {archetype.title}
              </h1>
              <p className="text-sm text-slate-400 font-medium leading-relaxed opacity-85 pt-2 border-l-2 border-indigo-500/50 pl-4">
                  {archetype.desc}
              </p>
            </div>
        </div>
      </header>

      <section className={`${isCritical ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-100'} p-8 rounded-[2.5rem] border space-y-4 shadow-sm relative overflow-hidden`}>
          {isCritical && <div className="absolute top-0 left-0 w-1.5 h-full bg-red-600"></div>}
          <h3 className={`text-[10px] font-black uppercase tracking-[0.4em] ${isCritical ? 'text-red-600' : 'text-indigo-500'}`}>
            {t.results.verdict_title}
          </h3>
          <div className="space-y-2">
            <h4 className="text-2xl font-black text-slate-900 uppercase italic leading-none tracking-tight">
              {t.verdicts[result.verdictKey].label}
            </h4>
            <p className="text-sm font-medium text-slate-700 leading-relaxed italic">
              {t.verdicts[result.verdictKey].description}
            </p>
          </div>
          <div className="pt-2 flex items-center gap-2 border-t border-slate-200/50 mt-2">
              <div className={`w-2 h-2 rounded-full ${isCritical ? 'bg-red-600' : 'bg-indigo-500'}`}></div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  {t.results.root_command}: <span className={isCritical ? 'text-red-700' : 'text-indigo-700'}>{archetype.root_command}</span>
              </div>
          </div>
      </section>

      <div className="grid grid-cols-1 gap-4">
          <section className="bg-white p-6 rounded-[2rem] border border-slate-100 space-y-4 shadow-md group">
              <button 
                onClick={() => { setShowDecoder(!showDecoder); window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.('light'); }}
                className="w-full flex justify-between items-center"
              >
                <div className="flex flex-col text-left">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-900 group-hover:text-indigo-600 transition-colors">{t.results.decoder_title}</h3>
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{t.results.decoder_desc}</span>
                </div>
                <span className={`text-slate-400 transition-transform duration-300 ${showDecoder ? 'rotate-180' : ''}`}>▾</span>
              </button>
              {showDecoder && (
                <div className="pt-4 space-y-3 animate-in border-t border-slate-50">
                   {decoderItems.length > 0 ? decoderItems.map((item, i) => (
                     <div key={i} className="flex gap-3 items-start p-3 bg-slate-50/50 rounded-2xl transition-colors">
                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1.5 shrink-0"></div>
                        <p className="text-[11px] font-medium text-slate-700 leading-relaxed italic">{item}</p>
                     </div>
                   )) : (
                     <p className="text-[11px] font-medium text-emerald-600 leading-relaxed">{t.dashboard.insight_coherence}</p>
                   )}
                </div>
              )}
          </section>

          <section className="bg-indigo-950 p-8 rounded-[2.5rem] border border-white/10 space-y-5 shadow-2xl group">
              <button 
                onClick={() => { setShowPrep(!showPrep); window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.('light'); }}
                className="w-full flex justify-between items-center text-left"
              >
                <div className="flex flex-col">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-indigo-400 group-hover:text-white transition-colors">{t.results.session_prep}</h3>
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">{t.results.session_prep_desc}</span>
                </div>
                <span className={`text-white/40 transition-transform duration-300 ${showPrep ? 'rotate-180' : ''}`}>▾</span>
              </button>
              {showPrep && (
                <div className="space-y-4 animate-in">
                    {prepQuestions.map((q, i) => (
                      <div key={i} className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                         <span className="text-[10px] font-mono font-black text-indigo-400">Q{i+1}</span>
                         <p className="text-[11px] text-white/90 font-medium leading-relaxed italic">{q}</p>
                      </div>
                    ))}
                    <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                        <p className="text-[9px] text-indigo-300 font-bold uppercase tracking-widest leading-tight">
                            Интерпретация: Эти вопросы предназначены для обсуждения с психологом. Психолог поможет расшифровать глубинные телесно-когнитивные паттерны.
                        </p>
                    </div>
                </div>
              )}
          </section>
      </div>

      <section className="bg-slate-100/50 p-6 rounded-[2rem] border border-slate-200/50 space-y-4 group">
          <button 
            onClick={() => { setShowAdvanced(!showAdvanced); window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.('light'); }}
            className="w-full flex justify-between items-center text-left"
          >
            <div className="flex flex-col">
                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-600 group-hover:text-indigo-600 transition-colors">{t.results.advanced_data}</h3>
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t.results.advanced_data_desc}</span>
            </div>
            <span className={`text-slate-400 transition-transform duration-300 ${showAdvanced ? 'rotate-180' : ''}`}>▾</span>
          </button>
          
          {showAdvanced && (
            <div className="space-y-8 pt-4 animate-in border-t border-slate-200/50">
                <div className="space-y-6">
                    {[
                    { label: t.integrity_audit.coherence, value: audit.coherence, color: 'bg-indigo-600', statusText: audit.coherence < 40 ? t.integrity_audit.coherence_low : t.integrity_audit.coherence_high, type: "MEASURED_FACT" },
                    { label: t.integrity_audit.sync, value: audit.sync, color: 'bg-emerald-600', statusText: audit.sync < 50 ? t.integrity_audit.sync_low : t.integrity_audit.sync_high, type: "SUBJECTIVE_REPORT" },
                    { label: t.integrity_audit.stability, value: audit.stability, color: 'bg-blue-600', statusText: audit.stability < 45 ? t.integrity_audit.stability_low : t.integrity_audit.stability_high, type: "INTERPRETATION" }
                    ].map((m, i) => (
                    <div key={i} className="space-y-2.5">
                        <div className="flex justify-between text-[10px] font-bold text-slate-900">
                            <span className="uppercase tracking-wide">{m.label} <span className="text-[7px] text-slate-400 ml-1">[{m.type}]</span></span>
                            <span className="font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">{m.value}%</span>
                        </div>
                        <div className="h-2.5 bg-white rounded-full overflow-hidden border border-slate-200">
                            <div className={`h-full ${m.color} transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(99,102,241,0.2)]`} style={{ width: `${m.value}%` }}></div>
                        </div>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">{m.statusText}</p>
                    </div>
                    ))}
                </div>

                <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-3">
                   <h5 className="text-[10px] font-black uppercase text-slate-900 tracking-widest flex items-center gap-2">
                       <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                       Logic Blueprint
                   </h5>
                   <p className="text-[10px] text-slate-600 leading-relaxed italic">
                      Скорость выбора (Latency) используется как индикатор когнитивного конфликта. Самоотчетные телесные ощущения (Resonance) сопоставляются с вектором выбора для выявления структурного диссонанса.
                   </p>
                </div>

                <ContradictionInsights contradictions={adaptiveState.contradictions} t={t} />

                <div className="relative py-8 bg-white rounded-[2rem] shadow-sm border border-slate-200/50 overflow-hidden text-center">
                    <span className="absolute top-4 left-1/2 -translate-x-1/2 text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Map Synthesis</span>
                    <RadarChart points={result.graphPoints} onLabelClick={(metric) => setShowMetricInfo(metric)} />
                    <p className="absolute bottom-4 left-0 w-full text-[8px] font-bold text-slate-500 uppercase tracking-widest">{t.results.click_info}</p>
                </div>
            </div>
          )}
      </section>

      {isCritical && (
        <div className="px-2">
            <div className="bg-red-700 p-8 rounded-[3rem] text-white space-y-6 shadow-2xl ring-4 ring-red-500/20">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-3xl animate-pulse">🧭</div>
                    <div className="space-y-1">
                        <h3 className="text-sm font-black uppercase tracking-[0.2em]">{t.safety.mode_title}</h3>
                        <p className="text-[11px] font-bold text-red-100 leading-tight">Ваш сигнал требует обязательного участия специалиста. Не принимайте решений на основе этих данных самостоятельно.</p>
                    </div>
                </div>
                <button 
                    onClick={() => window.Telegram?.WebApp?.openLink?.('https://t.me/thndrrr')}
                    className="w-full py-5 bg-white text-red-700 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all"
                >
                    {t.results.contact_psychologist}
                </button>
            </div>
        </div>
      )}

      <section className="space-y-6">
         <div className="flex items-center justify-between px-2">
            <div className="flex flex-col">
                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-900">{t.results.roadmap}</h3>
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Route Correction Plan</span>
            </div>
            <div className="px-4 py-1.5 bg-slate-950 rounded-full text-[10px] font-mono font-black text-indigo-400 border border-white/10">{completedTasks.length} / 7</div>
         </div>
         <div className="space-y-4">
            {result.roadmap.map((step, i) => {
              const isShadow = step.taskKey.startsWith('shadow');
              const isDone = completedTasks.includes(step.day);
              return (
                <div 
                  key={i} 
                  onClick={() => toggleTask(step.day)} 
                  className={`p-6 rounded-[2.5rem] border transition-all duration-300 cursor-pointer relative overflow-hidden ${
                      isDone ? 'opacity-40 grayscale bg-slate-50 border-slate-100' : 'hover:scale-[1.02] active:scale-[0.98]'
                  } ${
                      isShadow ? 'bg-slate-900 border-slate-800 text-white shadow-2xl' : 
                      step.taskKey.startsWith('pattern_fix') ? 'bg-indigo-50/50 border-indigo-200' : 
                      'bg-white border-slate-200 text-slate-900 shadow-sm'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                      <span className={`text-[10px] font-mono font-black ${isShadow ? 'text-indigo-400' : 'text-slate-400'}`}>Waypoint 0{i+1}</span>
                      {isDone && <span className="text-emerald-600 text-[10px] font-black tracking-widest">REACHED</span>}
                  </div>
                  <div className="space-y-1">
                      <h5 className="font-black text-lg uppercase italic leading-tight tracking-tighter">{getSceneText(`tasks.${step.taskKey}.title`)}</h5>
                      <p className={`text-[11px] leading-relaxed font-bold ${isShadow ? 'text-slate-300' : 'text-slate-600'}`}>{getSceneText(`tasks.${step.taskKey}.method`)}</p>
                  </div>
                </div>
              );
            })}
         </div>
      </section>

      <CompatibilityView userResult={result} t={t} />
      
      {!isCritical && (
        <div className="px-2">
           <button 
             onClick={() => window.Telegram?.WebApp?.openLink?.('https://t.me/thndrrr')}
             className="w-full py-6 bg-emerald-600 text-white rounded-[2.5rem] font-black uppercase text-xs tracking-[0.25em] shadow-xl hover:bg-emerald-700 active:scale-95 transition-all flex flex-col items-center justify-center gap-1 border-b-4 border-emerald-800"
           >
             <div className="flex items-center gap-2"><span className="text-lg">🧭</span> {t.results.contact_psychologist}</div>
             <span className="text-[8px] opacity-70 font-bold uppercase tracking-widest">Connect with your Expert Guide</span>
           </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 pt-6">
         {!adaptiveState.isComplete && (
           <button onClick={onContinue} className="w-full py-7 bg-indigo-600 text-white rounded-[2.5rem] font-black uppercase text-sm tracking-[0.2em] shadow-2xl active:scale-95 transition-all border-b-4 border-indigo-800">
             {t.global.next_node}
           </button>
         )}
         <div className="grid grid-cols-2 gap-3">
             <button onClick={onShare} className="py-5 bg-slate-950 text-white rounded-[2rem] font-black uppercase text-[10px] tracking-widest shadow-lg active:scale-95 transition-all border-b-4 border-slate-800">{t.results.share_button}</button>
             <button onClick={onBack} className="py-5 bg-white text-slate-900 border border-slate-300 rounded-[2rem] font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all">{t.results.back}</button>
         </div>
      </div>

      {showMetricInfo && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md animate-in" onClick={() => setShowMetricInfo(null)}>
            <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl max-w-sm space-y-4 text-center w-full border border-white/20" onClick={e => e.stopPropagation()}>
               <div className="w-16 h-16 bg-indigo-50 rounded-2xl mx-auto flex items-center justify-center text-2xl shadow-inner mb-2">🛰️</div>
               <h4 className="font-black text-sm uppercase text-indigo-600 tracking-widest">{showMetricInfo}</h4>
               <p className="text-xs text-slate-800 font-bold leading-relaxed">{t.metric_definitions[showMetricInfo]}</p>
               <button onClick={() => setShowMetricInfo(null)} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] mt-4 shadow-lg">Understood</button>
            </div>
         </div>
      )}
    </div>
  );
});
