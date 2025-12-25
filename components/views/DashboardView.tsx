
import React, { memo, useMemo } from 'react';
import { DomainType, Translations, AnalysisResult } from '../../types';
import { DOMAIN_SETTINGS } from '../../constants';

export interface NodeUI {
  id: number;
  domain: DomainType;
  active: boolean;
  done: boolean;
}

interface DashboardViewProps {
  t: Translations;
  isDemo: boolean;
  globalProgress: number;
  result: AnalysisResult | null;
  currentDomain: DomainType | null;
  nodes: NodeUI[];
  completedNodeIds: number[];
  onSetView: (view: 'results' | 'auth') => void;
  onSetCurrentDomain: (domain: DomainType | null) => void;
  onStartNode: (id: number, domain: DomainType) => void;
  onLogout: () => void;
}

export const DashboardView = memo<DashboardViewProps>(({
  t, isDemo, globalProgress, result, currentDomain, nodes, completedNodeIds,
  onSetView, onSetCurrentDomain, onStartNode, onLogout
}) => {
  
  const humanInsight = useMemo(() => {
    if (!result) return t.dashboard.desc;
    const { entropyScore, neuroSync, integrity } = result;
    if (entropyScore > 60) return t.dashboard.insight_noise;
    if (neuroSync < 45) return t.dashboard.insight_somatic_dissonance;
    if (integrity > 75) return t.dashboard.insight_coherence;
    return t.dashboard.desc;
  }, [result, t]);

  return (
    <div className="space-y-6 animate-in flex flex-col h-full">
      <header className="space-y-3 shrink-0">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Status <span className="text-indigo-600">Report</span>
        </h2>
        <div className={`p-4 rounded-2xl border transition-all duration-500 ${result && result.entropyScore > 60 ? 'bg-red-50 border-red-100' : 'bg-indigo-50/50 border-indigo-100/30'}`}>
           <p className={`text-[11px] font-bold italic leading-relaxed ${result && result.entropyScore > 60 ? 'text-red-700' : 'text-indigo-700'}`}>
              {humanInsight}
           </p>
        </div>
      </header>

      {/* CORE METRICS CARD */}
      <section 
        className="dark-glass-card p-6 rounded-[2rem] shadow-2xl relative overflow-hidden shrink-0 group cursor-pointer transition-transform active:scale-[0.98]" 
        onClick={() => result && onSetView('results')}
      >
         <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl -mr-8 -mt-8"></div>
         
         <div className="flex justify-between items-end relative z-10">
            <div className="space-y-1">
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">System Audit</span>
               <div className="text-2xl font-black text-white italic uppercase tracking-tighter">
                  {t.global.progress} <span className="text-indigo-400">{globalProgress}%</span>
               </div>
            </div>
            {result && (
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 border border-white/10 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-500 transition-all">
                    ➜
                </div>
            )}
         </div>

         <div className="mt-6 space-y-4 relative z-10">
            {[
              { label: t.results.integrity, val: result?.integrity || 0, color: 'bg-emerald-400' },
              { label: t.results.neuro_sync, val: result?.neuroSync || 0, color: 'bg-indigo-400' }
            ].map(m => (
              <div key={m.label} className="space-y-1.5">
                 <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-slate-500">
                    <span>{m.label}</span>
                    <span className="text-slate-300">{m.val}%</span>
                 </div>
                 <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full ${m.color} shadow-[0_0_8px_rgba(16,185,129,0.3)] transition-all duration-1000`} style={{ width: `${m.val}%` }}></div>
                 </div>
              </div>
            ))}
         </div>
      </section>

      {!currentDomain ? (
        <div className="space-y-3 flex-1">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 px-1">{t.dashboard.select_domain}</h3>
          <div className="grid grid-cols-1 gap-3 pb-8">
            {DOMAIN_SETTINGS.map(config => {
                const domainNodes = nodes.filter(n => n.domain === config.key);
                const doneCount = domainNodes.filter(n => n.done).length;
                const totalCount = domainNodes.length;
                const domainProgress = Math.round((doneCount / totalCount) * 100);

                return (
                    <button 
                        key={config.key} 
                        onClick={() => onSetCurrentDomain(config.key)} 
                        className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-between hover:border-indigo-200 transition-all active:scale-[0.98] group relative overflow-hidden"
                    >
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black transition-transform group-hover:scale-110" style={{ backgroundColor: config.color, color: config.color.replace('0.08', '0.8') }}>
                                {config.key[0].toUpperCase()}
                            </div>
                            <div className="text-left">
                                <span className="text-sm font-black text-slate-900 uppercase tracking-tight">{t.domains[config.key]}</span>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-500/50" style={{ width: `${domainProgress}%` }}></div>
                                    </div>
                                    <span className="text-[8px] font-bold text-slate-400">{doneCount}/{totalCount}</span>
                                </div>
                            </div>
                        </div>
                        <span className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all">➜</span>
                    </button>
                );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in flex-1 flex flex-col">
          <div className="flex justify-between items-center shrink-0">
            <button onClick={() => onSetCurrentDomain(null)} className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase bg-indigo-50 px-3 py-2 rounded-xl hover:bg-indigo-100 transition-colors">
                <span className="text-xs">←</span> {t.global.back || 'Back'}
            </button>
            <h3 className="text-lg font-black italic uppercase text-slate-900 tracking-tight">{t.domains[currentDomain]}</h3>
          </div>
          
          <div className="bg-slate-50/50 rounded-[2rem] p-6 flex-1 border border-slate-100/50">
              <div className="grid grid-cols-5 gap-3">
                 {nodes.filter(n => n.domain === currentDomain).map(n => (
                    <button 
                      key={n.id} 
                      disabled={!n.active || n.done} 
                      onClick={() => onStartNode(n.id, n.domain)}
                      className={`aspect-square rounded-xl border transition-all flex items-center justify-center text-xs font-bold relative overflow-hidden ${
                        n.done ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' :
                        n.active ? 'bg-white border-indigo-100 text-indigo-600 shadow-sm active:scale-90 hover:border-indigo-300' :
                        'bg-slate-100 border-slate-100 text-slate-300 cursor-not-allowed opacity-40'
                      }`}
                    >
                       <span className="relative z-10">{n.done ? '✔' : n.id + 1}</span>
                       {n.active && !n.done && <div className="absolute inset-0 bg-indigo-500/5 animate-pulse"></div>}
                    </button>
                 ))}
              </div>
          </div>
        </div>
      )}
    </div>
  );
});
