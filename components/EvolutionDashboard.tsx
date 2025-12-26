
import React, { memo } from 'react';
import { ScanHistory, Translations } from '../types';
import { translations } from '../translations';

interface EvolutionDashboardProps {
  history: ScanHistory | null;
  lang: 'ru' | 'ka';
}

const Sparkline = ({ data, color, height = 40 }: { data: number[], color: string, height?: number }) => {
  if (data.length < 2) return <div className="h-[40px] flex items-center bg-slate-900/20 rounded-lg px-3"><span className="text-[8px] text-slate-500 font-mono uppercase tracking-widest animate-pulse">...</span></div>;
  
  const width = 200;
  const padding = 5;
  const max = Math.max(...data, 100);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
    const y = height - ((v - min) / range) * (height - padding * 2) - padding;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
      {data.map((v, i) => {
        const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
        const y = height - ((v - min) / range) * (height - padding * 2) - padding;
        return <circle key={i} cx={x} cy={y} r="4" fill={color} />;
      })}
    </svg>
  );
};

export const EvolutionDashboard: React.FC<EvolutionDashboardProps> = memo(({ history, lang }) => {
  const t = translations[lang];
  const hasHistory = history && history.scans.length > 0;
  const scansCount = history?.scans.length || 0;

  return (
    <section className="dark-glass-card p-6 rounded-[2.5rem] border border-white/10 space-y-6 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-5 text-4xl">📈</div>
      
      <div className="flex justify-between items-center relative z-10">
         <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-indigo-400 italic">{t.ui.evolution_title}</h3>
         <span className="text-[9px] font-mono text-slate-500 font-bold">{scansCount} {t.ui.sessions_secured}</span>
      </div>

      {!hasHistory ? (
          <div className="py-4 space-y-3 relative z-10">
              <div className="h-2 bg-white/5 rounded-full w-full"></div>
              <div className="h-2 bg-white/5 rounded-full w-2/3"></div>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest pt-2">{t.ui.first_investigation_hint}</p>
          </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 relative z-10">
             <div className="space-y-3">
                <div className="flex justify-between text-[9px] font-black uppercase text-slate-400 tracking-widest">
                    <span>{t.ui.integrity_drift}</span>
                    <span className="text-emerald-400 font-mono">OK</span>
                </div>
                <Sparkline data={history.evolutionMetrics.integrityTrend} color="#10b981" />
             </div>

             <div className="space-y-3">
                <div className="flex justify-between text-[9px] font-black uppercase text-slate-400 tracking-widest">
                    <span>{t.ui.noise_tracking}</span>
                    <span className="text-red-400 font-mono">TRACKING</span>
                </div>
                <Sparkline data={history.evolutionMetrics.entropyTrend} color="#f43f5e" />
             </div>

             <div className="pt-2 border-t border-white/5">
                <p className="text-[9px] text-slate-500 leading-relaxed italic">
                    {(history.evolutionMetrics.integrityTrend[history.evolutionMetrics.integrityTrend.length-1] > 70) ? t.ui.evolution_insight_optimizing : t.ui.evolution_insight_stabilizing}. 
                    {t.ui.evolution_insight_desc}
                </p>
             </div>
        </div>
      )}
    </section>
  );
});
