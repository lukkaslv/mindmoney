import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Layout } from './components/Layout.tsx';
import { INITIAL_SCENES } from './constants.ts';
import { translations } from './translations.ts';
import { getPsychologicalFeedback } from './services/psychologyService.ts';

// Fix: Corrected global Window interface declaration (uppercase 'Window' is required to extend the global object)
declare global {
  interface Window {
    Telegram: { WebApp: any; };
  }
}

const MASTER_KEY = "admin777";

const getTranslation = (obj: any, path: string) => {
  return path.split('.').reduce((prev, curr) => prev && prev[curr], obj) || path;
};

const playSound = (type: 'click' | 'success' | 'focus') => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;
    
    if (type === 'click') {
      osc.frequency.setValueAtTime(350, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.12);
      gain.gain.setValueAtTime(0.06, now);
      osc.start(); osc.stop(now + 0.12);
    } else if (type === 'focus') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(200, now + 0.5);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.04, now + 0.1);
      gain.gain.linearRampToValueAtTime(0, now + 0.5);
      osc.start(); osc.stop(now + 0.5);
    } else if (type === 'success') {
      [440, 554, 659].forEach((f, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.frequency.setValueAtTime(f, now + i * 0.1);
        g.gain.setValueAtTime(0.05, now + i * 0.1);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        o.start(now + i * 0.1); o.stop(now + 0.5);
      });
    }
  } catch (e) {}
};

const App: React.FC = () => {
  const [lang, setLang] = useState<'ru' | 'ka'>(() => (localStorage.getItem('app_lang') as 'ru' | 'ka') || 'ru');
  const t = useMemo(() => translations[lang], [lang]);

  useEffect(() => { 
    localStorage.setItem('app_lang', lang);
    document.body.setAttribute('lang', lang);
  }, [lang]);

  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('is_auth') === 'true');
  const [passwordInput, setPasswordInput] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [state, setState] = useState<any>({ currentSceneId: 'welcome', history: [], isFinished: false });
  const [intermediateFeedback, setIntermediateFeedback] = useState<any>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const totalScenes = Object.keys(INITIAL_SCENES).length;
  const currentProgress = (state.history.length / totalScenes) * 100;

  useEffect(() => {
    // Fix: Accessing Telegram WebApp through the corrected Window interface
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      window.Telegram.WebApp.setHeaderColor('#fdfdff');
    }
  }, []);

  const handleLogin = () => {
    const input = passwordInput.toLowerCase().trim();
    if (input === MASTER_KEY || input === "money") {
      setIsAuthenticated(true);
      localStorage.setItem('is_auth', 'true');
      playSound('success');
    } else {
      // Fix: Accessing Telegram WebApp safely
      window.Telegram?.WebApp?.showAlert?.(t.wrongPassword);
    }
  };

  const proceedToNext = useCallback(async () => {
    if (!intermediateFeedback) return;
    playSound('click');
    // Fix: Accessing Telegram WebApp safely
    window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
    
    const newHistory = [...state.history, { 
      sceneId: state.currentSceneId, 
      beliefKey: intermediateFeedback.belief,
      bodySensation: intermediateFeedback.bodySensation,
      userReflection: intermediateFeedback.userReflection
    }];
    
    setIsTransitioning(true);
    setIntermediateFeedback(null);
    
    setTimeout(async () => {
      if (!intermediateFeedback.nextId || intermediateFeedback.nextId === 'end') {
        setLoading(true);
        const data = await getPsychologicalFeedback(newHistory);
        setAnalysisData(data);
        let step = 0;
        const timer = setInterval(() => {
          setLoadingStep(s => s + 1);
          if (++step >= t.loadingSteps.length) {
            clearInterval(timer);
            setLoading(false);
            setState((prev: any) => ({ ...prev, history: newHistory, isFinished: true }));
            playSound('success');
          }
        }, 800);
      } else {
        setState((prev: any) => ({ ...prev, currentSceneId: intermediateFeedback.nextId, history: newHistory }));
      }
      setIsTransitioning(false);
    }, 400);
  }, [intermediateFeedback, state, t.loadingSteps.length]);

  const RadarChart = ({ safety, permission, ambition }: any) => {
    const size = 240; const center = size / 2; const r = 100;
    const points = [
      [center, center - (r * (safety || 50) / 100)],
      [center + (r * (permission || 50) / 100 * 0.866), center + (r * (permission || 50) / 100 * 0.5)],
      [center - (r * (ambition || 50) / 100 * 0.866), center + (r * (ambition || 50) / 100 * 0.5)],
    ];
    const path = `M ${points[0][0]} ${points[0][1]} L ${points[1][0]} ${points[1][1]} L ${points[2][0]} ${points[2][1]} Z`;
    
    return (
      <div className="flex flex-col items-center py-8 relative">
        <svg width={size} height={size} className="drop-shadow-[0_15px_30px_rgba(99,102,241,0.2)]">
          {[0.25, 0.5, 0.75, 1].map(scale => (
            <path key={scale} d={`M ${center} ${center - r*scale} L ${center + r*scale*0.866} ${center + r*scale*0.5} L ${center - r*scale*0.866} ${center + r*scale*0.5} Z`} fill="none" stroke="rgba(99, 102, 241, 0.1)" strokeWidth="1.5" />
          ))}
          <path d={path} fill="rgba(99, 102, 241, 0.25)" stroke="#6366f1" strokeWidth="6" strokeLinejoin="round" className="animate-in zoom-in duration-1000" />
          {points.map((p, i) => (
            <g key={i}>
               <circle cx={p[0]} cy={p[1]} r="8" fill="#6366f1" stroke="white" strokeWidth="4" className="animate-bounce" style={{animationDelay: `${i*200}ms`}} />
            </g>
          ))}
        </svg>
      </div>
    );
  };

  if (!isAuthenticated) {
    return (
      <Layout lang={lang} onLangChange={setLang}>
        <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-12 animate-in fade-in zoom-in duration-700">
          <div className="w-32 h-32 bg-white rounded-[3.5rem] shadow-2xl flex items-center justify-center text-6xl border border-white/60 relative">
            💎 <div className="absolute inset-0 bg-indigo-400 blur-[80px] opacity-25 -z-10 animate-pulse"></div>
          </div>
          <div className="w-full space-y-8 text-center px-4">
            <h2 className="text-4xl font-[900] tracking-tighter text-slate-800 leading-tight">{t.enterPassword}</h2>
            <div className="space-y-5">
              <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="••••" className="w-full p-8 bg-white/70 backdrop-blur-xl border-2 border-white rounded-[2.5rem] text-center font-black text-4xl outline-none focus:ring-8 focus:ring-indigo-50 transition-all shadow-inner" onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
              <button onClick={handleLogin} className="w-full btn-primary py-7 text-white rounded-[2.5rem] font-black text-sm uppercase tracking-[0.4em] active:scale-95 transition-transform">{t.accessBtn}</button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout lang={lang} onLangChange={setLang}>
        <div className="game-card p-12 flex flex-col items-center justify-center space-y-12 min-h-[550px] scene-transition">
          <div className="relative w-40 h-40">
            <div className="absolute inset-0 border-[12px] border-indigo-50 rounded-full"></div>
            <div className="absolute inset-0 border-[12px] border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center text-4xl animate-pulse">🧬</div>
          </div>
          <p className="text-slate-800 font-[900] text-sm uppercase tracking-[0.2em] text-center animate-pulse leading-relaxed px-8 h-12 flex items-center">{t.loadingSteps[loadingStep % t.loadingSteps.length]}</p>
        </div>
      </Layout>
    );
  }

  if (state.isFinished && analysisData) {
    return (
      <Layout lang={lang} onLangChange={setLang}>
        <div className="space-y-8 pb-20 scene-transition">
          <div className="game-card p-10 border-b-[12px] border-indigo-600 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10 text-6xl rotate-12">💎</div>
            <div className="text-center space-y-3 mb-8">
              <span className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.5em]">{t.resultArchetype}</span>
              <h2 className="text-4xl font-[900] text-slate-900 tracking-tight leading-none">{(t.archetypes as any)[analysisData.archetypeKey]}</h2>
              <div className="inline-block px-5 py-2.5 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest mt-4 shadow-lg">
                {t.resultConflict}: {(t.conflicts as any)[analysisData.conflictKey]}
              </div>
            </div>
            <RadarChart safety={analysisData.scoreSafety} permission={analysisData.scorePermission} ambition={analysisData.scoreAmbition} />
          </div>

          <div className="game-card p-10 space-y-12">
            <section className="space-y-6">
              <h3 className="text-[12px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-4">
                <span className="w-6 h-1 bg-indigo-500 rounded-full"></span> {t.resultAnalysis}
              </h3>
              <div className="space-y-5">
                {analysisData.analysisTextKeys.map((key: string, i: number) => (
                  <div key={i} className="flex gap-4 p-6 bg-slate-50/50 rounded-3xl border border-white">
                    <span className="text-2xl">💡</span>
                    <p className="text-slate-700 leading-relaxed text-lg font-medium">{(t.traitsAnalysis as any)[key]}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                {analysisData.defenseMechanisms.map((def: string, i: number) => (
                  <span key={i} className="px-5 py-2.5 bg-indigo-50 text-indigo-600 rounded-2xl text-[10px] font-black uppercase border border-indigo-100 shadow-sm">🛡️ {def}</span>
                ))}
              </div>
            </section>

            <section className="space-y-8">
              <h3 className="text-[12px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-4">
                <span className="w-6 h-1 bg-indigo-500 rounded-full"></span> {t.resultRoadmap}
              </h3>
              <div className="space-y-5">
                {[
                  { label: t.roadmapLabels.now, icon: "⚡", key: analysisData.roadmapKeys.now },
                  { label: t.roadmapLabels.month1, icon: "📅", key: analysisData.roadmapKeys.month1 },
                  { label: t.roadmapLabels.month6, icon: "🎯", key: analysisData.roadmapKeys.month6 }
                ].map((step, i) => (
                  <div key={i} className="flex gap-5 p-6 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl hover:shadow-2xl transition-shadow group">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 group-hover:bg-indigo-600 group-hover:text-white transition-colors flex items-center justify-center text-2xl shrink-0 border border-indigo-100/50">{step.icon}</div>
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{step.label}</span>
                      <p className="text-sm font-bold text-slate-800 leading-relaxed">{(t.roadmapTips as any)[step.key]}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="grid gap-5 px-2">
            {/* Fix: Accessing Telegram WebApp safely through window.Telegram */}
            <button onClick={() => window.Telegram?.WebApp?.openLink("https://t.me/your_username")} className="w-full btn-primary py-8 text-white rounded-[2.5rem] font-black text-sm uppercase tracking-[0.4em] active:scale-95 transition-transform">{t.bookBtn}</button>
            <button onClick={() => window.location.reload()} className="w-full py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] hover:text-indigo-600 transition-colors text-center">{t.restartBtn}</button>
          </div>
        </div>
      </Layout>
    );
  }

  if (intermediateFeedback) {
    return (
      <Layout lang={lang} onLangChange={setLang}>
        <div className="flex flex-col space-y-8 scene-transition h-full pt-4">
          <div className="game-card p-10 flex-1 flex flex-col space-y-12 relative overflow-hidden bg-indigo-900/5">
            <div className="space-y-3 text-center">
              <h3 className="text-4xl font-[900] text-slate-900 tracking-tight">{t.reflectionTitle}</h3>
              <p className="text-indigo-400 text-[11px] font-black uppercase tracking-[0.4em]">{t.reflectionSubtitle}</p>
            </div>
            
            <div className="space-y-8">
              <label className="text-[13px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-4"><span className="w-3 h-3 bg-indigo-600 rounded-full animate-pulse"></span> {t.bodyQuestion}</label>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(t.bodySensations).map(([key, label]) => (
                  <button key={key} onClick={() => { playSound('focus'); setIntermediateFeedback({...intermediateFeedback, bodySensation: label})}} className={`p-7 rounded-[2.5rem] text-[12px] font-black transition-all border-2 ${intermediateFeedback.bodySensation === label ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xl scale-105' : 'bg-white/80 border-white text-slate-500 hover:border-indigo-100'}`}>{label}</button>
                ))}
              </div>
            </div>

            <div className="space-y-8 flex-1">
              <label className="text-[13px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-4"><span className="w-3 h-3 bg-indigo-600 rounded-full"></span> {t.thoughtQuestion}</label>
              <textarea value={intermediateFeedback.userReflection} onChange={(e) => setIntermediateFeedback({...intermediateFeedback, userReflection: e.target.value})} className="w-full h-full min-h-[160px] p-8 bg-white/50 backdrop-blur-md rounded-[3rem] text-xl font-medium outline-none focus:ring-[12px] focus:ring-indigo-100 transition-all resize-none border-2 border-white focus:bg-white shadow-inner placeholder:text-slate-300" placeholder="..." />
            </div>
          </div>
          <button onClick={proceedToNext} className={`w-full py-8 rounded-[2.5rem] font-black shadow-2xl uppercase text-sm tracking-[0.4em] transition-all active:scale-95 ${intermediateFeedback.bodySensation ? 'btn-primary text-white' : 'bg-slate-200 text-slate-400 pointer-events-none'}`}>{t.confirmBtn}</button>
        </div>
      </Layout>
    );
  }

  const scene = INITIAL_SCENES[state.currentSceneId];
  return (
    <Layout lang={lang} onLangChange={setLang}>
      <div className={`space-y-10 scene-transition ${isTransitioning ? 'opacity-0 scale-95 blur-2xl' : 'opacity-100 scale-100 blur-0'}`}>
        
        {/* Progress Bar */}
        <div className="px-4 space-y-2">
          <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
             <span>Step {state.history.length + 1} / {totalScenes}</span>
             <span>{Math.round(currentProgress)}%</span>
          </div>
          <div className="h-2 w-full bg-indigo-100/50 rounded-full overflow-hidden border border-white">
            <div className="h-full bg-indigo-600 progress-bar-fill rounded-full" style={{ width: `${currentProgress}%` }}></div>
          </div>
        </div>

        <div className="relative rounded-[4.5rem] overflow-hidden aspect-[3/4] shadow-3xl border-[16px] border-white group">
          <img src={`https://picsum.photos/seed/${scene.id}_v${state.history.length}_HD/1200/1500`} alt="Scene" className="object-cover w-full h-full transition-transform duration-[12s] group-hover:scale-110 ease-out" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent flex flex-col justify-end p-6 pb-10">
            <div className="space-y-4">
              <div className="w-16 h-1.5 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
              <h2 className="text-white font-[900] text-3xl tracking-tight leading-none uppercase">{getTranslation(t, scene.titleKey)}</h2>
              <p className="text-white/95 text-lg leading-relaxed font-medium drop-shadow-md">{getTranslation(t, scene.descKey)}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-5 px-1 pb-4">
          {scene.choices.map((choice) => (
            <button key={choice.id} onClick={() => {
              playSound('click');
              // Fix: Accessing Telegram safely through newly declared interface
              window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('heavy');
              setIntermediateFeedback({ text: getTranslation(t, choice.textKey), nextId: choice.nextSceneId, belief: choice.beliefKey, userReflection: "", bodySensation: "" });
            }} className="choice-button w-full p-8 text-left rounded-[2.5rem] flex items-center bg-white shadow-2xl hover:shadow-indigo-100 border-2 border-white hover:border-indigo-100 group active:scale-[0.96] transition-all">
              <span className="font-black text-lg text-slate-800 flex-1 leading-tight pr-4">{getTranslation(t, choice.textKey)}</span>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center ml-2 shrink-0 group-hover:bg-indigo-600 transition-all duration-300">
                <span className="text-indigo-600 font-black text-xl group-hover:text-white">→</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default App;