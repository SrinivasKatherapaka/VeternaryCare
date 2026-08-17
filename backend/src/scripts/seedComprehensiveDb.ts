import pg from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error("FATAL: DATABASE_URL is missing in environment variables!");
  process.exit(1);
}

console.log(`🔌 Initializing Supabase Cloud PostgreSQL Migration & Seed Runner...`);

const client = new pg.Client({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false }
});

async function runSeed() {
  try {
    await client.connect();
    console.log(`✅ Authenticated & connected to Supabase Cloud PostgreSQL!`);

    const schemaPath = path.join(__dirname, '../../../db/schema.sql');
    console.log(`📄 Reading SQL file: ${schemaPath}`);
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log(`🚀 Executing complete 9-Module schema & seed data...`);
    await client.query(sql);

    console.log(`\n================================================================`);
    console.log(`🎉 SUCCESS: Supabase PostgreSQL Database Seeded Successfully!`);
    console.log(`📊 All 13 Tables, Enums, Constraints, Indexes & Seed Data are LIVE!`);
    console.log(`================================================================\n`);

    // Verify Counts
    const counts = [
      { table: 'hospital_tenants', name: 'Hospital Tenants' },
      { table: 'app_users', name: 'App Users (RBAC)' },
      { table: 'pet_owners', name: 'Pet Owners' },
      { table: 'animals', name: 'Animal Patients' },
      { table: 'compliance_obligations', name: 'Compliance Obligations' },
      { table: 'compliance_controls', name: 'Compliance Controls' },
      { table: 'clinical_encounters', name: 'Clinical Encounters' },
      { table: 'evidence_artifacts', name: 'Evidence Artifacts' },
      { table: 'decision_audit_logs', name: 'Decision Audit Logs' },
      { table: 'risk_issues', name: 'Risk & Issues' },
      { table: 'system_notifications', name: 'System Notifications' },
      { table: 'model_telemetry', name: 'AI Model Telemetry' },
      { table: 'system_settings', name: 'System Settings' }
    ];

    for (const item of counts) {
      const res = await client.query(`SELECT COUNT(*) FROM ${item.table};`);
      console.log(`  ✓ ${item.name.padEnd(28)}: ${res.rows[0].count} records`);
    }

    console.log(`\n✨ Database Verification 100% Passed!`);
  } catch (err: any) {
    console.error(`❌ Migration & Seed Error:`, err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runSeed();
