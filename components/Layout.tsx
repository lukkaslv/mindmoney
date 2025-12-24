
import React from 'react';
import { translations } from '../translations';

interface LayoutProps {
  children: React.ReactNode;
  lang?: 'ru' | 'ka';
}

export const Layout: React.FC<LayoutProps> = ({ children, lang = 'ru' }) => {
  const t = translations[lang];
  
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
        <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]" />
      </header>
      
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
        <div className="p-6 pb-24"> {/* Отступ снизу для кнопок */}
          {children}
        </div>
      </main>
      
      <footer className="absolute bottom-4 left-0 right-0 text-center pointer-events-none opacity-20 text-[9px] font-bold uppercase tracking-[0.3em] z-0">
        Money Psychology Lab • {lang.toUpperCase()}
      </footer>
    </div>
  );
};
