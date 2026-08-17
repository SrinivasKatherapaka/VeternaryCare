import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { RiskBadge } from '../components/RiskBadge';
import { AlertTriangle, ShieldAlert, ArrowRight, Activity, Filter, CheckCircle2 } from 'lucide-react';
import { ControlGapItem } from '../types';
import { useNavigate } from 'react-router-dom';

export const ControlGapsPage: React.FC = () => {
  const [gaps, setGaps] = useState<ControlGapItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/risks/gaps')
      .then(res => {
        if (res.data.success) {
          setGaps(res.data.gaps);
        }
      })
      .catch(err => {
        console.error('Error fetching gaps', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredGaps = filterType
    ? gaps.filter(g => g.gap_type === filterType)
    : gaps;

  const criticalGapsCount = gaps.filter(g => g.priority_score >= 80).length;
  const missingEvidenceCount = gaps.filter(g => g.gap_type === 'MISSING_EVIDENCE').length;
  const unreviewedCount = gaps.filter(g => g.gap_type === 'UNREVIEWED_EVIDENCE').length;

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-700/60 text-amber-400 text-xs font-semibold mb-2">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Pillar 5: Control Gap & Risk Prioritization Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <span>Control Gap & Algorithmic Risk Matrix</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-3xl">
          Automated algorithmic risk score engine prioritizing missing evidence, stale tests, low AI confidence scores, and unreviewed documentation across regulatory frameworks.
        </p>
      </div>

      {/* Gap Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/60 flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/40 text-rose-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">High-Priority Gaps</p>
            <p className="text-2xl font-bold text-rose-400 mt-0.5">{criticalGapsCount}</p>
            <p className="text-[10px] text-slate-400">Score &ge; 80 / 100</p>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/60 flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-amber-950/60 border border-amber-800/40 text-amber-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Missing Evidence</p>
            <p className="text-2xl font-bold text-amber-400 mt-0.5">{missingEvidenceCount}</p>
            <p className="text-[10px] text-slate-400">Zero documents attached</p>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/60 flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-cyan-950/60 border border-cyan-800/40 text-cyan-400">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Pending Review</p>
            <p className="text-2xl font-bold text-cyan-400 mt-0.5">{unreviewedCount}</p>
            <p className="text-[10px] text-slate-400">Needs human sign-off</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="text-xs text-slate-300 font-semibold flex items-center gap-2">
          <Filter className="w-4 h-4 text-cyan-400" />
          <span>Filter Gap Categories</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {['', 'DEFICIT_FAILED', 'PARTIAL_GAP', 'MISSING_EVIDENCE', 'UNREVIEWED_EVIDENCE', 'NONE'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                filterType === type
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {type === '' ? 'All Gaps' : type.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Gaps Prioritization Matrix */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-cyan-400 text-xs font-semibold">Calculating dynamic control gap priority matrix...</div>
        ) : filteredGaps.length === 0 ? (
          <div className="glass-panel rounded-xl p-8 text-center border border-slate-800 bg-slate-900/60">
            <p className="text-emerald-400 font-bold text-sm">🎉 Zero Gaps Found in Selected Filter</p>
            <p className="text-xs text-slate-400 mt-1">All selected controls have active, verified evidence.</p>
          </div>
        ) : (
          filteredGaps.map(gap => {
            const scoreColor = gap.priority_score >= 80 ? 'text-rose-400' : (gap.priority_score >= 60 ? 'text-amber-400' : 'text-emerald-400');
            const barBg = gap.priority_score >= 80 ? 'bg-rose-500' : (gap.priority_score >= 60 ? 'bg-amber-500' : 'bg-emerald-500');

            return (
              <div
                key={gap.control_id}
                className="glass-panel rounded-2xl p-6 border border-slate-800 bg-slate-900/60 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-slate-700 transition"
              >
                <div className="space-y-2.5 max-w-3xl flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono font-extrabold text-cyan-300 text-sm">{gap.control_code}</span>
                    <span className="font-bold text-white text-sm">{gap.title}</span>
                    <StatusBadge status={gap.status} />
                    <RiskBadge severity={gap.risk_rating} />
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                      {gap.regulatory_body}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300">{gap.obligation_title}</p>

                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-amber-300">
                    <span className="font-semibold text-white">Gap Finding: </span>
                    <span>{gap.gap_description}</span>
                  </div>

                  <div className="flex items-center gap-4 text-[11px] text-slate-400">
                    <span>Assigned Owner: <strong className="text-slate-200">{gap.owner_name || 'Unassigned'}</strong></span>
                    <span>&bull;</span>
                    <span>Attached Evidence: <strong className="text-cyan-400">{gap.evidence_count} artifact(s)</strong></span>
                  </div>
                </div>

                {/* Score & Actions */}
                <div className="flex flex-col items-end gap-3 shrink-0 min-w-[200px]">
                  <div className="w-full text-right">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="text-slate-400">Priority Score:</span>
                      <span className={`font-mono font-extrabold text-base ${scoreColor}`}>{gap.priority_score} / 100</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className={`h-full ${barBg} transition-all duration-500`} style={{ width: `${gap.priority_score}%` }}></div>
                    </div>
                  </div>

                  <div className="flex gap-2 w-full">
                    <button
                      onClick={() => navigate('/evidence-mapping')}
                      className="flex-1 px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs transition shadow flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <span>Upload Evidence</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => navigate('/risks-issues')}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-rose-300 rounded-lg text-xs font-semibold border border-slate-700 transition flex items-center justify-center gap-1"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Escalate</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
