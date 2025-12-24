
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Layout } from './components/Layout.tsx';
import { INITIAL_SCENES } from './constants.ts';
import { translations } from './translations.ts';
import { getPsychologicalFeedback } from './services/psychologyService.ts';

declare global {
  interface Window {
    Telegram: { WebApp: any; };
  }
}

const MASTER_KEY = "admin777";

// Вспомогательная функция для глубокого поиска по ключу в объекте переводов
const getTranslation = (obj: any, path: string) => {
  return path.split('.').reduce((prev, curr) => prev && prev[curr], obj) || path;
};

const playSound = (type: 'click' | 'success') => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;
    if (type === 'click') {
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
      gain.gain.setValueAtTime(0.05, now);
      osc.start(); osc.stop(now + 0.1);
    } else if (type === 'success') {
      [500, 700, 900].forEach((f, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.frequency.setValueAtTime(f, now + i * 0.08);
        g.gain.setValueAtTime(0.05, now + i * 0.08);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        o.start(now + i * 0.08); o.stop(now + 0.4);
      });
    }
  } catch (e) {}
};

const App: React.FC = () => {
  const [lang, setLang] = useState<'ru' | 'ka'>(() => (localStorage.getItem('app_lang') as 'ru' | 'ka') || 'ru');
  const t = useMemo(() => translations[lang], [lang]);

  useEffect(() => { localStorage.setItem('app_lang', lang); }, [lang]);

  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('is_auth') === 'true');
  const [passwordInput, setPasswordInput] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [state, setState] = useState<any>({ currentSceneId: 'welcome', history: [], isFinished: false });
  const [intermediateFeedback, setIntermediateFeedback] = useState<any>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }
  }, []);

  const handleLogin = () => {
    const input = passwordInput.toLowerCase().trim();
    if (input === MASTER_KEY || input === "money") {
      setIsAuthenticated(true);
      localStorage.setItem('is_auth', 'true');
      playSound('success');
    } else {
      window.Telegram?.WebApp?.showAlert?.(t.wrongPassword);
    }
  };

  const proceedToNext = useCallback(async () => {
    if (!intermediateFeedback) return;
    playSound('click');
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
          if (++step > 6) {
            clearInterval(timer);
            setLoading(false);
            setState((prev: any) => ({ ...prev, history: newHistory, isFinished: true }));
            playSound('success');
          }
        }, 600);
      } else {
        setState((prev: any) => ({ ...prev, currentSceneId: intermediateFeedback.nextId, history: newHistory }));
      }
      setIsTransitioning(false);
    }, 400);
  }, [intermediateFeedback, state]);

  const BalanceChart = ({ safety, permission, ambition }: any) => {
    const size = 200; const center = size / 2; const r = 80;
    const points = [
      [center, center - (r * (safety || 50) / 100)],
      [center + (r * (permission || 50) / 100 * 0.866), center + (r * (permission || 50) / 100 * 0.5)],
      [center - (r * (ambition || 50) / 100 * 0.866), center + (r * (ambition || 50) / 100 * 0.5)],
    ];
    const path = `M ${points[0][0]} ${points[0][1]} L ${points[1][0]} ${points[1][1]} L ${points[2][0]} ${points[2][1]} Z`;
    return (
      <div className="flex flex-col items-center py-6 relative animate-in fade-in duration-1000">
        <svg width={size} height={size} className="relative z-10 drop-shadow-2xl">
          {[0.2, 0.4, 0.6, 0.8, 1].map(scale => (
            <path key={scale} d={`M ${center} ${center - r*scale} L ${center + r*scale*0.866} ${center + r*scale*0.5} L ${center - r*scale*0.866} ${center + r*scale*0.5} Z`} fill="none" stroke="rgba(99, 102, 241, 0.05)" strokeWidth="1" />
          ))}
          <path d={path} fill="rgba(99, 102, 241, 0.3)" stroke="#6366f1" strokeWidth="5" strokeLinejoin="round" />
          {points.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="6" fill="#6366f1" stroke="white" strokeWidth="3" />)}
        </svg>
      </div>
    );
  };

  if (!isAuthenticated) {
    return (
      <Layout lang={lang} onLangChange={setLang}>
        <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-12 animate-in fade-in zoom-in duration-500">
          <div className="w-28 h-28 bg-white rounded-[3rem] shadow-2xl flex items-center justify-center text-5xl border border-white/50 relative">
            💎 <div className="absolute inset-0 bg-indigo-400 blur-3xl opacity-20 -z-10 animate-pulse"></div>
          </div>
          <div className="w-full space-y-6 text-center px-4">
            <h2 className="text-3xl font-[900] tracking-tighter text-slate-800 leading-tight">{t.enterPassword}</h2>
            <div className="space-y-4">
              <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="••••" className="w-full p-6 bg-white/60 backdrop-blur-lg border border-white rounded-3xl text-center font-black text-3xl outline-none focus:ring-4 focus:ring-indigo-100 transition-all shadow-inner" onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
              <button onClick={handleLogin} className="w-full btn-primary py-6 text-white rounded-3xl font-black text-xs uppercase tracking-[0.3em]">{t.accessBtn}</button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout lang={lang} onLangChange={setLang}>
        <div className="game-card p-10 flex flex-col items-center justify-center space-y-10 min-h-[500px] scene-transition">
          <div className="relative w-32 h-32">
            <div className="absolute inset-0 border-[10px] border-indigo-50 rounded-full"></div>
            <div className="absolute inset-0 border-[10px] border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-slate-800 font-[900] text-sm uppercase tracking-widest text-center animate-pulse leading-relaxed px-4">{t.loadingSteps[loadingStep % t.loadingSteps.length]}</p>
        </div>
      </Layout>
    );
  }

  if (state.isFinished && analysisData) {
    return (
      <Layout lang={lang} onLangChange={setLang}>
        <div className="space-y-6 pb-16 scene-transition">
          <div className="game-card p-8 border-b-8 border-indigo-600 shadow-xl">
            <div className="text-center space-y-2 mb-6">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">{t.resultArchetype}</span>
              <h2 className="text-3xl font-[900] text-slate-900 tracking-tight leading-tight">{(t.archetypes as any)[analysisData.archetypeKey]}</h2>
              <div className="inline-block px-4 py-2 bg-slate-900 text-white rounded-full text-[9px] font-black uppercase tracking-widest mt-2">
                {t.resultConflict}: {(t.conflicts as any)[analysisData.conflictKey]}
              </div>
            </div>
            <BalanceChart safety={analysisData.scoreSafety} permission={analysisData.scorePermission} ambition={analysisData.scoreAmbition} />
          </div>

          <div className="game-card p-8 space-y-10">
            <section className="space-y-5">
              <h3 className="text-[11px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-3">
                <span className="w-4 h-1 bg-indigo-500 rounded-full"></span> {t.resultAnalysis}
              </h3>
              <div className="space-y-4">
                {analysisData.analysisTextKeys.map((key: string, i: number) => (
                  <p key={i} className="text-slate-700 leading-relaxed text-lg font-medium">{(t.traitsAnalysis as any)[key]}</p>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {analysisData.defenseMechanisms.map((def: string, i: number) => (
                  <span key={i} className="px-4 py-1.5 bg-slate-100 text-slate-500 rounded-xl text-[9px] font-black uppercase border border-slate-200">🛡️ {def}</span>
                ))}
              </div>
            </section>

            <section className="space-y-6">
              <h3 className="text-[11px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-3">
                <span className="w-4 h-1 bg-indigo-500 rounded-full"></span> {t.resultRoadmap}
              </h3>
              <div className="space-y-4">
                {[
                  { label: t.roadmapLabels.now, icon: "⚡", key: analysisData.roadmapKeys.now },
                  { label: t.roadmapLabels.month1, icon: "📅", key: analysisData.roadmapKeys.month1 },
                  { label: t.roadmapLabels.month6, icon: "🎯", key: analysisData.roadmapKeys.month6 }
                ].map((step, i) => (
                  <div key={i} className="flex gap-4 p-5 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-sm">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-xl shrink-0 border border-slate-100">{step.icon}</div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{step.label}</span>
                      <p className="text-sm font-bold text-slate-700 leading-relaxed">{(t.roadmapTips as any)[step.key]}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="grid gap-4 px-2">
            <button onClick={() => window.Telegram?.WebApp?.openLink("https://t.me/your_username")} className="w-full btn-primary py-8 text-white rounded-[2.5rem] font-black text-sm uppercase tracking-[0.3em] active:scale-95 transition-transform">{t.bookBtn}</button>
            <button onClick={() => window.location.reload()} className="w-full py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">{t.restartBtn}</button>
          </div>
        </div>
      </Layout>
    );
  }

  if (intermediateFeedback) {
    return (
      <Layout lang={lang} onLangChange={setLang}>
        <div className="flex flex-col space-y-6 scene-transition h-full pt-2">
          <div className="game-card p-8 flex-1 flex flex-col space-y-12 relative overflow-hidden">
            <div className="space-y-3 text-center">
              <h3 className="text-4xl font-[900] text-slate-900 tracking-tight">{t.reflectionTitle}</h3>
              <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest">{t.reflectionSubtitle}</p>
            </div>
            <div className="space-y-6">
              <label className="text-[12px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-3"><span className="w-2.5 h-2.5 bg-indigo-600 rounded-full"></span> {t.bodyQuestion}</label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(t.bodySensations).map(([key, label]) => (
                  <button key={key} onClick={() => { playSound('click'); setIntermediateFeedback({...intermediateFeedback, bodySensation: label})}} className={`p-6 rounded-[2rem] text-[11px] font-black transition-all border-2 ${intermediateFeedback.bodySensation === label ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl scale-105' : 'bg-white border-slate-50 text-slate-400 hover:border-indigo-100'}`}>{label}</button>
                ))}
              </div>
            </div>
            <div className="space-y-6 flex-1">
              <label className="text-[12px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-3"><span className="w-2.5 h-2.5 bg-indigo-600 rounded-full"></span> {t.thoughtQuestion}</label>
              <textarea value={intermediateFeedback.userReflection} onChange={(e) => setIntermediateFeedback({...intermediateFeedback, userReflection: e.target.value})} className="w-full h-44 p-7 bg-slate-50 rounded-[2.5rem] text-xl font-medium outline-none focus:ring-8 focus:ring-indigo-50 transition-all resize-none border border-transparent focus:bg-white focus:shadow-inner" placeholder="..." />
            </div>
          </div>
          <button onClick={proceedToNext} className={`w-full py-8 rounded-[2.5rem] font-black shadow-2xl uppercase text-sm tracking-[0.3em] transition-all active:scale-95 ${intermediateFeedback.bodySensation ? 'btn-primary text-white' : 'bg-slate-200 text-slate-400 pointer-events-none'}`}>{t.confirmBtn}</button>
        </div>
      </Layout>
    );
  }

  const scene = INITIAL_SCENES[state.currentSceneId];
  return (
    <Layout lang={lang} onLangChange={setLang}>
      <div className={`space-y-10 scene-transition ${isTransitioning ? 'opacity-0 scale-95 blur-xl' : 'opacity-100 scale-100 blur-0'}`}>
        <div className="relative rounded-[4rem] overflow-hidden aspect-[4/5] shadow-3xl border-[16px] border-white group">
          <img src={`https://picsum.photos/seed/${scene.id}_v120/1000/1250`} alt="Scene" className="object-cover w-full h-full transition-transform duration-[10s] group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent flex flex-col justify-end p-10">
            <div className="space-y-5">
              <div className="w-16 h-1.5 bg-indigo-500 rounded-full animate-pulse"></div>
              <h2 className="text-white font-[900] text-4xl tracking-tight leading-none uppercase">{getTranslation(t, scene.titleKey)}</h2>
              <p className="text-white/90 text-xl leading-relaxed font-medium line-clamp-4">{getTranslation(t, scene.descKey)}</p>
            </div>
          </div>
        </div>
        <div className="grid gap-5 px-1">
          {scene.choices.map((choice) => (
            <button key={choice.id} onClick={() => {
              playSound('click');
              window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('heavy');
              setIntermediateFeedback({ text: getTranslation(t, choice.textKey), nextId: choice.nextSceneId, belief: choice.beliefKey, userReflection: "", bodySensation: "" });
            }} className="choice-button w-full p-8 text-left rounded-[2.5rem] flex items-center bg-white shadow-xl hover:shadow-2xl border border-white hover:border-indigo-100 group active:scale-[0.97]">
              <span className="font-black text-lg text-slate-800 flex-1 leading-snug pr-2">{getTranslation(t, choice.textKey)}</span>
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
