import { UserRole, ControlStatus, RiskSeverity, EvidenceCategory, ReviewAction } from '../shared/validators.js';

export interface HospitalTenant {
  id: string;
  name: string;
  license_number: string;
  address: string;
  phone: string;
  email: string;
  created_at: string;
}

export interface AppUser {
  id: string;
  tenant_id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  last_login_at: string;
}

export interface PetOwner {
  id: string;
  tenant_id: string;
  full_name: string;
  phone: string;
  email: string;
  address: string;
}

export interface Animal {
  id: string;
  tenant_id: string;
  owner_id: string;
  name: string;
  species: string;
  breed: string;
  dob: string;
  weight_kg: number;
  microchip_id: string;
}

export interface ComplianceObligation {
  id: string;
  regulatory_body: string; // e.g., DEA, AAHA, State Board, OSHA, HIPAA/VCPR
  code: string;
  title: string;
  description: string;
  category: EvidenceCategory;
}

export interface ComplianceControl {
  id: string;
  tenant_id: string;
  obligation_id: string;
  control_code: string;
  title: string;
  description: string;
  owner_id: string;
  status: ControlStatus;
  risk_rating: RiskSeverity;
  last_tested_at: string;
  created_at: string;
  updated_at: string;
}

export interface EvidenceArtifact {
  id: string;
  tenant_id: string;
  animal_id?: string;
  control_id?: string;
  uploaded_by: string;
  file_name: string;
  file_url: string;
  file_sha256: string;
  category: EvidenceCategory;
  extracted_text: string;
  ai_confidence: number;
  ai_grounding_explanation: string;
  ai_model_version: string;
  is_reviewed: boolean;
  identified_gaps: string[];
  extracted_metadata: Record<string, any>;
  created_at: string;
}

export interface DecisionAuditLog {
  id: string;
  tenant_id: string;
  evidence_id?: string;
  control_id: string;
  actor_id: string;
  actor_name: string;
  actor_role: UserRole;
  action: ReviewAction;
  previous_status: ControlStatus;
  new_status: ControlStatus;
  reason: string;
  ai_suggestion_snapshot: any;
  created_at: string;
}

export interface RiskIssue {
  id: string;
  tenant_id: string;
  control_id: string;
  title: string;
  description: string;
  severity: RiskSeverity;
  due_date: string;
  assigned_to?: string;
  assigned_to_name?: string;
  is_resolved: boolean;
  created_at: string;
}

export interface SystemNotification {
  id: string;
  tenant_id: string;
  title: string;
  message: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  is_read: boolean;
  category: string;
  created_at: string;
}

// SEED DATA INITIALIZATION
const TENANT_ID = '11111111-1111-1111-1111-111111111111';

export class MockDatabase {
  public tenants: HospitalTenant[] = [
    {
      id: TENANT_ID,
      name: 'Apex Veterinary Emergency & Specialty Hospital',
      license_number: 'VET-LIC-884920-TX',
      address: '104 Medical Plaza Way, Austin, TX 78701',
      phone: '(512) 555-0192',
      email: 'compliance@apexvetcare.org',
      created_at: '2025-01-15T08:00:00Z'
    }
  ];

  public users: AppUser[] = [
    {
      id: '22222222-2222-2222-2222-222222222222',
      tenant_id: TENANT_ID,
      email: 'officer@vetcare.org',
      full_name: 'Dr. Sarah Jenkins, DVM',
      role: 'COMPLIANCE_OFFICER',
      is_active: true,
      last_login_at: new Date().toISOString()
    },
    {
      id: '33333333-3333-3333-3333-333333333333',
      tenant_id: TENANT_ID,
      email: 'owner@vetcare.org',
      full_name: 'Marcus Vance, LVT',
      role: 'CONTROL_OWNER',
      is_active: true,
      last_login_at: new Date().toISOString()
    },
    {
      id: '44444444-4444-4444-4444-444444444444',
      tenant_id: TENANT_ID,
      email: 'auditor@vetcare.org',
      full_name: 'Elena Rostova, CPA/CISA',
      role: 'AUDITOR',
      is_active: true,
      last_login_at: new Date().toISOString()
    },
    {
      id: '55555555-5555-5555-5555-555555555555',
      tenant_id: TENANT_ID,
      email: 'exec@vetcare.org',
      full_name: 'Dr. Arthur Pendelton, Chief Medical Officer',
      role: 'EXECUTIVE_REVIEWER',
      is_active: true,
      last_login_at: new Date().toISOString()
    },
    {
      id: '66666666-6666-6666-6666-666666666666',
      tenant_id: TENANT_ID,
      email: 'staff@vetcare.org',
      full_name: 'Rachel Torres, RVT',
      role: 'CLINICAL_STAFF',
      is_active: true,
      last_login_at: new Date().toISOString()
    }
  ];

  public petOwners: PetOwner[] = [
    {
      id: 'po-101',
      tenant_id: TENANT_ID,
      full_name: 'Jonathan Sterling',
      phone: '(512) 555-8841',
      email: 'j.sterling@example.com',
      address: '402 Oak Ridge Dr, Austin TX'
    },
    {
      id: 'po-102',
      tenant_id: TENANT_ID,
      full_name: 'Clarissa Montgomery',
      phone: '(512) 555-1920',
      email: 'cmontgomery@example.com',
      address: '711 Lakeview Blvd, Austin TX'
    }
  ];

  public animals: Animal[] = [
    {
      id: 'an-201',
      tenant_id: TENANT_ID,
      owner_id: 'po-101',
      name: 'Barnaby',
      species: 'Canine',
      breed: 'Golden Retriever',
      dob: '2021-04-12',
      weight_kg: 31.4,
      microchip_id: '985141002948102'
    },
    {
      id: 'an-202',
      tenant_id: TENANT_ID,
      owner_id: 'po-102',
      name: 'Cleo',
      species: 'Feline',
      breed: 'Siamese',
      dob: '2022-09-01',
      weight_kg: 4.2,
      microchip_id: '985141009184711'
    }
  ];

  public obligations: ComplianceObligation[] = [
    {
      id: 'ob-001',
      regulatory_body: 'DEA Schedule II-V',
      code: 'DEA-21-CFR-1304',
      title: 'Bi-Annual Controlled Substance Inventory & Daily Log Integrity',
      description: 'Mandatory double-entry logging for all Schedule II (Ketamine/Buprenorphine/Fentanyl) and Schedule IV-V dispensing with exact waste weight reconciliation.',
      category: 'CONTROLLED_DRUG_LOG'
    },
    {
      id: 'ob-002',
      regulatory_body: 'AAHA Standard SUR-04',
      code: 'AAHA-SURG-CONSENT',
      title: 'Informed Surgical & Anesthesia Consent Verification',
      description: 'Documented explicit consent signed by verified pet owner specifying procedural risks, resuscitation preferences (CPR/DNR), and pre-surgical bloodwork authorization.',
      category: 'SURGICAL_CONSENT'
    },
    {
      id: 'ob-003',
      regulatory_body: 'State Pharmacy Board',
      code: 'ST-PHARM-RX-VCPR',
      title: 'Valid VCPR & Prescription Verification',
      description: 'Prescription logs must link directly to an active VCPR established within the preceding 12 months with attending veterinarian license tag.',
      category: 'PRESCRIPTION_CONTROLLED_SUBSTANCE'
    },
    {
      id: 'ob-004',
      regulatory_body: 'OSHA / Public Health',
      code: 'OSHA-BIO-RABIES-09',
      title: 'Rabies & Zoonotic Immunization Lineage',
      description: 'Proof of rabies vaccination record certified by a licensed DVM with serial numbers, manufacturer expiration, and microchip cross-verification.',
      category: 'VACCINATION_CERTIFICATE'
    },
    {
      id: 'ob-005',
      regulatory_body: 'Financial & HIPAA/VCPR Privacy',
      code: 'FIN-AUDIT-INV-01',
      title: 'Itemized Billing & Controlled Substance Cross-Reconciliation',
      description: 'Invoices must accurately map itemized drug billing units to recorded physical log waste records to prevent illicit drug diversion.',
      category: 'ITEMIZED_INVOICE'
    }
  ];

  public controls: ComplianceControl[] = [
    {
      id: 'ctrl-101',
      tenant_id: TENANT_ID,
      obligation_id: 'ob-001',
      control_code: 'CTRL-DEA-LOG-01',
      title: 'Controlled Substance Perpetual Log Audit',
      description: 'Daily reconciliation of safe balance against physical inventory counts for Ketamine, Fentanyl, and Midazolam.',
      owner_id: '33333333-3333-3333-3333-333333333333',
      status: 'PARTIALLY_COMPLIANT',
      risk_rating: 'HIGH',
      last_tested_at: '2026-08-01T10:00:00Z',
      created_at: '2026-01-10T00:00:00Z',
      updated_at: '2026-08-01T10:00:00Z'
    },
    {
      id: 'ctrl-102',
      tenant_id: TENANT_ID,
      obligation_id: 'ob-002',
      control_code: 'CTRL-AAHA-SURG-02',
      title: 'Pre-Surgical Anesthesia & CPR Consent Enforcer',
      description: 'Ensure 100% of elective and emergency surgical procedures have a digitally authenticated or physically signed consent form before anesthesia induction.',
      owner_id: '22222222-2222-2222-2222-222222222222',
      status: 'COMPLIANT',
      risk_rating: 'CRITICAL',
      last_tested_at: '2026-08-04T14:30:00Z',
      created_at: '2026-01-10T00:00:00Z',
      updated_at: '2026-08-04T14:30:00Z'
    },
    {
      id: 'ctrl-103',
      tenant_id: TENANT_ID,
      obligation_id: 'ob-003',
      control_code: 'CTRL-VCPR-RX-03',
      title: 'Annual VCPR License & Script Verification',
      description: 'System-enforced lock preventing prescription renewals if physical exam date is older than 365 days.',
      owner_id: '33333333-3333-3333-3333-333333333333',
      status: 'UNDER_REVIEW',
      risk_rating: 'MEDIUM',
      last_tested_at: '2026-07-28T09:15:00Z',
      created_at: '2026-01-10T00:00:00Z',
      updated_at: '2026-07-28T09:15:00Z'
    },
    {
      id: 'ctrl-104',
      tenant_id: TENANT_ID,
      obligation_id: 'ob-004',
      control_code: 'CTRL-RABIES-CERT-04',
      title: 'Zoonotic Rabies Tag & Serial Number Log',
      description: 'Verification of state vaccine certificate forms including lot number, manufacturer, and license signature.',
      owner_id: '66666666-6666-6666-6666-666666666666',
      status: 'COMPLIANT',
      risk_rating: 'LOW',
      last_tested_at: '2026-08-02T16:00:00Z',
      created_at: '2026-01-10T00:00:00Z',
      updated_at: '2026-08-02T16:00:00Z'
    },
    {
      id: 'ctrl-105',
      tenant_id: TENANT_ID,
      obligation_id: 'ob-005',
      control_code: 'CTRL-FIN-INV-05',
      title: 'Controlled Drug Invoice Reconciliation',
      description: 'Audit itemized invoices against medical log wastage notes to ensure accurate billing and drug tracking.',
      owner_id: '55555555-5555-5555-5555-555555555555',
      status: 'NON_COMPLIANT',
      risk_rating: 'HIGH',
      last_tested_at: '2026-08-03T11:20:00Z',
      created_at: '2026-01-10T00:00:00Z',
      updated_at: '2026-08-03T11:20:00Z'
    }
  ];

  public evidence: EvidenceArtifact[] = [
    {
      id: 'ev-301',
      tenant_id: TENANT_ID,
      animal_id: 'an-201',
      control_id: 'ctrl-102',
      uploaded_by: '66666666-6666-6666-6666-666666666666',
      file_name: 'Surgical_Consent_Barnaby_2026_08.pdf',
      file_url: '/uploads/Surgical_Consent_Barnaby_2026_08.pdf',
      file_sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      category: 'SURGICAL_CONSENT',
      extracted_text: 'APEX VET HOSPITAL - SURGICAL CONSENT FORM\nPatient: Barnaby (Canine, Golden Retriever, 31.4kg)\nOwner: Jonathan Sterling\nProcedure: Exploratory Laparotomy & Foreign Body Removal\nDate: 2026-08-04\nAttending DVM: Dr. Sarah Jenkins (TX License #884920)\nConsent: CPR Authorized. Pre-anesthesia blood panel completed.',
      ai_confidence: 0.945,
      ai_grounding_explanation: 'Extracted clear owner signature, DVM license number (TX #884920), patient weight (31.4kg), and procedure type matching AAHA Standard SUR-04 requirements.',
      ai_model_version: 'gemini-2.5-pro',
      is_reviewed: true,
      identified_gaps: [],
      extracted_metadata: {
        patient_name: 'Barnaby',
        owner_name: 'Jonathan Sterling',
        veterinarian_name: 'Dr. Sarah Jenkins',
        license_number: 'TX-884920',
        date_of_service: '2026-08-04',
        procedure: 'Exploratory Laparotomy'
      },
      created_at: '2026-08-04T14:25:00Z'
    },
    {
      id: 'ev-302',
      tenant_id: TENANT_ID,
      animal_id: 'an-202',
      control_id: 'ctrl-101',
      uploaded_by: '33333333-3333-3333-3333-333333333333',
      file_name: 'Ketamine_Logbook_Aug2026.pdf',
      file_url: '/uploads/Ketamine_Logbook_Aug2026.pdf',
      file_sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
      category: 'CONTROLLED_DRUG_LOG',
      extracted_text: 'DEA SCHEDULE II LOG - KETAMINE HYDROCHLORIDE (100mg/mL)\nContainer Bottle #K-9021\nInitial Vol: 50 mL\nDispensed: 2.5 mL for Cleo (Siamese, 4.2kg)\nRemaining Balance: 47.5 mL\nWaste: 0.2 mL (Discarded in witness sink)\nWitness Signature: MISSING UNVERIFIED',
      ai_confidence: 0.580,
      ai_grounding_explanation: 'Identified controlled substance log entry for Ketamine (Schedule II). FLAGGED: Mandatory witness co-signature for 0.2mL waste volume is missing or unreadable.',
      ai_model_version: 'gemini-2.5-pro',
      is_reviewed: false,
      identified_gaps: ['Missing witness co-signature for Schedule II drug waste', 'Unresolved 0.1 mL discrepancy between physical log and safe record'],
      extracted_metadata: {
        drug_name_schedule: 'Ketamine HCl (Schedule II)',
        dosage_administered: '2.5 mL (100mg/mL)',
        patient_name: 'Cleo',
        waste_volume: '0.2 mL'
      },
      created_at: '2026-08-05T09:10:00Z'
    }
  ];

  public auditLogs: DecisionAuditLog[] = [
    {
      id: 'log-501',
      tenant_id: TENANT_ID,
      evidence_id: 'ev-301',
      control_id: 'ctrl-102',
      actor_id: '22222222-2222-2222-2222-222222222222',
      actor_name: 'Dr. Sarah Jenkins, DVM',
      actor_role: 'COMPLIANCE_OFFICER',
      action: 'ACCEPT',
      previous_status: 'UNDER_REVIEW',
      new_status: 'COMPLIANT',
      reason: 'Verified surgical consent form signed by Jonathan Sterling with full DVM license and anesthesia parameters.',
      ai_suggestion_snapshot: { confidence: 0.945, category: 'SURGICAL_CONSENT' },
      created_at: '2026-08-04T14:30:00Z'
    }
  ];

  public risks: RiskIssue[] = [
    {
      id: 'risk-701',
      tenant_id: TENANT_ID,
      control_id: 'ctrl-101',
      title: 'DEA Schedule II Waste Witness Signatures Missing',
      description: 'Automated audit identified 3 log entries in Ketamine safe log missing required dual-witness signatures during anesthesia disposal.',
      severity: 'CRITICAL',
      due_date: '2026-08-10',
      assigned_to: '33333333-3333-3333-3333-333333333333',
      assigned_to_name: 'Marcus Vance, LVT',
      is_resolved: false,
      created_at: '2026-08-03T11:00:00Z'
    },
    {
      id: 'risk-702',
      tenant_id: TENANT_ID,
      control_id: 'ctrl-105',
      title: 'Invoice Dispensing Units Mismatch in Pharmacy Audit',
      description: 'Controlled substance invoice #INV-9021 lists 10 vials Buprenorphine billed but physical receiving log records 9 vials.',
      severity: 'HIGH',
      due_date: '2026-08-12',
      assigned_to: '55555555-5555-5555-5555-555555555555',
      assigned_to_name: 'Dr. Arthur Pendelton',
      is_resolved: false,
      created_at: '2026-08-03T11:20:00Z'
    }
  ];

  public notifications: SystemNotification[] = [
    {
      id: 'notif-1',
      tenant_id: TENANT_ID,
      title: 'High Risk Evidence Extraction Flagged',
      message: 'Ketamine Logbook file uploaded with low AI confidence (0.58). Missing witness co-signature.',
      severity: 'CRITICAL',
      is_read: false,
      category: 'DEA_COMPLIANCE',
      created_at: '2026-08-05T09:10:00Z'
    },
    {
      id: 'notif-2',
      tenant_id: TENANT_ID,
      title: 'Control Test Overdue Escalation',
      message: 'Control CTRL-FIN-INV-05 marked NON_COMPLIANT due to invoice discrepancy.',
      severity: 'WARNING',
      is_read: false,
      category: 'FINANCIAL_AUDIT',
      created_at: '2026-08-03T11:20:00Z'
    }
  ];
}

export const mockDb = new MockDatabase();
