
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Layout } from './components/Layout.tsx';
import { INITIAL_SCENES } from './constants.ts';
import { translations } from './translations.ts';
import { getPsychologicalFeedback, AnalysisResult, LatticeEdge } from './services/psychologyService.ts';

declare global { interface Window { Telegram: { WebApp: any; }; } }

const IdentityLattice: React.FC<{ edges: LatticeEdge[], coherence: number }> = ({ edges, coherence }) => {
  return (
    <div className="relative w-full aspect-square flex items-center justify-center bg-[#0a0a10] rounded-[3.5rem] overflow-hidden border border-white/5 shadow-2xl">
      <svg viewBox="0 0 100 100" className="w-full h-full p-4">
        {edges.map((e, i) => (
          <line 
            key={i} 
            x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} 
            stroke={e.stress > 0.4 ? "#ef4444" : "#6366f1"} 
            strokeWidth={0.3 + (1 - e.stress) * 0.5} 
            strokeOpacity={0.1 + (1 - e.stress) * 0.6}
            className="animate-in fade-in duration-1000"
          />
        ))}
        {/* Центральный узел */}
        <circle cx="50" cy="50" r="1.5" fill="#818cf8" className="animate-pulse" />
      </svg>
      <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
        <div className="space-y-1">
          <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.3em]">Integrity</span>
          <div className="text-xl font-black text-white italic">{coherence}%</div>
        </div>
        <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${coherence}%` }}></div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [lang, setLang] = useState<'ru' | 'ka'>(() => (localStorage.getItem('app_lang') as 'ru' | 'ka') || 'ru');
  const t = useMemo(() => translations[lang], [lang]);
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('is_auth') === 'true');
  const [passwordInput, setPasswordInput] = useState("");
  const [state, setState] = useState<any>({ currentSceneId: 'welcome', history: [], isFinished: false });
  const [intermediateFeedback, setIntermediateFeedback] = useState<any>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    if (passwordInput.toLowerCase().trim() === "admin777" || passwordInput === "money") {
      setIsAuthenticated(true);
      localStorage.setItem('is_auth', 'true');
    } else {
      window.Telegram?.WebApp?.showAlert?.(t.wrongPassword);
    }
  };

  const proceedToNext = useCallback(async () => {
    if (!intermediateFeedback) return;
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
      setTimeout(() => {
        setLoading(false);
        setState((prev: any) => ({ ...prev, history: newHistory, isFinished: true }));
      }, 2500);
    } else {
      setState((prev: any) => ({ ...prev, currentSceneId: intermediateFeedback.nextId, history: newHistory }));
      setIntermediateFeedback(null);
    }
  }, [intermediateFeedback, state.currentSceneId, state.history, INITIAL_SCENES]);

  if (!isAuthenticated) return (
    <Layout lang={lang} onLangChange={setLang}>
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-12 animate-in fade-in duration-700">
        <div className="w-20 h-20 bg-slate-900 rounded-[2rem] flex items-center justify-center text-3xl shadow-2xl">💎</div>
        <div className="w-full space-y-8 px-4">
          <h2 className="text-3xl font-black text-slate-800 text-center uppercase italic tracking-tighter">{t.enterPassword}</h2>
          <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className="w-full p-8 bg-white border-2 border-slate-100 rounded-[2.5rem] text-center text-4xl font-black outline-none focus:ring-8 focus:ring-indigo-50 transition-all shadow-inner" onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
          <button onClick={handleLogin} className="w-full btn-primary py-7 text-white rounded-[2.5rem] font-black uppercase tracking-widest">{t.accessBtn}</button>
        </div>
      </div>
    </Layout>
  );

  if (loading) return (
    <Layout lang={lang} onLangChange={setLang}>
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-12">
        <div className="relative w-32 h-32">
          <div className="absolute inset-0 border-[3px] border-indigo-100 rounded-full"></div>
          <div className="absolute inset-0 border-[3px] border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-2xl font-black text-indigo-600">ID</div>
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 animate-pulse text-center">Сборка кристаллической структуры...</p>
      </div>
    </Layout>
  );

  if (state.isFinished && analysisData) return (
    <Layout lang={lang} onLangChange={setLang}>
      <div className="space-y-12 pb-32 animate-in slide-in-from-bottom duration-1000">
        <header className="space-y-6 px-4">
          <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.5em]">{t.resultAnalysis}</h3>
          <IdentityLattice edges={analysisData.lattice} coherence={analysisData.coherenceScore} />
        </header>

        <section className="game-card p-10 bg-[#0a0a0f] text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/10 blur-[80px] rounded-full"></div>
          <div className="relative z-10 space-y-4">
            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Resonant Archetype</span>
            <h2 className="text-5xl font-black italic uppercase leading-none tracking-tighter">
              {(t.archetypes as any)[analysisData.archetypeKey]}
            </h2>
            <div className="flex gap-4 pt-4">
              <div className="px-4 py-2 bg-white/5 rounded-full text-[9px] font-black uppercase border border-white/10">
                Resist: {analysisData.resistanceLevel}%
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] px-4">{t.reflectionMirrorTitle}</h3>
          {analysisData.reflectionMirror.map((m, i) => (
            <div key={i} className={`game-card p-8 border-l-4 transition-all ${m.isConflict ? 'border-red-500 bg-red-50/30' : 'border-indigo-600'}`}>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                {m.sceneTitle.split('.').reduce((p:any,c:any)=>p&&p[c], t)}
              </p>
              <p className="text-xl font-medium italic text-slate-800 leading-snug">"{m.thought || "..."}"</p>
              {m.isConflict && (
                <p className="mt-4 text-[11px] font-bold text-red-600 uppercase tracking-tight">Обнаружено сопротивление системы</p>
              )}
            </div>
          ))}
        </section>

        <div className="px-4 space-y-4">
          <button onClick={() => window.Telegram?.WebApp?.openLink?.("https://t.me/thndrrr")} className="w-full btn-primary py-8 text-white rounded-[2.5rem] font-black uppercase text-xs tracking-widest shadow-2xl">Личный разбор с Лукой</button>
          <button onClick={() => window.location.reload()} className="w-full py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Перезагрузить Identity</button>
        </div>
      </div>
    </Layout>
  );

  if (intermediateFeedback) return (
    <Layout lang={lang} onLangChange={setLang}>
      <div className="flex flex-col space-y-6 h-full animate-in slide-in-from-right duration-500">
        <div className="game-card p-10 flex-1 flex flex-col space-y-12">
          <div className="space-y-6">
            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{t.bodyQuestion}</label>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(t.bodySensations).map(([key, label]) => (
                <button key={key} onClick={() => setIntermediateFeedback({...intermediateFeedback, bodySensation: label})} className={`p-5 rounded-3xl text-[11px] font-black transition-all border-2 ${intermediateFeedback.bodySensation === label ? 'bg-slate-900 border-slate-900 text-white shadow-xl' : 'bg-white border-slate-50 text-slate-500'}`}>{label}</button>
              ))}
            </div>
          </div>
          <div className="space-y-6 flex-1">
            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{t.thoughtQuestion}</label>
            <textarea value={intermediateFeedback.userReflection} onChange={(e) => setIntermediateFeedback({...intermediateFeedback, userReflection: e.target.value})} className="w-full h-full p-8 bg-slate-50 rounded-[3rem] text-xl font-medium outline-none focus:ring-4 focus:ring-indigo-100 transition-all resize-none shadow-inner" placeholder="..." />
          </div>
        </div>
        <button onClick={proceedToNext} className={`w-full py-8 rounded-[2.5rem] font-black uppercase text-xs tracking-widest transition-all ${intermediateFeedback.bodySensation ? 'btn-primary text-white' : 'bg-slate-200 text-slate-400 pointer-events-none'}`}>{t.confirmBtn}</button>
      </div>
    </Layout>
  );

  const scene = INITIAL_SCENES[state.currentSceneId];
  return (
    <Layout lang={lang} onLangChange={setLang}>
      <div className="space-y-10 animate-in fade-in zoom-in duration-500">
        <div className="px-4 space-y-2">
          <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest italic opacity-50">Step {state.history.length + 1}</span>
          <h2 className="text-4xl font-black text-slate-800 uppercase tracking-tighter leading-none italic">{scene.titleKey.split('.').reduce((p:any,c:any)=>p&&p[c], t)}</h2>
        </div>
        <div className="relative rounded-[4rem] overflow-hidden aspect-[4/5] shadow-2xl border-8 border-white group">
          <img src={`https://picsum.photos/seed/${scene.id}_v20/900/1200`} className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all duration-1000" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent flex items-end p-10">
            <p className="text-white text-2xl font-medium leading-tight">{scene.descKey.split('.').reduce((p:any,c:any)=>p&&p[c], t)}</p>
          </div>
        </div>
        <div className="grid gap-4 pb-10">
          {scene.choices.map((c:any) => (
            <button key={c.id} onClick={() => setIntermediateFeedback({ text: c.textKey.split('.').reduce((p:any,c:any)=>p&&p[c], t), nextId: c.nextSceneId, belief: c.beliefKey, userReflection: "", bodySensation: "" })} className="w-full p-8 text-left rounded-[2.5rem] bg-white shadow-lg hover:shadow-indigo-50 border-2 border-white hover:border-indigo-100 transition-all group flex items-center justify-between">
              <span className="font-black text-lg text-slate-800 group-hover:text-indigo-600">{c.textKey.split('.').reduce((p:any,c:any)=>p&&p[c], t)}</span>
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">→</div>
            </button>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default App;
