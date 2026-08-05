import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { mockDb } from '../services/mockDb.js';

export function getControls(req: AuthRequest, res: Response) {
  const { status, risk, search } = req.query;

  let list = mockDb.controls.map(c => {
    const obligation = mockDb.obligations.find(o => o.id === c.obligation_id);
    const owner = mockDb.users.find(u => u.id === c.owner_id);
    return {
      ...c,
      obligation,
      owner_name: owner ? owner.full_name : 'Unassigned'
    };
  });

  if (status) {
    list = list.filter(c => c.status === status);
  }
  if (risk) {
    list = list.filter(c => c.risk_rating === risk);
  }
  if (search) {
    const q = (search as string).toLowerCase();
    list = list.filter(c => c.title.toLowerCase().includes(q) || c.control_code.toLowerCase().includes(q));
  }

  return res.json({ success: true, controls: list });
}

export function updateControlStatus(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { status, risk_rating } = req.body;

  const control = mockDb.controls.find(c => c.id === id);
  if (!control) {
    return res.status(404).json({ success: false, error: 'Control not found' });
  }

  if (status) control.status = status;
  if (risk_rating) control.risk_rating = risk_rating;
  control.updated_at = new Date().toISOString();

  return res.json({ success: true, control });
}
