import pg from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres.metdaqrqjqruellampqi:B!%24leri%4018a1@aws-1-ap-south-1.pooler.supabase.com:6543/postgres';

console.log(`🔌 Connecting to Supabase PostgreSQL database...`);

const client = new pg.Client({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    await client.connect();
    console.log(`✅ Successfully connected to Supabase PostgreSQL database!`);

    const schemaPath = path.join(__dirname, '../../../db/schema.sql');
    console.log(`📄 Reading SQL migration file from: ${schemaPath}`);
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log(`🚀 Executing production SQL schema on Supabase...`);
    await client.query(sql);

    console.log(`🎉 SUCCESS: Production schema, Enums, Tables, RLS policies, and Seed Data deployed to Supabase PostgreSQL successfully!`);
  } catch (err: any) {
    console.error(`❌ Migration Error:`, err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
