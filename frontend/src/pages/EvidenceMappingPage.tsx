import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { EvidenceDropzone } from '../components/EvidenceDropzone';
import { DecisionModal } from '../components/DecisionModal';
import { FileText, ShieldCheck, Cpu, AlertCircle, Sparkles } from 'lucide-react';
import { EvidenceArtifact } from '../types';

export const EvidenceMappingPage: React.FC = () => {
  const [evidenceList, setEvidenceList] = useState<EvidenceArtifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArtifact, setSelectedArtifact] = useState<EvidenceArtifact | null>(null);

  const fetchEvidence = () => {
    setLoading(true);
    api.get('/evidence')
      .then(res => {
        if (res.data.success) setEvidenceList(res.data.evidence);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEvidence();
  }, []);

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
          <FileText className="w-7 h-7 text-cyan-400" />
          <span>AI Evidence Classification & Ingestion Engine</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Server-side Gemini 2.5 Pro / Flash document parsing with SHA-256 cryptographic lineage, confidence scoring, and automated compliance gap extraction.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Column */}
        <div className="lg:col-span-1">
          <EvidenceDropzone onUploadSuccess={() => fetchEvidence()} />
        </div>

        {/* Evidence Artifacts Queue */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            Ingested Evidence Queue & Grounding Explorer
          </h2>

          {loading ? (
            <div className="p-8 text-center text-cyan-400 text-xs font-semibold">Loading evidence artifacts...</div>
          ) : evidenceList.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">No evidence artifacts uploaded yet.</div>
          ) : (
            evidenceList.map(item => (
              <div key={item.id} className="glass-panel rounded-xl p-5 border border-slate-800 bg-slate-900/60 shadow-lg space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-extrabold text-white text-sm">{item.file_name}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
                        {item.category}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Model: <strong className="text-slate-200">{item.ai_model_version}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-800 text-cyan-400 border border-slate-700">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Confidence: {(item.ai_confidence * 100).toFixed(1)}%</span>
                    </div>
                    <span className="block text-[10px] text-slate-500 font-mono mt-1">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* SHA-256 Hash Digest */}
                <div className="p-2 bg-slate-950 rounded border border-slate-800 text-[10px] font-mono text-slate-400 truncate">
                  <span className="text-cyan-400">SHA-256: </span>{item.file_sha256}
                </div>

                {/* Grounding Explanation */}
                <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 text-xs text-slate-300">
                  <p className="font-semibold text-cyan-400 mb-1">AI Grounding Rationale:</p>
                  <p className="italic">"{item.ai_grounding_explanation}"</p>
                </div>

                {/* Identified Gaps Alert */}
                {item.identified_gaps && item.identified_gaps.length > 0 && (
                  <div className="p-3 bg-rose-950/40 border border-rose-900/60 rounded-lg text-xs text-rose-300">
                    <p className="font-semibold flex items-center gap-1.5 text-rose-400 mb-1">
                      <AlertCircle className="w-4 h-4" />
                      Compliance Gaps Identified ({item.identified_gaps.length}):
                    </p>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                      {item.identified_gaps.map((gap, i) => (
                        <li key={i}>{gap}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action Bar */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <span className={`text-xs font-semibold ${item.is_reviewed ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {item.is_reviewed ? '✓ Reviewed & Certified' : '⚠ Pending Human Sign-off'}
                  </span>

                  <button
                    onClick={() => setSelectedArtifact(item)}
                    className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition shadow flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{item.is_reviewed ? 'Re-Audit Decision' : 'Submit Human Review'}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Review Modal */}
      {selectedArtifact && (
        <DecisionModal
          evidenceId={selectedArtifact.id}
          controlId={selectedArtifact.control_id || 'ctrl-101'}
          controlCode={selectedArtifact.control_code || 'CTRL-DEA-LOG-01'}
          currentStatus="UNDER_REVIEW"
          aiGrounding={selectedArtifact.ai_grounding_explanation}
          aiConfidence={selectedArtifact.ai_confidence}
          onClose={() => setSelectedArtifact(null)}
          onSuccess={() => fetchEvidence()}
        />
      )}
    </div>
  );
};
