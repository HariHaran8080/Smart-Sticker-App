import { Request, Response } from 'express';
import { z } from 'zod';
import { imageService } from '../services/image.service';
import { storageService } from '../services/storage.service';
import { safeFetchImage, SSRFError } from '../services/ssrf.service';
import { logger } from '../utils/logger';

export const urlSchema = z.object({
  url: z.string().url('Please provide a valid URL'),
});

export class ImageController {
  async uploadImage(req: Request, res: Response): Promise<void> {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No image file uploaded' });
      return;
    }

    try {
      const normalized = await imageService.normalizeImage(req.file.buffer);
      const ext = normalized.format === 'jpeg' ? 'jpg' : normalized.format;

      const stored = await storageService.saveFile(normalized.buffer, 'originals', ext);

      res.status(200).json({
        success: true,
        message: 'Image uploaded and processed successfully',
        data: {
          url: stored.publicUrl,
          width: normalized.width,
          height: normalized.height,
          format: normalized.format,
          size: normalized.buffer.length,
          originalName: req.file.originalname,
        },
      });
    } catch (err: any) {
      logger.error('Error processing uploaded image:', err);
      res.status(400).json({
        success: false,
        message: `Failed to process image: ${err.message}`,
      });
    }
  }

  async fetchFromUrl(req: Request, res: Response): Promise<void> {
    const { url } = req.body;

    try {
      const fetched = await safeFetchImage(url);
      const normalized = await imageService.normalizeImage(fetched.buffer);
      const ext = normalized.format === 'jpeg' ? 'jpg' : normalized.format;

      const stored = await storageService.saveFile(normalized.buffer, 'originals', ext);

      res.status(200).json({
        success: true,
        message: 'Image fetched successfully from URL',
        data: {
          url: stored.publicUrl,
          width: normalized.width,
          height: normalized.height,
          format: normalized.format,
          size: normalized.buffer.length,
        },
      });
    } catch (err: any) {
      logger.warn(`Fetch image from URL error for ${url}:`, err.message);
      if (err instanceof SSRFError) {
        res.status(400).json({
          success: false,
          message: err.message,
        });
        return;
      }
      res.status(400).json({
        success: false,
        message: `Unable to retrieve image from provided URL: ${err.message}`,
      });
    }
  }
}

export const imageController = new ImageController();
