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
    expect(result.height).toBe(512);
    expect(result.fileSize).toBeGreaterThan(0);
  });
});
