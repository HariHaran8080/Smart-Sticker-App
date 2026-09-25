import { describe, it, expect } from 'vitest';
import sharp from 'sharp';
import { imageService } from '../services/image.service';

describe('Image Processing Service', () => {
  it('normalizes an input image and preserves metadata', async () => {
    // Create a 100x100 red square test image
    const sampleBuffer = await sharp({
      create: {
        width: 100,
        height: 100,
        channels: 4,
        background: { r: 255, g: 0, b: 0, alpha: 1 },
      },
    })
      .png()
      .toBuffer();

    const normalized = await imageService.normalizeImage(sampleBuffer);
    expect(normalized.width).toBe(100);
    expect(normalized.height).toBe(100);
    expect(normalized.buffer).toBeDefined();
    expect(normalized.buffer.length).toBeGreaterThan(0);
  });

  it('generates a contour die-cut sticker outline around a subject', async () => {
    // Create a circular subject with transparent surrounding
    const subject = await sharp({
      create: {
        width: 120,
        height: 120,
        channels: 4,
        background: { r: 50, g: 150, b: 250, alpha: 1 },
      },
    })
      .png()
      .toBuffer();

    const withOutline = await imageService.generateContourOutline(subject, 10, '#ffffff', false);
    const meta = await sharp(withOutline).metadata();

    expect(meta.channels).toBe(4);
    // Outline padding expands dimensions
    expect(meta.width).toBeGreaterThanOrEqual(120);
    expect(meta.height).toBeGreaterThanOrEqual(120);
  });

  it('builds a sticker with text overlay and WhatsApp 512x512 target preset', async () => {
    const sampleBuffer = await sharp({
      create: {
        width: 200,
        height: 200,
        channels: 4,
        background: { r: 255, g: 200, b: 0, alpha: 1 },
      },
    })
      .png()
      .toBuffer();

    const result = await imageService.buildSticker(sampleBuffer, {
      text: {
        content: 'LOL!',
        fontSize: 36,
        color: '#ffffff',
        bold: true,
        align: 'bottom',
      },
      outline: {
        enabled: true,
        style: 'white',
        color: '#ffffff',
        width: 6,
      },
      exportFormat: 'webp',
      targetSize: 512,
    });

    expect(result.format).toBe('webp');
    expect(result.width).toBe(512);
  });

  it('reproduces and tests compositing with text overlay on various image sizes', async () => {
    // Test on portrait, landscape, and large images
    const testSizes = [
      { w: 1200, h: 800 },
      { w: 736, h: 1104 },
      { w: 512, h: 512 },
    ];

    for (const size of testSizes) {
      const sample = await sharp({
        create: {
          width: size.w,
          height: size.h,
          channels: 4,
          background: { r: 100, g: 150, b: 200, alpha: 1 },
        },
      })
        .png()
        .toBuffer();

      const res = await imageService.buildSticker(sample, {
        text: {
          content: 'Hello World!',
          fontSize: 48,
          x: 256,
          y: 400,
          color: '#ffffff',
          strokeColor: '#000000',
          strokeWidth: 4,
          backgroundColor: 'rgba(0,0,0,0.5)',
          align: 'custom',
        },
        shadow: {
          enabled: true,
          blur: 14,
          offsetX: 0,
          offsetY: 8,
          color: '#000000',
          opacity: 0.4,
        },
        outline: {
          enabled: true,
          style: 'white',
          width: 8,
        },
        targetSize: 512,
      });

      expect(res.width).toBe(512);
      expect(res.height).toBe(512);
    }
  });
});
