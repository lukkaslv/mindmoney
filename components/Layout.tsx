
import React, { useState } from 'react';
import { translations } from '../translations.ts';

interface LayoutProps {
  children: React.ReactNode;
  lang: 'ru' | 'ka';
  onLangChange: (lang: 'ru' | 'ka') => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, lang, onLangChange }) => {
  const t = translations[lang];
  const [showBuild, setShowBuild] = useState(false);

  const handleClearCache = () => {
    window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('warning');
    if (confirm(lang === 'ru' ? "Очистить текущую сессию?" : "გსურთ სესიის გასუფთავება?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const toggleLang = () => {
    const nextLang = lang === 'ru' ? 'ka' : 'ru';
    onLangChange(nextLang);
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light');
  };

  return (
    <div className="flex-1 flex flex-col max-w-md mx-auto w-full relative h-full">
      <header className="px-8 py-6 flex justify-between items-center z-30 relative shrink-0">
        <div className="flex flex-col">
          <h1 className="font-[900] text-2xl tracking-tight leading-none text-slate-800 flex items-center gap-2">
            {t.title.replace('💎', '')} <span className="text-indigo-600">💎</span>
          </h1>
          <span className="text-[9px] font-black text-indigo-400/60 uppercase tracking-[0.4em] mt-2">
            {t.subtitle}
          </span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={toggleLang}
            className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/50 backdrop-blur-sm border border-white/50 shadow-sm active:scale-90 transition-all font-black text-[10px] text-indigo-600"
          >
            {lang === 'ru' ? 'RU' : 'KA'}
          </button>
          <button 
            onClick={handleClearCache}
            className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/50 backdrop-blur-sm border border-white/50 shadow-sm active:scale-90 transition-all"
          >
            <span className="text-xs">🔄</span>
          </button>
        </div>
      </header>
      
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative scroll-smooth">
        <div className="px-6 pb-24">
          {children}
        </div>
      </main>
      
      <footer className="px-8 py-4 text-center z-10">
        <div 
          className="inline-block opacity-30 text-[8px] font-black uppercase tracking-[0.5em] cursor-pointer hover:opacity-100 transition-opacity"
          onClick={() => setShowBuild(!showBuild)}
        >
          Psychology Lab • {lang.toUpperCase()}
        </div>
      </footer>
    </div>
  );
};
