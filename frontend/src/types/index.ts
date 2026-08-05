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

export interface User {
  id: string;
  tenant_id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active?: boolean;
}

export interface HospitalTenant {
  id: string;
  name: string;
  license_number: string;
  address: string;
  phone: string;
  email: string;
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
  last_tested_at: string;
  obligation?: {
    regulatory_body: string;
    code: string;
    title: string;
  };
}

export interface EvidenceArtifact {
  id: string;
  tenant_id: string;
  animal_id?: string;
  animal_name?: string;
  control_id?: string;
  control_code?: string;
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
  ai_suggestion_snapshot: any;
  created_at: string;
}

export interface RiskIssue {
  id: string;
  tenant_id: string;
  control_id: string;
  control_code?: string;
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
