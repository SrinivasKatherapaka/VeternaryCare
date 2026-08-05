import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Sliders, Database, ShieldCheck, Cpu, HardDrive } from 'lucide-react';

export const AuditLogsSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/settings')
      .then(res => {
        if (res.data.success) setSettings(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading || !settings) {
    return <div className="p-8 text-cyan-400 font-semibold text-xs">Loading Master Compliance Settings...</div>;
  }

  const { tenant, config, system_audit_info } = settings;

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
          <Sliders className="w-7 h-7 text-cyan-400" />
          <span>System Audit Trail, Master Data & AI Threshold Settings</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Master parameters for retention policies, confidence thresholds, system audit logs, and AI model configurations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Tenant Metadata */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 bg-slate-900/60 shadow-xl space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-cyan-400" />
            Hospital Tenant Profile & Licensing
          </h2>
          <div className="space-y-3 text-xs text-slate-300">
            <div>
              <p className="text-slate-400 font-semibold">Hospital Name:</p>
              <p className="font-bold text-white text-sm">{tenant.name}</p>
            </div>
            <div>
              <p className="text-slate-400 font-semibold">Veterinary State License Number:</p>
              <p className="font-mono text-cyan-300 font-bold">{tenant.license_number}</p>
            </div>
            <div>
              <p className="text-slate-400 font-semibold">Physical Facility Address:</p>
              <p className="text-slate-200">{tenant.address}</p>
            </div>
          </div>
        </div>

        {/* AI Confidence & Threshold Parameters */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 bg-slate-900/60 shadow-xl space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            AI Pipeline Confidence Thresholds
          </h2>
          <div className="space-y-3 text-xs text-slate-300">
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
              <div>
                <p className="font-bold text-white">Standard Review Queue Route</p>
                <p className="text-[11px] text-slate-400">Confidence threshold for automated routing</p>
              </div>
              <span className="font-mono text-cyan-400 font-extrabold text-sm">
                ≥ {config.confidenceThresholds.autoRouteToReview}
              </span>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
              <div>
                <p className="font-bold text-white">High Risk Low-Confidence Flag</p>
                <p className="text-[11px] text-slate-400">Confidence below which items flag as high risk</p>
              </div>
              <span className="font-mono text-rose-400 font-extrabold text-sm">
                &lt; {config.confidenceThresholds.flagLowConfidence}
              </span>
            </div>
          </div>
        </div>

        {/* Retention Policy Configuration */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-slate-800 bg-slate-900/60 shadow-xl space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400" />
            Mandatory Evidence Retention Policies (Months)
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.entries(config.retentionPoliciesMonths).map(([cat, months]) => (
              <div key={cat} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
                <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800 block truncate mb-1">
                  {cat}
                </span>
                <p className="text-xl font-extrabold text-white">{String(months)} Mos</p>
                <p className="text-[10px] text-slate-400">({(Number(months) / 12).toFixed(1)} Years)</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
