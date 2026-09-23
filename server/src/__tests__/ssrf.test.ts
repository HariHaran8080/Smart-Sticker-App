import { describe, it, expect } from 'vitest';
import { isPrivateIp, safeFetchImage, SSRFError } from '../services/ssrf.service';

describe('SSRF Protection Service', () => {
  it('correctly identifies private and loopback IPv4 addresses', () => {
    expect(isPrivateIp('127.0.0.1')).toBe(true);
    expect(isPrivateIp('10.0.0.1')).toBe(true);
    expect(isPrivateIp('192.168.1.1')).toBe(true);
    expect(isPrivateIp('172.16.0.1')).toBe(true);
    expect(isPrivateIp('169.254.169.254')).toBe(true); // AWS/cloud metadata IP
    expect(isPrivateIp('0.0.0.0')).toBe(true);
  });

  it('correctly identifies private and loopback IPv6 addresses', () => {
    expect(isPrivateIp('::1')).toBe(true);
    expect(isPrivateIp('fe80::1')).toBe(true);
  });

  it('identifies public IPv4 addresses as non-private', () => {
    expect(isPrivateIp('8.8.8.8')).toBe(false);
    expect(isPrivateIp('1.1.1.1')).toBe(false);
  });

  it('rejects forbidden protocols', async () => {
    await expect(safeFetchImage('file:///etc/passwd')).rejects.toThrow(SSRFError);
    await expect(safeFetchImage('ftp://example.com/test.png')).rejects.toThrow(SSRFError);
  });

  it('rejects localhost and loopback domains', async () => {
    await expect(safeFetchImage('http://localhost:5000/test.png')).rejects.toThrow(SSRFError);
    await expect(safeFetchImage('http://127.0.0.1:8080/image.jpg')).rejects.toThrow(SSRFError);
  });
});
