import React, { useState } from 'react';
import api from '../services/api';
import { Upload, FileText, CheckCircle, AlertCircle, ShieldCheck } from 'lucide-react';
import { EvidenceCategory } from '../types';

interface Props {
  onUploadSuccess: (artifact: any) => void;
}

export const EvidenceDropzone: React.FC<Props> = ({ onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState<EvidenceCategory>('SURGICAL_CONSENT');
  const [sha256Preview, setSha256Preview] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const categories: { key: EvidenceCategory; label: string }[] = [
    { key: 'SURGICAL_CONSENT', label: 'Surgical & Anesthesia Consent' },
    { key: 'CONTROLLED_DRUG_LOG', label: 'DEA Controlled Drug Safe Log' },
    { key: 'PRESCRIPTION_CONTROLLED_SUBSTANCE', label: 'Controlled Rx & VCPR Record' },
    { key: 'VACCINATION_CERTIFICATE', label: 'Zoonotic Rabies Vaccination Cert' },
    { key: 'DIAGNOSTIC_LAB_REPORT', label: 'Diagnostic Bloodwork Lab Report' },
    { key: 'ITEMIZED_INVOICE', label: 'Itemized Patient Billing Invoice' }
  ];

  const handleFileChange = async (selectedFile: File | null) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setError(null);

    // Compute preview SHA-256 hash
    const arrayBuffer = await selectedFile.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    setSha256Preview(hashHex);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);

      const res = await api.post('/evidence/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-request' }
      });

      if (res.data.success) {
        onUploadSuccess(res.data.artifact);
        setFile(null);
        setSha256Preview(null);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to upload and analyze document.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="glass-panel rounded-xl p-6 border border-slate-800 bg-slate-900/60 shadow-xl">
      <div className="flex items-center space-x-2 text-cyan-400 font-bold mb-4 text-sm">
        <Upload className="w-4 h-4" />
        <span>Automated Evidence Ingestion Engine (Gemini AI Pipeline)</span>
      </div>

      <div className="mb-4">
        <label className="block text-xs font-semibold text-slate-300 mb-1">
          Select Regulatory Evidence Category
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as EvidenceCategory)}
          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
        >
          {categories.map(c => (
            <option key={c.key} value={c.key}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* File Dropzone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileChange(e.dataTransfer.files[0]);
          }
        }}
        className="border-2 border-dashed border-slate-700 hover:border-cyan-500/60 rounded-xl p-8 text-center bg-slate-950/50 transition cursor-pointer"
      >
        <input
          type="file"
          id="file-upload"
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
          className="hidden"
        />
        <label htmlFor="file-upload" className="cursor-pointer block">
          <FileText className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-200">
            Click to upload or drag & drop clinical PDF/Image scan
          </p>
          <p className="text-[10px] text-slate-400 mt-1">
            Supports PDF, PNG, JPEG (Max size: 10MB)
          </p>
        </label>
      </div>

      {/* SHA-256 Hash Preview */}
      {file && sha256Preview && (
        <div className="mt-4 p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs">
          <div className="flex items-center justify-between text-slate-300">
            <span className="font-semibold">{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-[10px] text-cyan-400 font-mono break-all bg-slate-900 p-2 rounded border border-cyan-950">
            <span className="text-slate-400 font-sans">SHA-256 Digest: </span>{sha256Preview}
          </div>
        </div>
      )}

      {error && (
        <div className="mt-3 p-3 bg-rose-950/60 border border-rose-800 rounded-lg text-xs text-rose-300 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className={`w-full mt-4 py-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-2 ${
          file && !uploading
            ? 'bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-white shadow-lg'
            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
        }`}
      >
        <ShieldCheck className="w-4 h-4" />
        <span>{uploading ? 'Processing Gemini AI Pipeline...' : 'Run Gemini AI Classification & Gap Analysis'}</span>
      </button>
    </div>
  );
};
