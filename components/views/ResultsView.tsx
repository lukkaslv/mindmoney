
import React, { useState, memo, useEffect, useCallback } from 'react';
import { AnalysisResult, BeliefKey, Translations, ProtocolStep } from '../../types';
import { RadarChart } from '../RadarChart';
import { StorageService, STORAGE_KEYS } from '../../services/storageService';
import { TOTAL_NODES } from '../../constants';

interface ResultsViewProps {
  t: Translations;
  result: AnalysisResult;
  isGlitchMode: boolean;
  nextRecommendedId: number;
  onContinue: () => void;
  onShare: () => void;
  onBack: () => void;
  getSceneText: (path: string) => string;
}

export const ResultsView = memo<ResultsViewProps>(({ 
  t, result, isGlitchMode, nextRecommendedId, onContinue, onShare, onBack, getSceneText 
}) => {
  const [selectedBug, setSelectedBug] = useState<BeliefKey | null>(null);
  const [showMetricInfo, setShowMetricInfo] = useState<string | null>(null);
  const [completedTasks, setCompletedTasks] = useState<number[]>(() => StorageService.load<number[]>(STORAGE_KEYS.ROADMAP_STATE, []));

  const archetype = t.archetypes[result.archetypeKey];
  const verdict = t.verdicts[result.verdictKey];

  const toggleTask = useCallback((day: number) => {
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.('light');
    setCompletedTasks(prev => {
        const next = prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day];
        StorageService.save(STORAGE_KEYS.ROADMAP_STATE, next);
        return next;
    });
  }, []);

  const handleBookConsultation = () => {
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.('heavy');
    // Psychologist's direct telegram link
    window.Telegram?.WebApp?.openTelegramLink?.('https://t.me/thndrrr');
  };

  return (
    <>
      <div className={`space-y-10 pb-32 animate-in px-4 pt-4 font-sans ${isGlitchMode ? 'glitch' : ''}`}>
        
        {/* HEADER PASSPORT STYLE */}
        <header className="bg-slate-950 p-6 rounded-[2rem] border border-slate-800 shadow-2xl space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-bl-[5rem] -mr-8 -mt-8 z-0"></div>
          <div className="relative z-10">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[9px] font-mono font-black text-indigo-400 uppercase tracking-[0.4em] bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20">{t.results.blueprint_title}</span>
                <span className="text-[10px] font-mono font-bold text-slate-500">REV. 7.2 BY LUKA SULAVA</span>
              </div>
              <h1 className="text-4xl font-black italic uppercase text-white leading-[0.85] tracking-tighter mb-4">
                {archetype.title}
              </h1>
              <div className="flex items-center gap-3">
                 <div className="h-0.5 flex-1 bg-gradient-to-r from-indigo-500 to-transparent"></div>
                 <span className="text-[10px] text-indigo-300 font-mono font-black uppercase tracking-widest">{result.status}</span>
              </div>
          </div>
        </header>

        {/* CONSULTATION CTA: THE BUSINESS BRIDGE */}
        <section className="bg-emerald-600 p-6 rounded-[2.5rem] text-white shadow-2xl flex flex-col items-center text-center space-y-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-white/5 opacity-10 pointer-events-none"></div>
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-2xl animate-bounce">💬</div>
            <div className="space-y-1 relative z-10">
                <h4 className="font-black uppercase text-base tracking-widest">Проработать «{verdict.label}»</h4>
                <p className="text-[10px] font-bold opacity-80 leading-tight">Получи пошаговый план трансформации своих денежных стратегий на личной сессии с Лукой Сулава</p>
            </div>
            <button 
                onClick={handleBookConsultation}
                className="w-full py-4 bg-white text-emerald-700 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg active:scale-95 transition-transform"
            >
                Записаться на сессию
            </button>
        </section>

        {/* NUCLEAR CONFLICT */}
        <section className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden transform hover:-translate-y-1 transition-transform">
           <div className="absolute top-0 right-0 p-8 opacity-10 text-8xl font-black select-none pointer-events-none">!!!</div>
           <span className="text-[9px] font-black text-indigo-200 uppercase tracking-[0.4em] block mb-4">{t.results.conflict_title}</span>
           <h3 className="text-xl font-black uppercase leading-tight italic mb-4">
              {t.conflicts[result.coreConflict]}
           </h3>
           <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20">
              <span className="text-[8px] font-black text-indigo-200 uppercase tracking-widest block mb-1">{t.results.shadow_directive_title}</span>
              <p className="text-xs font-bold leading-relaxed">{t.directives[result.shadowDirective]}</p>
           </div>
        </section>

        {/* INTERFERENCE INSIGHT */}
        {result.interferenceInsight && (
            <section className="bg-orange-50 border border-orange-200 p-6 rounded-[2.5rem] shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                    <span className="text-lg">🔗</span>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-800">{t.results.interference_title}</h3>
                </div>
                <p className="text-sm font-bold text-orange-950 leading-tight">
                    {t.interferences[result.interferenceInsight]}
                </p>
            </section>
        )}

        {/* NEURAL MAP GRID */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
             <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">{t.results.logTitle}</h3>
             <span className="text-[9px] font-mono text-indigo-500 font-bold uppercase">Decrypting Patterns</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {result.bugs.map((v, i) => (
              <button key={v} onClick={() => setSelectedBug(v)} className="aspect-square bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-lg shadow-sm active:scale-90 transition-transform hover:border-indigo-500 hover:shadow-md relative group">
                 <div className="absolute inset-0 bg-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
                 <span className="relative z-10">🧠</span>
                 <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></div>
              </button>
            ))}
            {result.bugs.length === 0 && <div className="col-span-4 p-8 text-center text-xs text-slate-400 font-mono">NO CRITICAL ANOMALIES FOUND</div>}
          </div>
          <p className="text-[9px] text-center text-slate-400 uppercase tracking-widest">{t.results.click_info}</p>
        </section>

        {/* VISUAL RADAR */}
        <div className="relative py-8 bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
            <span className="absolute top-6 left-8 text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">Vector Analysis</span>
            <RadarChart 
                points={result.graphPoints} 
                onLabelClick={(metric) => setShowMetricInfo(metric)} 
            />
        </div>

        {/* ROADMAP / PROTOCOL */}
        <section className="space-y-6">
           <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">{t.results.roadmap}</h3>
              <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-400">{completedTasks.length}/7</span>
                  <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500" style={{ width: `${(completedTasks.length/7)*100}%` }}></div>
                  </div>
              </div>
           </div>
           <div className="space-y-4">
              {result.roadmap.map((step, i) => {
                const isShadow = step.taskKey.startsWith('shadow');
                const isDone = completedTasks.includes(step.day);
                return (
                  <div key={i} onClick={() => toggleTask(step.day)} className={`p-6 rounded-[2.5rem] border space-y-3 relative overflow-hidden transition-all cursor-pointer ${
                    isDone ? 'opacity-40 grayscale scale-[0.98]' : 'hover:scale-[1.02]'
                  } ${
                    isShadow ? 'bg-slate-900 border-slate-800 text-white' : 
                    step.taskKey.startsWith('bug_fix') ? 'bg-indigo-50 border-indigo-100 text-slate-900' : 
                    'bg-white border-slate-100 text-slate-900'
                  }`}>
                    {isDone && <div className="absolute inset-0 flex items-center justify-center bg-white/10 z-20"><span className="text-indigo-600 font-black text-xs uppercase tracking-widest">{t.global.complete}</span></div>}
                    <div className="flex justify-between items-center">
                        <span className={`text-[8px] font-black uppercase tracking-widest ${isShadow ? 'text-indigo-400' : 'text-slate-400'}`}>Day 0{i+1}</span>
                        {isShadow && <span className="bg-indigo-600 px-2 py-0.5 rounded text-[7px] font-black uppercase">Deep Work</span>}
                    </div>
                    <div>
                        <h5 className="font-black text-sm uppercase italic leading-none mb-2">{getSceneText(`tasks.${step.taskKey}.title`)}</h5>
                        <p className={`text-[11px] leading-relaxed font-medium ${isShadow ? 'text-slate-400' : 'text-slate-500'}`}>
                           {getSceneText(`tasks.${step.taskKey}.method`)}
                        </p>
                    </div>
                  </div>
                );
              })}
           </div>
        </section>
        
        {/* FOOTER ACTIONS */}
        <div className="space-y-4 pt-6 pb-12">
           {nextRecommendedId < TOTAL_NODES && (
             <button onClick={onContinue} className="w-full p-6 bg-indigo-600 text-white rounded-[2rem] font-black uppercase text-sm tracking-[0.2em] shadow-2xl shadow-indigo-200 active:scale-95 transition-all flex items-center justify-center gap-3">
               <span>{t.global.next_node}</span>
               <span className="text-xl">→</span>
             </button>
           )}
           <div className="grid grid-cols-2 gap-4">
                <button onClick={onShare} className="w-full p-5 bg-slate-950 text-white rounded-[2rem] font-black uppercase text-[10px] tracking-[0.15em] shadow-lg active:scale-95 transition-all">
                    {t.results.share_button}
                </button>
                <button onClick={onBack} className="w-full p-5 bg-white text-slate-900 border border-slate-200 rounded-[2rem] font-black uppercase text-[10px] tracking-[0.15em] active:scale-95 transition-all">
                    {t.results.back}
                </button>
           </div>
        </div>
      </div>

      {/* BUG MODAL */}
      {selectedBug && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-md animate-in" onClick={() => setSelectedBug(null)}>
            <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl max-w-sm space-y-6 w-full relative overflow-hidden" onClick={e => e.stopPropagation()}>
               <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
               <h4 className="font-black text-lg uppercase italic text-slate-900 leading-none">{t.beliefs[selectedBug]}</h4>
               <p className="text-xs text-slate-600 leading-relaxed font-bold bg-slate-50 p-4 rounded-2xl border border-slate-100">{t.explanations[selectedBug]}</p>
               <button onClick={() => setSelectedBug(null)} className="w-full p-4 bg-slate-900 text-white rounded-xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-transform">Close</button>
            </div>
         </div>
      )}

      {/* METRIC INFO MODAL */}
      {showMetricInfo && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-indigo-950/90 backdrop-blur-md animate-in" onClick={() => setShowMetricInfo(null)}>
            <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl max-w-sm space-y-4 text-center w-full" onClick={e => e.stopPropagation()}>
               <h4 className="font-black text-xs uppercase text-indigo-600 tracking-widest border-b pb-2 mx-10">{showMetricInfo}</h4>
               <p className="text-xs text-slate-800 font-bold leading-relaxed">{t.metric_definitions[showMetricInfo as keyof typeof t.metric_definitions]}</p>
               <button onClick={() => setShowMetricInfo(null)} className="w-full p-4 bg-indigo-600 text-white rounded-xl font-black uppercase text-[10px] mt-4 tracking-widest active:scale-95 transition-transform">Understood</button>
            </div>
         </div>
      )}
    </>
  );
});
