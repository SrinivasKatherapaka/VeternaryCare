import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { db } from '../services/dbService.js';

export async function getControls(req: AuthRequest, res: Response) {
  try {
    const tenantId = req.user!.tenant_id;
    const { status, risk, search } = req.query;

    const controls = await db.getControls(tenantId, {
      status: status as string,
      risk: risk as string,
      search: search as string
    });

    const obligations = await db.getObligations();

    return res.json({
      success: true,
      controls: controls.map(c => ({
        ...c,
        obligation: {
          regulatory_body: c.regulatory_body,
          code: c.obligation_code,
          title: c.obligation_title,
          description: c.obligation_description,
          category: c.obligation_category,
          penalty_guidance: c.penalty_guidance
        }
      })),
      obligations
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function updateControlStatus(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { status, risk_rating } = req.body;

    const updated = await db.updateControlStatus(id, status, risk_rating);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Control not found' });
    }

    return res.json({ success: true, control: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
