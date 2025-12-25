
import React, { memo } from 'react';
import { ScanHistory } from '../types';

interface EvolutionDashboardProps {
  history: ScanHistory;
}

const Sparkline = ({ data, color, height = 40 }: { data: number[], color: string, height?: number }) => {
  if (data.length < 2) return <div className="text-[10px] text-slate-400 font-mono italic">Insufficient data for trend analysis...</div>;
  
  const width = 200;
  const padding = 5;
  const max = Math.max(...data, 100);
  const min = Math.min(...data, 0);
  const range = max - min;
  
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
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
      {data.map((v, i) => {
        const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
        const y = height - ((v - min) / range) * (height - padding * 2) - padding;
        return <circle key={i} cx={x} cy={y} r="3" fill={color} />;
      })}
    </svg>
  );
};

export const EvolutionDashboard: React.FC<EvolutionDashboardProps> = memo(({ history }) => {
  if (history.scans.length < 1) return null;

  return (
    <section className="dark-glass-card p-6 rounded-[2.5rem] border border-white/10 space-y-6">
      <div className="flex justify-between items-center">
         <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-indigo-400">System Evolution</h3>
         <span className="text-[9px] font-mono text-slate-500">{history.scans.length} Scans Total</span>
      </div>

      <div className="grid grid-cols-1 gap-6">
         <div className="space-y-3">
            <div className="flex justify-between text-[9px] font-black uppercase text-slate-400 tracking-widest">
                <span>Integrity Drift</span>
                <span className="text-emerald-400">Trend</span>
            </div>
            <Sparkline data={history.evolutionMetrics.integrityTrend} color="#10b981" />
         </div>

         <div className="space-y-3">
            <div className="flex justify-between text-[9px] font-black uppercase text-slate-400 tracking-widest">
                <span>Entropy Decay</span>
                <span className="text-red-400">Trend</span>
            </div>
            <Sparkline data={history.evolutionMetrics.entropyTrend} color="#ef4444" />
         </div>
      </div>

      <div className="pt-4 border-t border-white/5 space-y-2">
         {history.scans.slice(-3).reverse().map((scan, i) => (
            <div key={i} className="flex justify-between items-center text-[10px] font-mono opacity-60">
                <span className="text-slate-400">{new Date(scan.timestamp).toLocaleDateString()}</span>
                <span className="text-white font-black">{scan.archetypeKey.replace('THE_', '')}</span>
                <span className={scan.systemHealth > 60 ? 'text-emerald-500' : 'text-red-500'}>{scan.systemHealth}%</span>
            </div>
         ))}
      </div>
    </section>
  );
});
