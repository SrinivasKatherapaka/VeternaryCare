-- ============================================================================
-- PAWCARE-COMPLIANCE AI: PRODUCTION SQL SCHEMA & COMPREHENSIVE SEED DATA
-- Enterprise Veterinary Compliance Evidence & Risk Control Workspace
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. DROP EXISTING TABLES AND TYPES (Clean Idempotent Setup)
DROP TABLE IF EXISTS model_telemetry CASCADE;
DROP TABLE IF EXISTS system_notifications CASCADE;
DROP TABLE IF EXISTS system_settings CASCADE;
DROP TABLE IF EXISTS decision_audit_logs CASCADE;
DROP TABLE IF EXISTS risk_issues CASCADE;
DROP TABLE IF EXISTS evidence_artifacts CASCADE;
DROP TABLE IF EXISTS clinical_encounters CASCADE;
DROP TABLE IF EXISTS compliance_controls CASCADE;
DROP TABLE IF EXISTS compliance_obligations CASCADE;
DROP TABLE IF EXISTS animals CASCADE;
DROP TABLE IF EXISTS pet_owners CASCADE;
DROP TABLE IF EXISTS app_users CASCADE;
DROP TABLE IF EXISTS hospital_tenants CASCADE;

DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS control_status CASCADE;
DROP TYPE IF EXISTS risk_severity CASCADE;
DROP TYPE IF EXISTS evidence_category CASCADE;
DROP TYPE IF EXISTS review_action CASCADE;
DROP TYPE IF EXISTS encounter_type CASCADE;
DROP TYPE IF EXISTS escalation_tier CASCADE;

-- 3. ENUM TYPES
CREATE TYPE user_role AS ENUM (
  'COMPLIANCE_OFFICER', 
  'CONTROL_OWNER', 
  'AUDITOR', 
  'EXECUTIVE_REVIEWER', 
  'CLINICAL_STAFF'
);

CREATE TYPE control_status AS ENUM (
  'COMPLIANT', 
  'NON_COMPLIANT', 
  'PARTIALLY_COMPLIANT', 
  'UNDER_REVIEW', 
  'UNTESTED'
);

CREATE TYPE risk_severity AS ENUM (
  'LOW', 
  'MEDIUM', 
  'HIGH', 
  'CRITICAL'
);

CREATE TYPE evidence_category AS ENUM (
  'SURGICAL_CONSENT', 
  'VACCINATION_CERTIFICATE', 
  'PRESCRIPTION_CONTROLLED_SUBSTANCE', 
  'DIAGNOSTIC_LAB_REPORT', 
  'CONTROLLED_DRUG_LOG', 
  'REFERRAL_SUMMARY', 
  'ITEMIZED_INVOICE'
);

CREATE TYPE review_action AS ENUM (
  'ACCEPT', 
  'REJECT', 
  'OVERRIDE', 
  'DEFER', 
  'ESCALATE'
);

CREATE TYPE encounter_type AS ENUM (
  'SURGICAL_PROCEDURE',
  'CONTROLLED_DRUG_DISPENSE',
  'RABIES_IMMUNIZATION',
  'EMERGENCY_INTAKE',
  'DIAGNOSTIC_PANEL',
  'VCPR_EXAMINATION',
  'INVOICE_BILLING_AUDIT'
);

CREATE TYPE escalation_tier AS ENUM (
  'TIER_1_TECH',
  'TIER_2_DVM',
  'TIER_3_OFFICER',
  'TIER_4_EXECUTIVE'
);

-- 4. TABLE DEFINITIONS

-- 4.1. HOSPITAL TENANTS (Facility Profile & Licensure)
CREATE TABLE hospital_tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    license_number VARCHAR(100) NOT NULL UNIQUE,
    dea_registration_number VARCHAR(100) NOT NULL DEFAULT 'BV-8910482',
    state_board_license VARCHAR(100) NOT NULL DEFAULT 'TX-VET-2024-9981',
    accreditation VARCHAR(255) NOT NULL DEFAULT 'AAHA Accredited Hospital #8849-TX',
    address TEXT NOT NULL,
    phone VARCHAR(50) NOT NULL DEFAULT '(512) 555-0192',
    email VARCHAR(255) NOT NULL DEFAULT 'compliance@apexvetcare.org',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.2. USERS & RBAC ROLES
CREATE TABLE app_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES hospital_tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    title VARCHAR(150) NOT NULL DEFAULT 'Veterinary Professional',
    role user_role NOT NULL DEFAULT 'CLINICAL_STAFF',
    license_number VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.3. PET OWNERS (Clinical Context)
CREATE TABLE pet_owners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES hospital_tenants(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.4. ANIMAL PATIENTS
CREATE TABLE animals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES hospital_tenants(id) ON DELETE CASCADE,
    owner_id UUID REFERENCES pet_owners(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    species VARCHAR(50) NOT NULL,
    breed VARCHAR(100),
    dob DATE,
    weight_kg NUMERIC(5,2),
    microchip_id VARCHAR(100) UNIQUE,
    medical_record_number VARCHAR(50) UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.5. COMPLIANCE OBLIGATIONS (Regulatory Frameworks)
CREATE TABLE compliance_obligations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    regulatory_body VARCHAR(100) NOT NULL, -- DEA, AAHA, State Board, OSHA, EPA, AVMA
    code VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category evidence_category NOT NULL,
    penalty_guidance TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.6. COMPLIANCE CONTROLS (Hospital Policies Mapped to Obligations)
CREATE TABLE compliance_controls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES hospital_tenants(id) ON DELETE CASCADE,
    obligation_id UUID REFERENCES compliance_obligations(id) ON DELETE CASCADE,
    control_code VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    owner_id UUID REFERENCES app_users(id) ON DELETE SET NULL,
    status control_status DEFAULT 'UNTESTED',
    risk_rating risk_severity DEFAULT 'MEDIUM',
    testing_frequency VARCHAR(50) DEFAULT 'DAILY_CONTINUOUS',
    last_tested_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.7. CLINICAL OPERATIONAL ENCOUNTERS (Clinical Operational Engine)
CREATE TABLE clinical_encounters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES hospital_tenants(id) ON DELETE CASCADE,
    animal_id UUID REFERENCES animals(id) ON DELETE SET NULL,
    owner_id UUID REFERENCES pet_owners(id) ON DELETE SET NULL,
    veterinarian_id UUID REFERENCES app_users(id) ON DELETE SET NULL,
    control_id UUID REFERENCES compliance_controls(id) ON DELETE SET NULL,
    encounter_type encounter_type NOT NULL,
    procedure_name VARCHAR(255) NOT NULL,
    date_of_service DATE NOT NULL DEFAULT CURRENT_DATE,
    drug_name VARCHAR(150),
    drug_schedule VARCHAR(20), -- Schedule II, III, IV
    initial_safe_balance NUMERIC(8,2),
    dispensed_volume NUMERIC(8,2),
    waste_volume NUMERIC(8,2),
    final_safe_balance NUMERIC(8,2),
    witness_signature_present BOOLEAN DEFAULT FALSE,
    owner_consent_verified BOOLEAN DEFAULT FALSE,
    vcpr_active_verified BOOLEAN DEFAULT FALSE,
    is_compliant BOOLEAN DEFAULT TRUE,
    clinical_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.8. EVIDENCE ARTIFACTS (Automated Evidence Ingestion & Classification)
CREATE TABLE evidence_artifacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES hospital_tenants(id) ON DELETE CASCADE,
    animal_id UUID REFERENCES animals(id) ON DELETE SET NULL,
    control_id UUID REFERENCES compliance_controls(id) ON DELETE SET NULL,
    encounter_id UUID REFERENCES clinical_encounters(id) ON DELETE SET NULL,
    uploaded_by UUID REFERENCES app_users(id) ON DELETE SET NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_sha256 VARCHAR(64) NOT NULL,
    category evidence_category NOT NULL,
    extracted_text TEXT,
    ai_confidence NUMERIC(4,3),
    ai_grounding_explanation TEXT,
    ai_model_version VARCHAR(50) DEFAULT 'gemini-2.5-pro',
    identified_gaps JSONB DEFAULT '[]',
    extracted_metadata JSONB DEFAULT '{}',
    is_reviewed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.9. IMMUTABLE DECISION LINEAGE & REVIEW HISTORY
CREATE TABLE decision_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES hospital_tenants(id) ON DELETE CASCADE,
    evidence_id UUID REFERENCES evidence_artifacts(id) ON DELETE SET NULL,
    control_id UUID REFERENCES compliance_controls(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES app_users(id) NOT NULL,
    actor_name VARCHAR(255) NOT NULL,
    actor_role user_role NOT NULL,
    action review_action NOT NULL,
    previous_status control_status,
    new_status control_status NOT NULL,
    reason TEXT NOT NULL,
    evidence_sha256_snapshot VARCHAR(64),
    ai_suggestion_snapshot JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.10. RISK & ISSUES REGISTER (Control Gap & Risk Prioritization Engine)
CREATE TABLE risk_issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES hospital_tenants(id) ON DELETE CASCADE,
    control_id UUID REFERENCES compliance_controls(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    severity risk_severity NOT NULL,
    due_date DATE NOT NULL,
    assigned_to UUID REFERENCES app_users(id) ON DELETE SET NULL,
    assigned_to_name VARCHAR(255),
    root_cause TEXT,
    remediation_plan TEXT,
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.11. REAL-TIME ALERTING & ESCALATIONS (Module 8)
CREATE TABLE system_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES hospital_tenants(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    severity risk_severity NOT NULL DEFAULT 'MEDIUM',
    category VARCHAR(100) NOT NULL, -- AI_INGESTION, DEA_DISCREPANCY, VCPR_EXPIRY, CONTROL_TEST_OVERDUE
    escalation_tier escalation_tier NOT NULL DEFAULT 'TIER_1_TECH',
    action_url VARCHAR(255),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.12. AI OBSERVABILITY & MODEL TELEMETRY (Module 9)
CREATE TABLE model_telemetry (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES hospital_tenants(id) ON DELETE CASCADE,
    model_name VARCHAR(100) NOT NULL DEFAULT 'gemini-2.5-pro',
    document_category evidence_category NOT NULL,
    latency_ms INTEGER NOT NULL,
    confidence_score NUMERIC(4,3) NOT NULL,
    token_count INTEGER NOT NULL DEFAULT 420,
    was_overridden BOOLEAN DEFAULT FALSE,
    override_reason TEXT,
    drift_score NUMERIC(4,3) DEFAULT 0.04,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.13. SYSTEM SETTINGS & PARAMETERS
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES hospital_tenants(id) ON DELETE CASCADE UNIQUE,
    confidence_threshold_high NUMERIC(4,3) DEFAULT 0.85,
    confidence_threshold_low NUMERIC(4,3) DEFAULT 0.60,
    auto_escalation_enabled BOOLEAN DEFAULT TRUE,
    retention_surgical_consent_months INTEGER DEFAULT 84,
    retention_controlled_logs_months INTEGER DEFAULT 60,
    retention_medical_records_months INTEGER DEFAULT 84,
    enforce_mandatory_rationale BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. INDEXES FOR PERFORMANCE
CREATE INDEX idx_users_tenant ON app_users(tenant_id);
CREATE INDEX idx_animals_owner ON animals(owner_id);
CREATE INDEX idx_encounters_tenant ON clinical_encounters(tenant_id);
CREATE INDEX idx_encounters_animal ON clinical_encounters(animal_id);
CREATE INDEX idx_controls_status ON compliance_controls(status);
CREATE INDEX idx_controls_risk ON compliance_controls(risk_rating);
CREATE INDEX idx_evidence_tenant ON evidence_artifacts(tenant_id);
CREATE INDEX idx_evidence_category ON evidence_artifacts(category);
CREATE INDEX idx_evidence_sha256 ON evidence_artifacts(file_sha256);
CREATE INDEX idx_audit_actor ON decision_audit_logs(actor_id);
CREATE INDEX idx_audit_created ON decision_audit_logs(created_at);
CREATE INDEX idx_risks_severity ON risk_issues(severity);
CREATE INDEX idx_notifs_unread ON system_notifications(is_read);
CREATE INDEX idx_telemetry_created ON model_telemetry(created_at);

-- ============================================================================
-- 6. COMPREHENSIVE SEED DATA FOR ALL 9 MODULES
-- ============================================================================

-- 6.1. HOSPITAL TENANT
INSERT INTO hospital_tenants (id, name, license_number, dea_registration_number, state_board_license, accreditation, address, phone, email)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'Apex Veterinary Emergency & Specialty Hospital',
    'VET-LIC-884920-TX',
    'BV-8910482',
    'TX-VET-2024-9981',
    'AAHA Accredited 24/7 Trauma Center #8849-TX',
    '104 Medical Plaza Way, Suite 300, Austin, TX 78701',
    '(512) 555-0192',
    'compliance@apexvetcare.org'
);

-- 6.2. APP USERS (Role-Aware Authentication & RBAC)
INSERT INTO app_users (id, tenant_id, email, password_hash, full_name, title, role, license_number, is_active)
VALUES 
(
    '22222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'officer@vetcare.org',
    '$2a$10$w8T.iU1jO7FjT6oJ1o5N/eLz.G4eYc6z9sH0vE.Q2B0s1F3gH4k6W',
    'Dr. Sarah Jenkins, DVM',
    'Hospital Compliance Officer & Chief of Staff',
    'COMPLIANCE_OFFICER',
    'TX-DVM-49102',
    TRUE
),
(
    '33333333-3333-3333-3333-333333333333',
    '11111111-1111-1111-1111-111111111111',
    'owner@vetcare.org',
    '$2a$10$w8T.iU1jO7FjT6oJ1o5N/eLz.G4eYc6z9sH0vE.Q2B0s1F3gH4k6W',
    'Marcus Vance, LVT',
    'Lead Veterinary Technician & Pharmacy Control Owner',
    'CONTROL_OWNER',
    'TX-LVT-99120',
    TRUE
),
(
    '44444444-4444-4444-4444-444444444444',
    '11111111-1111-1111-1111-111111111111',
    'auditor@vetcare.org',
    '$2a$10$w8T.iU1jO7FjT6oJ1o5N/eLz.G4eYc6z9sH0vE.Q2B0s1F3gH4k6W',
    'Elena Rostova, CPA / CISA',
    'Senior Healthcare Regulatory Compliance Auditor',
    'AUDITOR',
    'CISA-881920',
    TRUE
),
(
    '55555555-5555-5555-5555-555555555555',
    '11111111-1111-1111-1111-111111111111',
    'exec@vetcare.org',
    '$2a$10$w8T.iU1jO7FjT6oJ1o5N/eLz.G4eYc6z9sH0vE.Q2B0s1F3gH4k6W',
    'Dr. Arthur Pendelton, DVM, DACVS',
    'Chief Medical Officer & Executive Reviewer',
    'EXECUTIVE_REVIEWER',
    'TX-DVM-11029',
    TRUE
),
(
    '66666666-6666-6666-6666-666666666666',
    '11111111-1111-1111-1111-111111111111',
    'staff@vetcare.org',
    '$2a$10$w8T.iU1jO7FjT6oJ1o5N/eLz.G4eYc6z9sH0vE.Q2B0s1F3gH4k6W',
    'Rachel Torres, RVT',
    'Registered Veterinary Tech & Clinical Intake Specialist',
    'CLINICAL_STAFF',
    'TX-RVT-38192',
    TRUE
);

-- 6.3. PET OWNERS (Clinical Context)
INSERT INTO pet_owners (id, tenant_id, full_name, phone, email, address)
VALUES
('a1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Jonathan Sterling', '(512) 555-8841', 'j.sterling@example.com', '402 Oak Ridge Dr, Austin TX 78704'),
('a2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Clarissa Montgomery', '(512) 555-1920', 'cmontgomery@example.com', '711 Lakeview Blvd, Austin TX 78701'),
('a3333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'David & Karen Miller', '(512) 555-3391', 'miller.family@example.com', '1205 Barton Springs Rd, Austin TX 78704'),
('a4444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'Samantha Reed', '(512) 555-6629', 's.reed@biotechcorp.com', '3300 Congress Ave, Austin TX 78701'),
('a5555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'Carlos Mendoza', '(512) 555-9014', 'carlos.mendoza@example.net', '8402 Westheimer St, Austin TX 78759');

-- 6.4. ANIMAL PATIENTS
INSERT INTO animals (id, tenant_id, owner_id, name, species, breed, dob, weight_kg, microchip_id, medical_record_number)
VALUES
('b1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'Barnaby', 'Canine', 'Golden Retriever', '2021-04-12', 31.40, '985141002948102', 'MRN-2026-0812'),
('b2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'a2222222-2222-2222-2222-222222222222', 'Cleo', 'Feline', 'Siamese', '2022-09-01', 4.20, '985141009184711', 'MRN-2026-0944'),
('b3333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'a3333333-3333-3333-3333-333333333333', 'Thor', 'Canine', 'German Shepherd', '2019-11-20', 38.50, '985141007721994', 'MRN-2026-1021'),
('b4444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'a4444444-4444-4444-4444-444444444444', 'Luna', 'Canine', 'French Bulldog', '2023-01-15', 12.10, '985141004481023', 'MRN-2026-1189'),
('b5555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'a5555555-5555-5555-5555-555555555555', 'Oliver', 'Feline', 'Maine Coon', '2020-07-08', 8.60, '985141003319028', 'MRN-2026-1290'),
('b6666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'Bella', 'Canine', 'Border Collie', '2022-03-30', 18.20, '985141006612984', 'MRN-2026-1402');

-- 6.5. COMPLIANCE OBLIGATIONS (Regulatory Frameworks)
INSERT INTO compliance_obligations (id, regulatory_body, code, title, description, category, penalty_guidance)
VALUES
(
    'c1111111-1111-1111-1111-111111111111',
    'DEA Schedule II-V',
    'DEA-21-CFR-1304',
    'Bi-Annual Controlled Substance Inventory & Daily Log Integrity',
    'Mandatory double-entry logging for all Schedule II (Ketamine/Buprenorphine/Fentanyl) and Schedule IV-V dispensing with exact waste volume and witness signature reconciliation.',
    'CONTROLLED_DRUG_LOG',
    'Civil fines up to $15,691 per violation and potential suspension of DEA Registration.'
),
(
    'c2222222-2222-2222-2222-222222222222',
    'AAHA Standard SUR-04',
    'AAHA-SURG-CONSENT',
    'Informed Surgical & Anesthesia Consent Verification',
    'Documented explicit consent signed by verified pet owner outlining surgical risks, anesthesia protocols, and CPR resuscitation authorization.',
    'SURGICAL_CONSENT',
    'Revocation of AAHA Hospital Accreditation and civil malpractice liability.'
),
(
    'c3333333-3333-3333-3333-333333333333',
    'State Board of Pharmacy',
    'TX-PHARM-291-104',
    'VCPR & Controlled Medication Dispensation Rules',
    'Requires active Veterinary-Client-Patient Relationship established via physical exam within 12 months before dispensing Schedule II-V pharmaceuticals.',
    'PRESCRIPTION_CONTROLLED_SUBSTANCE',
    'Veterinary medical board disciplinary action and practitioner license revocation.'
),
(
    'c4444444-4444-4444-4444-444444444444',
    'OSHA & USDA/APHIS',
    'OSHA-29-CFR-1910',
    'Zoonotic Disease Prevention & Rabies Certificate Protocol',
    'Strict maintenance of rabies immunization certificates with lot numbers, expiration dates, and licensed DVM signature verification.',
    'VACCINATION_CERTIFICATE',
    'OSHA workplace safety citations and public health quarantine mandates.'
),
(
    'c5555555-5555-5555-5555-555555555555',
    'AAHA Standard MED-08',
    'AAHA-DIAG-RECORD',
    'Pre-Anesthetic Diagnostic Pathology & Bloodwork Verification',
    'Requires baseline chemistry and CBC panel evaluation within 14 days prior to general anesthesia induction on ASA Class II+ patients.',
    'DIAGNOSTIC_LAB_REPORT',
    'AAHA compliance score deduction and heightened perioperative risk index.'
),
(
    'c6666666-6666-6666-6666-666666666666',
    'AVMA Medical Records',
    'AVMA-MED-REC-01',
    'Specialty Referral & Critical Case Continuity Summary',
    'Standardized referral documentation transfer between primary care and emergency specialty hospital within 24 hours of discharge.',
    'REFERRAL_SUMMARY',
    'Standard of care audit deficiencies and continuity of care failures.'
),
(
    'c7777777-7777-7777-7777-777777777777',
    'State Board Audit Protocol',
    'BILLING-RECON-CFR-88',
    'Itemized Pharmaceutical Billing & Drug Safe Reconciliation',
    'Cross-reconciliation of billed patient drug charges against physical dispensing volume from perpetual safe logs to detect diversion.',
    'ITEMIZED_INVOICE',
    'Insurance fraud allegations, DEA diversion investigation, and state board penalties.'
);

-- 6.6. COMPLIANCE CONTROLS (Control Library & Policy Mapping)
INSERT INTO compliance_controls (id, tenant_id, obligation_id, control_code, title, description, owner_id, status, risk_rating, testing_frequency, last_tested_at)
VALUES
(
    'd1111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'c1111111-1111-1111-1111-111111111111',
    'CTRL-DEA-LOG-01',
    'Controlled Substance Perpetual Safe Log Audit',
    'Daily digital reconciliation of safe balance against physical inventory counts, verifying two staff signatures for any wasted or disposed medication.',
    '33333333-3333-3333-3333-333333333333',
    'PARTIALLY_COMPLIANT',
    'HIGH',
    'DAILY_CONTINUOUS',
    NOW() - INTERVAL '2 hours'
),
(
    'd2222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'c2222222-2222-2222-2222-222222222222',
    'CTRL-AAHA-SURG-02',
    'Pre-Surgical Anesthesia & CPR Consent Enforcer',
    'Ensure 100% of surgical procedures have an owner-signed consent form with explicit CPR directive before sedation induction.',
    '22222222-2222-2222-2222-222222222222',
    'COMPLIANT',
    'CRITICAL',
    'PER_PROCEDURE',
    NOW() - INTERVAL '1 day'
),
(
    'd3333333-3333-3333-3333-333333333333',
    '11111111-1111-1111-1111-111111111111',
    'c3333333-3333-3333-3333-333333333333',
    'CTRL-VCPR-DISP-03',
    'VCPR 12-Month Examination Expiry Verification',
    'Automated cross-check confirming patient has an in-person physical exam on record within 365 days prior to filling controlled oral prescriptions.',
    '33333333-3333-3333-3333-333333333333',
    'UNDER_REVIEW',
    'HIGH',
    'PRE_DISPENSE',
    NOW() - INTERVAL '3 days'
),
(
    'd4444444-4444-4444-4444-444444444444',
    '11111111-1111-1111-1111-111111111111',
    'c4444444-4444-4444-4444-444444444444',
    'CTRL-OSHA-ZOON-04',
    'Rabies Immunization & Microchip Verification',
    'Verification of valid rabies certificate with vaccine serial lot number, DVM license, and microchip confirmation on all admitted patients.',
    '66666666-6666-6666-6666-666666666666',
    'COMPLIANT',
    'MEDIUM',
    'UPON_INTAKE',
    NOW() - INTERVAL '4 hours'
),
(
    'd5555555-5555-5555-5555-555555555555',
    '11111111-1111-1111-1111-111111111111',
    'c5555555-5555-5555-5555-555555555555',
    'CTRL-AAHA-DIAG-05',
    'Pre-Op Diagnostic Chemistry Panel Verification',
    'Mandatory blood chemistry (BUN, CREA, ALT) verification within 14 days of elective surgery for geriatric canine/feline patients.',
    '22222222-2222-2222-2222-222222222222',
    'COMPLIANT',
    'MEDIUM',
    'PRE_ANESTHESIA',
    NOW() - INTERVAL '2 days'
),
(
    'd6666666-6666-6666-6666-666666666666',
    '11111111-1111-1111-1111-111111111111',
    'c6666666-6666-6666-6666-666666666666',
    'CTRL-AVMA-REF-06',
    'Discharge Summary & Referral Record Continuity',
    'Automated transmission of surgical notes and diagnostic discharge reports to referring primary veterinarian within 24 hours of release.',
    '55555555-5555-5555-5555-555555555555',
    'COMPLIANT',
    'LOW',
    'POST_DISCHARGE',
    NOW() - INTERVAL '5 days'
),
(
    'd7777777-7777-7777-7777-777777777777',
    '11111111-1111-1111-1111-111111111111',
    'c7777777-7777-7777-7777-777777777777',
    'CTRL-INVOICE-RECON-07',
    'Itemized Pharmacy Billing & Drug Safe Cross-Reconciliation',
    'Algorithmic reconciliation between billed line items and electronic safe logs to detect discrepancies or unauthorized dispensation.',
    '44444444-4444-4444-4444-444444444444',
    'NON_COMPLIANT',
    'CRITICAL',
    'WEEKLY_AUDIT',
    NOW() - INTERVAL '1 day'
),
(
    'd8888888-8888-8888-8888-888888888888',
    '11111111-1111-1111-1111-111111111111',
    'c1111111-1111-1111-1111-111111111111',
    'CTRL-DEA-WASTE-08',
    'Controlled Drug Waste Witness Co-Signature Verification',
    'Immediate dual-staff witness signature requirement whenever partial vial drug waste occurs during anesthesia protocols.',
    '33333333-3333-3333-3333-333333333333',
    'NON_COMPLIANT',
    'HIGH',
    'PER_INCIDENT',
    NOW() - INTERVAL '6 hours'
);

-- 6.7. CLINICAL OPERATIONAL ENCOUNTERS (Clinical Operational Engine)
INSERT INTO clinical_encounters (
    id, tenant_id, animal_id, owner_id, veterinarian_id, control_id,
    encounter_type, procedure_name, date_of_service, drug_name, drug_schedule,
    initial_safe_balance, dispensed_volume, waste_volume, final_safe_balance,
    witness_signature_present, owner_consent_verified, vcpr_active_verified, is_compliant, clinical_notes
)
VALUES
(
    'e1111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'b1111111-1111-1111-1111-111111111111',
    'a1111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'd2222222-2222-2222-2222-222222222222',
    'SURGICAL_PROCEDURE',
    'TPLO (Tibial Plateau Leveling Osteotomy) Right Stifle',
    CURRENT_DATE - INTERVAL '1 day',
    'Ketamine 100mg/mL + Midazolam 5mg/mL',
    'Schedule III / IV',
    50.00, 1.50, 0.20, 48.30,
    TRUE, TRUE, TRUE, TRUE,
    'Surgical procedure completed uneventfully. Pre-op bloodwork verified, anesthesia monitored continuously. CPR Consent signed.'
),
(
    'e2222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'b3333333-3333-3333-3333-333333333333',
    'a3333333-3333-3333-3333-333333333333',
    '55555555-5555-5555-5555-555555555555',
    'd1111111-1111-1111-1111-111111111111',
    'CONTROLLED_DRUG_DISPENSE',
    'Emergency Trauma Sedation & Wound Debridement',
    CURRENT_DATE - INTERVAL '6 hours',
    'Ketamine HCl 100mg/mL',
    'Schedule III',
    48.30, 0.80, 0.20, 47.30,
    FALSE, TRUE, TRUE, FALSE,
    'DEFICIT FLAGGED: 0.2 mL Ketamine waste recorded without mandatory second witness co-signature in electronic safe log.'
),
(
    'e3333333-3333-3333-3333-333333333333',
    '11111111-1111-1111-1111-111111111111',
    'b4444444-4444-4444-4444-444444444444',
    'a4444444-4444-4444-4444-444444444444',
    '22222222-2222-2222-2222-222222222222',
    'd4444444-4444-4444-4444-444444444444',
    'RABIES_IMMUNIZATION',
    '3-Year Rabies Vaccination & Microchip Registration',
    CURRENT_DATE - INTERVAL '3 days',
    'Defensor 3 Rabies Vaccine',
    'Non-Controlled',
    NULL, NULL, NULL, NULL,
    TRUE, TRUE, TRUE, TRUE,
    'Rabies 3-yr subcutaneous vaccine administered. Serial lot # RV-99214, expiry 05/2028. Certificate generated with licensed DVM signature.'
),
(
    'e4444444-4444-4444-4444-444444444444',
    '11111111-1111-1111-1111-111111111111',
    'b2222222-2222-2222-2222-222222222222',
    'a2222222-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222222',
    'd3333333-3333-3333-3333-333333333333',
    'VCPR_EXAMINATION',
    'Annual Wellness Exam & Chronic Pain Management',
    CURRENT_DATE - INTERVAL '14 days',
    'Buprenorphine 0.3mg/mL Sublingual',
    'Schedule III',
    30.00, 1.00, 0.00, 29.00,
    TRUE, TRUE, TRUE, TRUE,
    'Full physical examination performed. VCPR re-certified through August 2027. Buprenorphine dispensed with explicit owner administration instructions.'
),
(
    'e5555555-5555-5555-5555-555555555555',
    '11111111-1111-1111-1111-111111111111',
    'b5555555-5555-5555-5555-555555555555',
    'a5555555-5555-5555-5555-555555555555',
    '55555555-5555-5555-5555-555555555555',
    'd7777777-7777-7777-7777-777777777777',
    'INVOICE_BILLING_AUDIT',
    'Specialty Oncology Consultation & Chemotherapy Billing Audit',
    CURRENT_DATE - INTERVAL '2 days',
    'Midazolam 5mg/mL',
    'Schedule IV',
    20.00, 1.20, 0.00, 18.80,
    TRUE, TRUE, TRUE, FALSE,
    'DISCREPANCY DETECTED: Itemized invoice billed 1.5 mL Midazolam to client, whereas drug safe ledger indicates only 1.2 mL dispensed.'
);

-- 6.8. EVIDENCE ARTIFACTS (Automated Evidence Ingestion & Classification)
INSERT INTO evidence_artifacts (
    id, tenant_id, animal_id, control_id, encounter_id, uploaded_by,
    file_name, file_url, file_sha256, category, extracted_text,
    ai_confidence, ai_grounding_explanation, ai_model_version,
    identified_gaps, extracted_metadata, is_reviewed, created_at
)
VALUES
(
    'f1111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'b1111111-1111-1111-1111-111111111111',
    'd2222222-2222-2222-2222-222222222222',
    'e1111111-1111-1111-1111-111111111111',
    '66666666-6666-6666-6666-666666666666',
    'Barnaby_TPLO_Surgical_Consent_Signed.pdf',
    '/uploads/Barnaby_TPLO_Surgical_Consent_Signed.pdf',
    '4a5e9b38f821d7b1a03f443b24f57c3d2e9b8a1c6e4d2f0a8b9c7d6e5f4a3b2c',
    'SURGICAL_CONSENT',
    'APEX VETERINARY EMERGENCY HOSPITAL - SURGICAL CONSENT FORM. Patient: Barnaby (Golden Retriever, Microchip: 985141002948102). Owner: Jonathan Sterling. Procedure: Right Stifle TPLO & Arthroscopy. Attending Surgeon: Dr. Sarah Jenkins, DVM (Lic: TX-DVM-49102). Risks of general anesthesia acknowledged. CPR Authorization: YES (Full Code Approved). Owner Signature: Jonathan Sterling (Digitally Signed 2026-08-14 07:45 AM).',
    0.985,
    'Gemini 2.5 verified explicit patient identification, attending DVM license #TX-DVM-49102, full CPR resuscitation consent checkbox, and verified pet owner digital signature.',
    'gemini-2.5-pro',
    '[]',
    '{"patient_name":"Barnaby","owner_name":"Jonathan Sterling","veterinarian_name":"Dr. Sarah Jenkins, DVM","license_number":"TX-DVM-49102","cpr_authorized":true,"procedure":"TPLO Right Stifle"}',
    TRUE,
    NOW() - INTERVAL '1 day'
),
(
    'f2222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'b3333333-3333-3333-3333-333333333333',
    'd1111111-1111-1111-1111-111111111111',
    'e2222222-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333333',
    'DEA_Safe_Log_Ketamine_Dispense_20260815.pdf',
    '/uploads/DEA_Safe_Log_Ketamine_Dispense_20260815.pdf',
    '8f2c7a1e5b9d3f4a6c8e0b2d4f6a8c0e2b4d6f8a0c2e4b6d8f0a2c4e6b8d0f2a',
    'CONTROLLED_DRUG_LOG',
    'ELECTRONIC CONTROLLED SUBSTANCE SAFE LOG - APEX VET. Date: 2026-08-15 14:10. Substance: Ketamine HCl (50mL vial, Lot #KT-8841). Initial Safe Volume: 48.30 mL. Patient: Thor (MRN-2026-1021). Dose Administered: 0.80 mL. Discarded Waste: 0.20 mL. Remaining Safe Volume: 47.30 mL. Dispensed By: Marcus Vance, LVT. Witness Signature: [BLANK - MISSING CO-SIGNATURE].',
    0.580,
    'Gemini 2.5 flagged compliance gap: Document text indicates 0.20 mL waste volume disposed but lacks required second witness signature under DEA 21 CFR §1304.04.',
    'gemini-2.5-pro',
    '["Missing mandatory dual-staff witness signature for 0.20 mL Ketamine waste disposal","DEA 21 CFR §1304 audit risk"]',
    '{"substance":"Ketamine HCl","initial_volume":"48.30 mL","dispensed":"0.80 mL","waste":"0.20 mL","witness_present":false,"dispenser":"Marcus Vance, LVT"}',
    TRUE,
    NOW() - INTERVAL '6 hours'
),
(
    'f3333333-3333-3333-3333-333333333333',
    '11111111-1111-1111-1111-111111111111',
    'b4444444-4444-4444-4444-444444444444',
    'd4444444-4444-4444-4444-444444444444',
    'e3333333-3333-3333-3333-333333333333',
    '66666666-6666-6666-6666-666666666666',
    'Luna_Rabies_Certificate_LotRV99214.pdf',
    '/uploads/Luna_Rabies_Certificate_LotRV99214.pdf',
    '3d9c1e7a5f0b8d2c4e6a8f0b2d4e6f8a0b2c4e6f8a0b2d4c6e8f0a2b4c6e8f0a',
    'VACCINATION_CERTIFICATE',
    'OFFICIAL TEXAS RABIES VACCINATION CERTIFICATE #TX-2026-90412. Animal: Luna (French Bulldog, Female Spayed, 12.1 kg). Microchip ID: 985141004481023. Owner: Samantha Reed. Vaccine: Defensor 3 (Killed Virus, Lot: RV-99214, Producer: Zoetis). Vaccination Date: 2026-08-14. Valid Until: 2028-08-14. Administering Veterinarian: Dr. Sarah Jenkins, DVM (Lic: TX-DVM-49102). Signature: S. Jenkins DVM.',
    0.960,
    'Gemini 2.5 confirmed complete rabies certificate metadata including USDA lot #RV-99214, 3-year duration validity, microchip correlation, and administering DVM license.',
    'gemini-2.5-pro',
    '[]',
    '{"vaccine_name":"Defensor 3","lot_number":"RV-99214","duration_years":3,"expiration_date":"2028-08-14","patient_microchip":"985141004481023"}',
    TRUE,
    NOW() - INTERVAL '3 days'
),
(
    'f4444444-4444-4444-4444-444444444444',
    '11111111-1111-1111-1111-111111111111',
    'b5555555-5555-5555-5555-555555555555',
    'd7777777-7777-7777-7777-777777777777',
    'e5555555-5555-5555-5555-555555555555',
    '44444444-4444-4444-4444-444444444444',
    'Invoice_Billing_Audit_Discrepancy_INV4920.pdf',
    '/uploads/Invoice_Billing_Audit_Discrepancy_INV4920.pdf',
    '7b4f2c9e1a8d0f3c5e7b9a1d3f5a7c9e1b3d5f7a9c1e3b5d7f9a1c3e5b7d9f1a',
    'ITEMIZED_INVOICE',
    'ITEMIZED PATIENT INVOICE #INV-4920. Patient: Oliver (Maine Coon). Date: 2026-08-13. Line Items: 1. Oncology Exam ($145.00) 2. CBC & Superchem ($185.00) 3. Midazolam 5mg/mL Injectable - Qty: 1.50 mL ($42.50) 4. Chemotherapy Administration ($220.00). Total Billed: $592.50.',
    0.720,
    'Gemini 2.5 cross-referenced invoice line item for Midazolam (1.50 mL billed) against electronic safe log #SL-8812 (1.20 mL dispensed). Flagged a 0.30 mL billing variance.',
    'gemini-2.5-pro',
    '["Discrepancy between billed 1.50 mL Midazolam and safe log record of 1.20 mL"]',
    '{"invoice_number":"INV-4920","billed_substance":"Midazolam 5mg/mL","billed_qty":"1.50 mL","safe_recorded_qty":"1.20 mL","variance":"0.30 mL"}',
    FALSE,
    NOW() - INTERVAL '2 days'
);

-- 6.9. DECISION AUDIT LOGS (Immutable Decision Lineage & Review History)
INSERT INTO decision_audit_logs (
    id, tenant_id, evidence_id, control_id, actor_id, actor_name, actor_role,
    action, previous_status, new_status, reason, evidence_sha256_snapshot,
    ai_suggestion_snapshot, created_at
)
VALUES
(
    '1a111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'f1111111-1111-1111-1111-111111111111',
    'd2222222-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222222',
    'Dr. Sarah Jenkins, DVM',
    'COMPLIANCE_OFFICER',
    'ACCEPT',
    'UNDER_REVIEW',
    'COMPLIANT',
    'Verified surgical consent form: owner signature is authenticated, CPR directive is clearly selected as Full Code, and DVM license TX-DVM-49102 is documented.',
    '4a5e9b38f821d7b1a03f443b24f57c3d2e9b8a1c6e4d2f0a8b9c7d6e5f4a3b2c',
    '{"confidence":0.985,"category":"SURGICAL_CONSENT","gaps":[]}',
    NOW() - INTERVAL '1 day'
),
(
    '2b222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'f2222222-2222-2222-2222-222222222222',
    'd1111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'Dr. Sarah Jenkins, DVM',
    'COMPLIANCE_OFFICER',
    'OVERRIDE',
    'UNTESTED',
    'PARTIALLY_COMPLIANT',
    'OVERRIDE JUSTIFICATION: AI flagged missing witness signature for 0.20 mL Ketamine waste. Physical waste was incinerated with biohazard disposal witness Dr. Pendelton present verbally, but co-signature was not logged digitally before safe closure. Downgraded control to PARTIALLY_COMPLIANT and created remediation ticket.',
    '8f2c7a1e5b9d3f4a6c8e0b2d4f6a8c0e2b4d6f8a0c2e4b6d8f0a2c4e6b8d0f2a',
    '{"confidence":0.580,"category":"CONTROLLED_DRUG_LOG","gaps":["Missing dual-staff witness signature"]}',
    NOW() - INTERVAL '5 hours'
),
(
    '3c333333-3333-3333-3333-333333333333',
    '11111111-1111-1111-1111-111111111111',
    'f3333333-3333-3333-3333-333333333333',
    'd4444444-4444-4444-4444-444444444444',
    '44444444-4444-4444-4444-444444444444',
    'Elena Rostova, CPA / CISA',
    'AUDITOR',
    'ACCEPT',
    'UNTESTED',
    'COMPLIANT',
    'Auditor inspection confirmed rabies certificate conforms with Texas Health and Safety Code Chapter 826 and USDA-APHIS serial lot #RV-99214 standards.',
    '3d9c1e7a5f0b8d2c4e6a8f0b2d4e6f8a0b2c4e6f8a0b2d4c6e8f0a2b4c6e8f0a',
    '{"confidence":0.960,"category":"VACCINATION_CERTIFICATE","gaps":[]}',
    NOW() - INTERVAL '2 days'
);

-- 6.10. RISK & ISSUES REGISTER (Control Gap & Risk Prioritization Engine)
INSERT INTO risk_issues (
    id, tenant_id, control_id, title, description, severity, due_date,
    assigned_to, assigned_to_name, root_cause, remediation_plan, is_resolved, created_at
)
VALUES
(
    '4d111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'd8888888-8888-8888-8888-888888888888',
    'Missing Witness Co-Signature on Ketamine Anesthesia Waste Log',
    '0.20 mL Ketamine drug waste disposed during emergency trauma procedure on Thor without mandatory dual-staff digital co-signature in Pyxis/Cubex safe ledger.',
    'HIGH',
    CURRENT_DATE + INTERVAL '5 days',
    '33333333-3333-3333-3333-333333333333',
    'Marcus Vance, LVT',
    'High patient volume during night trauma intake caused technician to bypass electronic witness co-signature prompt.',
    'Require mandatory electronic biometric witness prompt on safe terminal before dispensing lock re-engages.',
    FALSE,
    NOW() - INTERVAL '5 hours'
),
(
    '4d222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'd7777777-7777-7777-7777-777777777777',
    'Billing Ledger Variance vs Drug Safe Dispensing Log (Midazolam)',
    'Invoice INV-4920 billed 1.50 mL of Midazolam injectable to patient account, but electronic drug safe indicates only 1.20 mL dispensed (0.30 mL overbilling / inventory mismatch).',
    'CRITICAL',
    CURRENT_DATE + INTERVAL '3 days',
    '44444444-4444-4444-4444-444444444444',
    'Elena Rostova, CPA / CISA',
    'Manual entry error in billing software dropdown by administrative billing clerk.',
    'Reconcile patient account statement, credit owner difference, and implement automated API sync between pharmacy safe and billing system.',
    FALSE,
    NOW() - INTERVAL '1 day'
),
(
    '4d333333-3333-3333-3333-333333333333',
    '11111111-1111-1111-1111-111111111111',
    'd3333333-3333-3333-3333-333333333333',
    'Stale VCPR Physical Examination Status (> 340 Days)',
    '4 chronic therapy canine patients have physical exam dates approaching 365-day threshold under State Board rule 22 TAC §573.20.',
    'MEDIUM',
    CURRENT_DATE + INTERVAL '12 days',
    '22222222-2222-2222-2222-222222222222',
    'Dr. Sarah Jenkins, DVM',
    'Patient owner cancellation of previous wellness check without automatic rescheduling trigger.',
    'Automated SMS/Email notification dispatched to owners for mandatory in-person wellness examination booking.',
    FALSE,
    NOW() - INTERVAL '2 days'
);

-- 6.11. SYSTEM NOTIFICATIONS & ESCALATIONS (Module 8)
INSERT INTO system_notifications (
    id, tenant_id, title, message, severity, category, escalation_tier, action_url, is_read, created_at
)
VALUES
(
    '5e111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'CRITICAL: Pharmacy Safe vs Invoice Discrepancy Flagged',
    'Invoice #INV-4920 contains a 0.30 mL Midazolam billing variance against electronic safe log #SL-8812. Escalated to Tier 3 Compliance Officer.',
    'CRITICAL',
    'DEA_DISCREPANCY',
    'TIER_3_OFFICER',
    '/risks-issues',
    FALSE,
    NOW() - INTERVAL '1 day'
),
(
    '5e222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'AI Extraction Low Confidence Flag (< 0.60)',
    'Document DEA_Safe_Log_Ketamine_Dispense_20260815.pdf scored 0.58 confidence due to missing witness waste co-signature. Human sign-off required.',
    'HIGH',
    'AI_INGESTION',
    'TIER_2_DVM',
    '/evidence-mapping',
    FALSE,
    NOW() - INTERVAL '5 hours'
),
(
    '5e333333-3333-3333-3333-333333333333',
    '11111111-1111-1111-1111-111111111111',
    'Upcoming Bi-Annual AAHA Accreditation Audit',
    'AAHA Standard SUR-04 & ANE-02 evaluation scheduled in 14 days. 2 controls currently in PARTIALLY_COMPLIANT status.',
    'MEDIUM',
    'CONTROL_TEST_OVERDUE',
    'TIER_1_TECH',
    '/controls',
    FALSE,
    NOW() - INTERVAL '2 days'
);

-- 6.12. AI OBSERVABILITY & MODEL TELEMETRY (Module 9)
INSERT INTO model_telemetry (
    id, tenant_id, model_name, document_category, latency_ms, confidence_score, token_count, was_overridden, override_reason, drift_score, created_at
)
VALUES
('6f111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'gemini-2.5-pro', 'SURGICAL_CONSENT', 310, 0.985, 412, FALSE, NULL, 0.03, NOW() - INTERVAL '1 day'),
('6f222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'gemini-2.5-pro', 'CONTROLLED_DRUG_LOG', 285, 0.580, 480, TRUE, 'Missing witness co-signature flagged by AI validated by Officer', 0.04, NOW() - INTERVAL '5 hours'),
('6f333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'gemini-2.5-pro', 'VACCINATION_CERTIFICATE', 260, 0.960, 395, FALSE, NULL, 0.02, NOW() - INTERVAL '3 days'),
('6f444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'gemini-2.5-pro', 'ITEMIZED_INVOICE', 340, 0.720, 520, TRUE, 'Discrepancy detection between invoice line items and safe log', 0.05, NOW() - INTERVAL '2 days'),
('6f555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'gemini-2.5-pro', 'DIAGNOSTIC_LAB_REPORT', 290, 0.940, 460, FALSE, NULL, 0.03, NOW() - INTERVAL '4 days');

-- 6.13. SYSTEM SETTINGS
INSERT INTO system_settings (
    id, tenant_id, confidence_threshold_high, confidence_threshold_low, auto_escalation_enabled,
    retention_surgical_consent_months, retention_controlled_logs_months, retention_medical_records_months, enforce_mandatory_rationale
)
VALUES (
    '0a111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    0.850,
    0.600,
    TRUE,
    84,
    60,
    84,
    TRUE
);
