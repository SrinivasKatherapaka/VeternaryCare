import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { RiskBadge } from '../components/RiskBadge';
import { FileCheck, Search, Filter } from 'lucide-react';
import { ComplianceControl } from '../types';

export const ControlsPage: React.FC = () => {
  const [controls, setControls] = useState<ComplianceControl[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchControls = () => {
    setLoading(true);
    api.get(`/controls?search=${search}&status=${statusFilter}`)
      .then(res => {
        if (res.data.success) setControls(res.data.controls);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchControls();
  }, [statusFilter]);

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
          <FileCheck className="w-7 h-7 text-cyan-400" />
          <span>Control Library & Policy Mapping</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Central repository mapping regulatory mandates (DEA, AAHA, State Pharmacy Board, OSHA) to hospital policies and actionable evidence controls.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by control code or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchControls()}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
          >
            <option value="">All Control Statuses</option>
            <option value="COMPLIANT">COMPLIANT</option>
            <option value="PARTIALLY_COMPLIANT">PARTIALLY COMPLIANT</option>
            <option value="NON_COMPLIANT">NON COMPLIANT</option>
            <option value="UNDER_REVIEW">UNDER REVIEW</option>
            <option value="UNTESTED">UNTESTED</option>
          </select>
        </div>
      </div>

      {/* Controls Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/60 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="p-4">Control Code</th>
                <th className="p-4">Title & Description</th>
                <th className="p-4">Regulatory Obligation</th>
                <th className="p-4">Owner</th>
                <th className="p-4">Status</th>
                <th className="p-4">Risk Level</th>
                <th className="p-4">Last Tested</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-cyan-400">Loading controls library...</td>
                </tr>
              ) : controls.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">No matching controls found.</td>
                </tr>
              ) : (
                controls.map(ctrl => (
                  <tr key={ctrl.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-4 font-mono font-bold text-cyan-300">{ctrl.control_code}</td>
                    <td className="p-4 max-w-xs">
                      <p className="font-semibold text-white">{ctrl.title}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{ctrl.description}</p>
                    </td>
                    <td className="p-4">
                      {ctrl.obligation ? (
                        <div>
                          <span className="px-2 py-0.5 text-[10px] bg-slate-800 text-cyan-300 font-mono rounded border border-slate-700">
                            {ctrl.obligation.regulatory_body}
                          </span>
                          <p className="text-[10px] text-slate-400 mt-1">{ctrl.obligation.code}</p>
                        </div>
                      ) : (
                        <span className="text-slate-500">Standard</span>
                      )}
                    </td>
                    <td className="p-4 font-medium text-slate-300">{ctrl.owner_name || 'Unassigned'}</td>
                    <td className="p-4">
                      <StatusBadge status={ctrl.status} />
                    </td>
                    <td className="p-4">
                      <RiskBadge severity={ctrl.risk_rating} />
                    </td>
                    <td className="p-4 font-mono text-[11px] text-slate-400">
                      {ctrl.last_tested_at ? ctrl.last_tested_at.split('T')[0] : 'Never'}
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
