
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  const scrollRef = useRef<HTMLDivElement>(null);

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

  const totalScenes = Object.keys(INITIAL_SCENES).length;
  const currentProgress = (state.history.length / totalScenes) * 100;

  const handleLogin = () => {
    if (passwordInput.toLowerCase().trim() === MASTER_KEY || passwordInput === "money") {
      setIsAuthenticated(true);
      localStorage.setItem('is_auth', 'true');
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
    } else {
      window.Telegram?.WebApp?.showAlert?.(t.wrongPassword);
    }
  };

  const proceedToNext = useCallback(async () => {
    if (!intermediateFeedback) return;
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('medium');
    
    const newHistory = [...state.history, { 
      sceneId: state.currentSceneId, 
      beliefKey: intermediateFeedback.belief,
      bodySensation: intermediateFeedback.bodySensation,
      userReflection: intermediateFeedback.userReflection
    }];

    if (!intermediateFeedback.nextId || intermediateFeedback.nextId === 'end') {
      setLoading(true);
      const data = await getPsychologicalFeedback(newHistory, INITIAL_SCENES);
      setAnalysisData(data);
      
      let step = 0;
      const timer = setInterval(() => {
        setLoadingStep(s => s + 1);
        if (++step >= t.loadingSteps.length) {
          clearInterval(timer);
          setLoading(false);
          setState((prev: any) => ({ ...prev, history: newHistory, isFinished: true }));
          window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
        }
      }, 600);
    } else {
      setIntermediateFeedback(null);
      setState((prev: any) => ({ ...prev, currentSceneId: intermediateFeedback.nextId, history: newHistory }));
    }
  }, [intermediateFeedback, state, t.loadingSteps.length]);

  const RadarChart = ({ safety, permission, ambition }: any) => {
    const size = 280; const center = size / 2; const r = 85;
    const points = [
      [center, center - (r * (safety || 50) / 100)],
      [center + (r * (permission || 50) / 100 * 0.866), center + (r * (permission || 50) / 100 * 0.5)],
      [center - (r * (ambition || 50) / 100 * 0.866), center + (r * (ambition || 50) / 100 * 0.5)],
    ];
    const path = `M ${points[0][0]} ${points[0][1]} L ${points[1][0]} ${points[1][1]} L ${points[2][0]} ${points[2][1]} Z`;
    
    return (
      <div className="flex flex-col items-center py-6 relative">
        <svg width={size} height={size} className="drop-shadow-2xl overflow-visible">
          {[0.2, 0.4, 0.6, 0.8, 1].map(scale => (
            <path key={scale} d={`M ${center} ${center - r*scale} L ${center + r*scale*0.866} ${center + r*scale*0.5} L ${center - r*scale*0.866} ${center + r*scale*0.5} Z`} fill="none" stroke="rgba(99, 102, 241, 0.05)" strokeWidth="1" />
          ))}
          <path d={path} fill="rgba(99, 102, 241, 0.3)" stroke="#6366f1" strokeWidth="4" strokeLinejoin="round" className="animate-pulse" />
          {points.map((p, i) => (
            <circle key={i} cx={p[0]} cy={p[1]} r="5" fill="#6366f1" stroke="white" strokeWidth="2" />
          ))}
        </svg>
      </div>
    );
  };

  if (!isAuthenticated) {
    return (
      <Layout lang={lang} onLangChange={setLang}>
        <div className="flex flex-col items-center justify-center min-h-[75vh] space-y-12 animate-in fade-in duration-700">
          <div className="w-24 h-24 bg-white rounded-[2rem] shadow-2xl flex items-center justify-center text-4xl border border-white/60">💎</div>
          <div className="w-full space-y-6 text-center px-4">
            <h2 className="text-3xl font-[900] text-slate-800 leading-tight">{t.enterPassword}</h2>
            <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="••••" className="w-full p-6 bg-white border-2 border-indigo-50 rounded-3xl text-center font-black text-2xl outline-none focus:border-indigo-500 transition-all shadow-inner" onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
            <button onClick={handleLogin} className="w-full btn-primary py-6 text-white rounded-3xl font-black text-sm uppercase tracking-widest">{t.accessBtn}</button>
          </div>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout lang={lang} onLangChange={setLang}>
        <div className="game-card p-12 flex flex-col items-center justify-center space-y-12 min-h-[500px]">
          <div className="relative w-32 h-32">
            <div className="absolute inset-0 border-8 border-indigo-100 rounded-full"></div>
            <div className="absolute inset-0 border-8 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.3em] text-center animate-pulse">{t.loadingSteps[loadingStep % t.loadingSteps.length]}</p>
        </div>
      </Layout>
    );
  }

  if (state.isFinished && analysisData) {
    return (
      <Layout lang={lang} onLangChange={setLang}>
        <div className="space-y-8 pb-32 animate-in fade-in slide-in-from-bottom-10 duration-1000">
          {/* Header Identity Card */}
          <div className="game-card p-8 text-center bg-slate-900 text-white shadow-indigo-500/20 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-5xl">🧬</div>
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{t.resultArchetype}</span>
            <h2 className="text-4xl font-[900] mt-2 mb-4 italic">{(t.archetypes as any)[analysisData.archetypeKey]}</h2>
            <div className="inline-block px-4 py-2 bg-indigo-600 rounded-full text-[9px] font-black uppercase tracking-widest mb-6">
              Паттерн: {(t.patterns as any)[analysisData.patternKey]}
            </div>
            <RadarChart safety={analysisData.scoreSafety} permission={analysisData.scorePermission} ambition={analysisData.scoreAmbition} />
          </div>

          {/* Deep Insights (The 'Meat') */}
          <section className="space-y-4">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-4">{t.resultAnalysis}</h3>
            <div className="grid gap-4">
              <div className="game-card p-6 bg-white/50 border-l-8 border-rose-500">
                <span className="text-[9px] font-black text-rose-500 uppercase">Теневая ловушка</span>
                <p className="text-lg font-bold text-slate-800 mt-1">{(t.traps as any)[analysisData.trapKey]}</p>
              </div>
              {analysisData.analysisTextKeys.map((key, i) => (
                <div key={i} className="game-card p-6 bg-white shadow-sm border border-slate-100">
                  <p className="text-md leading-relaxed text-slate-600 font-medium">{(t.traitsAnalysis as any)[key]}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Action Roadmap */}
          <section className="space-y-6 pt-4">
             <div className="flex items-center gap-4 px-4">
                <div className="h-px bg-indigo-200 flex-1"></div>
                <h3 className="text-[11px] font-black text-indigo-500 uppercase tracking-[0.3em]">{t.resultRoadmap}</h3>
                <div className="h-px bg-indigo-200 flex-1"></div>
             </div>
             <div className="space-y-4">
               {analysisData.roadmap.steps.map((step, i) => (
                 <div key={i} className="game-card p-8 flex gap-6 items-start bg-gradient-to-br from-white to-indigo-50/30">
                   <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shrink-0 shadow-lg">{i+1}</div>
                   <div>
                     <h4 className="font-[900] text-slate-800 text-sm uppercase tracking-wide">{(t.roadmapSteps as any)[step.label]}</h4>
                     <p className="text-slate-600 mt-2 text-md leading-relaxed">{(t.roadmapSteps as any)[step.action]}</p>
                   </div>
                 </div>
               ))}
             </div>
          </section>

          <div className="grid gap-4 px-2">
            <button onClick={() => window.Telegram?.WebApp?.openLink("https://t.me/your_username")} className="w-full btn-primary py-7 text-white rounded-3xl font-black text-sm uppercase tracking-widest shadow-2xl">Запись на разбор</button>
            <button onClick={() => window.location.reload()} className="w-full py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Перезапустить сессию</button>
          </div>
        </div>
      </Layout>
    );
  }

  if (intermediateFeedback) {
    return (
      <Layout lang={lang} onLangChange={setLang}>
        <div className="flex flex-col space-y-6 h-full animate-in slide-in-from-right-10 duration-500">
          <div className="game-card p-8 flex-1 flex flex-col space-y-8 bg-indigo-50/50">
            <div className="text-center space-y-2">
              <h3 className="text-3xl font-[900] text-slate-900">{t.reflectionTitle}</h3>
              <p className="text-indigo-500 text-[10px] font-black uppercase tracking-widest">{t.reflectionSubtitle}</p>
            </div>
            
            <div className="space-y-6">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Телесный отклик</label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(t.bodySensations).map(([key, label]) => (
                  <button key={key} onClick={() => setIntermediateFeedback({...intermediateFeedback, bodySensation: label})} className={`p-4 rounded-2xl text-[11px] font-bold transition-all border-2 ${intermediateFeedback.bodySensation === label ? 'bg-indigo-600 border-indigo-600 text-white scale-105' : 'bg-white border-transparent text-slate-500 hover:border-indigo-100'}`}>{label}</button>
                ))}
              </div>
            </div>

            <div className="space-y-4 flex-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Честный поток мыслей</label>
              <textarea value={intermediateFeedback.userReflection} onChange={(e) => setIntermediateFeedback({...intermediateFeedback, userReflection: e.target.value})} className="w-full h-full min-h-[120px] p-6 bg-white rounded-3xl text-lg outline-none focus:ring-4 focus:ring-indigo-100 transition-all resize-none shadow-sm" placeholder="..." />
            </div>
          </div>
          <button onClick={proceedToNext} className={`w-full py-7 rounded-3xl font-black uppercase text-sm tracking-widest transition-all ${intermediateFeedback.bodySensation ? 'btn-primary text-white shadow-xl' : 'bg-slate-200 text-slate-400 pointer-events-none'}`}>{t.confirmBtn}</button>
        </div>
      </Layout>
    );
  }

  const scene = INITIAL_SCENES[state.currentSceneId];
  return (
    <Layout lang={lang} onLangChange={setLang}>
      <div className="space-y-8 animate-in fade-in duration-700">
        <div className="flex justify-between items-end px-2">
           <div className="space-y-1">
              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest italic">Шаг {state.history.length + 1}</span>
              <h2 className="text-3xl font-[900] text-slate-800 uppercase italic tracking-tighter leading-none">{getTranslation(t, scene.titleKey)}</h2>
           </div>
           <span className="text-[10px] font-black text-slate-300">{Math.round(currentProgress)}%</span>
        </div>

        <div className="relative rounded-[3rem] overflow-hidden aspect-[4/5] shadow-2xl border-4 border-white">
          <img src={`https://picsum.photos/seed/${scene.id}_v3/800/1000`} alt="Scene" className="object-cover w-full h-full grayscale hover:grayscale-0 transition-all duration-1000" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent flex items-end p-8">
            <p className="text-white text-xl leading-relaxed font-medium drop-shadow-md">{getTranslation(t, scene.descKey)}</p>
          </div>
        </div>

        <div className="grid gap-4">
          {scene.choices.map((choice) => (
            <button key={choice.id} onClick={() => {
              window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light');
              setIntermediateFeedback({ text: getTranslation(t, choice.textKey), nextId: choice.nextSceneId, belief: choice.beliefKey, userReflection: "", bodySensation: "" });
            }} className="w-full p-6 text-left rounded-3xl bg-white shadow-sm border-2 border-transparent hover:border-indigo-500 hover:shadow-indigo-100 transition-all group flex items-center justify-between">
              <span className="font-bold text-lg text-slate-800 group-hover:text-indigo-600">{getTranslation(t, choice.textKey)}</span>
              <span className="text-indigo-200 group-hover:translate-x-1 transition-transform">→</span>
            </button>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default App;
