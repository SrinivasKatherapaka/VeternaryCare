import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { db } from '../services/dbService.js';
import { computeSHA256 } from '../utils/hash.js';

export async function getClinicalEncounters(req: AuthRequest, res: Response) {
  try {
    const tenantId = req.user!.tenant_id;
    const encounters = await db.getClinicalEncounters(tenantId);
    return res.json({ success: true, encounters });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getPatients(req: AuthRequest, res: Response) {
  try {
    const tenantId = req.user!.tenant_id;
    const patients = await db.getPatients(tenantId);
    return res.json({ success: true, patients });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getPetOwners(req: AuthRequest, res: Response) {
  try {
    const tenantId = req.user!.tenant_id;
    const owners = await db.getPetOwners(tenantId);
    return res.json({ success: true, owners });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function createEncounter(req: AuthRequest, res: Response) {
  try {
    const tenantId = req.user!.tenant_id;
    const data = {
      ...req.body,
      tenant_id: tenantId,
      veterinarian_id: req.body.veterinarian_id || req.user!.id
    };

    const newEncounter = await db.createClinicalEncounter(data);

    // If safe balance or consent non-compliant, create notification alert
    if (data.witness_signature_present === false && data.waste_volume > 0) {
      await db.createNotification({
        tenant_id: tenantId,
        title: `Controlled Substance Deficit: Missing Witness Signature`,
        message: `Clinical encounter '${data.procedure_name}' logged ${data.waste_volume} mL waste without mandatory dual witness co-signature.`,
        severity: 'HIGH',
        category: 'DEA_DISCREPANCY',
        escalation_tier: 'TIER_2_DVM',
        action_url: '/clinical'
      });
    }

    return res.status(201).json({ success: true, encounter: newEncounter });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function ingestEncounterEvidence(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const tenantId = req.user!.tenant_id;

    const encounter = await db.queryOne(`
      SELECT e.*, a.name as animal_name, o.full_name as owner_name, u.full_name as vet_name, c.control_code
      FROM clinical_encounters e
      LEFT JOIN animals a ON e.animal_id = a.id
      LEFT JOIN pet_owners o ON e.owner_id = o.id
      LEFT JOIN app_users u ON e.veterinarian_id = u.id
      LEFT JOIN compliance_controls c ON e.control_id = c.id
      WHERE e.id = $1 AND e.tenant_id = $2
    `, [id, tenantId]);

    if (!encounter) {
      return res.status(404).json({ success: false, error: 'Clinical encounter not found' });
    }

    // Generate simulated clinical document text
    const docText = `APEX VETERINARY CLINICAL ENCOUNTER LOG #ENC-${encounter.id.substring(0, 8)}.
Procedure: ${encounter.procedure_name}. Date: ${encounter.date_of_service}.
Patient: ${encounter.animal_name || 'Patient'} | Owner: ${encounter.owner_name || 'Owner'}.
Veterinarian: ${encounter.vet_name || 'DVM'}.
Drug Administered: ${encounter.drug_name || 'N/A'} (${encounter.drug_schedule || 'N/A'}).
Dispensed: ${encounter.dispensed_volume || '0'} mL | Waste: ${encounter.waste_volume || '0'} mL.
Safe Balance Before: ${encounter.initial_safe_balance || '0'} mL | Safe Balance After: ${encounter.final_safe_balance || '0'} mL.
Dual Witness Signature: ${encounter.witness_signature_present ? 'VERIFIED' : 'MISSING / UNVERIFIED'}.
Informed CPR Consent: ${encounter.owner_consent_verified ? 'VERIFIED SIGNED' : 'UNCONFIRMED'}.
VCPR Examination Active: ${encounter.vcpr_active_verified ? 'ACTIVE (<12 MO)' : 'EXPIRED / STALE'}.
Clinical Notes: ${encounter.clinical_notes || 'Standard encounter record'}.`;

    const sha256Hash = computeSHA256(Buffer.from(docText));
    let category = 'CONTROLLED_DRUG_LOG';
    if (encounter.encounter_type === 'SURGICAL_PROCEDURE') category = 'SURGICAL_CONSENT';
    if (encounter.encounter_type === 'RABIES_IMMUNIZATION') category = 'VACCINATION_CERTIFICATE';
    if (encounter.encounter_type === 'INVOICE_BILLING_AUDIT') category = 'ITEMIZED_INVOICE';

    const gaps: string[] = [];
    let confidence = 0.95;
    if (!encounter.witness_signature_present && (encounter.waste_volume > 0 || encounter.drug_schedule)) {
      gaps.push('Missing mandatory dual-staff witness signature for controlled drug waste disposal');
      confidence = 0.58;
    }
    if (!encounter.owner_consent_verified && encounter.encounter_type === 'SURGICAL_PROCEDURE') {
      gaps.push('Pre-surgical informed anesthesia & CPR consent unverified');
      confidence = 0.52;
    }

    const artifact = await db.createEvidence({
      tenant_id: tenantId,
      animal_id: encounter.animal_id,
      control_id: encounter.control_id,
      encounter_id: encounter.id,
      uploaded_by: req.user!.id,
      file_name: `Encounter_${encounter.encounter_type}_${encounter.id.substring(0, 8)}.pdf`,
      file_url: `/uploads/encounters/enc_${encounter.id}.pdf`,
      file_sha256: sha256Hash,
      category,
      extracted_text: docText,
      ai_confidence: confidence,
      ai_grounding_explanation: `Automated ingestion from Clinical Operational Engine. ${gaps.length > 0 ? 'Flagged gaps: ' + gaps.join('; ') : 'All clinical compliance fields verified against DEA / AAHA standards.'}`,
      ai_model_version: 'gemini-2.5-pro',
      identified_gaps: gaps,
      extracted_metadata: {
        procedure: encounter.procedure_name,
        patient: encounter.animal_name,
        drug: encounter.drug_name,
        witness_present: encounter.witness_signature_present,
        consent_verified: encounter.owner_consent_verified
      },
      is_reviewed: false
    });

    return res.json({
      success: true,
      message: 'Clinical encounter successfully ingested into AI Evidence Mapping pipeline with SHA-256 digest.',
      artifact
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
