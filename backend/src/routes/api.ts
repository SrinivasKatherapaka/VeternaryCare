import { Router } from 'express';
import { login } from '../controllers/authController.js';
import { getDashboardMetrics } from '../controllers/dashboardController.js';
import { getControls, updateControlStatus } from '../controllers/controlsController.js';
import { uploadEvidence, getEvidenceList, reviewEvidence } from '../controllers/evidenceController.js';
import { getRisks, createRisk, resolveRisk, getControlGaps } from '../controllers/risksController.js';
import { getAuditDecisions, generateAuditPackJSON, downloadAuditPackPDF } from '../controllers/auditController.js';
import { getAnalyticsReports } from '../controllers/reportsController.js';
import { getUsers, updateUserRole } from '../controllers/usersController.js';
import { getNotifications, markNotificationRead, createNotification } from '../controllers/notificationsController.js';
import { getSystemSettings } from '../controllers/settingsController.js';
import { getClinicalEncounters, getPatients, getPetOwners, createEncounter, ingestEncounterEvidence } from '../controllers/clinicalController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';
import { uploadMiddleware } from '../middleware/uploadMiddleware.js';

const router = Router();

// ==========================================
// PUBLIC AUTH ROUTE (Module 1)
// ==========================================
router.post('/auth/login', login);

// PROTECTED ROUTES (AUTHENTICATED USER REQUIRED)
router.use(authenticateToken);

// ==========================================
// 1. DASHBOARD COMMAND CENTER
// ==========================================
router.get('/dashboard/metrics', getDashboardMetrics);

// ==========================================
// 2. CLINICAL OPERATIONAL ENGINE (Module 2)
// ==========================================
router.get('/clinical/encounters', getClinicalEncounters);
router.post('/clinical/encounters', createEncounter);
router.get('/clinical/patients', getPatients);
router.get('/clinical/pet-owners', getPetOwners);
router.post('/clinical/encounters/:id/ingest-evidence', ingestEncounterEvidence);

// ==========================================
// 3. CONTROLS LIBRARY & POLICY MAPPING (Module 3)
// ==========================================
router.get('/controls', getControls);
router.patch('/controls/:id', requireRole(['COMPLIANCE_OFFICER', 'CONTROL_OWNER', 'EXECUTIVE_REVIEWER']), updateControlStatus);

// ==========================================
// 4. EVIDENCE & INGESTION AI PIPELINE (Module 4)
// ==========================================
router.get('/evidence', getEvidenceList);
router.post('/evidence/upload', uploadMiddleware.single('file'), uploadEvidence);
router.post('/evidence/review', requireRole(['COMPLIANCE_OFFICER', 'CONTROL_OWNER', 'EXECUTIVE_REVIEWER', 'AUDITOR']), reviewEvidence);

// ==========================================
// 5. RISK REGISTER & CONTROL GAP ENGINE (Module 5)
// ==========================================
router.get('/risks', getRisks);
router.post('/risks', requireRole(['COMPLIANCE_OFFICER', 'CONTROL_OWNER', 'EXECUTIVE_REVIEWER']), createRisk);
router.patch('/risks/:id/resolve', requireRole(['COMPLIANCE_OFFICER', 'CONTROL_OWNER', 'EXECUTIVE_REVIEWER']), resolveRisk);
router.get('/risks/gaps', getControlGaps);

// ==========================================
// 6. IMMUTABLE DECISION AUDIT LOGS (Module 6)
// ==========================================
router.get('/audit/decisions', requireRole(['AUDITOR', 'COMPLIANCE_OFFICER', 'EXECUTIVE_REVIEWER']), getAuditDecisions);

// ==========================================
// 7. AUDIT PACKS & LINEAGE EXPORTER (Module 7)
// ==========================================
router.post('/audit-packs/generate', requireRole(['AUDITOR', 'COMPLIANCE_OFFICER', 'EXECUTIVE_REVIEWER']), generateAuditPackJSON);
router.get('/audit-packs/download-pdf', requireRole(['AUDITOR', 'COMPLIANCE_OFFICER', 'EXECUTIVE_REVIEWER']), downloadAuditPackPDF);

// ==========================================
// 8. REAL-TIME ALERTING & ESCALATIONS (Module 8)
// ==========================================
router.get('/notifications', getNotifications);
router.patch('/notifications/:id/read', markNotificationRead);
router.post('/notifications', createNotification);

// ==========================================
// 9. OBSERVABILITY & AI MODEL TELEMETRY (Module 9)
// ==========================================
router.get('/reports/analytics', requireRole(['COMPLIANCE_OFFICER', 'EXECUTIVE_REVIEWER', 'AUDITOR']), getAnalyticsReports);

// ==========================================
// USER MANAGEMENT & SYSTEM SETTINGS
// ==========================================
router.get('/users', requireRole(['COMPLIANCE_OFFICER', 'EXECUTIVE_REVIEWER']), getUsers);
router.patch('/users/:id', requireRole(['COMPLIANCE_OFFICER', 'EXECUTIVE_REVIEWER']), updateUserRole);
router.get('/settings', getSystemSettings);

export default router;
