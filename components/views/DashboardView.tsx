
import React, { memo, useMemo } from 'react';
import { DomainType, Translations, AnalysisResult, ScanHistory } from '../../types';
import { DOMAIN_SETTINGS, SYSTEM_METADATA } from '../../constants';
import { EvolutionDashboard } from '../EvolutionDashboard';

export interface NodeUI {
  id: number;
  domain: DomainType;
  active: boolean;
  done: boolean;
}

interface DashboardViewProps {
  lang: 'ru' | 'ka';
  t: Translations;
  isDemo: boolean;
  globalProgress: number;
  result: AnalysisResult | null;
  currentDomain: DomainType | null;
  nodes: NodeUI[];
  completedNodeIds: number[];
  onSetView: (view: 'results' | 'auth' | 'compatibility' | 'guide') => void;
  onSetCurrentDomain: (domain: DomainType | null) => void;
  onStartNode: (id: number, domain: DomainType) => void;
  onLogout: () => void;
  scanHistory: ScanHistory | null;
}

export const DashboardView = memo<DashboardViewProps>(({
  lang, t, isDemo, globalProgress, result, currentDomain, nodes, completedNodeIds,
  onSetView, onSetCurrentDomain, onStartNode, onLogout, scanHistory
}) => {
  
  const humanInsight = useMemo(() => {
    if (!result) return t.dashboard.desc;
    if (globalProgress === 100) return t.global.complete + ". " + t.dashboard.insight_coherence;
    
    const { entropyScore, neuroSync, integrity } = result;
    if (entropyScore > 60) return t.dashboard.insight_noise;
    if (neuroSync < 45) return t.dashboard.insight_somatic_dissonance;
    if (integrity > 75) return t.dashboard.insight_coherence;
    return t.dashboard.desc;
  }, [result, t, globalProgress]);

  const activeDomainCount = useMemo(() => 
    DOMAIN_SETTINGS.filter(d => nodes.filter(n => n.domain === d.key && n.done).length === d.count).length
  , [nodes]);

  const needsRetest = useMemo(() => {
      if (!scanHistory || scanHistory.scans.length === 0) return false;
      const latest = scanHistory.scans[scanHistory.scans.length - 1];
      return latest.createdAt ? (Date.now() - latest.createdAt > 7 * 24 * 60 * 60 * 1000) : false;
  }, [scanHistory]);

  return (
    <div className="space-y-6 animate-in flex flex-col h-full">
      <header className="space-y-3 shrink-0">
        <div className="flex justify-between items-center px-1">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2 italic">
                {t.ui.status_report_title}
            </h2>
            <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-tighter">OVERSIGHT_v{SYSTEM_METADATA.VERSION.split('-')[0]}</span>
            </div>
        </div>
        
        {needsRetest && (
            <div className="bg-amber-50 border-2 border-amber-200 p-4 rounded-[1.5rem] space-y-1 shadow-lg shadow-amber-200/20 animate-pulse">
                <h4 className="text-[10px] font-black text-amber-700 uppercase tracking-widest flex items-center gap-2">
                    <span>⚠️</span> {t.dashboard.retest_ready}
                </h4>
                <p className="text-[11px] font-bold text-amber-900 italic leading-tight">{t.dashboard.retest_desc}</p>
            </div>
        )}

        <div className={`p-4 rounded-2xl border transition-all duration-500 ${result && result.entropyScore > 60 ? 'bg-red-50 border-red-100 shadow-red-100/50' : 'bg-indigo-50/50 border-indigo-100/30'}`}>
           <p className={`text-[11px] font-bold italic leading-relaxed ${result && result.entropyScore > 60 ? 'text-red-700' : 'text-indigo-700'}`}>
              {humanInsight}
           </p>
        </div>
      </header>

      <EvolutionDashboard history={scanHistory} lang={lang} />

      <section 
        className={`p-6 rounded-[2.5rem] shadow-2xl relative overflow-hidden shrink-0 group cursor-pointer transition-all active:scale-[0.98] ${globalProgress === 100 ? 'bg-indigo-600 ring-4 ring-indigo-500/20' : 'dark-glass-card'}`} 
        onClick={() => result && onSetView('results')}
      >
         <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8 animate-pulse"></div>
         
         <div className="flex justify-between items-end relative z-10">
            <div className="space-y-1">
               <span className={`text-[10px] font-black uppercase tracking-widest ${globalProgress === 100 ? 'text-indigo-200' : 'text-slate-500'}`}>{t.ui.system_audit_title}</span>
               <div className={`text-2xl font-black italic uppercase tracking-tighter ${globalProgress === 100 ? 'text-white' : 'text-white'}`}>
                  {t.ui.progress_label} <span className={globalProgress === 100 ? 'text-emerald-300' : 'text-indigo-400'}>{globalProgress}%</span>
               </div>
            </div>
            {result && (
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${globalProgress === 100 ? 'bg-white text-indigo-600' : 'bg-white/5 text-white/40 border border-white/10 group-hover:bg-indigo-600 group-hover:text-white'}`}>
                    ➜
                </div>
            )}
         </div>

         <div className="mt-6 space-y-4 relative z-10">
            {[
              { label: t.results.integrity, val: result?.integrity || 0, color: globalProgress === 100 ? 'bg-emerald-300' : 'bg-emerald-400' },
              { label: t.results.neuro_sync, val: result?.neuroSync || 0, color: globalProgress === 100 ? 'bg-white' : 'bg-indigo-400' }
            ].map(m => (
              <div key={m.label} className="space-y-1.5">
                 <div className={`flex justify-between text-[8px] font-black uppercase tracking-widest ${globalProgress === 100 ? 'text-indigo-100' : 'text-slate-500'}`}>
                    <span>{m.label}</span>
                    <span>{m.val}%</span>
                 </div>
                 <div className={`h-1.5 rounded-full overflow-hidden ${globalProgress === 100 ? 'bg-white/20' : 'bg-white/5'}`}>
                    <div className={`h-full ${m.color} transition-all duration-1000 shadow-[0_0_10px_rgba(255,255,255,0.2)]`} style={{ width: `${m.val}%` }}></div>
                 </div>
              </div>
            ))}
         </div>
      </section>

      <div className="grid grid-cols-2 gap-3 px-1">
          <button 
            onClick={() => onSetView('compatibility')} 
            className="py-4 bg-slate-900 rounded-2xl flex flex-col items-center justify-center px-4 active:scale-95 transition-all shadow-lg border border-slate-800"
          >
             <span className="text-xl mb-1">📟</span>
             <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{t.dashboard.open_terminal}</span>
          </button>

          <button 
            onClick={() => onSetView('guide')} 
            className="py-4 bg-white rounded-2xl flex flex-col items-center justify-center px-4 active:scale-95 transition-all shadow-md border border-slate-200 group"
          >
             <span className="text-xl mb-1 group-hover:scale-110 transition-transform">🧭</span>
             <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{t.dashboard.manual_btn}</span>
          </button>
      </div>

      {!currentDomain ? (
        <div className="space-y-3 flex-1">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{t.dashboard.select_domain}</h3>
            <span className="text-[9px] font-mono font-bold text-slate-300 uppercase">{activeDomainCount} / 5 {t.ui.secured_label}</span>
          </div>
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
                        className={`p-5 rounded-2xl border flex items-center justify-between transition-all active:scale-[0.98] group relative overflow-hidden ${domainProgress === 100 ? 'bg-slate-900 border-indigo-500 shadow-indigo-500/10' : 'bg-white border-slate-100 shadow-sm'}`}
                    >
                        <div className="flex items-center gap-4 relative z-10">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black transition-transform group-hover:scale-110 ${domainProgress === 100 ? 'bg-indigo-600 text-white' : ''}`} style={domainProgress < 100 ? { backgroundColor: config.color, color: config.color.replace('0.08', '0.8') } : {}}>
                                {config.key[0].toUpperCase()}
                            </div>
                            <div className="text-left">
                                <span className={`text-sm font-black uppercase tracking-tight ${domainProgress === 100 ? 'text-white' : 'text-slate-900'}`}>{t.domains[config.key]}</span>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <div className={`w-16 h-1 rounded-full overflow-hidden ${domainProgress === 100 ? 'bg-white/10' : 'bg-slate-100'}`}>
                                        <div className={`h-full ${domainProgress === 100 ? 'bg-emerald-400' : 'bg-indigo-500/50'}`} style={{ width: `${domainProgress}%` }}></div>
                                    </div>
                                    <span className={`text-[8px] font-bold ${domainProgress === 100 ? 'text-indigo-300' : 'text-slate-400'}`}>{doneCount}/{totalCount}</span>
                                </div>
                            </div>
                        </div>
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${domainProgress === 100 ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-300'}`}>➜</span>
                    </button>
                );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in flex-1 flex flex-col">
          <div className="flex justify-between items-center shrink-0">
            <button onClick={() => onSetCurrentDomain(null)} className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase bg-indigo-50 px-3 py-2 rounded-xl hover:bg-indigo-100 transition-colors">
                <span className="text-xs">←</span> {t.global.back}
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
