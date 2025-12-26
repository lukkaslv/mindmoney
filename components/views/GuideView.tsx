
import React, { useState } from 'react';
import { Translations } from '../../types';
import { PlatformBridge } from '../../utils/helpers';

interface GuideViewProps {
  t: Translations;
  onBack: () => void;
}

type GuideMode = 'client' | 'pro';

export const GuideView: React.FC<GuideViewProps> = ({ t, onBack }) => {
  const [mode, setMode] = useState<GuideMode>('client');
  const content = mode === 'client' ? t.guide : t.pro_guide;

  return (
    <section className="space-y-6 animate-in py-4 flex flex-col h-full bg-slate-50">
        {/* HEADER */}
        <div className="flex justify-between items-center px-4 pb-4 border-b border-indigo-100/50 sticky top-0 bg-slate-50/95 backdrop-blur-md z-20 pt-2">
            <button 
                onClick={() => {
                    onBack();
                    PlatformBridge.haptic.impact('light');
                }} 
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl text-[10px] font-black uppercase text-slate-600 active:scale-95 transition-all shadow-sm border border-slate-200"
            >
                ← {t.global.back}
            </button>
            <div className="flex flex-col items-end">
                 <span className="text-[10px] font-mono text-indigo-600 font-black tracking-widest">{content.title}</span>
                 <span className="text-[7px] font-mono text-slate-400 uppercase">{content.subtitle}</span>
            </div>
        </div>

        {/* MODE TOGGLE */}
        <div className="px-4">
            <div className="bg-white p-1 rounded-xl flex shadow-sm border border-slate-200">
                <button 
                    onClick={() => { setMode('client'); PlatformBridge.haptic.impact('light'); }}
                    className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${mode === 'client' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    {t.ui.mode_client}
                </button>
                <button 
                    onClick={() => { setMode('pro'); PlatformBridge.haptic.impact('light'); }}
                    className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${mode === 'pro' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    {t.ui.mode_pro}
                </button>
            </div>
        </div>

        <div className="space-y-8 px-4 pb-20 overflow-y-auto">
            {/* INTRO DISCLAIMER - ONLY FOR CLIENTS */}
            {mode === 'client' && (
                <div className="bg-indigo-50/50 border border-indigo-100 p-6 rounded-[2rem] space-y-3">
                     <div className="flex items-center gap-3">
                         <span className="text-xl">🩺</span>
                         <h3 className="text-[10px] font-black uppercase text-indigo-900 tracking-widest">{t.results.disclaimer_title}</h3>
                     </div>
                     <p className="text-[11px] font-medium text-indigo-800 leading-relaxed italic">
                         {t.results.disclaimer_body}
                     </p>
                </div>
            )}

            {/* SECTIONS */}
            <div className="space-y-8">
                {content.sections.map((section, idx) => (
                    <div key={idx} className="space-y-4">
                        <h4 className={`text-sm font-black uppercase tracking-tight border-l-4 pl-4 py-1 ${mode === 'pro' ? 'text-indigo-900 border-indigo-600' : 'text-slate-900 border-indigo-400'}`}>
                            {section.title}
                        </h4>
                        <ul className="space-y-3 pl-2">
                            {section.content.map((point, pIdx) => (
                                <li key={pIdx} className="text-[11px] leading-relaxed text-slate-600 font-medium relative pl-4">
                                    <span className={`absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full ${mode === 'pro' ? 'bg-indigo-400' : 'bg-slate-300'}`}></span>
                                    {point}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            {/* CLOSING METAPHOR / NOTE */}
            <div className={`p-8 rounded-[2rem] relative overflow-hidden shadow-2xl ${mode === 'pro' ? 'bg-indigo-900 text-white' : 'bg-slate-900 text-white'}`}>
                 <div className="absolute top-0 right-0 p-6 opacity-10 text-6xl">{mode === 'pro' ? '⚡' : '🧭'}</div>
                 <p className="relative z-10 text-lg font-black uppercase italic leading-tight tracking-tight text-center">
                     "{mode === 'client' ? (content as any).metaphor : (content as any).closing}"
                 </p>
            </div>
        </div>
    </section>
  );
};
