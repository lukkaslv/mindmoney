
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Layout } from './components/Layout.tsx';
import { INITIAL_SCENES } from './constants.ts';
import { translations } from './translations.ts';
import { getPsychologicalFeedback, AnalysisResult } from './services/psychologyService.ts';

declare global {
  interface Window {
    Telegram: { WebApp: any; };
  }
}

const MASTER_KEY = "admin777";

const getTranslation = (obj: any, path: string) => {
  return path.split('.').reduce((prev, curr) => prev && prev[curr], obj) || path;
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
  const [state, setState] = useState<any>({ currentSceneId: 'welcome', history: [], isFinished: false });
  const [intermediateFeedback, setIntermediateFeedback] = useState<any>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const handleLogin = () => {
    if (passwordInput.toLowerCase().trim() === MASTER_KEY || passwordInput === "money") {
      setIsAuthenticated(true);
      localStorage.setItem('is_auth', 'true');
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.('success');
    } else {
      window.Telegram?.WebApp?.showAlert?.(t.wrongPassword);
    }
  };

  const proceedToNext = useCallback(async () => {
    if (!intermediateFeedback) return;
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.('medium');
    
    const newHistory = [...state.history, { 
      sceneId: state.currentSceneId, 
      beliefKey: intermediateFeedback.belief,
      bodySensation: intermediateFeedback.bodySensation,
      userReflection: intermediateFeedback.userReflection
    }];

    if (!intermediateFeedback.nextId || intermediateFeedback.nextId === 'end') {
      setLoading(true);
      try {
        const data = await getPsychologicalFeedback(newHistory, INITIAL_SCENES);
        setAnalysisData(data);
        
        let step = 0;
        const timer = setInterval(() => {
          setLoadingStep(s => (s + 1) % t.loadingSteps.length);
          step++;
          if (step >= t.loadingSteps.length * 2) {
            clearInterval(timer);
            setLoading(false);
            setState((prev: any) => ({ ...prev, history: newHistory, isFinished: true }));
          }
        }, 700);
      } catch (e) {
        console.error("Analysis Error:", e);
        setLoading(false);
        window.Telegram?.WebApp?.showAlert?.("Error calculating feedback.");
      }
    } else {
      const nextId = intermediateFeedback.nextId;
      setIntermediateFeedback(null);
      setState((prev: any) => ({ ...prev, currentSceneId: nextId, history: newHistory }));
    }
  }, [intermediateFeedback, state, t.loadingSteps.length]);

  if (!isAuthenticated) {
    return (
      <Layout lang={lang} onLangChange={setLang}>
        <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-12 animate-in fade-in duration-1000">
          <div className="relative group">
            <div className="w-28 h-28 bg-white rounded-[2.5rem] shadow-3xl flex items-center justify-center text-5xl border border-white/60 relative z-10">💎</div>
            <div className="absolute inset-0 bg-indigo-400 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
          </div>
          <div className="w-full space-y-8 text-center px-4">
            <h2 className="text-4xl font-[900] text-slate-800 tracking-tight leading-none uppercase italic">{t.enterPassword}</h2>
            <div className="space-y-4">
               <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="••••" className="w-full p-8 bg-white/80 border-2 border-white rounded-[2.5rem] text-center font-black text-4xl outline-none focus:ring-8 focus:ring-indigo-50 transition-all shadow-inner" onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
               <button onClick={handleLogin} className="w-full btn-primary py-7 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] active:scale-95 transition-all shadow-2xl">{t.accessBtn}</button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout lang={lang} onLangChange={setLang}>
        <div className="game-card p-12 flex flex-col items-center justify-center space-y-12 min-h-[500px] border-none shadow-none bg-transparent">
          <div className="relative w-40 h-40">
            <div className="absolute inset-0 border-[12px] border-indigo-50 rounded-full"></div>
            <div className="absolute inset-0 border-[12px] border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center text-4xl animate-bounce">🗝️</div>
          </div>
          <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.4em] text-center h-12 flex items-center">{t.loadingSteps[loadingStep]}</p>
        </div>
      </Layout>
    );
  }

  if (state.isFinished && analysisData) {
    return (
      <Layout lang={lang} onLangChange={setLang}>
        <div className="space-y-10 pb-32 animate-in fade-in slide-in-from-bottom-20 duration-1000">
          <div className="game-card p-10 bg-slate-900 text-white shadow-3xl relative overflow-hidden">
            <div className="relative z-10 space-y-6">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{t.resultArchetype}</span>
                <span className="text-[10px] font-black opacity-30">LUKA LAB PRO</span>
              </div>
              <h2 className="text-5xl font-[900] tracking-tighter leading-none italic">{(t as any).archetypes?.[analysisData.archetypeKey] || analysisData.archetypeKey}</h2>
              <div className="pt-4 border-t border-white/10 flex flex-wrap gap-2">
                <span className="px-4 py-2 bg-indigo-600 rounded-full text-[9px] font-black uppercase">{(t.scenarios as any)[analysisData.scenarioKey]}</span>
                <span className="px-4 py-2 bg-white/10 rounded-full text-[9px] font-black uppercase">{(t.traps as any)[analysisData.trapKey]}</span>
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 text-[12rem] opacity-[0.03] font-black rotate-12 select-none pointer-events-none">LUKA</div>
          </div>

          <section className="space-y-6">
             <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] px-4">{t.reflectionMirrorTitle}</h3>
             <div className="space-y-4">
                {analysisData.reflectionMirror.map((m, i) => (
                  <div key={i} className="game-card p-8 bg-white/40 border border-white hover:bg-white/70 transition-colors">
                     <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{getTranslation(t, m.sceneTitle)}</span>
                     <p className="text-xl font-medium text-slate-800 mt-2 italic leading-snug">"{m.thought}"</p>
                     <div className="mt-6 p-5 bg-indigo-50 rounded-3xl border-l-4 border-indigo-400">
                        <p className="text-sm font-bold text-indigo-900 leading-relaxed">{(t.confrontations as any)[m.confrontation]}</p>
                     </div>
                  </div>
                ))}
             </div>
          </section>

          <section className="space-y-8">
             <div className="flex items-center gap-6 px-4">
                <h3 className="text-[11px] font-black text-indigo-500 uppercase tracking-[0.5em]">{t.resultRoadmap}</h3>
                <div className="h-px bg-indigo-200 flex-1"></div>
             </div>
             <div className="grid gap-6">
               {analysisData.roadmap.steps.map((step, i) => (
                 <div key={i} className="game-card p-10 bg-white shadow-2xl relative group overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-[5rem] -mr-10 -mt-10 group-hover:scale-110 transition-transform"></div>
                    <div className="relative z-10 space-y-4">
                       <span className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xl mb-4">{i+1}</span>
                       <h4 className="text-xl font-[900] text-slate-900 uppercase tracking-tight">{(t.roadmapSteps as any)[step.label]}</h4>
                       <p className="text-slate-600 text-lg leading-relaxed">{(t.roadmapSteps as any)[step.action]}</p>
                       <div className="mt-6 pt-6 border-t border-slate-100">
                          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-2">Практика:</span>
                          <p className="text-indigo-900 font-bold">{(t.roadmapSteps as any)[step.homework]}</p>
                       </div>
                    </div>
                 </div>
               ))}
             </div>
          </section>

          <div className="grid gap-5 px-4">
             <button onClick={() => window.Telegram?.WebApp?.openLink?.("https://t.me/thndrrr")} className="w-full btn-primary py-8 text-white rounded-[2.5rem] font-black text-sm uppercase tracking-[0.4em] shadow-indigo-200 shadow-2xl">{t.bookBtn}</button>
             <button onClick={() => window.location.reload()} className="w-full py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center hover:text-indigo-600 transition-colors">{t.restartBtn}</button>
          </div>
        </div>
      </Layout>
    );
  }

  if (intermediateFeedback) {
    return (
      <Layout lang={lang} onLangChange={setLang}>
        <div className="flex flex-col space-y-8 h-full animate-in slide-in-from-right-20 duration-700">
          <div className="game-card p-10 flex-1 flex flex-col space-y-10 bg-white/60">
            <div className="text-center space-y-3">
              <h3 className="text-4xl font-[900] text-slate-900 tracking-tight">{t.reflectionTitle}</h3>
              <p className="text-indigo-400 text-[11px] font-black uppercase tracking-[0.4em]">{t.reflectionSubtitle}</p>
            </div>
            
            <div className="space-y-6">
              <label className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em] px-2">{t.bodyQuestion}</label>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(t.bodySensations).map(([key, label]) => (
                  <button key={key} onClick={() => setIntermediateFeedback({...intermediateFeedback, bodySensation: label})} className={`p-6 rounded-[2rem] text-[12px] font-black transition-all border-2 ${intermediateFeedback.bodySensation === label ? 'bg-slate-900 border-slate-900 text-white shadow-xl scale-105' : 'bg-white border-white text-slate-500 hover:border-indigo-100'}`}>{label}</button>
                ))}
              </div>
            </div>

            <div className="space-y-6 flex-1">
              <label className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em] px-2">{t.thoughtQuestion}</label>
              <textarea value={intermediateFeedback.userReflection} onChange={(e) => setIntermediateFeedback({...intermediateFeedback, userReflection: e.target.value})} className="w-full h-full min-h-[150px] p-8 bg-white border-2 border-white rounded-[3rem] text-xl font-medium outline-none focus:ring-[12px] focus:ring-indigo-50 transition-all resize-none shadow-inner placeholder:text-slate-200" placeholder="..." />
            </div>
          </div>
          <button onClick={proceedToNext} className={`w-full py-8 rounded-[2.5rem] font-black uppercase text-xs tracking-[0.4em] transition-all active:scale-95 shadow-2xl ${intermediateFeedback.bodySensation ? 'btn-primary text-white' : 'bg-slate-200 text-slate-400 pointer-events-none'}`}>{t.confirmBtn}</button>
        </div>
      </Layout>
    );
  }

  const scene = INITIAL_SCENES[state.currentSceneId];
  const totalScenes = Object.keys(INITIAL_SCENES).length;
  const currentProgress = (state.history.length / totalScenes) * 100;

  return (
    <Layout lang={lang} onLangChange={setLang}>
      <div className="space-y-10 animate-in fade-in zoom-in duration-700">
        <div className="flex justify-between items-end px-4">
           <div className="space-y-2">
              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.5em] italic">Step {state.history.length + 1}</span>
              <h2 className="text-4xl font-[900] text-slate-800 uppercase tracking-tighter italic leading-none">{getTranslation(t, scene.titleKey)}</h2>
           </div>
           <div className="w-16 h-16 rounded-full border-2 border-indigo-100 flex items-center justify-center text-[10px] font-black text-indigo-300">{Math.round(currentProgress)}%</div>
        </div>

        <div className="relative rounded-[4rem] overflow-hidden aspect-[4/5] shadow-4xl border-[10px] border-white group">
          <img src={`https://picsum.photos/seed/${scene.id}_v5/900/1200`} alt="Scene" className="object-cover w-full h-full grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent flex items-end p-10">
            <p className="text-white text-2xl leading-relaxed font-medium drop-shadow-xl">{getTranslation(t, scene.descKey)}</p>
          </div>
        </div>

        <div className="grid gap-5 px-1 pb-10">
          {scene.choices.map((choice) => (
            <button key={choice.id} onClick={() => {
              window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.('heavy');
              setIntermediateFeedback({ text: getTranslation(t, choice.textKey), nextId: choice.nextSceneId, belief: choice.beliefKey, userReflection: "", bodySensation: "" });
            }} className="w-full p-8 text-left rounded-[2.5rem] bg-white shadow-xl hover:shadow-indigo-100 border-2 border-white hover:border-indigo-200 transition-all group flex items-center justify-between active:scale-95">
              <span className="font-[900] text-xl text-slate-800 group-hover:text-indigo-600 leading-tight pr-6">{getTranslation(t, choice.textKey)}</span>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 transition-colors">
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
