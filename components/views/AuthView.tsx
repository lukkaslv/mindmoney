import React, { useState, useRef, useEffect } from 'react';
import { Translations } from '../../types';
import { PlatformBridge } from '../../utils/helpers';
import { SecurityCore } from '../../utils/crypto';
import { STORAGE_KEYS, StorageService } from '../../services/storageService';

interface AuthViewProps {
  onLogin: (password: string, isDemo: boolean) => boolean;
  t: Translations;
  lang: 'ru' | 'ka';
  onLangChange: (lang: 'ru' | 'ka') => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLogin, t, lang, onLangChange }) => {
  const [agreed, setAgreed] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [showPricing, setShowPricing] = useState(false);
  const [showAdminInput, setShowAdminInput] = useState(false);
  const [adminPwd, setAdminPwd] = useState('');
  
  const holdInterval = useRef<number | null>(null);

  const startHold = () => {
    if (agreed) return;
    PlatformBridge.haptic.impact('light');
    holdInterval.current = window.setInterval(() => {
        setHoldProgress(prev => {
            if (prev >= 100) {
                clearInterval(holdInterval.current!);
                PlatformBridge.haptic.notification('success');
                setAgreed(true);
                return 100;
            }
            return prev + 5; 
        });
    }, 50);
  };

  const endHold = () => {
    if (agreed) return;
    if (holdInterval.current) clearInterval(holdInterval.current);
    setHoldProgress(0);
  };

  const handleContactSales = () => {
      PlatformBridge.haptic.impact('medium');
      PlatformBridge.openLink("https://t.me/thndrrr");
  };

  const handleAdminAuth = () => {
      const isSuccess = onLogin(adminPwd, false);
      if (!isSuccess) {
          const license = SecurityCore.validateLicense(adminPwd);
          if (license.valid) {
              StorageService.save(STORAGE_KEYS.SESSION, 'true');
              onLogin('genesis_lab_entry', false); 
          } else {
              setAdminPwd('');
              PlatformBridge.haptic.notification('error');
          }
      }
  };

  return (
    <div className="relative flex flex-col items-center py-8 space-y-8 animate-in h-full select-none max-w-sm mx-auto overflow-y-auto no-scrollbar bg-white">
      
      {/* LANGUAGE SWITCHER AT TOP */}
      <div className="absolute top-4 right-4 z-50 flex gap-1 p-1 bg-slate-50 rounded-xl border border-slate-100 shadow-sm">
          <button 
            onClick={() => { onLangChange('ru'); PlatformBridge.haptic.impact('light'); }}
            className={`px-3 py-1.5 rounded-lg text-[9px] font-black transition-all ${lang === 'ru' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400'}`}
          >
            RU
          </button>
          <button 
            onClick={() => { onLangChange('ka'); PlatformBridge.haptic.impact('light'); }}
            className={`px-3 py-1.5 rounded-lg text-[9px] font-black transition-all ${lang === 'ka' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400'}`}
          >
            KA
          </button>
      </div>

      {/* STEALTH ADMIN LOGIN */}
      {showAdminInput && (
        <div className="absolute inset-0 z-[100] bg-slate-950/98 flex flex-col items-center justify-center p-6 animate-in rounded-3xl">
           <div className="text-center mb-6">
              <span className="text-2xl mb-2 block">📟</span>
              <h3 className="text-emerald-500 font-mono text-[10px] uppercase tracking-[0.3em]">Kernel_Auth_Required</h3>
           </div>
           <input 
              type="password" 
              autoFocus
              className="w-full bg-slate-900 border border-white/5 rounded-xl p-4 text-emerald-400 font-mono text-center outline-none focus:border-emerald-500/30 transition-all shadow-2xl"
              placeholder="PASS_OR_LICENSE_KEY"
              value={adminPwd}
              onChange={e => setAdminPwd(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdminAuth()}
           />
           <div className="flex gap-4 mt-6">
                <button onClick={() => setShowAdminInput(false)} className="text-[10px] text-slate-700 uppercase font-black hover:text-slate-400 transition-colors">Abort</button>
                <button onClick={handleAdminAuth} className="text-[10px] text-emerald-500 uppercase font-black hover:text-emerald-300 transition-colors underline underline-offset-4">Authenticate</button>
           </div>
        </div>
      )}

      {/* LOGO SECTION - STEALTH ENTRANCE */}
      <div 
        onDoubleClick={() => {
            PlatformBridge.haptic.impact('heavy');
            setShowAdminInput(true);
        }}
        className="w-20 h-20 bg-slate-950 rounded-[2.5rem] flex items-center justify-center text-indigo-500 font-black text-3xl border border-indigo-500/10 shadow-2xl shrink-0 group relative overflow-hidden active:scale-95 transition-transform mt-6"
      >
        <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 animate-pulse"></div>
        G
      </div>

      <div className="text-center space-y-2 px-6">
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter italic">{t.onboarding.title}</h2>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] leading-relaxed">
            {lang === 'ka' ? 'კლინიკური ხიდი // პროფესიული სკრინინგი' : t.subtitle}
          </p>
      </div>

      {/* PRICING DISCOVERY */}
      {!showPricing ? (
        <div className="w-full px-6 space-y-6">
            <button 
                onClick={() => {
                    PlatformBridge.haptic.impact('light');
                    setShowPricing(true);
                }}
                className="w-full p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl flex items-center justify-between group active:scale-95 transition-all shadow-sm"
            >
                <div className="text-left">
                    <span className="text-[9px] font-black text-indigo-600 uppercase block">{t.onboarding.promo_title}</span>
                    <span className="text-[10px] text-slate-500 font-medium">{t.onboarding.promo_desc}</span>
                </div>
                <span className="text-indigo-400 opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all text-xl">💎</span>
            </button>

            <div className="space-y-4">
                {!agreed ? (
                    <div 
                        className="relative w-full h-20 bg-slate-50 rounded-[2rem] overflow-hidden cursor-pointer touch-none border border-slate-200 shadow-inner"
                        onMouseDown={startHold} onMouseUp={endHold} onTouchStart={startHold} onTouchEnd={endHold}
                    >
                        <div className="absolute top-0 left-0 h-full bg-indigo-500 transition-all duration-75" style={{ width: `${holdProgress}%` }}></div>
                        <div className="absolute inset-0 flex items-center justify-center z-10">
                            <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${holdProgress > 50 ? 'text-white' : 'text-slate-400'}`}>
                                {t.onboarding.protocol_btn}
                            </span>
                        </div>
                    </div>
                ) : (
                    <button onClick={() => onLogin("", true)} className="w-full h-20 bg-slate-950 text-white rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-xl animate-in hover:bg-slate-900 active:scale-[0.98] transition-all">
                        {t.onboarding.start_btn}
                    </button>
                )}
            </div>
        </div>
      ) : (
        <div className="w-full px-6 space-y-4 animate-in">
            <h3 className="text-xs font-black uppercase text-slate-800 text-center mb-2">{t.onboarding.pricing_btn}</h3>
            {[
                { id: 'SOLO', name: t.onboarding.solo_plan, desc: lang === 'ka' ? "პირადი მოხმარება, 10 კლიენტი" : "Личное использование, 10 клиентов", price: t.onboarding.price_solo },
                { id: 'CLINICAL', name: t.onboarding.clinical_plan, desc: lang === 'ka' ? "ღრმა დიაგნოსტიკა, 50 კლიენტი" : "Глубокая диагностика, 50 клиентов", price: t.onboarding.price_clinical, highlight: true },
                { id: 'LAB', name: t.onboarding.lab_plan, desc: lang === 'ka' ? "სრული წვდომა, შეუზღუდავი" : "Полный доступ, без ограничений", price: t.onboarding.price_lab }
            ].map(plan => (
                <button 
                    key={plan.id} 
                    onClick={handleContactSales}
                    className={`w-full p-4 rounded-2xl border text-left flex justify-between items-center transition-all active:scale-[0.98] ${plan.highlight ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-800'}`}
                >
                    <div className="space-y-1">
                        <span className="text-[11px] font-black uppercase block">{plan.name}</span>
                        <span className={`text-[9px] opacity-70 block leading-tight ${plan.highlight ? 'text-indigo-100' : 'text-slate-500'}`}>{plan.desc}</span>
                    </div>
                    <div className="text-right">
                        <span className="text-sm font-black block">{plan.price}</span>
                        <span className={`text-[7px] font-bold uppercase opacity-60 ${plan.highlight ? 'text-white' : 'text-slate-400'}`}>{t.onboarding.price_per_month}</span>
                    </div>
                </button>
            ))}
            <button onClick={() => setShowPricing(false)} className="w-full py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">{t.global.back}</button>
        </div>
      )}

      <footer className="px-6 text-center opacity-30 mt-auto pb-4">
          <p className="text-[7px] font-mono text-slate-500 uppercase leading-relaxed max-w-[200px] mx-auto">
            {t.legal_disclaimer} <br/>
            BUILD: 9.8.5 // SECTOR: 7G
          </p>
      </footer>
    </div>
  );
};