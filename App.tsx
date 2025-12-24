
import React, { useState, useMemo } from 'react';
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

  const getTranslation = (path: string) => {
    try {
      return path.split('.').reduce((p: any, c: any) => p && p[c], t) || `[${path}]`;
    } catch (e) {
      return `[${path}]`;
    }
  };

  const handleLogin = () => {
    const p = password.toLowerCase();
    if (["luka", "money", "admin", "arch"].includes(p)) {
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
      const analysis = calculateGenesisCore(history);
      setResult(analysis);
      setLoading(false);
      setView('results');
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.('success');
    }, 2000);
  };

  if (view === 'auth') return (
    <Layout lang={lang} onLangChange={setLang}>
      <div className="flex flex-col items-center justify-center py-20 space-y-12 animate-in">
        <div className="relative group">
          <div className="w-24 h-24 bg-slate-950 rounded-3xl flex items-center justify-center text-indigo-500 font-black text-3xl rotate-3 shadow-2xl border border-indigo-500/30 group-hover:rotate-0 transition-transform">
            G3
          </div>
          <div className="absolute -inset-4 border border-indigo-500/10 rounded-full animate-spin-slow"></div>
        </div>
        <div className="w-full px-4 space-y-6">
          <div className="space-y-2 text-center">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500">Access Protocol Required</h2>
            <div className="h-px w-12 bg-indigo-500/30 mx-auto"></div>
          </div>
          <input 
            type="password" 
            placeholder="SYSTEM_KEY" 
            className="w-full p-6 bg-slate-950 border border-slate-800 rounded-2xl text-center font-mono text-indigo-400 tracking-widest outline-none focus:border-indigo-500/50 transition-all shadow-inner"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
          />
          <button onClick={handleLogin} className="w-full bg-indigo-600 text-white p-6 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-lg hover:bg-indigo-500 active:scale-95 transition-all">Execute Init</button>
        </div>
      </div>
    </Layout>
  );

  if (view === 'dashboard') return (
    <Layout lang={lang} onLangChange={setLang}>
      <div className="space-y-10 animate-in pb-10">
        <header className="px-4 border-l-2 border-indigo-500 py-2">
          <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-none text-slate-900">{getTranslation('dashboard.title')}</h2>
          <p className="text-[10px] font-mono text-slate-400 mt-2 uppercase tracking-widest">{getTranslation('dashboard.desc')}</p>
        </header>
        <div className="grid grid-cols-2 gap-5 px-4">
          {[
            { id: 'money', title: getTranslation('dashboard.money'), icon: '▣' },
            { id: 'power', title: getTranslation('dashboard.power'), icon: '▲' },
            { id: 'body', title: getTranslation('dashboard.body'), icon: '◈' },
            { id: 'future', title: getTranslation('dashboard.future'), icon: '○' }
          ].map(m => (
            <button key={m.id} onClick={startModule} className="aspect-square bg-white border border-slate-100 rounded-2xl shadow-sm flex flex-col items-start justify-between p-6 hover:border-indigo-500 transition-all group active:scale-95">
              <span className="text-2xl text-indigo-500 font-mono">{m.icon}</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-800 leading-tight">{m.title}</span>
            </button>
          ))}
        </div>
      </div>
    </Layout>
  );

  if (view === 'test') {
    const scene = INITIAL_SCENES[state.currentId];
    if (!scene) return null;

    return (
      <Layout lang={lang} onLangChange={setLang}>
        <div className="space-y-10 py-6 animate-in">
          <div className="px-4 flex justify-between items-end">
            <div className="space-y-1">
              <span className="text-[9px] font-mono text-indigo-500 uppercase tracking-widest">Scanner Mode: Active</span>
              <h3 className="text-2xl font-black italic uppercase text-slate-900 leading-tight">
                {getTranslation(scene.titleKey)}
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-300">ID_{scene.id.toUpperCase()}</span>
          </div>
          <div className="px-4">
            <div className="bg-slate-950 p-10 rounded-3xl text-indigo-100/90 font-medium leading-relaxed italic border border-indigo-500/20 shadow-2xl relative">
              <div className="absolute top-0 left-10 w-px h-4 bg-indigo-500/50"></div>
              {getTranslation(scene.descKey)}
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
              }} className="w-full p-6 text-left bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-indigo-500 font-bold text-xs uppercase tracking-tight transition-all active:bg-indigo-50 flex items-center gap-4">
                <span className="text-indigo-300 font-mono">0{i+1}</span>
                {getTranslation(c.textKey)}
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
          <div className="flex justify-between items-start">
             <div className="space-y-1">
                <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">System Profile</span>
                <h3 className="text-3xl font-black italic uppercase leading-none">{result.archetype[lang]}</h3>
             </div>
             <div className={`px-3 py-1 rounded-full border text-[8px] font-black uppercase tracking-widest ${
               result.status === 'stable' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' :
               result.status === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-600' :
               'bg-red-50 border-red-200 text-red-600'
             }`}>
               {result.status}
             </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col justify-center items-center">
               <span className="text-[8px] font-mono text-slate-500 uppercase mb-2">Integrity_Index</span>
               <div className="text-5xl font-black italic text-indigo-500 leading-none">{result.integrity}%</div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-center items-center">
               <span className="text-[8px] font-mono text-slate-400 uppercase mb-2">Friction_Level</span>
               <div className="text-5xl font-black italic text-slate-800 leading-none">{result.state.friction}%</div>
            </div>
          </div>

          <div className="aspect-square bg-slate-50 rounded-3xl relative flex items-center justify-center border border-slate-200 overflow-hidden shadow-inner">
            <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(#6366f1 0.5px, transparent 0.5px)', backgroundSize: '10px 10px'}}></div>
            <svg viewBox="0 0 100 100" className="w-full h-full p-12 relative z-10">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
              <line x1="50" y1="10" x2="50" y2="90" stroke="#e2e8f0" strokeWidth="0.5" />
              <line x1="10" y1="50" x2="90" y2="50" stroke="#e2e8f0" strokeWidth="0.5" />
              <path 
                d={`M ${result.graphPoints[0].x} ${result.graphPoints[0].y} L ${result.graphPoints[1].x} ${result.graphPoints[1].y} L ${result.graphPoints[2].x} ${result.graphPoints[2].y} Z`}
                fill="rgba(99, 102, 241, 0.2)"
                stroke="#6366f1"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              {result.graphPoints.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="#6366f1" className="animate-pulse" />)}
            </svg>
          </div>

          <div className="p-8 bg-indigo-600 rounded-3xl shadow-xl text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 -mr-8 -mt-8 rounded-full blur-2xl"></div>
             <span className="text-[9px] font-black uppercase tracking-[0.3em] opacity-60 block mb-3">{getTranslation('results.metaTitle')}</span>
             <p className="text-xl font-bold italic leading-tight">"{result.metaphorSummary[lang]}"</p>
          </div>
        </section>

        <section className="px-4 space-y-6">
          <div className="flex items-center gap-4">
             <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] whitespace-nowrap">{getTranslation('results.roadmap')}</h3>
             <div className="h-px w-full bg-slate-200"></div>
          </div>
          <div className="space-y-5">
            {result.roadmap.map(d => (
              <div key={d.day} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative group overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 opacity-20 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex justify-between items-center mb-6">
                   <span className="text-[10px] font-mono text-indigo-500">PHASE_0{d.day}</span>
                   <span className="text-[8px] font-black uppercase text-slate-300 tracking-widest">{d.type}</span>
                </div>
                <div className="space-y-4">
                  <h4 className="font-black text-lg uppercase text-slate-900 leading-tight">{d.task[lang]}</h4>
                  <div className="p-4 bg-slate-50 rounded-2xl italic text-xs text-slate-500 border-l-2 border-indigo-200">
                    "{d.metaphor[lang]}"
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">{d.why[lang]}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="px-4">
          <button onClick={() => setView('dashboard')} className="w-full p-8 bg-slate-950 text-white rounded-3xl font-black uppercase text-xs tracking-[0.3em] shadow-2xl active:scale-95 transition-all">Re-initialize Scan</button>
        </div>
      </div>
    </Layout>
  );

  return null;
};

export default App;
