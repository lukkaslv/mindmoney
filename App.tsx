
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Layout } from './components/Layout.tsx';
import { MODULE_REGISTRY } from './constants.ts';
import { translations } from './translations.ts';
import { calculateGenesisCore, AnalysisResult, ProtocolStep } from './services/psychologyService.ts';

const App: React.FC = () => {
  const [lang, setLang] = useState<'ru' | 'ka'>(() => (localStorage.getItem('app_lang') as 'ru' | 'ka') || 'ru');
  const t = useMemo(() => translations[lang], [lang]);
  
  const [view, setView] = useState<'auth' | 'boot' | 'dashboard' | 'test' | 'body_sync' | 'reflection' | 'results'>('auth');
  const [password, setPassword] = useState("");
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [currentDomain, setCurrentDomain] = useState<'foundation' | 'agency' | 'money' | 'social' | 'legacy' | null>(null);
  const [state, setState] = useState({ currentId: '0', history: [] as any[], lastChoice: null as any });
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [globalProgress, setGlobalProgress] = useState(0);
  const [completedNodeIds, setCompletedNodeIds] = useState<number[]>([]);
  const [bootStep, setBootStep] = useState(0);
  const [selectedBug, setSelectedBug] = useState<string | null>(null);
  const [lastSelectedNode, setLastSelectedNode] = useState<number | null>(null);
  
  const nodeStartTime = useRef<number>(0);

  useEffect(() => {
    localStorage.setItem('app_lang', lang);
    const savedProgress = localStorage.getItem('global_progress');
    const savedNodes = localStorage.getItem('completed_node_ids');
    const sessionAuth = localStorage.getItem('session_auth');
    if (savedProgress) setGlobalProgress(parseInt(savedProgress));
    if (savedNodes) setCompletedNodeIds(JSON.parse(savedNodes));
    if (sessionAuth === 'true') setView('dashboard');
  }, [lang]);

  // Boot sequence effect
  useEffect(() => {
    if (view === 'boot') {
      const timer = setInterval(() => {
        setBootStep(prev => {
          if (prev < 4) return prev + 1;
          clearInterval(timer);
          setTimeout(() => setView('dashboard'), 800);
          return prev;
        });
      }, 400);
      return () => clearInterval(timer);
    }
  }, [view]);

  const nodes = useMemo(() => {
    return Array.from({ length: 50 }, (_, i) => {
      const isCompleted = completedNodeIds.includes(i);
      // SHIFTED MATRIX: Foundation (0-14), Agency (15-24), Money (25-34), Social (35-44), Legacy (45-49)
      const domain = i < 15 ? 'foundation' : i < 25 ? 'agency' : i < 35 ? 'money' : i < 45 ? 'social' : 'legacy';
      const isActive = i < 5 || completedNodeIds.includes(i - 1) || (globalProgress > (i * 1.8));
      return { id: i, domain, active: isActive, done: isCompleted };
    });
  }, [globalProgress, completedNodeIds]);

  const handleLogin = () => {
    if (["luka", "money", "arch"].includes(password.toLowerCase())) {
      localStorage.setItem('session_auth', 'true');
      setView('boot');
    }
  };

  const startNode = (nodeId: number, domain: string) => {
    nodeStartTime.current = Date.now();
    setLastSelectedNode(nodeId);
    setActiveModule(domain);
    setState({ currentId: nodeId.toString(), history: state.history, lastChoice: null });
    setView('test');
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.('medium');
  };

  const handleChoice = (choice: any) => {
    const latency = Date.now() - nodeStartTime.current;
    setState({ ...state, lastChoice: { ...choice, latency } });
    setView('body_sync');
  };

  const syncBodySensation = (sensation: string) => {
    const nextHistory = [...state.history, { 
      beliefKey: state.lastChoice.beliefKey, 
      sensation, 
      latency: state.lastChoice.latency 
    }];
    setView('reflection');
    setTimeout(() => {
      const res = calculateGenesisCore(nextHistory);
      setResult(res);
      if (lastSelectedNode !== null && !completedNodeIds.includes(lastSelectedNode)) {
        const nextNodes = [...completedNodeIds, lastSelectedNode];
        setCompletedNodeIds(nextNodes);
        localStorage.setItem('completed_node_ids', JSON.stringify(nextNodes));
        const nextProgress = Math.min(100, Math.round((nextNodes.length / 50) * 100));
        setGlobalProgress(nextProgress);
        localStorage.setItem('global_progress', nextProgress.toString());
      }
      setView('results');
    }, 1800);
  };

  const isGlitchMode = result && result.entropyScore > 45;

  if (view === 'auth') return (
    <Layout lang={lang} onLangChange={setLang}>
      <div className="flex flex-col items-center justify-center py-20 space-y-12 animate-in">
        <div className="w-24 h-24 bg-slate-950 rounded-[2.5rem] flex items-center justify-center text-indigo-500 font-black text-4xl border border-indigo-500/20 shadow-2xl">G</div>
        <div className="w-full px-4 space-y-6 text-center">
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-widest">Genesis Access</h2>
          <input type="password" placeholder="PASS_CODE" className="w-full p-6 bg-slate-50 border border-slate-200 rounded-3xl text-center font-mono text-indigo-600 outline-none focus:bg-white text-lg" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
          <button onClick={handleLogin} className="w-full bg-slate-950 text-white p-6 rounded-3xl font-black uppercase text-xs tracking-[0.3em]">Authorize</button>
        </div>
      </div>
    </Layout>
  );

  if (view === 'boot') return (
    <Layout lang={lang} onLangChange={setLang}>
      <div className="flex flex-col justify-center py-20 px-10 space-y-6 font-mono h-full">
        {["Initializing v5.0...", "Loading Sovereign Engine...", "Integrity: 100%", "Syncing Link...", "Ready."].slice(0, bootStep + 1).map((m, i) => (
          <div key={i} className="flex gap-4 animate-in">
            <span className="text-indigo-400 font-bold">>>></span>
            <span className="text-slate-800 text-xs font-black">{m}</span>
          </div>
        ))}
      </div>
    </Layout>
  );

  if (view === 'dashboard') return (
    <Layout lang={lang} onLangChange={setLang}>
      <div className="space-y-10 animate-in px-4 pb-20">
        <header className="border-l-4 border-indigo-500 pl-5">
          <h2 className="text-4xl font-black italic uppercase text-slate-900">{t.dashboard.title}</h2>
          <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">{t.dashboard.desc}</p>
        </header>

        <section className="bg-slate-950 p-7 rounded-[2.5rem] border border-slate-800 shadow-2xl relative overflow-hidden">
           <div className="flex justify-between items-start relative z-10 text-white">
              <div className="space-y-1">
                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">{t.global.level}</span>
                 <span className="text-2xl font-black text-indigo-400 italic uppercase">Lvl_{Math.floor(globalProgress / 20) + 1}</span>
              </div>
              <div className="text-right">
                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">{t.global.progress}</span>
                 <span className="text-2xl font-black italic">{globalProgress}%</span>
              </div>
           </div>
           <div className="mt-6 h-1.5 bg-slate-900 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${globalProgress}%` }}></div>
           </div>
        </section>

        {!currentDomain ? (
          <div className="grid grid-cols-1 gap-4">
            {Object.keys(t.domains).map(domain => (
              <button key={domain} onClick={() => setCurrentDomain(domain as any)} className="p-7 rounded-[2rem] bg-white border border-slate-100 shadow-sm flex items-center justify-between hover:border-indigo-400 transition-all active:scale-95">
                <span className="text-lg font-black text-slate-900 italic uppercase">{(t.domains as any)[domain]}</span>
                <span className="text-indigo-400 font-mono text-xs">GO >></span>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-8 animate-in">
            <div className="flex justify-between items-center">
              <button onClick={() => setCurrentDomain(null)} className="text-[10px] font-black text-indigo-500 uppercase">← Sectors</button>
              <h3 className="text-xl font-black italic uppercase text-slate-900">{(t.domains as any)[currentDomain]}</h3>
            </div>
            <div className="grid grid-cols-5 gap-3">
               {nodes.filter(n => n.domain === currentDomain).map(n => (
                  <button key={n.id} disabled={!n.active || n.done} onClick={() => startNode(n.id, n.domain)}
                    className={`aspect-square rounded-2xl border transition-all flex items-center justify-center text-sm font-mono ${
                      n.done ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg scale-95' :
                      n.active ? 'bg-white border-indigo-100 text-indigo-600 animate-pulse' :
                      'bg-slate-50 border-slate-50 text-slate-200'
                    }`}
                  >
                    {n.done ? '✔' : n.id + 1}
                  </button>
               ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );

  if (view === 'test' && activeModule) {
    const scene = MODULE_REGISTRY[activeModule][state.currentId];
    // Fallback if scene is missing (critical safety)
    if (!scene) {
       return (
         <Layout lang={lang} onLangChange={setLang}>
            <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-4">
              <div className="text-red-500 font-black text-4xl">⚠</div>
              <p className="text-slate-900 font-bold uppercase">Node_{state.currentId} Corruption</p>
              <button onClick={() => setView('dashboard')} className="p-4 bg-slate-950 text-white rounded-xl uppercase text-xs">Return</button>
            </div>
         </Layout>
       )
    }

    return (
      <Layout lang={lang} onLangChange={setLang}>
        <div className="space-y-10 py-10 px-4 animate-in">
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-indigo-500 font-bold uppercase tracking-[0.4em]">LINKING NODE_{lastSelectedNode}</span>
            <h3 className="text-3xl font-black italic uppercase text-slate-900">{(t.scenes as any)[scene.id]?.title || '...'}</h3>
          </div>
          <div className="bg-slate-950 p-8 rounded-[2rem] text-indigo-50 font-medium italic border border-indigo-500/10 shadow-xl min-h-[180px] flex items-center text-lg">
            {(t.scenes as any)[scene.id]?.desc || '...'}
          </div>
          <div className="space-y-3">
            {scene.choices.map((c, i) => (
              <button key={c.id} onClick={() => handleChoice(c)} className="w-full p-6 text-left bg-white border border-slate-100 rounded-[1.8rem] shadow-sm font-bold text-xs uppercase flex items-center gap-5 active:scale-95 transition-all">
                <span className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-indigo-300 font-mono">0{i+1}</span>
                <span className="flex-1">{(t.scenes as any)[scene.id]?.[`c${i+1}`] || '...'}</span>
              </button>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  // ... rest of the component (body_sync, results) remains same ...
  if (view === 'body_sync') return (
    <Layout lang={lang} onLangChange={setLang}>
       <div className="py-20 text-center px-4 space-y-12 animate-in h-full flex flex-col justify-center">
          <div className="w-24 h-24 rounded-full bg-slate-950 flex items-center justify-center text-indigo-500 text-3xl mx-auto border border-indigo-500/20 animate-pulse">📡</div>
          <div className="space-y-4">
             <h3 className="text-xs font-black uppercase tracking-[0.5em] text-indigo-600">{t.sync.title}</h3>
             <p className="text-lg font-bold text-slate-800">{t.sync.desc}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
             {['s1', 's2', 's3', 's4'].map(s => (
               <button key={s} onClick={() => syncBodySensation(s)} className="p-7 bg-white border border-slate-100 rounded-[2rem] shadow-sm text-[10px] font-black uppercase tracking-widest active:bg-indigo-600 active:text-white transition-all">
                  {(t.sync as any)[s]}
               </button>
             ))}
          </div>
       </div>
    </Layout>
  );

  if (view === 'results' && result) return (
    <Layout lang={lang} onLangChange={setLang}>
      <div className={`space-y-12 pb-32 animate-in px-4 ${isGlitchMode ? 'glitch' : ''}`}>
        <header className="space-y-1">
          <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.5em]">Neural_Blueprint</span>
          <h3 className="text-4xl font-black italic uppercase text-slate-900">{result.archetype.ru}</h3>
        </header>

        <div className="grid grid-cols-2 gap-4">
           <div className="p-7 bg-indigo-600 rounded-[2rem] shadow-xl text-white">
              <span className="text-[10px] font-black uppercase opacity-60 mb-1 block">{t.results.stability}</span>
              <p className="text-4xl font-black italic">{result.systemHealth}%</p>
           </div>
           <div className="p-7 bg-slate-950 rounded-[2rem] shadow-xl text-indigo-400 border border-slate-800">
              <span className="text-[10px] font-black uppercase opacity-60 mb-1 block">{t.results.neuro_sync}</span>
              <p className="text-4xl font-black italic">{result.neuroSync}%</p>
           </div>
        </div>

        <section className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-[0.5em] text-slate-400 border-b pb-2">{t.results.logTitle}</h3>
          <div className="grid grid-cols-1 gap-3">
            {result.bugs.length > 0 ? result.bugs.map(v => (
              <button key={v} onClick={() => setSelectedBug(v)} className="w-full bg-white p-6 rounded-[1.8rem] border border-slate-100 flex items-center justify-between shadow-sm active:scale-95 transition-all">
                <span className="text-xs font-black text-slate-900 uppercase italic">{(t.beliefs as any)[v] || v}</span>
                <span className="text-indigo-400 font-mono text-[10px]">FIX >></span>
              </button>
            )) : <div className="p-8 text-center bg-green-50 text-green-600 font-black text-[10px] rounded-[2rem]">SYSTEM_STABLE</div>}
          </div>
        </section>

        <section className="space-y-6">
           <h3 className="text-xs font-black uppercase tracking-[0.5em] text-slate-400 border-b pb-2">{t.results.roadmap}</h3>
           <div className="space-y-4">
              {result.roadmap.map((step, i) => (
                <div key={i} className="bg-slate-950 p-8 rounded-[2.5rem] border border-slate-800 space-y-4 relative overflow-hidden">
                   <div className="flex justify-between items-center font-mono text-[10px] font-bold">
                      <span className="text-indigo-400">0{i+1}</span>
                      <span className="text-slate-500">{(t.phases as any)[step.phase.toLowerCase()]}</span>
                   </div>
                   <h5 className="text-white font-black text-lg uppercase italic">{step.task[lang]}</h5>
                   <p className="text-xs text-slate-400 italic font-medium">[{step.method[lang]}]</p>
                   <div className="pt-3 border-t border-slate-900 text-[9px] text-indigo-300 font-bold uppercase tracking-widest">{step.targetMetric[lang]}</div>
                </div>
              ))}
           </div>
        </section>

        <button onClick={() => setView('dashboard')} className="w-full p-8 bg-slate-950 text-white rounded-[2.5rem] font-black uppercase text-[10px] tracking-[0.4em] shadow-2xl active:scale-95 transition-all border border-slate-800">Return_To_Matrix</button>
      </div>

      {selectedBug && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-sm animate-in" onClick={() => setSelectedBug(null)}>
            <div className="bg-white p-10 rounded-[3rem] shadow-2xl max-w-sm space-y-6" onClick={e => e.stopPropagation()}>
               <h4 className="font-black text-xl uppercase italic text-slate-900">{(t.beliefs as any)[selectedBug]}</h4>
               <p className="text-sm text-slate-600 leading-relaxed italic">{(t.explanations as any)[selectedBug]}</p>
               <button onClick={() => setSelectedBug(null)} className="w-full p-5 bg-slate-950 text-white rounded-2xl font-black uppercase text-[10px]">Acknowledge</button>
            </div>
         </div>
      )}
    </Layout>
  );

  return null;
};

export default App;
