import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { MetricCard } from '../components/MetricCard';
import { StatusBadge } from '../components/StatusBadge';
import { RiskBadge } from '../components/RiskBadge';
import { ShieldCheck, AlertTriangle, FileText, CheckCircle2, ArrowUpRight, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/dashboard/metrics').then(res => {
      if (res.data.success) {
        setData(res.data);
      }
    }).finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return <div className="p-8 text-cyan-400 font-semibold text-xs">Loading Executive Compliance Dashboard...</div>;
  }

  const { metrics, domainBreakdown, recentAudits, topRisks } = data;

  return (
    <div className="p-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
            <span>Executive Compliance & Risk Command Dashboard</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time human-in-the-loop compliance monitoring across AAHA, DEA, VCPR, and State Pharmacy Board controls.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/evidence-mapping')}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-white text-xs font-bold rounded-lg shadow-lg flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            <span>Upload Clinical Evidence</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Overall Compliance Score"
          value={`${metrics.overallComplianceRate}%`}
          subtitle={`${metrics.compliantControls} of ${metrics.totalControls} Controls Certified`}
          icon={ShieldCheck}
          colorTheme={metrics.overallComplianceRate >= 80 ? 'emerald' : 'amber'}
          trend="+4.2%"
          trendPositive={true}
        />
        <MetricCard
          title="Active Residual Risks"
          value={metrics.totalActiveRisks}
          subtitle={`${metrics.criticalRisks} Critical, ${metrics.highRisks} High Severity`}
          icon={AlertTriangle}
          colorTheme={metrics.criticalRisks > 0 ? 'rose' : 'amber'}
          trend="-2 issues"
          trendPositive={true}
        />
        <MetricCard
          title="Pending Evidence Review Queue"
          value={metrics.pendingEvidenceReviews}
          subtitle={`${metrics.lowConfidenceExtractions} Flagged Low Confidence (<0.60)`}
          icon={FileText}
          colorTheme="cyan"
        />
        <MetricCard
          title="Controls Under Active Review"
          value={metrics.underReview}
          subtitle="Awaiting Human Reviewer Sign-off"
          icon={Activity}
          colorTheme="slate"
        />
      </div>

      {/* Compliance Domain Breakdown */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 bg-slate-900/60 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            Regulatory Domain Compliance Status
          </h2>
          <button
            onClick={() => navigate('/controls')}
            className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
          >
            <span>View Full Control Library</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {domainBreakdown.map((d: any) => (
            <div key={d.domain} className="p-4 bg-slate-950/80 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white truncate max-w-[200px]">{d.domain}</span>
                <span className={`text-xs font-extrabold ${d.complianceRate >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {d.complianceRate}%
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-3">
                <div
                  className={`h-full transition-all duration-500 ${d.complianceRate >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                  style={{ width: `${d.complianceRate}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>{d.compliant} / {d.controls} Controls Verified</span>
                <RiskBadge severity={d.risk} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Grid: Top Risks & Recent Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Active Risks */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 bg-slate-900/60 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              Prioritized Compliance Risk Escalations
            </h3>
            <button
              onClick={() => navigate('/risks-issues')}
              className="text-xs text-cyan-400 hover:underline"
            >
              Risk Register →
            </button>
          </div>

          <div className="space-y-3">
            {topRisks.map((risk: any) => (
              <div key={risk.id} className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{risk.title}</span>
                    <RiskBadge severity={risk.severity} />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{risk.description}</p>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <span className="text-[10px] text-slate-500 block">Due Date</span>
                  <span className="text-xs font-mono text-cyan-300 font-semibold">{risk.due_date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Audit Trail */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 bg-slate-900/60 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              Recent Human Review Decision Logs
            </h3>
            <button
              onClick={() => navigate('/decision-history')}
              className="text-xs text-cyan-400 hover:underline"
            >
              Full Decision Audit →
            </button>
          </div>

          <div className="space-y-3">
            {recentAudits.map((audit: any) => (
              <div key={audit.id} className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="font-bold text-white">{audit.actor_name} ({audit.actor_role})</span>
                  <span className="text-[10px] text-slate-500 font-mono">{audit.created_at.split('T')[0]}</span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-[10px]">
                    {audit.action}
                  </span>
                  <StatusBadge status={audit.new_status} />
                </div>
                <p className="text-[11px] text-slate-400 mt-1 italic">"{audit.reason}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
