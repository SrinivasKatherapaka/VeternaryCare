import { Router } from 'express';
import { login } from '../controllers/authController.js';
import { getDashboardMetrics } from '../controllers/dashboardController.js';
import { getControls, updateControlStatus } from '../controllers/controlsController.js';
import { uploadEvidence, getEvidenceList, reviewEvidence } from '../controllers/evidenceController.js';
import { getRisks, createRisk, resolveRisk } from '../controllers/risksController.js';
import { getAuditDecisions, generateAuditPackJSON, downloadAuditPackPDF } from '../controllers/auditController.js';
import { getAnalyticsReports } from '../controllers/reportsController.js';
import { getUsers, updateUserRole } from '../controllers/usersController.js';
import { getNotifications, markNotificationRead } from '../controllers/notificationsController.js';
import { getSystemSettings } from '../controllers/settingsController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';
import { uploadMiddleware } from '../middleware/uploadMiddleware.js';

const router = Router();

// PUBLIC AUTH ROUTE
router.post('/auth/login', login);

// PROTECTED ROUTES (AUTHENTICATED USER REQUIRED)
router.use(authenticateToken);

// Dashboard
router.get('/dashboard/metrics', getDashboardMetrics);

// Controls Library
router.get('/controls', getControls);
router.patch('/controls/:id', requireRole(['COMPLIANCE_OFFICER', 'CONTROL_OWNER', 'EXECUTIVE_REVIEWER']), updateControlStatus);

// Evidence & Ingestion AI Pipeline
router.get('/evidence', getEvidenceList);
router.post('/evidence/upload', uploadMiddleware.single('file'), uploadEvidence);
router.post('/evidence/review', requireRole(['COMPLIANCE_OFFICER', 'CONTROL_OWNER', 'EXECUTIVE_REVIEWER', 'AUDITOR']), reviewEvidence);

// Risk Register
router.get('/risks', getRisks);
router.post('/risks', requireRole(['COMPLIANCE_OFFICER', 'CONTROL_OWNER', 'EXECUTIVE_REVIEWER']), createRisk);
router.patch('/risks/:id/resolve', requireRole(['COMPLIANCE_OFFICER', 'CONTROL_OWNER', 'EXECUTIVE_REVIEWER']), resolveRisk);

// Immutable Audit Logs & Audit Packs
router.get('/audit/decisions', requireRole(['AUDITOR', 'COMPLIANCE_OFFICER', 'EXECUTIVE_REVIEWER']), getAuditDecisions);
router.post('/audit-packs/generate', requireRole(['AUDITOR', 'COMPLIANCE_OFFICER', 'EXECUTIVE_REVIEWER']), generateAuditPackJSON);
router.get('/audit-packs/download-pdf', requireRole(['AUDITOR', 'COMPLIANCE_OFFICER', 'EXECUTIVE_REVIEWER']), downloadAuditPackPDF);

// Observability & Analytics Reports
router.get('/reports/analytics', requireRole(['COMPLIANCE_OFFICER', 'EXECUTIVE_REVIEWER', 'AUDITOR']), getAnalyticsReports);

// Notifications & Alerting
router.get('/notifications', getNotifications);
router.patch('/notifications/:id/read', markNotificationRead);

// User Management & Scope Provisioning
router.get('/users', requireRole(['COMPLIANCE_OFFICER', 'EXECUTIVE_REVIEWER']), getUsers);
router.patch('/users/:id', requireRole(['COMPLIANCE_OFFICER', 'EXECUTIVE_REVIEWER']), updateUserRole);

// Settings & Master Config
router.get('/settings', getSystemSettings);

export default router;
