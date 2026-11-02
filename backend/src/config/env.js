import dotenv from 'dotenv';

dotenv.config();

const isServerlessOrProd = Boolean(
  process.env.NETLIFY || 
  process.env.AWS_LAMBDA_FUNCTION_NAME || 
  process.env.NODE_ENV === 'production'
);

const SUPABASE_DB_URL = 'postgresql://postgres.knfkahpcqzenqkzgsoxg:Guridhis2026!@aws-0-eu-west-1.pooler.supabase.com:6543/postgres';

export const env = {
  PORT: process.env.PORT || 5001,
  DATABASE_URL: (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost'))
    ? process.env.DATABASE_URL
    : SUPABASE_DB_URL,
  JWT_SECRET: process.env.JWT_SECRET || 'super_secret_jwt_key_guridhis_2026_secure',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  FRONTEND_URL: process.env.FRONTEND_URL || 'https://guridhis-somalia.netlify.app',
  NODE_ENV: process.env.NODE_ENV || (isServerlessOrProd ? 'production' : 'development'),
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || 'vzhzosef',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '442249531596166',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || 'WK0wynWjTBMSymTmx9fPLwFlceI',
};

export default env;
