import sharp from 'sharp';
import https from 'https';
import { ENV } from '../config/env';
import { logger } from '../utils/logger';

export interface IBackgroundRemovalProvider {
  name: string;
  removeBackground(imageBuffer: Buffer): Promise<{ buffer: Buffer; format: string }>;
}

/**
 * Remove.bg External Provider
 */
export class RemoveBgProvider implements IBackgroundRemovalProvider {
  name = 'removebg';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async removeBackground(imageBuffer: Buffer): Promise<{ buffer: Buffer; format: string }> {
    if (!this.apiKey) {
      throw new Error('REMOVE_BG_API_KEY is not configured');
    }

    return new Promise((resolve, reject) => {
      const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
      const postDataStart = Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="image_file"; filename="input.png"\r\nContent-Type: image/png\r\n\r\n`
      );
      const postDataSize = Buffer.from(`\r\n--${boundary}\r\nContent-Disposition: form-data; name="size"\r\n\r\nauto\r\n`);
      const postDataEnd = Buffer.from(`--${boundary}--\r\n`);

      const payload = Buffer.concat([postDataStart, imageBuffer, postDataSize, postDataEnd]);

      const req = https.request(
        'https://api.remove.bg/v1.0/removebg',
        {
          method: 'POST',
          headers: {
            'X-Api-Key': this.apiKey,
            'Content-Type': `multipart/form-data; boundary=${boundary}`,
            'Content-Length': payload.length,
          },
        },
        (res) => {
          if (res.statusCode !== 200) {
            let errBody = '';
            res.on('data', (d) => (errBody += d));
            res.on('end', () => {
              reject(new Error(`remove.bg API error (${res.statusCode}): ${errBody || 'Unknown error'}`));
            });
            return;
          }

          const chunks: Buffer[] = [];
          res.on('data', (chunk) => chunks.push(chunk));
          res.on('end', () => {
            resolve({ buffer: Buffer.concat(chunks), format: 'png' });
          });
        }
      );

      req.on('error', (err) => reject(err));
      req.write(payload);
      req.end();
    });
  }
}

/**
 * Local Smart Segmentation Provider (Built-in Sharp Algorithm)
 * Intelligently analyzes corner/border background colors, calculates Euclidean RGB distance,
 * and sets alpha transparency accordingly with edge feathering.
 */
export class LocalSmartSegmentationProvider implements IBackgroundRemovalProvider {
  name = 'local';

  async removeBackground(imageBuffer: Buffer): Promise<{ buffer: Buffer; format: string }> {
    // Read raw pixel data with RGBA
    const image = sharp(imageBuffer).ensureAlpha();
    const metadata = await image.metadata();
    const width = metadata.width || 400;
    const height = metadata.height || 400;

    const rawBuffer = await image.raw().toBuffer();
    const totalPixels = width * height;

    // Sample border pixels (corners and edges) to detect the dominant background color
    const samples: Array<[number, number, number]> = [];
    const stepX = Math.max(1, Math.floor(width / 20));
    const stepY = Math.max(1, Math.floor(height / 20));

    // Top & bottom rows
    for (let x = 0; x < width; x += stepX) {
      const topIdx = (0 * width + x) * 4;
      const bottomIdx = ((height - 1) * width + x) * 4;
      samples.push([rawBuffer[topIdx], rawBuffer[topIdx + 1], rawBuffer[topIdx + 2]]);
      samples.push([rawBuffer[bottomIdx], rawBuffer[bottomIdx + 1], rawBuffer[bottomIdx + 2]]);
    }
    // Left & right columns
    for (let y = 0; y < height; y += stepY) {
      const leftIdx = (y * width + 0) * 4;
      const rightIdx = (y * width + (width - 1)) * 4;
      samples.push([rawBuffer[leftIdx], rawBuffer[leftIdx + 1], rawBuffer[leftIdx + 2]]);
      samples.push([rawBuffer[rightIdx], rawBuffer[rightIdx + 1], rawBuffer[rightIdx + 2]]);
    }

    // Determine average background color from sampled corners
    let avgR = 0,
      avgG = 0,
      avgB = 0;
    for (const [r, g, b] of samples) {
      avgR += r;
      avgG += g;
      avgB += b;
    }
    avgR = Math.round(avgR / samples.length);
    avgG = Math.round(avgG / samples.length);
    avgB = Math.round(avgB / samples.length);

    // Apply color distance transparency
    // Distance threshold: pixels closer than `tolerance` become transparent
    const tolerance = 42;
    const feather = 18;

    const outBuffer = Buffer.from(rawBuffer);

    for (let i = 0; i < totalPixels; i++) {
      const offset = i * 4;
      const r = outBuffer[offset];
      const g = outBuffer[offset + 1];
      const b = outBuffer[offset + 2];
      const currentAlpha = outBuffer[offset + 3];

      // If already transparent, preserve
      if (currentAlpha < 20) continue;

      // Euclidean distance in RGB color space
      const dr = r - avgR;
      const dg = g - avgG;
      const db = b - avgB;
      const dist = Math.sqrt(dr * dr + dg * dg + db * db);

      if (dist < tolerance) {
        outBuffer[offset + 3] = 0; // Completely transparent
      } else if (dist < tolerance + feather) {
        // Smooth transition
        const factor = (dist - tolerance) / feather;
        outBuffer[offset + 3] = Math.round(currentAlpha * factor);
      }
    }

    const resultBuffer = await sharp(outBuffer, {
      raw: {
        width,
        height,
        channels: 4,
      },
    })
      .png()
      .toBuffer();

    return { buffer: resultBuffer, format: 'png' };
  }
}

export class BackgroundRemovalService {
  private activeProvider: IBackgroundRemovalProvider;

  constructor() {
    if (ENV.BACKGROUND_REMOVAL_PROVIDER === 'removebg' && ENV.REMOVE_BG_API_KEY) {
      this.activeProvider = new RemoveBgProvider(ENV.REMOVE_BG_API_KEY);
      logger.info('BackgroundRemovalService initialized with Remove.bg external provider');
    } else {
      this.activeProvider = new LocalSmartSegmentationProvider();
      logger.info('BackgroundRemovalService initialized with Local Smart Segmentation provider');
    }
  }

  /**
   * Set or switch provider dynamically
   */
  setProvider(provider: IBackgroundRemovalProvider) {
    this.activeProvider = provider;
  }

  /**
   * Remove background from image buffer.
   * If an external provider is configured but fails, seamlessly falls back to the local provider.
   */
  async removeBackground(imageBuffer: Buffer): Promise<{ buffer: Buffer; format: string; providerUsed: string }> {
    try {
      const result = await this.activeProvider.removeBackground(imageBuffer);
      return { ...result, providerUsed: this.activeProvider.name };
    } catch (err: any) {
      logger.warn(`Primary background removal provider (${this.activeProvider.name}) failed: ${err.message}. Falling back to local.`);
      if (this.activeProvider.name !== 'local') {
        const fallback = new LocalSmartSegmentationProvider();
        const result = await fallback.removeBackground(imageBuffer);
        return { ...result, providerUsed: 'local-fallback' };
      }
      throw err;
    }
  }
}

export const backgroundRemovalService = new BackgroundRemovalService();
