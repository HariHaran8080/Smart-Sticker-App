import archiver from 'archiver';
import { Response } from 'express';
import { storageService } from './storage.service';
import { ISticker } from '../types';
import { logger } from '../utils/logger';

export class ZipService {
  /**
   * Streams a ZIP containing the pack stickers directly to the HTTP response
   */
  async streamPackZip(packName: string, stickers: ISticker[], res: Response): Promise<void> {
    const archive = archiver('zip', {
      zlib: { level: 9 }, // Maximum compression
    });

    const safePackName = packName.toLowerCase().replace(/[^a-z0-9_-]/g, '_') || 'sticker-pack';
    res.attachment(`${safePackName}.zip`);
    res.setHeader('Content-Type', 'application/zip');

    archive.on('warning', (err) => {
      logger.warn('Archiver warning:', err);
    });

    archive.on('error', (err) => {
      logger.error('Archiver error:', err);
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: 'Failed to generate ZIP archive' });
      }
    });

    archive.pipe(res);

    for (let i = 0; i < stickers.length; i++) {
      const sticker = stickers[i];
      try {
        const fileBuffer = await storageService.readFile(sticker.stickerImage);
        const ext = sticker.format || 'webp';
        const safeStickerName = (sticker.name || `sticker_${i + 1}`).toLowerCase().replace(/[^a-z0-9_-]/g, '_');
        const filename = `${String(i + 1).padStart(2, '0')}_${safeStickerName}.${ext}`;

        archive.append(fileBuffer, { name: filename });
      } catch (err: any) {
        logger.warn(`Skipping missing sticker file ${sticker.stickerImage}: ${err.message}`);
      }
    }

    await archive.finalize();
  }
}

export const zipService = new ZipService();
