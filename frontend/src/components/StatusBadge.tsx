import React from 'react';
import { ControlStatus } from '../types';

interface Props {
  status: ControlStatus;
}

export const StatusBadge: React.FC<Props> = ({ status }) => {
  const map: Record<ControlStatus, { bg: string; text: string; border: string; label: string }> = {
    COMPLIANT: { bg: 'bg-emerald-950/60', text: 'text-emerald-400', border: 'border-emerald-700/50', label: 'COMPLIANT' },
    NON_COMPLIANT: { bg: 'bg-rose-950/60', text: 'text-rose-400', border: 'border-rose-700/50', label: 'NON-COMPLIANT' },
    PARTIALLY_COMPLIANT: { bg: 'bg-amber-950/60', text: 'text-amber-400', border: 'border-amber-700/50', label: 'PARTIALLY COMPLIANT' },
    UNDER_REVIEW: { bg: 'bg-sky-950/60', text: 'text-sky-400', border: 'border-sky-700/50', label: 'UNDER REVIEW' },
    UNTESTED: { bg: 'bg-slate-800', text: 'text-slate-400', border: 'border-slate-700', label: 'UNTESTED' }
  };

  const style = map[status] || map.UNTESTED;

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${style.bg} ${style.text} ${style.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${style.text.replace('text', 'bg')}`}></span>
      {style.label}
    </span>
  );
};
