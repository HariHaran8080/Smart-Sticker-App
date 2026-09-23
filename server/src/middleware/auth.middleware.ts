import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/security';
import { User, IUserDocument } from '../models/User';

export interface AuthRequest extends Request {
  user?: IUserDocument;
  userId?: string;
}

/**
 * Middleware that requires authentication.
 */
export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;

    // Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
      return;
    }

    const payload = verifyToken(token);
    if (!payload) {
      res.status(401).json({ success: false, message: 'Invalid or expired token. Please log in again.' });
      return;
    }

    const user = await User.findById(payload.userId);
    if (!user) {
      res.status(401).json({ success: false, message: 'User not found' });
      return;
    }

    req.user = user;
    req.userId = user._id.toString();
    next();
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Authentication error', error: error.message });
  }
};

/**
 * Optional authentication: populates req.user if token is present, but doesn't block guests.
 */
export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      const payload = verifyToken(token);
      if (payload) {
        const user = await User.findById(payload.userId);
        if (user) {
          req.user = user;
          req.userId = user._id.toString();
        }
      }
    }
    next();
  } catch {
    next();
  }
};
