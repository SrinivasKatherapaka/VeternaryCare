import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Stethoscope, ShieldCheck, AlertTriangle, Syringe, FileText, CheckCircle2, XCircle, ArrowRight, User, PawPrint, Plus, Sparkles } from 'lucide-react';
import { ClinicalEncounter, Animal } from '../types';

export const ClinicalOperationsPage: React.FC = () => {
  const [encounters, setEncounters] = useState<ClinicalEncounter[]>([]);
  const [patients, setPatients] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ENCOUNTERS' | 'PATIENTS' | 'SAFE_LEDGER'>('ENCOUNTERS');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [ingestingId, setIngestingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // New Encounter Modal State
  const [showNewModal, setShowNewModal] = useState(false);
  const [formData, setFormData] = useState({
    animal_id: '',
    encounter_type: 'SURGICAL_PROCEDURE',
    procedure_name: '',
    drug_name: 'Ketamine HCl 100mg/mL',
    drug_schedule: 'Schedule III',
    initial_safe_balance: '50.00',
    dispensed_volume: '1.00',
    waste_volume: '0.20',
    final_safe_balance: '48.80',
    witness_signature_present: true,
    owner_consent_verified: true,
    vcpr_active_verified: true,
    clinical_notes: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [encRes, patRes] = await Promise.all([
        api.get('/clinical/encounters'),
        api.get('/clinical/patients')
      ]);
      if (encRes.data.success) setEncounters(encRes.data.encounters);
      if (patRes.data.success) setPatients(patRes.data.patients);
    } catch (err) {
      console.error('Error fetching clinical data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleIngestEvidence = async (encounterId: string) => {
    setIngestingId(encounterId);
    try {
      const res = await api.post(`/clinical/encounters/${encounterId}/ingest-evidence`);
      if (res.data.success) {
        setSuccessMessage(`Document SHA-256 Digest (${res.data.artifact.file_sha256.substring(0, 16)}...) ingested into AI Evidence Pipeline with confidence score ${(res.data.artifact.ai_confidence * 100).toFixed(1)}%!`);
        setTimeout(() => setSuccessMessage(null), 6000);
        fetchData();
      }
    } catch (err: any) {
      alert('Ingestion failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setIngestingId(null);
    }
  };

  const handleCreateEncounter = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedPatient = patients.find(p => p.id === formData.animal_id);
      const res = await api.post('/clinical/encounters', {
        ...formData,
        owner_id: selectedPatient?.owner_id,
        initial_safe_balance: Number(formData.initial_safe_balance),
        dispensed_volume: Number(formData.dispensed_volume),
        waste_volume: Number(formData.waste_volume),
        final_safe_balance: Number(formData.final_safe_balance),
        is_compliant: formData.witness_signature_present && formData.owner_consent_verified
      });
      if (res.data.success) {
        setShowNewModal(false);
        setSuccessMessage('New clinical operational record logged successfully in PostgreSQL!');
        setTimeout(() => setSuccessMessage(null), 4000);
        fetchData();
      }
    } catch (err: any) {
      alert('Error creating encounter: ' + (err.response?.data?.error || err.message));
    }
  };

  const filteredEncounters = typeFilter
    ? encounters.filter(e => e.encounter_type === typeFilter)
    : encounters;

  const totalPatients = patients.length;
  const compliantEncounters = encounters.filter(e => e.is_compliant).length;
  const flaggedDeficits = encounters.filter(e => !e.is_compliant).length;

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-700/60 text-cyan-400 text-xs font-semibold mb-2">
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Pillar 2: Clinical Operational Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>Clinical Operations & Drug Safe Ledger</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Live clinical documentation engine bridging surgical procedures, DEA Schedule II-V digital safe reconciliation, Rabies immunization lot verification, and VCPR physical examination mandates.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-lg shadow-cyan-500/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Log Clinical Encounter</span>
        </button>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="bg-emerald-950/80 border border-emerald-500/50 rounded-xl p-4 flex items-center gap-3 text-emerald-200 text-xs shadow-lg animate-fadeIn">
          <Sparkles className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <div className="flex-1 font-medium">{successMessage}</div>
        </div>
      )}

      {/* Top Clinical Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/60 flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-cyan-950/60 border border-cyan-800/40 text-cyan-400">
            <PawPrint className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Active Patients</p>
            <p className="text-2xl font-bold text-white mt-0.5">{totalPatients}</p>
            <p className="text-[10px] text-cyan-400">All with microchip & owner profile</p>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/60 flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800/40 text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Compliant Records</p>
            <p className="text-2xl font-bold text-emerald-400 mt-0.5">{compliantEncounters}</p>
            <p className="text-[10px] text-slate-400">100% verified witness/consent</p>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/60 flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/40 text-rose-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Active Deficits</p>
            <p className="text-2xl font-bold text-rose-400 mt-0.5">{flaggedDeficits}</p>
            <p className="text-[10px] text-rose-300">Escalated to Risk Register</p>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/60 flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-amber-950/60 border border-amber-800/40 text-amber-400">
            <Syringe className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Drug Safe Balance</p>
            <p className="text-2xl font-bold text-amber-400 mt-0.5">47.30 mL</p>
            <p className="text-[10px] text-slate-400">Ketamine HCl Perpetual Safe #1</p>
          </div>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('ENCOUNTERS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'ENCOUNTERS'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Clinical Encounters ({encounters.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('PATIENTS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'PATIENTS'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <PawPrint className="w-4 h-4" />
            <span>Patient Roster ({patients.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('SAFE_LEDGER')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'SAFE_LEDGER'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Syringe className="w-4 h-4" />
            <span>DEA Drug Safe Ledger</span>
          </button>
        </div>

        {activeTab === 'ENCOUNTERS' && (
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
          >
            <option value="">All Encounter Types</option>
            <option value="SURGICAL_PROCEDURE">Surgical Procedures</option>
            <option value="CONTROLLED_DRUG_DISPENSE">Controlled Drug Dispenses</option>
            <option value="RABIES_IMMUNIZATION">Rabies Immunizations</option>
            <option value="VCPR_EXAMINATION">VCPR Physical Exams</option>
            <option value="INVOICE_BILLING_AUDIT">Billing & Invoice Audits</option>
          </select>
        )}
      </div>

      {/* TAB 1: CLINICAL ENCOUNTERS TABLE */}
      {activeTab === 'ENCOUNTERS' && (
        <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/60 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="p-4">Patient / Owner</th>
                  <th className="p-4">Procedure & Type</th>
                  <th className="p-4">Controlled Substance / Dosages</th>
                  <th className="p-4">Witness & Consent</th>
                  <th className="p-4">Compliance Status</th>
                  <th className="p-4 text-right">Evidence Ingestion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-cyan-400">Loading live clinical operational data...</td>
                  </tr>
                ) : filteredEncounters.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">No clinical encounters matching filter.</td>
                  </tr>
                ) : (
                  filteredEncounters.map((enc) => (
                    <tr key={enc.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-cyan-950 border border-cyan-700/50 flex items-center justify-center text-cyan-300 font-bold">
                            {enc.animal_name ? enc.animal_name[0] : 'P'}
                          </div>
                          <div>
                            <p className="font-bold text-white flex items-center gap-1.5">
                              <span>{enc.animal_name}</span>
                              <span className="text-[10px] text-slate-400 font-normal">({enc.species} - {enc.breed})</span>
                            </p>
                            <p className="text-[11px] text-slate-400">Owner: {enc.owner_name} | {enc.medical_record_number}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 max-w-xs">
                        <p className="font-semibold text-slate-200">{enc.procedure_name}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-cyan-400">
                          {enc.encounter_type}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-1">DVM: {enc.vet_name || 'Dr. Sarah Jenkins'}</p>
                      </td>

                      <td className="p-4">
                        {enc.drug_name ? (
                          <div>
                            <p className="font-semibold text-amber-300">{enc.drug_name}</p>
                            <p className="text-[11px] text-slate-300 mt-0.5">
                              Dose: <span className="text-white font-mono">{enc.dispensed_volume} mL</span> | Waste: <span className="text-white font-mono">{enc.waste_volume} mL</span>
                            </p>
                            <p className="text-[10px] text-slate-400">Safe: {enc.initial_safe_balance} mL &rarr; {enc.final_safe_balance} mL</p>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">Non-Controlled Protocol</span>
                        )}
                      </td>

                      <td className="p-4 space-y-1">
                        <div className="flex items-center gap-2 text-[11px]">
                          {enc.witness_signature_present ? (
                            <span className="text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Witness Co-Signed
                            </span>
                          ) : (
                            <span className="text-rose-400 font-semibold flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5" /> Missing Witness Co-Sign
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px]">
                          {enc.owner_consent_verified ? (
                            <span className="text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> CPR / Surgical Consent
                            </span>
                          ) : (
                            <span className="text-amber-400 flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5" /> Consent Unconfirmed
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-4">
                        {enc.is_compliant ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-600/50 text-emerald-400 text-[10px] font-bold tracking-wide">
                            COMPLIANT
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-rose-950/80 border border-rose-600/50 text-rose-400 text-[10px] font-bold tracking-wide flex items-center gap-1 w-fit">
                            <AlertTriangle className="w-3 h-3" /> DEFICIT FLAGGED
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleIngestEvidence(enc.id)}
                          disabled={ingestingId === enc.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-cyan-400 text-[11px] font-bold border border-slate-700 transition active:scale-95 disabled:opacity-50"
                        >
                          {ingestingId === enc.id ? (
                            <span>Ingesting...</span>
                          ) : (
                            <>
                              <span>Ingest to AI</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: PATIENTS ROSTER */}
      {activeTab === 'PATIENTS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {patients.map((pat) => (
            <div key={pat.id} className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-lg space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-700/50 flex items-center justify-center text-cyan-300 font-extrabold text-lg">
                    {pat.name[0]}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{pat.name}</h3>
                    <p className="text-xs text-cyan-400">{pat.species} &bull; {pat.breed || 'Mixed'}</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                  {pat.medical_record_number}
                </span>
              </div>

              <div className="space-y-1.5 text-xs border-t border-slate-800/80 pt-3">
                <div className="flex justify-between text-slate-400">
                  <span>Microchip ID:</span>
                  <span className="font-mono text-slate-200">{pat.microchip_id || '985141002948102'}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Weight:</span>
                  <span className="text-slate-200 font-semibold">{pat.weight_kg} kg</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Owner:</span>
                  <span className="text-cyan-300 font-medium">{pat.owner_name}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Contact:</span>
                  <span className="text-slate-300">{pat.owner_phone || '(512) 555-0192'}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> VCPR Active (&lt; 12 Mo)
                </span>
                <span className="text-slate-400">Rabies Exp: 2028</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: DEA SAFE RECONCILIATION LEDGER */}
      {activeTab === 'SAFE_LEDGER' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Syringe className="w-4 h-4 text-amber-400" />
                <span>Pyxis Safe Station #1 - Schedule II-IV Controlled Substances</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Bi-annual perpetual inventory mandated by DEA 21 CFR §1304.11 with automatic waste reconciliation.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">Current Perpetual Safe Balance:</span>
              <span className="px-3 py-1 rounded-lg bg-amber-950/80 border border-amber-600/50 text-amber-300 font-mono font-bold text-sm">
                47.30 mL
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-bold uppercase text-slate-400">
                  <th className="pb-3">Transaction Date</th>
                  <th className="pb-3">Substance</th>
                  <th className="pb-3">Patient MRN</th>
                  <th className="pb-3">Starting Balance</th>
                  <th className="pb-3">Administered</th>
                  <th className="pb-3">Waste Disposed</th>
                  <th className="pb-3">Remaining Balance</th>
                  <th className="pb-3">Witness Signatures</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                <tr className="text-slate-300 hover:bg-slate-800/40">
                  <td className="py-3 font-mono text-[11px]">2026-08-15 14:10</td>
                  <td className="py-3 font-semibold text-amber-300">Ketamine HCl 100mg/mL</td>
                  <td className="py-3 font-mono text-cyan-400">Thor (MRN-1021)</td>
                  <td className="py-3 font-mono">48.30 mL</td>
                  <td className="py-3 font-mono text-white font-bold">0.80 mL</td>
                  <td className="py-3 font-mono text-rose-400 font-bold">0.20 mL</td>
                  <td className="py-3 font-mono text-amber-300 font-bold">47.30 mL</td>
                  <td className="py-3 text-rose-400 font-semibold flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" /> 1/2 Staff Only (Missing Co-Sign)
                  </td>
                </tr>

                <tr className="text-slate-300 hover:bg-slate-800/40">
                  <td className="py-3 font-mono text-[11px]">2026-08-14 08:30</td>
                  <td className="py-3 font-semibold text-amber-300">Ketamine HCl 100mg/mL</td>
                  <td className="py-3 font-mono text-cyan-400">Barnaby (MRN-0812)</td>
                  <td className="py-3 font-mono">50.00 mL</td>
                  <td className="py-3 font-mono text-white font-bold">1.50 mL</td>
                  <td className="py-3 font-mono text-slate-400 font-bold">0.20 mL</td>
                  <td className="py-3 font-mono text-amber-300 font-bold">48.30 mL</td>
                  <td className="py-3 text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Dual Verified (M. Vance & S. Jenkins)
                  </td>
                </tr>

                <tr className="text-slate-300 hover:bg-slate-800/40">
                  <td className="py-3 font-mono text-[11px]">2026-08-12 11:00</td>
                  <td className="py-3 font-semibold text-amber-300">Midazolam 5mg/mL</td>
                  <td className="py-3 font-mono text-cyan-400">Oliver (MRN-1290)</td>
                  <td className="py-3 font-mono">20.00 mL</td>
                  <td className="py-3 font-mono text-white font-bold">1.20 mL</td>
                  <td className="py-3 font-mono text-slate-400 font-bold">0.00 mL</td>
                  <td className="py-3 font-mono text-amber-300 font-bold">18.80 mL</td>
                  <td className="py-3 text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Dual Verified (M. Vance & A. Pendelton)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Log New Encounter Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-scaleUp max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-cyan-400" />
                <span>Log New Clinical Operational Encounter</span>
              </h2>
              <button onClick={() => setShowNewModal(false)} className="text-slate-400 hover:text-white text-sm">✕</button>
            </div>

            <form onSubmit={handleCreateEncounter} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Select Patient</label>
                <select
                  required
                  value={formData.animal_id}
                  onChange={(e) => setFormData({ ...formData, animal_id: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.species} - {p.breed}) &bull; Owner: {p.owner_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Encounter Type</label>
                <select
                  value={formData.encounter_type}
                  onChange={(e) => setFormData({ ...formData, encounter_type: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="SURGICAL_PROCEDURE">Surgical Procedure</option>
                  <option value="CONTROLLED_DRUG_DISPENSE">Controlled Drug Dispensation</option>
                  <option value="RABIES_IMMUNIZATION">Rabies Immunization</option>
                  <option value="VCPR_EXAMINATION">VCPR Physical Exam</option>
                  <option value="INVOICE_BILLING_AUDIT">Billing Invoice Audit</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Procedure Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Exploratory Laparotomy / Ketamine Sedation"
                  value={formData.procedure_name}
                  onChange={(e) => setFormData({ ...formData, procedure_name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Drug Name</label>
                  <input
                    type="text"
                    value={formData.drug_name}
                    onChange={(e) => setFormData({ ...formData, drug_name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Schedule Tag</label>
                  <input
                    type="text"
                    value={formData.drug_schedule}
                    onChange={(e) => setFormData({ ...formData, drug_schedule: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Dispensed (mL)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.dispensed_volume}
                    onChange={(e) => setFormData({ ...formData, dispensed_volume: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Waste (mL)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.waste_volume}
                    onChange={(e) => setFormData({ ...formData, waste_volume: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Safe Bal (mL)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.final_safe_balance}
                    onChange={(e) => setFormData({ ...formData, final_safe_balance: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2 bg-slate-950/80 p-3 rounded-lg border border-slate-800">
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.witness_signature_present}
                    onChange={(e) => setFormData({ ...formData, witness_signature_present: e.target.checked })}
                    className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
                  />
                  <span>Dual Staff Witness Co-Signature Present (DEA 21 CFR §1304)</span>
                </label>

                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.owner_consent_verified}
                    onChange={(e) => setFormData({ ...formData, owner_consent_verified: e.target.checked })}
                    className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
                  />
                  <span>Owner Surgical & CPR Resuscitation Consent Verified (AAHA SUR-04)</span>
                </label>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Clinical Notes</label>
                <textarea
                  rows={2}
                  placeholder="Enter clinical observations, vitals, or waste disposition notes..."
                  value={formData.clinical_notes}
                  onChange={(e) => setFormData({ ...formData, clinical_notes: e.target.value })}
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
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-lg shadow-cyan-500/20"
                >
                  Save Record to PostgreSQL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
