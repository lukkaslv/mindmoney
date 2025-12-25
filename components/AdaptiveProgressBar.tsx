
import React, { memo } from 'react';

interface AdaptiveProgressBarProps {
  clarity: number;
  isAdaptive: boolean;
  contradictionsCount: number;
  confidenceScore?: number;
}

export const AdaptiveProgressBar: React.FC<AdaptiveProgressBarProps> = memo(({ clarity, isAdaptive, contradictionsCount, confidenceScore }) => {
  return (
    <div className="space-y-2 shrink-0 animate-in">
      <div className="flex justify-between items-end">
         <div className="flex flex-col">
            <span className="text-[8px] font-mono font-black text-slate-400 uppercase tracking-widest">Neural Clarity</span>
            <span className={`text-[12px] font-black italic ${clarity > 80 ? 'text-emerald-500' : 'text-indigo-600'}`}>{Math.round(clarity)}%</span>
         </div>
         <div className="flex flex-col items-end">
            <span className="text-[8px] font-mono font-black text-slate-400 uppercase tracking-widest">Confidence</span>
            <span className="text-[10px] font-black text-slate-600">{confidenceScore ?? 100}%</span>
         </div>
      </div>
      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden relative">
         <div 
            className={`h-full transition-all duration-700 ease-out ${clarity > 80 ? 'bg-emerald-500' : 'bg-indigo-500'}`} 
            style={{ width: `${clarity}%` }}
         ></div>
      </div>
      {isAdaptive && contradictionsCount > 0 && (
        <div className="flex justify-between">
           <span className="text-[7px] font-black text-amber-500 uppercase tracking-widest animate-pulse flex items-center gap-1">
                Adaptive Scanning Active
           </span>
           <span className="text-[7px] font-black text-slate-400 uppercase">{contradictionsCount} Tension Points</span>
        </div>
      )}
    </div>
  );
});
