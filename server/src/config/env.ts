import dotenv from 'dotenv';
import path from 'path';

import fs from 'fs';

// Load .env from root or current working directory
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
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

export const ENV = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  MONGODB_URI:
    process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/stickerforge',
  JWT_SECRET: process.env.JWT_SECRET || 'stickerforge-dev-secret-key-12345',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  BACKGROUND_REMOVAL_PROVIDER: (process.env.BACKGROUND_REMOVAL_PROVIDER || 'local').toLowerCase(),
  REMOVE_BG_API_KEY: process.env.REMOVE_BG_API_KEY || '',
  STORAGE_TYPE: process.env.STORAGE_TYPE || 'local',
  UPLOAD_DIR: resolveDefaultUploadDir(),
};
