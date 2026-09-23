import rateLimit from 'express-rate-limit';

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // 300 requests per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
});

export const heavyProcessingLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 heavy processing tasks per min
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Sticker generation rate limit reached. Please wait a moment before trying again.',
  },
});
