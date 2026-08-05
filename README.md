# Veterinary Care Compliance Evidence & Risk Control Workspace

Enterprise-grade, multi-tenant **Veterinary Care Compliance Evidence & Risk Control Workspace** that transforms manual, error-prone compliance management into an automated, auditable, and AI-assisted operational engine.

The platform bridges daily clinical workflows (appointments, registrations, examinations, diagnostics, prescriptions, surgical consent, and controlled substance logging) with strict veterinary regulatory compliance frameworks (**AAHA, AVMA, DEA Schedule II-V, State Pharmacy Boards, OSHA, and HIPAA/VCPR standards**).

The AI engine acts strictly as a **Human-in-the-Loop Decision Support System**. AI recommendations NEVER automatically mark a control as compliant without explicit, authenticated human reviewer sign-off.

---

## Technical Stack & Architecture

- **Frontend**: React 18, Vite, React Router v6, Tailwind CSS, Lucide React, Recharts, Axios.
- **Backend**: Node.js (v20+), Express.js, TypeScript (ESM), Multer (file parsing), pdf-parse, PDFKit.
- **AI Integration**: `@google/genai` SDK executing server-side calls to `gemini-2.5-pro` and `gemini-2.5-flash` with Structured Outputs (`responseSchema`).
- **Validation**: Shared Zod schemas for API payload enforcement and human review override rationale.
- **Database & Security**: Supabase PostgreSQL schema with Row Level Security (RLS), multi-tenant isolation policies, and stateful repository fallback.
- **Cryptographic Evidence Lineage**: Immutable SHA-256 digests computed upon upload and sealed into exportable JSON / PDF audit packages.

---

## 12 Mandatory Application Routes

1. `/login` — Secure Login & Auth Flow with 1-click evaluation role switcher.
2. `/dashboard` — Executive & Operational Compliance Dashboard.
3. `/controls` — Control Library, Policy Mapping & Evidence Workspace.
4. `/risks-issues` — Risk Register, Issue & Remediation Tracking.
5. `/decision-history` — Immutable Decision & Override Audit History.
6. `/evidence-mapping` — AI Evidence Classification & Ingestion Engine.
7. `/control-gaps` — Control Gap Analysis & AI Risk Prioritization.
8. `/audit-packs` — Audit Pack Compilation, Lineage & Export Center.
9. `/reports-analytics` — Advanced Analytics & Model Performance Monitoring.
10. `/notifications` — Notification Center & Alert Preference Matrix.
11. `/users-roles` — User Management, Scope Provisioning & Permission Matrix.
12. `/audit-logs-settings` — System Audit Trail, Master Data & AI Threshold Settings.

---

## Running the Application Locally

### 1. Database Setup (Supabase / PostgreSQL)
Execute the production SQL script located at `db/schema.sql` inside your Supabase SQL Editor or local PostgreSQL database.

### 2. Backend Startup
```bash
cd backend
npm install
npm run dev
# Server will start on http://localhost:5000
```

### 3. Frontend Startup
```bash
cd frontend
npm install
npm run dev
# Vite dev server will launch on http://localhost:5173
```

---

## Verification & Build Commands
- **Backend Build**: `npm run build` (inside `/backend`)
- **Frontend Build**: `npm run build` (inside `/frontend`)
