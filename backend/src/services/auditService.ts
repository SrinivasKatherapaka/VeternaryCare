import { mockDb, DecisionAuditLog } from './mockDb.js';
import { HumanReviewInput, UserRole, ControlStatus } from '../shared/validators.js';

export function recordAuditDecision(
  input: HumanReviewInput,
  actor: { id: string; name: string; role: UserRole; tenant_id: string }
): DecisionAuditLog {
  const control = mockDb.controls.find(c => c.id === input.control_id);
  const evidence = mockDb.evidence.find(e => e.id === input.evidence_id);

  const previous_status = control ? control.status : 'UNTESTED';

  // Update control status
  if (control) {
    control.status = input.new_status as ControlStatus;
    control.last_tested_at = new Date().toISOString();
    control.updated_at = new Date().toISOString();
  }

  // Update evidence reviewed state
  if (evidence) {
    evidence.is_reviewed = true;
  }

  const logEntry: DecisionAuditLog = {
    id: `log-${Date.now()}`,
    tenant_id: actor.tenant_id,
    evidence_id: input.evidence_id,
    control_id: input.control_id,
    actor_id: actor.id,
    actor_name: actor.name,
    actor_role: actor.role,
    action: input.action,
    previous_status,
    new_status: input.new_status as ControlStatus,
    reason: input.reason,
    ai_suggestion_snapshot: evidence ? {
      confidence: evidence.ai_confidence,
      category: evidence.category,
      explanation: evidence.ai_grounding_explanation
    } : null,
    created_at: new Date().toISOString()
  };

  mockDb.auditLogs.unshift(logEntry);

  // If status is NON_COMPLIANT, auto-create a risk item in risk register
  if (input.new_status === 'NON_COMPLIANT') {
    mockDb.risks.unshift({
      id: `risk-${Date.now()}`,
      tenant_id: actor.tenant_id,
      control_id: input.control_id,
      title: `Escalated Compliance Deficit: ${control ? control.control_code : 'Control'}`,
      description: `Human reviewer (${actor.name}) marked control NON_COMPLIANT during audit review. Rationale: ${input.reason}`,
      severity: 'HIGH',
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      assigned_to: actor.id,
      assigned_to_name: actor.name,
      is_resolved: false,
      created_at: new Date().toISOString()
    });
  }

  return logEntry;
}
