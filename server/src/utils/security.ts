import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateToken = (userId: string, email: string): string => {
  return jwt.sign({ userId, email }, ENV.JWT_SECRET, {
    expiresIn: ENV.JWT_EXPIRES_IN as any,
  });
};

export const verifyToken = (token: string): { userId: string; email: string } | null => {
  try {
    return jwt.verify(token, ENV.JWT_SECRET) as { userId: string; email: string };
  } catch (err) {
    return null;
  }
};
