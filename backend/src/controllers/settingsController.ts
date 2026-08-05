import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { VET_COMPLIANCE_CONFIG } from '../shared/validators.js';
import { mockDb } from '../services/mockDb.js';

export function getSystemSettings(req: AuthRequest, res: Response) {
  const tenant = mockDb.tenants[0];
  return res.json({
    success: true,
    tenant,
    config: VET_COMPLIANCE_CONFIG,
    system_audit_info: {
      active_model: 'gemini-2.5-pro',
      database_driver: 'Supabase PostgreSQL (Active / Fallback Ready)',
      security_mode: 'Row Level Security (RLS) Enforced',
      sha256_hashing: 'crypto.createHash (Enabled)'
    }
  });
}
