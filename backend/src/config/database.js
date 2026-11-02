import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import { env } from './env.js';

const { Pool } = pg;
let __dirname;
try { __dirname = path.dirname(fileURLToPath(import.meta.url)); } catch { __dirname = process.cwd(); }

const dbDataDir = path.resolve(__dirname, '../../../database/data');

const isServerless = Boolean(
  process.env.NETLIFY || 
  process.env.AWS_LAMBDA_FUNCTION_NAME || 
  process.env.LAMBDA_TASK_ROOT
);

const isProduction = env.NODE_ENV === 'production' || Boolean(process.env.RENDER) || Boolean(process.env.VERCEL) || isServerless;

const hasExternalDb = Boolean(
  env.DATABASE_URL &&
  !env.DATABASE_URL.includes('localhost') &&
  !env.DATABASE_URL.includes('127.0.0.1')
);

let activeEngine = (hasExternalDb || isProduction) ? 'pg' : 'pglite';
let pool = null;
let pgliteInstance = null;

// SSL required for Supabase / Neon / Render / AWS
const requiresSSL = Boolean(
  isProduction ||
  hasExternalDb ||
  (env.DATABASE_URL && env.DATABASE_URL.includes('sslmode=require')) ||
  (env.DATABASE_URL && env.DATABASE_URL.includes('supabase.com'))
);

try {
  if (env.DATABASE_URL) {
    pool = new Pool({
      connectionString: env.DATABASE_URL,
      ssl: requiresSSL ? { rejectUnauthorized: false } : false,
      max: isServerless ? 2 : 10,
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 15000,
    });

    pool.on('error', (err) => {
      console.warn('[PostgreSQL Pool Warning]', err.message);
    });
  }
} catch (e) {
  console.warn('[PostgreSQL Pool Initialization Error]', e.message);
  pool = null;
}

// Lazy dynamic initialization of PGlite (only for local development when not on serverless)
const getPGlite = async () => {
  if (!pgliteInstance) {
    const { PGlite } = await import('@electric-sql/pglite');
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
      if (!isProduction && !hasExternalDb && (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND')) {
        activeEngine = 'pglite';
        return await query(text, params);
      }
      throw err;
    }
  }

  // Fallback to local PGlite (local offline dev only)
  try {
    const db = await getPGlite();
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
