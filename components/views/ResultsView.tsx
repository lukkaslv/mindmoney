
import React, { useState, memo, useCallback } from 'react';
import { AnalysisResult, BeliefKey, Translations } from '../../types';
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
  const secondary = result.secondaryArchetypeKey ? t.archetypes[result.secondaryArchetypeKey] : null;
  const verdict = t.verdicts[result.verdictKey];

  const toggleTask = useCallback((day: number) => {
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.('light');
    setCompletedTasks(prev => {
        const next = prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day];
        StorageService.save(STORAGE_KEYS.ROADMAP_STATE, next);
        return next;
    });
  }, []);

  return (
    <>
      <div className={`space-y-10 pb-32 animate-in px-1 pt-2 font-sans ${isGlitchMode ? 'glitch' : ''}`}>
        
        {/* PREMIUM BLUEPRINT HEADER */}
        <header className="dark-glass-card p-8 rounded-[2.5rem] shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
          
          <div className="relative z-10 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20">
                    {t.results.blueprint_title}
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-500">K-SYNC: {result.neuroSync}%</span>
              </div>
              
              <div className="space-y-1">
                <h1 className="text-4xl font-black italic uppercase text-white leading-none tracking-tighter">
                    {archetype.title}
                </h1>
                <p className="text-xs text-slate-400 font-medium leading-relaxed opacity-80 pt-2">
                    {archetype.desc}
                </p>
              </div>
          </div>
        </header>

        {/* NEURAL CORRELATION MAP (THE "WHY" SECTION) */}
        <section className="space-y-4">
           <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-900 px-2">Neural Correlation Map</h3>
           <div className="space-y-2">
              {result.correlations.map((cor, i) => (
                <div key={i} className="flex gap-4 p-4 glass-card rounded-2xl border border-slate-100 items-center">
                   <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs shadow-inner ${cor.type === 'resistance' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'}`}>
                      {cor.type === 'resistance' ? '⚡' : '✨'}
                   </div>
                   <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                         <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">{t.domains[cor.domain]} // NODE {parseInt(cor.nodeId) + 1}</span>
                         <span className={`text-[7px] font-black px-1.5 py-0.5 rounded uppercase ${cor.type === 'resistance' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>
                            {t.correlation_types[cor.type]}
                         </span>
                      </div>
                      <p className="text-[10px] font-bold text-slate-800 leading-snug italic">
                        {t.explanations[cor.descriptionKey.split('_').pop() as any] || t.beliefs[cor.descriptionKey.split('_').pop() as any]}
                      </p>
                   </div>
                </div>
              ))}
           </div>
        </section>

        {/* SOMATIC INTEGRITY PROFILE */}
        <section className="bg-slate-900 p-6 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
            <div className="flex justify-between items-center mb-6">
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Somatic Integrity</span>
               <div className="text-[9px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded">DOMINANT: {t.sync[result.somaticProfile.dominantSensation]}</div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center space-y-1">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Blocks Found</span>
                  <div className="text-2xl font-black text-red-400">{result.somaticProfile.blocks}</div>
               </div>
               <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center space-y-1">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Resource Spikes</span>
                  <div className="text-2xl font-black text-emerald-400">{result.somaticProfile.resources}</div>
               </div>
            </div>
        </section>

        {/* INTERACTIVE RADAR */}
        <div className="relative py-10 glass-card rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden text-center">
            <span className="absolute top-6 left-1/2 -translate-x-1/2 text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Multi-Vector Synthesis</span>
            <RadarChart 
                points={result.graphPoints} 
                onLabelClick={(metric) => setShowMetricInfo(metric)} 
            />
        </div>

        {/* ROADMAP PROTOCOL */}
        <section className="space-y-6">
           <div className="flex items-center justify-between px-2">
              <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-900">{t.results.roadmap}</h3>
              <div className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-mono font-bold text-slate-500">
                {completedTasks.length} / 7 COMPLETE
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
        
        {/* ACTION BUTTONS */}
        <div className="grid grid-cols-1 gap-4 pt-6">
           {nextRecommendedId < TOTAL_NODES && (
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
