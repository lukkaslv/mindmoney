
import React, { useState, useMemo, useEffect } from 'react';
import { Layout } from './components/Layout.tsx';
import { MODULE_REGISTRY } from './constants.ts';
import { translations } from './translations.ts';
import { calculateGenesisCore, AnalysisResult } from './services/psychologyService.ts';

const App: React.FC = () => {
  const [lang, setLang] = useState<'ru' | 'ka'>(() => (localStorage.getItem('app_lang') as 'ru' | 'ka') || 'ru');
  const t = useMemo(() => translations[lang], [lang]);
  
  const [view, setView] = useState<'auth' | 'boot' | 'dashboard' | 'test' | 'results'>('auth');
  const [password, setPassword] = useState("");
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [state, setState] = useState({ currentId: 'welcome', history: [] as any[] });
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [globalProgress, setGlobalProgress] = useState(0);
  const [bootStep, setBootStep] = useState(0);

  useEffect(() => {
    localStorage.setItem('app_lang', lang);
    const saved = localStorage.getItem('global_progress');
    if (saved) setGlobalProgress(parseInt(saved));
  }, [lang]);

  const bootMessages = [
    t.boot.init,
    t.boot.load_core,
    t.boot.check_integrity,
    t.boot.establish_link,
    t.boot.ready
  ];

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

  const startModule = (moduleId: string) => {
    setActiveModule(moduleId);
    const firstSceneId = Object.keys(MODULE_REGISTRY[moduleId])[0];
    setState({ currentId: firstSceneId, history: [] });
    setView('test');
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.('medium');
  };

  const finishTest = (history: any[]) => {
    setLoading(true);
    setTimeout(() => {
      const res = calculateGenesisCore(history);
      setResult(res);
      const nextProgress = Math.min(100, globalProgress + 5);
      setGlobalProgress(nextProgress);
      localStorage.setItem('global_progress', nextProgress.toString());
      setLoading(false);
      setView('results');
    }, 2000);
  };

  if (view === 'auth') return (
    <Layout lang={lang} onLangChange={setLang}>
      <div className="flex flex-col items-center justify-center py-20 space-y-12 animate-in">
        <div className="relative group">
          <div className="w-24 h-24 bg-slate-950 rounded-[2.5rem] flex items-center justify-center text-indigo-500 font-black text-4xl shadow-2xl border border-indigo-500/20 group-hover:border-indigo-500/50 transition-all duration-700">G</div>
          <div className="absolute -inset-4 border border-indigo-500/10 rounded-full animate-spin-slow"></div>
          <div className="absolute -inset-8 border border-indigo-500/5 rounded-full animate-spin-slow" style={{ animationDirection: 'reverse' }}></div>
        </div>
        <div className="w-full px-4 space-y-6">
          <div className="space-y-1 text-center">
            <h2 className="text-[10px] font-mono font-black uppercase tracking-[0.4em] text-indigo-500">System_Access_Protocol</h2>
            <div className="h-px w-12 bg-indigo-500/30 mx-auto"></div>
          </div>
          <input 
            type="password" 
            placeholder="ACCESS_CODE" 
            className="w-full p-6 bg-slate-950 border border-slate-800 rounded-2xl text-center font-mono text-indigo-400 tracking-widest outline-none focus:border-indigo-500 shadow-inner transition-all"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
          />
          <button onClick={handleLogin} className="w-full bg-indigo-600 text-white p-6 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg active:scale-95 transition-all hover:bg-indigo-500">Initialize_Auth</button>
        </div>
      </div>
    </Layout>
  );

  if (view === 'boot') return (
    <Layout lang={lang} onLangChange={setLang}>
      <div className="flex flex-col items-start justify-center py-20 px-8 space-y-4 font-mono">
        {bootMessages.slice(0, bootStep + 1).map((msg, i) => (
          <div key={i} className="flex gap-4 items-start">
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
      <div className="space-y-10 animate-in pb-10">
        <section className="px-4 space-y-4">
           <div className="flex justify-between items-end">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{getT('global.stats')}</h3>
              <span className="text-[9px] font-mono text-indigo-500">VER: 6.0.8</span>
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl -mr-12 -mt-12"></div>
                 <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1">{getT('global.level')}</span>
                 <span className="text-2xl font-black text-indigo-400 italic">ARCH_0{Math.floor(globalProgress / 10) + 1}</span>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                 <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">{getT('global.progress')}</span>
                 <span className="text-2xl font-black text-slate-800 italic">{globalProgress}%</span>
              </div>
           </div>
        </section>

        <header className="px-4 border-l-4 border-indigo-500">
          <h2 className="text-4xl font-black italic uppercase leading-none text-slate-900">{getT('dashboard.title')}</h2>
          <p className="text-[10px] font-mono text-slate-400 mt-2 uppercase tracking-widest">{getT('dashboard.desc')}</p>
        </header>

        <div className="grid grid-cols-2 gap-5 px-4">
          {[
            { id: 'foundation', title: getT('dashboard.foundation'), active: false, icon: '🛡️' },
            { id: 'agency', title: getT('dashboard.agency'), active: true, icon: '▲', moduleId: 'agency' },
            { id: 'money', title: getT('dashboard.resource'), active: true, icon: '▣', moduleId: 'money' },
            { id: 'social', title: getT('dashboard.social'), active: true, icon: '◈', moduleId: 'social' },
            { id: 'legacy', title: getT('dashboard.legacy'), active: false, icon: '○' }
          ].map(m => (
            <button key={m.id} onClick={() => m.active && m.moduleId && startModule(m.moduleId)} className={`aspect-square rounded-[2rem] border flex flex-col items-start justify-between p-7 transition-all group relative overflow-hidden ${
              m.active ? 'bg-white border-slate-100 shadow-md hover:border-indigo-500 active:scale-95' : 'bg-slate-50 border-slate-50 opacity-40 cursor-not-allowed'
            }`}>
              {!m.active && <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[1px] text-[7px] font-black uppercase tracking-widest text-slate-500 z-10">{getT('dashboard.locked')}</div>}
              <span className="text-3xl font-mono text-indigo-600">{m.icon}</span>
              <span className="text-[10px] font-black uppercase leading-tight text-left text-slate-900">{m.title}</span>
              {m.active && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 absolute top-7 right-7 animate-pulse"></div>}
            </button>
          ))}
        </div>

        <section className="px-4 space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{getT('global.achievements')}</h3>
          <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
            {['NODE_INIT', 'RESRC_AUTH', 'WILL_SYNC', 'SOC_MAP'].map((ach, i) => (
              <div key={ach} className={`shrink-0 p-4 rounded-2xl border ${i * 20 < globalProgress ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-slate-50 border-slate-100 text-slate-300'} text-[9px] font-black font-mono`}>
                {ach}
              </div>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );

  if (view === 'test' && activeModule) {
    const scene = MODULE_REGISTRY[activeModule][state.currentId];
    if (loading || !scene) return (
      <Layout lang={lang} onLangChange={setLang}>
        <div className="flex flex-col items-center justify-center h-96 space-y-8 animate-pulse">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="space-y-3 text-center">
             <p className="text-[10px] font-mono text-indigo-500 uppercase tracking-[0.4em]">Decoding_Neural_Matrix</p>
             <div className="w-32 h-1 bg-slate-100 mx-auto rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 animate-progress"></div>
             </div>
          </div>
        </div>
      </Layout>
    );

    return (
      <Layout lang={lang} onLangChange={setLang}>
        <div className="space-y-10 py-6 animate-in">
          <div className="px-4 flex justify-between items-end">
            <div className="space-y-1">
              <span className="text-[9px] font-mono text-indigo-500 uppercase tracking-widest">Core_Node: {activeModule.toUpperCase()}_0{state.history.length + 1}</span>
              <h3 className="text-2xl font-black italic uppercase text-slate-900 leading-tight">{getT(scene.titleKey)}</h3>
            </div>
            <div className="flex gap-1">
              {Object.keys(MODULE_REGISTRY[activeModule]).map((_, i) => (
                <div key={i} className={`w-3 h-1 rounded-full ${i <= state.history.length ? 'bg-indigo-500' : 'bg-slate-200'}`}></div>
              ))}
            </div>
          </div>
          <div className="px-4">
            <div className="bg-slate-950 p-10 rounded-[2.5rem] text-indigo-100/90 font-medium italic border border-indigo-500/20 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent group-hover:via-indigo-500 transition-all duration-1000"></div>
              <div className="absolute -right-4 -bottom-4 text-indigo-500/5 text-6xl font-black select-none uppercase">{activeModule}</div>
              {getT(scene.descKey)}
            </div>
          </div>
          <div className="px-4 space-y-4">
            {scene.choices.map((c, i) => (
              <button key={c.id} onClick={() => {
                const nextHistory = [...state.history, { beliefKey: c.beliefKey }];
                if (c.nextSceneId && c.nextSceneId !== 'end') {
                  setState({ ...state, currentId: c.nextSceneId, history: nextHistory });
                  window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.('light');
                } else {
                  finishTest(nextHistory);
                }
              }} className="w-full p-7 text-left bg-white border border-slate-200 rounded-3xl shadow-sm hover:border-indigo-500 font-bold text-[11px] uppercase flex items-center gap-5 transition-all active:bg-indigo-50 group">
                <span className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-indigo-300 font-mono text-[9px] group-hover:bg-indigo-500 group-hover:text-white transition-colors">0{i+1}</span>
                <span className="flex-1">{getT(c.textKey)}</span>
              </button>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (view === 'results' && result) return (
    <Layout lang={lang} onLangChange={setLang}>
      <div className="space-y-12 pb-24 animate-in">
        <section className="px-4 space-y-8">
          <header className="flex justify-between items-start">
             <div className="space-y-1">
                <span className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.3em]">Identity_Output</span>
                <h3 className="text-4xl font-black italic uppercase leading-none">{result.archetype[lang]}</h3>
             </div>
             <div className="text-right">
                <span className="text-[8px] font-black uppercase text-slate-400 block tracking-widest">{getT('results.stability')}</span>
                <span className="text-xl font-black text-slate-900 italic">{result.systemHealth}</span>
             </div>
          </header>

          <div className="p-8 bg-indigo-600 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                   <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
             </div>
             <span className="text-[9px] font-black uppercase opacity-60 mb-2 block tracking-widest">Evolution_Stage</span>
             <p className="text-2xl font-black uppercase italic tracking-wider">{getT(`phases.${result.phase.toLowerCase()}`)}</p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { label: getT('results.integrity'), val: result.integrity, color: 'text-indigo-400', bg: 'bg-slate-950' },
              { label: getT('results.capacity'), val: result.capacity, color: 'text-slate-800', bg: 'bg-white' },
              { label: getT('results.entropy'), val: result.entropyScore, color: 'text-red-500', bg: 'bg-slate-50' }
            ].map(stat => (
              <div key={stat.label} className={`${stat.bg} p-5 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center text-center`}>
                <span className="text-[7px] font-black text-slate-400 uppercase mb-2 tracking-widest leading-none h-4">{stat.label}</span>
                <div className={`text-2xl font-black italic ${stat.color}`}>{stat.val}%</div>
              </div>
            ))}
          </div>

          <div className="aspect-square bg-slate-50 rounded-[3rem] relative flex items-center justify-center border border-slate-200 overflow-hidden shadow-inner">
             <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage: 'radial-gradient(#000 0.5px, transparent 0.5px)', backgroundSize: '15px 15px'}}></div>
            <svg viewBox="0 0 100 100" className="w-full h-full p-14 relative z-10">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="4 4" />
              <line x1="50" y1="10" x2="50" y2="90" stroke="#e2e8f0" strokeWidth="0.5" />
              <line x1="10" y1="50" x2="90" y2="50" stroke="#e2e8f0" strokeWidth="0.5" />
              <path 
                d={`M ${result.graphPoints[0].x} ${result.graphPoints[0].y} L ${result.graphPoints[1].x} ${result.graphPoints[1].y} L ${result.graphPoints[2].x} ${result.graphPoints[2].y} Z`}
                fill="rgba(99, 102, 241, 0.2)"
                stroke="#6366f1"
                strokeWidth="2.5"
                strokeLinejoin="round"
                className="animate-pulse"
              />
              {result.graphPoints.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="#6366f1" />)}
            </svg>
          </div>
        </section>

        {result.bugs.length > 0 && (
          <section className="px-4 space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{getT('results.logTitle')}</h3>
            <div className="space-y-2">
              {result.bugs.map(v => (
                <div key={v} className="bg-red-50 p-5 rounded-3xl border border-red-100 flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                     <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                     <span className="text-[10px] font-black text-red-900 uppercase">{getT(`beliefs.${v}`)}</span>
                  </div>
                  <span className="text-[8px] font-mono text-red-300">CRIT_ERR</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="px-4 space-y-8">
          <div className="flex items-center justify-between">
             <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-900">{getT('results.roadmap')}</h3>
             <div className="h-px flex-1 mx-4 bg-slate-100"></div>
          </div>
          <div className="space-y-6">
            {result.roadmap.map(d => (
              <div key={d.day} className="bg-white p-9 rounded-[3rem] border border-slate-100 shadow-sm relative group">
                <div className="absolute top-0 right-0 p-8 font-mono text-[10px] text-slate-200">PROC_0{d.day}</div>
                <div className="flex items-center gap-3 mb-5">
                   <div className={`w-2 h-2 rounded-full ${d.phase === 'SANITATION' ? 'bg-red-400' : 'bg-indigo-500'}`}></div>
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{d.phase}</span>
                </div>
                <h4 className="font-black text-2xl uppercase mb-5 text-slate-900 leading-tight">{d.task[lang]}</h4>
                <div className="space-y-5">
                   <p className="text-xs text-slate-600 leading-relaxed font-medium">{d.method[lang]}</p>
                   <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100/50">
                      <span className="text-[9px] font-mono text-slate-400 uppercase block mb-1">Target_Metric</span>
                      <p className="text-[10px] font-bold text-slate-800">{d.targetMetric[lang]}</p>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="px-4">
          <button onClick={() => setView('dashboard')} className="w-full p-8 bg-slate-950 text-white rounded-[2.5rem] font-black uppercase text-[10px] tracking-[0.3em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3">
             <span className="opacity-40">>></span> {getT('results.back')}
          </button>
        </div>
      </div>
    </Layout>
  );

  return null;
};

export default App;
