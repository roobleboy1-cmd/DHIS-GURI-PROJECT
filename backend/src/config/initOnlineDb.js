import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import { env } from './env.js';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const schemaPath = path.resolve(__dirname, '../../../database/schema.sql');
const seedPath = path.resolve(__dirname, '../../../database/seed.sql');

async function initializeOnlinePostgreSQL() {
  console.log('============================================================');
  console.log('[GURI DHIS] Dhisaya Online Managed PostgreSQL Database...');
  console.log('============================================================');

  if (!env.DATABASE_URL) {
    console.error('Cilad: DATABASE_URL lagama helin .env!');
    process.exit(1);
  }

  // Mask database password in console output for security
  const maskedUrl = env.DATABASE_URL.replace(/:([^:@]+)@/, ':****@');
  console.log(`[Target Database] ${maskedUrl}`);

  const pool = new Pool({
    connectionString: env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });

  try {
    const client = await pool.connect();
    console.log('[Xiriir] Si guul leh ayaa loogu xirmay PostgreSQL Server!');

    console.log('[1/2] Shubaaya schema.sql (Jadwalka, ENUMs, Triggers)...');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await client.query(schemaSql);
    console.log('[Guul] Dhammaan jadwallada waa la dhisay!');

    console.log('[2/2] Shubaaya seed.sql (Xogta bilowga)...');
    const seedSql = fs.readFileSync(seedPath, 'utf8');
    await client.query(seedSql);
    console.log('[Guul] Xogta bilowga waa la shubay!');

    const res = await client.query('SELECT count(*)::int as user_count FROM users');
    console.log(`[Hubin] Tirada isticmaalayaasha ee database-ka: ${res.rows[0].user_count}`);

    client.release();
    await pool.end();

    console.log('============================================================');
    console.log('HAMBALYO: Database-ka Online-ka ah si buuxda ayuu u diyaar yahay!');
    console.log('============================================================');
    process.exit(0);
  } catch (err) {
    console.error('[Cilad]:', err.message);
    await pool.end();
    process.exit(1);
  }
}

initializeOnlinePostgreSQL();
