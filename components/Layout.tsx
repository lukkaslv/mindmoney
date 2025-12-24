
import React from 'react';
import { translations } from '../translations.ts';

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
}

export const Layout: React.FC<LayoutProps> = ({ children, lang, onLangChange }) => {
  const t = translations[lang];

  const handleClearCache = () => {
    window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.('warning');
    if (confirm(lang === 'ru' ? "Сбросить текущую сессию?" : "გსურთ სესიის გადატვირთვა?")) {
      localStorage.removeItem('session_auth');
      localStorage.removeItem('completed_node_ids');
      localStorage.removeItem('global_progress');
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
            Sulava Lab <span className="text-indigo-600 text-xl">⚡</span>
          </h1>
          <span className="text-[10px] font-black text-indigo-400/80 uppercase tracking-[0.4em] mt-2">
            {t.subtitle}
          </span>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={toggleLang}
            className="w-11 h-11 flex items-center justify-center rounded-2xl bg-white border border-slate-100 shadow-sm active:scale-90 transition-all font-black text-[11px] text-slate-800"
          >
            {lang === 'ru' ? 'RU' : 'KA'}
          </button>
          <button 
            onClick={handleClearCache}
            className="w-11 h-11 flex items-center justify-center rounded-2xl bg-white border border-slate-100 shadow-sm active:scale-90 transition-all text-lg"
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
        <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.5em]">Genesis OS v4</span>
        <button onClick={logout} className="text-[9px] font-black text-red-300 uppercase tracking-widest hover:text-red-500 transition-colors">Terminate_Session</button>
      </footer>
    </div>
  );
};
