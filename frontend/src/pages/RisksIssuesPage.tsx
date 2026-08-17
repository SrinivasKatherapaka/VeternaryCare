import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { RiskBadge } from '../components/RiskBadge';
import { ShieldAlert, Plus, CheckCircle, AlertTriangle, Calendar, UserCheck, Sparkles, Filter } from 'lucide-react';
import { RiskIssue, ComplianceControl, User } from '../types';

export const RisksIssuesPage: React.FC = () => {
  const [risks, setRisks] = useState<RiskIssue[]>([]);
  const [controls, setControls] = useState<ComplianceControl[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState<string>('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [formData, setFormData] = useState({
    control_id: '',
    title: '',
    description: '',
    severity: 'HIGH',
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    assigned_to: '',
    root_cause: '',
    remediation_plan: ''
  });

  const fetchRisks = async () => {
    setLoading(true);
    try {
      const [risksRes, ctrlRes, userRes] = await Promise.all([
        api.get('/risks'),
        api.get('/controls'),
        api.get('/users').catch(() => ({ data: { success: false, users: [] } }))
      ]);
      if (risksRes.data.success) setRisks(risksRes.data.risks);
      if (ctrlRes.data.success) setControls(ctrlRes.data.controls);
      if (userRes.data.success) setUsers(userRes.data.users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
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

  const handleCreateRisk = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/risks', formData);
      if (res.data.success) {
        setShowNewModal(false);
        setFormData({
          control_id: '',
          title: '',
          description: '',
          severity: 'HIGH',
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          assigned_to: '',
          root_cause: '',
          remediation_plan: ''
        });
        fetchRisks();
      }
    } catch (err: any) {
      alert('Error creating risk item: ' + (err.response?.data?.error || err.message));
    }
  };

  const filteredRisks = severityFilter
    ? risks.filter(r => r.severity === severityFilter)
    : risks;

  const activeRisksCount = risks.filter(r => !r.is_resolved).length;
  const criticalCount = risks.filter(r => !r.is_resolved && r.severity === 'CRITICAL').length;
  const highCount = risks.filter(r => !r.is_resolved && r.severity === 'HIGH').length;

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-700/60 text-rose-400 text-xs font-semibold mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Pillar 6: Risk Register & Corrective Remediation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>Risk Register & Corrective Actions</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Centralized tracking of compliance deficits, DEA safe discrepancies, missing consent forms, and root cause corrective action plans with SLA countdowns.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-lg shadow-rose-600/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Log Compliance Deficit</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/60 flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/40 text-rose-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Critical Risks</p>
            <p className="text-2xl font-bold text-rose-400 mt-0.5">{criticalCount}</p>
            <p className="text-[10px] text-rose-300">&lt; 3 Day Target SLA</p>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/60 flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-amber-950/60 border border-amber-800/40 text-amber-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">High Severity Risks</p>
            <p className="text-2xl font-bold text-amber-400 mt-0.5">{highCount}</p>
            <p className="text-[10px] text-amber-300">&lt; 7 Day Target SLA</p>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/60 flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-cyan-950/60 border border-cyan-800/40 text-cyan-400">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Total Active Issues</p>
            <p className="text-2xl font-bold text-cyan-400 mt-0.5">{activeRisksCount}</p>
            <p className="text-[10px] text-slate-400">Across all regulatory controls</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="text-xs text-slate-300 font-semibold flex items-center gap-2">
          <Filter className="w-4 h-4 text-cyan-400" />
          <span>Filter by Severity:</span>
        </div>

        <div className="flex gap-2">
          {['', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(sev => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                severityFilter === sev
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {sev === '' ? 'All Severities' : sev}
            </button>
          ))}
        </div>
      </div>

      {/* Risk Items Feed */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="p-8 text-center text-cyan-400 text-xs font-semibold">Loading live risk register...</div>
        ) : filteredRisks.length === 0 ? (
          <div className="glass-panel rounded-xl p-8 text-center border border-slate-800 bg-slate-900/60">
            <p className="text-emerald-400 font-bold text-sm">🎉 Zero Active Risk Deficits</p>
            <p className="text-xs text-slate-400 mt-1">All compliance deficits have been successfully remediated.</p>
          </div>
        ) : (
          filteredRisks.map(risk => (
            <div
              key={risk.id}
              className={`glass-panel rounded-2xl p-6 border transition ${
                risk.is_resolved
                  ? 'border-slate-800 bg-slate-900/40 opacity-75'
                  : risk.severity === 'CRITICAL'
                  ? 'border-rose-600/50 bg-rose-950/20 shadow-lg shadow-rose-600/5'
                  : 'border-slate-800 bg-slate-900/70 shadow-lg'
              } flex flex-col md:flex-row md:items-center justify-between gap-6`}
            >
              <div className="space-y-2.5 max-w-3xl flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-extrabold text-white text-sm">{risk.title}</span>
                  <RiskBadge severity={risk.severity} />
                  {risk.control_code && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950 text-cyan-400 border border-slate-800">
                      {risk.control_code}
                    </span>
                  )}
                  {risk.is_resolved && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                      RESOLVED
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300">{risk.description}</p>

                {risk.root_cause && (
                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs space-y-1">
                    <p className="text-slate-400 font-medium"><strong className="text-white">Root Cause: </strong>{risk.root_cause}</p>
                    {risk.remediation_plan && (
                      <p className="text-cyan-300 font-medium"><strong className="text-cyan-400">Remediation Plan: </strong>{risk.remediation_plan}</p>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1 font-mono">
                  <span>Assigned Owner: <strong className="text-white">{risk.assigned_to_name || 'Marcus Vance, LVT'}</strong></span>
                  <span>&bull;</span>
                  <span>Target SLA: <strong className="text-cyan-300">{risk.due_date}</strong></span>
                </div>
              </div>

              {!risk.is_resolved && (
                <button
                  onClick={() => handleResolve(risk.id)}
                  className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition shadow flex items-center justify-center space-x-1.5 shrink-0 active:scale-95"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Mark Resolved</span>
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Log New Risk Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Log New Compliance Risk Deficit</span>
              </h2>
              <button onClick={() => setShowNewModal(false)} className="text-slate-400 hover:text-white text-sm">✕</button>
            </div>

            <form onSubmit={handleCreateRisk} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Affected Compliance Control</label>
                <select
                  required
                  value={formData.control_id}
                  onChange={(e) => setFormData({ ...formData, control_id: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="">-- Select Control --</option>
                  {controls.map(c => (
                    <option key={c.id} value={c.id}>
                      [{c.control_code}] {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Deficit Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Missing Witness Co-Signature on Safe Disposal"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Severity Rating</label>
                <select
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="CRITICAL">CRITICAL (Immediate Inspection Risk)</option>
                  <option value="HIGH">HIGH (&lt; 7 Days Target SLA)</option>
                  <option value="MEDIUM">MEDIUM (&lt; 14 Days Target SLA)</option>
                  <option value="LOW">LOW (Informational / Minor)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Assignee</label>
                  <select
                    value={formData.assigned_to}
                    onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="">-- Choose User --</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.full_name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Target Due Date</label>
                  <input
                    type="date"
                    required
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Deficit Description</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Describe the regulatory shortfall or documentation defect..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Root Cause & Remediation Plan</label>
                <textarea
                  rows={2}
                  placeholder="Identify root cause and planned corrective actions..."
                  value={formData.remediation_plan}
                  onChange={(e) => setFormData({ ...formData, remediation_plan: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/20"
                >
                  Log Risk to PostgreSQL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
