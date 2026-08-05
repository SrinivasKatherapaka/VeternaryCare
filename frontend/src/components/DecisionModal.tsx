import React, { useState } from 'react';
import api from '../services/api';
import { ShieldAlert, CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react';
import { ControlStatus, ReviewAction } from '../types';

interface Props {
  evidenceId: string;
  controlId: string;
  controlCode: string;
  currentStatus: ControlStatus;
  aiGrounding?: string;
  aiConfidence?: number;
  onClose: () => void;
  onSuccess: () => void;
}

export const DecisionModal: React.FC<Props> = ({
  evidenceId,
  controlId,
  controlCode,
  currentStatus,
  aiGrounding,
  aiConfidence,
  onClose,
  onSuccess
}) => {
  const [action, setAction] = useState<ReviewAction>('ACCEPT');
  const [newStatus, setNewStatus] = useState<ControlStatus>('COMPLIANT');
  const [reason, setReason] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (reason.trim().length < 10) {
      setError('Override rationale must be at least 10 characters long to ensure defensible audit trails.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await api.post('/evidence/review', {
        evidence_id: evidenceId,
        control_id: controlId,
        action,
        new_status: newStatus,
        reason
      });

      if (res.data.success) {
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit decision.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 text-cyan-400 font-bold mb-4">
          <ShieldAlert className="w-6 h-6" />
          <span className="text-lg">Human-in-the-Loop Review Sign-off</span>
        </div>

        <p className="text-xs text-slate-300 mb-4">
          Control Code: <span className="font-mono text-cyan-300 font-bold">{controlCode}</span> | Current State: <span className="font-semibold text-white">{currentStatus}</span>
        </p>

        {aiGrounding && (
          <div className="mb-4 p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs">
            <p className="font-semibold text-cyan-400">Gemini AI Grounding Rationale ({(aiConfidence! * 100).toFixed(1)}% Confidence):</p>
            <p className="text-slate-300 mt-1 italic">"{aiGrounding}"</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Review Action</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'ACCEPT', label: 'Accept AI', icon: CheckCircle },
                { key: 'OVERRIDE', label: 'Override AI', icon: AlertTriangle },
                { key: 'REJECT', label: 'Reject Evidence', icon: XCircle }
              ].map(item => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setAction(item.key as ReviewAction);
                    if (item.key === 'ACCEPT') setNewStatus('COMPLIANT');
                    if (item.key === 'OVERRIDE') setNewStatus('PARTIALLY_COMPLIANT');
                    if (item.key === 'REJECT') setNewStatus('NON_COMPLIANT');
                  }}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center space-x-1.5 transition ${
                    action === item.key
                      ? 'bg-cyan-950 border-cyan-500 text-cyan-300 shadow'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <item.icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Target Control Status</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as ControlStatus)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
            >
              <option value="COMPLIANT">COMPLIANT</option>
              <option value="PARTIALLY_COMPLIANT">PARTIALLY COMPLIANT</option>
              <option value="NON_COMPLIANT">NON COMPLIANT</option>
              <option value="UNDER_REVIEW">UNDER REVIEW</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Mandatory Rationale & Override Justification (Min 10 chars)
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Specify precise clinical verification, license cross-check, or reason for overriding AI recommendation..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>

        {error && (
          <div className="mt-3 p-2.5 bg-rose-950/60 border border-rose-800 rounded-lg text-xs text-rose-300">
            {error}
          </div>
        )}

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-lg text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold shadow-lg transition"
          >
            {submitting ? 'Signing Audit Trail...' : 'Confirm Sign-off'}
          </button>
        </div>
      </div>
    </div>
  );
};
