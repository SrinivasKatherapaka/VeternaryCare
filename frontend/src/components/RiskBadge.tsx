import React from 'react';
import { RiskSeverity } from '../types';

interface Props {
  severity: RiskSeverity;
}

export const RiskBadge: React.FC<Props> = ({ severity }) => {
  const map: Record<RiskSeverity, { bg: string; text: string; border: string }> = {
    LOW: { bg: 'bg-slate-800', text: 'text-slate-300', border: 'border-slate-700' },
    MEDIUM: { bg: 'bg-amber-950/40', text: 'text-amber-300', border: 'border-amber-700/50' },
    HIGH: { bg: 'bg-orange-950/40', text: 'text-orange-400', border: 'border-orange-700/50' },
    CRITICAL: { bg: 'bg-rose-950/60', text: 'text-rose-400', border: 'border-rose-700/60' }
  };

  const style = map[severity] || map.LOW;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${style.bg} ${style.text} ${style.border}`}>
      {severity}
    </span>
  );
};
