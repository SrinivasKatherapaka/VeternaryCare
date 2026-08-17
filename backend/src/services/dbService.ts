import { pool } from '../config/database.js';
import { logger } from '../utils/logger.js';

export class DbService {
  /**
   * Generic query executor with error logging
   */
  async query<T = any>(text: string, params: any[] = []): Promise<T[]> {
    try {
      const start = Date.now();
      const res = await pool.query(text, params);
      const duration = Date.now() - start;
      if (duration > 500) {
        logger.warn(`Slow PostgreSQL query (${duration}ms): ${text.substring(0, 80)}...`);
      }
      return res.rows as T[];
    } catch (err: any) {
      logger.error(`Database Query Error: ${err.message}`, { sql: text, params });
      throw err;
    }
  }

  async queryOne<T = any>(text: string, params: any[] = []): Promise<T | null> {
    const rows = await this.query<T>(text, params);
    return rows.length > 0 ? rows[0] : null;
  }

  // ==========================================
  // 1. AUTH & USER RBAC (Module 1)
  // ==========================================
  async getUserByEmail(email: string) {
    return this.queryOne(`
      SELECT u.*, t.name as tenant_name, t.license_number as tenant_license, t.accreditation, t.dea_registration_number, t.state_board_license
      FROM app_users u
      JOIN hospital_tenants t ON u.tenant_id = t.id
      WHERE LOWER(u.email) = LOWER($1) AND u.is_active = TRUE
    `, [email]);
  }

  async updateLastLogin(userId: string) {
    return this.query(`
      UPDATE app_users SET last_login_at = NOW() WHERE id = $1
    `, [userId]);
  }

  async getAllUsers(tenantId: string) {
    return this.query(`
      SELECT id, tenant_id, email, full_name, title, role, license_number, is_active, last_login_at, created_at
      FROM app_users
      WHERE tenant_id = $1
      ORDER BY role ASC, full_name ASC
    `, [tenantId]);
  }

  async updateUserRole(userId: string, role: string) {
    return this.queryOne(`
      UPDATE app_users
      SET role = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, email, full_name, role, updated_at
    `, [role, userId]);
  }

  // ==========================================
  // 2. CLINICAL OPERATIONAL ENGINE (Module 2)
  // ==========================================
  async getClinicalEncounters(tenantId: string) {
    return this.query(`
      SELECT e.*, 
             a.name as animal_name, a.species, a.breed, a.microchip_id, a.medical_record_number,
             o.full_name as owner_name, o.phone as owner_phone, o.email as owner_email,
             u.full_name as vet_name, u.license_number as vet_license,
             c.control_code, c.title as control_title
      FROM clinical_encounters e
      LEFT JOIN animals a ON e.animal_id = a.id
      LEFT JOIN pet_owners o ON e.owner_id = o.id
      LEFT JOIN app_users u ON e.veterinarian_id = u.id
      LEFT JOIN compliance_controls c ON e.control_id = c.id
      WHERE e.tenant_id = $1
      ORDER BY e.created_at DESC
    `, [tenantId]);
  }

  async getPatients(tenantId: string) {
    return this.query(`
      SELECT a.*, o.full_name as owner_name, o.phone as owner_phone, o.email as owner_email, o.address as owner_address
      FROM animals a
      JOIN pet_owners o ON a.owner_id = o.id
      WHERE a.tenant_id = $1
      ORDER BY a.name ASC
    `, [tenantId]);
  }

  async getPetOwners(tenantId: string) {
    return this.query(`
      SELECT * FROM pet_owners WHERE tenant_id = $1 ORDER BY full_name ASC
    `, [tenantId]);
  }

  async createClinicalEncounter(data: any) {
    return this.queryOne(`
      INSERT INTO clinical_encounters (
        tenant_id, animal_id, owner_id, veterinarian_id, control_id,
        encounter_type, procedure_name, date_of_service, drug_name, drug_schedule,
        initial_safe_balance, dispensed_volume, waste_volume, final_safe_balance,
        witness_signature_present, owner_consent_verified, vcpr_active_verified, is_compliant, clinical_notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING *
    `, [
      data.tenant_id, data.animal_id, data.owner_id, data.veterinarian_id, data.control_id,
      data.encounter_type, data.procedure_name, data.date_of_service || new Date(),
      data.drug_name, data.drug_schedule, data.initial_safe_balance, data.dispensed_volume,
      data.waste_volume, data.final_safe_balance, data.witness_signature_present ?? false,
      data.owner_consent_verified ?? false, data.vcpr_active_verified ?? false,
      data.is_compliant ?? true, data.clinical_notes
    ]);
  }

  // ==========================================
  // 3. CONTROLS & OBLIGATIONS (Module 3)
  // ==========================================
  async getControls(tenantId: string, filters: { status?: string; risk?: string; search?: string } = {}) {
    let sql = `
      SELECT c.*, 
             o.regulatory_body, o.code as obligation_code, o.title as obligation_title, o.description as obligation_description, o.category as obligation_category, o.penalty_guidance,
             u.full_name as owner_name, u.email as owner_email,
             (SELECT COUNT(*) FROM evidence_artifacts e WHERE e.control_id = c.id) as evidence_count
      FROM compliance_controls c
      LEFT JOIN compliance_obligations o ON c.obligation_id = o.id
      LEFT JOIN app_users u ON c.owner_id = u.id
      WHERE c.tenant_id = $1
    `;
    const params: any[] = [tenantId];

    if (filters.status) {
      params.push(filters.status);
      sql += ` AND c.status = $${params.length}`;
    }

    if (filters.risk) {
      params.push(filters.risk);
      sql += ` AND c.risk_rating = $${params.length}`;
    }

    if (filters.search) {
      params.push(`%${filters.search}%`);
      sql += ` AND (LOWER(c.title) LIKE LOWER($${params.length}) OR LOWER(c.control_code) LIKE LOWER($${params.length}) OR LOWER(o.regulatory_body) LIKE LOWER($${params.length}))`;
    }

    sql += ` ORDER BY c.control_code ASC`;
    return this.query(sql, params);
  }

  async getControlById(controlId: string) {
    return this.queryOne(`
      SELECT c.*, o.regulatory_body, o.code as obligation_code, o.title as obligation_title, o.category as obligation_category,
             u.full_name as owner_name
      FROM compliance_controls c
      LEFT JOIN compliance_obligations o ON c.obligation_id = o.id
      LEFT JOIN app_users u ON c.owner_id = u.id
      WHERE c.id = $1
    `, [controlId]);
  }

  async updateControlStatus(controlId: string, status?: string, riskRating?: string) {
    const updates: string[] = ['updated_at = NOW()'];
    const params: any[] = [controlId];

    if (status) {
      params.push(status);
      updates.push(`status = $${params.length}`);
      updates.push(`last_tested_at = NOW()`);
    }
    if (riskRating) {
      params.push(riskRating);
      updates.push(`risk_rating = $${params.length}`);
    }

    const sql = `
      UPDATE compliance_controls
      SET ${updates.join(', ')}
      WHERE id = $1
      RETURNING *
    `;
    return this.queryOne(sql, params);
  }

  async getObligations() {
    return this.query(`
      SELECT o.*, (SELECT COUNT(*) FROM compliance_controls c WHERE c.obligation_id = o.id) as linked_controls_count
      FROM compliance_obligations o
      ORDER BY o.regulatory_body ASC, o.code ASC
    `);
  }

  // ==========================================
  // 4. EVIDENCE ARTIFACTS & INGESTION (Module 4)
  // ==========================================
  async getEvidenceList(tenantId: string, filters: { category?: string; reviewed?: boolean } = {}) {
    let sql = `
      SELECT e.*, 
             a.name as animal_name, a.species, a.breed,
             c.control_code, c.title as control_title,
             u.full_name as uploader_name
      FROM evidence_artifacts e
      LEFT JOIN animals a ON e.animal_id = a.id
      LEFT JOIN compliance_controls c ON e.control_id = c.id
      LEFT JOIN app_users u ON e.uploaded_by = u.id
      WHERE e.tenant_id = $1
    `;
    const params: any[] = [tenantId];

    if (filters.category) {
      params.push(filters.category);
      sql += ` AND e.category = $${params.length}`;
    }

    if (filters.reviewed !== undefined) {
      params.push(filters.reviewed);
      sql += ` AND e.is_reviewed = $${params.length}`;
    }

    sql += ` ORDER BY e.created_at DESC`;
    return this.query(sql, params);
  }

  async getEvidenceById(evidenceId: string) {
    return this.queryOne(`
      SELECT e.*, 
             a.name as animal_name, 
             c.control_code, c.title as control_title, c.status as control_status,
             u.full_name as uploader_name
      FROM evidence_artifacts e
      LEFT JOIN animals a ON e.animal_id = a.id
      LEFT JOIN compliance_controls c ON e.control_id = c.id
      LEFT JOIN app_users u ON e.uploaded_by = u.id
      WHERE e.id = $1
    `, [evidenceId]);
  }

  async createEvidence(data: any) {
    return this.queryOne(`
      INSERT INTO evidence_artifacts (
        tenant_id, animal_id, control_id, encounter_id, uploaded_by,
        file_name, file_url, file_sha256, category, extracted_text,
        ai_confidence, ai_grounding_explanation, ai_model_version,
        identified_gaps, extracted_metadata, is_reviewed
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *
    `, [
      data.tenant_id, data.animal_id, data.control_id, data.encounter_id, data.uploaded_by,
      data.file_name, data.file_url, data.file_sha256, data.category, data.extracted_text,
      data.ai_confidence, data.ai_grounding_explanation, data.ai_model_version || 'gemini-2.5-pro',
      JSON.stringify(data.identified_gaps || []), JSON.stringify(data.extracted_metadata || {}),
      data.is_reviewed ?? false
    ]);
  }

  async markEvidenceReviewed(evidenceId: string) {
    return this.query(`
      UPDATE evidence_artifacts SET is_reviewed = TRUE WHERE id = $1
    `, [evidenceId]);
  }

  // ==========================================
  // 5. RISKS & CONTROL GAPS (Module 5)
  // ==========================================
  async getRisks(tenantId: string, filters: { severity?: string; resolved?: boolean } = {}) {
    let sql = `
      SELECT r.*, c.control_code, c.title as control_title,
             u.full_name as assignee_name, u.email as assignee_email
      FROM risk_issues r
      LEFT JOIN compliance_controls c ON r.control_id = c.id
      LEFT JOIN app_users u ON r.assigned_to = u.id
      WHERE r.tenant_id = $1
    `;
    const params: any[] = [tenantId];

    if (filters.severity) {
      params.push(filters.severity);
      sql += ` AND r.severity = $${params.length}`;
    }

    if (filters.resolved !== undefined) {
      params.push(filters.resolved);
      sql += ` AND r.is_resolved = $${params.length}`;
    }

    sql += ` ORDER BY r.due_date ASC, r.created_at DESC`;
    return this.query(sql, params);
  }

  async createRisk(data: any) {
    return this.queryOne(`
      INSERT INTO risk_issues (
        tenant_id, control_id, title, description, severity, due_date,
        assigned_to, assigned_to_name, root_cause, remediation_plan, is_resolved
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, FALSE)
      RETURNING *
    `, [
      data.tenant_id, data.control_id, data.title, data.description,
      data.severity, data.due_date, data.assigned_to, data.assigned_to_name,
      data.root_cause || 'Identified during compliance audit review',
      data.remediation_plan || 'Pending corrective action execution'
    ]);
  }

  async resolveRisk(riskId: string) {
    return this.queryOne(`
      UPDATE risk_issues
      SET is_resolved = TRUE
      WHERE id = $1
      RETURNING *
    `, [riskId]);
  }

  // ==========================================
  // 6. IMMUTABLE DECISION LINEAGE (Module 6)
  // ==========================================
  async getAuditDecisions(tenantId: string, filters: { actorId?: string; action?: string } = {}) {
    let sql = `
      SELECT l.*, 
             c.control_code, c.title as control_title,
             e.file_name, e.category as evidence_category
      FROM decision_audit_logs l
      LEFT JOIN compliance_controls c ON l.control_id = c.id
      LEFT JOIN evidence_artifacts e ON l.evidence_id = e.id
      WHERE l.tenant_id = $1
    `;
    const params: any[] = [tenantId];

    if (filters.actorId) {
      params.push(filters.actorId);
      sql += ` AND l.actor_id = $${params.length}`;
    }

    if (filters.action) {
      params.push(filters.action);
      sql += ` AND l.action = $${params.length}`;
    }

    sql += ` ORDER BY l.created_at DESC`;
    return this.query(sql, params);
  }

  async recordDecisionLog(data: any) {
    return this.queryOne(`
      INSERT INTO decision_audit_logs (
        tenant_id, evidence_id, control_id, actor_id, actor_name, actor_role,
        action, previous_status, new_status, reason, evidence_sha256_snapshot, ai_suggestion_snapshot
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `, [
      data.tenant_id, data.evidence_id, data.control_id, data.actor_id,
      data.actor_name, data.actor_role, data.action, data.previous_status,
      data.new_status, data.reason, data.evidence_sha256_snapshot,
      JSON.stringify(data.ai_suggestion_snapshot || null)
    ]);
  }

  // ==========================================
  // 7. REAL-TIME ALERTING (Module 8)
  // ==========================================
  async getNotifications(tenantId: string) {
    return this.query(`
      SELECT * FROM system_notifications
      WHERE tenant_id = $1
      ORDER BY is_read ASC, created_at DESC
    `, [tenantId]);
  }

  async markNotificationRead(id: string) {
    return this.queryOne(`
      UPDATE system_notifications SET is_read = TRUE WHERE id = $1 RETURNING *
    `, [id]);
  }

  async createNotification(data: any) {
    return this.queryOne(`
      INSERT INTO system_notifications (
        tenant_id, title, message, severity, category, escalation_tier, action_url, is_read
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, FALSE)
      RETURNING *
    `, [
      data.tenant_id, data.title, data.message,
      data.severity || 'MEDIUM', data.category || 'SYSTEM',
      data.escalation_tier || 'TIER_1_TECH', data.action_url || '/dashboard'
    ]);
  }

  // ==========================================
  // 8. OBSERVABILITY & TELEMETRY (Module 9)
  // ==========================================
  async recordTelemetry(data: any) {
    return this.queryOne(`
      INSERT INTO model_telemetry (
        tenant_id, model_name, document_category, latency_ms, confidence_score, token_count, was_overridden, override_reason, drift_score
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      data.tenant_id, data.model_name || 'gemini-2.5-pro', data.document_category,
      data.latency_ms, data.confidence_score, data.token_count || 400,
      data.was_overridden || false, data.override_reason || null, data.drift_score || 0.04
    ]);
  }

  async getTelemetry(tenantId: string) {
    return this.query(`
      SELECT * FROM model_telemetry
      WHERE tenant_id = $1
      ORDER BY created_at DESC
      LIMIT 100
    `, [tenantId]);
  }

  // ==========================================
  // 9. SETTINGS & TENANTS
  // ==========================================
  async getTenant(tenantId: string) {
    return this.queryOne(`SELECT * FROM hospital_tenants WHERE id = $1`, [tenantId]);
  }

  async getSettings(tenantId: string) {
    return this.queryOne(`SELECT * FROM system_settings WHERE tenant_id = $1`, [tenantId]);
  }
}

export const db = new DbService();
