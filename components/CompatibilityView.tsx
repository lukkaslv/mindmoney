
import React, { useState } from 'react';
import { AnalysisResult, CompatibilityReport, Translations } from '../types';
import { CompatibilityEngine } from '../services/compatibilityEngine';

interface CompatibilityViewProps {
  userResult: AnalysisResult;
  t: Translations;
}

export const CompatibilityView: React.FC<CompatibilityViewProps> = ({ userResult, t }) => {
  const [partnerCode, setPartnerCode] = useState('');
  const [report, setReport] = useState<CompatibilityReport | null>(null);

  const handleAnalyze = () => {
    // In a real app, we would fetch the blueprint by code.
    // For this implementation, we simulate decoding or provide a placeholder for the flow.
    // We'll mock a "Shadow" result based on the code provided for demonstration.
    
    const mockPartner: AnalysisResult = {
        ...userResult,
        archetypeKey: partnerCode.length % 2 === 0 ? 'THE_CHAOS_SURFER' : 'THE_GUARDIAN',
        entropyScore: 70,
        integrity: 40,
        state: { foundation: 30, agency: 80, resource: 20, entropy: 70 }
    };

    const comp = CompatibilityEngine.analyzeCompatibility(userResult, mockPartner);
    setReport(comp);
    window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.('success');
  };

  return (
    <section className="space-y-6 animate-in">
        <div className="space-y-4">
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-900 px-2">System Compatibility</h3>
            <div className="flex gap-2 p-2 bg-slate-50 rounded-2xl border border-slate-100">
                <input 
                    type="text" 
                    placeholder="ENTER_PARTNER_CODE"
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 font-mono text-xs uppercase text-indigo-600 outline-none focus:border-indigo-500 transition-colors"
                    value={partnerCode}
                    onChange={e => setPartnerCode(e.target.value)}
                />
                <button 
                    onClick={handleAnalyze}
                    className="bg-indigo-600 text-white px-6 rounded-xl font-black text-[10px] uppercase shadow-lg active:scale-95 transition-all"
                >
                    Sync
                </button>
            </div>
        </div>

        {report && (
            <div className="dark-glass-card p-8 rounded-[2.5rem] border border-indigo-500/20 space-y-6 shadow-2xl animate-in">
                <div className="text-center space-y-2">
                    <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Match Result</span>
                    <div className="text-5xl font-black italic text-white">{report.overallScore}%</div>
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full ${report.overallScore > 70 ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                        {report.relationshipType}
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Synergy</span>
                        <div className="flex flex-wrap gap-1">
                            {report.domainSynergies.map(d => (
                                <span key={d} className="text-[7px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded uppercase font-bold">
                                    {t.domains[d]}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Conflict</span>
                        <div className="flex flex-wrap gap-1">
                            {report.domainConflicts.map(d => (
                                <span key={d} className="text-[7px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-1 rounded uppercase font-bold">
                                    {t.domains[d]}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-3">
                    <span className="text-[8px] font-black text-indigo-300 uppercase tracking-widest">Strategic Protocol</span>
                    <ul className="space-y-2">
                        {report.recommendations.map((r, i) => (
                            <li key={i} className="text-[10px] text-slate-300 font-medium leading-tight flex gap-2">
                                <span className="text-indigo-500">•</span> {r}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        )}
    </section>
  );
};
