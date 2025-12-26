
import React from 'react';
import { Translations, PatternFlags } from '../../types';
import { PlatformBridge } from '../../utils/helpers';

interface InvalidResultsViewProps {
  t: Translations;
  onReset: () => void;
  patternFlags: PatternFlags;
}

export const InvalidResultsView: React.FC<InvalidResultsViewProps> = ({ t, onReset, patternFlags }) => {
  const content = t.invalid_results;
  
  let reason = "";
  if (patternFlags.isMonotonic) {
      reason = content.reason_monotonic;
  } else if (patternFlags.isHighSkipRate) {
      reason = content.reason_skip;
  } else if (patternFlags.isFlatline) {
      reason = content.reason_flatline;
  } else if (patternFlags.isRoboticTiming) {
      reason = content.reason_robotic;
  } else if (patternFlags.isSomaticMonotony) {
      reason = content.reason_somatic;
  } else if (patternFlags.isEarlyTermination) {
      reason = content.reason_early_termination;
  }


  return (
    <div className="flex flex-col items-center justify-center h-full space-y-8 animate-in px-4 text-center bg-amber-50">
      <div className="w-24 h-24 bg-amber-100 rounded-3xl flex items-center justify-center text-5xl shadow-inner border border-amber-200/50 animate-pulse">
        <span className="animate-shake">⚠️</span>
      </div>
      <div className="space-y-4 max-w-sm">
        <h2 className="text-2xl font-black uppercase tracking-tight text-amber-900 leading-tight italic">
          {content.title}
        </h2>
        <p className="text-sm font-medium text-amber-800 leading-relaxed">
          {content.message}
        </p>
        
        {reason && (
            <div className="bg-white p-4 rounded-xl border border-amber-200 mt-4">
                <p className="text-xs font-bold text-amber-700">
                    {reason}
                </p>
            </div>
        )}

        <p className="text-xs font-medium text-slate-500 pt-4">
            {content.recommendation}
        </p>
      </div>
      <button
        onClick={() => {
          PlatformBridge.haptic.notification('warning');
          onReset();
        }}
        className="w-full max-w-xs py-5 bg-slate-800 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all"
      >
        {content.reset_button}
      </button>
    </div>
  );
};