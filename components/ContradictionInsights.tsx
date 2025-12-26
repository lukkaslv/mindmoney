
import React from 'react';
import { Contradiction, Translations } from '../types';

interface ContradictionInsightsProps {
  contradictions: Contradiction[];
  t: Translations;
}

export const ContradictionInsights: React.FC<ContradictionInsightsProps> = ({ contradictions, t }) => {
  if (contradictions.length === 0) return null;

  return (
    <section className="space-y-4 animate-in">
        <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-amber-600 px-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-amber-500 rounded-full animate-ping"></span>
            Structural Contradictions
        </h3>
        <div className="space-y-3">
            {contradictions.slice(0, 5).map((c, i) => (
                <div key={i} className="p-5 bg-amber-50/50 border border-amber-100 rounded-[2rem] space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-[8px] font-mono font-black text-amber-600 uppercase">Analysis // Node {parseInt(c.nodeId) + 1}</span>
                        <span className="text-[7px] bg-amber-500 text-white px-1.5 py-0.5 rounded uppercase font-bold">{c.type.replace('_', ' ')}</span>
                    </div>
                    <p className="text-[11px] font-bold text-amber-900 italic leading-tight">
                        {c.description}. Your social persona is conflicting with your internal system signals here.
                    </p>
                </div>
            ))}
        </div>
    </section>
  );
};