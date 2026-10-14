import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query } from './database.js';
import { PGlite } from '@electric-sql/pglite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbDataDir = path.resolve(__dirname, '../../../database/data');
const schemaPath = path.resolve(__dirname, '../../../database/schema.sql');
const seedPath = path.resolve(__dirname, '../../../database/seed.sql');

async function initializeDatabase() {
  console.log('------------------------------------------------------------');
  console.log('[GURI DHIS] Dhisaya Database-ka (Initializing PostgreSQL Database)...');

  try {
    const db = new PGlite(dbDataDir);
    console.log('[Database Engine] PostgreSQL Local Storage:', dbDataDir);

    console.log('[1/2] Shubaaya schema.sql (14 tables, custom ENUMs, triggers, indexes)...');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await db.exec(schemaSql);
    console.log('[Guul] Dhammaan 14-ka jadwalka si buuxda ayaa loo dhisay!');

    console.log('[2/2] Shubaaya seed.sql (Admin default credentials)...');
    const seedSql = fs.readFileSync(seedPath, 'utf8');
    await db.exec(seedSql);
    console.log('[Guul] Xogta bilowga ah ee Admin-ka waa la shubay (admin@guridhis.com)!');

    const check = await db.query('SELECT count(*)::int as user_count FROM users');
    console.log(`[Hubin] Tirada isticmaalayaasha ee database-ka: ${check.rows[0].user_count}`);

    console.log('------------------------------------------------------------');
    console.log('HAMBALYO: Database-ka PostgreSQL si buuxda oo 100% ah ayuu hadda u diyaar yahay!');
    console.log('Wuxuu si toos ah ugu kaydsan yahay: database/data');
    console.log('------------------------------------------------------------');
    process.exit(0);
  } catch (err) {
    console.error('Cilad:', err);
    process.exit(1);
  }
}

initializeDatabase();
