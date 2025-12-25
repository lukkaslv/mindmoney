
import React, { useState, memo, useEffect } from 'react';
import { Translations, AnalysisResult, GameHistoryItem } from '../../types';
import { StorageService, STORAGE_KEYS } from '../../services/storageService';

interface AdminPanelProps {
  t: Translations;
  onExit: () => void;
  result: AnalysisResult | null;
  history: GameHistoryItem[];
  onUnlockAll: () => void;
  glitchEnabled: boolean;
  onToggleGlitch: () => void;
}

export const AdminPanel = memo<AdminPanelProps>(({ t, onExit, result, history, onUnlockAll, glitchEnabled, onToggleGlitch }) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'db' | 'system'>('stats');
  const [dbContent, setDbContent] = useState(() => JSON.stringify(localStorage, null, 2));
  const [logs, setLogs] = useState<string[]>(["[SYSTEM] Kernel active", "[AUTH] Expert session initiated"]);

  const addLog = (msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 10));
  };

  const handleExport = () => {
    const blob = new Blob([dbContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `genesis_snapshot_${Date.now()}.json`;
    a.click();
    addLog("EXPORT_SUCCESS: Data dumped to JSON");
    window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.('success');
  };

  const handleReset = () => {
    if (confirm("TERMINATE ALL DATA? This cannot be undone.")) {
        StorageService.clear();
        addLog("CRITICAL: Wipe command executed");
        window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.('warning');
        setTimeout(() => window.location.reload(), 1000);
    }
  };

  const handleUnlock = () => {
    onUnlockAll();
    addLog("OVERRIDE: All nodes unlocked");
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.('heavy');
    alert("Master Unlock Complete.");
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-emerald-400 font-mono p-4 space-y-6 overflow-hidden">
      <header className="flex justify-between items-center border-b border-emerald-900/50 pb-4 shrink-0">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-500 font-black animate-pulse">L</div>
            <div>
                <h2 className="text-xs font-black uppercase tracking-[0.3em]">LCC_TERMINAL_v8</h2>
                <span className="text-[7px] opacity-40 uppercase">Mode: MASTER_OVERRIDE</span>
            </div>
        </div>
        <button onClick={onExit} className="bg-red-900/20 px-3 py-1 rounded border border-red-900/50 text-red-500 text-[9px] uppercase font-bold hover:bg-red-900/40 transition-colors">Terminate_Admin</button>
      </header>

      {/* TABS */}
      <nav className="flex gap-1 shrink-0 p-1 bg-emerald-950/20 rounded-xl">
        {(['stats', 'db', 'system'] as const).map(tab => (
            <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${activeTab === tab ? 'bg-emerald-500 text-slate-950 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'opacity-40'}`}
            >
                {tab}
            </button>
        ))}
      </nav>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
        {activeTab === 'stats' && (
            <div className="space-y-4 animate-in">
                {/* METRICS GRID */}
                <div className="grid grid-cols-2 gap-2">
                    {[
                      { l: 'FOUNDATION', v: result?.state.foundation, c: 'text-emerald-400' },
                      { l: 'AGENCY', v: result?.state.agency, c: 'text-blue-400' },
                      { l: 'ENTROPY', v: result?.state.entropy, c: 'text-red-400' },
                      { l: 'SYNC', v: result?.neuroSync, c: 'text-indigo-400' }
                    ].map(m => (
                      <div key={m.l} className="bg-emerald-950/10 p-3 rounded-xl border border-emerald-900/20">
                          <span className="text-[7px] block opacity-40 uppercase tracking-tighter">{m.l}</span>
                          <span className={`text-lg font-black ${m.c}`}>{m.v ?? 0}%</span>
                      </div>
                    ))}
                </div>

                {/* LIVE HISTORY STREAM */}
                <div className="space-y-2 bg-slate-900/50 p-4 rounded-xl border border-emerald-900/20">
                    <h3 className="text-[9px] font-black uppercase text-emerald-600 mb-2 flex justify-between">
                        <span>Session_History_Buffer</span>
                        <span className="animate-pulse">● LIVE</span>
                    </h3>
                    <div className="space-y-1">
                        {history.slice(-5).reverse().map((h, i) => (
                            <div key={i} className="text-[8px] flex justify-between opacity-70 border-b border-emerald-900/10 pb-1">
                                <span className="uppercase text-emerald-300">{h.beliefKey}</span>
                                <span className="font-mono text-emerald-600">{h.latency.toFixed(0)}ms | {h.sensation}</span>
                            </div>
                        ))}
                        {history.length === 0 && <div className="text-[8px] opacity-20 italic">Buffer empty. Awaiting user input...</div>}
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'db' && (
            <div className="space-y-4 h-full flex flex-col animate-in">
                <textarea 
                    className="flex-1 bg-slate-900/80 border border-emerald-900/30 rounded-xl p-4 text-[9px] text-emerald-500/80 outline-none focus:border-emerald-500/50 transition-colors font-mono resize-none leading-relaxed"
                    value={dbContent}
                    onChange={e => setDbContent(e.target.value)}
                    spellCheck={false}
                />
                <div className="grid grid-cols-2 gap-2 shrink-0">
                    <button onClick={() => {
                        try {
                            const parsed = JSON.parse(dbContent);
                            Object.keys(parsed).forEach(k => localStorage.setItem(k, parsed[k]));
                            addLog("DB_INFECTED: LocalStorage overwritten");
                            alert("Database Updated.");
                        } catch(e) { alert("JSON ERROR"); }
                    }} className="bg-emerald-600 text-slate-950 py-3 rounded-lg font-black text-[9px] uppercase active:scale-95 transition-transform">Save Changes</button>
                    <button onClick={handleExport} className="bg-slate-800 text-emerald-500 border border-emerald-900/50 py-3 rounded-lg font-black text-[9px] uppercase active:scale-95 transition-transform">Export .json</button>
                </div>
            </div>
        )}

        {activeTab === 'system' && (
            <div className="space-y-4 animate-in">
                <div className="space-y-2">
                    <h3 className="text-[9px] font-black uppercase opacity-40 px-2">Global_Overrides</h3>
                    
                    <button onClick={handleUnlock} className="w-full flex justify-between items-center bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20 hover:bg-emerald-500/20 transition-all group">
                        <div className="text-left">
                            <span className="text-[10px] font-black uppercase text-emerald-400">Unlock All Nodes</span>
                            <span className="text-[8px] block opacity-40 uppercase">Force completion of all sectors</span>
                        </div>
                        <span className="group-hover:translate-x-1 transition-transform">🔓</span>
                    </button>

                    <div className="flex justify-between items-center bg-red-500/10 p-4 rounded-xl border border-red-500/20">
                        <div>
                            <span className="text-[10px] font-black uppercase text-red-400">Glitch_Protocol</span>
                            <span className="text-[8px] block opacity-40 uppercase">Manual visual entropy override</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={glitchEnabled} onChange={onToggleGlitch} className="sr-only peer" />
                            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                        </label>
                    </div>
                </div>

                <div className="pt-6">
                    <button onClick={handleReset} className="w-full bg-red-900/20 text-red-500 py-4 rounded-xl border border-red-900/50 font-black text-[10px] uppercase tracking-widest active:bg-red-900/40 transition-all">
                        Factory Reset System
                    </button>
                </div>
            </div>
        )}
      </div>

      {/* SYSTEM LOGS FOOTER */}
      <div className="shrink-0 bg-slate-900 rounded-xl p-3 border border-emerald-900/20">
        <div className="flex justify-between text-[7px] font-black uppercase opacity-30 mb-2">
            <span>Kernel_Log_Buffer</span>
            <span>Uptime: 00:04:12</span>
        </div>
        <div className="h-16 overflow-y-auto font-mono text-[7px] space-y-0.5 opacity-60">
            {logs.map((log, i) => <div key={i}>{log}</div>)}
        </div>
      </div>
    </div>
  );
});
