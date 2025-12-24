
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Layout } from './components/Layout.tsx';
import { INITIAL_SCENES } from './constants.ts';
import { translations } from './translations.ts';
import { getPsychologicalFeedback, AnalysisResult } from './services/psychologyService.ts';

declare global { interface Window { Telegram: { WebApp: any; }; } }

const EntropyGauge: React.FC<{ value: number }> = ({ value }) => (
  <div className="relative w-full h-1 bg-slate-900 rounded-full overflow-hidden">
    <div 
      className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-yellow-500 to-red-500 transition-all duration-1000"
      style={{ width: `${value * 100}%` }}
    />
    <div className="absolute top-0 right-0 h-full w-0.5 bg-white shadow-[0_0_10px_white]" style={{ left: `${value * 100}%` }} />
  </div>
);

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
    if (passwordInput.toLowerCase().trim() === "money" || passwordInput === "admin777") {
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
      const data = await getPsychologicalFeedback(newHistory);
      setAnalysisData(data);
      setTimeout(() => {
        setLoading(false);
        setState((prev: any) => ({ ...prev, history: newHistory, isFinished: true }));
      }, 2000);
    } else {
      setState((prev: any) => ({ ...prev, currentSceneId: intermediateFeedback.nextId, history: newHistory }));
      setIntermediateFeedback(null);
    }
  }, [intermediateFeedback, state.currentSceneId, state.history]);

  if (!isAuthenticated) return (
    <Layout lang={lang} onLangChange={setLang}>
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-10 animate-in fade-in zoom-in duration-700">
        <div className="relative">
          <div className="w-24 h-24 bg-slate-900 rounded-[2rem] flex items-center justify-center text-4xl shadow-2xl text-white font-black italic border-t border-white/10">LS</div>
          <div className="absolute -inset-4 bg-indigo-500/10 blur-2xl -z-10 rounded-full animate-pulse"></div>
        </div>
        <div className="w-full space-y-6 px-4">
          <div className="text-center space-y-1">
            <h2 className="text-xs font-black text-indigo-500 uppercase tracking-[0.4em]">{t.enterPassword}</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Authentication Required</p>
          </div>
          <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className="w-full p-8 bg-white border-2 border-slate-100 rounded-[2.5rem] text-center text-5xl font-black outline-none focus:ring-8 focus:ring-indigo-50/50 transition-all shadow-inner" onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
          <button onClick={handleLogin} className="w-full bg-slate-900 text-white py-8 rounded-[2.5rem] font-black uppercase text-xs tracking-[0.3em] shadow-2xl hover:bg-indigo-600 transition-colors">Initialize Scanner</button>
        </div>
      </div>
    </Layout>
  );

  if (loading) return (
    <Layout lang={lang} onLangChange={setLang}>
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-10">
        <div className="relative w-48 h-48">
          <div className="absolute inset-0 border-[1px] border-indigo-100 rounded-full animate-[ping_2s_infinite]"></div>
          <div className="absolute inset-4 border-[1px] border-indigo-200 rounded-full animate-[ping_3s_infinite]"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[10px] font-black text-indigo-600 animate-pulse tracking-[0.4em]">DECODING</span>
            <div className="w-12 h-0.5 bg-indigo-600 mt-2"></div>
          </div>
        </div>
        <div className="text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">Psychic Entropy Map</p>
          <p className="text-[8px] font-bold text-slate-300 uppercase mt-2 italic">Вычисляется векторное напряжение...</p>
        </div>
      </div>
    </Layout>
  );

  if (state.isFinished && analysisData) return (
    <Layout lang={lang} onLangChange={setLang}>
      <div className="space-y-12 pb-32 animate-in slide-in-from-bottom-10 duration-1000">
        <header className="px-4 space-y-8">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <span className="text-[8px] font-black text-indigo-500 uppercase tracking-[0.4em]">Core Integrity</span>
              <div className="text-6xl font-black text-slate-900 italic tracking-tighter leading-none">{analysisData.integrityScore}%</div>
            </div>
            <div className="text-right space-y-1">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em]">Entropy Level</span>
              <div className="text-xl font-black text-slate-400">{(analysisData.entropy * 100).toFixed(1)}%</div>
            </div>
          </div>
          <EntropyGauge value={analysisData.entropy} />
        </header>

        <section className="mx-4 grid grid-cols-2 gap-4">
           <div className="bg-slate-900 p-6 rounded-[2.5rem] text-white space-y-1">
             <span className="text-[7px] font-black text-white/30 uppercase tracking-widest">Kinetic Potential</span>
             <div className="text-3xl font-black italic">{analysisData.kineticPotential}%</div>
           </div>
           <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-1">
             <span className="text-[7px] font-black text-slate-300 uppercase tracking-widest">Fracture Limit</span>
             <div className="text-3xl font-black italic text-red-500">{analysisData.fractureLimit}%</div>
           </div>
        </section>

        <section className="px-4 space-y-6">
          <div className="flex items-center gap-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">Prescription Plan</h3>
            <div className="h-px flex-1 bg-slate-100"></div>
          </div>
          <div className="space-y-4">
            {analysisData.prescription.map((step) => (
              <div key={step.id} className="bg-white p-8 rounded-[3rem] border border-slate-50 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${step.domain === 'body' ? 'bg-indigo-500' : step.domain === 'mind' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{step.domain} PROTOCOL</span>
                </div>
                <p className="text-lg font-bold text-slate-800 leading-tight italic">"{step.instruction}"</p>
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <span className="text-[7px] font-black text-indigo-400 uppercase block mb-1">Scientific Rationale:</span>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{step.scientificBasis}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="px-4 space-y-4">
          <button onClick={() => window.Telegram?.WebApp?.openLink?.("https://t.me/thndrrr")} className="w-full bg-slate-900 text-white py-8 rounded-[2.5rem] font-black uppercase text-xs tracking-[0.3em] shadow-2xl active:scale-95 transition-all">Submit for Human Review</button>
          <button onClick={() => window.location.reload()} className="w-full py-4 text-[9px] font-black text-slate-300 uppercase tracking-widest">Recalibrate System</button>
        </div>
      </div>
    </Layout>
  );

  if (intermediateFeedback) return (
    <Layout lang={lang} onLangChange={setLang}>
      <div className="flex flex-col space-y-6 h-full animate-in slide-in-from-right duration-500">
        <div className="bg-white p-10 flex-1 flex flex-col space-y-12 rounded-[4rem] shadow-sm border border-slate-50">
          <div className="space-y-6">
            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{t.bodyQuestion}</label>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(t.bodySensations).map(([key, label]) => (
                <button key={key} onClick={() => setIntermediateFeedback({...intermediateFeedback, bodySensation: label})} className={`p-6 rounded-[2rem] text-[11px] font-black transition-all border-2 ${intermediateFeedback.bodySensation === label ? 'bg-slate-900 border-slate-900 text-white shadow-xl translate-y-[-2px]' : 'bg-slate-50 border-transparent text-slate-400'}`}>{label}</button>
              ))}
            </div>
          </div>
          <div className="space-y-6 flex-1">
            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{t.thoughtQuestion}</label>
            <textarea value={intermediateFeedback.userReflection} onChange={(e) => setIntermediateFeedback({...intermediateFeedback, userReflection: e.target.value})} className="w-full h-full p-8 bg-slate-50 rounded-[3rem] text-xl font-medium outline-none focus:ring-4 focus:ring-indigo-100 transition-all resize-none shadow-inner border border-slate-100" placeholder="..." />
          </div>
        </div>
        <button onClick={proceedToNext} className={`w-full py-9 rounded-[2.5rem] font-black uppercase text-xs tracking-[0.4em] transition-all shadow-xl ${intermediateFeedback.bodySensation ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400 pointer-events-none'}`}>Validate Data</button>
      </div>
    </Layout>
  );

  const scene = INITIAL_SCENES[state.currentSceneId];
  return (
    <Layout lang={lang} onLangChange={setLang}>
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="px-4 space-y-2">
          <div className="flex items-center gap-2">
             <div className="w-8 h-px bg-indigo-500"></div>
             <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest italic">Module {state.history.length + 1}</span>
          </div>
          <h2 className="text-5xl font-black text-slate-900 uppercase tracking-tighter leading-[0.9] italic">{scene.titleKey.split('.').reduce((p:any,c:any)=>p&&p[c], t)}</h2>
        </div>
        <div className="relative rounded-[4rem] overflow-hidden aspect-[3/4] shadow-2xl border-[12px] border-white group">
          <img src={`https://picsum.photos/seed/psych_${scene.id}/900/1200`} className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent flex items-end p-10">
            <p className="text-white text-2xl font-medium leading-tight opacity-90">{scene.descKey.split('.').reduce((p:any,c:any)=>p&&p[c], t)}</p>
          </div>
        </div>
        <div className="grid gap-3 pb-10">
          {scene.choices.map((c:any) => (
            <button key={c.id} onClick={() => setIntermediateFeedback({ text: c.textKey.split('.').reduce((p:any,c:any)=>p&&p[c], t), nextId: c.nextSceneId, belief: c.beliefKey, userReflection: "", bodySensation: "" })} className="w-full p-8 text-left rounded-[2.5rem] bg-white shadow-sm border border-slate-100 hover:border-indigo-600 hover:shadow-indigo-50 transition-all group relative overflow-hidden">
              <span className="relative z-10 font-black text-lg text-slate-800 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{c.textKey.split('.').reduce((p:any,c:any)=>p&&p[c], t)}</span>
              <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all text-indigo-600 font-black italic tracking-widest">SELECT →</div>
            </button>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default App;
