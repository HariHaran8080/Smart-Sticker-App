import sharp from 'sharp';
import { IStickerSettings } from '../types';
import { logger } from '../utils/logger';

export interface ProcessedStickerResult {
  buffer: Buffer;
  format: 'png' | 'webp';
  width: number;
  height: number;
  fileSize: number;
}

export class ImageService {
  /**
   * Normalize an uploaded image buffer:
   * - Rotates based on EXIF orientation
   * - Limits extreme dimensions (max 2560px on longest side for memory safety)
   * - Strips dangerous or bloat EXIF metadata
   */
  async normalizeImage(inputBuffer: Buffer): Promise<{ buffer: Buffer; width: number; height: number; format: string }> {
    const pipeline = sharp(inputBuffer).rotate(); // auto-rotate by EXIF
    const metadata = await pipeline.metadata();

    const maxDim = 2560;
    let width = metadata.width || 800;
    let height = metadata.height || 800;

    let processed = pipeline;
    if (width > maxDim || height > maxDim) {
      processed = processed.resize({
        width: width > height ? maxDim : undefined,
        height: height >= width ? maxDim : undefined,
        fit: 'inside',
        withoutEnlargement: true,
      });
      const newMeta = await processed.metadata();
      width = newMeta.width || width;
      height = newMeta.height || height;
    }

    const outputBuffer = await processed.toBuffer();
    return {
      buffer: outputBuffer,
      width,
      height,
      format: metadata.format || 'png',
    };
  }

  /**
   * Generates a contour die-cut sticker outline around a transparent subject.
   * Uses alpha channel extraction, blur/dilation, thresholding, and color tinting.
   */
  async generateContourOutline(
    subjectBuffer: Buffer,
    outlineWidth: number = 8,
    colorHex: string = '#ffffff',
    soft: boolean = false
  ): Promise<Buffer> {
    const subject = sharp(subjectBuffer).ensureAlpha();
    const meta = await subject.metadata();
    const width = meta.width || 400;
    const height = meta.height || 400;

    // Pad image slightly so border isn't clipped at edges
    const pad = Math.max(10, Math.ceil(outlineWidth * 2));
    const paddedWidth = width + pad * 2;
    const paddedHeight = height + pad * 2;

    const paddedSubject = await sharp({
      create: {
        width: paddedWidth,
        height: paddedHeight,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([{ input: await subject.toBuffer(), top: pad, left: pad }])
      .png()
      .toBuffer();

    if (outlineWidth <= 0) {
      return paddedSubject;
    }

    // Extract alpha channel
    const alphaChannel = await sharp(paddedSubject).extractChannel(3).toBuffer();

    // Dilate alpha by blurring
    const blurSigma = Math.max(0.3, outlineWidth * 0.65);
    let dilatedAlpha = sharp(alphaChannel).blur(blurSigma);

    if (!soft) {
      // Crisp contour border
      dilatedAlpha = dilatedAlpha.threshold(30);
    }

    const dilatedAlphaBuffer = await dilatedAlpha.toBuffer();

    // Parse colorHex
    const cleanHex = colorHex.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2) || 'ff', 16);
    const g = parseInt(cleanHex.substring(2, 4) || 'ff', 16);
    const b = parseInt(cleanHex.substring(4, 6) || 'ff', 16);

    // Create colored solid of padded size
    const colorSolid = await sharp({
      create: {
        width: paddedWidth,
        height: paddedHeight,
        channels: 3,
        background: { r, g, b },
      },
    })
      .png()
      .toBuffer();

    // Mask color solid with dilated alpha
    const outlineLayer = await sharp(colorSolid)
      .joinChannel(dilatedAlphaBuffer)
      .png()
      .toBuffer();

    // Composite subject over outline layer
    const finalWithOutline = await sharp(outlineLayer)
      .composite([{ input: paddedSubject, blend: 'over' }])
      .png()
      .toBuffer();

    return finalWithOutline;
  }

  /**
   * Generates a drop shadow layer behind an image
   */
  async generateDropShadow(
    subjectBuffer: Buffer,
    blur: number = 12,
    offsetX: number = 0,
    offsetY: number = 8,
    colorHex: string = '#000000',
    opacity: number = 0.4
  ): Promise<Buffer> {
    const meta = await sharp(subjectBuffer).metadata();
    const width = meta.width || 400;
    const height = meta.height || 400;

    const pad = Math.max(20, Math.ceil(blur * 2) + Math.max(Math.abs(offsetX), Math.abs(offsetY)));
    const canvasW = width + pad * 2;
    const canvasH = height + pad * 2;

    const cleanHex = colorHex.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2) || '00', 16);
    const g = parseInt(cleanHex.substring(2, 4) || '00', 16);
    const b = parseInt(cleanHex.substring(4, 6) || '00', 16);

    const alphaChannel = await sharp(subjectBuffer)
      .ensureAlpha()
      .extractChannel(3)
      .toBuffer();

    const blurredAlpha = await sharp(alphaChannel)
      .blur(Math.max(0.3, blur))
      .linear(opacity, 0)
      .toBuffer();

    const shadowSolid = await sharp({
      create: {
        width,
        height,
        channels: 3,
        background: { r, g, b },
      },
    })
      .png()
      .toBuffer();

    const shadowElement = await sharp(shadowSolid)
      .joinChannel(blurredAlpha)
      .png()
      .toBuffer();

    return sharp({
      create: {
        width: canvasW,
        height: canvasH,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([
        {
          input: shadowElement,
          left: pad + offsetX,
          top: pad + offsetY,
        },
        {
          input: subjectBuffer,
          left: pad,
          top: pad,
        },
      ])
      .png()
      .toBuffer();
  }

  /**
   * Applies full sticker transformations:
   * - Crop
   * - Rotation
   * - Scale & canvas position
   * - Contour border / outline
   * - Text overlay (SVG)
   * - Emoji overlay
   * - Target size & output format (PNG or WebP)
   */
  async buildSticker(
    inputBuffer: Buffer,
    settings: IStickerSettings = {}
  ): Promise<ProcessedStickerResult> {
    let current = sharp(inputBuffer).ensureAlpha();

    // 1. Crop if requested
    if (settings.crop && settings.crop.width > 0 && settings.crop.height > 0) {
      current = current.extract({
        left: Math.max(0, Math.floor(settings.crop.x)),
        top: Math.max(0, Math.floor(settings.crop.y)),
        width: Math.floor(settings.crop.width),
        height: Math.floor(settings.crop.height),
      });
    }

    // 2. Rotate if specified
    const rotation = settings.rotation || 0;
    if (rotation !== 0) {
      current = current.rotate(rotation);
    }

    // 2b. Flips (Horizontal / Vertical)
    if (settings.flip?.horizontal) {
      current = current.flop();
    }
    if (settings.flip?.vertical) {
      current = current.flip();
    }

    // 2c. Image Adjustments (Brightness, Saturation, Hue, Blur, Contrast)
    if (settings.adjust) {
      const { brightness = 0, saturation = 0, hue = 0, blur = 0, contrast = 0 } = settings.adjust;
      if (brightness !== 0 || saturation !== 0 || hue !== 0) {
        current = current.modulate({
          brightness: Math.max(0.1, 1 + brightness / 100),
          saturation: Math.max(0, 1 + saturation / 100),
          hue: Math.round(hue),
        });
      }
      if (contrast !== 0) {
        const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
        current = current.linear(factor, -(128 * factor) + 128);
      }
      if (blur > 0) {
        current = current.blur(Math.min(20, Math.max(0.3, blur)));
      }
    }

    let buffer = await current.png().toBuffer();

    // 3. Apply contour outline if enabled
    if (settings.outline && settings.outline.enabled && settings.outline.style !== 'none') {
      const outlineColor =
        settings.outline.style === 'white'
          ? '#ffffff'
          : settings.outline.style === 'black'
          ? '#111111'
          : settings.outline.color || '#ffffff';

      const isSoft = settings.outline.style === 'soft';
      const outlineWidth = settings.outline.width || 8;

      buffer = await this.generateContourOutline(buffer, outlineWidth, outlineColor, isSoft);
    }

    // 3b. Apply drop shadow if enabled
    if (settings.shadow && settings.shadow.enabled) {
      buffer = await this.generateDropShadow(
        buffer,
        settings.shadow.blur ?? 12,
        settings.shadow.offsetX ?? 0,
        settings.shadow.offsetY ?? 8,
        settings.shadow.color || '#000000',
        settings.shadow.opacity ?? 0.4
      );
    }

    // Get current dimensions
    const meta = await sharp(buffer).metadata();
    const curWidth = meta.width || 512;
    const curHeight = meta.height || 512;

    const composites: sharp.OverlayOptions[] = [];

    // 4. Text overlay via SVG
    if (settings.text && settings.text.content && settings.text.content.trim()) {
      const text = settings.text.content.trim();
      const fontSize = Math.max(16, settings.text.fontSize || 32);
      const fontWeight = settings.text.bold ? 'bold' : 'normal';
      const textColor = settings.text.color || '#ffffff';
      const align = settings.text.align || 'bottom';

      let xPos = Math.floor(curWidth / 2);
      if (settings.text.x !== undefined) {
        xPos = Math.round((settings.text.x / 512) * curWidth);
      }

      let yPos = curHeight - fontSize - 20;
      if (settings.text.y !== undefined) {
        yPos = Math.round((settings.text.y / 512) * curHeight);
      } else if (align === 'top') {
        yPos = fontSize + 20;
      } else if (align === 'center') {
        yPos = Math.floor(curHeight / 2);
      }
      if (settings.text.customY !== undefined && settings.text.y === undefined) {
        yPos = settings.text.customY;
      }

      // Escape XML characters
      const escapedText = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');

      const font = settings.text.fontFamily || "'Impact', 'Arial Black', -apple-system, sans-serif";
      const strokeColor = settings.text.strokeColor !== undefined ? settings.text.strokeColor : '#000000';
      const strokeWidth = settings.text.strokeWidth !== undefined ? settings.text.strokeWidth : Math.max(2, Math.round(fontSize * 0.1));

      const bgPill =
        settings.text.backgroundColor && settings.text.backgroundColor !== 'none'
          ? `<rect x="${xPos - Math.round(escapedText.length * fontSize * 0.32)}" y="${yPos - fontSize * 0.85}" width="${Math.round(escapedText.length * fontSize * 0.65)}" height="${Math.round(fontSize * 1.25)}" rx="${Math.round(fontSize * 0.3)}" fill="${settings.text.backgroundColor}" />`
          : '';

      const svgText = `
        <svg width="${curWidth}" height="${curHeight}" xmlns="http://www.w3.org/2000/svg">
          <style>
            .sticker-text {
              font-family: ${font};
              font-size: ${fontSize}px;
              font-weight: ${fontWeight};
              fill: ${textColor};
              stroke: ${strokeColor};
              stroke-width: ${strokeWidth}px;
              paint-order: stroke fill;
              text-anchor: middle;
            }
          </style>
          ${bgPill}
          <text x="${xPos}" y="${yPos}" class="sticker-text">${escapedText}</text>
        </svg>
      `;

      composites.push({
        input: Buffer.from(svgText),
        top: 0,
        left: 0,
      });
    }

    // 5. Emoji overlay via SVG
    if (settings.emoji && settings.emoji.symbol && settings.emoji.symbol.trim()) {
      const emoji = settings.emoji.symbol.trim();
      const emojiSize = settings.emoji.size || 48;
      const pos = settings.emoji.position || 'top-right';

      let x = curWidth - emojiSize - 20;
      let y = emojiSize + 10;

      if (pos === 'top-left') {
        x = 20;
        y = emojiSize + 10;
      } else if (pos === 'bottom-left') {
        x = 20;
        y = curHeight - 20;
      } else if (pos === 'bottom-right') {
        x = curWidth - emojiSize - 20;
        y = curHeight - 20;
      } else if (pos === 'center') {
        x = Math.floor(curWidth / 2);
        y = Math.floor(curHeight / 2) + Math.floor(emojiSize / 2);
      }

      const svgEmoji = `
        <svg width="${curWidth}" height="${curHeight}" xmlns="http://www.w3.org/2000/svg">
          <text x="${x}" y="${y}" font-size="${emojiSize}px" text-anchor="${pos === 'center' ? 'middle' : 'start'}">
            ${emoji}
          </text>
        </svg>
      `;

      composites.push({
        input: Buffer.from(svgEmoji),
        top: 0,
        left: 0,
      });
    }

    // Apply any composite overlays
    let compositePipeline = sharp(buffer);
    if (composites.length > 0) {
      compositePipeline = compositePipeline.composite(composites);
    }

    // 6. Target sizing (WhatsApp / Telegram 512x512 standard or Discord 128x128)
    const targetSize = settings.targetSize !== undefined ? settings.targetSize : 512;
    const bgOpt =
      settings.canvasBackground && settings.canvasBackground.type === 'solid' && settings.canvasBackground.color
        ? settings.canvasBackground.color
        : { r: 0, g: 0, b: 0, alpha: 0 };

    if (targetSize > 0) {
      compositePipeline = compositePipeline.resize({
        width: targetSize,
        height: targetSize,
        fit: 'contain',
        background: bgOpt,
      });
    }

    if (settings.canvasBackground && settings.canvasBackground.type === 'solid' && settings.canvasBackground.color) {
      compositePipeline = compositePipeline.flatten({ background: settings.canvasBackground.color });
    }

    // 7. Format conversion (webp or png)
    const format = settings.exportFormat === 'png' ? 'png' : 'webp';
    let finalBuffer: Buffer;

    if (format === 'webp') {
      finalBuffer = await compositePipeline
        .webp({
          quality: 90,
          lossless: false,
          alphaQuality: 100,
        })
        .toBuffer();
    } else {
      finalBuffer = await compositePipeline
        .png({
          compressionLevel: 8,
          adaptiveFiltering: true,
        })
        .toBuffer();
    }

    const finalMeta = await sharp(finalBuffer).metadata();
    return {
      buffer: finalBuffer,
      format,
      width: finalMeta.width || targetSize || curWidth,
      height: finalMeta.height || targetSize || curHeight,
      fileSize: finalBuffer.length,
    };
  }
}

export const imageService = new ImageService();
