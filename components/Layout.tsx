
import React, { useState } from 'react';
import { translations } from '../translations.ts';

interface LayoutProps {
  children: React.ReactNode;
  lang?: 'ru' | 'ka';
}

export const Layout: React.FC<LayoutProps> = ({ children, lang = 'ru' }) => {
  const t = translations[lang];
  const BUILD_ID = "v1.0.9-POLISHED";
  const [showBuild, setShowBuild] = useState(false);

  const handleClearCache = () => {
    window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('warning');
    if (confirm("ВНИМАНИЕ: Это полностью очистит сессию. Продолжить?")) {
      try {
        localStorage.clear();
        window.location.href = window.location.href.split('?')[0] + '?t=' + new Date().getTime();
      } catch (e) {
        window.location.reload();
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col max-w-md mx-auto w-full relative h-full bg-slate-50/30">
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
          className="h-8 px-3 rounded-full bg-white border border-slate-100 text-[8px] font-black uppercase tracking-wider text-slate-400 active:bg-slate-100 transition-colors shadow-sm"
        >
          Reset
        </button>
      </header>
      
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
        <div className="p-6 pb-24">
          {children}
        </div>
      </main>
      
      <footer 
        className="absolute bottom-4 left-0 right-0 text-center z-0"
        onClick={() => setShowBuild(!showBuild)}
      >
        <div className="opacity-20 text-[9px] font-bold uppercase tracking-[0.3em] cursor-pointer">
          Psychology Lab • {lang.toUpperCase()}
        </div>
        {showBuild && (
          <div className="opacity-40 text-[7px] font-mono mt-1 uppercase text-indigo-500 font-bold">
            Build: {BUILD_ID}
          </div>
        )}
      </footer>
    </div>
  );
};
