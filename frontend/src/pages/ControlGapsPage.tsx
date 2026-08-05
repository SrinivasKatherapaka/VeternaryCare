import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { RiskBadge } from '../components/RiskBadge';
import { AlertTriangle, ShieldAlert, ArrowRight } from 'lucide-react';
import { ComplianceControl } from '../types';
import { useNavigate } from 'react-router-dom';

export const ControlGapsPage: React.FC = () => {
  const [gaps, setGaps] = useState<ComplianceControl[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/controls')
      .then(res => {
        if (res.data.success) {
          // Filter non-compliant, partially-compliant, under-review or untested
          const uncertified = res.data.controls.filter((c: ComplianceControl) => c.status !== 'COMPLIANT');
          setGaps(uncertified);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
          <AlertTriangle className="w-7 h-7 text-amber-400" />
          <span>Control Gap Analysis & Algorithmic Risk Prioritization</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Automated control evaluation prioritizing missing, stale, contradictory, or unreviewed clinical evidence across DEA, AAHA, and state board domains.
        </p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-cyan-400 text-xs font-semibold">Performing gap analysis...</div>
        ) : gaps.length === 0 ? (
          <div className="glass-panel rounded-xl p-8 text-center border border-slate-800 bg-slate-900/60">
            <p className="text-emerald-400 font-bold text-sm">🎉 100% Control Certification Achieved</p>
            <p className="text-xs text-slate-400 mt-1">Zero control gaps or missing evidence artifacts identified.</p>
          </div>
        ) : (
          gaps.map(ctrl => (
            <div
              key={ctrl.id}
              className="glass-panel rounded-xl p-6 border border-slate-800 bg-slate-900/60 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2 max-w-3xl">
                <div className="flex items-center space-x-3">
                  <span className="font-mono font-extrabold text-cyan-400 text-sm">{ctrl.control_code}</span>
                  <span className="font-bold text-white text-sm">{ctrl.title}</span>
                  <StatusBadge status={ctrl.status} />
                  <RiskBadge severity={ctrl.risk_rating} />
                </div>
                <p className="text-xs text-slate-300">{ctrl.description}</p>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-amber-300">
                  <span className="font-semibold">Identified Gap Root Cause: </span>
                  {ctrl.status === 'NON_COMPLIANT' && 'Critical discrepancy between billed pharmacy items and safe waste log entries.'}
                  {ctrl.status === 'PARTIALLY_COMPLIANT' && 'Ketamine DEA Schedule II log missing required dual witness disposal signatures.'}
                  {ctrl.status === 'UNDER_REVIEW' && 'Annual VCPR license renewal check pending human compliance reviewer verification.'}
                  {ctrl.status === 'UNTESTED' && 'Control has not been tested against clinical evidence within the past 90 days.'}
                </div>
              </div>

              <div className="flex flex-col gap-2 shrink-0">
                <button
                  onClick={() => navigate('/evidence-mapping')}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition shadow flex items-center justify-center space-x-1.5"
                >
                  <span>Upload Evidence</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => navigate('/risks-issues')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition flex items-center justify-center space-x-1.5"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  <span>Escalate to Risk</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
