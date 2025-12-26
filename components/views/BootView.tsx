
import React, { useEffect, useState, useMemo } from 'react';
import { Translations } from '../../types';

interface BootViewProps {
  isDemo: boolean;
  onComplete: () => void;
  t: Translations;
}

export const BootView: React.FC<BootViewProps> = ({ isDemo, onComplete, t }) => {
  const [bootStep, setBootStep] = useState(0);
  const steps = t.boot_sequence;

  useEffect(() => {
    const timer = setInterval(() => {
      setBootStep(prev => {
        if (prev < steps.length - 1) return prev + 1;
        clearInterval(timer);
        return prev;
      });
    }, 600);

    return () => clearInterval(timer);
  }, [steps]);

  useEffect(() => {
    if (bootStep === steps.length - 1) {
        const finishTimer = setTimeout(onComplete, 1200);
        return () => clearTimeout(finishTimer);
    }
  }, [bootStep, steps.length, onComplete]);

  return (
    <div className="flex flex-col justify-center py-20 px-10 space-y-6 font-mono h-full bg-slate-50">
      {steps.slice(0, bootStep + 1).map((m, i) => (
        <div key={i} className="flex gap-4 animate-in">
          <span className="text-indigo-500 font-bold animate-pulse">{">>>"}</span>
          <span className={`text-xs font-black uppercase tracking-widest ${i === bootStep ? 'text-slate-900' : 'text-slate-400'}`}>
            {m}
          </span>
        </div>
      ))}
    </div>
  );
};
