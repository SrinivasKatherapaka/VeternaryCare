import React, { useState } from 'react';
import api from '../services/api';
import { PackageCheck, FileJson, FileText, CheckCircle2 } from 'lucide-react';

export const AuditPackExporter: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [shaSeal, setShaSeal] = useState<string | null>(null);

  const handleGenerateJSON = async () => {
    setLoading(true);
    try {
      const res = await api.post('/audit-packs/generate');
      if (res.data.success) {
        setShaSeal(res.data.sha256_seal);

        // Download JSON blob
        const blob = new Blob([JSON.stringify(res.data.audit_pack, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Veterinary_Compliance_Audit_Pack_${Date.now()}.json`;
        a.click();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    window.open('/api/v1/audit-packs/download-pdf', '_blank');
  };

  return (
    <div className="glass-panel rounded-xl p-6 border border-slate-800 bg-slate-900/60 shadow-xl">
      <div className="flex items-center space-x-2 text-cyan-400 font-bold mb-2">
        <PackageCheck className="w-5 h-5 text-cyan-400" />
        <span className="text-sm">Cryptographically Sealed Audit Pack Generator</span>
      </div>
      <p className="text-xs text-slate-300 mb-4">
        Compiles active controls, SHA-256 evidence digests, and immutable decision logs into a verifiable audit pack for DEA, AAHA, or State Pharmacy Board inspection.
      </p>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleGenerateJSON}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold border border-slate-700 transition shadow"
        >
          <FileJson className="w-4 h-4 text-cyan-400" />
          <span>Export Sealed JSON Audit Bundle</span>
        </button>

        <button
          onClick={handleDownloadPDF}
          className="flex items-center space-x-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition shadow-lg"
        >
          <FileText className="w-4 h-4" />
          <span>Download Official PDF Attestation Certificate</span>
        </button>
      </div>

      {shaSeal && (
        <div className="mt-4 p-3 bg-slate-950 rounded-lg border border-cyan-950 text-xs flex items-center space-x-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="overflow-hidden">
            <p className="font-semibold text-emerald-400">Audit Pack Cryptographic Seal Verified</p>
            <p className="font-mono text-[10px] text-cyan-400 truncate">SHA-256: {shaSeal}</p>
          </div>
        </div>
      )}
    </div>
  );
};
