import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { History, UserCheck, Shield } from 'lucide-react';
import { DecisionAuditLog } from '../types';

export const DecisionHistoryPage: React.FC = () => {
  const [logs, setLogs] = useState<DecisionAuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/audit/decisions')
      .then(res => {
        if (res.data.success) setLogs(res.data.audit_logs);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
          <History className="w-7 h-7 text-cyan-400" />
          <span>Immutable Decision & Override Audit History</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Cryptographically auditable record of all Human-in-the-Loop review actions, override rationales, and state transitions.
        </p>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/60 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="p-4">Timestamp</th>
                <th className="p-4">Reviewer Actor</th>
                <th className="p-4">Role</th>
                <th className="p-4">Action</th>
                <th className="p-4">Control Code</th>
                <th className="p-4">State Transition</th>
                <th className="p-4">Mandatory Override Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-cyan-400">Loading audit history...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">No decision logs recorded yet.</td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-4 font-mono text-[11px] text-slate-400">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="p-4 font-semibold text-white flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{log.actor_name}</span>
                    </td>
                    <td className="p-4 font-mono text-[10px] text-cyan-300">{log.actor_role}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-slate-800 text-sky-300 border border-slate-700">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-bold text-cyan-400">{log.control_code}</td>
                    <td className="p-4">
                      <div className="flex items-center space-x-1 text-[11px]">
                        <StatusBadge status={log.previous_status} />
                        <span className="text-slate-500 font-bold">→</span>
                        <StatusBadge status={log.new_status} />
                      </div>
                    </td>
                    <td className="p-4 max-w-xs text-slate-300 italic">
                      "{log.reason}"
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
