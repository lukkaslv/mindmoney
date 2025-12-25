
import React, { memo, useEffect, useRef } from 'react';
import { translations } from '../translations.ts';
import { StorageService } from '../services/storageService.ts';

declare global {
  interface Window {
    Telegram: {
      WebApp: any;
    };
  }
}

interface LayoutProps {
  children: React.ReactNode;
  lang: 'ru' | 'ka';
  onLangChange: (lang: 'ru' | 'ka') => void;
  soundEnabled: boolean;
  onSoundToggle: () => void;
}

export const Layout = memo<LayoutProps>(({ children, lang, onLangChange, soundEnabled, onSoundToggle }) => {
  const t = translations[lang];
  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioNode | null>(null);

  useEffect(() => {
    if (soundEnabled) {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioCtxRef.current;
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      
      // Pink Noise Generation for calming laboratory ambient
      let b0, b1, b2, b3, b4, b5, b6;
      b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.11; // volume
        b6 = white * 0.115926;
      }

      const source = ctx.createBufferSource();
      source.buffer = noiseBuffer;
      source.loop = true;
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 400;

      const gain = ctx.createGain();
      gain.gain.value = 0.05;

      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      source.start();
      
      noiseNodeRef.current = source;
    } else {
      if (noiseNodeRef.current) {
        (noiseNodeRef.current as any).stop();
        noiseNodeRef.current = null;
      }
    }

    return () => {
      if (noiseNodeRef.current) {
        (noiseNodeRef.current as any).stop();
      }
    };
  }, [soundEnabled]);

  const handleClearCache = () => {
    window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.('warning');
    if (confirm(lang === 'ru' ? "Сбросить текущую сессию?" : "გსურთ სესიის გადატვირთვა?")) {
      StorageService.clear();
      window.location.reload();
    }
  };

  const toggleLang = () => {
    const nextLang = lang === 'ru' ? 'ka' : 'ru';
    onLangChange(nextLang);
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.('light');
  };

  const logout = () => {
    localStorage.removeItem('session_auth');
    window.location.reload();
  };

  return (
    <div className="flex-1 flex flex-col max-w-md mx-auto w-full relative h-full">
      <header className="px-8 py-8 flex justify-between items-center z-30 relative shrink-0 border-b border-slate-50 bg-white/80 backdrop-blur-md">
        <div className="flex flex-col">
          <h1 className="font-[900] text-2xl tracking-tight leading-none text-slate-900 flex items-center gap-2">
            Genesis Lab <span className="text-indigo-600 text-xl">⚡</span>
          </h1>
          <span className="text-[10px] font-black text-indigo-400/80 uppercase tracking-[0.4em] mt-2">
            {t.subtitle}
          </span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={onSoundToggle}
            className={`w-10 h-10 flex items-center justify-center rounded-2xl border shadow-sm active:scale-90 transition-all text-sm ${soundEnabled ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-100 text-slate-400'}`}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
          <button 
            onClick={toggleLang}
            className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white border border-slate-100 shadow-sm active:scale-90 transition-all font-black text-[10px] text-slate-800"
          >
            {lang === 'ru' ? 'RU' : 'KA'}
          </button>
          <button 
            onClick={handleClearCache}
            className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white border border-slate-100 shadow-sm active:scale-90 transition-all text-sm"
          >
            🔄
          </button>
        </div>
      </header>
      
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative scroll-smooth bg-white">
        <div className="px-6 py-8 pb-32">
          {children}
        </div>
      </main>
      
      <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-8 py-6 bg-white/90 backdrop-blur-md border-t border-slate-50 z-40 flex justify-between items-center">
        <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.5em]">Genesis OS v6.3</span>
        <button onClick={logout} className="text-[9px] font-black text-red-300 uppercase tracking-widest hover:text-red-500 transition-colors">Terminate_Session</button>
      </footer>
    </div>
  );
});
