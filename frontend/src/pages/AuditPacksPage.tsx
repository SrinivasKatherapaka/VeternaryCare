import React from 'react';
import { AuditPackExporter } from '../components/AuditPackExporter';
import { PackageCheck, ShieldCheck, FileCheck, Award } from 'lucide-react';

export const AuditPacksPage: React.FC = () => {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
          <PackageCheck className="w-7 h-7 text-cyan-400" />
          <span>Audit Pack Compilation, Lineage & Export Center</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Dynamic compilation of controls, evidence hashes, human review logs, and attestation certificates into cryptographically sealed audit bundles.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <AuditPackExporter />
        </div>

        <div className="glass-panel rounded-xl p-6 border border-slate-800 bg-slate-900/60 shadow-xl space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <Award className="w-4 h-4 text-cyan-400" />
            Regulatory Attestation Standards
          </h3>
          <div className="space-y-3 text-xs text-slate-300">
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <p className="font-bold text-white mb-0.5">DEA 21 CFR §1304 Compliance</p>
              <p className="text-[11px] text-slate-400">
                Guarantees immutable 5-year retention lineage for Ketamine, Midazolam, and Buprenorphine safe logs.
              </p>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <p className="font-bold text-white mb-0.5">AAHA Standard SUR-04 Audit</p>
              <p className="text-[11px] text-slate-400">
                Verifies 100% pre-surgical anesthesia consent forms signed with CPR preferences.
              </p>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <p className="font-bold text-white mb-0.5">State Board VCPR Licensing</p>
              <p className="text-[11px] text-slate-400">
                Tracks DVM state license tags and active 12-month patient exam records.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
