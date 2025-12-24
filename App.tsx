
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

  const handleLogin = () => {
    if (["luka", "money", "admin"].includes(password.toLowerCase())) {
      setView('dashboard');
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.('success');
    }
  };

  const startModule = () => {
    setState({ currentId: 'welcome', history: [] });
    setView('test');
  };

  const finishTest = (history: any[]) => {
    setLoading(true);
    const analysis = calculateGenesisCore(history);
    setResult(analysis);
    setTimeout(() => {
      setLoading(false);
      setView('results');
    }, 1800);
  };

  if (view === 'auth') return (
    <Layout lang={lang} onLangChange={setLang}>
      <div className="flex flex-col items-center justify-center py-16 space-y-10 animate-in">
        <div className="relative">
          <div className="w-20 h-20 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-2xl rotate-3 shadow-xl">LS</div>
          <div className="absolute -inset-2 border-2 border-indigo-500/20 rounded-2xl -z-10 animate-pulse"></div>
        </div>
        <div className="w-full px-4 space-y-4">
          <p className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">System Initialization</p>
          <input 
            type="password" 
            placeholder="KEY_CODE" 
            className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] text-center font-black tracking-widest outline-none focus:border-indigo-500 transition-all placeholder:opacity-30"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
          />
          <button onClick={handleLogin} className="w-full bg-slate-900 text-white p-6 rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-2xl active:scale-[0.98] transition-all">Unlock Engine</button>
        </div>
      </div>
    </Layout>
  );

  if (view === 'dashboard') return (
    <Layout lang={lang} onLangChange={setLang}>
      <div className="space-y-8 animate-in pb-10">
        <header className="px-4">
          <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none text-slate-900">{t.dashboard.title}</h2>
          <p className="text-xs font-medium text-slate-400 mt-2">{t.dashboard.desc}</p>
        </header>
        <div className="grid grid-cols-2 gap-4 px-4">
          {[
            { id: 'money', title: t.dashboard.money, icon: '💎' },
            { id: 'power', title: t.dashboard.power, icon: '⚡' },
            { id: 'body', title: t.dashboard.body, icon: '🌊' },
            { id: 'future', title: t.dashboard.future, icon: '🔭' }
          ].map(m => (
            <button key={m.id} onClick={startModule} className="aspect-square bg-white border-2 border-slate-50 rounded-[3rem] shadow-sm flex flex-col items-center justify-center space-y-3 hover:border-indigo-500 transition-all group">
              <span className="text-4xl group-hover:scale-110 transition-transform">{m.icon}</span>
              <span className="text-[10px] font-black uppercase tracking-wider text-center px-4">{m.title}</span>
            </button>
          ))}
        </div>
      </div>
    </Layout>
  );

  if (view === 'test') {
    const scene = INITIAL_SCENES[state.currentId];
    return (
      <Layout lang={lang} onLangChange={setLang}>
        <div className="space-y-8 py-6 animate-in">
          <div className="px-4 space-y-2">
            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Module Active</span>
            <h3 className="text-3xl font-black italic leading-[1.1] text-slate-900">
              {scene.titleKey.split('.').reduce((p:any,c:any)=>p[c], t)}
            </h3>
          </div>
          <div className="px-4">
            <div className="bg-slate-950 p-8 rounded-[3rem] text-white/90 font-medium leading-relaxed italic relative overflow-hidden">
              <span className="absolute top-4 left-4 text-4xl text-indigo-500/20 font-black">"</span>
              {scene.descKey.split('.').reduce((p:any,c:any)=>p[c], t)}
            </div>
          </div>
          <div className="px-4 space-y-3">
            {scene.choices.map(c => (
              <button key={c.id} onClick={() => {
                const nextHistory = [...state.history, { beliefKey: c.beliefKey }];
                if (c.nextSceneId && c.nextSceneId !== 'end') {
                  setState({ ...state, currentId: c.nextSceneId, history: nextHistory });
                  window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.('light');
                } else {
                  finishTest(nextHistory);
                }
              }} className="w-full p-6 text-left bg-white border-2 border-slate-100 rounded-[2rem] shadow-sm hover:border-indigo-500 font-black text-xs uppercase tracking-tight transition-all active:bg-indigo-50">
                {c.textKey.split('.').reduce((p:any,c:any)=>p[c], t)}
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
        <section className="px-4 space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-6">
             <div className="flex items-center gap-4">
                <span className="text-4xl">{result.archetype.icon}</span>
                <div>
                   <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">Archetype</span>
                   <h3 className="text-2xl font-black italic">{result.archetype[lang]}</h3>
                </div>
             </div>
             <div className="text-right">
                <span className="text-[9px] font-black text-slate-400 uppercase">{t.results.integrity}</span>
                <div className="text-4xl font-black italic text-indigo-600">{result.integrity}%</div>
             </div>
          </div>

          <div className="aspect-video bg-slate-50 rounded-[3rem] relative flex items-center justify-center border-2 border-slate-100 overflow-hidden shadow-inner">
            <svg viewBox="0 0 100 100" className="w-full h-full p-8">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="2 2" />
              <path 
                d={`M ${result.graphPoints[0].x} ${result.graphPoints[0].y} L ${result.graphPoints[1].x} ${result.graphPoints[1].y} L ${result.graphPoints[2].x} ${result.graphPoints[2].y} Z`}
                fill="rgba(99, 102, 241, 0.15)"
                stroke="#6366f1"
                strokeWidth="2.5"
                strokeLinejoin="round"
                className="animate-pulse"
              />
              {result.graphPoints.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="3" fill="#6366f1" />)}
            </svg>
          </div>

          <div className="p-8 bg-indigo-50 border-2 border-indigo-100 rounded-[3rem]">
             <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest block mb-2">{t.results.metaTitle}</span>
             <p className="text-lg font-bold italic text-slate-800 leading-tight">"{result.metaphorSummary[lang]}"</p>
          </div>
        </section>

        <section className="px-4 space-y-6">
          <div className="flex items-center gap-4">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] whitespace-nowrap">{t.results.roadmap}</h3>
             <div className="h-px w-full bg-slate-100"></div>
          </div>
          <div className="space-y-4">
            {result.roadmap.map(d => (
              <div key={d.day} className="bg-white p-8 rounded-[3rem] border-2 border-slate-50 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 bg-slate-50 rounded-bl-3xl">
                   <span className="text-[10px] font-black text-slate-400">#0{d.day}</span>
                </div>
                <div className="space-y-4">
                  <div>
                    <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest block mb-1">Metaphor</span>
                    <p className="text-xs font-bold text-slate-400 italic">"{d.metaphor[lang]}"</p>
                  </div>
                  <div>
                    <h4 className="font-black text-xl italic text-slate-900 mb-2">{d.task[lang]}</h4>
                    <p className="text-sm text-slate-600 font-medium leading-relaxed">{d.why[lang]}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="px-4">
          <button onClick={() => setView('dashboard')} className="w-full p-8 bg-slate-950 text-white rounded-[3rem] font-black uppercase text-xs tracking-widest shadow-2xl active:scale-95 transition-all">Return to Lab</button>
        </div>
      </div>
    </Layout>
  );

  return null;
};

export default App;
