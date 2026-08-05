import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { mockDb } from '../services/mockDb.js';
import { RiskIssueCreateSchema } from '../shared/validators.js';

export function getRisks(req: AuthRequest, res: Response) {
  const { severity, resolved } = req.query;

  let list = mockDb.risks.map(r => {
    const control = mockDb.controls.find(c => c.id === r.control_id);
    const assignee = mockDb.users.find(u => u.id === r.assigned_to);
    return {
      ...r,
      control_code: control ? control.control_code : 'N/A',
      assigned_to_name: assignee ? assignee.full_name : 'Unassigned'
    };
  });

  if (severity) list = list.filter(r => r.severity === severity);
  if (resolved !== undefined) list = list.filter(r => r.is_resolved === (resolved === 'true'));

  return res.json({ success: true, risks: list });
}

export function createRisk(req: AuthRequest, res: Response) {
  const parsed = RiskIssueCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: 'Invalid risk creation payload', details: parsed.error.errors });
  }

  const assignee = mockDb.users.find(u => u.id === parsed.data.assigned_to);

  const newRisk = {
    id: `risk-${Date.now()}`,
    tenant_id: req.user!.tenant_id,
    control_id: parsed.data.control_id,
    title: parsed.data.title,
    description: parsed.data.description,
    severity: parsed.data.severity,
    due_date: parsed.data.due_date,
    assigned_to: parsed.data.assigned_to,
    assigned_to_name: assignee ? assignee.full_name : 'Unassigned',
    is_resolved: false,
    created_at: new Date().toISOString()
  };

  mockDb.risks.unshift(newRisk);
  return res.json({ success: true, risk: newRisk });
}

export function resolveRisk(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const risk = mockDb.risks.find(r => r.id === id);

  if (!risk) {
    return res.status(404).json({ success: false, error: 'Risk item not found' });
  }

  risk.is_resolved = true;
  return res.json({ success: true, risk });
}
