import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { mockDb } from '../services/mockDb.js';

export function getAnalyticsReports(req: AuthRequest, res: Response) {
  const totalReviews = mockDb.auditLogs.length;
  const overrides = mockDb.auditLogs.filter(l => l.action === 'OVERRIDE' || l.action === 'REJECT').length;
  const accepts = mockDb.auditLogs.filter(l => l.action === 'ACCEPT').length;

  const overrideRate = totalReviews > 0 ? Math.round((overrides / totalReviews) * 100) : 15;
  const acceptanceRate = totalReviews > 0 ? Math.round((accepts / totalReviews) * 100) : 85;

  const latencyHistory = [
    { date: '2026-08-01', p50_ms: 320, p95_ms: 850, model: 'gemini-2.5-pro' },
    { date: '2026-08-02', p50_ms: 290, p95_ms: 780, model: 'gemini-2.5-pro' },
    { date: '2026-08-03', p50_ms: 310, p95_ms: 810, model: 'gemini-2.5-pro' },
    { date: '2026-08-04', p50_ms: 275, p95_ms: 740, model: 'gemini-2.5-pro' },
    { date: '2026-08-05', p50_ms: 260, p95_ms: 710, model: 'gemini-2.5-pro' }
  ];

  const confidenceDistribution = [
    { range: '0.90 - 1.00', count: 18, label: 'High Confidence' },
    { range: '0.75 - 0.89', count: 9, label: 'Standard Review' },
    { range: '0.60 - 0.74', count: 4, label: 'Needs Human Spot-Check' },
    { range: '< 0.60', count: 2, label: 'Flagged Low Confidence' }
  ];

  const overrideCategoryBreakdown = [
    { category: 'CONTROLLED_DRUG_LOG', count: 4, primaryReason: 'Missing witness waste signature' },
    { category: 'PRESCRIPTION_CONTROLLED_SUBSTANCE', count: 2, primaryReason: 'VCPR license expiration check' },
    { category: 'SURGICAL_CONSENT', count: 1, primaryReason: 'Illegible owner handwriting scan' }
  ];

  return res.json({
    success: true,
    performance: {
      totalReviews,
      acceptanceRate,
      overrideRate,
      avgConfidence: 0.88,
      avgLatencyMs: 285,
      driftIndex: 0.04
    },
    latencyHistory,
    confidenceDistribution,
    overrideCategoryBreakdown
  });
}
