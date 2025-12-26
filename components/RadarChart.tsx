
import React, { memo } from 'react';
import { translations } from '../translations';

interface RadarChartProps {
  points: { x: number; y: number }[];
  onLabelClick: (metric: string) => void;
  className?: string;
  lang: 'ru' | 'ka';
}

export const RadarChart: React.FC<RadarChartProps> = memo(({ points, onLabelClick, className = "", lang }) => {
  const t = translations[lang];
  
  const handleInteraction = (metric: string) => {
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.('light');
    onLabelClick(metric);
  };

  return (
    <div className={`relative w-64 h-64 mx-auto ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible opacity-30 select-none">
        <circle cx="50" cy="50" r="45" fill="none" stroke="#94a3b8" strokeWidth="0.5" />
        <circle cx="50" cy="50" r="30" fill="none" stroke="#94a3b8" strokeDasharray="2 2" strokeWidth="0.5" />
        <circle cx="50" cy="50" r="15" fill="none" stroke="#94a3b8" strokeDasharray="1 3" strokeWidth="0.5" />
        <line x1="50" y1="5" x2="50" y2="50" stroke="#94a3b8" strokeWidth="0.5" />
        <line x1="50" y1="50" x2="90" y2="85" stroke="#94a3b8" strokeWidth="0.5" />
        <line x1="50" y1="50" x2="10" y2="85" stroke="#94a3b8" strokeWidth="0.5" />
      </svg>
      
      <svg viewBox="0 0 100 100" className="absolute top-0 left-0 w-full h-full overflow-visible drop-shadow-xl">
        <polygon 
          points={`${points[0].x},${points[0].y} ${points[1].x},${points[1].y} ${points[2].x},${points[2].y}`}
          fill="rgba(99, 102, 241, 0.2)"
          stroke="#6366f1"
          strokeWidth="2"
          strokeLinejoin="round"
          className="animate-in"
        />
        
        <circle cx={points[0].x} cy={points[0].y} r="2" fill="#6366f1" className="animate-pulse" />
        <circle cx={points[1].x} cy={points[1].y} r="2" fill="#6366f1" className="animate-pulse" style={{ animationDelay: "0.2s" }} />
        <circle cx={points[2].x} cy={points[2].y} r="2" fill="#6366f1" className="animate-pulse" style={{ animationDelay: "0.4s" }} />

        <g onClick={(e) => { e.stopPropagation(); handleInteraction('foundation'); }} className="cursor-pointer hover:opacity-70 transition-opacity">
          <rect x="30" y="-15" width="40" height="20" fill="transparent" />
          <text x="50" y="-5" textAnchor="middle" className="text-[9px] fill-slate-600 font-black uppercase tracking-widest">
            {t.domains.foundation}
          </text>
        </g>

        <g onClick={(e) => { e.stopPropagation(); handleInteraction('money'); }} className="cursor-pointer hover:opacity-70 transition-opacity">
          <rect x="70" y="85" width="40" height="20" fill="transparent" />
          <text x="98" y="98" textAnchor="middle" className="text-[9px] fill-slate-600 font-black uppercase tracking-widest">
            {t.domains.money}
          </text>
        </g>

        <g onClick={(e) => { e.stopPropagation(); handleInteraction('agency'); }} className="cursor-pointer hover:opacity-70 transition-opacity">
          <rect x="-10" y="85" width="40" height="20" fill="transparent" />
          <text x="2" y="98" textAnchor="middle" className="text-[9px] fill-slate-600 font-black uppercase tracking-widest">
            {t.domains.agency}
          </text>
        </g>
      </svg>
    </div>
  );
});
