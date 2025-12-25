
import React, { useState, useRef, useEffect } from 'react';
import { Translations } from '../../types';

interface AuthViewProps {
  onLogin: (password: string, isDemo: boolean) => void;
  t: Translations;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLogin, t }) => {
  const [password, setPassword] = useState("");
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
            return prev + 4; // Approx 1.5s to fill
        });
    }, 50); // 20 ticks per second
  };

  const endHold = () => {
    if (agreed) return;
    if (holdInterval.current) clearInterval(holdInterval.current);
    setHoldProgress(0);
  };

  const handleEnter = (isDemo: boolean) => {
    if (!agreed) {
        window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.('error');
        alert("Please hold the protocol button to sign.");
        return;
    }
    onLogin(password, isDemo);
    if (!isDemo) setPassword(""); // Clear on attempt
  };

  // Cleanup
  useEffect(() => {
    return () => { if (holdInterval.current) clearInterval(holdInterval.current); };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-12 animate-in h-full select-none">
      <div className="w-24 h-24 bg-slate-950 rounded-[2.5rem] flex items-center justify-center text-indigo-500 font-black text-4xl border border-indigo-500/20 shadow-2xl shrink-0">G</div>
      <div className="w-full px-4 space-y-6 text-center flex-1 flex flex-col justify-center">
        <h2 className="text-xl font-black text-slate-800 uppercase tracking-widest">Genesis Access</h2>
        <div className="space-y-3">
            <input 
              type="password" 
              placeholder="PASS_CODE" 
              className="w-full p-6 bg-slate-50 border border-slate-200 rounded-3xl text-center font-mono text-indigo-600 outline-none focus:bg-white text-lg" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              onKeyDown={e => e.key === 'Enter' && handleEnter(false)} 
            />
            <p className="text-[10px] text-slate-400 text-center font-medium px-4 leading-tight">{t.auth_hint}</p>
        </div>

        {/* HOLD TO AGREE INTERACTION */}
        <div className="px-2">
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
                            {holdProgress > 0 ? "INITIALIZING..." : "HOLD TO SIGN PROTOCOL"}
                        </span>
                    </div>
                </div>
            ) : (
                <div className="w-full h-16 bg-slate-950 rounded-2xl flex items-center justify-center border border-indigo-500/50 shadow-lg">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">PROTOCOL SIGNED</span>
                </div>
            )}
            
            <p className="mt-3 text-[9px] text-slate-400 font-medium leading-relaxed px-2 text-justify opacity-70">
                {t.legal_disclaimer}
            </p>
        </div>

        <div className="space-y-3 pt-2">
           <button onClick={() => handleEnter(false)} disabled={!agreed} className={`w-full p-6 rounded-3xl font-black uppercase text-xs tracking-[0.3em] shadow-lg transition-all ${agreed ? 'bg-slate-950 text-white active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>Authorize</button>
           <button onClick={() => handleEnter(true)} disabled={!agreed} className={`w-full border p-4 rounded-3xl font-black uppercase text-[10px] tracking-[0.2em] shadow-sm transition-all ${agreed ? 'bg-white text-indigo-600 border-indigo-100 active:scale-95' : 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'}`}>
              Trial Access
           </button>
        </div>
      </div>
    </div>
  );
};
