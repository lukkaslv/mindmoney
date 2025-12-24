
import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from './components/Layout.tsx';
import { INITIAL_SCENES } from './constants.ts';
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

  const [state, setState] = useState<any>({
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
        setState((prev: any) => ({ ...prev, history: newHistory, isFinished: true }));
        setLoading(true);
        const data = await getPsychologicalFeedback(newHistory);
        setAnalysisData(data);
        const timer = setInterval(() => setLoadingStep(s => s + 1), 800);
        setTimeout(() => { clearInterval(timer); setLoading(false); }, 3200);
      } else {
        setState((prev: any) => ({ ...prev, currentSceneId: nextId, history: newHistory }));
      }
      setIsTransitioning(false);
    }, 400);
  }, [intermediateFeedback, state]);

  const BalanceChart = ({ safety, permission, ambition }: any) => {
    const size = 160;
    const center = size / 2;
    const r = 60;
    const points = [
      [center, center - (r * safety / 100)],
      [center + (r * permission / 100 * 0.866), center + (r * permission / 100 * 0.5)],
      [center - (r * ambition / 100 * 0.866), center + (r * ambition / 100 * 0.5)],
    ];
    const path = `M ${points[0][0]} ${points[0][1]} L ${points[1][0]} ${points[1][1]} L ${points[2][0]} ${points[2][1]} Z`;

    return (
      <div className="flex justify-center py-6 relative">
        <div className="absolute inset-0 bg-indigo-500/5 rounded-full blur-[40px]"></div>
        <svg width={size} height={size} className="relative z-10 drop-shadow-2xl">
          <circle cx={center} cy={center} r={r} fill="none" stroke="rgba(99, 102, 241, 0.08)" strokeWidth="1" />
          <path d={path} fill="rgba(99, 102, 241, 0.12)" stroke="#6366f1" strokeWidth="4" strokeLinejoin="round" />
          <line x1={center} y1={center-r} x2={center} y2={center+r} stroke="rgba(0,0,0,0.03)" strokeWidth="1" />
          <line x1={center-r} y1={center} x2={center+r} y2={center} stroke="rgba(0,0,0,0.03)" strokeWidth="1" />
          {points.map((p, i) => (
            <circle key={i} cx={p[0]} cy={p[1]} r="6" fill="#6366f1" className="drop-shadow-md" />
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

  if (isAdmin) {
    return (
      <Layout lang={lang}>
        <div className="space-y-8 scene-transition py-4">
          <div className="game-card p-10 space-y-10">
            <h2 className="text-2xl font-[900] tracking-tight">Панель управления</h2>
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Клиентский пароль</label>
                <input type="text" value={clientPassword} onChange={(e) => setClientPassword(e.target.value)} className="w-full p-6 bg-slate-50 rounded-3xl font-bold outline-none border border-transparent focus:border-indigo-100" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Ссылка на запись</label>
                <input type="text" value={bookingUrl} onChange={(e) => setBookingUrl(e.target.value)} className="w-full p-6 bg-slate-50 rounded-3xl font-bold outline-none border border-transparent focus:border-indigo-100" />
              </div>
              <button onClick={() => { localStorage.setItem('cfg_client_pass', clientPassword); localStorage.setItem('cfg_booking_url', bookingUrl); alert("Сохранено!"); }} className="w-full btn-primary py-6 text-white rounded-3xl font-black uppercase tracking-widest">Обновить данные</button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (state.isFinished) {
    return (
      <Layout lang={lang}>
        <div className="space-y-10 pb-10 scene-transition">
          {loading ? (
            <div className="game-card p-12 flex flex-col items-center justify-center space-y-12 min-h-[550px]">
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
          ) : analysisData && (
            <div className="space-y-8">
              <div className="game-card p-10 space-y-10">
                <div className="flex flex-col items-center space-y-6">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] opacity-60">Архетип:</span>
                    <h2 className="text-4xl font-[900] text-slate-900 tracking-tighter">{analysisData.archetype}</h2>
                  </div>
                  <BalanceChart safety={analysisData.scoreSafety} permission={analysisData.scorePermission} ambition={analysisData.scoreAmbition} />
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center px-4 py-2 bg-slate-50 rounded-2xl">
                      <span className="text-[8px] font-black text-slate-400 uppercase">Безопасность</span>
                      <span className="font-black text-indigo-600">{analysisData.scoreSafety}%</span>
                    </div>
                    <div className="flex flex-col items-center px-4 py-2 bg-slate-50 rounded-2xl">
                      <span className="text-[8px] font-black text-slate-400 uppercase">Разрешение</span>
                      <span className="font-black text-indigo-600">{analysisData.scorePermission}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="pt-8 border-t border-slate-100 space-y-8">
                  <div className="p-6 bg-indigo-600 text-white rounded-[2.5rem] shadow-xl shadow-indigo-100 flex items-center gap-6 group active:scale-95 transition-all" onClick={() => { setIsPlaying(true); textToSpeech(analysisData.analysisText).then(() => setIsPlaying(false)); }}>
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-2xl">{isPlaying ? '⏸' : '▶'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Послушать анализ</span>
                      <span className="font-bold text-sm">Голос вашего наставника</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest px-2">Ключевой сценарий:</p>
                    <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                      <p className="font-[900] text-2xl leading-tight text-slate-800 italic">"{analysisData.keyBelief}"</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest px-2">Терапевтический анализ:</p>
                    <p className="text-slate-600 leading-relaxed text-lg font-medium px-2">{analysisData.analysisText}</p>
                  </div>

                  <div className="p-8 bg-slate-950 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600 blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
                    <p className="text-[10px] font-black text-white/40 uppercase mb-4 tracking-widest">Практика на сегодня</p>
                    <p className="font-bold text-base leading-relaxed relative z-10">{analysisData.actionStep}</p>
                  </div>
                </div>
              </div>
              <div className="grid gap-4 px-2">
                <button onClick={() => window.Telegram?.WebApp?.openLink(bookingUrl)} className="w-full btn-primary py-8 text-white rounded-[2.8rem] font-black text-sm uppercase tracking-[0.3em]">
                  Записаться на сессию
                </button>
                <button onClick={() => window.location.reload()} className="w-full py-4 text-[11px] font-black text-slate-300 uppercase tracking-[0.2em] hover:text-indigo-400 transition-colors">
                  Пройти тест заново
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
            <div className="space-y-2 text-center">
              <h3 className="text-4xl font-[900] text-slate-900 tracking-tighter">Рефлексия</h3>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">Шаг вглубь себя</p>
            </div>
            
            <div className="space-y-6">
              <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-4">Что в теле?</label>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(t.bodySensations).map(([key, label]) => (
                  <button key={key} onClick={() => setIntermediateFeedback({...intermediateFeedback, bodySensation: label})} className={`p-6 rounded-[2rem] text-[11px] font-black transition-all border-2 ${intermediateFeedback.bodySensation === label ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100 scale-[1.02]' : 'bg-white border-slate-50 text-slate-400 hover:border-indigo-100'}`}>{label}</button>
                ))}
              </div>
            </div>

            <div className="space-y-6 flex-1">
              <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-4">Первая мысль?</label>
              <textarea 
                value={intermediateFeedback.userReflection} 
                onChange={(e) => setIntermediateFeedback({...intermediateFeedback, userReflection: e.target.value})} 
                className="w-full h-44 p-8 bg-slate-50 rounded-[2.8rem] text-lg font-medium outline-none focus:ring-4 focus:ring-indigo-50 transition-all resize-none border border-transparent focus:bg-white focus:shadow-inner" 
                placeholder="Опишите ваши чувства..." 
              />
            </div>
          </div>
          <button onClick={proceedToNext} className={`w-full py-8 rounded-[2.8rem] font-black shadow-2xl uppercase text-sm tracking-[0.3em] transition-all ${intermediateFeedback.bodySensation ? 'btn-primary text-white' : 'bg-slate-200 text-slate-400 pointer-events-none'}`}>
            Продолжить путь
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
          <img src={`https://picsum.photos/seed/${scene.id}_v40/800/1000`} alt="Scene" className="object-cover w-full h-full transition-transform duration-[3s] group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/20 to-transparent flex flex-col justify-end p-12">
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
            }} className="choice-button w-full p-8 text-left rounded-[2.5rem] flex items-center bg-white shadow-sm hover:shadow-xl border border-white hover:border-indigo-50">
              <span className="font-black text-lg text-slate-800 flex-1 leading-snug">{choice.text}</span>
              <div className="w-12 h-12 rounded-[1.2rem] bg-indigo-50 flex items-center justify-center ml-4 shrink-0 transition-transform group-active:scale-90">
                <span className="text-indigo-600 font-black text-xl">→</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default App;
