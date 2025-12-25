
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
    const { integrity, entropyScore, neuroSync } = result;
    
    if (entropyScore > 60) return t.dashboard.insight_noise;
    if (neuroSync < 45) return t.dashboard.insight_somatic_dissonance;
    if (integrity > 75) return t.dashboard.insight_coherence;
    if (globalProgress > 50) return t.dashboard.insight_progress;
    
    return t.dashboard.desc;
  }, [result, globalProgress, t]);

  return (
    <div className="space-y-8 animate-in px-4 pb-24 h-full flex flex-col">
      <header className="border-l-4 border-indigo-500 pl-5 shrink-0 mt-4 relative">
        <div className="absolute left-[-4px] top-0 h-full w-[4px] bg-indigo-500 animate-pulse"></div>
        <h2 className="text-4xl font-black italic uppercase text-slate-900 leading-none">{t.dashboard.title}</h2>
        
        <div className={`mt-3 p-4 rounded-2xl border transition-all duration-700 ${result && result.entropyScore > 60 ? 'bg-red-50 border-red-100 animate-pulse' : 'bg-indigo-50/50 border-indigo-100/50'} relative group overflow-hidden`}>
           <div className="absolute top-0 right-0 p-2 opacity-10 text-indigo-500 font-black text-xl select-none">“</div>
           <p className={`text-[11px] font-bold italic leading-tight pr-4 ${result && result.entropyScore > 60 ? 'text-red-700' : 'text-indigo-700'}`}>
              {humanInsight}
           </p>
        </div>
      </header>

      <section 
        className="bg-slate-950 p-6 rounded-[2.5rem] border border-slate-800 shadow-2xl relative overflow-hidden shrink-0 group cursor-pointer transition-transform active:scale-[0.99]" 
        onClick={() => result && onSetView('results')}
      >
         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent w-full h-full animate-scan-line pointer-events-none"></div>
         
         <div className="flex justify-between items-start relative z-10 text-white">
            <div className="space-y-1">
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">{t.global.level}</span>
               <span className="text-3xl font-black text-indigo-400 italic uppercase leading-none">Lvl_{Math.floor(globalProgress / 20) + 1}</span>
            </div>
            <div className="text-right">
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">{t.global.progress}</span>
               <span className="text-2xl font-black italic">{globalProgress}%</span>
            </div>
         </div>

         <div className="mt-6 space-y-3 relative z-10">
            {[
              { label: t.results.integrity, val: result?.integrity || 0, color: 'bg-emerald-500' },
              { label: t.results.neuro_sync, val: result?.neuroSync || 0, color: 'bg-indigo-500' }
            ].map(m => (
              <div key={m.label} className="space-y-1">
                 <div className="flex justify-between text-[7px] font-black uppercase tracking-widest text-slate-500">
                    <span>{m.label}</span>
                    <span>{m.val}%</span>
                 </div>
                 <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full ${m.color} transition-all duration-1000`} style={{ width: `${m.val}%` }}></div>
                 </div>
              </div>
            ))}
         </div>

         <div className="mt-6 h-1.5 bg-slate-900 rounded-full overflow-hidden relative">
            <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${globalProgress}%` }}></div>
         </div>
         
         {result && (
           <div className="mt-4 flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
              <span className="text-[9px] text-white font-black uppercase tracking-widest">Open Analysis</span>
              <span className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[9px]">➜</span>
           </div>
         )}
      </section>

      {isDemo && completedNodeIds.length >= 3 && (
          <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-[2rem] text-center space-y-3 shrink-0">
              <p className="text-xs text-indigo-800 font-medium leading-tight">Trial Limit Reached. Unlock full potential to continue.</p>
              <button onClick={onLogout} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg active:scale-95 transition-transform">Unlock Full Access</button>
          </div>
      )}

      {!currentDomain ? (
        <div className="grid grid-cols-1 gap-3 flex-1 overflow-y-auto pb-4">
          {DOMAIN_SETTINGS.map(config => (
            <button 
                key={config.key} 
                onClick={() => onSetCurrentDomain(config.key)} 
                className="p-6 rounded-[2rem] bg-white border border-slate-100 shadow-sm flex items-center justify-between hover:border-indigo-300 transition-all active:scale-[0.98] group relative overflow-hidden"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity" style={{ backgroundColor: config.color.replace('0.08', '0.5') }}></div>
              
              <div className="flex items-center gap-4 relative z-10">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-black" style={{ backgroundColor: config.color }}>
                     {config.key[0].toUpperCase()}
                  </div>
                  <span className="text-lg font-black text-slate-900 italic uppercase">{t.domains[config.key]}</span>
              </div>
              <span className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-indigo-400 font-mono text-[10px] group-hover:bg-indigo-500 group-hover:text-white transition-colors">➜</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-6 animate-in flex-1 flex flex-col">
          <div className="flex justify-between items-center shrink-0">
            <button onClick={() => onSetCurrentDomain(null)} className="text-[10px] font-black text-slate-400 uppercase bg-slate-100 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors">← Sectors</button>
            <h3 className="text-xl font-black italic uppercase text-slate-900 tracking-tight">{t.domains[currentDomain]}</h3>
          </div>
          
          <div className="bg-slate-50 rounded-[2.5rem] p-6 flex-1 border border-slate-100/50">
              <div className="grid grid-cols-5 gap-3">
                 {nodes.filter(n => n.domain === currentDomain).map(n => (
                    <button key={n.id} disabled={!n.active || n.done} onClick={() => onStartNode(n.id, n.domain)}
                      className={`aspect-square rounded-2xl border transition-all flex items-center justify-center text-sm font-mono relative overflow-hidden ${
                        n.done ? 'bg-indigo-600 border-indigo-500 text-white shadow-md' :
                        n.active ? 'bg-white border-indigo-200 text-indigo-600 shadow-sm active:scale-90 hover:border-indigo-400' :
                        'bg-slate-100 border-slate-100 text-slate-300 cursor-not-allowed opacity-50'
                      }`}
                    >
                       {n.active && !n.done && <div className="absolute inset-0 bg-indigo-500/10 animate-pulse"></div>}
                       <span className="relative z-10">{n.done ? '✔' : (isDemo && n.id >= 3) ? '🔒' : n.id + 1}</span>
                    </button>
                 ))}
              </div>
          </div>
        </div>
      )}
    </div>
  );
});
