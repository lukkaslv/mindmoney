
import React, { useState, memo, useCallback, useMemo } from 'react';
import { AnalysisResult, Translations, AdaptiveState, ScanHistory, BeliefKey } from '../../types';
import { StorageService, STORAGE_KEYS } from '../../services/storageService';
import { PlatformBridge } from '../../utils/helpers';
import { generateClinicalNarrative } from '../../services/clinicalNarratives';
import { EvolutionDashboard } from '../EvolutionDashboard';

interface ResultsViewProps {
  t: Translations;
  result: AnalysisResult;
  isGlitchMode: boolean;
  onContinue: () => void;
  onShare: () => void;
  onBack: () => void;
  getSceneText: (path: string) => string;
  adaptiveState: AdaptiveState;
  onOpenBriefExplainer: () => void;
}

const DeltaBadge = ({ current, previous, inverse = false }: { current: number, previous: number | undefined, inverse?: boolean }) => {
    if (previous === undefined) return null;
    const diff = current - previous;
    if (Math.abs(diff) < 2) return null; 

    const isPositive = diff > 0;
    const isGood = inverse ? !isPositive : isPositive;
    const symbol = isPositive ? '↑' : '↓';
    
    return (
        <span className={`text-[9px] font-black ml-2 px-1.5 py-0.5 rounded ${isGood ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
            {symbol} {Math.abs(Math.round(diff))}%
        </span>
    );
};

const SignalDecoderItem: React.FC<{ item: any, t: Translations }> = ({ item, t }) => {
    const isResistance = item.type === 'resistance';
    return (
        <div className={`p-4 rounded-2xl border flex items-center justify-between ${isResistance ? 'bg-amber-50 border-amber-100' : 'bg-indigo-50 border-indigo-100'}`}>
            <div className="flex items-center gap-3">
                <span className="text-xl">{isResistance ? '🐢' : '⚡'}</span>
                <div>
                    <span className={`text-[8px] font-black uppercase tracking-widest block ${isResistance ? 'text-amber-500' : 'text-indigo-500'}`}>
                        {isResistance ? t.results.signal_resistance : t.results.signal_resonance}
                    </span>
                    <span className="text-[10px] font-bold text-slate-800 leading-tight block">
                       {t.beliefs[item.descriptionKey.replace('correlation_resistance_', '').replace('correlation_resonance_', '') as keyof typeof t.beliefs] || 'Unknown Pattern'}
                    </span>
                </div>
            </div>
            <span className={`text-[9px] font-mono font-bold ${isResistance ? 'text-amber-700' : 'text-indigo-700'}`}>
                {isResistance ? '> 5s' : 'SYNC'}
            </span>
        </div>
    );
};

const PatternCard: React.FC<{ beliefKey: BeliefKey, t: Translations }> = ({ beliefKey, t }) => {
    const [isOpen, setIsOpen] = useState(false);
    const data = t.pattern_library[beliefKey] || t.pattern_library.default;
    const label = t.beliefs[beliefKey];

    const toggle = () => {
        PlatformBridge.haptic.selection();
        setIsOpen(!isOpen);
    };

    return (
        <div 
            onClick={toggle}
            className={`border rounded-2xl transition-all duration-300 overflow-hidden cursor-pointer ${isOpen ? 'bg-slate-900 border-slate-800 shadow-2xl scale-[1.02]' : 'bg-white border-slate-200 shadow-sm hover:border-indigo-300'}`}
        >
            <div className="p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black transition-colors ${isOpen ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        {isOpen ? '🔓' : '🔒'}
                    </div>
                    <span className={`text-[11px] font-black uppercase tracking-tight ${isOpen ? 'text-white' : 'text-slate-800'}`}>
                        {label}
                    </span>
                </div>
                <span className={`text-xl transition-transform duration-300 ${isOpen ? 'rotate-180 text-indigo-400' : 'text-slate-300'}`}>
                    ▼
                </span>
            </div>

            {isOpen && (
                <div className="px-5 pb-5 pt-1 space-y-4 animate-in">
                    <div className="h-px bg-slate-800 w-full mb-3"></div>
                    
                    <div className="space-y-1">
                        <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400 block">{t.results.protection_label}</span>
                        <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                            {data.protection}
                        </p>
                    </div>

                    <div className="space-y-1">
                        <span className="text-[9px] font-black uppercase tracking-widest text-amber-500 block">{t.results.cost_label}</span>
                        <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                            {data.cost}
                        </p>
                    </div>

                    <div className="bg-emerald-900/20 p-3 rounded-xl border border-emerald-500/20 mt-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 block mb-1">{t.results.antidote_label}</span>
                        <p className="text-[11px] text-emerald-100 leading-relaxed italic">
                            "{data.antidote}"
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export const ResultsView = memo<ResultsViewProps>(({ 
  t, result, isGlitchMode, onContinue, onShare, onBack, getSceneText, onOpenBriefExplainer
}) => {
  const [showPrep, setShowPrep] = useState(false);
  const [activeMetricHelp, setActiveMetricHelp] = useState<string | null>(null);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showBrief, setShowBrief] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<number[]>(() => StorageService.load<number[]>(STORAGE_KEYS.ROADMAP_STATE, []));

  const currentLang = t.subtitle.includes('LUKA') && t.onboarding.title.includes('ნავიგატორი') ? 'ka' : 'ru';
  
  const narrative = useMemo(() => generateClinicalNarrative(result, currentLang), [result, currentLang]);
  const clientBrief = narrative.level1;

  const history: ScanHistory = useMemo(() => StorageService.getScanHistory(), []);
  
  const previousScan = useMemo(() => {
      if (history.scans.length < 2) return undefined;
      const existingIndex = history.scans.findIndex(s => s.timestamp === result.timestamp);
      if (existingIndex > 0) return history.scans[existingIndex - 1];
      if (existingIndex === -1 && history.scans.length > 0) return history.scans[history.scans.length - 1];
      return undefined;
  }, [history, result]);

  const archetype = t.archetypes[result.archetypeKey];
  const verdict = t.verdicts[result.verdictKey];

  const toggleTask = useCallback((day: number) => {
    PlatformBridge.haptic.impact('light');
    setCompletedTasks(prev => {
        const next = prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day];
        StorageService.save(STORAGE_KEYS.ROADMAP_STATE, next);
        return next;
    });
  }, []);

  const briefText = useMemo(() => `
Genesis OS // CLINICAL REFERRAL
-------------------------------
CLIENT ID: ${result.shareCode}
ARCHETYPE: ${archetype.title}
VALIDITY: ${result.validity}

METRICS [FARE]:
- Foundation: ${Math.round(result.state.foundation)}
- Agency: ${Math.round(result.state.agency)}
- Resource: ${Math.round(result.state.resource)}
- Entropy: ${Math.round(result.state.entropy)}

SOMATIC SYNC: ${result.neuroSync}% ${result.flags?.isAlexithymiaDetected ? '(UNRELIABLE)' : ''}
DIAGNOSED PATTERN: ${verdict?.label.toUpperCase()}

ACTIVE BELIEFS:
${result.activePatterns.map(p => `• ${t.beliefs[p]}`).join('\n')}
  `.trim(), [result, t, archetype, verdict]);

  const handleCopyBrief = useCallback(() => {
      navigator.clipboard.writeText(briefText);
      setCopied(true);
      PlatformBridge.haptic.notification('success');
      setTimeout(() => setCopied(false), 3000);
  }, [briefText]);

  const sessionPrepQuestions = useMemo(() => {
      const qs = [
          "В какие моменты задержка реакции казалась вам оправданной?", 
          `Обсудите с психологом динамику узла: ${t.conflicts[result.coreConflict as keyof typeof t.conflicts] || result.coreConflict}`,
          "Где телесный отклик 'сжатия' мешает вашему росту прямо сейчас?"
      ];

      if (result.flags?.isSocialDesirabilityBiasDetected) {
          qs.push("Клиент демонстрировал паттерн 'быстрых правильных ответов'. Чувствовали ли вы необходимость отвечать так, как 'должны', а не так, как чувствуете на самом деле?");
      }

      return qs;
  }, [result, t]);


  if (!disclaimerAccepted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-in px-4 text-center">
         <div className="w-16 h-16 bg-indigo-50 rounded-3xl flex items-center justify-center text-3xl shadow-inner border border-indigo-100/50 animate-pulse">⚖️</div>
         <div className="space-y-4 max-w-sm">
            <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 leading-tight italic">
                {t.results.disclaimer_title}
            </h2>
            <p className="text-sm font-medium text-slate-500 leading-relaxed italic">
                {t.results.disclaimer_body}
            </p>
         </div>
         <button 
           onClick={() => {
             setDisclaimerAccepted(true);
             PlatformBridge.haptic.notification('success');
           }}
           className="w-full max-w-xs py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all"
         >
            СОГЛАСЕН С УСЛОВИЯМИ
         </button>
      </div>
    );
  }

  return (
    <div className={`space-y-10 pb-32 animate-in px-1 pt-2 font-sans ${isGlitchMode ? 'glitch' : ''}`}>
      
      {/* 1. CLINICAL SAFETY WARNINGS (Priority) */}
      {(result.warnings || []).map((w, i) => (
          <div key={i} className={`p-5 rounded-[2rem] space-y-2 shadow-sm border ${w.severity === 'HIGH' ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-blue-50 border-blue-200 text-blue-900'}`}>
              <div className="flex items-center gap-2">
                  <span className="text-lg">{w.severity === 'HIGH' ? '⚠️' : 'ℹ️'}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest">{w.type.replace('_', ' ')}</span>
              </div>
              <p className="text-[10px] font-medium leading-relaxed opacity-90">
                  {t.safety[w.messageKey as keyof typeof t.safety] || w.messageKey}
              </p>
          </div>
      ))}

      {/* 2. LEVEL 1: CLIENT BRIEF */}
      <section className="bg-white border border-slate-100 p-6 rounded-[2.5rem] space-y-4 shadow-sm relative overflow-hidden">
          <div className={`absolute top-0 left-0 w-full h-1 ${clientBrief.tone === 'alert' ? 'bg-amber-400' : 'bg-indigo-400'}`}></div>
          
          <div className="flex justify-between items-start">
              <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Status</span>
                  <h3 className="text-lg font-black uppercase text-slate-900 leading-tight">{clientBrief.statusTag}</h3>
              </div>
              {clientBrief.tone === 'alert' && <span className="text-xl">🛡️</span>}
          </div>

          <p className="text-sm font-medium text-slate-600 leading-relaxed">
              {clientBrief.summary}
          </p>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="text-[8px] font-black uppercase tracking-widest text-indigo-400 block mb-1">Вопрос для размышления</span>
              <p className="text-[11px] font-bold text-slate-800 italic">"{clientBrief.focusQuestion}"</p>
          </div>
          
          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
            <p className="text-[9px] text-indigo-700 leading-snug">
              ⚠️ Это краткая версия. <strong>Полный клинический отчёт доступен вашему психологу.</strong>
            </p>
          </div>
      </section>

      {/* IMPORTANT CONTEXT (For Low Foundation) */}
      {result.state.foundation < 35 && (
          <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-[2rem] space-y-2">
              <h3 className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">
                  {t.safety.important_context_title}
              </h3>
              <p className="text-[11px] font-medium text-indigo-900 leading-relaxed italic">
                  {t.safety.important_context_body}
              </p>
          </div>
      )}

      <header className="dark-glass-card p-8 rounded-[2.5rem] shadow-2xl space-y-6 relative overflow-hidden border-b-4 border-indigo-500/30">
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="relative z-10 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-indigo-400 border-indigo-500/20 uppercase tracking-[0.4em] bg-white/5 px-3 py-1.5 rounded-full border">
                  {t.results.blueprint_title}
              </span>
              <div className="flex flex-col items-end">
                  <span className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-tighter">Signal Confidence</span>
                  <span className={`text-[10px] font-mono font-bold ${result.confidenceScore > 80 ? 'text-emerald-400' : result.confidenceScore > 50 ? 'text-amber-400' : 'text-red-400'}`}>
                    {result.confidenceScore}%
                  </span>
              </div>
            </div>
            <div className="space-y-1">
              <h1 className="text-4xl font-black italic uppercase text-white leading-none tracking-tighter drop-shadow-lg">
                  {archetype.title}
              </h1>
              <p className="text-sm text-slate-400 font-medium leading-relaxed opacity-85 pt-2 border-l-2 border-indigo-500/50 pl-4">
                  {archetype.desc}
              </p>
            </div>
        </div>
      </header>

      {/* NEW: INTERACTIVE PATTERN CARDS */}
      {(result.activePatterns && result.activePatterns.length > 0) && (
          <section className="space-y-4">
              <div className="flex items-center justify-between px-2">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-900">{t.results.active_patterns_title}</h3>
                  <span className="text-[8px] font-bold text-indigo-500 animate-pulse">{t.results.tap_to_decode}</span>
              </div>
              <div className="grid grid-cols-1 gap-3">
                  {result.activePatterns.map((patternKey) => (
                      <PatternCard key={patternKey} beliefKey={patternKey} t={t} />
                  ))}
              </div>
          </section>
      )}

      {/* SIGNAL DECODER VISUALIZATION */}
      {(result.correlations && result.correlations.length > 0) && (
          <section className="space-y-4">
              <div className="flex items-center gap-2 px-2">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-900">{t.results.decoder_title}</h3>
                  <span className="text-[8px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-mono font-bold">{result.correlations.length} SIGNALS</span>
              </div>
              <div className="space-y-2">
                  {result.correlations.map((item, idx) => (
                      <SignalDecoderItem key={idx} item={item} t={t} />
                  ))}
              </div>
          </section>
      )}

      {/* EVOLUTION TRACKER */}
      {history.scans.length > 1 && (
        <EvolutionDashboard history={history} />
      )}

      {/* CLINICAL BRIEFING ACTION */}
      <section className="bg-indigo-50 border border-indigo-100 p-6 rounded-[2rem] space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-900">{t.results.clinical_note}</h3>
            <span className="text-[9px] font-mono font-bold text-indigo-400">DATA_SYNC_v3.4</span>
          </div>
          <p className="text-[11px] font-bold text-indigo-800 italic leading-tight">{t.results.clinical_note_desc}</p>
          
          <div className="flex flex-col gap-2">
            <button 
                onClick={handleCopyBrief}
                className={`w-full py-4 rounded-xl border transition-all font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 ${copied ? 'bg-emerald-100 border-emerald-500 text-emerald-700' : 'bg-white border-indigo-200 text-indigo-600 active:scale-95 shadow-sm'}`}
            >
                <span className="text-lg">{copied ? '✅' : '📋'}</span>
                {copied ? t.results.brief_copied : t.results.copy_brief}
            </button>
            
            <button 
                onClick={onOpenBriefExplainer}
                className="w-full py-3 bg-white text-indigo-500 border border-indigo-200 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-50 transition-colors"
            >
                {t.results.how_to_read}
            </button>

            <button 
                onClick={() => setShowBrief(!showBrief)}
                className="w-full py-3 bg-indigo-100 text-indigo-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-200 transition-colors"
            >
                {showBrief ? t.results.brief_hide : t.results.brief_look}
            </button>
          </div>

          <p className="text-[9px] text-center text-indigo-400 opacity-80 font-medium leading-tight px-4">
             {t.results.brief_instruction}
          </p>

          {showBrief && (
            <div className="mt-2 bg-slate-900 rounded-2xl p-5 overflow-hidden relative animate-in border border-slate-800 shadow-xl">
                <div className="absolute top-0 right-0 p-2 text-[8px] font-black text-slate-700 uppercase">ENCRYPTED</div>
                <pre className="text-[10px] font-mono text-emerald-400 whitespace-pre-wrap leading-tight relative z-10 select-all">
                    {briefText}
                </pre>
            </div>
          )}
      </section>

      {/* HYPOTHESIS BLOCK */}
      <section className="bg-slate-50 border border-slate-100 p-8 rounded-[2.5rem] space-y-6 shadow-sm relative overflow-hidden">
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500">
            {t.results.verdict_title}
          </h3>

          <div className="bg-white p-5 rounded-2xl border-l-4 border-indigo-400 shadow-sm">
             <p className="text-[11px] text-indigo-900 leading-relaxed font-medium italic">
                 "{verdict.supportive_context}"
             </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-2xl font-black text-slate-900 uppercase italic leading-none tracking-tight">
              {verdict.label}
            </h4>
            <p className="text-sm font-medium text-slate-700 leading-relaxed italic">
              {verdict.description}
            </p>
          </div>
      </section>

      {/* DATA ORIGINS & LEGEND (WITH DELTAS) */}
      <div className="space-y-6 px-2">
         {[
            { label: t.results.integrity, value: result.integrity, origin: t.results.origin_measured, color: 'bg-emerald-500', key: 'integrity', reliable: true, previous: previousScan?.integrity },
            { 
                label: t.results.neuro_sync, 
                value: result.neuroSync, 
                origin: t.results.origin_reported, 
                color: 'bg-indigo-500', 
                key: 'neuro_sync',
                reliable: result.flags?.isNeuroSyncReliable ?? true,
                previous: previousScan?.neuroSync
            }
         ].map(m => (
            <div key={m.label} className={`space-y-2 ${!m.reliable ? 'opacity-60' : ''}`} onClick={() => setActiveMetricHelp(activeMetricHelp === m.key ? null : m.key)}>
                <div className="flex justify-between items-end cursor-pointer group">
                    <div className="flex flex-col">
                        <span className="origin-label bg-slate-100 text-slate-400">{m.origin}</span>
                        <div className="flex items-center gap-2">
                             <span className="text-[12px] font-black text-slate-800 uppercase tracking-tighter mt-1">{m.label}</span>
                             <span className="text-[10px] text-slate-300 group-hover:text-indigo-500">?</span>
                             {!m.reliable && <span className="text-[10px] animate-pulse">⚠️</span>}
                        </div>
                    </div>
                    <div className="flex items-center">
                        <DeltaBadge current={m.value} previous={m.previous} />
                        <span className="text-lg font-black text-slate-900 ml-2">{m.value}%</span>
                    </div>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                    <div className={`h-full ${m.reliable ? m.color : 'bg-slate-400'} transition-all duration-1000 shadow-sm`} style={{ width: `${m.value}%` }}></div>
                </div>
                
                {activeMetricHelp === m.key && (
                    <div className="bg-slate-50 p-3 rounded-xl text-[10px] text-slate-600 font-medium leading-tight animate-in border border-slate-100">
                        {t.metric_definitions[m.key === 'neuro_sync' ? 'foundation' : 'integrity']}
                        {!m.reliable && <p className="mt-2 text-amber-600 font-bold">{t.safety.somatic_detection_warning}</p>}
                    </div>
                )}
            </div>
         ))}
      </div>

      <div className="grid grid-cols-1 gap-4">
          <section className="bg-indigo-950 p-8 rounded-[2.5rem] border border-white/10 space-y-5 shadow-2xl group">
              <button 
                onClick={() => { setShowPrep(!showPrep); PlatformBridge.haptic.impact('light'); }}
                className="w-full flex justify-between items-center text-left"
              >
                <div className="flex flex-col">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-indigo-400 group-hover:text-white transition-colors">{t.results.session_prep}</h3>
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">{t.results.session_prep_desc}</span>
                </div>
                <span className={`text-white/40 transition-transform duration-300 ${showPrep ? 'rotate-180' : ''}`}>▾</span>
              </button>
              {showPrep && (
                <div className="space-y-4 animate-in">
                    {sessionPrepQuestions.map((q, i) => (
                      <div key={i} className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                         <span className="text-[10px] font-mono font-black text-indigo-400">Q{i+1}</span>
                         <p className="text-[11px] text-white/90 font-medium leading-relaxed italic">{q}</p>
                      </div>
                    ))}
                </div>
              )}
          </section>
      </div>

      {/* ROADMAP */}
      <section className="space-y-6">
         <div className="flex items-center justify-between px-2">
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-900">{t.results.roadmap}</h3>
            <div className="px-4 py-1.5 bg-slate-950 rounded-full text-[10px] font-mono font-black text-indigo-400 border border-white/10">{completedTasks.length} / 7</div>
         </div>
         <div className="space-y-4">
            {result.roadmap.map((step, i) => {
              const isShadow = step.taskKey.startsWith('shadow');
              const isDone = completedTasks.includes(step.day);
              return (
                <div 
                  key={i} 
                  onClick={() => toggleTask(step.day)} 
                  className={`p-6 rounded-[2.5rem] border transition-all duration-300 cursor-pointer relative overflow-hidden ${
                      isDone ? 'opacity-40 grayscale bg-slate-50 border-slate-100' : 'hover:scale-[1.02] active:scale-[0.98]'
                  } ${
                      isShadow ? 'bg-slate-900 border-slate-800 text-white shadow-2xl' : 
                      'bg-white border-slate-200 text-slate-900 shadow-sm'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                      <span className={`text-[10px] font-mono font-black ${isShadow ? 'text-indigo-400' : 'text-slate-400'}`}>Day 0{i+1}</span>
                      {isDone && <span className="text-emerald-600 text-[10px] font-black tracking-widest uppercase">Verified</span>}
                  </div>
                  <div className="space-y-1">
                      <h5 className="font-black text-lg uppercase italic leading-tight tracking-tighter">{getSceneText(`tasks.${step.taskKey}.title`)}</h5>
                      <p className={`text-[11px] leading-relaxed font-bold ${isShadow ? 'text-slate-300' : 'text-slate-600'}`}>{getSceneText(`tasks.${step.taskKey}.method`)}</p>
                  </div>
                </div>
              );
            })}
         </div>
      </section>

      <div className="grid grid-cols-2 gap-3 pt-6">
          <button onClick={onShare} className="py-5 bg-slate-950 text-white rounded-[2rem] font-black uppercase text-[10px] tracking-widest shadow-lg active:scale-95 transition-all border-b-4 border-slate-800">{t.results.share_button}</button>
          <button onClick={onBack} className="py-5 bg-white text-slate-900 border border-slate-300 rounded-[2rem] font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all">{t.results.back}</button>
      </div>
    </div>
  );
});