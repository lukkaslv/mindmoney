
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

  // Safety Mode Trigger
  const isRedFlag = result.systemHealth < 25;

  // DETЕРMINISTIC LIFE SCRIPT SYNTHESIS
  const lifeScript = useMemo(() => {
    const { state } = result;
    if (state.agency > 75 && state.foundation < 35) return t.synthesis.high_agency_low_foundation;
    if (state.resource > 70 && state.entropy > 50) return t.synthesis.high_resource_high_entropy;
    if (state.agency < 40 && state.foundation > 70) return t.synthesis.low_agency_high_foundation;
    if (result.neuroSync < 45) return t.synthesis.somatic_dissonance;
    return t.synthesis.healthy_integration;
  }, [result, t]);

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
                    <span className="text-[8px] font-mono font-bold text-slate-500 uppercase">Analysis Confidence</span>
                    <span className="text-[10px] font-mono font-bold text-indigo-400">{result.confidenceScore}%</span>
                </div>
              </div>
              
              <div className="space-y-1">
                <h1 className="text-4xl font-black italic uppercase text-white leading-none tracking-tighter drop-shadow-lg">
                    {archetype.title}
                </h1>
                <p className="text-xs text-slate-400 font-medium leading-relaxed opacity-80 pt-2 border-l-2 border-indigo-500/50 pl-4">
                    {archetype.desc}
                </p>
              </div>
          </div>
        </header>

        {/* NARRATIVE SYNTHESIS (LIFE SCRIPT) */}
        <section className="bg-indigo-50/30 p-8 rounded-[2.5rem] border border-indigo-100/50 space-y-4 shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500">{t.results.deep_analysis_title}</h3>
            <p className="text-lg font-bold text-slate-800 leading-tight italic">
              "{lifeScript}"
            </p>
            <div className="pt-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{t.results.root_command}: {archetype.root_command}</span>
            </div>
        </section>

        {/* RED FLAG / SAFETY ALERT */}
        {isRedFlag && (
            <section className="bg-red-950 p-6 rounded-[2rem] border border-red-500/30 space-y-3 shadow-xl animate-pulse">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">🛡️</span>
                    <h3 className="text-xs font-black uppercase tracking-widest text-red-400">{t.safety.mode_title}</h3>
                </div>
                <p className="text-[10px] text-red-200/80 font-medium leading-relaxed">
                    {t.safety.mode_desc} {t.safety.external_help}
                </p>
            </section>
        )}

        {/* SYSTEM INTEGRITY AUDIT */}
        <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-6">
            <div className="flex justify-between items-center border-b border-slate-50 pb-4">
               <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-900">Анализ согласованности</h3>
               <span className={`text-[8px] font-black px-3 py-1 rounded-full ${audit.status === 'OPTIMAL' ? 'bg-emerald-500 text-white' : audit.status === 'STABLE' ? 'bg-indigo-500 text-white' : audit.status === 'STRAINED' ? 'bg-amber-500 text-white' : 'bg-red-500 text-white'}`}>
                  {audit.status}
               </span>
            </div>

            <div className="space-y-5">
               {[
                 { label: t.integrity_audit.coherence, value: audit.coherence, color: 'bg-indigo-500' },
                 { label: t.integrity_audit.sync, value: audit.sync, color: 'bg-emerald-500' },
                 { label: t.integrity_audit.stability, value: audit.stability, color: 'bg-blue-500' }
               ].map((m, i) => (
                 <div key={i} className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500">
                       <span className="uppercase tracking-tight">{m.label}</span>
                       <span className="font-mono text-slate-400">{m.value < 40 ? 'LOW' : m.value < 75 ? 'MED' : 'HIGH'}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                       <div className={`h-full ${m.color} transition-all duration-1000`} style={{ width: `${m.value}%` }}></div>
                    </div>
                 </div>
               ))}
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
               <p className="text-[11px] font-medium text-slate-600 leading-relaxed italic">
                  {t.integrity_audit[audit.description]}
               </p>
            </div>
        </section>

        {/* CONTRADICTION INSIGHTS */}
        <ContradictionInsights contradictions={adaptiveState.contradictions} t={t} />

        {/* INTERACTIVE RADAR */}
        <div className="relative py-10 glass-card rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden text-center">
            <span className="absolute top-6 left-1/2 -translate-x-1/2 text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">System Synthesis</span>
            <RadarChart 
                points={result.graphPoints} 
                onLabelClick={(metric) => setShowMetricInfo(metric)} 
            />
        </div>

        {/* COMPATIBILITY SYNC */}
        <CompatibilityView userResult={result} t={t} />

        {/* ROADMAP PROTOCOL */}
        {!isRedFlag && (
          <section className="space-y-6">
             <div className="flex items-center justify-between px-2">
                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-900">{t.results.roadmap}</h3>
                <div className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-mono font-bold text-slate-500">
                  {completedTasks.length} / 7
                </div>
             </div>
             
             <div className="space-y-4">
                {result.roadmap.map((step, i) => {
                  const isShadow = step.taskKey.startsWith('shadow');
                  const isDone = completedTasks.includes(step.day);
                  return (
                    <div 
                      key={i} 
                      onClick={() => toggleTask(step.day)} 
                      className={`p-6 rounded-[2rem] border transition-all duration-300 cursor-pointer relative overflow-hidden ${
                          isDone ? 'opacity-40 grayscale bg-slate-50 border-slate-100' : 'hover:scale-[1.02] active:scale-[0.98]'
                      } ${
                          isShadow ? 'bg-slate-900 border-slate-800 text-white' : 
                          step.taskKey.startsWith('bug_fix') ? 'bg-indigo-50/50 border-indigo-100' : 
                          'bg-white border-slate-100 text-slate-900 shadow-sm'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                          <span className={`text-[10px] font-mono font-bold ${isShadow ? 'text-indigo-400' : 'text-slate-400'}`}>0{i+1}</span>
                          {isDone && <span className="text-emerald-500 text-xs">✔</span>}
                      </div>
                      <div className="space-y-1">
                          <h5 className="font-black text-base uppercase italic leading-tight">{getSceneText(`tasks.${step.taskKey}.title`)}</h5>
                          <p className={`text-xs leading-relaxed font-medium ${isShadow ? 'text-slate-400' : 'text-slate-500'}`}>
                             {getSceneText(`tasks.${step.taskKey}.method`)}
                          </p>
                      </div>
                    </div>
                  );
                })}
             </div>
          </section>
        )}
        
        {/* ACTION BUTTONS */}
        <div className="grid grid-cols-1 gap-4 pt-6">
           {!adaptiveState.isComplete && (
             <button 
                onClick={onContinue} 
                className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black uppercase text-sm tracking-[0.2em] shadow-xl hover:bg-indigo-700 active:scale-95 transition-all"
             >
               {t.global.next_node}
             </button>
           )}
           <div className="grid grid-cols-2 gap-3">
               <button 
                onClick={onShare} 
                className="py-4 bg-slate-950 text-white rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest shadow-lg active:scale-95 transition-all"
               >
                    Export_Blueprint
               </button>
               <button 
                onClick={onBack} 
                className="py-4 bg-white text-slate-900 border border-slate-200 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all"
               >
                    {t.results.back}
               </button>
           </div>
        </div>
      </div>

      {/* OVERLAY MODALS */}
      {showMetricInfo && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in" onClick={() => setShowMetricInfo(null)}>
            <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl max-w-sm space-y-4 text-center w-full border border-white/20" onClick={e => e.stopPropagation()}>
               <div className="w-12 h-12 bg-indigo-50 rounded-2xl mx-auto flex items-center justify-center text-xl">📊</div>
               <h4 className="font-black text-xs uppercase text-indigo-600 tracking-widest">{showMetricInfo}</h4>
               <p className="text-xs text-slate-700 font-bold leading-relaxed">{t.metric_definitions[showMetricInfo]}</p>
               <button onClick={() => setShowMetricInfo(null)} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black uppercase text-[10px] mt-4 shadow-lg shadow-indigo-600/20">Understood</button>
            </div>
         </div>
      )}
    </>
  );
});
