
import React, { useState, memo, useMemo } from 'react';
import { Translations, AnalysisResult, GameHistoryItem, BeliefKey } from '../../types';
import { StorageService, STORAGE_KEYS } from '../../services/storageService';
import { ALL_BELIEFS, NODE_CONFIGS } from '../../constants';
import { translations } from '../../translations';
import { resolvePath } from '../../utils/helpers';

interface AdminPanelProps {
  t: Translations;
  onExit: () => void;
  result: AnalysisResult | null;
  history: GameHistoryItem[];
  onUnlockAll: () => void;
  glitchEnabled: boolean;
  onToggleGlitch: () => void;
}

type DestructiveAction = 'wipe' | 'unlock' | 'simulate_all' | 'simulate_manic';

// --- HELPER COMPONENTS ---

const getAllKeys = (obj: any, prefix = ''): string[] => 
  Object.keys(obj).reduce((acc: string[], key) => {
    const pre = prefix.length ? prefix + '.' : '';
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      acc.push(...getAllKeys(obj[key], pre + key));
    } else {
      acc.push(pre + key);
    }
    return acc;
  }, []);

const AuditCard = ({ title, status, details }: { title: string; status: 'OK' | 'ERROR'; details: string[] | string }) => (
    <div className={`p-4 rounded-xl border ${status === 'OK' ? 'bg-emerald-950/20 border-emerald-900/30' : 'bg-red-950/20 border-red-900/30'}`}>
        <div className="flex justify-between items-center mb-2">
            <h4 className={`text-[9px] font-black uppercase tracking-widest ${status === 'OK' ? 'text-emerald-400' : 'text-red-400'}`}>{title}</h4>
            <span className={`text-[8px] font-mono px-2 py-0.5 rounded ${status === 'OK' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>{status}</span>
        </div>
        {Array.isArray(details) ? (
            <div className="max-h-32 overflow-y-auto text-[8px] font-mono space-y-1 pr-2 custom-scrollbar">
                {details.map((item, index) => <div key={index} className="bg-slate-900/50 p-1 rounded">{item}</div>)}
            </div>
        ) : (
            <p className="text-[9px] font-mono">{details}</p>
        )}
    </div>
);

const ConfirmationModal: React.FC<{
  action: DestructiveAction;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ action, onConfirm, onCancel }) => {
    const challenges = {
        wipe: { verb: "WIPE", color: "red", icon: "☢️" },
        unlock: { verb: "UNLOCK", color: "amber", icon: "🔑" },
        simulate_all: { verb: "SIMULATE", color: "indigo", icon: "🎭" },
        simulate_manic: { verb: "OVERRIDE", color: "sky", icon: "⚡" },
    };
    const challenge = challenges[action];
    const [input, setInput] = useState('');

    return (
        <div className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-in rounded-3xl">
            <div className="w-full max-w-xs space-y-6">
                <div className="text-center space-y-2">
                    <div className="text-4xl">{challenge.icon}</div>
                    <h3 className={`text-${challenge.color}-400 font-mono text-xs font-black uppercase tracking-widest`}>Confirm Destructive Action</h3>
                    <p className="text-[9px] text-slate-500 font-mono">
                        This action is irreversible. To proceed, type "{challenge.verb}" below.
                    </p>
                </div>
                <input 
                    type="text" 
                    autoFocus
                    className={`w-full bg-slate-900 border border-${challenge.color}-500/30 rounded-xl p-4 text-${challenge.color}-400 font-mono text-center outline-none focus:border-${challenge.color}-500 transition-colors shadow-inner text-lg placeholder-slate-700`}
                    value={input}
                    onChange={e => setInput(e.target.value.toUpperCase())}
                />
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={onCancel} className="bg-slate-800 text-slate-400 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all">Cancel</button>
                    <button 
                        onClick={onConfirm} 
                        disabled={input !== challenge.verb}
                        className={`bg-${challenge.color}-600 text-slate-950 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-${challenge.color}-900/50 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed`}
                    >
                        Execute
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---

export const AdminPanel = memo<AdminPanelProps>(({ t, onExit, result, history, onUnlockAll, glitchEnabled, onToggleGlitch }) => {
  const [activeTab, setActiveTab] = useState<'system' | 'stats' | 'audit' | 'translation' | 'db'>('audit');
  const [dbContent, setDbContent] = useState(() => JSON.stringify(localStorage, null, 2));
  const [logs, setLogs] = useState<string[]>(["[SYSTEM] Kernel active", "[AUTH] Expert session initiated"]);
  const [actionToConfirm, setActionToConfirm] = useState<DestructiveAction | null>(null);

  const integrityAudit = useMemo(() => {
      const usedBeliefs = new Set<BeliefKey>();
      Object.values(NODE_CONFIGS).forEach(config => {
          config.choices.forEach(choice => {
              usedBeliefs.add(choice.beliefKey);
          });
      });
      const unreachableBeliefs = ALL_BELIEFS.filter(b => !usedBeliefs.has(b));
      return { unreachableBeliefs };
  }, []);
  
  const translationAudit = useMemo(() => {
    const ruKeys = getAllKeys(translations.ru);
    const kaKeys = getAllKeys(translations.ka);
    const missingInKa = ruKeys.filter(key => !kaKeys.includes(key));
    const ignoreList = ['subtitle', 'results.share_url', 'results.brief_legend_f', 'results.brief_legend_a', 'results.brief_legend_r', 'results.brief_legend_e', 'results.brief_legend_sync'];
    const untranslatedInKa = kaKeys.filter(key => {
        if(ignoreList.includes(key)) return false;
        const ruValue = resolvePath(translations.ru, key);
        const kaValue = resolvePath(translations.ka, key);
        return ruValue === kaValue && !ruValue.startsWith('[KEY_ERROR') && !ruValue.startsWith('[OBJECT_ERROR');
    });

    return { ruKeyCount: ruKeys.length, kaKeyCount: kaKeys.length, missingInKa, untranslatedInKa };
  }, []);

  const addLog = (msg: string) => {
    const logEntry = `[${new Date().toLocaleTimeString()}] ${msg}`;
    setLogs(prev => [logEntry, ...prev].slice(0, 10));
    if(msg.includes('CRITICAL') || msg.includes('OVERRIDE') || msg.includes('INJECTED')) {
        StorageService.logAuditEvent(msg);
    }
  };

  const executeConfirmedAction = () => {
    if (!actionToConfirm) return;
    
    switch (actionToConfirm) {
        case 'wipe':
            StorageService.clear();
            addLog("CRITICAL: Wipe command executed");
            window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.('warning');
            setTimeout(() => window.location.reload(), 1000);
            break;
        case 'unlock':
            onUnlockAll();
            addLog("OVERRIDE: All nodes unlocked & history simulated");
            alert("Master Unlock Complete. History has been neutralized.");
            break;
        case 'simulate_all':
            const allPatternsResult: Omit<AnalysisResult, 'timestamp' | 'createdAt'> = {
                shareCode: 'AUDIT_ALL', state: { foundation: 50, agency: 50, resource: 50, entropy: 50 }, integrity: 100, capacity: 100, entropyScore: 0, neuroSync: 100, systemHealth: 100,
                phase: 'EXPANSION', archetypeKey: 'THE_ARCHITECT', archetypeMatch: 100, archetypeSpectrum: [], verdictKey: 'HEALTHY_SCALE', lifeScriptKey: 'audit', roadmap: [],
                graphPoints: [{ x: 50, y: 50 }, { x: 50, y: 50 }, { x: 50, y: 50 }], status: 'OPTIMAL', validity: 'VALID', activePatterns: ALL_BELIEFS,
                correlations: [], conflicts: [], somaticDissonance: [], somaticProfile: { blocks: 0, resources: 0, dominantSensation: 's0' },
                integrityBreakdown: { coherence: 100, sync: 100, stability: 100, label: 'AUDIT', description: '', status: 'OPTIMAL' },
                interventionStrategy: 'audit', coreConflict: 'none', shadowDirective: 'none', clarity: 100, confidenceScore: 100, warnings: [],
                flags: { isAlexithymiaDetected: false, isSlowProcessingDetected: false, isNeuroSyncReliable: true, isSocialDesirabilityBiasDetected: false, processingSpeedCompensation: 1.0, entropyType: 'NEUTRAL' },
                patternFlags: { isMonotonic: false, isHighSkipRate: false, isFlatline: false, dominantPosition: null, isRoboticTiming: false, isSomaticMonotony: false },
                skippedCount: 0
            };
            StorageService.saveScan(allPatternsResult as AnalysisResult);
            localStorage.setItem(STORAGE_KEYS.SESSION, 'true');
            addLog("INJECTED: All Patterns Result");
            setTimeout(() => window.location.reload(), 800);
            break;
        case 'simulate_manic':
            // WARNING: This simulates a clinically complex, unsustainable state. Not a target profile.
            const manicDefenseResult: Omit<AnalysisResult, 'timestamp' | 'createdAt'> = {
                shareCode: 'SIM_MANIC', state: { foundation: 38, agency: 95, resource: 80, entropy: 15 }, integrity: 70, capacity: 59, entropyScore: 15, neuroSync: 60, systemHealth: 65,
                phase: 'EXPANSION', archetypeKey: 'THE_BURNED_HERO', archetypeMatch: 100, archetypeSpectrum: [], verdictKey: 'BRILLIANT_SABOTAGE', lifeScriptKey: 'god_mode_script', roadmap: [],
                graphPoints: [{ x: 50, y: 35 }, { x: 90, y: 75 }, { x: 10, y: 75 }], status: 'STRAINED', validity: 'SUSPICIOUS', activePatterns: ['self_permission', 'hard_work_only'],
                correlations: [], conflicts: [], somaticDissonance: [], somaticProfile: { blocks: 2, resources: 3, dominantSensation: 's3' },
                integrityBreakdown: { coherence: 90, sync: 60, stability: 55, label: 'HIGH_COHERENCE', description: '', status: 'STRAINED' },
                interventionStrategy: 'decelerate', coreConflict: 'icarus', shadowDirective: 'integrity_boost', clarity: 100, confidenceScore: 90, warnings: [{type: "MANIC_DEFENSE", severity: "HIGH", messageKey: ""}],
                flags: { isAlexithymiaDetected: false, isSlowProcessingDetected: false, isNeuroSyncReliable: false, isSocialDesirabilityBiasDetected: true, processingSpeedCompensation: 1.0, entropyType: 'CREATIVE' },
                patternFlags: { isMonotonic: false, isHighSkipRate: false, isFlatline: false, dominantPosition: null, isRoboticTiming: false, isSomaticMonotony: false },
                skippedCount: 0
            };
            StorageService.saveScan(manicDefenseResult as AnalysisResult);
            localStorage.setItem(STORAGE_KEYS.SESSION, 'true');
            addLog("INJECTED: Manic Defense Profile");
            setTimeout(() => window.location.reload(), 800);
            break;
    }
    window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.('success');
    setActionToConfirm(null);
  };
  
  return (
    <div className="flex flex-col h-full bg-slate-950 text-emerald-400 font-mono p-4 space-y-6 overflow-hidden">
      {actionToConfirm && <ConfirmationModal action={actionToConfirm} onConfirm={executeConfirmedAction} onCancel={() => setActionToConfirm(null)} />}
      
      <header className="flex justify-between items-center border-b border-emerald-900/50 pb-4 shrink-0">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-500 font-black animate-pulse">L</div>
            <div>
                <h2 className="text-xs font-black uppercase tracking-[0.3em]">LCC_TERMINAL_v8.1</h2>
                <span className="text-[7px] opacity-40 uppercase">Mode: RED_TEAM_HARDENED</span>
            </div>
        </div>
        <button onClick={onExit} className="bg-red-900/20 px-3 py-1 rounded border border-red-900/50 text-red-500 text-[9px] uppercase font-bold hover:bg-red-900/40 transition-colors">Terminate_Admin</button>
      </header>

      <nav className="flex gap-1 shrink-0 p-1 bg-emerald-950/20 rounded-xl">
        {(['system', 'stats', 'audit', 'translation', 'db'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${activeTab === tab ? 'bg-emerald-500 text-slate-950 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'opacity-40'}`}>{tab}</button>
        ))}
      </nav>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
        {activeTab === 'system' && (
            <div className="space-y-4 animate-in">
                <h3 className="text-[10px] uppercase tracking-[0.3em] font-black text-center text-emerald-600">Kernel Commands</h3>
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setActionToConfirm('wipe')} className="bg-red-900/20 p-4 rounded-xl border border-red-900/50 text-center space-y-1">
                        <span className="text-xl">☢️</span>
                        <span className="block text-[8px] font-bold text-red-400 uppercase tracking-widest">Wipe Memory</span>
                    </button>
                    <button onClick={() => setActionToConfirm('unlock')} className="bg-amber-900/20 p-4 rounded-xl border border-amber-900/50 text-center space-y-1">
                        <span className="text-xl">🔑</span>
                        <span className="block text-[8px] font-bold text-amber-400 uppercase tracking-widest">Master Unlock</span>
                    </button>
                    <button onClick={() => setActionToConfirm('simulate_all')} className="bg-indigo-900/30 p-4 rounded-xl border border-indigo-900/50 text-center space-y-1 col-span-2">
                        <span className="text-xl">🎭</span>
                        <span className="block text-[8px] font-bold text-indigo-400 uppercase tracking-widest">Simulate "All Patterns"</span>
                    </button>
                     <button onClick={() => setActionToConfirm('simulate_manic')} className="bg-sky-900/30 p-4 rounded-xl border border-sky-900/50 text-center space-y-1 col-span-2">
                        <span className="text-xl">⚡</span>
                        <span className="block text-[8px] font-bold text-sky-400 uppercase tracking-widest">Simulate "Manic Defense"</span>
                    </button>
                    <div className="col-span-2 flex items-center justify-between bg-slate-800/50 p-3 rounded-lg">
                        <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Glitch Effect</span>
                        <button onClick={onToggleGlitch} className={`w-12 h-6 rounded-full p-1 flex items-center transition-colors ${glitchEnabled ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'}`}>
                            <div className="w-4 h-4 rounded-full bg-white"></div>
                        </button>
                    </div>
                </div>
            </div>
        )}
        {activeTab === 'stats' && (
            <div className="space-y-4 animate-in">
                <h3 className="text-[10px] uppercase tracking-[0.3em] font-black text-center text-emerald-600">Live Metrics</h3>
                <div className="bg-slate-900 rounded p-2 text-[8px] font-mono overflow-x-auto">
                    <pre>{JSON.stringify({ result, history_count: history.length }, null, 2)}</pre>
                </div>
            </div>
        )}
        {activeTab === 'audit' && (
            <div className="space-y-4 animate-in">
                <h3 className="text-[10px] uppercase tracking-[0.3em] font-black text-center text-emerald-600">System Integrity Audit</h3>
                <AuditCard 
                    title="Belief Key Reachability"
                    status={integrityAudit.unreachableBeliefs.length === 0 ? 'OK' : 'ERROR'}
                    details={integrityAudit.unreachableBeliefs.length > 0 ? integrityAudit.unreachableBeliefs : 'All belief keys are reachable through node configs.'}
                />
                <AuditCard 
                    title="KA Translation Coverage"
                    status={translationAudit.missingInKa.length === 0 && translationAudit.untranslatedInKa.length === 0 ? 'OK' : 'ERROR'}
                    details={`RU Keys: ${translationAudit.ruKeyCount} / KA Keys: ${translationAudit.kaKeyCount}`}
                />
            </div>
        )}
        {activeTab === 'translation' && (
            <div className="space-y-4 animate-in">
                <h3 className="text-[10px] uppercase tracking-[0.3em] font-black text-center text-emerald-600">Translation Deep Dive</h3>
                <AuditCard 
                    title="Missing Keys in 'KA'"
                    status={translationAudit.missingInKa.length === 0 ? 'OK' : 'ERROR'}
                    details={translationAudit.missingInKa.length > 0 ? translationAudit.missingInKa : 'No missing keys.'}
                />
                <AuditCard 
                    title="Untranslated Keys in 'KA' (RU Fallback)"
                    status={translationAudit.untranslatedInKa.length === 0 ? 'OK' : 'ERROR'}
                    details={translationAudit.untranslatedInKa.length > 0 ? translationAudit.untranslatedInKa : 'All keys appear to be translated.'}
                />
            </div>
        )}
        {activeTab === 'db' && (
            <div className="space-y-4 animate-in">
                <h3 className="text-[10px] uppercase tracking-[0.3em] font-black text-center text-emerald-600">Local Storage Inspector</h3>
                <textarea 
                    className="w-full h-64 bg-slate-900 rounded p-2 text-[8px] font-mono border border-emerald-900/50 outline-none focus:border-emerald-500 transition-colors"
                    value={dbContent}
                    onChange={(e) => setDbContent(e.target.value)}
                />
                <button 
                    onClick={() => {
                        try {
                            const data = JSON.parse(dbContent);
                            Object.keys(data).forEach(key => localStorage.setItem(key, data[key]));
                            addLog("DB_WRITE: Success");
                            alert("Local Storage updated!");
                        } catch (e) {
                            addLog("DB_WRITE: FAILED (JSON Parse Error)");
                            alert("Invalid JSON format!");
                        }
                    }}
                    className="w-full bg-emerald-600/20 text-emerald-300 py-2 rounded text-[9px] font-bold uppercase border border-emerald-500/30"
                >
                    Write to localStorage
                </button>
            </div>
        )}
      </div>

      <div className="shrink-0 bg-slate-900 rounded-xl p-3 border border-emerald-900/20">
        <div className="flex justify-between text-[7px] font-black uppercase opacity-30 mb-2">
            <span>Kernel_Log_Buffer</span>
            <span>Uptime: {new Date().toLocaleTimeString()}</span>
        </div>
        <div className="h-16 overflow-y-auto font-mono text-[7px] space-y-0.5 opacity-60">
            {logs.map((log, i) => <div key={i}>{log}</div>)}
        </div>
      </div>
    </div>
  );
});