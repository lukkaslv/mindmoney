
import React, { useState, useMemo } from 'react';
import { AnalysisResult, Translations, SessionStep, SystemicVector, Intervention } from '../../types';
import { CompatibilityEngine } from '../../services/compatibilityEngine';
import { generateClinicalNarrative } from '../../services/clinicalNarratives';
import { PlatformBridge } from '../../utils/helpers';

interface CompatibilityViewProps {
  lang: 'ru' | 'ka';
  userResult: AnalysisResult | null;
  isProSession: boolean;
  onUnlockPro: () => void;
  t: Translations;
  onBack: () => void;
}

const SystemicMap = ({ vectors, t }: { vectors: SystemicVector[], t: Translations }) => (
    <div className="bg-slate-900/50 p-5 rounded-[2rem] border border-slate-800 my-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-5 text-4xl">🕸️</div>
        <h4 className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-6 border-b border-indigo-500/10 pb-2">SYSTEMIC_LOYALTY_MAP_v3.1</h4>
        
        <div className="relative h-48 w-full flex items-center justify-center bg-slate-950/30 rounded-2xl border border-white/5 mb-4">
            <svg className="w-full h-full" viewBox="0 0 200 120">
                <defs>
                    <radialGradient id="selfGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                    </radialGradient>
                </defs>
                <circle cx="100" cy="60" r="25" fill="url(#selfGlow)" className="animate-pulse" />
                <circle cx="100" cy="60" r="14" fill="#6366f1" stroke="white" strokeWidth="2" />
                <text x="100" y="63" textAnchor="middle" className="fill-white text-[7px] font-black tracking-widest">SELF</text>
                
                {vectors.map((v, i) => {
                    const angle = (i * 180) / Math.max(1, vectors.length - 1);
                    const rad = (angle * Math.PI) / 180;
                    const x = 100 + 70 * Math.cos(rad);
                    const y = 60 - 45 * Math.sin(rad);
                    const isStrong = v.strength > 80;
                    
                    return (
                        <g key={i} className="animate-in" style={{ animationDelay: `${i * 0.2}s` }}>
                            <line 
                                x1="100" y1="60" x2={x} y2={y} 
                                stroke={isStrong ? "#f43f5e" : "#475569"} 
                                strokeWidth={isStrong ? "1.5" : "0.5"} 
                                strokeDasharray={isStrong ? "" : "2 2"} 
                            />
                            <circle cx={x} cy={y} r="10" fill="#1e293b" stroke={isStrong ? "#f43f5e" : "#6366f1"} strokeWidth="1" />
                            <text x={x} y={y + 3} textAnchor="middle" className={`text-[6px] font-black ${isStrong ? 'fill-red-400' : 'fill-slate-400'}`}>
                                {v.origin[0]}
                            </text>
                            <text x={x} y={y - 12} textAnchor="middle" className="fill-slate-500 text-[5px] font-bold uppercase tracking-tighter">
                                {v.origin}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>

        <div className="space-y-2">
            {vectors.map((v, i) => (
                <div key={i} className={`flex justify-between items-center p-2 rounded-lg border ${v.strength > 80 ? 'bg-red-950/20 border-red-900/30' : 'bg-slate-900/30 border-white/5'}`}>
                    <div className="flex flex-col">
                        <span className={`text-[8px] font-black uppercase ${v.strength > 80 ? 'text-red-400' : 'text-slate-500'}`}>{v.origin} VECTOR</span>
                        <p className="text-[9px] text-slate-300 italic">{v.description}</p>
                    </div>
                    <span className={`text-[10px] font-mono font-black ${v.strength > 80 ? 'text-red-500' : 'text-slate-400'}`}>{v.strength}%</span>
                </div>
            ))}
        </div>
    </div>
);

const InterventionFeed = ({ interventions, t }: { interventions: Intervention[], t: Translations }) => (
    <div className="space-y-4 my-8">
        <h4 className="text-[9px] font-black text-emerald-500 uppercase tracking-widest pl-1 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            LIVE_SESSION_INTERVENTIONS
        </h4>
        <div className="grid grid-cols-1 gap-3">
            {interventions.map((inv, i) => (
                <div key={i} className="bg-emerald-950/10 p-5 rounded-[1.5rem] border border-emerald-500/20 shadow-lg relative group active:scale-[0.98] transition-all cursor-copy" onClick={() => {
                    navigator.clipboard.writeText(inv.text);
                    PlatformBridge.haptic.notification('success');
                }}>
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-[7px] font-black bg-emerald-500 text-black px-2 py-0.5 rounded-full tracking-widest">{inv.type}</span>
                        <span className="text-[7px] text-emerald-600 font-mono italic uppercase tracking-tighter">{inv.purpose}</span>
                    </div>
                    <p className="text-xs text-emerald-50 font-bold leading-relaxed italic pr-4">"{inv.text}"</p>
                    <div className="absolute bottom-2 right-4 opacity-0 group-hover:opacity-30 text-[8px] font-black text-emerald-400">TAP TO COPY</div>
                </div>
            ))}
        </div>
    </div>
);

const VitalMonitor = ({ label, value, color }: { label: string, value: number, color: string }) => (
    <div className="bg-slate-900 rounded-xl p-2 min-w-[50px] border border-slate-800/50 flex flex-col items-center">
        <span className="text-[7px] uppercase text-slate-500 font-black tracking-widest mb-1">{label}</span>
        <div className="w-full flex items-center gap-2">
            <span className={`text-[11px] font-bold font-mono ${color}`}>{Math.round(value)}</span>
            <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full ${color.replace('text-', 'bg-')} opacity-80`} style={{ width: `${value}%` }}></div>
            </div>
        </div>
    </div>
);

const SessionArc = ({ steps }: { steps: SessionStep[] }) => (
    <div className="grid grid-cols-1 gap-2 my-4">
        {steps.map((step, idx) => (
            <div key={idx} className="flex gap-3 bg-slate-900/50 p-3 rounded-xl border border-slate-800 items-start">
                <div className={`flex flex-col items-center justify-center w-8 shrink-0 space-y-1 pt-1`}>
                    <div className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-emerald-500' : idx === 1 ? 'bg-indigo-500' : 'bg-slate-500'}`}></div>
                    <div className="w-0.5 h-6 bg-slate-800 last:hidden"></div>
                </div>
                <div>
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 block mb-0.5">Step {idx + 1}: {step.phase}</span>
                    <h5 className="text-[10px] font-bold text-slate-200 uppercase">{step.title}</h5>
                    <p className="text-[10px] text-slate-400 leading-tight mt-1 font-mono opacity-80">{step.action}</p>
                </div>
            </div>
        ))}
    </div>
);

export const CompatibilityView: React.FC<CompatibilityViewProps> = ({ lang, isProSession, onUnlockPro, t, onBack }) => {
  const [partnerCode, setPartnerCode] = useState('');
  const [clientResult, setClientResult] = useState<AnalysisResult | null>(null);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [unlockPwd, setUnlockPwd] = useState('');

  const handleAnalyze = () => {
    const decodedClient = CompatibilityEngine.decodeSmartCode(partnerCode);
    if (decodedClient) {
        setClientResult(decodedClient);
        PlatformBridge.haptic.notification('success');
    } else {
        PlatformBridge.haptic.notification('error');
    }
  };

  const handleUnlock = () => {
    const cleanPwd = unlockPwd.toLowerCase().trim();
    if (cleanPwd === 'genesis_prime' || cleanPwd === 'genesis_lab_entry') {
        onUnlockPro();
        setShowUnlockModal(false);
        PlatformBridge.haptic.notification('success');
    } else {
        PlatformBridge.haptic.notification('error');
        setUnlockPwd('');
        setShowUnlockModal(false); 
    }
  };

  const interpretation = useMemo(() => {
      if (!clientResult) return null;
      const narrative = generateClinicalNarrative(clientResult, lang);
      return narrative.level2;
  }, [clientResult, lang]);

  return (
    <section className="space-y-6 animate-in py-4 flex flex-col h-full bg-white relative">
        {showUnlockModal && (
            <div className="absolute inset-0 z-[100] bg-slate-950/98 flex items-center justify-center p-6 backdrop-blur-md animate-in rounded-3xl">
                <div className="w-full max-w-xs space-y-6">
                    <div className="text-center space-y-2">
                        <span className="text-2xl">📟</span>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] block opacity-60 text-slate-400">BRIDGE_SEC_LAYER_v5.2</span>
                    </div>
                    <input type="password" autoFocus className="w-full bg-slate-900 border border-white/5 rounded-2xl p-5 text-emerald-400 font-mono text-center outline-none focus:border-emerald-500/50 text-sm shadow-2xl" placeholder="••••••••" value={unlockPwd} onChange={e => setUnlockPwd(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleUnlock()} />
                    <div className="flex justify-center"><button onClick={() => setShowUnlockModal(false)} className="py-2 px-4 text-slate-800 text-[8px] font-black uppercase tracking-widest hover:text-slate-400 transition-colors">ABORT_STREAMS</button></div>
                </div>
            </div>
        )}

        <div className="flex justify-between items-center px-1 pb-2 border-b border-indigo-100/50 shrink-0">
            <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl text-[10px] font-black uppercase text-slate-600 active:scale-95 transition-all">← {t.global.back}</button>
            <div className="flex flex-col items-end">
                 <span className="text-[10px] font-mono text-indigo-600 font-black tracking-widest italic">{t.dashboard.open_terminal}</span>
                 <span className="text-[7px] font-mono text-slate-400 uppercase">Supervisor v3.1 Master</span>
            </div>
        </div>

        {!clientResult && (
            <div className="space-y-4 animate-in">
                <div className="p-10 bg-slate-50 rounded-[3rem] border border-slate-100 text-center space-y-6">
                    <div className="w-20 h-20 bg-white rounded-3xl mx-auto flex items-center justify-center text-3xl shadow-xl border border-slate-50">🔐</div>
                    <div className="space-y-2">
                        <h3 className="text-md font-black uppercase text-slate-900 tracking-tight">{t.ui.access_restricted}</h3>
                        <p className="text-[11px] text-slate-500 font-medium opacity-80 leading-relaxed italic">{t.auth_hint}</p>
                    </div>
                </div>
                <div className="flex gap-2 p-2 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-inner">
                    <input type="text" placeholder={t.ui.paste_code} className="flex-1 bg-white border border-slate-200 rounded-2xl px-5 py-4 font-mono text-xs uppercase text-indigo-600 outline-none focus:border-indigo-500 transition-colors placeholder-indigo-900/20 shadow-sm" value={partnerCode} onChange={e => setPartnerCode(e.target.value)} />
                    <button onClick={handleAnalyze} className="bg-indigo-600 text-white px-8 rounded-2xl font-black text-[10px] uppercase shadow-lg active:scale-95 transition-all">{t.ui.decrypt_btn}</button>
                </div>
            </div>
        )}

        {clientResult && interpretation && (
            <div className="bg-slate-950 text-slate-400 p-6 rounded-[2.5rem] space-y-8 border border-slate-800 shadow-2xl relative animate-in flex-1 overflow-y-auto custom-scrollbar font-mono pb-32">
                
                <div className="border-b border-white/5 pb-6 space-y-4">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <span className="text-[8px] text-emerald-500 font-black uppercase tracking-widest block opacity-50">TARGET_NODE_ID</span>
                            <span className="text-xs text-emerald-400 font-mono font-bold tracking-widest">{clientResult.shareCode.substring(0, 14)}...</span>
                        </div>
                        {!isProSession && (
                            <button onClick={() => setShowUnlockModal(true)} className="text-slate-800 border border-slate-900 px-3 py-1 rounded-lg text-[7px] font-black uppercase tracking-widest bg-white/5 hover:bg-white/10 transition-colors">
                                [ DECRYPT_DOSSIER ]
                            </button>
                        )}
                    </div>
                    
                    <div className="grid grid-cols-4 gap-2 pt-2">
                        <VitalMonitor label="FND" value={clientResult.state.foundation} color="text-slate-100" />
                        <VitalMonitor label="AGC" value={clientResult.state.agency} color="text-blue-500" />
                        <VitalMonitor label="RES" value={clientResult.state.resource} color="text-amber-500" />
                        <VitalMonitor label="ENT" value={clientResult.state.entropy} color="text-red-500" />
                    </div>
                </div>

                {!isProSession ? (
                    <div className="py-16 text-center space-y-6 opacity-30 animate-pulse">
                        <span className="text-5xl block">🔒</span>
                        <p className="text-[11px] uppercase font-black tracking-[0.4em] text-indigo-400">Clinical Layer Restricted</p>
                        <p className="text-[9px] text-slate-600 max-w-[200px] mx-auto leading-relaxed">Systemic vectors and differential hypothesis require Master Authentication.</p>
                    </div>
                ) : (
                    <div className="animate-in space-y-10">
                        <SystemicMap vectors={interpretation.systemicVectors} t={t} />
                        
                        <div className="bg-slate-900/30 p-6 rounded-[2rem] border border-slate-800 space-y-4">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Differential_Probabilities</h4>
                                <span className="text-[7px] font-mono text-slate-700 uppercase italic">Anti-Bias Matrix v2</span>
                            </div>
                            <div className="space-y-4">
                                {interpretation.differentialHypotheses.map((h, i) => (
                                    <div key={i} className="space-y-1.5">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] text-slate-300 font-bold">{h.label}</span>
                                            <span className={`text-[10px] font-mono font-black ${h.probability > 0.7 ? 'text-red-500 animate-pulse' : 'text-slate-600'}`}>{Math.round(h.probability * 100)}%</span>
                                        </div>
                                        <div className="w-full h-1 bg-slate-800/50 rounded-full overflow-hidden">
                                            <div className={`h-full transition-all duration-1000 ${h.probability > 0.7 ? 'bg-red-600' : 'bg-slate-600'}`} style={{ width: `${h.probability * 100}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <InterventionFeed interventions={interpretation.interventions} t={t} />

                        <div className="bg-indigo-950/20 p-6 rounded-[2rem] border border-indigo-500/20 relative group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 text-3xl">🔏</div>
                            <h4 className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <span className="text-sm">🌑</span> Shadow_Contract_Hypothesis
                            </h4>
                            <p className="text-xs text-indigo-100 font-medium leading-relaxed italic border-l-2 border-indigo-500/30 pl-4">
                                "{interpretation.shadowContract}"
                            </p>
                        </div>
                        
                        <div className="space-y-6 pt-6 border-t border-white/5">
                            <div className="space-y-2">
                                <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Systemic_Root</span>
                                <p className="text-[11px] text-slate-300 leading-relaxed font-mono opacity-80">{interpretation.systemicRoot}</p>
                            </div>
                            <div className="space-y-2">
                                <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Alliance_Strategy</span>
                                <p className="text-[11px] text-slate-300 leading-relaxed font-mono opacity-80">{interpretation.therapeuticAlliance}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="pt-10 border-t border-white/5 text-center space-y-6">
                     <p className="text-[9px] text-slate-800 uppercase max-w-[240px] mx-auto border border-slate-900 p-3 rounded-2xl leading-relaxed italic">
                        {isProSession ? t.clinical_decoder.disclaimer : "BRIDGE_OFFLINE: Authentication Required for Master Interpretation."}
                     </p>
                     <button onClick={() => setClientResult(null)} className="text-[10px] font-black text-slate-700 uppercase tracking-widest hover:text-red-900 transition-colors bg-white/5 px-6 py-4 rounded-2xl border border-white/5 w-full active:scale-95">
                        [ DISCONNECT_SESSION_STREAM ]
                     </button>
                </div>
            </div>
        )}
    </section>
  );
};
