
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
  const [isGlitching, setIsGlitching] = useState(false);
  
  // Timer for Latency Conflict
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

  const domainColors: Record<string, string> = {
    foundation: 'rgba(239, 68, 68, 0.12)',
    agency: 'rgba(34, 197, 94, 0.12)',
    money: 'rgba(99, 102, 241, 0.12)',
    social: 'rgba(168, 85, 247, 0.12)',
    legacy: 'rgba(236, 72, 153, 0.12)'
  };

  const nodes = useMemo(() => {
    return Array.from({ length: 50 }, (_, i) => {
      const isCompleted = completedNodeIds.includes(i);
      const domain = i < 10 ? 'foundation' : i < 20 ? 'agency' : i < 30 ? 'money' : i < 40 ? 'social' : 'legacy';
      const isFirstOfDomain = i % 10 === 0;
      const isPrevCompleted = i > 0 && completedNodeIds.includes(i - 1);
      const isActive = i < 5 || isFirstOfDomain || isPrevCompleted || (globalProgress > (i * 1.5));
      return { id: i, domain, active: isActive, done: isCompleted };
    });
  }, [globalProgress, completedNodeIds]);

  const domainStats = useMemo(() => {
    const counts = { foundation: 0, agency: 0, money: 0, social: 0, legacy: 0 };
    completedNodeIds.forEach(id => {
      if (id < 10) counts.foundation++;
      else if (id < 20) counts.agency++;
      else if (id < 30) counts.money++;
      else if (id < 40) counts.social++;
      else counts.legacy++;
    });
    return counts;
  }, [completedNodeIds]);

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
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.('light');
  };

  const syncBodySensation = (sensation: string) => {
    const nextHistory = [...state.history, { 
      beliefKey: state.lastChoice.beliefKey, 
      sensation, 
      latency: state.lastChoice.latency 
    }];
    finishTest(nextHistory);
  };

  const finishTest = (history: any[]) => {
    setView('reflection');
    setTimeout(() => {
      const res = calculateGenesisCore(history);
      setResult(res);
      if (res.entropyScore > 40) setIsGlitching(true);
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

  const exportProgress = () => {
    const snapshot = {
      timestamp: Date.now(),
      completedNodeIds,
      globalProgress
    };
    const code = btoa(JSON.stringify(snapshot));
    navigator.clipboard.writeText(code);
    alert(t.global.save_success);
  };

  if (view === 'auth') return (
    <Layout lang={lang} onLangChange={setLang}>
      <div className="flex flex-col items-center justify-center py-20 space-y-12 animate-in">
        <div className="w-28 h-28 bg-slate-950 rounded-[3rem] flex items-center justify-center text-indigo-500 font-black text-5xl border border-indigo-500/20 shadow-2xl">G</div>
        <div className="w-full px-4 space-y-6 text-center">
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-widest">Genesis 5.0 Access</h2>
          <input type="password" placeholder="PASS_CODE" className="w-full p-6 bg-slate-50 border border-slate-200 rounded-3xl text-center font-mono text-indigo-600 outline-none focus:bg-white text-lg tracking-widest" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
          <button onClick={handleLogin} className="w-full bg-slate-950 text-white p-6 rounded-3xl font-black uppercase text-xs tracking-widest">Unlock_Matrix</button>
        </div>
      </div>
    </Layout>
  );

  if (view === 'boot') return (
    <Layout lang={lang} onLangChange={setLang}>
      <div className="flex flex-col justify-center py-20 px-10 space-y-6 font-mono h-full">
        {["Booting Genesis 5.0...", "Loading Sovereign Engine...", "Integrity: 100%", "Syncing Subconscious Link...", "Ready."].slice(0, bootStep + 1).map((m, i) => (
          <div key={i} className="flex gap-4 animate-in">
            <span className="text-indigo-400 font-bold">>>></span>
            <span className="text-slate-800 text-xs font-black">{m}</span>
          </div>
        ))}
        {bootStep < 4 ? <div className="hidden">{setTimeout(() => setBootStep(bootStep + 1), 400)}</div> : <div className="hidden">{setTimeout(() => setView('dashboard'), 800)}</div>}
      </div>
    </Layout>
  );

  if (view === 'dashboard') return (
    <Layout lang={lang} onLangChange={setLang}>
      <div className="space-y-10 animate-in px-4 pb-20">
        <header className="border-l-4 border-indigo-500 pl-5">
          <h2 className="text-4xl font-black italic uppercase leading-tight text-slate-900">{t.dashboard.title}</h2>
          <p className="text-[11px] font-mono text-slate-400 uppercase tracking-widest">{t.dashboard.desc}</p>
        </header>

        <section className="bg-slate-950 p-7 rounded-[3rem] border border-slate-800 shadow-2xl relative overflow-hidden">
           <div className="flex justify-between items-start relative z-10 text-white">
              <div className="space-y-1">
                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">{t.global.level}</span>
                 <span className="text-3xl font-black text-indigo-400 italic">SOVEREIGN_{Math.floor(globalProgress / 25) + 1}</span>
              </div>
              <div className="text-right">
                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">{t.global.progress}</span>
                 <span className="text-3xl font-black italic">{globalProgress}%</span>
              </div>
           </div>
           <div className="mt-6 h-2 bg-slate-900 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500" style={{ width: `${globalProgress}%` }}></div>
           </div>
           <div className="absolute inset-0 bg-indigo-500/5 animate-pulse"></div>
        </section>

        {!currentDomain ? (
          <div className="grid grid-cols-1 gap-4">
            {Object.keys(domainStats).map(domain => (
              <button key={domain} onClick={() => setCurrentDomain(domain as any)} className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm flex items-center justify-between hover:border-indigo-400 transition-all active:scale-95">
                <div className="flex flex-col items-start">
                  <span className="text-[9px] font-black text-indigo-500 uppercase opacity-60">ID_SECTOR</span>
                  <span className="text-xl font-black text-slate-900 italic uppercase">{t.domains[domain as keyof typeof t.domains]}</span>
                </div>
                <span className="text-2xl font-black italic text-slate-300">{(domainStats as any)[domain]}</span>
              </button>
            ))}
            <div className="flex gap-4 pt-4">
              <button onClick={exportProgress} className="flex-1 p-5 bg-slate-50 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400">{t.global.export}</button>
              <button onClick={() => {}} className="flex-1 p-5 bg-slate-50 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400">{t.global.import}</button>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in">
            <div className="flex justify-between items-center">
              <button onClick={() => setCurrentDomain(null)} className="text-[10px] font-black text-indigo-500 uppercase">← Sectors</button>
              <h3 className="text-xl font-black italic uppercase text-slate-900">{t.domains[currentDomain]}</h3>
            </div>
            <div className="grid grid-cols-5 gap-3">
               {nodes.filter(n => n.domain === currentDomain).map(n => (
                  <button key={n.id} disabled={!n.active || n.done} onClick={() => n.active && startNode(n.id, n.domain)}
                    className={`aspect-square rounded-2xl border transition-all flex items-center justify-center text-sm font-mono ${
                      n.done ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl scale-95' :
                      n.active ? 'bg-white border-indigo-200 text-indigo-600 animate-pulse hover:border-indigo-500 shadow-md' :
                      'bg-slate-50 border-slate-100 text-slate-200 opacity-40'
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
    // Define currentBg for the test view based on active module domain color
    const currentBg = activeModule ? domainColors[activeModule] : 'transparent';
    
    return (
      <Layout lang={lang} onLangChange={setLang}>
        <div className={`space-y-12 py-10 px-4 animate-in ${isGlitching ? 'glitch' : ''}`} style={{ backgroundColor: currentBg }}>
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-indigo-500 font-bold uppercase tracking-[0.4em]">LINKING NODE_{lastSelectedNode}</span>
            <h3 className="text-3xl font-black italic uppercase text-slate-900 leading-tight">{(t.scenes as any)[scene.id]?.title || 'Unknown Scene'}</h3>
          </div>
          <div className="bg-slate-950 p-10 rounded-[3rem] text-indigo-50 font-medium italic border border-indigo-500/20 shadow-2xl min-h-[220px] flex items-center text-xl leading-relaxed">
            {(t.scenes as any)[scene.id]?.desc || 'No Description'}
          </div>
          <div className="space-y-4">
            {scene.choices.map((c, i) => (
              <button key={c.id} onClick={() => handleChoice(c)} className="w-full p-8 text-left bg-white border border-slate-200 rounded-[2.5rem] shadow-sm font-bold text-sm uppercase flex items-center gap-6 group active:scale-95 transition-all">
                <span className="w-12 h-12 rounded-[1.2rem] bg-slate-50 flex items-center justify-center text-indigo-300 font-mono text-xs group-hover:bg-indigo-600 group-hover:text-white transition-all">0{i+1}</span>
                <span className="flex-1">{(t.scenes as any)[scene.id]?.[`c${i+1}`] || 'Choice'}</span>
              </button>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (view === 'body_sync') return (
    <Layout lang={lang} onLangChange={setLang}>
       <div className="py-20 text-center px-4 space-y-12 flex flex-col justify-center h-full animate-in">
          <div className="w-28 h-28 rounded-full bg-slate-950 flex items-center justify-center text-indigo-500 text-4xl mx-auto border border-indigo-500/30 animate-pulse">📡</div>
          <div className="space-y-4">
             <h3 className="text-xs font-black uppercase tracking-[0.6em] text-indigo-600">{t.sync.title}</h3>
             <p className="text-xl font-bold text-slate-800 leading-relaxed">{t.sync.desc}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
             {['s1', 's2', 's3', 's4'].map(s => (
               <button key={s} onClick={() => syncBodySensation(s)} className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm text-[10px] font-black uppercase tracking-widest hover:border-indigo-500 active:bg-indigo-600 active:text-white transition-all">
                  {(t.sync as any)[s]}
               </button>
             ))}
          </div>
       </div>
    </Layout>
  );

  if (view === 'results' && result) return (
    <Layout lang={lang} onLangChange={setLang}>
      <div className={`space-y-12 pb-32 animate-in px-4 ${isGlitching ? 'glitch' : ''}`}>
        {selectedBug && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-slate-950/95 backdrop-blur-xl animate-in" onClick={() => setSelectedBug(null)}>
              <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl max-w-sm space-y-8" onClick={e => e.stopPropagation()}>
                 <div className="space-y-2">
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">ANOMALY_LOG</span>
                    <h4 className="font-black text-2xl uppercase italic text-slate-900 leading-tight">{(t.beliefs as any)[selectedBug]}</h4>
                 </div>
                 <p className="text-lg text-slate-600 leading-relaxed italic font-medium">{(t.explanations as any)[selectedBug]}</p>
                 <button onClick={() => setSelectedBug(null)} className="w-full p-6 bg-slate-950 text-white rounded-3xl font-black uppercase text-xs tracking-widest">ACKNOWLEDGE</button>
              </div>
           </div>
        )}

        <header className="space-y-1">
          <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.5em]">Blueprint_Snapshot</span>
          <h3 className="text-5xl font-black italic uppercase text-slate-900">{result.archetype[lang]}</h3>
        </header>

        <div className="grid grid-cols-2 gap-6">
           <div className="p-8 bg-indigo-600 rounded-[3rem] shadow-2xl text-white relative overflow-hidden">
              <span className="text-[11px] font-black uppercase opacity-60 tracking-widest mb-2 block">{t.results.stability}</span>
              <p className="text-5xl font-black italic">{result.systemHealth}%</p>
           </div>
           <div className="p-8 bg-slate-950 rounded-[3rem] shadow-2xl text-indigo-400 border border-slate-800 relative overflow-hidden">
              <span className="text-[11px] font-black uppercase opacity-60 tracking-widest mb-2 block">{t.results.neuro_sync}</span>
              <p className="text-5xl font-black italic">{result.neuroSync}%</p>
           </div>
        </div>

        <div className="aspect-square bg-slate-50 rounded-[4rem] relative flex items-center justify-center border border-slate-100 shadow-inner overflow-hidden">
          <svg viewBox="0 0 100 100" className="w-full h-full p-20 relative z-10">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="6 6" />
            <path d={`M ${result.graphPoints[0].x} ${result.graphPoints[0].y} L ${result.graphPoints[1].x} ${result.graphPoints[1].y} L ${result.graphPoints[2].x} ${result.graphPoints[2].y} Z`}
              fill="rgba(99, 102, 241, 0.3)" stroke="#6366f1" strokeWidth="4" strokeLinejoin="round" className="animate-pulse" />
          </svg>
        </div>

        <section className="space-y-6">
          <h3 className="text-xs font-black uppercase tracking-[0.5em] text-slate-400 border-b border-slate-100 pb-4">{t.results.logTitle}</h3>
          <div className="grid grid-cols-1 gap-4">
            {result.bugs.length > 0 ? result.bugs.map(v => (
              <button key={v} onClick={() => setSelectedBug(v)} className="w-full bg-white p-7 rounded-[2.5rem] border border-slate-100 flex items-center justify-between shadow-sm active:scale-95 transition-all">
                <span className="text-sm font-black text-slate-900 uppercase italic">{(t.beliefs as any)[v]}</span>
                <span className="text-red-500 text-xs font-mono font-bold">INFO >></span>
              </button>
            )) : <div className="p-10 bg-green-50 rounded-[3rem] text-center border border-green-100 text-green-700 font-black text-xs uppercase tracking-widest">SYSTEM_HEALTH: STABLE</div>}
          </div>
        </section>

        <section className="space-y-6">
           <h3 className="text-xs font-black uppercase tracking-[0.5em] text-slate-400 border-b border-slate-100 pb-4">{t.results.roadmap}</h3>
           <div className="space-y-4">
              {result.roadmap.map((step, i) => (
                <div key={i} className="bg-slate-950 p-10 rounded-[3.5rem] border border-slate-800 space-y-4 relative shadow-2xl">
                   <div className="flex justify-between items-center font-mono text-[11px] font-bold">
                      <span className="text-indigo-400">PHASE_0{i+1}</span>
                      <span className="text-slate-500">{(t.phases as any)[step.phase.toLowerCase()]}</span>
                   </div>
                   <h5 className="text-white font-black text-lg uppercase italic">{step.task[lang]}</h5>
                   <p className="text-sm text-slate-400 leading-relaxed italic font-medium">{step.method[lang]}</p>
                   <div className="pt-4 border-t border-slate-900 text-[10px] text-indigo-300 font-bold uppercase tracking-widest">{step.targetMetric[lang]}</div>
                </div>
              ))}
           </div>
        </section>

        <button onClick={() => setView('dashboard')} className="w-full p-10 bg-slate-950 text-white rounded-[3.5rem] font-black uppercase text-xs tracking-[0.6em] shadow-2xl active:scale-95 transition-all border border-slate-800 mb-10">Matrix_Exit</button>
      </div>
    </Layout>
  );

  return null;
};

export default App;
