"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RiskIssueCreateSchema = exports.EvidenceUploadSchema = exports.AuthLoginSchema = exports.HumanReviewSchema = exports.VET_COMPLIANCE_CONFIG = void 0;
const zod_1 = require("zod");
exports.VET_COMPLIANCE_CONFIG = {
    evidenceCategories: [
        'SURGICAL_CONSENT',
        'VACCINATION_CERTIFICATE',
        'PRESCRIPTION_CONTROLLED_SUBSTANCE',
        'DIAGNOSTIC_LAB_REPORT',
        'CONTROLLED_DRUG_LOG',
        'REFERRAL_SUMMARY',
        'ITEMIZED_INVOICE'
    ],
    riskLevels: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    confidenceThresholds: {
        autoRouteToReview: 0.85, // Confidence >= 0.85 routes to standard review queue
        flagLowConfidence: 0.60 // Confidence < 0.60 flagged as HIGH RISK extraction
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
exports.HumanReviewSchema = zod_1.z.object({
    evidence_id: zod_1.z.string().uuid(),
    control_id: zod_1.z.string().uuid(),
    action: zod_1.z.enum(['ACCEPT', 'REJECT', 'OVERRIDE', 'DEFER', 'ESCALATE']),
    new_status: zod_1.z.enum(['COMPLIANT', 'NON_COMPLIANT', 'PARTIALLY_COMPLIANT', 'UNDER_REVIEW']),
    reason: zod_1.z.string().min(10, "Override/Review reason must be at least 10 characters long to ensure defensible audit trails.")
});
exports.AuthLoginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6)
});
exports.EvidenceUploadSchema = zod_1.z.object({
    category: zod_1.z.enum(exports.VET_COMPLIANCE_CONFIG.evidenceCategories),
    animal_id: zod_1.z.string().uuid().optional(),
    control_id: zod_1.z.string().uuid().optional()
});
exports.RiskIssueCreateSchema = zod_1.z.object({
    control_id: zod_1.z.string().uuid(),
    title: zod_1.z.string().min(5),
    description: zod_1.z.string().min(10),
    severity: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    due_date: zod_1.z.string(),
    assigned_to: zod_1.z.string().uuid().optional()
});
