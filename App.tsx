
import React, { useState, useMemo, useEffect } from 'react';
import { Layout } from './components/Layout.tsx';
import { MODULE_REGISTRY } from './constants.ts';
import { translations } from './translations.ts';
import { calculateGenesisCore, AnalysisResult } from './services/psychologyService.ts';

const App: React.FC = () => {
  const [lang, setLang] = useState<'ru' | 'ka'>(() => (localStorage.getItem('app_lang') as 'ru' | 'ka') || 'ru');
  const t = useMemo(() => translations[lang], [lang]);
  
  const [view, setView] = useState<'auth' | 'boot' | 'dashboard' | 'test' | 'body_sync' | 'results'>('auth');
  const [password, setPassword] = useState("");
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [state, setState] = useState({ currentId: 'welcome', history: [] as any[], lastChoice: null as any });
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [globalProgress, setGlobalProgress] = useState(0);
  const [completedNodeIds, setCompletedNodeIds] = useState<number[]>([]);
  const [bootStep, setBootStep] = useState(0);
  const [selectedBug, setSelectedBug] = useState<string | null>(null);
  const [lastSelectedNode, setLastSelectedNode] = useState<number | null>(null);

  useEffect(() => {
    localStorage.setItem('app_lang', lang);
    const savedProgress = localStorage.getItem('global_progress');
    const savedNodes = localStorage.getItem('completed_node_ids');
    if (savedProgress) setGlobalProgress(parseInt(savedProgress));
    if (savedNodes) setCompletedNodeIds(JSON.parse(savedNodes));
  }, [lang]);

  const domainColors: Record<string, string> = {
    foundation: 'rgba(239, 68, 68, 0.05)',
    agency: 'rgba(34, 197, 94, 0.05)',
    money: 'rgba(99, 102, 241, 0.05)',
    social: 'rgba(168, 85, 247, 0.05)',
    legacy: 'rgba(236, 72, 153, 0.05)'
  };

  const currentBg = activeModule ? domainColors[activeModule] : 'transparent';

  const nodes = useMemo(() => {
    return Array.from({ length: 50 }, (_, i) => {
      const isCompleted = completedNodeIds.includes(i);
      const domain = i < 10 ? 'foundation' : i < 20 ? 'agency' : i < 30 ? 'money' : i < 40 ? 'social' : 'legacy';
      
      // Логика активации: первые 5 узлов всегда доступны. 
      // Остальные доступны, если пройден предыдущий узел или достигнут порог прогресса.
      const isFirstOfDomain = i % 10 === 0;
      const isPrevCompleted = i > 0 && completedNodeIds.includes(i - 1);
      const isActive = i < 5 || isFirstOfDomain || isPrevCompleted || (globalProgress > (i * 1.5));

      return {
        id: i,
        domain,
        active: isActive,
        done: isCompleted
      };
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

  const bootMessages = [t.boot.init, t.boot.load_core, t.boot.check_integrity, t.boot.establish_link, t.boot.ready];

  useEffect(() => {
    if (view === 'boot') {
      const timer = setInterval(() => {
        setBootStep(prev => {
          if (prev >= bootMessages.length - 1) {
            clearInterval(timer);
            setTimeout(() => setView('dashboard'), 800);
            return prev;
          }
          return prev + 1;
        });
      }, 600);
      return () => clearInterval(timer);
    }
  }, [view]);

  const getT = (path: string) => {
    try {
      return path.split('.').reduce((p: any, c: any) => p && p[c], t) || `[${path}]`;
    } catch {
      return `[${path}]`;
    }
  };

  const handleLogin = () => {
    if (["luka", "money", "arch"].includes(password.toLowerCase())) {
      setView('boot');
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.('success');
    }
  };

  const startNode = (nodeId: number, domain: string) => {
    setLastSelectedNode(nodeId);
    setActiveModule(domain);
    // Выбираем стартовую сцену на основе домена
    const moduleScenes = MODULE_REGISTRY[domain];
    const firstSceneId = Object.keys(moduleScenes)[0];
    setState({ currentId: firstSceneId, history: [], lastChoice: null });
    setView('test');
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.('medium');
  };

  const handleChoice = (choice: any) => {
    setState({ ...state, lastChoice: choice });
    setView('body_sync');
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.('light');
  };

  const syncBodySensation = (sensation: string) => {
    const nextHistory = [...state.history, { beliefKey: state.lastChoice.beliefKey, sensation }];
    if (state.lastChoice.nextSceneId && state.lastChoice.nextSceneId !== 'end') {
      setState({ ...state, currentId: state.lastChoice.nextSceneId, history: nextHistory, lastChoice: null });
      setView('test');
    } else {
      finishTest(nextHistory);
    }
  };

  const finishTest = (history: any[]) => {
    setLoading(true);
    setTimeout(() => {
      const res = calculateGenesisCore(history);
      setResult(res);
      
      if (lastSelectedNode !== null && !completedNodeIds.includes(lastSelectedNode)) {
        const nextNodes = [...completedNodeIds, lastSelectedNode];
        setCompletedNodeIds(nextNodes);
        localStorage.setItem('completed_node_ids', JSON.stringify(nextNodes));
        
        const nextProgress = Math.min(100, globalProgress + 2);
        setGlobalProgress(nextProgress);
        localStorage.setItem('global_progress', nextProgress.toString());
      }
      
      setLoading(false);
      setView('results');
    }, 2000);
  };

  if (view === 'auth') return (
    <Layout lang={lang} onLangChange={setLang}>
      <div className="flex flex-col items-center justify-center py-20 space-y-12 animate-in">
        <div className="relative group">
          <div className="w-24 h-24 bg-slate-950 rounded-[2.5rem] flex items-center justify-center text-indigo-500 font-black text-4xl shadow-2xl border border-indigo-500/20">G</div>
          <div className="absolute -inset-4 border border-indigo-500/10 rounded-full animate-spin-slow"></div>
        </div>
        <div className="w-full px-4 space-y-6">
          <input 
            type="password" 
            placeholder="ACCESS_CODE" 
            className="w-full p-6 bg-slate-950 border border-slate-800 rounded-2xl text-center font-mono text-indigo-400 tracking-widest outline-none focus:border-indigo-500 shadow-inner"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
          />
          <button onClick={handleLogin} className="w-full bg-indigo-600 text-white p-6 rounded-2xl font-black uppercase text-[10px] tracking-widest">Initialize_Auth</button>
        </div>
      </div>
    </Layout>
  );

  if (view === 'boot') return (
    <Layout lang={lang} onLangChange={setLang}>
      <div className="flex flex-col items-start justify-center py-20 px-8 space-y-4 font-mono h-full">
        {bootMessages.slice(0, bootStep + 1).map((msg, i) => (
          <div key={i} className="flex gap-4 items-start animate-in">
            <span className="text-indigo-500 shrink-0">[{new Date().toLocaleTimeString()}]</span>
            <span className="text-slate-800 uppercase text-[11px] font-black">{msg}</span>
          </div>
        ))}
        {bootStep < bootMessages.length && <div className="w-2 h-4 bg-indigo-500 animate-pulse ml-2"></div>}
      </div>
    </Layout>
  );

  if (view === 'dashboard') return (
    <Layout lang={lang} onLangChange={setLang}>
      <div className="space-y-10 animate-in pb-10 px-4">
        <header className="space-y-2 border-l-4 border-indigo-500 pl-4">
          <h2 className="text-4xl font-black italic uppercase leading-none text-slate-900">{getT('dashboard.title')}</h2>
          <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">{getT('dashboard.desc')}</p>
        </header>

        <section className="bg-slate-950 p-6 rounded-[2.5rem] border border-slate-800 shadow-2xl relative overflow-hidden group">
           <div className="flex justify-between items-start relative z-10">
              <div className="space-y-1">
                 <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">{getT('global.level')}</span>
                 <span className="text-3xl font-black text-indigo-400 italic">ARCH_0{Math.floor(globalProgress / 10) + 1}</span>
              </div>
              <div className="text-right">
                 <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">{getT('dashboard.nodes_found')}</span>
                 <span className="text-3xl font-black text-white italic">{completedNodeIds.length} / 50</span>
              </div>
           </div>
           <div className="mt-6 h-1 bg-slate-900 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${globalProgress}%` }}></div>
           </div>
           <div className="absolute inset-0 bg-indigo-500/5 animate-pulse pointer-events-none"></div>
        </section>

        <div className="grid grid-cols-2 gap-3">
           {Object.entries(domainStats).map(([key, val]) => (
             <div key={key} className="bg-white p-4 rounded-2xl border border-slate-100 flex flex-col gap-1 shadow-sm">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">{getT(`domains.${key}`)}</span>
                <div className="flex justify-between items-end">
                   <span className="text-lg font-black italic text-slate-900">{val}/10</span>
                   <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500" style={{ width: `${val * 10}%` }}></div>
                   </div>
                </div>
             </div>
           ))}
        </div>

        <div className="grid grid-cols-5 gap-2 pb-6 relative">
           {nodes.map(n => (
              <button 
                key={n.id} 
                disabled={!n.active || n.done}
                onClick={() => n.active && startNode(n.id, n.domain)}
                className={`aspect-square rounded-lg border transition-all duration-500 flex items-center justify-center text-[8px] font-mono relative overflow-hidden ${
                  n.done ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_10px_rgba(99,102,241,0.5)]' :
                  n.active ? 'bg-white border-slate-200 text-indigo-600 animate-pulse hover:border-indigo-500 shadow-sm z-10' :
                  'bg-slate-50 border-slate-100 text-slate-200 z-0'
                }`}
              >
                {n.done ? '✔' : n.id + 1}
                {n.active && !n.done && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-indigo-400 animate-scan-line"></div>}
              </button>
           ))}
        </div>

        <div className="overflow-hidden border-y border-slate-100 py-4">
           <div className="whitespace-nowrap flex gap-8 animate-marquee">
              {[1, 2].map(i => (
                <span key={i} className="text-[8px] font-mono text-slate-300 uppercase tracking-widest">
                  SYNCING_NODE_GRID ... CORE_HEALTH: {globalProgress > 50 ? 'STABLE' : 'CALIBRATING'} ... ARCHITECT_MODE: ON ... 
                </span>
              ))}
           </div>
        </div>
      </div>
    </Layout>
  );

  if (view === 'test' && activeModule) {
    const scene = MODULE_REGISTRY[activeModule][state.currentId];
    return (
      <Layout lang={lang} onLangChange={setLang}>
        <div className="space-y-10 py-6 animate-in relative px-4" style={{ backgroundColor: currentBg }}>
          <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500/10 overflow-hidden">
             <div className="h-full bg-indigo-500 animate-scan-line"></div>
          </div>
          <div className="space-y-1">
            <span className="text-[9px] font-mono text-indigo-500 uppercase tracking-widest">DOMAIN: {getT(`domains.${activeModule}`)} | NODE_{lastSelectedNode}</span>
            <h3 className="text-2xl font-black italic uppercase text-slate-900">{getT(scene.titleKey)}</h3>
          </div>
          <div className="bg-slate-950 p-10 rounded-[2.5rem] text-indigo-100/90 font-medium italic border border-indigo-500/20 shadow-2xl min-h-[160px] flex items-center">
            {getT(scene.descKey)}
          </div>
          <div className="space-y-4">
            {scene.choices.map((c, i) => (
              <button key={c.id} onClick={() => handleChoice(c)} className="w-full p-7 text-left bg-white border border-slate-200 rounded-3xl shadow-sm hover:border-indigo-500 font-bold text-[11px] uppercase flex items-center gap-5 transition-all group">
                <span className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-indigo-300 font-mono text-[9px] group-hover:bg-indigo-500 group-hover:text-white transition-colors">0{i+1}</span>
                <span className="flex-1">{getT(c.textKey)}</span>
              </button>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (view === 'body_sync') return (
    <Layout lang={lang} onLangChange={setLang}>
       <div className="space-y-10 py-10 animate-in text-center px-4">
          <div className="relative inline-block mx-auto">
             <div className="w-20 h-20 rounded-full border-2 border-indigo-500/20 flex items-center justify-center animate-ping absolute inset-0"></div>
             <div className="w-20 h-20 rounded-full bg-slate-950 flex items-center justify-center text-indigo-500 text-2xl relative z-10 border border-indigo-500/30">📡</div>
          </div>
          <div className="space-y-2">
             <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-indigo-600">{getT('sync.title')}</h3>
             <p className="text-sm font-medium text-slate-800 px-10">{getT('sync.desc')}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
             {['s1', 's2', 's3', 's4'].map(s => (
               <button key={s} onClick={() => syncBodySensation(s)} className="p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm active:bg-indigo-600 active:text-white transition-all text-[9px] font-black uppercase tracking-widest hover:border-indigo-500">
                  {getT(`sync.${s}`)}
               </button>
             ))}
          </div>
       </div>
    </Layout>
  );

  if (view === 'results' && result) return (
    <Layout lang={lang} onLangChange={setLang}>
      <div className="space-y-10 pb-24 animate-in px-4">
        {selectedBug && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm animate-in" onClick={() => setSelectedBug(null)}>
              <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl max-w-xs space-y-6" onClick={e => e.stopPropagation()}>
                 <h4 className="font-black text-xl uppercase italic text-indigo-600">{getT(`beliefs.${selectedBug}`)}</h4>
                 <p className="text-sm text-slate-600 leading-relaxed italic">{getT(`explanations.${selectedBug}`)}</p>
                 <button onClick={() => setSelectedBug(null)} className="w-full p-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest">Close_Log</button>
              </div>
           </div>
        )}

        <header className="flex justify-between items-start">
           <div className="space-y-1">
              <span className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.3em]">Identity_Output</span>
              <h3 className="text-4xl font-black italic uppercase leading-none">{result.archetype[lang]}</h3>
           </div>
        </header>

        <div className="grid grid-cols-2 gap-4">
           <div className="p-8 bg-indigo-600 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden group">
              <span className="text-[9px] font-black uppercase opacity-60 mb-2 block tracking-widest">{getT('results.stability')}</span>
              <p className="text-3xl font-black uppercase italic">{result.systemHealth}%</p>
           </div>
           <div className="p-8 bg-slate-950 rounded-[2.5rem] shadow-xl text-indigo-400 border border-slate-800 relative overflow-hidden group">
              <span className="text-[9px] font-black uppercase opacity-60 mb-2 block tracking-widest">{getT('results.neuro_sync')}</span>
              <p className="text-3xl font-black uppercase italic">{result.neuroSync}%</p>
           </div>
        </div>

        {result.neuroSync < 60 && (
           <div className="p-6 bg-red-50 border border-red-100 rounded-[2rem] animate-pulse">
              <p className="text-[10px] font-black text-red-900 uppercase tracking-widest text-center">{getT('results.conflict_warn')}</p>
           </div>
        )}

        <div className="aspect-square bg-slate-50 rounded-[3rem] relative flex items-center justify-center border border-slate-200 shadow-inner overflow-hidden">
          <svg viewBox="0 0 100 100" className="w-full h-full p-14 relative z-10">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="4 4" />
            <path 
              d={`M ${result.graphPoints[0].x} ${result.graphPoints[0].y} L ${result.graphPoints[1].x} ${result.graphPoints[1].y} L ${result.graphPoints[2].x} ${result.graphPoints[2].y} Z`}
              fill="rgba(99, 102, 241, 0.2)"
              stroke="#6366f1"
              strokeWidth="2.5"
              strokeLinejoin="round"
              className="animate-pulse"
            />
          </svg>
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        </div>

        <section className="space-y-4">
          <div className="flex justify-between items-end">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{getT('results.logTitle')}</h3>
            <span className="text-[8px] font-mono text-indigo-400 uppercase">{getT('results.click_info')}</span>
          </div>
          <div className="space-y-2">
            {result.bugs.length > 0 ? result.bugs.map(v => (
              <button key={v} onClick={() => setSelectedBug(v)} className="w-full bg-white p-5 rounded-3xl border border-slate-100 flex items-center justify-between hover:border-indigo-300 transition-colors group">
                <span className="text-[10px] font-black text-slate-900 uppercase">{getT(`beliefs.${v}`)}</span>
                <span className="text-[8px] font-mono text-red-400 group-hover:text-indigo-400">INFO >></span>
              </button>
            )) : (
              <div className="p-6 bg-green-50 rounded-3xl text-center border border-green-100">
                <span className="text-[9px] font-black text-green-700 uppercase tracking-widest">АНОМАЛИЙ НЕ ОБНАРУЖЕНО</span>
              </div>
            )}
          </div>
        </section>

        <section className="space-y-4">
           <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{getT('results.roadmap')}</h3>
           <div className="space-y-4">
              {result.roadmap.map((step, i) => (
                <div key={i} className="bg-slate-950 p-6 rounded-[2rem] border border-slate-800 space-y-2 relative overflow-hidden">
                   <div className="flex justify-between items-center">
                      <span className="text-indigo-400 font-mono text-[9px]">DAY_{step.day}</span>
                      <span className="text-slate-500 font-mono text-[8px]">{getT(`phases.${step.phase.toLowerCase()}`)}</span>
                   </div>
                   <h5 className="text-white font-bold text-xs uppercase">{step.task[lang]}</h5>
                   <p className="text-[10px] text-slate-400 leading-relaxed italic">{step.method[lang]}</p>
                   <div className="absolute top-0 right-0 w-1 h-full bg-indigo-500/20"></div>
                </div>
              ))}
           </div>
        </section>

        <button onClick={() => setView('dashboard')} className="w-full p-8 bg-slate-950 text-white rounded-[2.5rem] font-black uppercase text-[10px] tracking-[0.3em] shadow-2xl active:scale-95 transition-all border border-slate-800">
           {getT('results.back')}
        </button>
      </div>
    </Layout>
  );

  return null;
};

export default App;
