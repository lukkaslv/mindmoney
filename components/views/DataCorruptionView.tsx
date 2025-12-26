import React from 'react';
import { Translations } from '../../types';
import { PlatformBridge } from '../../utils/helpers';

interface DataCorruptionViewProps {
  t: Translations;
  onReset: () => void;
}

export const DataCorruptionView: React.FC<DataCorruptionViewProps> = ({ t, onReset }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full space-y-8 animate-in px-4 text-center bg-red-50">
      <div className="w-24 h-24 bg-red-100 rounded-3xl flex items-center justify-center text-5xl shadow-inner border border-red-200/50 animate-pulse">
        ⚠️
      </div>
      <div className="space-y-4 max-w-sm">
        <h2 className="text-2xl font-black uppercase tracking-tight text-red-900 leading-tight italic">
          Ошибка Целостности Данных
        </h2>
        <p className="text-sm font-medium text-red-700 leading-relaxed">
          К сожалению, данные вашей текущей сессии были повреждены и не могут быть загружены. Это редкая ошибка, которая может произойти при неожиданном закрытии приложения.
        </p>
        <p className="text-xs font-bold text-red-500">
          Для продолжения необходимо сбросить сессию. Ваш предыдущий сохраненный прогресс (если он был) не будет затронут.
        </p>
      </div>
      <button
        onClick={() => {
          PlatformBridge.haptic.notification('warning');
          // We don't need a confirm dialog here as it's the only option.
          onReset();
        }}
        className="w-full max-w-xs py-5 bg-red-600 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all"
      >
        Сбросить и начать заново
      </button>
    </div>
  );
};
