import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { mockDb } from '../services/mockDb.js';

export function getDashboardMetrics(req: AuthRequest, res: Response) {
  const controls = mockDb.controls;
  const risks = mockDb.risks;
  const evidence = mockDb.evidence;

  const totalControls = controls.length;
  const compliantControls = controls.filter(c => c.status === 'COMPLIANT').length;
  const nonCompliantControls = controls.filter(c => c.status === 'NON_COMPLIANT').length;
  const partiallyCompliant = controls.filter(c => c.status === 'PARTIALLY_COMPLIANT').length;
  const underReview = controls.filter(c => c.status === 'UNDER_REVIEW').length;
  const untested = controls.filter(c => c.status === 'UNTESTED').length;

  const overallComplianceRate = totalControls > 0 ? Math.round((compliantControls / totalControls) * 100) : 0;

  const activeRisks = risks.filter(r => !r.is_resolved);
  const criticalRisks = activeRisks.filter(r => r.severity === 'CRITICAL').length;
  const highRisks = activeRisks.filter(r => r.severity === 'HIGH').length;

  const pendingEvidenceReviews = evidence.filter(e => !e.is_reviewed).length;
  const lowConfidenceExtractions = evidence.filter(e => e.ai_confidence < 0.60).length;

  const domainBreakdown = [
    { domain: 'Controlled Substances (DEA)', controls: 2, compliant: 0, complianceRate: 0, risk: 'HIGH' },
    { domain: 'Surgical & Anesthesia Consent (AAHA)', controls: 2, compliant: 2, complianceRate: 100, risk: 'LOW' },
    { domain: 'Pharmacy & VCPR Compliance', controls: 2, compliant: 1, complianceRate: 50, risk: 'MEDIUM' },
    { domain: 'Rabies & Zoonotic Health (OSHA)', controls: 1, compliant: 1, complianceRate: 100, risk: 'LOW' },
    { domain: 'Financial Billing Reconciliation', controls: 1, compliant: 0, complianceRate: 0, risk: 'CRITICAL' }
  ];

  return res.json({
    success: true,
    metrics: {
      overallComplianceRate,
      totalControls,
      compliantControls,
      nonCompliantControls,
      partiallyCompliant,
      underReview,
      untested,
      totalActiveRisks: activeRisks.length,
      criticalRisks,
      highRisks,
      pendingEvidenceReviews,
      lowConfidenceExtractions
    },
    domainBreakdown,
    recentAudits: mockDb.auditLogs.slice(0, 5),
    topRisks: activeRisks.slice(0, 4)
  });
}
