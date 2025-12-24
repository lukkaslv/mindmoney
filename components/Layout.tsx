
import React from 'react';
import { translations } from '../translations.ts';

interface LayoutProps {
  children: React.ReactNode;
  lang?: 'ru' | 'ka';
}

export const Layout: React.FC<LayoutProps> = ({ children, lang = 'ru' }) => {
  const t = translations[lang];
  
  // Маркер версии
  const BUILD_ID = "v1.0.7-CRITICAL-FIX";

  const handleClearCache = () => {
    if (confirm("Очистить данные сессии и начать заново?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="flex-1 flex flex-col max-w-md mx-auto w-full relative h-full">
      <header className="px-6 py-4 flex justify-between items-center z-30 glass-panel border-b shrink-0">
        <div className="flex flex-col">
          <h1 className="font-black text-xl tracking-tight leading-none text-indigo-600">
            {t.title}
          </h1>
          <span className="text-[10px] font-bold opacity-50 uppercase tracking-[0.2em] mt-1">
            {t.subtitle}
          </span>
        </div>
        <button 
          onClick={handleClearCache}
          className="h-8 px-3 rounded-full bg-slate-50 border border-slate-100 text-[8px] font-black uppercase tracking-wider text-slate-400 active:bg-slate-200 transition-colors"
        >
          Reset
        </button>
      </header>
      
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
        <div className="p-6 pb-24">
          {children}
        </div>
      </main>
      
      <footer className="absolute bottom-4 left-0 right-0 text-center pointer-events-none z-0">
        <div className="opacity-20 text-[9px] font-black uppercase tracking-[0.3em]">
          Money Psychology Lab • {lang.toUpperCase()}
        </div>
        <div className="opacity-10 text-[7px] font-mono mt-1 uppercase">
          Build ID: {BUILD_ID}
        </div>
      </footer>
    </div>
  );
};
