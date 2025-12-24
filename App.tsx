
import React, { useState, useMemo, useEffect } from 'react';
import { Layout } from './components/Layout.tsx';
import { INITIAL_SCENES } from './constants.ts';
import { translations } from './translations.ts';
import { calculateGenesisCore, AnalysisResult } from './services/psychologyService.ts';

const App: React.FC = () => {
  const [lang, setLang] = useState<'ru' | 'ka'>(() => (localStorage.getItem('app_lang') as 'ru' | 'ka') || 'ru');
  const t = useMemo(() => translations[lang], [lang]);
  
  const [view, setView] = useState<'auth' | 'dashboard' | 'test' | 'results'>('auth');
  const [password, setPassword] = useState("");
  const [state, setState] = useState({ currentId: 'welcome', history: [] as any[] });
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('app_lang', lang);
  }, [lang]);

  const getT = (path: string) => {
    try {
      return path.split('.').reduce((p: any, c: any) => p && p[c], t) || `[${path}]`;
    } catch {
      return `[${path}]`;
    }
  };

  const handleLogin = () => {
    if (["luka", "money", "arch"].includes(password.toLowerCase())) {
      setView('dashboard');
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.('success');
    }
  };

  const startModule = () => {
    setState({ currentId: 'welcome', history: [] });
    setView('test');
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.('medium');
  };

  const finishTest = (history: any[]) => {
    setLoading(true);
    setTimeout(() => {
      setResult(calculateGenesisCore(history));
      setLoading(false);
      setView('results');
    }, 2500);
  };

  if (view === 'auth') return (
    <Layout lang={lang} onLangChange={setLang}>
      <div className="flex flex-col items-center justify-center py-20 space-y-12 animate-in">
        <div className="relative">
          <div className="w-24 h-24 bg-slate-950 rounded-[2.5rem] flex items-center justify-center text-indigo-500 font-black text-4xl shadow-2xl border border-indigo-500/20">G</div>
          <div className="absolute -inset-4 border border-indigo-500/10 rounded-full animate-spin-slow"></div>
        </div>
        <div className="w-full px-4 space-y-6">
          <div className="space-y-1 text-center">
            <h2 className="text-[10px] font-mono font-black uppercase tracking-[0.4em] text-indigo-500">System_Access_Protocol</h2>
            <div className="h-px w-12 bg-indigo-500/30 mx-auto"></div>
          </div>
          <input 
            type="password" 
            placeholder="ACCESS_CODE" 
            className="w-full p-6 bg-slate-950 border border-slate-800 rounded-2xl text-center font-mono text-indigo-400 tracking-widest outline-none focus:border-indigo-500/50 shadow-inner"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
          />
          <button onClick={handleLogin} className="w-full bg-indigo-600 text-white p-6 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg active:scale-95 transition-all">Initialize_Auth</button>
        </div>
      </div>
    </Layout>
  );

  if (view === 'dashboard') return (
    <Layout lang={lang} onLangChange={setLang}>
      <div className="space-y-10 animate-in pb-10">
        <header className="px-4 border-l-4 border-indigo-500">
          <h2 className="text-4xl font-black italic uppercase leading-none text-slate-900">{getT('dashboard.title')}</h2>
          <p className="text-[10px] font-mono text-slate-400 mt-2 uppercase tracking-widest">{getT('dashboard.desc')}</p>
        </header>
        <div className="grid grid-cols-2 gap-5 px-4">
          {[
            { id: 'foundation', title: getT('dashboard.foundation'), active: false, icon: '🛡️' },
            { id: 'agency', title: getT('dashboard.agency'), active: false, icon: '▲' },
            { id: 'money', title: getT('dashboard.resource'), active: true, icon: '▣' },
            { id: 'social', title: getT('dashboard.social'), active: false, icon: '◈' },
            { id: 'legacy', title: getT('dashboard.legacy'), active: false, icon: '○' }
          ].map(m => (
            <button key={m.id} onClick={() => m.active && startModule()} className={`aspect-square rounded-3xl border flex flex-col items-start justify-between p-6 transition-all group relative overflow-hidden ${
              m.active ? 'bg-white border-slate-100 shadow-sm hover:border-indigo-500 active:scale-95' : 'bg-slate-50 border-slate-100 opacity-40 cursor-not-allowed'
            }`}>
              {!m.active && <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-[1px] text-[8px] font-black uppercase tracking-widest text-slate-400 z-10">{getT('dashboard.locked')}</div>}
              <span className="text-2xl">{m.icon}</span>
              <span className="text-[10px] font-black uppercase leading-tight text-left text-slate-800">{m.title}</span>
            </button>
          ))}
        </div>
      </div>
    </Layout>
  );

  if (view === 'test') {
    const scene = INITIAL_SCENES[state.currentId];
    if (loading || !scene) return (
      <Layout lang={lang} onLangChange={setLang}>
        <div className="flex flex-col items-center justify-center h-96 space-y-6">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="space-y-2 text-center">
             <p className="text-[10px] font-mono text-indigo-500 animate-pulse uppercase tracking-widest">Processing_Bio_Data</p>
             <p className="text-[8px] font-mono text-slate-400">DECIPHERING_MATRIX_VECTORS...</p>
          </div>
        </div>
      </Layout>
    );

    return (
      <Layout lang={lang} onLangChange={setLang}>
        <div className="space-y-10 py-6 animate-in">
          <div className="px-4 flex justify-between items-end">
            <div className="space-y-1">
              <span className="text-[9px] font-mono text-indigo-500 uppercase tracking-widest">Node_ID: 0{state.history.length + 1}</span>
              <h3 className="text-2xl font-black italic uppercase text-slate-900 leading-tight">{getT(scene.titleKey)}</h3>
            </div>
            <span className="text-[10px] font-mono text-slate-300">0{state.history.length + 1}/08</span>
          </div>
          <div className="px-4">
            <div className="bg-slate-950 p-10 rounded-3xl text-indigo-100/90 font-medium italic border border-indigo-500/20 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent"></div>
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
              }} className="w-full p-6 text-left bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-indigo-500 font-bold text-xs uppercase flex items-center gap-4 transition-all active:bg-indigo-50">
                <span className="text-indigo-300 font-mono text-[9px]">[{i+1}]</span>
                {getT(c.textKey)}
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
                <span className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.3em]">Identity_Vector</span>
                <h3 className="text-4xl font-black italic uppercase leading-none">{result.archetype[lang]}</h3>
             </div>
             <div className={`px-4 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${
               result.status === 'OPTIMAL' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'
             }`}>
               {result.status}
             </div>
          </header>

          <div className="p-8 bg-indigo-600 rounded-3xl shadow-xl text-white">
             <span className="text-[9px] font-black uppercase opacity-60 mb-2 block tracking-widest">Current_Phase</span>
             <p className="text-xl font-black uppercase">{getT(`phases.${result.phase.toLowerCase()}`)}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: getT('results.integrity'), val: result.integrity, color: 'text-indigo-500', bg: 'bg-slate-950' },
              { label: getT('results.capacity'), val: result.capacity, color: 'text-slate-800', bg: 'bg-white' }
            ].map(stat => (
              <div key={stat.label} className={`${stat.bg} p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center`}>
                <span className="text-[8px] font-mono text-slate-400 uppercase mb-2 tracking-widest">{stat.label}</span>
                <div className={`text-4xl font-black italic ${stat.color}`}>{stat.val}%</div>
              </div>
            ))}
          </div>

          <div className="aspect-square bg-slate-50 rounded-3xl relative flex items-center justify-center border border-slate-200 overflow-hidden shadow-inner">
            <svg viewBox="0 0 100 100" className="w-full h-full p-12 relative z-10">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#cbd5e1" strokeWidth="0.5" strokeDasharray="3 3" />
              <path 
                d={`M ${result.graphPoints[0].x} ${result.graphPoints[0].y} L ${result.graphPoints[1].x} ${result.graphPoints[1].y} L ${result.graphPoints[2].x} ${result.graphPoints[2].y} Z`}
                fill="rgba(99, 102, 241, 0.2)"
                stroke="#6366f1"
                strokeWidth="2.5"
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
                <div key={v} className="bg-red-50 p-4 rounded-2xl border border-red-100 flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                  <span className="text-[10px] font-black text-red-900 uppercase">{getT(`beliefs.${v}`)}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="px-4 space-y-8">
          <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-900">{getT('results.roadmap')}</h3>
          <div className="space-y-6">
            {result.roadmap.map(d => (
              <div key={d.day} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 font-mono text-[10px] text-indigo-100">PROC_0{d.day}</div>
                <div className="flex items-center gap-3 mb-4">
                   <div className={`w-2 h-2 rounded-full ${d.phase === 'SANITATION' ? 'bg-red-400' : 'bg-indigo-500'}`}></div>
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{d.phase}</span>
                </div>
                <h4 className="font-black text-2xl uppercase mb-4 text-slate-900 leading-tight">{d.task[lang]}</h4>
                <div className="space-y-4">
                   <p className="text-xs text-slate-600 leading-relaxed">{d.method[lang]}</p>
                   <div className="p-4 bg-slate-50 rounded-2xl">
                      <span className="text-[9px] font-mono text-slate-400 uppercase block mb-1">Target_Metric</span>
                      <p className="text-[10px] font-bold text-slate-800">{d.targetMetric[lang]}</p>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="px-4">
          <button onClick={() => setView('dashboard')} className="w-full p-8 bg-slate-950 text-white rounded-[2.5rem] font-black uppercase text-xs tracking-widest shadow-2xl active:scale-95 transition-all">Execute.Start()</button>
        </div>
      </div>
    </Layout>
  );

  return null;
};

export default App;
