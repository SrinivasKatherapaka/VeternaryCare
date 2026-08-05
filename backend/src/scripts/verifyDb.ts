import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const dbUrl = process.env.DATABASE_URL!;

const client = new pg.Client({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false }
});

async function verify() {
  try {
    await client.connect();
    console.log('✅ Connected to Supabase!');

    const tenantRes = await client.query('SELECT * FROM hospital_tenants;');
    console.log(`🏥 Hospital Tenants in Supabase:`, tenantRes.rows);

    const usersRes = await client.query('SELECT id, email, full_name, role FROM app_users;');
    console.log(`👥 Users in Supabase:`, usersRes.rows);

    const controlsRes = await client.query('SELECT control_code, title, status, risk_rating FROM compliance_controls;');
    console.log(`📋 Controls in Supabase:`, controlsRes.rows);

    console.log('\n✨ Supabase Verification Complete!');
  } catch (err: any) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

verify();
