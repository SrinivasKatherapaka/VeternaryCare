import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { db } from '../services/dbService.js';
import { generateAuditPackPDFStream } from '../services/pdfService.js';
import crypto from 'crypto';

export async function getAuditDecisions(req: AuthRequest, res: Response) {
  try {
    const tenantId = req.user!.tenant_id;
    const { actor_id, action } = req.query;

    const auditLogs = await db.getAuditDecisions(tenantId, {
      actorId: actor_id as string,
      action: action as string
    });

    return res.json({ success: true, audit_logs: auditLogs });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function generateAuditPackJSON(req: AuthRequest, res: Response) {
  try {
    const tenantId = req.user!.tenant_id;
    const tenant = await db.getTenant(tenantId);
    const controls = await db.getControls(tenantId);
    const auditLogs = await db.getAuditDecisions(tenantId);
    const evidence = await db.getEvidenceList(tenantId);
    const risks = await db.getRisks(tenantId);
    const encounters = await db.getClinicalEncounters(tenantId);

    const packData = {
      tenant,
      manifest: {
        total_controls: controls.length,
        compliant_controls: controls.filter(c => c.status === 'COMPLIANT').length,
        total_evidence_artifacts: evidence.length,
        total_audit_decisions: auditLogs.length,
        active_risks: risks.filter(r => !r.is_resolved).length,
        total_clinical_encounters: encounters.length
      },
      controls,
      evidence,
      auditLogs,
      risks,
      clinicalEncounters: encounters,
      exported_at: new Date().toISOString(),
      exporter: {
        id: req.user!.id,
        name: req.user!.full_name,
        role: req.user!.role,
        license_number: req.user!.license_number
      }
    };

    const sha256Seal = crypto.createHash('sha256').update(JSON.stringify(packData)).digest('hex');

    return res.json({
      success: true,
      sha256_seal: sha256Seal,
      audit_pack: packData
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function downloadAuditPackPDF(req: AuthRequest, res: Response) {
  try {
    const tenantId = req.user!.tenant_id;
    const tenant = await db.getTenant(tenantId);
    const controls = await db.getControls(tenantId);
    const auditLogs = await db.getAuditDecisions(tenantId);
    const evidence = await db.getEvidenceList(tenantId);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Veterinary_Compliance_Audit_Pack_${Date.now()}.pdf`);

    const pdfStream = generateAuditPackPDFStream({
      tenant,
      controls,
      auditLogs,
      evidence,
      user: req.user!
    });
    pdfStream.pipe(res);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
