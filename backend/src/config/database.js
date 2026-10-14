import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import { PGlite } from '@electric-sql/pglite';
import { env } from './env.js';

const { Pool } = pg;
let __dirname;
try { __dirname = path.dirname(fileURLToPath(import.meta.url)); } catch { __dirname = process.cwd(); }

const dbDataDir = path.resolve(__dirname, '../../../database/data');

// Determine if we should use network PostgreSQL (pool) or local PGlite
const hasExternalDb = Boolean(
  env.DATABASE_URL &&
  !env.DATABASE_URL.includes('localhost') &&
  !env.DATABASE_URL.includes('127.0.0.1')
);
const isProduction = env.NODE_ENV === 'production' || Boolean(process.env.RENDER) || Boolean(process.env.VERCEL);

let activeEngine = (hasExternalDb || isProduction) ? 'pg' : 'pglite';
let pool = null;
let pgliteInstance = null;

// Configure SSL properly for Neon / Render / Supabase / AWS
const requiresSSL = Boolean(
  isProduction ||
  hasExternalDb ||
  (env.DATABASE_URL && env.DATABASE_URL.includes('sslmode=require'))
);

try {
  if (env.DATABASE_URL) {
    pool = new Pool({
      connectionString: env.DATABASE_URL,
      ssl: requiresSSL ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
    });

    pool.on('error', (err) => {
      console.warn('[PostgreSQL Pool Warning]', err.message);
    });
  }
} catch (e) {
  console.warn('[PostgreSQL Pool Initialization Error]', e.message);
  pool = null;
}

// Lazy initialization of PGlite (only used for local development fallback)
const getPGlite = () => {
  if (!pgliteInstance) {
    pgliteInstance = new PGlite(dbDataDir);
  }
  return pgliteInstance;
};

export const query = async (text, params = []) => {
  if (activeEngine === 'pg' && pool) {
    try {
      const res = await pool.query(text, params);
      return res;
    } catch (err) {
      // If we are in local development and connection was refused, fall back to pglite
      if (!isProduction && !hasExternalDb && (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND')) {
        activeEngine = 'pglite';
        return await query(text, params);
      }
      throw err;
    }
  }

  // Use persistent PGlite for local development
  try {
    const db = getPGlite();
    const res = await db.query(text, params);
    return res;
  } catch (err) {
    if (pool && activeEngine === 'pglite') {
      try {
        const res = await pool.query(text, params);
        activeEngine = 'pg';
        return res;
      } catch (_) {}
    }
    throw err;
  }
};

export const checkDatabaseHealth = async () => {
  try {
    const res = await query('SELECT 1 as connected');
    return {
      connected: Boolean(res && res.rows && res.rows.length > 0),
      engine: activeEngine === 'pg' ? 'PostgreSQL (Network Pool / Managed)' : 'PostgreSQL (Persistent Local PGlite)'
    };
  } catch (err) {
    return {
      connected: false,
      error: err.message
    };
  }
};

export default {
  pool,
  query,
  checkDatabaseHealth
};
