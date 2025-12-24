
import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from './components/Layout.tsx';
import { INITIAL_SCENES } from './constants.ts';
import { translations } from './translations.ts';
import { getPsychologicalFeedback } from './services/psychologyService.ts';

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

  const [state, setState] = useState<any>({
    currentSceneId: 'welcome',
    history: [],
    isFinished: false
  });
  
  const [intermediateFeedback, setIntermediateFeedback] = useState<any>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

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
        setLoading(true);
        const data = await getPsychologicalFeedback(newHistory);
        setAnalysisData(data);
        
        let step = 0;
        const timer = setInterval(() => {
          setLoadingStep(s => s + 1);
          step++;
          if (step > 4) {
            clearInterval(timer);
            setLoading(false);
            setState((prev: any) => ({ ...prev, history: newHistory, isFinished: true }));
          }
        }, 600);
      } else {
        setState((prev: any) => ({ ...prev, currentSceneId: nextId, history: newHistory }));
      }
      setIsTransitioning(false);
    }, 400);
  }, [intermediateFeedback, state]);

  const BalanceChart = ({ safety, permission, ambition }: any) => {
    const size = 180;
    const center = size / 2;
    const r = 70;
    const points = [
      [center, center - (r * (safety || 50) / 100)],
      [center + (r * (permission || 50) / 100 * 0.866), center + (r * (permission || 50) / 100 * 0.5)],
      [center - (r * (ambition || 50) / 100 * 0.866), center + (r * (ambition || 50) / 100 * 0.5)],
    ];
    const path = `M ${points[0][0]} ${points[0][1]} L ${points[1][0]} ${points[1][1]} L ${points[2][0]} ${points[2][1]} Z`;

    return (
      <div className="flex justify-center py-4 relative">
        <svg width={size} height={size} className="relative z-10">
          {[0.2, 0.4, 0.6, 0.8, 1].map(scale => (
            <path key={scale} d={`M ${center} ${center - r*scale} L ${center + r*scale*0.866} ${center + r*scale*0.5} L ${center - r*scale*0.866} ${center + r*scale*0.5} Z`} fill="none" stroke="rgba(99, 102, 241, 0.1)" strokeWidth="1" />
          ))}
          <path d={path} fill="rgba(99, 102, 241, 0.2)" stroke="#6366f1" strokeWidth="3" strokeLinejoin="round" />
          {points.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="5" fill="#6366f1" />)}
        </svg>
      </div>
    );
  };

  if (!isAuthenticated) {
    return (
      <Layout lang={lang}>
        <div className="flex flex-col items-center justify-center min-h-[75vh] space-y-16">
          <div className="relative">
            <div className="w-32 h-32 bg-white rounded-[3.5rem] shadow-2xl flex items-center justify-center text-5xl relative z-10 border border-white/50">💎</div>
            <div className="absolute inset-0 bg-indigo-400 blur-[80px] opacity-20 animate-pulse"></div>
          </div>
          <div className="w-full space-y-8 text-center px-4">
            <h2 className="text-4xl font-[900] tracking-tight text-slate-800">{t.enterPassword}</h2>
            <div className="space-y-4">
              <input 
                type="password" 
                value={passwordInput} 
                onChange={(e) => setPasswordInput(e.target.value)} 
                placeholder="••••" 
                className="w-full p-8 bg-white/70 backdrop-blur-xl border border-white rounded-[2.5rem] text-center font-black text-3xl outline-none focus:ring-4 focus:ring-indigo-100/50 transition-all shadow-inner" 
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()} 
              />
              <button onClick={handleLogin} className="w-full btn-primary py-7 text-white rounded-[2.5rem] font-black text-sm uppercase tracking-[0.3em]">
                {t.accessBtn}
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout lang={lang}>
        <div className="game-card p-12 flex flex-col items-center justify-center space-y-12 min-h-[550px] scene-transition">
          <div className="relative w-32 h-32">
            <div className="absolute inset-0 border-[12px] border-indigo-50 rounded-full"></div>
            <div className="absolute inset-0 border-[12px] border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div className="text-center space-y-6">
            <p className="text-slate-800 font-[900] text-lg uppercase tracking-[0.1em]">{t.loadingSteps[loadingStep % t.loadingSteps.length]}</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3].map(i => <div key={i} className={`w-2 h-2 rounded-full bg-indigo-600 ${loadingStep % 3 === i-1 ? 'opacity-100 scale-125' : 'opacity-20'} transition-all`} />)}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (state.isFinished && analysisData) {
    return (
      <Layout lang={lang}>
        <div className="space-y-6 pb-10 scene-transition">
          <div className="game-card p-8 space-y-8 border-b-4 border-indigo-500">
            <div className="flex flex-col items-center text-center space-y-2">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">Профессиональный профиль</span>
              <h2 className="text-3xl font-[900] text-slate-900 tracking-tight">{analysisData.archetype}</h2>
              <div className="px-4 py-1.5 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest mt-2">
                {analysisData.coreConflict}
              </div>
            </div>
            <BalanceChart safety={analysisData.scoreSafety} permission={analysisData.scorePermission} ambition={analysisData.scoreAmbition} />
          </div>

          <div className="game-card p-8 space-y-10">
            <section className="space-y-4">
              <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 bg-indigo-500 rounded-full"></span> Анализ сценария
              </h3>
              <p className="text-slate-600 leading-relaxed text-lg font-medium">{analysisData.analysisText}</p>
            </section>

            <section className="space-y-4 p-6 bg-indigo-50 rounded-[2rem] border border-indigo-100">
              <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Телесная диагностика</h3>
              <p className="text-indigo-900/80 text-sm leading-relaxed italic">{analysisData.bodyAnalysis}</p>
            </section>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-slate-50 rounded-[2rem] space-y-2">
                <h4 className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Теневая сторона</h4>
                <p className="text-xs font-bold text-slate-700">{analysisData.shadowSide}</p>
              </div>
              <div className="p-6 bg-slate-50 rounded-[2rem] space-y-2">
                <h4 className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Ключевой инсайт</h4>
                <p className="text-xs font-bold text-slate-700">{analysisData.keyBelief}</p>
              </div>
            </div>

            <div className="p-8 bg-slate-950 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600 blur-[80px] opacity-20"></div>
              <p className="text-[10px] font-black text-white/40 uppercase mb-4 tracking-widest">Рекомендация</p>
              <p className="font-bold text-base leading-relaxed relative z-10">{analysisData.actionStep}</p>
            </div>
          </div>

          <div className="grid gap-4 px-2">
            <button onClick={() => window.Telegram?.WebApp?.openLink(bookingUrl)} className="w-full btn-primary py-8 text-white rounded-[2.8rem] font-black text-sm uppercase tracking-[0.3em]">
              Записаться на сессию
            </button>
            <button onClick={() => window.location.reload()} className="w-full py-4 text-[11px] font-black text-slate-300 uppercase tracking-[0.2em] hover:text-indigo-400 transition-colors">
              Начать сначала
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (intermediateFeedback) {
    return (
      <Layout lang={lang}>
        <div className="flex flex-col space-y-6 scene-transition h-full pt-4">
          <div className="game-card p-10 flex-1 flex flex-col space-y-12">
            <div className="space-y-2 text-center">
              <h3 className="text-4xl font-[900] text-slate-900 tracking-tighter">Рефлексия</h3>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">Погружение в ощущения</p>
            </div>
            
            <div className="space-y-6">
              <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-4">Что чувствует тело?</label>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(t.bodySensations).map(([key, label]) => (
                  <button key={key} onClick={() => setIntermediateFeedback({...intermediateFeedback, bodySensation: label})} className={`p-6 rounded-[2rem] text-[11px] font-black transition-all border-2 ${intermediateFeedback.bodySensation === label ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100 scale-[1.02]' : 'bg-white border-slate-50 text-slate-400 hover:border-indigo-100'}`}>{label}</button>
                ))}
              </div>
            </div>

            <div className="space-y-6 flex-1">
              <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-4">Ваша первая мысль?</label>
              <textarea 
                value={intermediateFeedback.userReflection} 
                onChange={(e) => setIntermediateFeedback({...intermediateFeedback, userReflection: e.target.value})} 
                className="w-full h-44 p-8 bg-slate-50 rounded-[2.8rem] text-lg font-medium outline-none focus:ring-4 focus:ring-indigo-50 transition-all resize-none border border-transparent focus:bg-white focus:shadow-inner" 
                placeholder="Напишите здесь..." 
              />
            </div>
          </div>
          <button onClick={proceedToNext} className={`w-full py-8 rounded-[2.8rem] font-black shadow-2xl uppercase text-sm tracking-[0.3em] transition-all ${intermediateFeedback.bodySensation ? 'btn-primary text-white' : 'bg-slate-200 text-slate-400 pointer-events-none'}`}>
            Подтвердить
          </button>
        </div>
      </Layout>
    );
  }

  const scene = INITIAL_SCENES[state.currentSceneId];
  return (
    <Layout lang={lang}>
      <div className={`space-y-12 scene-transition ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        <div className="relative rounded-[4rem] overflow-hidden aspect-[4/5] shadow-2xl border-[16px] border-white group">
          <img src={`https://picsum.photos/seed/${scene.id}_v55/800/1000`} alt="Scene" className="object-cover w-full h-full transition-transform duration-[4s] group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/10 to-transparent flex flex-col justify-end p-12">
            <div className="space-y-4">
              <div className="w-12 h-1.5 bg-indigo-500 rounded-full"></div>
              <h2 className="text-white font-[900] text-4xl tracking-tight leading-none">{scene.title}</h2>
              <p className="text-white/80 text-lg leading-relaxed font-medium line-clamp-3">{scene.description}</p>
            </div>
          </div>
        </div>
        <div className="grid gap-5 px-2">
          {scene.choices.map((choice) => (
            <button key={choice.id} onClick={() => {
              window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('medium');
              setIntermediateFeedback({ text: choice.text, nextId: choice.nextSceneId, belief: choice.beliefKey, userReflection: "", bodySensation: "" });
            }} className="choice-button w-full p-8 text-left rounded-[2.5rem] flex items-center bg-white shadow-sm hover:shadow-xl border border-white hover:border-indigo-50 group">
              <span className="font-black text-lg text-slate-800 flex-1 leading-snug">{choice.text}</span>
              <div className="w-12 h-12 rounded-[1.2rem] bg-indigo-50 flex items-center justify-center ml-4 shrink-0 group-hover:bg-indigo-600 transition-colors">
                <span className="text-indigo-600 font-black text-xl group-hover:text-white transition-colors">→</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default App;
