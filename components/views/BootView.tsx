
import React, { useEffect, useState } from 'react';

interface BootViewProps {
  isDemo: boolean;
  onComplete: () => void;
}

export const BootView: React.FC<BootViewProps> = ({ isDemo, onComplete }) => {
  const [bootStep, setBootStep] = useState(0);

  const steps = [
      "Initializing v6.4...",
      isDemo ? "Trial Mode Active..." : "Loading Sovereign Engine...",
      "Integrity Check: 100%",
      "Calibrating Body Sensors... Breathe.",
      "Syncing Uplink...",
      "Ready."
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setBootStep(prev => {
        if (prev < steps.length - 1) return prev + 1;
        clearInterval(timer);
        return prev;
      });
    }, 600);

    return () => clearInterval(timer);
  }, []);

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