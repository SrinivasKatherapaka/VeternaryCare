-- ============================================================================
-- VETERINARY CARE COMPLIANCE WORKSPACE - SUPABASE CLOUD MIGRATION
-- Migration: 001_initial_schema.sql
-- ============================================================================

-- 1. ENABLE EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. DROP EXISTING TABLES AND TYPES FOR CLEAN IDEMPOTENT RUNS
DROP TABLE IF EXISTS decision_audit_logs CASCADE;
DROP TABLE IF EXISTS evidence_artifacts CASCADE;
DROP TABLE IF EXISTS risk_issues CASCADE;
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

-- 3. ENUMS DEFINITIONS
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

-- 4. TABLES DEFINITIONS

-- 4.1. HOSPITALS / TENANTS
CREATE TABLE hospital_tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    license_number VARCHAR(100) NOT NULL UNIQUE,
    address TEXT NOT NULL,
    phone VARCHAR(50) NOT NULL DEFAULT '(555) 019-2831',
    email VARCHAR(255) NOT NULL DEFAULT 'compliance@vetcare.org',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.2. USERS & ROLES
CREATE TABLE app_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES hospital_tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'CLINICAL_STAFF',
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.3. ANIMALS & PET OWNERS
CREATE TABLE pet_owners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES hospital_tenants(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

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
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.4. OBLIGATIONS & CONTROLS
CREATE TABLE compliance_obligations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    regulatory_body VARCHAR(100) NOT NULL, -- e.g., DEA, AAHA, State Board, OSHA
    code VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category evidence_category NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE compliance_controls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES hospital_tenants(id) ON DELETE CASCADE,
    obligation_id UUID REFERENCES compliance_obligations(id) ON DELETE CASCADE,
    control_code VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    owner_id UUID REFERENCES app_users(id) ON DELETE SET NULL,
    status control_status DEFAULT 'UNTESTED',
    risk_rating risk_severity DEFAULT 'MEDIUM',
    last_tested_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.5. EVIDENCE ARTIFACTS
CREATE TABLE evidence_artifacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES hospital_tenants(id) ON DELETE CASCADE,
    animal_id UUID REFERENCES animals(id) ON DELETE SET NULL,
    control_id UUID REFERENCES compliance_controls(id) ON DELETE SET NULL,
    uploaded_by UUID REFERENCES app_users(id) ON DELETE SET NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_sha256 VARCHAR(64) NOT NULL,
    category evidence_category NOT NULL,
    extracted_text TEXT,
    ai_confidence NUMERIC(4,3),
    ai_grounding_explanation TEXT,
    ai_model_version VARCHAR(50),
    is_reviewed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.6. DECISION & OVERRIDE HISTORY (Immutable Audit)
CREATE TABLE decision_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES hospital_tenants(id) ON DELETE CASCADE,
    evidence_id UUID REFERENCES evidence_artifacts(id) ON DELETE SET NULL,
    control_id UUID REFERENCES compliance_controls(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES app_users(id) NOT NULL,
    action review_action NOT NULL,
    previous_status control_status,
    new_status control_status NOT NULL,
    reason TEXT NOT NULL,
    ai_suggestion_snapshot JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.7. RISKS & ISSUES REGISTER
CREATE TABLE risk_issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES hospital_tenants(id) ON DELETE CASCADE,
    control_id UUID REFERENCES compliance_controls(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    severity risk_severity NOT NULL,
    due_date DATE NOT NULL,
    assigned_to UUID REFERENCES app_users(id) ON DELETE SET NULL,
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PERFORMANCE INDEXES
CREATE INDEX idx_evidence_tenant ON evidence_artifacts(tenant_id);
CREATE INDEX idx_evidence_category ON evidence_artifacts(category);
CREATE INDEX idx_controls_status ON compliance_controls(status);
CREATE INDEX idx_controls_tenant ON compliance_controls(tenant_id);
CREATE INDEX idx_audit_actor ON decision_audit_logs(actor_id);
CREATE INDEX idx_audit_tenant ON decision_audit_logs(tenant_id);
CREATE INDEX idx_risks_severity ON risk_issues(severity);
CREATE INDEX idx_risks_tenant ON risk_issues(tenant_id);

-- 6. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE hospital_tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE animals ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE decision_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_issues ENABLE ROW LEVEL SECURITY;

-- Tenant Isolation Policies
CREATE POLICY tenant_isolation_hospital_tenants ON hospital_tenants
    FOR ALL USING (id = (SELECT tenant_id FROM app_users WHERE id = auth.uid()));

CREATE POLICY tenant_isolation_app_users ON app_users
    FOR ALL USING (tenant_id = (SELECT tenant_id FROM app_users WHERE id = auth.uid()));

CREATE POLICY tenant_isolation_pet_owners ON pet_owners
    FOR ALL USING (tenant_id = (SELECT tenant_id FROM app_users WHERE id = auth.uid()));

CREATE POLICY tenant_isolation_animals ON animals
    FOR ALL USING (tenant_id = (SELECT tenant_id FROM app_users WHERE id = auth.uid()));

CREATE POLICY tenant_isolation_compliance_controls ON compliance_controls
    FOR ALL USING (tenant_id = (SELECT tenant_id FROM app_users WHERE id = auth.uid()));

CREATE POLICY tenant_isolation_evidence_artifacts ON evidence_artifacts
    FOR ALL USING (tenant_id = (SELECT tenant_id FROM app_users WHERE id = auth.uid()));

CREATE POLICY tenant_isolation_decision_audit_logs ON decision_audit_logs
    FOR ALL USING (tenant_id = (SELECT tenant_id FROM app_users WHERE id = auth.uid()));

CREATE POLICY tenant_isolation_risk_issues ON risk_issues
    FOR ALL USING (tenant_id = (SELECT tenant_id FROM app_users WHERE id = auth.uid()));

-- Auditor Read-Only Access Policy
CREATE POLICY auditor_read_only_decisions ON decision_audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM app_users 
            WHERE id = auth.uid() 
            AND role IN ('AUDITOR', 'COMPLIANCE_OFFICER', 'EXECUTIVE_REVIEWER')
        )
    );

-- 7. SEED DATA POPULATION
INSERT INTO hospital_tenants (id, name, license_number, address)
VALUES 
('11111111-1111-1111-1111-111111111111', 'Apex Veterinary Emergency & Specialty Hospital', 'VET-LIC-884920', '104 Medical Plaza Way, Austin, TX 78701')
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_users (id, tenant_id, email, password_hash, full_name, role)
VALUES 
('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'officer@vetcare.org', '$2a$10$X8...hash', 'Dr. Sarah Jenkins, DVM', 'COMPLIANCE_OFFICER'),
('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'owner@vetcare.org', '$2a$10$X8...hash', 'Marcus Vance', 'CONTROL_OWNER'),
('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'auditor@vetcare.org', '$2a$10$X8...hash', 'Elena Rostova, CPA/CISA', 'AUDITOR'),
('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'exec@vetcare.org', '$2a$10$X8...hash', 'Dr. Arthur Pendelton', 'EXECUTIVE_REVIEWER'),
('66666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111', 'staff@vetcare.org', '$2a$10$X8...hash', 'Rachel Torres, RVT', 'CLINICAL_STAFF')
ON CONFLICT (id) DO NOTHING;

INSERT INTO pet_owners (id, tenant_id, full_name, phone, email, address)
VALUES
('a1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Jonathan Sterling', '(512) 555-8841', 'j.sterling@example.com', '402 Oak Ridge Dr, Austin TX')
ON CONFLICT (id) DO NOTHING;

INSERT INTO animals (id, tenant_id, owner_id, name, species, breed, dob, weight_kg, microchip_id)
VALUES
('b2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'Barnaby', 'Canine', 'Golden Retriever', '2021-04-12', 31.40, '985141002948102')
ON CONFLICT (id) DO NOTHING;

INSERT INTO compliance_obligations (id, regulatory_body, code, title, description, category)
VALUES
('c3333333-3333-3333-3333-333333333333', 'DEA Schedule II-V', 'DEA-21-CFR-1304', 'Bi-Annual Controlled Substance Inventory & Daily Log Integrity', 'Mandatory double-entry logging for all Schedule II drugs.', 'CONTROLLED_DRUG_LOG'),
('c4444444-4444-4444-4444-444444444444', 'AAHA Standard SUR-04', 'AAHA-SURG-CONSENT', 'Informed Surgical & Anesthesia Consent Verification', 'Documented explicit consent signed by verified pet owner.', 'SURGICAL_CONSENT')
ON CONFLICT (id) DO NOTHING;

INSERT INTO compliance_controls (id, tenant_id, obligation_id, control_code, title, description, owner_id, status, risk_rating, last_tested_at)
VALUES
('d5555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'c3333333-3333-3333-3333-333333333333', 'CTRL-DEA-LOG-01', 'Controlled Substance Perpetual Log Audit', 'Daily reconciliation of safe balance against physical inventory counts.', '33333333-3333-3333-3333-333333333333', 'PARTIALLY_COMPLIANT', 'HIGH', NOW()),
('d6666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111', 'c4444444-4444-4444-4444-444444444444', 'CTRL-AAHA-SURG-02', 'Pre-Surgical Anesthesia & CPR Consent Enforcer', 'Ensure 100% of surgical procedures have signed consent form.', '22222222-2222-2222-2222-222222222222', 'COMPLIANT', 'CRITICAL', NOW())
ON CONFLICT (id) DO NOTHING;
