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
  console.error("FATAL: DATABASE_URL environment variable is missing in backend/.env!");
  process.exit(1);
}

console.log(`🔌 Initializing Supabase Cloud PostgreSQL Migration Runner...`);

const client = new pg.Client({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false }
});

async function runSupabaseMigration() {
  try {
    await client.connect();
    console.log(`✅ Successfully authenticated & connected to Supabase Cloud PostgreSQL!`);

    const migrationFilePath = path.join(__dirname, '../../../supabase/migrations/001_initial_schema.sql');
    console.log(`📄 Loading Migration Artifact: ${migrationFilePath}`);

    if (!fs.existsSync(migrationFilePath)) {
      throw new Error(`Migration file not found at path: ${migrationFilePath}`);
    }

    const migrationSql = fs.readFileSync(migrationFilePath, 'utf8');

    console.log(`🚀 Executing /supabase/migrations/001_initial_schema.sql...`);
    await client.query(migrationSql);

    console.log(`================================================================`);
    console.log(`🎉 SUCCESS: Supabase Migration Executed Successfully!`);
    console.log(`📊 Extensons, Enums, Tables, RLS Policies & Seed Data are LIVE!`);
    console.log(`================================================================`);
  } catch (err: any) {
    console.error(`❌ Supabase Migration Execution Failed:`, err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runSupabaseMigration();
