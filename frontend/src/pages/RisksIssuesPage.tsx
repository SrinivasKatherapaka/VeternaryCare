import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { RiskBadge } from '../components/RiskBadge';
import { ShieldAlert, Plus, CheckCircle } from 'lucide-react';
import { RiskIssue } from '../types';

export const RisksIssuesPage: React.FC = () => {
  const [risks, setRisks] = useState<RiskIssue[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRisks = () => {
    setLoading(true);
    api.get('/risks')
      .then(res => {
        if (res.data.success) setRisks(res.data.risks);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRisks();
  }, []);

  const handleResolve = async (id: string) => {
    try {
      const res = await api.patch(`/risks/${id}/resolve`);
      if (res.data.success) fetchRisks();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
            <ShieldAlert className="w-7 h-7 text-rose-400" />
            <span>Risk Register & Remediation Tracking</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Algorithmic and human escalation register tracking control deficits, DEA discrepancies, and remediation target dates.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="p-8 text-center text-cyan-400 text-xs font-semibold">Loading risk register...</div>
        ) : risks.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">No active risk items found.</div>
        ) : (
          risks.map(risk => (
            <div
              key={risk.id}
              className={`glass-panel rounded-xl p-5 border ${risk.is_resolved ? 'border-slate-800 bg-slate-900/40 opacity-70' : 'border-rose-900/40 bg-slate-900/70'} shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4`}
            >
              <div className="space-y-1 max-w-2xl">
                <div className="flex items-center space-x-3">
                  <span className="font-extrabold text-white text-sm">{risk.title}</span>
                  <RiskBadge severity={risk.severity} />
                  {risk.is_resolved && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                      RESOLVED
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300">{risk.description}</p>
                <div className="flex items-center space-x-4 text-[11px] text-slate-400 pt-2 font-mono">
                  <span>Assigned: <strong className="text-white">{risk.assigned_to_name || 'Unassigned'}</strong></span>
                  <span>Target Due Date: <strong className="text-cyan-300">{risk.due_date}</strong></span>
                </div>
              </div>

              {!risk.is_resolved && (
                <button
                  onClick={() => handleResolve(risk.id)}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition shadow flex items-center space-x-1.5 shrink-0"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Mark Resolved</span>
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
