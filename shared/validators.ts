import { z } from 'zod';

export const VET_COMPLIANCE_CONFIG = {
  evidenceCategories: [
    'SURGICAL_CONSENT',
    'VACCINATION_CERTIFICATE',
    'PRESCRIPTION_CONTROLLED_SUBSTANCE',
    'DIAGNOSTIC_LAB_REPORT',
    'CONTROLLED_DRUG_LOG',
    'REFERRAL_SUMMARY',
    'ITEMIZED_INVOICE'
  ] as const,
  riskLevels: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const,
  confidenceThresholds: {
    autoRouteToReview: 0.85, // Confidence >= 0.85 routes to standard review queue
    flagLowConfidence: 0.60  // Confidence < 0.60 flagged as HIGH RISK extraction
  },
  retentionPoliciesMonths: {
    SURGICAL_CONSENT: 84, // 7 Years
    CONTROLLED_DRUG_LOG: 60, // 5 Years (DEA requirement + margin)
    MEDICAL_RECORDS: 84,
    FINANCIAL_INVOICES: 84,
    VACCINATION_CERTIFICATE: 36,
    PRESCRIPTION_CONTROLLED_SUBSTANCE: 60,
    DIAGNOSTIC_LAB_REPORT: 84,
    REFERRAL_SUMMARY: 36
  }
};

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

export type EvidenceCategory = (typeof VET_COMPLIANCE_CONFIG.evidenceCategories)[number];

export type ReviewAction = 'ACCEPT' | 'REJECT' | 'OVERRIDE' | 'DEFER' | 'ESCALATE';

export const HumanReviewSchema = z.object({
  evidence_id: z.string().uuid(),
  control_id: z.string().uuid(),
  action: z.enum(['ACCEPT', 'REJECT', 'OVERRIDE', 'DEFER', 'ESCALATE']),
  new_status: z.enum(['COMPLIANT', 'NON_COMPLIANT', 'PARTIALLY_COMPLIANT', 'UNDER_REVIEW']),
  reason: z.string().min(10, "Override/Review reason must be at least 10 characters long to ensure defensible audit trails.")
});

export type HumanReviewInput = z.infer<typeof HumanReviewSchema>;

export const AuthLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const EvidenceUploadSchema = z.object({
  category: z.enum(VET_COMPLIANCE_CONFIG.evidenceCategories),
  animal_id: z.string().uuid().optional(),
  control_id: z.string().uuid().optional()
});

export const RiskIssueCreateSchema = z.object({
  control_id: z.string().uuid(),
  title: z.string().min(5),
  description: z.string().min(10),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  due_date: z.string(),
  assigned_to: z.string().uuid().optional()
});
