import React, { useState } from 'react';
import api from '../services/api';
import { PackageCheck, FileJson, FileText, CheckCircle2, ShieldCheck, Download, Loader2 } from 'lucide-react';

export const AuditPackExporter: React.FC = () => {
  const [loadingJSON, setLoadingJSON] = useState(false);
  const [loadingPDF, setLoadingPDF] = useState(false);
  const [shaSeal, setShaSeal] = useState<string | null>(null);

  const handleGenerateJSON = async () => {
    setLoadingJSON(true);
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
    } catch (err: any) {
      console.error('Error generating JSON audit pack', err);
      alert('Error: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoadingJSON(false);
    }
  };

  const handleDownloadPDF = async () => {
    setLoadingPDF(true);
    try {
      const res = await api.get('/audit-packs/download-pdf', { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Veterinary_Compliance_Official_Attestation_${Date.now()}.pdf`;
      a.click();
    } catch (err: any) {
      console.error('Error downloading PDF', err);
      alert('Error downloading PDF: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoadingPDF(false);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 bg-slate-900/60 shadow-xl space-y-4">
      <div className="flex items-center space-x-2.5 text-cyan-400 font-bold">
        <PackageCheck className="w-5 h-5 text-cyan-400" />
        <span className="text-sm font-extrabold uppercase tracking-wide">Cryptographically Sealed Audit Pack Generator</span>
      </div>
      <p className="text-xs text-slate-300 leading-relaxed">
        Compiles live PostgreSQL controls, SHA-256 evidence digests, clinical encounters, and immutable decision logs into a verifiable audit pack for DEA, AAHA, or State Pharmacy Board regulatory inspections.
      </p>

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          onClick={handleGenerateJSON}
          disabled={loadingJSON}
          className="flex items-center space-x-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 transition shadow disabled:opacity-50 active:scale-95"
        >
          {loadingJSON ? <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" /> : <FileJson className="w-4 h-4 text-cyan-400" />}
          <span>Export Sealed JSON Audit Bundle</span>
        </button>

        <button
          onClick={handleDownloadPDF}
          disabled={loadingPDF}
          className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 rounded-xl text-xs font-bold transition shadow-lg shadow-cyan-500/20 disabled:opacity-50 active:scale-95"
        >
          {loadingPDF ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          <span>Download Official PDF Attestation Certificate</span>
        </button>
      </div>

      {shaSeal && (
        <div className="mt-4 p-4 bg-slate-950/90 rounded-xl border border-cyan-800/60 text-xs flex items-center space-x-3 shadow-inner">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="overflow-hidden space-y-0.5">
            <p className="font-bold text-emerald-400 flex items-center gap-1.5">
              <span>Audit Pack Cryptographic Manifest Sealed & Verified</span>
            </p>
            <p className="font-mono text-[10px] text-cyan-300 truncate">SHA-256: {shaSeal}</p>
          </div>
        </div>
      )}
    </div>
  );
};
