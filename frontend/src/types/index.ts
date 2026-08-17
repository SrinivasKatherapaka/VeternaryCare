export type UserRole = 
  | 'COMPLIANCE_OFFICER' 
  | 'CONTROL_OWNER' 
  | 'AUDITOR' 
  | 'EXECUTIVE_REVIEWER' 
  | 'CLINICAL_STAFF';

export type ControlStatus = 
  | 'COMPLIANT' 
  | 'NON_COMPLIANT' 
  | 'PARTIALLY_COMPLIANT' 
  | 'UNDER_REVIEW' 
  | 'UNTESTED';

export type RiskSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type EvidenceCategory = 
  | 'SURGICAL_CONSENT' 
  | 'VACCINATION_CERTIFICATE' 
  | 'PRESCRIPTION_CONTROLLED_SUBSTANCE' 
  | 'DIAGNOSTIC_LAB_REPORT' 
  | 'CONTROLLED_DRUG_LOG' 
  | 'REFERRAL_SUMMARY' 
  | 'ITEMIZED_INVOICE';

export type ReviewAction = 'ACCEPT' | 'REJECT' | 'OVERRIDE' | 'DEFER' | 'ESCALATE';

export type EncounterType =
  | 'SURGICAL_PROCEDURE'
  | 'CONTROLLED_DRUG_DISPENSE'
  | 'RABIES_IMMUNIZATION'
  | 'EMERGENCY_INTAKE'
  | 'DIAGNOSTIC_PANEL'
  | 'VCPR_EXAMINATION'
  | 'INVOICE_BILLING_AUDIT';

export interface User {
  id: string;
  tenant_id: string;
  email: string;
  full_name: string;
  title?: string;
  role: UserRole;
  license_number?: string;
  is_active?: boolean;
  last_login_at?: string;
}

export interface HospitalTenant {
  id: string;
  name: string;
  license_number: string;
  dea_registration_number?: string;
  state_board_license?: string;
  accreditation?: string;
  address: string;
  phone: string;
  email: string;
}

export interface PetOwner {
  id: string;
  tenant_id: string;
  full_name: string;
  phone: string;
  email?: string;
  address?: string;
  created_at?: string;
}

export interface Animal {
  id: string;
  tenant_id: string;
  owner_id: string;
  owner_name?: string;
  name: string;
  species: string;
  breed?: string;
  dob?: string;
  weight_kg?: number;
  microchip_id?: string;
  medical_record_number?: string;
  created_at?: string;
}

export interface ComplianceObligation {
  id: string;
  regulatory_body: string;
  code: string;
  title: string;
  description: string;
  category: EvidenceCategory;
  penalty_guidance?: string;
}

export interface ComplianceControl {
  id: string;
  tenant_id: string;
  obligation_id: string;
  control_code: string;
  title: string;
  description: string;
  owner_id: string;
  owner_name?: string;
  status: ControlStatus;
  risk_rating: RiskSeverity;
  testing_frequency?: string;
  last_tested_at: string;
  regulatory_body?: string;
  obligation_code?: string;
  obligation_title?: string;
  obligation_description?: string;
  obligation_category?: string;
  penalty_guidance?: string;
  evidence_count?: number;
  obligation?: {
    regulatory_body: string;
    code: string;
    title: string;
    description?: string;
    category?: string;
    penalty_guidance?: string;
  };
}

export interface ClinicalEncounter {
  id: string;
  tenant_id: string;
  animal_id?: string;
  animal_name?: string;
  species?: string;
  breed?: string;
  microchip_id?: string;
  medical_record_number?: string;
  owner_id?: string;
  owner_name?: string;
  owner_phone?: string;
  veterinarian_id?: string;
  vet_name?: string;
  vet_license?: string;
  control_id?: string;
  control_code?: string;
  control_title?: string;
  encounter_type: EncounterType;
  procedure_name: string;
  date_of_service: string;
  drug_name?: string;
  drug_schedule?: string;
  initial_safe_balance?: number;
  dispensed_volume?: number;
  waste_volume?: number;
  final_safe_balance?: number;
  witness_signature_present: boolean;
  owner_consent_verified: boolean;
  vcpr_active_verified: boolean;
  is_compliant: boolean;
  clinical_notes?: string;
  created_at: string;
}

export interface EvidenceArtifact {
  id: string;
  tenant_id: string;
  animal_id?: string;
  animal_name?: string;
  control_id?: string;
  control_code?: string;
  encounter_id?: string;
  uploaded_by: string;
  uploader_name?: string;
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
  control_code?: string;
  control_title?: string;
  file_name?: string;
  actor_id: string;
  actor_name: string;
  actor_role: UserRole;
  action: ReviewAction;
  previous_status: ControlStatus;
  new_status: ControlStatus;
  reason: string;
  evidence_sha256_snapshot?: string;
  ai_suggestion_snapshot?: any;
  created_at: string;
}

export interface RiskIssue {
  id: string;
  tenant_id: string;
  control_id: string;
  control_code?: string;
  control_title?: string;
  title: string;
  description: string;
  severity: RiskSeverity;
  due_date: string;
  assigned_to?: string;
  assigned_to_name?: string;
  root_cause?: string;
  remediation_plan?: string;
  is_resolved: boolean;
  created_at: string;
}

export interface ControlGapItem {
  control_id: string;
  control_code: string;
  title: string;
  status: ControlStatus;
  risk_rating: RiskSeverity;
  regulatory_body: string;
  obligation_title: string;
  owner_name: string;
  gap_type: string;
  gap_description: string;
  priority_score: number;
  evidence_count: number;
  unreviewed_count: number;
  low_confidence_count: number;
}

export interface SystemNotification {
  id: string;
  tenant_id: string;
  title: string;
  message: string;
  severity: RiskSeverity;
  category: string;
  escalation_tier?: string;
  action_url?: string;
  is_read: boolean;
  created_at: string;
}

export interface ModelTelemetry {
  id: string;
  tenant_id: string;
  model_name: string;
  document_category: EvidenceCategory;
  latency_ms: number;
  confidence_score: number;
  token_count: number;
  was_overridden: boolean;
  override_reason?: string;
  drift_score?: number;
  created_at: string;
}
