import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  trendPositive?: boolean;
  colorTheme?: 'cyan' | 'emerald' | 'amber' | 'rose' | 'slate';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendPositive = true,
  colorTheme = 'cyan'
}) => {
  const iconColors = {
    cyan: 'bg-cyan-950/80 text-cyan-400 border-cyan-700/50',
    emerald: 'bg-emerald-950/80 text-emerald-400 border-emerald-700/50',
    amber: 'bg-amber-950/80 text-amber-400 border-amber-700/50',
    rose: 'bg-rose-950/80 text-rose-400 border-rose-700/50',
    slate: 'bg-slate-800 text-slate-300 border-slate-700'
  };

  return (
    <div className="glass-panel glass-panel-hover rounded-xl p-5 border border-slate-800 bg-slate-900/60 shadow-lg relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{title}</p>
          <h3 className="text-3xl font-extrabold text-white mt-2 font-display">{value}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg border ${iconColors[colorTheme]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center text-xs">
          <span className={`font-semibold mr-1.5 ${trendPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {trend}
          </span>
          <span className="text-slate-500">vs previous audit window</span>
        </div>
      )}
    </div>
  );
};
