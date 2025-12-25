
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
                <span className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-widest leading-none">MODULE</span>
                <span className="text-[11px] font-black text-indigo-600 uppercase tracking-widest leading-none mt-1">
                  {isCalibration ? 'CALIBRATION' : t.domains[activeModule]}
                </span>
             </div>
         </div>
      </div>
      
      {/* ADAPTIVE PROGRESS BAR */}
      <AdaptiveProgressBar 
        clarity={adaptiveState.clarity} 
        isAdaptive={isAdaptive} 
        contradictionsCount={adaptiveState.contradictions.length} 
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
            <p className="text-[10px] text-slate-400 font-medium leading-relaxed relative z-10">
                {t.global.calib_desc}
            </p>
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
      </div>
    </div>
  );
});

interface BodySyncViewProps {
  t: Translations;
  onSync: (sensation: string) => void;
}

export const BodySyncView = memo<BodySyncViewProps>(({ t, onSync }) => {
  return (
     <div className="py-10 text-center px-4 space-y-8 animate-in h-full flex flex-col justify-center bg-gradient-to-b from-white to-slate-50 relative overflow-hidden">
        {/* BREATHING WAVE BACKGROUND */}
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
             <span className="text-[8px] font-mono uppercase tracking-widest text-indigo-500/70">UPLINK</span>
             
             <svg className="absolute inset-0 w-full h-full animate-spin-slow opacity-30" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="46" fill="none" stroke="#6366f1" strokeWidth="1" strokeDasharray="4 6" />
             </svg>
           </div>
        </div>

        <div className="space-y-4 max-w-xs mx-auto relative z-10">
           <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500 border-b border-indigo-100 pb-2 inline-block">{t.sync.title}</h3>
           <p className="text-xl font-bold text-slate-800 leading-tight">{t.sync.desc}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-3 w-full max-w-sm mx-auto relative z-10">
           <button onClick={() => onSync('s0')} className="col-span-2 p-4 bg-white border-2 border-slate-100 rounded-2xl shadow-sm text-[10px] font-black uppercase tracking-widest active:bg-slate-100 text-slate-400 transition-all hover:border-slate-300">
              {t.sync.s0}
           </button>
           {(['s1', 's2', 's3', 's4'] as const).map(s => (
             <button key={s} onClick={() => onSync(s)} className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm text-[10px] font-black uppercase tracking-widest active:bg-indigo-600 active:text-white active:border-indigo-600 active:scale-95 transition-all hover:border-indigo-300 text-indigo-900">
                {t.sync[s]} 
             </button>
           ))}
        </div>
     </div>
  );
});

export const ReflectionView = memo<{t: Translations, sensation: string | undefined}>(({ t, sensation }) => {
  const feedback = sensation ? t.sensation_feedback[sensation] : t.sync.processing;
  
  return (
    <div className="flex flex-col items-center justify-center h-full space-y-8 animate-in px-8 text-center bg-slate-50">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center font-mono text-xs font-bold text-indigo-300">
            Scanning
        </div>
      </div>
      
      <div className="space-y-4 bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 w-full">
         <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse">SYNC_UPLINK_ACTIVE</p>
         <h3 className="text-xl font-black italic text-slate-800 uppercase leading-tight">{feedback}</h3>
      </div>
    </div>
  );
});
