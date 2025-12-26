
import React, { useState, memo, useMemo } from 'react';
import { Translations, AnalysisResult, GameHistoryItem, LicenseInfo, SubscriptionTier } from '../../types';
import { PlatformBridge } from '../../utils/helpers';
import { SecurityCore } from '../../utils/crypto';
import { StorageService, STORAGE_KEYS } from '../../services/storageService';

interface AdminPanelProps {
  t: Translations;
  onExit: () => void;
  result: AnalysisResult | null;
  history: GameHistoryItem[];
  onUnlockAll: () => void;
  glitchEnabled: boolean;
  onToggleGlitch: () => void;
  onSetView: (view: any) => void;
}

export const AdminPanel = memo<AdminPanelProps>(({ t, onExit, result, history, onUnlockAll, glitchEnabled, onToggleGlitch, onSetView }) => {
  const [activeTab, setActiveTab] = useState<'kernel' | 'billing' | 'telemetry' | 'integrity'>('kernel');
  const [genTier, setGenTier] = useState<string>('CLINICAL');
  const [genDays, setGenDays] = useState<number>(30);
  const [lastGeneratedKey, setLastGeneratedKey] = useState<string>('');

  const telemetry = useMemo(() => StorageService.getTelemetry(), []);

  const handleGenerateKey = () => {
      const key = SecurityCore.generateLicense(genTier, genDays);
      setLastGeneratedKey(key);
      PlatformBridge.haptic.notification('success');
  };

  const stats = useMemo(() => {
    const total = history.length;
    const avgLat = history.reduce((acc, h) => acc + h.latency, 0) / Math.max(1, total);
    return { total, avgLat: Math.round(avgLat) };
  }, [history]);

  return (
    <div className="flex flex-col h-full bg-[#020617] text-emerald-400 font-mono p-4 space-y-6 overflow-hidden select-none border-4 border-emerald-500/20">
      <header className="flex justify-between items-center shrink-0 border-b border-emerald-900/30 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-xl animate-pulse">⚡</div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-white">Genesis_OS_Control</h2>
            <span className="text-[8px] text-emerald-500/60 font-bold tracking-[0.2em]">OVERSIGHT_LAYER_v9.8.1</span>
          </div>
        </div>
        <button onClick={onExit} className="bg-red-950/20 text-red-500 border border-red-900/30 px-4 py-2 rounded-xl text-[10px] font-black uppercase">Term_Exit</button>
      </header>

      <nav className="flex gap-1 shrink-0 p-1 bg-slate-900/50 rounded-xl border border-white/5 overflow-x-auto no-scrollbar">
        {(['kernel', 'billing', 'telemetry', 'integrity'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2.5 rounded-lg text-[8px] font-black uppercase transition-all ${activeTab === tab ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'opacity-40 text-slate-400'}`}>
                {tab}
            </button>
        ))}
      </nav>

      <div className="flex-1 overflow-y-auto space-y-6 pr-1 custom-scrollbar">
        
        {activeTab === 'kernel' && (
          <div className="space-y-6 animate-in">
             <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5">
                    <span className="text-[7px] text-slate-500 uppercase block mb-1">Session_Nodes</span>
                    <span className="text-xl font-black text-white">{stats.total}</span>
                </div>
                <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5">
                    <span className="text-[7px] text-slate-500 uppercase block mb-1">Avg_Latency</span>
                    <span className="text-xl font-black text-white">{stats.avgLat}ms</span>
                </div>
             </div>

             <section className="bg-slate-900/40 p-6 rounded-2xl border border-white/5 space-y-4">
                <h4 className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Master_Overrides</h4>
                <button onClick={onUnlockAll} className="w-full py-4 bg-emerald-600/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-[9px] font-black uppercase hover:bg-emerald-600/20 transition-all">
                    Force_Unlock_Clinical_Results
                </button>
                <button onClick={onToggleGlitch} className={`w-full py-4 border rounded-xl text-[9px] font-black uppercase transition-all ${glitchEnabled ? 'bg-red-500/20 border-red-500/50 text-red-500' : 'bg-slate-900 border-white/5 text-slate-500'}`}>
                    Glitch_Simulation: {glitchEnabled ? 'ACTIVE' : 'INACTIVE'}
                </button>
             </section>
          </div>
        )}

        {activeTab === 'billing' && (
            <div className="space-y-6 animate-in">
                <section className="bg-indigo-900/20 p-6 rounded-2xl border border-indigo-500/30 space-y-4">
                    <h4 className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">License_Generator_v1.1</h4>
                    <div className="grid grid-cols-2 gap-3">
                        <select 
                            value={genTier} 
                            onChange={(e) => setGenTier(e.target.value)}
                            className="bg-black/40 border border-white/10 rounded-xl p-3 text-[10px] text-white outline-none"
                        >
                            <option value="SOLO">SOLO</option>
                            <option value="CLINICAL">CLINICAL</option>
                            <option value="LAB">LAB</option>
                        </select>
                        <input 
                            type="number" 
                            value={genDays} 
                            onChange={(e) => setGenDays(parseInt(e.target.value))}
                            className="bg-black/40 border border-white/10 rounded-xl p-3 text-[10px] text-white outline-none"
                            placeholder="Days"
                        />
                    </div>
                    <button onClick={handleGenerateKey} className="w-full py-4 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase shadow-xl active:scale-95 transition-all">
                        Generate_Master_Key
                    </button>
                    {lastGeneratedKey && (
                        <div className="p-4 bg-black/60 border border-emerald-500/30 rounded-xl space-y-2">
                            <span className="text-[7px] text-emerald-500 uppercase block">Ready_for_distribution:</span>
                            <p className="text-[10px] text-white font-mono break-all select-all p-2 bg-white/5 rounded cursor-copy" onClick={() => {
                                navigator.clipboard.writeText(lastGeneratedKey);
                                PlatformBridge.haptic.notification('success');
                            }}>{lastGeneratedKey}</p>
                            <span className="text-[6px] text-slate-500 italic block">Click key to copy to clipboard</span>
                        </div>
                    )}
                </section>
            </div>
        )}

        {activeTab === 'telemetry' && (
            <div className="space-y-4 animate-in">
                <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Live_Telemetry_Stream</h4>
                <div className="space-y-2">
                    {telemetry.length === 0 && <p className="text-[9px] text-slate-700 italic">No telemetry data captured in current buffer.</p>}
                    {telemetry.slice().reverse().map((t, idx) => (
                        <div key={idx} className="bg-slate-900/30 p-3 rounded-lg border border-white/5 text-[9px] flex justify-between items-center group">
                            <div className="space-y-1">
                                <div className="flex gap-2">
                                    <span className="text-emerald-500 font-bold uppercase">{t.nodeId}</span>
                                    <span className="text-slate-600">[{t.domain.toUpperCase()}]</span>
                                </div>
                                <div className="text-slate-400">Lat: <span className={t.isOutlier ? 'text-red-500' : 'text-indigo-400'}>{t.latency}ms</span> | Bel: {t.beliefKey}</div>
                            </div>
                            <span className="text-[8px] text-slate-800 font-mono group-hover:text-slate-600 transition-colors">Var_{t.variantId}</span>
                        </div>
                    ))}
                </div>
            </div>
        )}
        
        {activeTab === 'integrity' && (
            <div className="space-y-4 animate-in">
                <button onClick={() => onSetView('system_integrity')} className="w-full py-4 bg-indigo-600/10 border border-indigo-500/50 text-indigo-400 rounded-xl text-[9px] font-black uppercase">
                    Launch_Integrity_Audit_Scanner
                </button>
            </div>
        )}
      </div>

      <footer className="shrink-0 border-t border-white/5 pt-4 text-center">
          <p className="text-[8px] text-slate-700 uppercase tracking-widest italic opacity-50">Authorized Dev Access Only // Genesis Core v9.8</p>
      </footer>
    </div>
  );
});
