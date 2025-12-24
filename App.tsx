
import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from './components/Layout.tsx';
import { INITIAL_SCENES } from './constants.ts';
import { Choice, GameState } from './types.ts';
import { translations } from './translations.ts';
import { getPsychologicalFeedback, textToSpeech, generateMindsetAnchor } from './services/psychologyService.ts';

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
      tg.enableClosingConfirmation();
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
        setLoadingStep(0);
        
        // Имитация процесса анализа
        const timer = setInterval(() => setLoadingStep(s => s + 1), 800);
        setTimeout(() => {
          clearInterval(timer);
          setLoading(false);
        }, 3200);
      } else {
        setState(prev => ({ ...prev, currentSceneId: nextId, history: newHistory }));
      }
      setIsTransitioning(false);
    }, 400);
  }, [intermediateFeedback, state]);

  // Мини-компонент Колеса Баланса
  const BalanceChart = ({ safety, permission, ambition }: any) => {
    const size = 120;
    const center = size / 2;
    const r = 40;
    const points = [
      [center, center - (r * safety / 100)],
      [center + (r * permission / 100 * 0.866), center + (r * permission / 100 * 0.5)],
      [center - (r * ambition / 100 * 0.866), center + (r * ambition / 100 * 0.5)],
    ];
    const path = `M ${points[0][0]} ${points[0][1]} L ${points[1][0]} ${points[1][1]} L ${points[2][0]} ${points[2][1]} Z`;

    return (
      <div className="flex justify-center py-4">
        <svg width={size} height={size} className="drop-shadow-sm">
          <circle cx={center} cy={center} r={r} fill="none" stroke="#f1f5f9" strokeWidth="1" />
          <circle cx={center} cy={center} r={r/2} fill="none" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="2 2" />
          <line x1={center} y1={center-r} x2={center} y2={center+r} stroke="#f1f5f9" strokeWidth="1" />
          <path d={path} fill="rgba(99, 102, 241, 0.2)" stroke="#6366f1" strokeWidth="2" strokeLinejoin="round" />
          {points.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="3" fill="#6366f1" />)}
        </svg>
      </div>
    );
  };

  if (!isAuthenticated) {
    return (
      <Layout lang={lang}>
        <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-12">
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-white rounded-[2.5rem] shadow-xl shadow-indigo-100 flex items-center justify-center text-4xl mx-auto animate-bounce">💎</div>
            <h2 className="text-2xl font-black tracking-tight text-slate-800">{t.enterPassword}</h2>
          </div>
          <div className="w-full space-y-4">
            <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="••••" className="w-full p-6 bg-white border border-slate-100 rounded-3xl text-center font-black text-2xl outline-none focus:ring-4 focus:ring-indigo-50 transition-all" onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
            <button onClick={handleLogin} className="w-full py-6 bg-indigo-600 text-white rounded-3xl font-black shadow-xl shadow-indigo-100 active:scale-95 transition-all text-sm uppercase tracking-widest">{t.accessBtn}</button>
          </div>
        </div>
      </Layout>
    );
  }

  if (isAdmin) {
    return (
      <Layout lang={lang}>
        <div className="space-y-8 pb-10">
          <div className="text-center">
            <h2 className="text-3xl font-black tracking-tighter mb-2">{t.adminTitle}</h2>
            <div className="flex justify-center gap-2">
              {['ru', 'ka'].map((l) => (
                <button key={l} onClick={() => setLang(l as any)} className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest ${lang === l ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-400'}`}>{l}</button>
              ))}
            </div>
          </div>
          <div className="game-card p-8 space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.adminPassLabel}</label>
              <input type="text" value={clientPassword} onChange={(e) => setClientPassword(e.target.value)} className="w-full p-5 bg-slate-50 rounded-2xl font-bold outline-none" />
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.adminContactLabel}</label>
              <input type="text" value={bookingUrl} onChange={(e) => setBookingUrl(e.target.value)} className="w-full p-5 bg-slate-50 rounded-2xl font-bold outline-none" />
            </div>
            <button onClick={() => { localStorage.setItem('cfg_client_pass', clientPassword); localStorage.setItem('cfg_booking_url', bookingUrl); alert("ОК!"); }} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg">Сохранить</button>
          </div>
          <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="w-full py-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">Выйти</button>
        </div>
      </Layout>
    );
  }

  if (state.isFinished) {
    return (
      <Layout lang={lang}>
        <div className="space-y-8 pb-10">
          <div className="text-center">
            <h2 className="text-3xl font-black tracking-tighter mb-1">{t.transformation}</h2>
            <p className="text-indigo-500 text-[10px] font-black uppercase tracking-widest opacity-60">{t.profile}</p>
          </div>
          {loading ? (
            <div className="game-card p-12 flex flex-col items-center justify-center space-y-8 min-h-[450px]">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-indigo-100 rounded-full"></div>
                <div className="w-20 h-20 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute inset-0"></div>
              </div>
              <p className="text-slate-400 font-black text-xs text-center leading-relaxed px-6 animate-pulse uppercase tracking-wider">{t.loadingSteps[loadingStep % t.loadingSteps.length]}</p>
            </div>
          ) : analysisData && (
            <div className="space-y-6 scene-transition">
              <div className="game-card p-8 space-y-8">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Профиль:</p>
                    <p className="text-xl font-black text-indigo-600">{analysisData.profileType}</p>
                  </div>
                  <BalanceChart safety={analysisData.scoreSafety} permission={analysisData.scorePermission} ambition={analysisData.scoreAmbition} />
                </div>
                
                <div className="pt-6 border-t border-slate-50 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-black uppercase tracking-tight text-sm text-slate-400">{t.mentorVoice}</h3>
                    <button onClick={() => { setIsPlaying(true); textToSpeech(analysisData.analysisText).then(() => setIsPlaying(false)); }} className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isPlaying ? 'bg-indigo-50 text-indigo-600' : 'bg-indigo-600 text-white shadow-xl shadow-indigo-100'}`}>{isPlaying ? '...' : '▶'}</button>
                  </div>
                  <div className="p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100/20">
                    <p className="text-[10px] font-black text-indigo-400 uppercase mb-3 tracking-widest">{t.insight}</p>
                    <p className="font-black text-lg leading-tight text-slate-800 italic">"{analysisData.keyBelief}"</p>
                  </div>
                  <p className="text-slate-500 leading-relaxed text-sm font-medium">{analysisData.analysisText}</p>
                  <div className="p-6 bg-slate-900 text-white rounded-3xl">
                    <p className="text-[10px] font-black text-white/30 uppercase mb-3 tracking-widest">{t.practice}</p>
                    <p className="font-bold text-sm leading-relaxed">{analysisData.actionStep}</p>
                  </div>
                </div>
              </div>
              <div className="grid gap-4">
                <button onClick={() => window.Telegram?.WebApp?.openLink(bookingUrl)} className="w-full py-6 bg-indigo-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100">{t.bookSession}</button>
                <button onClick={() => window.location.reload()} className="w-full py-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">{t.restart}</button>
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
        <div className="flex flex-col space-y-6 scene-transition h-full">
          <div className="game-card p-8 flex-1 flex flex-col space-y-10">
            <h3 className="text-2xl font-black text-center text-slate-800">{t.deeper}</h3>
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-2">{t.whereInBody}</label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(t.bodySensations).map(([key, label]) => (
                  <button key={key} onClick={() => setIntermediateFeedback({...intermediateFeedback, bodySensation: label})} className={`p-5 rounded-2xl text-[10px] font-black transition-all border-2 ${intermediateFeedback.bodySensation === label ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-slate-50 text-slate-400'}`}>{label}</button>
                ))}
              </div>
            </div>
            <div className="space-y-4 flex-1">
              <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-2">{t.whyChoice}</label>
              <textarea value={intermediateFeedback.userReflection} onChange={(e) => setIntermediateFeedback({...intermediateFeedback, userReflection: e.target.value})} className="w-full h-32 p-6 bg-slate-50 rounded-3xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-100 transition-all resize-none" placeholder="..." />
            </div>
          </div>
          <button onClick={proceedToNext} className={`w-full py-6 rounded-3xl font-black shadow-xl uppercase text-xs tracking-widest transition-all ${intermediateFeedback.bodySensation ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400 pointer-events-none'}`}>{t.saveNext}</button>
        </div>
      </Layout>
    );
  }

  const scene = INITIAL_SCENES[state.currentSceneId];
  return (
    <Layout lang={lang}>
      <div className={`space-y-8 transition-all duration-300 ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        <div className="relative rounded-[3rem] overflow-hidden aspect-[4/5] shadow-2xl border-8 border-white group">
          <img src={`https://picsum.photos/seed/${scene.id}_v20/800/1000`} alt="Scene" className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent flex flex-col justify-end p-8">
            <h2 className="text-white font-black text-2xl mb-3 tracking-tight">{scene.title}</h2>
            <p className="text-white/70 text-sm leading-relaxed font-medium">{scene.description}</p>
          </div>
        </div>
        <div className="grid gap-3">
          {scene.choices.map((choice) => (
            <button key={choice.id} onClick={() => {
              window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('medium');
              setIntermediateFeedback({ text: choice.text, nextId: choice.nextSceneId, belief: choice.beliefKey, userReflection: "", bodySensation: "" });
            }} className="w-full p-6 text-left rounded-3xl flex items-center bg-white border border-slate-50 text-slate-700 active:scale-95 transition-all shadow-sm hover:shadow-md"><span className="font-black text-sm flex-1">{choice.text}</span><span className="text-indigo-600 font-black ml-4">→</span></button>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default App;
