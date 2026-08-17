import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { db } from '../services/dbService.js';

export async function getSystemSettings(req: AuthRequest, res: Response) {
  try {
    const tenantId = req.user!.tenant_id;
    const tenant = await db.getTenant(tenantId);
    const settings = await db.getSettings(tenantId);

    return res.json({
      success: true,
      facilityProfile: tenant,
      settings: settings || {
        confidence_threshold_high: 0.85,
        confidence_threshold_low: 0.60,
        auto_escalation_enabled: true,
        retention_surgical_consent_months: 84,
        retention_controlled_logs_months: 60,
        retention_medical_records_months: 84,
        enforce_mandatory_rationale: true
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
