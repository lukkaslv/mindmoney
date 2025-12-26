
import React, { memo } from 'react';
import { DomainType, Translations, Choice, Scene, AdaptiveState } from '../../types';
import { DOMAIN_SETTINGS, ONBOARDING_NODES_COUNT } from '../../constants';
import { AdaptiveProgressBar } from '../AdaptiveProgressBar';

// --- COMPONENTS ---

interface TestViewProps {
  t: Translations;
  activeModule: DomainType;
  currentId: string;
  scene: Scene;
  onChoice: (c: Choice) => void;
  onExit: () => void;
  getSceneText: (path: string) => string;
  adaptiveState: AdaptiveState;
}

export const TestView = memo<TestViewProps>(({ t, activeModule, currentId, scene, onChoice, onExit, getSceneText, adaptiveState }) => {
  const numericId = parseInt(currentId);
  const isCalibration = numericId < 3;
  const isAdaptive = adaptiveState.clarity > 20;

  // DETERMINISTIC SYSTEM COMMENTARY
  const showComment = numericId > 0 && (numericId % 7 === 0 || numericId % 11 === 0);
  const commentIndex = (numericId * 3) % t.system_commentary.length;
  const comment = t.system_commentary[commentIndex];

  return (
    <div className="space-y-8 py-8 px-4 animate-in flex flex-col h-full">
      {/* HEADER */}
      <div className="flex justify-between items-center shrink-0">
         <div className="flex items-center gap-3">
             <button onClick={onExit} className="w-10 h-10 flex items-center justify-center bg-slate-100 rounded-full text-slate-500 font-black text-sm hover:bg-slate-200 transition-colors active:scale-90">✕</button>
             <div className="flex flex-col">
                <span className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-widest leading-none">{t.ui.module_label}</span>
                <span className="text-[11px] font-black text-indigo-600 uppercase tracking-widest leading-none mt-1">
                  {isCalibration ? t.global.calibrating : t.domains[activeModule]}
                </span>
             </div>
         </div>
      </div>
      
      {/* ADAPTIVE PROGRESS BAR */}
      <AdaptiveProgressBar 
        clarity={adaptiveState.clarity} 
        isAdaptive={isAdaptive} 
        contradictionsCount={adaptiveState.contradictions.length} 
        confidenceScore={adaptiveState.confidenceScore}
      />

      {/* CALIBRATION MODE VISUAL */}
      {isCalibration && (
        <div className="bg-slate-900 p-6 rounded-[2rem] border border-indigo-500/30 space-y-3 relative overflow-hidden group">
            <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full animate-pulse flex items-center justify-center">
                    <div className="w-[200%] h-[1px] bg-indigo-400 rotate-45 transform translate-y-[-50%] animate-spin-slow"></div>
                </div>
            </div>
            <div className="flex items-center gap-3 relative z-10">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center animate-ping">
                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                </div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400">{t.global.calibrating}</h4>
            </div>
            <div className="text-[10px] text-slate-400 font-medium leading-relaxed relative z-10">
                {t.global.calib_desc}
            </div>
        </div>
      )}

      {/* SYSTEM LOG MESSAGE */}
      {showComment && !isCalibration && (
        <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50 animate-pulse flex items-center gap-3 shrink-0">
            <span className="text-lg">📡</span>
            <p className="text-[10px] font-mono font-black text-indigo-600 uppercase tracking-wider leading-tight">
                {comment}
            </p>
        </div>
      )}
      
      {/* SCENE CONTENT */}
      <div className="flex-1 flex flex-col justify-center space-y-6">
        <h3 className="text-2xl font-black uppercase text-slate-900 leading-tight tracking-tight">
            {getSceneText(scene.titleKey)}
        </h3>
        
        <div className="bg-white p-6 rounded-[2rem] text-slate-600 font-medium border border-slate-100 shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-6 opacity-5 text-indigo-500 text-6xl font-black select-none pointer-events-none">?</div>
             <p className="relative z-10 text-lg leading-relaxed text-justify hyphens-auto">
                {getSceneText(scene.descKey)}
             </p>
        </div>
      </div>

      {/* CHOICES */}
      <div className="space-y-3 shrink-0 pb-6">
        {scene.choices.map((c, i) => (
          <button key={c.id} onClick={() => onChoice(c)} className="w-full p-5 text-left bg-white border border-slate-200 rounded-[1.5rem] shadow-sm font-bold text-xs uppercase flex items-center gap-4 active:scale-[0.98] active:bg-indigo-50 active:border-indigo-200 transition-all group">
            <span className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 font-mono text-[10px] group-hover:bg-indigo-500 group-hover:text-white transition-colors">0{i+1}</span>
            <span className="flex-1 text-slate-700 leading-snug group-hover:text-indigo-900 transition-colors">{getSceneText(c.textKey)}</span>
            <span className="opacity-0 group-hover:opacity-100 text-indigo-500 transition-opacity">➜</span>
          </button>
        ))}
        <button 
            onClick={() => onChoice({ id: `${currentId}_skip`, textKey: '', beliefKey: 'default', position: -1 })}
            className="w-full p-4 text-center bg-slate-100 border border-slate-200 rounded-[1.5rem] shadow-sm font-bold text-xs uppercase text-slate-500 active:scale-[0.98] transition-all hover:border-slate-300"
        >
            {t.ui.skip_button}
        </button>
      </div>
    </div>
  );
});

interface BodySyncViewProps {
  lang: 'ru' | 'ka';
  t: Translations;
  onSync: (sensation: string) => void;
}

export const BodySyncView = memo<BodySyncViewProps>(({ lang, t, onSync }) => {
  return (
     <div className="py-10 text-center px-4 space-y-8 animate-in h-full flex flex-col justify-center bg-gradient-to-b from-white to-slate-50 relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
           <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-indigo-500 animate-pulse-slow" />
              <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-indigo-500 animate-pulse-slow" style={{ animationDelay: '1s' }} />
              <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-indigo-500 animate-pulse-slow" style={{ animationDelay: '2s' }} />
           </svg>
        </div>

        <div className="relative w-40 h-40 mx-auto flex items-center justify-center z-10">
           <div className="absolute inset-0 bg-indigo-500/5 rounded-full animate-pulse-slow"></div>
           <div className="absolute inset-8 bg-indigo-500/10 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
           
           <div className="w-28 h-28 rounded-full bg-slate-950 flex flex-col items-center justify-center text-indigo-400 border-4 border-slate-100 shadow-2xl z-10 relative overflow-hidden">
             <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvc3ZnPg==')] opacity-20"></div>
             <span className="text-3xl mb-1 animate-pulse">📡</span>
             <span className="text-[8px] font-mono uppercase tracking-widest text-indigo-400/70">{lang === 'ka' ? 'კავშირი' : 'UPLINK'}</span>
             
             <svg className="absolute inset-0 w-full h-full animate-spin-slow opacity-30" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="5,5" />
             </svg>
           </div>
        </div>

        <div className="space-y-2 z-10">
           <h3 className="text-xl font-black uppercase text-slate-900 tracking-tight">{t.sync.title}</h3>
           <p className="text-sm text-slate-500 font-medium leading-relaxed italic">{t.sync.desc}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 z-10 px-2">
           {['s0', 's1', 's2', 's3', 's4'].map((s) => (
              <button 
                key={s} 
                onClick={() => onSync(s)}
                className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm font-bold text-[10px] uppercase hover:border-indigo-500 transition-all active:scale-95 text-slate-700"
              >
                 {t.sync[s as keyof typeof t.sync]}
              </button>
           ))}
        </div>
        
        <p className="text-[10px] text-slate-400 font-medium italic z-10">{t.sync.guidance_tip}</p>
     </div>
  );
});

interface ReflectionViewProps {
  lang: 'ru' | 'ka';
  t: Translations;
  sensation: string | undefined;
}

export const ReflectionView = memo<ReflectionViewProps>(({ lang, t, sensation }) => {
  const feedbackKey = (sensation || 's0') as keyof typeof t.sensation_feedback;
  const message = t.sensation_feedback[feedbackKey] || t.sensation_feedback.s0;

  return (
    <div className="h-full flex flex-col items-center justify-center space-y-8 animate-in px-6 text-center py-20 bg-white">
       <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center text-3xl shadow-inner border border-indigo-100/50">
         {sensation === 's1' ? '🧱' : sensation === 's2' ? '🔥' : sensation === 's3' ? '❄️' : sensation === 's4' ? '🫨' : '✅'}
       </div>
       <div className="space-y-2">
         <h3 className="text-xl font-black uppercase text-slate-900 tracking-tight">{message}</h3>
         <p className="text-sm text-slate-500 font-medium leading-relaxed italic">{t.sync.processing}</p>
       </div>
       <div className="w-32 h-1 bg-slate-100 rounded-full overflow-hidden">
         <div className="h-full bg-indigo-500 animate-pulse"></div>
       </div>
    </div>
  );
});
