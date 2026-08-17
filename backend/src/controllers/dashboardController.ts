import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { db } from '../services/dbService.js';

export async function getDashboardMetrics(req: AuthRequest, res: Response) {
  try {
    const tenantId = req.user!.tenant_id;
    const controls = await db.getControls(tenantId);
    const risks = await db.getRisks(tenantId);
    const evidence = await db.getEvidenceList(tenantId);
    const auditLogs = await db.getAuditDecisions(tenantId);
    const encounters = await db.getClinicalEncounters(tenantId);

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
    const lowConfidenceExtractions = evidence.filter(e => Number(e.ai_confidence) < 0.60).length;

    // Group controls by regulatory domain
    const domainMap: Record<string, { total: number; compliant: number; riskRating: string }> = {};
    controls.forEach(c => {
      const domain = c.regulatory_body || 'General Hospital Mandate';
      if (!domainMap[domain]) {
        domainMap[domain] = { total: 0, compliant: 0, riskRating: c.risk_rating };
      }
      domainMap[domain].total += 1;
      if (c.status === 'COMPLIANT') domainMap[domain].compliant += 1;
    });

    const domainBreakdown = Object.entries(domainMap).map(([domain, data]) => ({
      domain,
      controls: data.total,
      compliant: data.compliant,
      complianceRate: data.total > 0 ? Math.round((data.compliant / data.total) * 100) : 0,
      risk: data.riskRating
    }));

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
        lowConfidenceExtractions,
        totalClinicalEncounters: encounters.length,
        totalEvidenceArtifacts: evidence.length,
        totalDecisionLogs: auditLogs.length
      },
      domainBreakdown,
      recentAudits: auditLogs.slice(0, 5),
      topRisks: activeRisks.slice(0, 4)
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
