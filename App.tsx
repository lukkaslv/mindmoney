
import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from './components/Layout.tsx';
import { INITIAL_SCENES } from './constants.ts';
import { Choice, GameState } from './types.ts';
import { translations } from './translations.ts';
import { getPsychologicalFeedback, textToSpeech } from './services/psychologyService.ts';

declare global {
  interface Window {
    Telegram: {
      WebApp: any;
    };
  }
}

const MASTER_KEY = "admin777";

const App: React.FC = () => {
  const [lang, setLang] = useState<'ru' | 'ka'>(() => {
    try { return (localStorage.getItem('app_lang') as 'ru' | 'ka') || 'ru'; } catch (e) { return 'ru'; }
  });
  
  const t = translations[lang];

  const [clientPassword, setClientPassword] = useState(() => localStorage.getItem('cfg_client_pass') || "money");
  const [bookingUrl, setBookingUrl] = useState(() => localStorage.getItem('cfg_booking_url') || "https://t.me/your_username");

  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('is_auth') === 'true');
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('is_admin') === 'true');
  const [passwordInput, setPasswordInput] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);

  const [state, setState] = useState<GameState>({
    currentSceneId: 'welcome',
    history: [],
    isFinished: false
  });
  
  const [intermediateFeedback, setIntermediateFeedback] = useState<any>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      tg.headerColor = '#f8fafc';
    }
  }, []);

  const handleLogin = () => {
    const input = passwordInput.toLowerCase().trim();
    if (input === MASTER_KEY) {
      setIsAdmin(true);
      setIsAuthenticated(true);
      localStorage.setItem('is_admin', 'true');
      localStorage.setItem('is_auth', 'true');
    } else if (input === clientPassword) {
      setIsAdmin(false);
      setIsAuthenticated(true);
      localStorage.setItem('is_admin', 'false');
      localStorage.setItem('is_auth', 'true');
    } else {
      window.Telegram?.WebApp?.showAlert?.(t.wrongPassword);
    }
  };

  const proceedToNext = useCallback(async () => {
    if (!intermediateFeedback) return;
    window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
    const { nextId, belief, userReflection, bodySensation } = intermediateFeedback;
    const newHistory = [...state.history, { 
      sceneId: state.currentSceneId, 
      choiceId: intermediateFeedback.text, 
      beliefKey: belief,
      userReflection,
      bodySensation
    }];
    setIsTransitioning(true);
    setIntermediateFeedback(null);
    
    setTimeout(async () => {
      if (!nextId || nextId === 'end') {
        setState(prev => ({ ...prev, history: newHistory, isFinished: true }));
        setLoading(true);
        const data = await getPsychologicalFeedback(newHistory);
        setAnalysisData(data);
        const timer = setInterval(() => setLoadingStep(s => s + 1), 800);
        setTimeout(() => { clearInterval(timer); setLoading(false); }, 3200);
      } else {
        setState(prev => ({ ...prev, currentSceneId: nextId, history: newHistory }));
      }
      setIsTransitioning(false);
    }, 400);
  }, [intermediateFeedback, state]);

  const BalanceChart = ({ safety, permission, ambition }: any) => {
    const size = 140;
    const center = size / 2;
    const r = 50;
    const points = [
      [center, center - (r * safety / 100)],
      [center + (r * permission / 100 * 0.866), center + (r * permission / 100 * 0.5)],
      [center - (r * ambition / 100 * 0.866), center + (r * ambition / 100 * 0.5)],
    ];
    const path = `M ${points[0][0]} ${points[0][1]} L ${points[1][0]} ${points[1][1]} L ${points[2][0]} ${points[2][1]} Z`;

    return (
      <div className="flex justify-center py-6 relative">
        <div className="absolute inset-0 bg-indigo-50/20 rounded-full blur-3xl"></div>
        <svg width={size} height={size} className="relative z-10 drop-shadow-xl">
          <circle cx={center} cy={center} r={r} fill="none" stroke="rgba(99, 102, 241, 0.1)" strokeWidth="1.5" />
          <circle cx={center} cy={center} r={r*0.66} fill="none" stroke="rgba(99, 102, 241, 0.05)" strokeWidth="1" strokeDasharray="4 4" />
          <line x1={center} y1={center-r} x2={center} y2={center+r} stroke="rgba(99, 102, 241, 0.1)" strokeWidth="1" />
          <path d={path} fill="rgba(99, 102, 241, 0.15)" stroke="#6366f1" strokeWidth="3" strokeLinejoin="round" />
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p[0]} cy={p[1]} r="5" fill="#6366f1" />
              <circle cx={p[0]} cy={p[1]} r="8" fill="#6366f1" opacity="0.2" className="animate-pulse" />
            </g>
          ))}
        </svg>
      </div>
    );
  };

  if (!isAuthenticated) {
    return (
      <Layout lang={lang}>
        <div className="flex flex-col items-center justify-center min-h-[75vh] space-y-16">
          <div className="relative">
            <div className="w-32 h-32 bg-white rounded-[3rem] shadow-2xl flex items-center justify-center text-5xl relative z-10 border border-white/50">💎</div>
            <div className="absolute inset-0 bg-indigo-200 blur-[60px] opacity-30 animate-pulse"></div>
          </div>
          <div className="w-full space-y-6 text-center">
            <h2 className="text-3xl font-[900] tracking-tight text-slate-800">{t.enterPassword}</h2>
            <div className="space-y-4">
              <input 
                type="password" 
                value={passwordInput} 
                onChange={(e) => setPasswordInput(e.target.value)} 
                placeholder="••••" 
                className="w-full p-8 bg-white/70 backdrop-blur-md border border-white rounded-[2.5rem] text-center font-black text-3xl outline-none focus:ring-4 focus:ring-indigo-100/50 transition-all shadow-inner" 
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()} 
              />
              <button onClick={handleLogin} className="w-full btn-primary py-7 text-white rounded-[2.5rem] font-black text-sm uppercase tracking-[0.2em]">
                {t.accessBtn}
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (isAdmin) {
    return (
      <Layout lang={lang}>
        <div className="space-y-8 scene-transition">
          <div className="game-card p-10 space-y-10">
            <h2 className="text-2xl font-[900] tracking-tight">{t.adminTitle}</h2>
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">{t.adminPassLabel}</label>
                <input type="text" value={clientPassword} onChange={(e) => setClientPassword(e.target.value)} className="w-full p-6 bg-slate-50 rounded-3xl font-bold outline-none border border-transparent focus:border-indigo-100" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">{t.adminContactLabel}</label>
                <input type="text" value={bookingUrl} onChange={(e) => setBookingUrl(e.target.value)} className="w-full p-6 bg-slate-50 rounded-3xl font-bold outline-none border border-transparent focus:border-indigo-100" />
              </div>
              <button onClick={() => { localStorage.setItem('cfg_client_pass', clientPassword); localStorage.setItem('cfg_booking_url', bookingUrl); alert("Настройки обновлены"); }} className="w-full btn-primary py-6 text-white rounded-3xl font-black uppercase tracking-widest">Сохранить</button>
            </div>
          </div>
          <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="w-full py-4 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Выйти из системы</button>
        </div>
      </Layout>
    );
  }

  if (state.isFinished) {
    return (
      <Layout lang={lang}>
        <div className="space-y-10 pb-10 scene-transition">
          {loading ? (
            <div className="game-card p-12 flex flex-col items-center justify-center space-y-10 min-h-[500px]">
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 border-8 border-indigo-50 rounded-full"></div>
                <div className="absolute inset-0 border-8 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <div className="text-center space-y-4">
                <p className="text-slate-800 font-[900] text-sm uppercase tracking-widest">{t.loadingSteps[loadingStep % t.loadingSteps.length]}</p>
                <p className="text-slate-400 text-xs font-medium italic opacity-60">Синхронизация данных...</p>
              </div>
            </div>
          ) : analysisData && (
            <div className="space-y-8">
              <div className="game-card p-10 space-y-10">
                <div className="flex flex-col items-center space-y-4">
                  <div className="px-4 py-1.5 bg-indigo-50 rounded-full border border-indigo-100">
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">{analysisData.profileType}</span>
                  </div>
                  <BalanceChart safety={analysisData.scoreSafety} permission={analysisData.scorePermission} ambition={analysisData.scoreAmbition} />
                </div>
                
                <div className="pt-8 border-t border-slate-50 space-y-8">
                  <div className="flex items-center justify-between bg-slate-50/50 p-4 rounded-[2rem]">
                    <h3 className="font-black uppercase tracking-[0.1em] text-[11px] text-slate-400 ml-2">{t.mentorVoice}</h3>
                    <button onClick={() => { setIsPlaying(true); textToSpeech(analysisData.analysisText).then(() => setIsPlaying(false)); }} className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isPlaying ? 'bg-white text-indigo-600 scale-90' : 'btn-primary text-white shadow-lg'}`}>{isPlaying ? '•••' : '▶'}</button>
                  </div>

                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-[2.5rem] blur opacity-10"></div>
                    <div className="relative p-8 bg-white rounded-[2.5rem] border border-indigo-50">
                      <p className="text-[9px] font-black text-indigo-400 uppercase mb-3 tracking-[0.3em]">{t.insight}</p>
                      <p className="font-[900] text-xl leading-tight text-slate-800 italic">"{analysisData.keyBelief}"</p>
                    </div>
                  </div>

                  <p className="text-slate-500 leading-relaxed text-[15px] font-medium px-2">{analysisData.analysisText}</p>

                  <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white shadow-2xl">
                    <p className="text-[9px] font-black text-white/30 uppercase mb-4 tracking-[0.3em]">{t.practice}</p>
                    <p className="font-bold text-sm leading-relaxed">{analysisData.actionStep}</p>
                  </div>
                </div>
              </div>
              <div className="grid gap-4">
                <button onClick={() => window.Telegram?.WebApp?.openLink(bookingUrl)} className="w-full btn-primary py-7 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.2em]">
                  {t.bookSession}
                </button>
                <button onClick={() => window.location.reload()} className="w-full py-4 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
                  {t.restart}
                </button>
              </div>
            </div>
          )}
        </div>
      </Layout>
    );
  }

  if (intermediateFeedback) {
    return (
      <Layout lang={lang}>
        <div className="flex flex-col space-y-6 scene-transition h-full pt-4">
          <div className="game-card p-10 flex-1 flex flex-col space-y-12">
            <h3 className="text-3xl font-[900] text-center text-slate-800 tracking-tight">{t.deeper}</h3>
            <div className="space-y-5">
              <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] ml-2">{t.whereInBody}</label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(t.bodySensations).map(([key, label]) => (
                  <button key={key} onClick={() => setIntermediateFeedback({...intermediateFeedback, bodySensation: label})} className={`p-6 rounded-[1.8rem] text-[11px] font-black transition-all border-2 ${intermediateFeedback.bodySensation === label ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-white border-slate-50 text-slate-400'}`}>{label}</button>
                ))}
              </div>
            </div>
            <div className="space-y-5 flex-1">
              <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] ml-2">{t.whyChoice}</label>
              <textarea 
                value={intermediateFeedback.userReflection} 
                onChange={(e) => setIntermediateFeedback({...intermediateFeedback, userReflection: e.target.value})} 
                className="w-full h-40 p-8 bg-slate-50/50 rounded-[2.5rem] text-base font-medium outline-none focus:ring-4 focus:ring-indigo-50 transition-all resize-none border border-transparent focus:bg-white" 
                placeholder="..." 
              />
            </div>
          </div>
          <button onClick={proceedToNext} className={`w-full py-7 rounded-[2.5rem] font-black shadow-2xl uppercase text-sm tracking-[0.2em] transition-all ${intermediateFeedback.bodySensation ? 'btn-primary text-white' : 'bg-slate-200 text-slate-400 pointer-events-none'}`}>
            {t.saveNext}
          </button>
        </div>
      </Layout>
    );
  }

  const scene = INITIAL_SCENES[state.currentSceneId];
  return (
    <Layout lang={lang}>
      <div className={`space-y-10 scene-transition ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        <div className="relative rounded-[3.5rem] overflow-hidden aspect-[4/5] shadow-2xl border-[12px] border-white/80 group">
          <img src={`https://picsum.photos/seed/${scene.id}_v30/800/1000`} alt="Scene" className="object-cover w-full h-full transition-transform duration-[2s] group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/30 to-transparent flex flex-col justify-end p-10">
            <h2 className="text-white font-[900] text-3xl mb-4 tracking-tight leading-tight">{scene.title}</h2>
            <p className="text-white/80 text-[15px] leading-relaxed font-medium line-clamp-3">{scene.description}</p>
          </div>
        </div>
        <div className="grid gap-4">
          {scene.choices.map((choice) => (
            <button key={choice.id} onClick={() => {
              window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('medium');
              setIntermediateFeedback({ text: choice.text, nextId: choice.nextSceneId, belief: choice.beliefKey, userReflection: "", bodySensation: "" });
            }} className="choice-button w-full p-7 text-left rounded-[2rem] flex items-center bg-white shadow-sm hover:shadow-md border border-white">
              <span className="font-black text-[15px] text-slate-800 flex-1 leading-snug">{choice.text}</span>
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center ml-4">
                <span className="text-indigo-600 font-black">→</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default App;
