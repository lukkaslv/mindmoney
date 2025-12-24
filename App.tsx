
import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from './components/Layout.tsx';
import { INITIAL_SCENES } from './constants.ts';
import { Choice, GameState } from './types.ts';
import { translations } from './translations.ts';
import { getPsychologicalFeedback, textToSpeech, generateMindsetAnchor } from './services/psychologyService.ts';

declare global {
  interface Window {
    Telegram: {
      WebApp: any;
    };
  }
}

// Константы для админа (в реальности лучше хранить вовне, но здесь это "ключ от сейфа")
const MASTER_KEY = "admin777";

const App: React.FC = () => {
  const [lang, setLang] = useState<'ru' | 'ka'>(() => {
    try { return (localStorage.getItem('app_lang') as 'ru' | 'ka') || 'ru'; } catch (e) { return 'ru'; }
  });
  
  const t = translations[lang];

  // Динамические настройки из localStorage
  const [clientPassword, setClientPassword] = useState(() => localStorage.getItem('cfg_client_pass') || "money");
  const [bookingUrl, setBookingUrl] = useState(() => localStorage.getItem('cfg_booking_url') || "https://t.me/your_username");

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try { return localStorage.getItem('is_auth') === 'true'; } catch (e) { return false; }
  });
  const [isAdmin, setIsAdmin] = useState(() => {
    try { return localStorage.getItem('is_admin') === 'true'; } catch (e) { return false; }
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
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
    }
  }, []);

  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep(s => (s + 1) % t.loadingSteps.length);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [loading, t.loadingSteps.length]);

  const handleLogin = () => {
    const input = passwordInput.toLowerCase().trim();
    if (input === MASTER_KEY) {
      setIsAdmin(true);
      setIsAuthenticated(true);
      localStorage.setItem('is_admin', 'true');
      localStorage.setItem('is_auth', 'true');
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
    } else if (input === clientPassword) {
      setIsAdmin(false);
      setIsAuthenticated(true);
      localStorage.setItem('is_admin', 'false');
      localStorage.setItem('is_auth', 'true');
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
    } else {
      window.Telegram?.WebApp?.showAlert?.(t.wrongPassword);
    }
  };

  const saveAdminSettings = () => {
    localStorage.setItem('cfg_client_pass', clientPassword);
    localStorage.setItem('cfg_booking_url', bookingUrl);
    alert("Настройки сохранены!");
    window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
  };

  const copyInvite = () => {
    const text = `Привет! Приглашаю тебя пройти психологический тренажер "MoneyMindset".\n\nПароль для входа: ${clientPassword}\nСсылка: ${window.location.href}`;
    navigator.clipboard.writeText(text);
    alert("Приглашение скопировано!");
  };

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
        const data = await getPsychologicalFeedback(newHistory);
        setAnalysisData(data);
        const image = await generateMindsetAnchor(data.keyBelief);
        setAnchorImage(image);
        setTimeout(() => setLoading(false), 2000);
      } else {
        setState(prev => ({ ...prev, currentSceneId: nextId, history: newHistory }));
      }
      setIsTransitioning(false);
    }, 400);
  }, [intermediateFeedback, state]);

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

  // Рендер админ-панели
  if (isAdmin && isAuthenticated) {
    return (
      <Layout lang={lang}>
        <div className="space-y-8 pb-10 scene-transition">
          <div className="text-center">
            <h2 className="text-3xl font-black tracking-tighter mb-1">{t.adminTitle}</h2>
            <div className="flex justify-center gap-2 mt-4">
              {['ru', 'ka'].map((l) => (
                <button key={l} onClick={() => { setLang(l as any); localStorage.setItem('app_lang', l); }} className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${lang === l ? 'bg-slate-800 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100'}`}>{l}</button>
              ))}
            </div>
          </div>

          <div className="game-card p-6 space-y-6">
            <div className="space-y-4">
              <h3 className="font-black uppercase text-xs text-indigo-600">{t.adminStats}</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <p className="text-[10px] font-black opacity-30 uppercase">Статус</p>
                  <p className="text-lg font-black text-green-500">Active</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <p className="text-[10px] font-black opacity-30 uppercase">Режим</p>
                  <p className="text-lg font-black">Offline</p>
                </div>
              </div>
            </div>

            <div className="space-y-5 pt-4 border-t border-slate-50">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">{t.adminPassLabel}</label>
                <input type="text" value={clientPassword} onChange={(e) => setClientPassword(e.target.value)} className="w-full p-4 bg-slate-50 rounded-xl font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">{t.adminContactLabel}</label>
                <input type="text" value={bookingUrl} onChange={(e) => setBookingUrl(e.target.value)} className="w-full p-4 bg-slate-50 rounded-xl font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
              </div>
              <button onClick={saveAdminSettings} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all">{t.adminSave}</button>
            </div>
          </div>

          <div className="game-card p-6 space-y-4">
             <h3 className="font-black uppercase text-xs text-indigo-600">{t.adminClientLink}</h3>
             <div className="p-4 bg-slate-50 rounded-xl text-[11px] font-medium text-slate-500 italic leading-relaxed">
               "Привет! Приглашаю тебя пройти... Пароль: {clientPassword}..."
             </div>
             <button onClick={copyInvite} className="w-full py-4 bg-white border border-slate-100 text-indigo-600 rounded-xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all">{t.adminCopyLink}</button>
          </div>

          <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="w-full py-4 text-[9px] font-black text-slate-300 uppercase tracking-widest">Выйти из панели</button>
        </div>
      </Layout>
    );
  }

  // Экран логина
  if (!isAuthenticated) {
    return (
      <Layout lang={lang}>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-10 px-4">
          <div className="text-center space-y-4">
            <div className="text-4xl mb-2">💎</div>
            <h2 className="text-xl font-black tracking-tight">{t.enterPassword}</h2>
          </div>
          <div className="w-full space-y-3">
            <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="Код" className="w-full p-5 bg-white border border-slate-100 rounded-2xl text-center font-bold outline-none" onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
            <button onClick={handleLogin} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 active:scale-95 transition-all text-xs uppercase tracking-widest">{t.accessBtn}</button>
          </div>
        </div>
      </Layout>
    );
  }

  // Финальный экран (Результат)
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
              <div className="game-card p-6 space-y-6">
                <div className="space-y-4">
                  <ScoreBar label="Безопасность" value={analysisData.scoreSafety} color="bg-blue-400" />
                  <ScoreBar label="Разрешение" value={analysisData.scorePermission} color="bg-pink-400" />
                  <ScoreBar label="Амбиции" value={analysisData.scoreAmbition} color="bg-indigo-400" />
                </div>
                <div className="pt-6 border-t border-slate-50 space-y-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-black uppercase tracking-tight text-sm">{t.mentorVoice}</h3>
                    <button onClick={() => { setIsPlaying(true); textToSpeech(analysisData.analysisText).then(() => setIsPlaying(false)); }} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isPlaying ? 'bg-indigo-50 text-indigo-600' : 'bg-indigo-600 text-white shadow-lg'}`}>{isPlaying ? '...' : '▶'}</button>
                  </div>
                  <div className="p-5 bg-slate-50 rounded-2xl">
                    <p className="text-[9px] font-black text-indigo-400 uppercase mb-2 tracking-widest">{t.insight}</p>
                    <p className="font-bold text-base leading-snug text-slate-800 italic">"{analysisData.keyBelief}"</p>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-xs font-medium">{analysisData.analysisText}</p>
                  <div className="p-5 bg-indigo-600 text-white rounded-2xl">
                    <p className="text-[9px] font-black text-white/50 uppercase mb-2 tracking-widest">{t.practice}</p>
                    <p className="font-bold text-xs">{analysisData.actionStep}</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3 pt-2">
                <button onClick={() => { 
                    const text = `Инсайт: "${analysisData.keyBelief}"\n\nАнализ: ${analysisData.analysisText}\n\nПрактика: ${analysisData.actionStep}`;
                    navigator.clipboard.writeText(text);
                    alert("Скопировано!");
                 }} className="w-full py-5 bg-indigo-50 text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest">📋 Сохранить инсайт</button>
                <button onClick={() => window.Telegram?.WebApp?.openLink(bookingUrl)} className="w-full py-5 bg-white border border-slate-100 text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm">📅 {t.bookSession}</button>
                <button onClick={() => window.location.reload()} className="w-full py-3 text-[9px] font-black text-slate-300 uppercase tracking-widest">Пройти еще раз</button>
              </div>
            </div>
          )}
        </div>
      </Layout>
    );
  }

  // Экран ввода рефлексии (между сценами)
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
                  <button key={key} onClick={() => setIntermediateFeedback({...intermediateFeedback, bodySensation: label})} className={`p-4 rounded-xl text-[10px] font-black transition-all border ${intermediateFeedback.bodySensation === label ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-50 border-transparent text-slate-500'}`}>{label}</button>
                ))}
              </div>
            </div>
            <div className="space-y-4 flex-1 flex flex-col">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">{t.whyChoice}</label>
              <textarea value={intermediateFeedback.userReflection} onChange={(e) => setIntermediateFeedback({...intermediateFeedback, userReflection: e.target.value})} className="w-full flex-1 p-5 bg-slate-50 rounded-2xl text-xs outline-none transition-all resize-none border-none shadow-inner" />
            </div>
          </div>
          <button onClick={proceedToNext} className={`w-full py-5 rounded-2xl font-black shadow-lg uppercase text-[10px] tracking-widest transition-all ${intermediateFeedback.bodySensation ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400 pointer-events-none'}`}>{t.saveNext}</button>
        </div>
      </Layout>
    );
  }

  // Экран выбора сцены (Игра)
  const scene = INITIAL_SCENES[state.currentSceneId];
  return (
    <Layout lang={lang}>
      <div className={`space-y-8 transition-all duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        <div className="scene-transition space-y-6">
          <div className="relative rounded-[2.5rem] overflow-hidden aspect-[4/5] shadow-xl border-4 border-white">
            <img src={`https://picsum.photos/seed/${scene.id}_v12/800/1000`} alt="Scene" className="object-cover w-full h-full" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent flex flex-col justify-end p-6">
              <h2 className="text-white font-black text-xl mb-2">{scene.title}</h2>
              <p className="text-white/80 text-xs leading-relaxed">{scene.description}</p>
            </div>
          </div>
          <div className="grid gap-3">
            {scene.choices.map((choice) => (
              <button key={choice.id} onClick={() => {
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
              }} className="w-full p-5 text-left rounded-2xl flex items-center bg-white border border-slate-50 text-slate-700 active:scale-95 transition-all shadow-sm"><span className="font-black text-xs flex-1">{choice.text}</span><span className="opacity-20 ml-3">→</span></button>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default App;
