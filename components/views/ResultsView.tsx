
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
  const [showPrep, setShowPrep] = useState(true);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<number[]>(() => StorageService.load<number[]>(STORAGE_KEYS.ROADMAP_STATE, []));

  const archetype = t.archetypes[result.archetypeKey];
  const audit = result.integrityBreakdown;

  const toggleTask = useCallback((day: number) => {
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.('light');
    setCompletedTasks(prev => {
        const next = prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day];
        StorageService.save(STORAGE_KEYS.ROADMAP_STATE, next);
        return next;
    });
  }, []);

  const isRedFlag = result.systemHealth < 25;

  const lifeScript = useMemo(() => {
    const key = (result as any).lifeScriptKey || 'healthy_integration';
    return t.synthesis[key] || t.synthesis.healthy_integration;
  }, [result, t]);

  const handleContact = () => {
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.('medium');
    window.Telegram?.WebApp?.openLink?.('https://t.me/thndrrr');
  };

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
    const questions = ["Что вы чувствуете прямо сейчас, глядя на этот Blueprint вашего состояния?"];
    if (result.coreConflict) {
        questions.push(`В каких повседневных ситуациях вы замечаете влияние узла "${t.conflicts[result.coreConflict]}"?`);
    }
    if (result.activePatterns.length > 0) {
        questions.push(`Как бы изменилась ваша жизнь завтра, если бы паттерн "${t.beliefs[result.activePatterns[0]]}" перестал на вас влиять?`);
    } else {
        questions.push("Какие из ваших текущих целей требуют максимальной ясности сигнала (Coherence), которой вы обладаете?");
    }
    return questions;
  }, [result, t]);

  if (!disclaimerAccepted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-in px-4 text-center">
         <div className="w-16 h-16 bg-indigo-50 rounded-3xl flex items-center justify-center text-3xl shadow-inner border border-indigo-100/50 animate-pulse">📍</div>
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
            ОТКРЫТЬ BLUEPRINT
         </button>
      </div>
    );
  }

  return (
    <>
      <div className={`space-y-10 pb-32 animate-in px-1 pt-2 font-sans ${isGlitchMode ? 'glitch' : ''}`}>
        
        {/* PREMIUM BLUEPRINT HEADER */}
        <header className="dark-glass-card p-8 rounded-[2.5rem] shadow-2xl space-y-6 relative overflow-hidden border-b-4 border-indigo-500/30">
          <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
          <div className="relative z-10 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20">
                    {t.results.blueprint_title}
                </span>
                <div className="flex flex-col items-end">
                    <span className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-tighter">Signal Accuracy</span>
                    <span className="text-[10px] font-mono font-bold text-indigo-400">{result.confidenceScore}%</span>
                </div>
              </div>
              <div className="space-y-1">
                <h1 className="text-4xl font-black italic uppercase text-white leading-none tracking-tighter drop-shadow-lg">
                    {archetype.title}
                </h1>
                <p className="text-xs text-slate-400 font-medium leading-relaxed opacity-85 pt-2 border-l-2 border-indigo-500/50 pl-4">
                    {archetype.desc}
                </p>
              </div>
          </div>
        </header>

        {/* NARRATIVE SYNTHESIS */}
        <section className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 space-y-4 shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500">{t.results.deep_analysis_title}</h3>
            <p className="text-lg font-bold text-slate-800 leading-tight italic">
              "{lifeScript}"
            </p>
            <div className="pt-2 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                    {t.results.root_command}: <span className="text-indigo-600">{archetype.root_command}</span>
                </div>
            </div>
        </section>

        {/* SIGNAL DECODER */}
        <section className="bg-white p-6 rounded-[2rem] border border-slate-100 space-y-4 shadow-md">
            <button 
              onClick={() => { setShowDecoder(!showDecoder); window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.('light'); }}
              className="w-full flex justify-between items-center"
            >
              <div className="flex flex-col text-left">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-900">{t.results.decoder_title}</h3>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{t.results.decoder_desc}</span>
              </div>
              <span className={`text-xl transition-transform duration-300 ${showDecoder ? 'rotate-180' : ''}`}>▾</span>
            </button>
            {showDecoder && (
              <div className="pt-4 space-y-3 animate-in border-t border-slate-50">
                 {decoderItems.length > 0 ? decoderItems.map((item, i) => (
                   <div key={i} className="flex gap-3 items-start p-2 hover:bg-slate-50 rounded-xl transition-colors">
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1.5 shrink-0"></div>
                      <p className="text-[11px] font-medium text-slate-600 leading-relaxed italic">{item}</p>
                   </div>
                 )) : (
                   <p className="text-[11px] font-medium text-emerald-600 leading-relaxed">{t.dashboard.insight_coherence}</p>
                 )}
              </div>
            )}
        </section>

        {/* SESSION PREP */}
        <section className="bg-indigo-950 p-8 rounded-[2.5rem] border border-white/10 space-y-5 shadow-2xl">
            <button 
              onClick={() => { setShowPrep(!showPrep); window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.('light'); }}
              className="w-full flex justify-between items-center text-left"
            >
              <div className="flex flex-col">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-indigo-400">{t.results.session_prep}</h3>
                  <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">{t.results.session_prep_desc}</span>
              </div>
              <span className={`text-xl text-white transition-transform duration-300 ${showPrep ? 'rotate-180' : ''}`}>▾</span>
            </button>
            {showPrep && (
              <div className="space-y-4 animate-in">
                  {prepQuestions.map((q, i) => (
                    <div key={i} className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                       <span className="text-[10px] font-mono font-black text-indigo-400">Q{i+1}</span>
                       <p className="text-[11px] text-white/90 font-medium leading-relaxed italic">{q}</p>
                    </div>
                  ))}
              </div>
            )}
        </section>

        {/* SYSTEM INTEGRITY AUDIT */}
        <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-8">
            <div className="flex justify-between items-center border-b border-slate-50 pb-4">
               <div className="space-y-1">
                 <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-900">{t.global.progress}</h3>
                 <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Global Positioning Status</span>
               </div>
               <span className={`text-[9px] font-black px-4 py-1.5 rounded-full shadow-sm ${audit.status === 'OPTIMAL' ? 'bg-emerald-500 text-white' : audit.status === 'STABLE' ? 'bg-indigo-500 text-white' : audit.status === 'STRAINED' ? 'bg-amber-500 text-white' : 'bg-red-500 text-white'}`}>
                  {t.integrity_audit[audit.label]}
               </span>
            </div>
            <div className="space-y-8">
               {[
                 { label: t.integrity_audit.coherence, value: audit.coherence, color: 'bg-indigo-500', statusText: audit.coherence < 40 ? t.integrity_audit.coherence_low : t.integrity_audit.coherence_high },
                 { label: t.integrity_audit.sync, value: audit.sync, color: 'bg-emerald-500', statusText: audit.sync < 50 ? t.integrity_audit.sync_low : t.integrity_audit.sync_high },
                 { label: t.integrity_audit.stability, value: audit.stability, color: 'bg-blue-500', statusText: audit.stability < 45 ? t.integrity_audit.stability_low : t.integrity_audit.stability_high }
               ].map((m, i) => (
                 <div key={i} className="space-y-2.5">
                    <div className="flex justify-between text-[10px] font-bold text-slate-900">
                       <span className="uppercase tracking-wide">{m.label}</span>
                       <span className="font-mono text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md">{m.value}%</span>
                    </div>
                    <div className="h-2.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                       <div className={`h-full ${m.color} transition-all duration-1000 ease-out`} style={{ width: `${m.value}%` }}></div>
                    </div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{m.statusText}</p>
                 </div>
               ))}
            </div>
        </section>

        <ContradictionInsights contradictions={adaptiveState.contradictions} t={t} />

        {/* INTERACTIVE RADAR */}
        <div className="relative py-12 glass-card rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden text-center">
            <span className="absolute top-6 left-1/2 -translate-x-1/2 text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">System Mapping</span>
            <RadarChart points={result.graphPoints} onLabelClick={(metric) => setShowMetricInfo(metric)} />
            <p className="absolute bottom-6 left-0 w-full text-[8px] font-bold text-slate-400 uppercase tracking-widest">{t.results.click_info}</p>
        </div>

        <CompatibilityView userResult={result} t={t} />

        {/* ROADMAP PROTOCOL */}
        {!isRedFlag && (
          <section className="space-y-6">
             <div className="flex items-center justify-between px-2">
                <div className="flex flex-col">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-900">{t.results.roadmap}</h3>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Route Correction Plan</span>
                </div>
                <div className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-mono font-bold text-slate-500">{completedTasks.length} / 7</div>
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
                          step.taskKey.startsWith('pattern_fix') ? 'bg-indigo-50/50 border-indigo-100' : 
                          'bg-white border-slate-100 text-slate-900 shadow-sm'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                          <span className={`text-[10px] font-mono font-bold ${isShadow ? 'text-indigo-400' : 'text-slate-400'}`}>Waypoint 0{i+1}</span>
                          {isDone && <span className="text-emerald-500 text-xs font-black">REACHED</span>}
                      </div>
                      <div className="space-y-1">
                          <h5 className="font-black text-lg uppercase italic leading-tight tracking-tighter">{getSceneText(`tasks.${step.taskKey}.title`)}</h5>
                          <p className={`text-[11px] leading-relaxed font-bold ${isShadow ? 'text-slate-300' : 'text-slate-500'}`}>{getSceneText(`tasks.${step.taskKey}.method`)}</p>
                      </div>
                    </div>
                  );
                })}
             </div>
          </section>
        )}
        
        {/* CONTACT BUTTON */}
        <div className="px-2">
           <button 
             onClick={handleContact}
             className="w-full py-6 bg-emerald-600 text-white rounded-[2rem] font-black uppercase text-xs tracking-[0.25em] shadow-xl hover:bg-emerald-700 active:scale-95 transition-all flex flex-col items-center justify-center gap-1"
           >
             <div className="flex items-center gap-2"><span className="text-lg">🧭</span> {t.results.contact_psychologist}</div>
             <span className="text-[8px] opacity-70 font-bold uppercase tracking-widest">Connect with your Expert Guide</span>
           </button>
        </div>

        {/* ACTIONS */}
        <div className="grid grid-cols-1 gap-4 pt-6">
           {!adaptiveState.isComplete && (
             <button onClick={onContinue} className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black uppercase text-sm tracking-[0.2em] shadow-xl active:scale-95 transition-all">
               {t.global.next_node}
             </button>
           )}
           <div className="grid grid-cols-2 gap-3">
               <button onClick={onShare} className="py-5 bg-slate-950 text-white rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest shadow-lg active:scale-95 transition-all">{t.results.share_button}</button>
               <button onClick={onBack} className="py-5 bg-white text-slate-900 border border-slate-200 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all">{t.results.back}</button>
           </div>
        </div>
      </div>

      {showMetricInfo && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in" onClick={() => setShowMetricInfo(null)}>
            <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl max-w-sm space-y-4 text-center w-full border border-white/20" onClick={e => e.stopPropagation()}>
               <div className="w-12 h-12 bg-indigo-50 rounded-2xl mx-auto flex items-center justify-center text-xl">🛰️</div>
               <h4 className="font-black text-xs uppercase text-indigo-600 tracking-widest">{showMetricInfo}</h4>
               <p className="text-xs text-slate-700 font-bold">{t.metric_definitions[showMetricInfo]}</p>
               <button onClick={() => setShowMetricInfo(null)} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black uppercase text-[10px] mt-4">Understood</button>
            </div>
         </div>
      )}
    </>
  );
});
