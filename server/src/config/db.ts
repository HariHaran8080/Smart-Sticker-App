import mongoose from 'mongoose';
import { ENV } from './env';
import { logger } from '../utils/logger';

export const connectDB = async (): Promise<boolean> => {
  const maskedUri = ENV.MONGODB_URI
    ? ENV.MONGODB_URI.replace(/:([^:@]+)@/, ':****@')
    : 'UNDEFINED';
  logger.info(`Attempting MongoDB connection to: ${maskedUri}`);

  try {
    const conn = await mongoose.connect(ENV.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    logger.info(`MongoDB connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return true;
  } catch (error: any) {
    logger.error(`MongoDB connection error: ${error.message}`);
    logger.warn('Running without MongoDB connection. Database features will be disabled or mocked.');
    return false;
  }
};
