import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error(`Unhandled Error [${req.method} ${req.url}]:`, err.message || err);

  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ success: false, message: 'File is too large. Maximum size is 10MB.' });
      return;
    }
    res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
    return;
  }

  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
};
