
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

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      tg.headerColor = '#fcfdff';
      tg.backgroundColor = '#fcfdff';
    }
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
    const text = `Инсайт: "${analysisData.keyBelief}"\n\nАнализ: ${analysisData.analysisText}\n\nПрактика: ${analysisData.actionStep}`;
    navigator.clipboard.writeText(text);
    window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
    alert("Скопировано!");
  };

  const ScoreBar = ({ label, value, color }: { label: string, value: number, color: string }) => (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[9px] font-black uppercase tracking-wider opacity-40">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} transition-all duration-[1.5s] ease-out`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );

  if (!isAuthenticated) {
    return (
      <Layout lang={lang}>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-10 px-4">
          <div className="text-center space-y-4">
            <div className="text-4xl mb-2">💎</div>
            <h2 className="text-xl font-black tracking-tight">{t.enterPassword}</h2>
            <div className="flex justify-center gap-2">
              {['ru', 'ka'].map((l) => (
                <button key={l} onClick={() => { setLang(l as any); try { localStorage.setItem('app_lang', l); } catch (e) {} }} className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${lang === l ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100'}`}>{l}</button>
              ))}
            </div>
          </div>
          <div className="w-full space-y-3">
            <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="Код" className="w-full p-5 bg-white border border-slate-100 rounded-2xl text-center font-bold focus:border-indigo-300 outline-none transition-all shadow-sm" onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
            <button onClick={handleLogin} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 active:scale-95 transition-all text-xs uppercase tracking-widest">{t.accessBtn}</button>
          </div>
        </div>
      </Layout>
    );
  }

  if (state.isFinished) {
    return (
      <Layout lang={lang}>
        <div className="space-y-10 pb-10">
          <div className="text-center">
            <h2 className="text-3xl font-black tracking-tighter mb-1">{t.transformation}</h2>
            <p className="text-indigo-500 text-[9px] font-black uppercase tracking-[0.3em] opacity-50">{t.profile}</p>
          </div>
          {loading ? (
            <div className="game-card p-10 flex flex-col items-center justify-center space-y-8 min-h-[400px]">
              <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-400 font-bold text-xs text-center leading-relaxed px-4 animate-pulse">{t.loadingSteps[loadingStep]}</p>
            </div>
          ) : analysisData && (
            <div className="space-y-6 scene-transition">
              {anchorImage && (
                <div className="rounded-[2.5rem] overflow-hidden shadow-xl border-4 border-white">
                  <img src={anchorImage} alt="Anchor" className="w-full aspect-video object-cover" />
                </div>
              )}
              <div className="game-card p-6 space-y-6">
                <div className="space-y-4">
                  <ScoreBar label="Безопасность" value={analysisData.scoreSafety} color="bg-blue-400" />
                  <ScoreBar label="Разрешение" value={analysisData.scorePermission} color="bg-pink-400" />
                  <ScoreBar label="Амбиции" value={analysisData.scoreAmbition} color="bg-indigo-400" />
                </div>
                <div className="pt-6 border-t border-slate-50 space-y-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-black uppercase tracking-tight text-sm">{t.mentorVoice}</h3>
                    {audioBase64 && (
                      <button onClick={() => { if (!isPlaying) { setIsPlaying(true); playAudioBuffer(decodeBase64(audioBase64)).finally(() => setIsPlaying(false)); window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('medium'); } }} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isPlaying ? 'bg-indigo-50 text-indigo-600' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'}`}>{isPlaying ? '...' : '▶'}</button>
                    )}
                  </div>
                  <div className="p-5 bg-slate-50 rounded-2xl">
                    <p className="text-[9px] font-black text-indigo-400 uppercase mb-2 tracking-widest">{t.insight}</p>
                    <p className="font-bold text-base leading-snug text-slate-800 italic">"{analysisData.keyBelief}"</p>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-xs font-medium">{analysisData.analysisText}</p>
                </div>
              </div>
              <div className="flex flex-col gap-3 pt-2">
                <button onClick={handleCopyResult} className="w-full py-5 bg-indigo-50 text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all">📋 Сохранить инсайт</button>
                <button onClick={() => window.Telegram?.WebApp?.openLink(BOOKING_URL)} className="w-full py-5 bg-white border border-slate-100 text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm">📅 {t.bookSession}</button>
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
        <div className="flex flex-col space-y-6 scene-transition h-full">
          <div className="game-card p-6 flex-1 flex flex-col space-y-8">
            <div className="text-center">
              <h3 className="text-xl font-black">{t.deeper}</h3>
            </div>
            <div className="space-y-4">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">{t.whereInBody}</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(t.bodySensations).map(([key, label]) => (
                  <button key={key} onClick={() => setIntermediateFeedback({...intermediateFeedback, bodySensation: label})} className={`p-4 rounded-xl text-[10px] font-black transition-all border ${intermediateFeedback.bodySensation === label ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-slate-50 border-transparent text-slate-500'}`}>{label}</button>
                ))}
              </div>
            </div>
            <div className="space-y-4 flex-1 flex flex-col">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">{t.whyChoice}</label>
              <textarea value={intermediateFeedback.userReflection} onChange={(e) => setIntermediateFeedback({...intermediateFeedback, userReflection: e.target.value})} className="w-full flex-1 p-5 bg-slate-50 rounded-2xl text-xs focus:ring-2 focus:ring-indigo-100 outline-none transition-all resize-none border-none shadow-inner" />
            </div>
          </div>
          <button onClick={proceedToNext} className={`w-full py-5 rounded-2xl font-black shadow-lg uppercase text-[10px] tracking-widest transition-all ${intermediateFeedback.bodySensation ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400 pointer-events-none'}`}>{t.saveNext}</button>
        </div>
      </Layout>
    );
  }

  const scene = INITIAL_SCENES[state.currentSceneId];

  return (
    <Layout lang={lang}>
      <div className={`space-y-8 transition-all duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        <div className="scene-transition space-y-6">
          <div className="relative rounded-[2.5rem] overflow-hidden aspect-[4/5] shadow-xl border-4 border-white">
            <img src={`https://picsum.photos/seed/${scene.id}_v9/800/1000`} alt="Scene" className="object-cover w-full h-full" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent flex flex-col justify-end p-6">
              <h2 className="text-white font-black text-xl mb-2">{scene.title}</h2>
              <p className="text-white/80 text-xs leading-relaxed">{scene.description}</p>
            </div>
          </div>
          <div className="grid gap-3">
            {scene.choices.map((choice) => (
              <button key={choice.id} onClick={() => handleChoice(choice)} className="w-full p-5 text-left rounded-2xl flex items-center bg-white border border-slate-50 text-slate-700 active:scale-95 transition-all shadow-sm"><span className="font-black text-xs flex-1">{choice.text}</span><span className="opacity-20 ml-3">→</span></button>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default App;
