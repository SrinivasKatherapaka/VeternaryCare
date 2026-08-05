import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { mockDb } from '../services/mockDb.js';
import { generateAuditPackPDFStream } from '../services/pdfService.js';
import crypto from 'crypto';

export function getAuditDecisions(req: AuthRequest, res: Response) {
  const { actor_id, action } = req.query;

  let list = mockDb.auditLogs.map(l => {
    const control = mockDb.controls.find(c => c.id === l.control_id);
    const evidence = mockDb.evidence.find(e => e.id === l.evidence_id);
    return {
      ...l,
      control_code: control ? control.control_code : 'N/A',
      control_title: control ? control.title : 'N/A',
      file_name: evidence ? evidence.file_name : 'N/A'
    };
  });

  if (actor_id) list = list.filter(l => l.actor_id === actor_id);
  if (action) list = list.filter(l => l.action === action);

  return res.json({ success: true, audit_logs: list });
}

export function generateAuditPackJSON(req: AuthRequest, res: Response) {
  const tenant = mockDb.tenants[0];
  const controls = mockDb.controls;
  const auditLogs = mockDb.auditLogs;
  const evidence = mockDb.evidence;

  const packData = {
    tenant,
    controls,
    evidence,
    auditLogs,
    exported_at: new Date().toISOString(),
    exporter: {
      id: req.user!.id,
      name: req.user!.full_name,
      role: req.user!.role
    }
  };

  const sha256Seal = crypto.createHash('sha256').update(JSON.stringify(packData)).digest('hex');

  return res.json({
    success: true,
    sha256_seal: sha256Seal,
    audit_pack: packData
  });
}

export function downloadAuditPackPDF(req: AuthRequest, res: Response) {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=Veterinary_Compliance_Audit_Pack_${Date.now()}.pdf`);

  const pdfStream = generateAuditPackPDFStream();
  pdfStream.pipe(res);
}
