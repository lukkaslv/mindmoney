
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Layout } from './components/Layout';
import { INITIAL_SCENES } from './constants';
import { Choice, GameState } from './types';
import { translations } from './translations';
import { getPsychologicalFeedback, textToSpeech, decodeBase64, playAudioBuffer, generateMindsetAnchor } from './services/geminiService';

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
    return (localStorage.getItem('app_lang') as 'ru' | 'ka') || 'ru';
  });
  
  const t = translations[lang];
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('is_auth') === 'true');
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

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      tg.enableClosingConfirmation();
      tg.headerColor = '#f8fafc';
      tg.backgroundColor = '#f8fafc';
    }
  }, []);

  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep(s => (s + 1) % t.loadingSteps.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [loading, t.loadingSteps.length]);

  const proceedToNext = useCallback(async () => {
    if (!intermediateFeedback) return;
    
    // Haptic feedback for saving
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
    window.Telegram?.WebApp?.MainButton?.hide();

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
        } catch (err) {
          window.Telegram?.WebApp?.showAlert?.("Глубокий анализ займет чуть больше времени. Мы сохранили результаты!");
        }
        setLoading(false);
      } else {
        setState(prev => ({ ...prev, currentSceneId: nextId, history: newHistory }));
      }
      setIsTransitioning(false);
    }, 400);
  }, [intermediateFeedback, state, t.loadingSteps.length]);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (intermediateFeedback && tg) {
      tg.MainButton.setText(t.saveNext.toUpperCase());
      tg.MainButton.show();
      const cb = () => proceedToNext();
      tg.MainButton.onClick(cb);
      return () => {
        tg.MainButton.offClick(cb);
        tg.MainButton.hide();
      };
    }
  }, [intermediateFeedback, t.saveNext, proceedToNext]);

  const handleLogin = () => {
    if (passwordInput.toLowerCase().trim() === APP_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem('is_auth', 'true');
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
    } else {
      window.Telegram?.WebApp?.showAlert?.(t.wrongPassword);
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('error');
    }
  };

  const handleChoice = (choice: Choice) => {
    setSelectedChoiceId(choice.id);
    
    // Психологический паттерн: выбор должен ощущаться
    const isFear = choice.beliefKey.includes('fear') || choice.beliefKey.includes('guilt');
    if (isFear) {
      window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('heavy');
    } else {
      window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light');
    }

    setTimeout(() => {
      setIntermediateFeedback({
        text: choice.text,
        nextId: choice.nextSceneId,
        belief: choice.beliefKey,
        userReflection: "",
        bodySensation: ""
      });
    }, 300);
  };

  const handleSendReport = () => {
    if (!analysisData) return;
    const historyText = state.history.map((h, i) => 
      `${i + 1}. Ситуация: ${h.sceneId}\nВыбор: ${h.choiceId}\nТело: ${h.bodySensation}\nРефлексия: ${h.userReflection}`
    ).join('\n\n');
    
    const report = `📝 ОТЧЕТ СЕССИИ MoneyMindset\n\n` +
      `📌 Главный инсайт: ${analysisData.keyBelief}\n` +
      `💎 Емкость: ${analysisData.capacity}%\n\n` +
      `История пути:\n${historyText}`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(report).then(() => {
        window.Telegram?.WebApp?.showAlert?.(t.reportCopied);
        window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
      });
    }
  };

  const ScoreBar = ({ label, value, color }: { label: string, value: number, color: string }) => (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-60">
        <span>{label}</span>
        <span className="font-mono">{value}%</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} transition-all duration-[1.5s] ease-out`} 
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );

  if (!isAuthenticated) {
    return (
      <Layout lang={lang}>
        <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-10 animate-fade-in px-6">
          <div className="relative">
            <div className="w-20 h-20 glass-card rounded-[2rem] flex items-center justify-center text-3xl shadow-xl z-10 relative">
              🔐
            </div>
            <div className="absolute -inset-4 bg-indigo-500/10 blur-2xl rounded-full"></div>
          </div>
          
          <div className="w-full space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-black tracking-tight">{t.enterPassword}</h2>
              <div className="flex justify-center gap-2">
                {['ru', 'ka'].map((l) => (
                  <button 
                    key={l}
                    onClick={() => {
                      setLang(l as any);
                      localStorage.setItem('app_lang', l);
                    }} 
                    className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase transition-all ${lang === l ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-400 border'}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <input 
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                className="w-full p-5 bg-white border border-slate-100 rounded-3xl text-center font-bold text-xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
              <button onClick={handleLogin} className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black shadow-lg shadow-indigo-200 active:scale-95 transition-all text-xs uppercase tracking-widest">
                {t.accessBtn}
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (state.isFinished) {
    return (
      <Layout lang={lang}>
        <div className="space-y-10 animate-fade-in pb-20">
          <div className="text-center space-y-1">
            <h2 className="text-3xl font-black tracking-tighter">{t.transformation}</h2>
            <p className="text-indigo-500 text-[10px] font-black uppercase tracking-[0.4em]">{t.profile}</p>
          </div>

          {loading ? (
            <div className="glass-card p-12 rounded-[3rem] shadow-sm flex flex-col items-center justify-center space-y-8 min-h-[400px]">
              <div className="w-16 h-16 relative">
                <div className="absolute inset-0 border-4 border-indigo-50 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-slate-500 font-bold text-xs text-center leading-relaxed h-12 max-w-[200px] animate-pulse">
                {t.loadingSteps[loadingStep]}
              </p>
            </div>
          ) : analysisData && (
            <div className="space-y-8 animate-fade-in">
              {anchorImage && (
                <div className="rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white">
                  <img src={anchorImage} alt="Anchor" className="w-full aspect-video object-cover" />
                </div>
              )}

              <div className="glass-card p-8 rounded-[3rem] shadow-sm space-y-8">
                 <div className="space-y-5">
                    <ScoreBar label="Безопасность" value={analysisData.scoreSafety} color="bg-blue-400" />
                    <ScoreBar label="Разрешение" value={analysisData.scorePermission} color="bg-emerald-400" />
                    <ScoreBar label="Амбиции" value={analysisData.scoreAmbition} color="bg-indigo-400" />
                    <div className="pt-2">
                       <ScoreBar label="Финансовая емкость" value={analysisData.capacity} color="bg-amber-400" />
                    </div>
                 </div>

                 <div className="pt-8 border-t border-slate-50 space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-black uppercase tracking-tighter text-base">{t.mentorVoice}</h3>
                      {audioBase64 && (
                        <button onClick={() => {
                          if (!isPlaying) {
                            setIsPlaying(true);
                            playAudioBuffer(decodeBase64(audioBase64)).finally(() => setIsPlaying(false));
                            window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('medium');
                          }
                        }} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isPlaying ? 'bg-indigo-100 text-indigo-600 pulse-soft' : 'bg-indigo-600 text-white shadow-xl shadow-indigo-200'}`}>
                          {isPlaying ? <div className="flex items-center h-4"><div className="audio-bar" style={{animationDelay:'0.1s'}}></div><div className="audio-bar" style={{animationDelay:'0.3s'}}></div><div className="audio-bar" style={{animationDelay:'0.5s'}}></div></div> : '▶'}
                        </button>
                      )}
                    </div>
                    
                    <div className="space-y-5">
                      <div className="p-6 bg-indigo-50/50 rounded-[2rem] border border-indigo-100/50">
                        <p className="text-[9px] font-black text-indigo-500 uppercase mb-2 tracking-widest">{t.insight}</p>
                        <p className="font-bold text-base leading-tight text-slate-800">{analysisData.keyBelief}</p>
                      </div>
                      <p className="text-slate-600 leading-relaxed text-sm font-medium italic px-2">"{analysisData.analysisText}"</p>
                      <div className="p-6 bg-emerald-50/50 rounded-[2rem] border border-emerald-100/50">
                        <p className="text-[9px] font-black text-emerald-600 uppercase mb-2 tracking-widest">{t.practice}</p>
                        <p className="font-bold text-sm text-slate-800">{analysisData.actionStep}</p>
                      </div>
                    </div>
                 </div>
              </div>

              <div className="grid gap-4 px-2">
                <button onClick={() => window.Telegram?.WebApp?.openLink(BOOKING_URL)} className="w-full py-5 bg-indigo-600 text-white rounded-3xl text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-100 active:scale-95 transition-all">
                  📅 {t.bookSession}
                </button>
                <button onClick={handleSendReport} className="w-full py-4 bg-white border border-slate-100 text-slate-400 rounded-3xl text-[10px] font-black uppercase tracking-widest active:bg-slate-50 transition-all">
                  📊 {t.sendReport}
                </button>
                <button onClick={() => window.location.reload()} className="w-full py-2 text-slate-300 text-[10px] font-bold uppercase tracking-widest">
                  {t.restart}
                </button>
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
        <div className="flex flex-col space-y-6 animate-fade-in h-full safe-area-bottom">
          <div className="glass-card p-8 rounded-[3rem] shadow-sm flex-1 flex flex-col space-y-8">
            <div className="text-center shrink-0">
              <h3 className="text-2xl font-black tracking-tight">{t.deeper}</h3>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Остановка для осознания</p>
            </div>
            
            <div className="space-y-4 shrink-0">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.whereInBody}</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(t.bodySensations).map(([key, label]) => (
                  <button 
                    key={key}
                    onClick={() => {
                      setIntermediateFeedback({...intermediateFeedback, bodySensation: label});
                      window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light');
                    }}
                    className={`p-4 rounded-2xl text-[11px] font-bold transition-all border-2 ${intermediateFeedback.bodySensation === label ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-slate-50 border-transparent text-slate-500'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 flex-1 flex flex-col min-h-0">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.whyChoice}</label>
              <textarea 
                value={intermediateFeedback.userReflection}
                onChange={(e) => setIntermediateFeedback({...intermediateFeedback, userReflection: e.target.value})}
                placeholder="Попробуйте описать мысли..."
                className="w-full flex-1 p-6 bg-slate-50 rounded-[2.5rem] text-sm focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-none font-medium border-none shadow-inner"
              />
            </div>
          </div>
          
          <button onClick={proceedToNext} className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black shadow-xl uppercase text-xs tracking-widest active:scale-95 transition-all shrink-0">
            {t.saveNext}
          </button>
        </div>
      </Layout>
    );
  }

  const scene = INITIAL_SCENES[state.currentSceneId];
  return (
    <Layout lang={lang}>
      <div className={`space-y-10 transition-all duration-500 ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        <div className="px-1 space-y-2">
           <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest opacity-30">
              <span>Процесс осознания</span>
              <span>{Math.round((Object.keys(INITIAL_SCENES).indexOf(state.currentSceneId) + 1) / Object.keys(INITIAL_SCENES).length * 100)}%</span>
           </div>
           <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
             <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${((Object.keys(INITIAL_SCENES).indexOf(state.currentSceneId) + 1) / Object.keys(INITIAL_SCENES).length) * 100}%` }} />
           </div>
        </div>

        <div className="scene-enter space-y-8">
          <div className="relative rounded-[3.5rem] overflow-hidden aspect-[4/5] shadow-2xl border-4 border-white group">
            <img src={`https://picsum.photos/seed/${scene.id}_v6/800/1000`} alt="Scene" className="object-cover w-full h-full transition-transform duration-[3s] group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent flex flex-col justify-end p-8">
              <h2 className="text-white font-black text-2xl leading-tight mb-3">{scene.title}</h2>
              <p className="text-white/80 text-sm font-medium leading-relaxed">{scene.description}</p>
            </div>
          </div>

          <div className="grid gap-3">
            {scene.choices.map((choice) => (
              <button 
                key={choice.id} 
                onClick={() => handleChoice(choice)} 
                className={`w-full p-6 text-left rounded-[2rem] flex items-center transition-all border-2 ${selectedChoiceId === choice.id ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-50 text-slate-700 active:bg-slate-50 shadow-sm'}`}
              >
                <span className="font-bold text-[14px] leading-tight flex-1">{choice.text}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default App;
