import { describe, it, expect } from 'vitest';
import { hashPassword, comparePassword, generateToken, verifyToken } from '../utils/security';

describe('Security Utilities', () => {
  it('hashes passwords and validates correctly', async () => {
    const rawPass = 'Secret123!';
    const hashed = await hashPassword(rawPass);

    expect(hashed).not.toBe(rawPass);
    expect(await comparePassword(rawPass, hashed)).toBe(true);
    expect(await comparePassword('WrongPass', hashed)).toBe(false);
  });

  it('generates and verifies valid JWT tokens', () => {
    const userId = '654321098765432109876543';
    const email = 'user@example.com';
    const token = generateToken(userId, email);

    expect(typeof token).toBe('string');
    const payload = verifyToken(token);
    expect(payload).not.toBeNull();
    expect(payload?.userId).toBe(userId);
    expect(payload?.email).toBe(email);
  });

  it('rejects tampered JWT tokens', () => {
    const token = generateToken('123', 'test@example.com');
    const tampered = token.slice(0, -5) + 'abcde';
    const payload = verifyToken(tampered);
    expect(payload).toBeNull();
  });
});
