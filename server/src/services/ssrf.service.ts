import http from 'http';
import https from 'https';
import dns from 'dns';
import ipaddr from 'ipaddr.js';
import { URL } from 'url';

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];
const TIMEOUT_MS = 8000;

export class SSRFError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SSRFError';
  }
}

/**
 * Checks whether an IP address is private, loopback, link-local, multicast, or reserved.
 */
export function isPrivateIp(ip: string): boolean {
  try {
    const addr = ipaddr.parse(ip);
    const range = addr.range();
    const blockedRanges = [
      'unspecified',
      'broadcast',
      'linkLocal',
      'loopback',
      'carrierGradeNat',
      'private',
      'reserved',
      'uniqueLocal',
    ];
    return blockedRanges.includes(range);
  } catch (e) {
    // If it cannot be parsed as a valid IP, block it for safety
    return true;
  }
}

/**
 * Safely fetches an image buffer from a public URL with SSRF protection.
 */
export async function safeFetchImage(imageUrl: string): Promise<{ buffer: Buffer; contentType: string }> {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(imageUrl);
  } catch {
    throw new SSRFError('Invalid URL provided');
  }

  // Only allow http and https protocols
  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    throw new SSRFError('Only HTTP and HTTPS protocols are supported');
  }

  // Resolve hostname to IP to check against private/reserved ranges
  const hostname = parsedUrl.hostname;
  if (!hostname) {
    throw new SSRFError('Invalid URL hostname');
  }

  // Lookup DNS
  const resolved = await dns.promises.lookup(hostname, { all: true });
  if (!resolved || resolved.length === 0) {
    throw new SSRFError(`Unable to resolve host: ${hostname}`);
  }

  for (const entry of resolved) {
    if (isPrivateIp(entry.address)) {
      throw new SSRFError(`Access to private/local network address (${entry.address}) is forbidden`);
    }
  }

  // Safe to request
  return new Promise((resolve, reject) => {
    const client = parsedUrl.protocol === 'https:' ? https : http;

    const req = client.get(
      parsedUrl.href,
      {
        timeout: TIMEOUT_MS,
        headers: {
          'User-Agent': 'StickerForge-ImageFetcher/1.0',
          Accept: 'image/png,image/jpeg,image/webp,image/gif;q=0.9,*/*;q=0.8',
        },
      },
      (res) => {
        // Check for redirects
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          req.destroy();
          // Safely recurse once for redirect
          try {
            const redirectUrl = new URL(res.headers.location, parsedUrl.href).href;
            return safeFetchImage(redirectUrl).then(resolve).catch(reject);
          } catch {
            return reject(new SSRFError('Invalid redirect URL'));
          }
        }

        if (res.statusCode !== 200) {
          req.destroy();
          return reject(new SSRFError(`Remote server returned HTTP ${res.statusCode}`));
        }

        const rawContentType = (res.headers['content-type'] || '').toLowerCase().split(';')[0].trim();
        if (!ALLOWED_MIME_TYPES.includes(rawContentType)) {
          req.destroy();
          return reject(new SSRFError(`Unsupported content type: ${rawContentType || 'unknown'}. Only PNG, JPG, WEBP, and GIF are allowed.`));
        }

        const contentLength = parseInt(res.headers['content-length'] || '0', 10);
        if (contentLength > MAX_IMAGE_SIZE) {
          req.destroy();
          return reject(new SSRFError(`Image exceeds maximum allowed size of 10MB`));
        }

        const chunks: Buffer[] = [];
        let totalBytes = 0;

        res.on('data', (chunk: Buffer) => {
          totalBytes += chunk.length;
          if (totalBytes > MAX_IMAGE_SIZE) {
            req.destroy();
            return reject(new SSRFError('Image data stream exceeded 10MB limit'));
          }
          chunks.push(chunk);
        });

        res.on('end', () => {
          const buffer = Buffer.concat(chunks);
          resolve({ buffer, contentType: rawContentType });
        });

        res.on('error', (err) => {
          reject(new SSRFError(`Error reading image stream: ${err.message}`));
        });
      }
    );

    req.on('timeout', () => {
      req.destroy();
      reject(new SSRFError('Image fetch timed out after 8 seconds'));
    });

    req.on('error', (err) => {
      reject(new SSRFError(`Network request failed: ${err.message}`));
    });
  });
}
