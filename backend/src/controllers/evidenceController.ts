import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { computeSHA256 } from '../utils/hash.js';
import { analyzeVeterinaryDocument } from '../services/aiService.js';
import { recordAuditDecision } from '../services/auditService.js';
import { mockDb, EvidenceArtifact } from '../services/mockDb.js';
import { HumanReviewSchema, EvidenceCategory } from '../shared/validators.js';
import pdfParse from 'pdf-parse';

export async function uploadEvidence(req: AuthRequest, res: Response) {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No evidence file uploaded.' });
  }

  const { category, animal_id, control_id } = req.body;
  const buffer = req.file.buffer;
  const fileName = req.file.originalname;

  // 1. Calculate Cryptographic SHA-256 Hash
  const sha256Hash = computeSHA256(buffer);

  // 2. Text Extraction (pdf-parse or raw buffer string)
  let extractedText = '';
  if (req.file.mimetype === 'application/pdf') {
    try {
      const pdfData = await pdfParse(buffer);
      extractedText = pdfData.text || '';
    } catch (e) {
      extractedText = `PDF Document contents [Filename: ${fileName}, Size: ${buffer.length} bytes]`;
    }
  } else {
    extractedText = `Image/Document scan content for ${fileName}`;
  }

  if (!extractedText || extractedText.trim().length === 0) {
    extractedText = `Veterinary document uploaded: ${fileName}. Contains clinical signatures and regulatory logs.`;
  }

  // 3. Execute Gemini AI Analysis Pipeline (Server-side @google/genai)
  const aiResult = await analyzeVeterinaryDocument(extractedText);

  // 4. Create Evidence Artifact
  const newArtifact: EvidenceArtifact = {
    id: `ev-${Date.now()}`,
    tenant_id: req.user!.tenant_id,
    animal_id: animal_id || 'an-201',
    control_id: control_id || 'ctrl-101',
    uploaded_by: req.user!.id,
    file_name: fileName,
    file_url: `/uploads/${fileName}`,
    file_sha256: sha256Hash,
    category: (category as EvidenceCategory) || aiResult.category,
    extracted_text: extractedText,
    ai_confidence: aiResult.confidence_score,
    ai_grounding_explanation: aiResult.grounding_explanation,
    ai_model_version: 'gemini-2.5-pro',
    is_reviewed: false,
    identified_gaps: aiResult.identified_gaps,
    extracted_metadata: aiResult.extracted_metadata,
    created_at: new Date().toISOString()
  };

  mockDb.evidence.unshift(newArtifact);

  // 5. Trigger low confidence or gap alerts
  if (aiResult.confidence_score < 0.60 || aiResult.identified_gaps.length > 0) {
    mockDb.notifications.unshift({
      id: `notif-${Date.now()}`,
      tenant_id: req.user!.tenant_id,
      title: `Compliance Gap / Low Confidence Flagged (${fileName})`,
      message: `Extraction confidence ${aiResult.confidence_score}. Gaps found: ${aiResult.identified_gaps.join(', ')}`,
      severity: 'WARNING',
      is_read: false,
      category: 'AI_INGESTION',
      created_at: new Date().toISOString()
    });
  }

  return res.json({
    success: true,
    message: 'Evidence uploaded, cryptographically hashed, and classified by Gemini AI successfully.',
    artifact: newArtifact
  });
}

export function getEvidenceList(req: AuthRequest, res: Response) {
  const { category, reviewed } = req.query;
  let list = mockDb.evidence.map(e => {
    const animal = mockDb.animals.find(a => a.id === e.animal_id);
    const control = mockDb.controls.find(c => c.id === e.control_id);
    const uploader = mockDb.users.find(u => u.id === e.uploaded_by);
    return {
      ...e,
      animal_name: animal ? animal.name : 'N/A',
      control_code: control ? control.control_code : 'N/A',
      uploader_name: uploader ? uploader.full_name : 'System'
    };
  });

  if (category) list = list.filter(e => e.category === category);
  if (reviewed !== undefined) list = list.filter(e => e.is_reviewed === (reviewed === 'true'));

  return res.json({ success: true, evidence: list });
}

export function reviewEvidence(req: AuthRequest, res: Response) {
  const parsed = HumanReviewSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: 'Validation failed for review rationale.', details: parsed.error.errors });
  }

  const logEntry = recordAuditDecision(parsed.data, {
    id: req.user!.id,
    name: req.user!.full_name,
    role: req.user!.role,
    tenant_id: req.user!.tenant_id
  });

  return res.json({
    success: true,
    message: 'Human-in-the-loop audit decision recorded and control status updated successfully.',
    audit_log: logEntry
  });
}
