import dotenv from 'dotenv';
import path from 'path';

import fs from 'fs';

// Load .env from root, current working directory, or Render secret files
dotenv.config({ path: '/etc/secrets/.env' });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config();

const resolveDefaultUploadDir = (): string => {
  if (process.env.UPLOAD_DIR) {
    return path.resolve(process.env.UPLOAD_DIR);
  }
  const rootUploads = path.resolve(__dirname, '../../../uploads');
  if (fs.existsSync(rootUploads)) {
    return rootUploads;
  }
  return path.resolve(process.cwd(), 'uploads');
};

const getEnvVar = (...keys: string[]): string | undefined => {
  const normalizedKeys = keys.map((k) => k.trim().toLowerCase());
  for (const [key, val] of Object.entries(process.env)) {
    if (val !== undefined && normalizedKeys.includes(key.trim().toLowerCase())) {
      const cleanVal = val.trim().replace(/^["']|["']$/g, '');
      if (cleanVal.length > 0) {
        return cleanVal;
      }
    }
  }
  return undefined;
};

export const ENV = {
  PORT: parseInt(getEnvVar('PORT') || '5000', 10),
  NODE_ENV: getEnvVar('NODE_ENV') || 'development',
  CLIENT_URL: getEnvVar('CLIENT_URL') || 'http://localhost:5173',
  MONGODB_URI:
    getEnvVar('MONGODB_URI', 'MONGODB_URL', 'MONGO_URI', 'DATABASE_URL', 'MONGO_URL') ||
    'mongodb://127.0.0.1:27017/stickerforge',
  JWT_SECRET: getEnvVar('JWT_SECRET') || 'stickerforge-dev-secret-key-12345',
  JWT_EXPIRES_IN: getEnvVar('JWT_EXPIRES_IN') || '7d',
  BACKGROUND_REMOVAL_PROVIDER: (getEnvVar('BACKGROUND_REMOVAL_PROVIDER') || 'local').toLowerCase(),
  REMOVE_BG_API_KEY: getEnvVar('REMOVE_BG_API_KEY') || '',
  STORAGE_TYPE: getEnvVar('STORAGE_TYPE') || 'local',
  UPLOAD_DIR: resolveDefaultUploadDir(),
};
