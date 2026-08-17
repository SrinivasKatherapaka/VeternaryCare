import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { db } from '../services/dbService.js';
import { RiskIssueCreateSchema } from '../shared/validators.js';

export async function getRisks(req: AuthRequest, res: Response) {
  try {
    const tenantId = req.user!.tenant_id;
    const { severity, resolved } = req.query;

    const risks = await db.getRisks(tenantId, {
      severity: severity as string,
      resolved: resolved !== undefined ? resolved === 'true' : undefined
    });

    return res.json({ success: true, risks });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function createRisk(req: AuthRequest, res: Response) {
  try {
    const parsed = RiskIssueCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: 'Invalid risk creation payload', details: parsed.error.errors });
    }

    const tenantId = req.user!.tenant_id;
    let assigneeName = 'Unassigned';
    if (parsed.data.assigned_to) {
      const users = await db.getAllUsers(tenantId);
      const assignee = users.find(u => u.id === parsed.data.assigned_to);
      if (assignee) assigneeName = assignee.full_name;
    }

    const newRisk = await db.createRisk({
      ...parsed.data,
      tenant_id: tenantId,
      assigned_to_name: assigneeName,
      root_cause: req.body.root_cause,
      remediation_plan: req.body.remediation_plan
    });

    return res.status(201).json({ success: true, risk: newRisk });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function resolveRisk(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const resolved = await db.resolveRisk(id);
    if (!resolved) {
      return res.status(404).json({ success: false, error: 'Risk item not found' });
    }
    return res.json({ success: true, risk: resolved });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getControlGaps(req: AuthRequest, res: Response) {
  try {
    const tenantId = req.user!.tenant_id;
    const controls = await db.getControls(tenantId);
    const evidenceList = await db.getEvidenceList(tenantId);

    // Calculate Dynamic Control Gap & Risk Prioritization Engine
    const gaps = controls.map(ctrl => {
      const relatedEvidence = evidenceList.filter(e => e.control_id === ctrl.id);
      const hasEvidence = relatedEvidence.length > 0;
      const unreviewedCount = relatedEvidence.filter(e => !e.is_reviewed).length;
      const lowConfidenceCount = relatedEvidence.filter(e => Number(e.ai_confidence) < 0.60).length;

      let gapType = 'NONE';
      let gapDescription = 'Control is fully compliant with active verified evidence.';
      let priorityScore = 15; // Baseline healthy score

      if (ctrl.status === 'NON_COMPLIANT') {
        gapType = 'DEFICIT_FAILED';
        gapDescription = 'Control failed compliance inspection. Mandatory corrective action in progress.';
        priorityScore = 95;
      } else if (ctrl.status === 'PARTIALLY_COMPLIANT') {
        gapType = 'PARTIAL_GAP';
        gapDescription = 'Evidence contains identified gaps (e.g. missing witness signature or documentation variance).';
        priorityScore = 78;
      } else if (!hasEvidence) {
        gapType = 'MISSING_EVIDENCE';
        gapDescription = 'No regulatory evidence uploaded to substantiate this operational control.';
        priorityScore = ctrl.risk_rating === 'CRITICAL' ? 90 : (ctrl.risk_rating === 'HIGH' ? 75 : 55);
      } else if (unreviewedCount > 0) {
        gapType = 'UNREVIEWED_EVIDENCE';
        gapDescription = `${unreviewedCount} uploaded evidence artifact(s) pending Human-in-the-Loop review sign-off.`;
        priorityScore = 65;
      } else if (lowConfidenceCount > 0) {
        gapType = 'LOW_CONFIDENCE_AI';
        gapDescription = 'AI classification confidence below 0.60 threshold. Spot-check required.';
        priorityScore = 60;
      }

      return {
        control_id: ctrl.id,
        control_code: ctrl.control_code,
        title: ctrl.title,
        status: ctrl.status,
        risk_rating: ctrl.risk_rating,
        regulatory_body: ctrl.regulatory_body,
        obligation_title: ctrl.obligation_title,
        owner_name: ctrl.owner_name,
        gap_type: gapType,
        gap_description: gapDescription,
        priority_score: priorityScore,
        evidence_count: relatedEvidence.length,
        unreviewed_count: unreviewedCount,
        low_confidence_count: lowConfidenceCount
      };
    });

    // Sort by priority score descending
    gaps.sort((a, b) => b.priority_score - a.priority_score);

    return res.json({ success: true, gaps });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
