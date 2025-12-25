
import React, { useState, useRef, useEffect } from 'react';
import { Translations } from '../../types';

interface AuthViewProps {
  onLogin: (password: string, isDemo: boolean) => void;
  t: Translations;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLogin, t }) => {
  const [agreed, setAgreed] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdInterval = useRef<number | null>(null);

  const startHold = () => {
    if (agreed) return;
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.('light');
    holdInterval.current = window.setInterval(() => {
        setHoldProgress(prev => {
            if (prev >= 100) {
                clearInterval(holdInterval.current!);
                window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.('success');
                setAgreed(true);
                return 100;
            }
            return prev + 4; 
        });
    }, 50);
  };

  const endHold = () => {
    if (agreed) return;
    if (holdInterval.current) clearInterval(holdInterval.current);
    setHoldProgress(0);
  };

  const handleEnter = (isDemo: boolean) => {
    if (!agreed) {
        window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.('error');
        return;
    }
    // Correctly signaling standard entry
    onLogin("genesis_lab_entry", isDemo);
  };

  useEffect(() => {
    return () => { if (holdInterval.current) clearInterval(holdInterval.current); };
  }, []);

  const onboarding = t.onboarding;

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-10 animate-in h-full select-none max-w-sm mx-auto">
      <div className="w-20 h-20 bg-slate-950 rounded-[2rem] flex items-center justify-center text-indigo-500 font-black text-3xl border border-indigo-500/20 shadow-2xl shrink-0">G</div>
      
      <div className="w-full px-2 flex-1 flex flex-col space-y-8">
        <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter italic">{onboarding.title}</h2>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">{t.subtitle}</p>
        </div>

        {/* INSTRUCTIONS GRID */}
        <div className="grid grid-cols-1 gap-4">
            {[
                { i: "01", t: onboarding.step1_t, d: onboarding.step1_d },
                { i: "02", t: onboarding.step2_t, d: onboarding.step2_d },
                { i: "03", t: onboarding.step3_t, d: onboarding.step3_d }
            ].map(step => (
                <div key={step.i} className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 items-start">
                    <span className="text-[10px] font-mono font-black text-indigo-500 bg-white px-2 py-1 rounded shadow-sm">{step.i}</span>
                    <div className="space-y-1">
                        <h4 className="text-[10px] font-black uppercase text-slate-900">{step.t}</h4>
                        <p className="text-[10px] text-slate-500 font-medium leading-tight">{step.d}</p>
                    </div>
                </div>
            ))}
        </div>

        {/* DISCLAIMER / PROTOCOL SIGNING */}
        <div className="space-y-4 pt-4">
            {!agreed ? (
                <div 
                    className="relative w-full h-16 bg-slate-100 rounded-2xl overflow-hidden cursor-pointer touch-none select-none border border-slate-200"
                    onMouseDown={startHold}
                    onMouseUp={endHold}
                    onMouseLeave={endHold}
                    onTouchStart={startHold}
                    onTouchEnd={endHold}
                >
                    <div 
                        className="absolute top-0 left-0 h-full bg-indigo-500 transition-all duration-75 ease-linear"
                        style={{ width: `${holdProgress}%` }}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${holdProgress > 50 ? 'text-white' : 'text-slate-400'}`}>
                            {holdProgress > 0 ? onboarding.protocol_init : onboarding.protocol_btn}
                        </span>
                    </div>
                </div>
            ) : (
                <div className="w-full h-16 bg-slate-950 rounded-2xl flex items-center justify-center border border-indigo-500/50 shadow-lg animate-pulse">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">{onboarding.protocol_ready}</span>
                </div>
            )}
            
            <p className="text-[9px] text-slate-400 font-medium leading-relaxed text-center italic opacity-70">
                {t.legal_disclaimer}
            </p>
        </div>

        <div className="pt-2">
           <button 
             onClick={() => handleEnter(false)} 
             disabled={!agreed} 
             className={`w-full p-6 rounded-3xl font-black uppercase text-xs tracking-[0.3em] shadow-lg transition-all ${agreed ? 'bg-slate-950 text-white active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
           >
             {onboarding.start_btn}
           </button>
        </div>
      </div>
    </div>
  );
};
