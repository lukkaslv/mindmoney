
import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from './components/Layout.tsx';
import { INITIAL_SCENES } from './constants.ts';
import { Choice, GameState } from './types.ts';
import { translations } from './translations.ts';
import { getPsychologicalFeedback, textToSpeech, decodeBase64, playAudioBuffer, generateMindsetAnchor } from './services/geminiService.ts';

declare global {
  interface Window {
    Telegram: {
      WebApp: any;
    };
  }
}

const APP_PASSWORD = "money"; 
const BOOKING_URL = "https://t.me/your_telegram_username"; 

const App: React.FC = () => {
  const [lang, setLang] = useState<'ru' | 'ka'>(() => {
    try { return (localStorage.getItem('app_lang') as 'ru' | 'ka') || 'ru'; } catch (e) { return 'ru'; }
  });
  
  const t = translations[lang];
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try { return localStorage.getItem('is_auth') === 'true'; } catch (e) { return false; }
  });
  const [passwordInput, setPasswordInput] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);

  const [state, setState] = useState<GameState>({
    currentSceneId: 'welcome',
    history: [],
    isFinished: false
  });
  
  const [intermediateFeedback, setIntermediateFeedback] = useState<{
    text: string;
    nextId?: string;
    belief: string;
    userReflection: string;
    bodySensation: string;
  } | null>(null);

  const [analysisData, setAnalysisData] = useState<any>(null);
  const [anchorImage, setAnchorImage] = useState<string | null>(null);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasApiKey, setHasApiKey] = useState<boolean | 'checking'>('checking');

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      tg.headerColor = '#fcfdff';
      tg.backgroundColor = '#fcfdff';
    }
    const key = (typeof process !== 'undefined' && process.env?.API_KEY) || (window as any).process?.env?.API_KEY;
    setHasApiKey(!!key);
  }, []);

  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep(s => (s + 1) % t.loadingSteps.length);
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [loading, t.loadingSteps.length]);

  const proceedToNext = useCallback(async () => {
    if (!intermediateFeedback) return;
    window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
    const { nextId, belief, userReflection, bodySensation } = intermediateFeedback;
    const newHistory = [...state.history, { 
      sceneId: state.currentSceneId, 
      choiceId: intermediateFeedback.text, 
      beliefKey: belief,
      userReflection,
      bodySensation
    }];
    setIsTransitioning(true);
    setIntermediateFeedback(null);
    setSelectedChoiceId(null);
    setTimeout(async () => {
      if (!nextId || nextId === 'end') {
        setState(prev => ({ ...prev, history: newHistory, isFinished: true }));
        setLoading(true);
        try {
          const data = await getPsychologicalFeedback(newHistory);
          setAnalysisData(data);
          if (data) {
            const [audio, image] = await Promise.all([
              textToSpeech(data.analysisText),
              generateMindsetAnchor(data.imagePrompt)
            ]);
            setAudioBase64(audio);
            setAnchorImage(image);
          }
        } catch (err) { console.error(err); }
        setLoading(false);
      } else {
        setState(prev => ({ ...prev, currentSceneId: nextId, history: newHistory }));
      }
      setIsTransitioning(false);
    }, 500);
  }, [intermediateFeedback, state, t.loadingSteps.length]);

  const handleChoice = (choice: Choice) => {
    setSelectedChoiceId(choice.id);
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('medium');
    setTimeout(() => {
      setIntermediateFeedback({
        text: choice.text,
        nextId: choice.nextSceneId,
        belief: choice.beliefKey,
        userReflection: "",
        bodySensation: ""
      });
    }, 400);
  };

  const handleLogin = () => {
    if (passwordInput.toLowerCase().trim() === APP_PASSWORD) {
      setIsAuthenticated(true);
      try { localStorage.setItem('is_auth', 'true'); } catch (e) {}
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
    } else {
      window.Telegram?.WebApp?.showAlert?.(t.wrongPassword);
    }
  };

  const handleCopyResult = () => {
    if (!analysisData) return;
    const text = `Мой психологический якорь:\n"${analysisData.keyBelief}"\n\nАнализ: ${analysisData.analysisText}\n\nШаг к изменениям: ${analysisData.actionStep}`;
    navigator.clipboard.writeText(text);
    window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
    alert("Результат скопирован в буфер обмена");
  };

  const ScoreBar = ({ label, value, color }: { label: string, value: number, color: string }) => (
    <div className="space-y-2">
      <div className="flex justify-between text-[10px] font-black uppercase tracking-wider opacity-50">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} transition-all duration-[2s] ease-out`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );

  if (!isAuthenticated) {
    return (
      <Layout lang={lang}>
        <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-12 px-4">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-white rounded-[2.5rem] shadow-2xl flex items-center justify-center text-3xl mx-auto mb-6 border border-slate-50 animate-bounce">💎</div>
            <h2 className="text-2xl font-black tracking-tight">{t.enterPassword}</h2>
            <div className="flex justify-center gap-3">
              {['ru', 'ka'].map((l) => (
                <button key={l} onClick={() => { setLang(l as any); try { localStorage.setItem('app_lang', l); } catch (e) {} }} className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${lang === l ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white text-slate-400 border border-slate-100'}`}>{l}</button>
              ))}
            </div>
          </div>
          <div className="w-full space-y-4">
            <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="Код доступа" className="w-full p-6 bg-white border-2 border-slate-50 rounded-[2rem] text-center font-bold text-lg focus:border-indigo-100 outline-none transition-all shadow-inner" onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
            <button onClick={handleLogin} className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black shadow-xl shadow-indigo-100 active:scale-95 transition-all text-sm uppercase tracking-widest">{t.accessBtn}</button>
          </div>
        </div>
      </Layout>
    );
  }

  if (state.isFinished) {
    return (
      <Layout lang={lang}>
        <div className="space-y-12 pb-12">
          <div className="text-center">
            <h2 className="text-4xl font-black tracking-tighter mb-2">{t.transformation}</h2>
            <p className="text-indigo-500 text-[10px] font-black uppercase tracking-[0.4em] opacity-60">{t.profile}</p>
          </div>
          {loading ? (
            <div className="game-card p-12 flex flex-col items-center justify-center space-y-10 min-h-[450px]">
              <div className="w-20 h-20 relative">
                <div className="absolute inset-0 border-4 border-indigo-50 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-slate-500 font-bold text-sm text-center leading-relaxed h-16 px-6 animate-pulse">{t.loadingSteps[loadingStep]}</p>
            </div>
          ) : analysisData && (
            <div className="space-y-8 scene-transition">
              {anchorImage && (
                <div className="rounded-[3rem] overflow-hidden shadow-2xl border-[6px] border-white">
                  <img src={anchorImage} alt="Anchor" className="w-full aspect-[16/10] object-cover" />
                </div>
              )}
              <div className="game-card p-8 space-y-8">
                <div className="space-y-6">
                  <ScoreBar label="Безопасность" value={analysisData.scoreSafety} color="bg-blue-400" />
                  <ScoreBar label="Разрешение" value={analysisData.scorePermission} color="bg-pink-400" />
                  <ScoreBar label="Амбиции" value={analysisData.scoreAmbition} color="bg-indigo-400" />
                  <div className="pt-4"><ScoreBar label="Финансовая емкость" value={analysisData.capacity} color="bg-amber-400" /></div>
                </div>
                <div className="pt-8 border-t border-slate-50 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-black uppercase tracking-tight text-lg">{t.mentorVoice}</h3>
                    {audioBase64 && (
                      <button onClick={() => { if (!isPlaying) { setIsPlaying(true); playAudioBuffer(decodeBase64(audioBase64)).finally(() => setIsPlaying(false)); window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('medium'); } }} className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isPlaying ? 'bg-indigo-50 text-indigo-600' : 'bg-indigo-600 text-white shadow-xl shadow-indigo-100'}`}>{isPlaying ? <div className="flex items-end h-4 gap-0.5"><div className="audio-wave-bar" style={{animationDelay:'0.1s'}}></div><div className="audio-wave-bar" style={{animationDelay:'0.3s'}}></div><div className="audio-wave-bar" style={{animationDelay:'0.5s'}}></div></div> : '▶'}</button>
                    )}
                  </div>
                  <div className="space-y-6">
                    <div className="p-6 bg-slate-50 rounded-[2.5rem] relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/20"></div>
                      <p className="text-[10px] font-black text-indigo-400 uppercase mb-3 tracking-widest">{t.insight}</p>
                      <p className="font-bold text-lg leading-tight text-slate-800 italic">"{analysisData.keyBelief}"</p>
                    </div>
                    <p className="text-slate-600 leading-relaxed text-sm font-medium px-2">{analysisData.analysisText}</p>
                    <div className="p-7 bg-indigo-600 text-white rounded-[2.5rem] shadow-lg shadow-indigo-100">
                      <p className="text-[10px] font-black text-white/50 uppercase mb-3 tracking-widest">{t.practice}</p>
                      <p className="font-bold text-sm leading-snug">{analysisData.actionStep}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid gap-4 pt-4 px-2">
                <button onClick={handleCopyResult} className="w-full py-6 bg-indigo-50 text-indigo-600 rounded-[2rem] text-xs font-black uppercase tracking-widest active:scale-95 transition-all">📋 Сохранить инсайт</button>
                <button onClick={() => window.Telegram?.WebApp?.openLink(BOOKING_URL)} className="w-full py-6 bg-white border-2 border-indigo-50 text-indigo-600 rounded-[2rem] text-xs font-black uppercase tracking-widest shadow-sm active:bg-slate-50 transition-all">📅 {t.bookSession}</button>
                <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="w-full py-4 text-slate-300 text-[10px] font-bold uppercase tracking-widest hover:text-slate-400 transition-all">{t.restart}</button>
              </div>
            </div>
          )}
        </div>
      </Layout>
    );
  }

  if (intermediateFeedback) {
    return (
      <Layout lang={lang}>
        <div className="flex flex-col space-y-6 scene-transition h-full safe-area-bottom">
          <div className="game-card p-8 flex-1 flex flex-col space-y-10">
            <div className="text-center shrink-0">
              <h3 className="text-2xl font-black tracking-tight">{t.deeper}</h3>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2 opacity-60">Телесный отклик</p>
            </div>
            <div className="space-y-5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">{t.whereInBody}</label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(t.bodySensations).map(([key, label]) => (
                  <button key={key} onClick={() => { setIntermediateFeedback({...intermediateFeedback, bodySensation: label}); window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light'); }} className={`p-5 rounded-[1.8rem] text-[11px] font-black transition-all border-2 ${intermediateFeedback.bodySensation === label ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-slate-50 border-transparent text-slate-500'}`}>{label}</button>
                ))}
              </div>
            </div>
            <div className="space-y-5 flex-1 flex flex-col">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">{t.whyChoice}</label>
              <textarea value={intermediateFeedback.userReflection} onChange={(e) => setIntermediateFeedback({...intermediateFeedback, userReflection: e.target.value})} placeholder="Что вы чувствуете в этот момент?" className="w-full flex-1 p-7 bg-slate-50 rounded-[2.5rem] text-sm focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all resize-none font-medium border-none shadow-inner" />
            </div>
          </div>
          <button onClick={proceedToNext} className={`w-full py-6 rounded-[2rem] font-black shadow-xl uppercase text-xs tracking-widest transition-all ${intermediateFeedback.bodySensation ? 'bg-indigo-600 text-white shadow-indigo-100' : 'bg-slate-200 text-slate-400 pointer-events-none'}`}>{t.saveNext}</button>
        </div>
      </Layout>
    );
  }

  const scene = INITIAL_SCENES[state.currentSceneId];
  const progress = Math.round((Object.keys(INITIAL_SCENES).indexOf(state.currentSceneId) + 1) / Object.keys(INITIAL_SCENES).length * 100);

  return (
    <Layout lang={lang}>
      <div className={`space-y-10 transition-all duration-500 ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        <div className="px-2 space-y-3">
           <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-[0.3em] opacity-30"><span>Исследование</span><span>{progress}%</span></div>
           <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-indigo-500 transition-all duration-1000 ease-out" style={{ width: `${progress}%` }} /></div>
        </div>
        <div className="scene-transition space-y-8">
          <div className="relative rounded-[3.5rem] overflow-hidden aspect-[4/5] shadow-2xl border-[6px] border-white">
            <img src={`https://picsum.photos/seed/${scene.id}_v8/800/1000`} alt="Scene" className="object-cover w-full h-full" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent flex flex-col justify-end p-8 pb-10">
              <h2 className="text-white font-black text-2xl leading-tight mb-4">{scene.title}</h2>
              <p className="text-white/80 text-sm font-medium leading-relaxed">{scene.description}</p>
            </div>
          </div>
          <div className="grid gap-4">
            {scene.choices.map((choice) => (
              <button key={choice.id} onClick={() => handleChoice(choice)} className={`w-full p-7 text-left rounded-[2rem] flex items-center transition-all border-2 ${selectedChoiceId === choice.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-200' : 'bg-white border-slate-50 text-slate-700 active:scale-[0.98] shadow-sm'}`}><span className="font-black text-[14px] leading-tight flex-1">{choice.text}</span><span className="opacity-20 ml-4">→</span></button>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default App;
