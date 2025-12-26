import React, { memo, useEffect, useRef } from 'react';
// FIXED: Removed .ts extension for consistent module imports
import { translations } from '../translations';

interface LayoutProps {
  children: React.ReactNode;
  lang: 'ru' | 'ka';
  onLangChange: (lang: 'ru' | 'ka') => void;
  soundEnabled: boolean;
  onSoundToggle: () => void;
  onLogout: () => void;
  onReset: () => void;
}

const seededRandom = (seed: number) => {
  let state = seed % 2147483647;
  if (state <= 0) state += 2147483646;
  return () => {
    state = (state * 48271) % 2147483647;
    return (state - 1) / 2147483646;
  };
};

export const Layout = memo<LayoutProps>(({ 
  children, 
  lang, 
  onLangChange, 
  soundEnabled, 
  onSoundToggle,
  onLogout,
  onReset
}) => {
  const t = translations[lang];
  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioNode | null>(null);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (mainRef.current) { mainRef.current.scrollTop = 0; }
  }, [children]);

  useEffect(() => {
    if (soundEnabled) {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      const random = seededRandom(42); 
      let b0, b1, b2, b3, b4, b5, b6;
      b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.11;
        b6 = white * 0.115926;
      }
      const source = ctx.createBufferSource();
      source.buffer = noiseBuffer;
      source.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 400;
      const gain = ctx.createGain();
      gain.gain.value = 0.03;
      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      source.start();
      noiseNodeRef.current = source;
    } else {
      if (noiseNodeRef.current) { (noiseNodeRef.current as any).stop(); noiseNodeRef.current = null; }
    }
    return () => { if (noiseNodeRef.current) { (noiseNodeRef.current as any).stop(); } };
  }, [soundEnabled]);

  return (
    <div className="flex-1 flex flex-col max-w-md mx-auto w-full relative h-full bg-white">
      <header className="px-6 py-5 flex justify-between items-center z-50 relative shrink-0 border-b border-slate-100/50 glass-card">
        <div className="flex flex-col">
          <h1 className="font-black text-xl tracking-tight leading-none text-slate-900">
            Genesis <span className="text-indigo-600">OS</span>
          </h1>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            {t.subtitle.split('//')[0]}
          </span>
        </div>
        <div className="flex gap-2">
          <button onClick={onSoundToggle} className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${soundEnabled ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
            {soundEnabled ? '🔊' : '🔇'}
          </button>
          <button onClick={() => onLangChange(lang === 'ru' ? 'ka' : 'ru')} className="px-3 h-9 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-100 font-black text-[10px] text-slate-800">
            {lang === 'ru' ? 'RU' : 'KA'}
          </button>
        </div>
      </header>
      <main ref={mainRef} className="flex-1 overflow-y-auto overflow-x-hidden relative scroll-smooth">
        <div className="px-5 py-6 pb-24">{children}</div>
      </main>
      <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-6 py-4 glass-card border-t border-slate-100 z-50 flex justify-between items-center rounded-t-3xl shadow-2xl">
        <div className="flex flex-col">
            <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">{t.ui.system_build}</span>
            <span className="text-[9px] font-mono font-bold text-slate-400">v9.8.0-SLC</span>
        </div>
        <button onClick={onReset} className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 hover:bg-slate-100 transition-colors">
          {t.ui.reset_session_btn}
        </button>
      </footer>
    </div>
  );
});