import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';
import { ENV } from './config/env';
import { connectDB } from './config/db';
import { logger } from './utils/logger';
import apiRoutes from './routes';
import { errorHandler } from './middleware/error.middleware';
import { generalLimiter } from './middleware/rateLimit.middleware';

export const app = express();

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow client to load generated sticker images
  })
);

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
];

if (ENV.CLIENT_URL) {
  const configured = ENV.CLIENT_URL.split(',').map((url) => url.trim().replace(/\/$/, ''));
  for (const url of configured) {
    if (url && !allowedOrigins.includes(url)) {
      allowedOrigins.push(url);
    }
  }
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin = origin.replace(/\/$/, '');
      const isAllowed =
        allowedOrigins.includes(normalizedOrigin) ||
        (ENV.NODE_ENV !== 'production' &&
          (normalizedOrigin.includes('localhost') || normalizedOrigin.includes('127.0.0.1')));

      if (isAllowed) {
        callback(null, true);
      } else {
        logger.warn(`Blocked by CORS policy: origin "${origin}" not allowed`);
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
  })
);

// Body parsers
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(cookieParser());

// Static file serving for uploads
app.use('/uploads', express.static(ENV.UPLOAD_DIR));

// Rate limit API routes
app.use('/api', generalLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    storage: ENV.STORAGE_TYPE,
    bgRemovalProvider: ENV.BACKGROUND_REMOVAL_PROVIDER,
  });
});

// API Routes
app.use('/api', apiRoutes);

// 404 Handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.url} not found`,
  });
});

// Global error handler
app.use(errorHandler);

export const startServer = async () => {
  // Connect to Database
  await connectDB();

  return app.listen(ENV.PORT, '0.0.0.0', () => {
    logger.info(`StickerForge API server running on port ${ENV.PORT}`);
    logger.info(`Serving uploads from: ${ENV.UPLOAD_DIR}`);
  });
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}
