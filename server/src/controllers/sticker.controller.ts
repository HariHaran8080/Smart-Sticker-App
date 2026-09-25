import { Request, Response } from 'express';
import { z } from 'zod';
import { imageService } from '../services/image.service';
import { storageService } from '../services/storage.service';
import { backgroundRemovalService } from '../services/backgroundRemoval.service';
import { Sticker } from '../models/Sticker';
import { AuthRequest } from '../middleware/auth.middleware';
import { logger } from '../utils/logger';

export const removeBgSchema = z.object({
  imageUrl: z.string().min(1, 'imageUrl is required'),
});

export const createStickerSchema = z.object({
  originalUrl: z.string().min(1, 'originalUrl is required'),
  processedUrl: z.string().optional(),
  name: z.string().max(100).optional().default('My Sticker'),
  settings: z
    .object({
      crop: z
        .object({
          x: z.number(),
          y: z.number(),
          width: z.number(),
          height: z.number(),
        })
        .optional(),
      rotation: z.number().optional().default(0),
      scale: z.number().optional().default(1),
      position: z
        .object({
          x: z.number().default(0),
          y: z.number().default(0),
        })
        .optional(),
      outline: z
        .object({
          enabled: z.boolean().default(true),
          style: z.enum(['white', 'black', 'custom', 'soft', 'none']).default('white'),
          color: z.string().default('#ffffff'),
          width: z.number().default(8),
        })
        .optional(),
      text: z
        .object({
          content: z.string().default(''),
          fontSize: z.number().default(32),
          color: z.string().default('#ffffff'),
          bold: z.boolean().default(true),
          align: z.enum(['top', 'center', 'bottom', 'custom']).default('bottom'),
          x: z.number().optional(),
          y: z.number().optional(),
          fontFamily: z.string().optional(),
          strokeColor: z.string().optional(),
          strokeWidth: z.number().optional(),
          backgroundColor: z.string().optional(),
          stylePreset: z.string().optional(),
          customY: z.number().optional(),
        })
        .passthrough()
        .optional(),
      emoji: z
        .object({
          symbol: z.string().default(''),
          position: z.enum(['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center']).default('top-right'),
          size: z.number().default(48),
        })
        .passthrough()
        .optional(),
      exportFormat: z.enum(['png', 'webp']).default('webp'),
      targetSize: z.number().default(512),
    })
    .passthrough()
    .optional()
    .default({}),
});

export class StickerController {
  /**
   * Background removal endpoint
   */
  async removeBackground(req: Request, res: Response): Promise<void> {
    const { imageUrl } = req.body;

    try {
      const inputBuffer = await storageService.readFile(imageUrl);
      const result = await backgroundRemovalService.removeBackground(inputBuffer);
      const saved = await storageService.saveFile(result.buffer, 'processed', 'png');

      res.status(200).json({
        success: true,
        message: 'Background removed successfully',
        data: {
          processedUrl: saved.publicUrl,
          provider: result.providerUsed,
        },
      });
    } catch (err: any) {
      logger.error('Background removal failed:', err);
      res.status(500).json({
        success: false,
        message: `Background removal failed: ${err.message}`,
      });
    }
  }

  /**
   * Generate final sticker (applies outlines, text, emoji, transformations)
   */
  async createSticker(req: AuthRequest, res: Response): Promise<void> {
    const { originalUrl, processedUrl, name, settings } = req.body;

    try {
      // Prefer transparent processed cutout if available, else original
      const sourceUrl = processedUrl || originalUrl;
      const inputBuffer = await storageService.readFile(sourceUrl);

      const stickerResult = await imageService.buildSticker(inputBuffer, settings);
      const saved = await storageService.saveFile(
        stickerResult.buffer,
        'stickers',
        stickerResult.format
      );

      let savedStickerDoc = null;

      // If user is authenticated, persist to MongoDB
      if (req.userId) {
        savedStickerDoc = await Sticker.create({
          userId: req.userId,
          name: name || 'My Sticker',
          originalImage: originalUrl,
          processedImage: processedUrl || null,
          stickerImage: saved.publicUrl,
          format: stickerResult.format,
          width: stickerResult.width,
          height: stickerResult.height,
          fileSize: stickerResult.fileSize,
          settings,
        });
      }

      res.status(200).json({
        success: true,
        message: 'Sticker generated successfully',
        data: {
          id: savedStickerDoc ? savedStickerDoc._id : null,
          name: name || 'My Sticker',
          stickerUrl: saved.publicUrl,
          downloadUrl: `/api/stickers/${savedStickerDoc ? savedStickerDoc._id : 'temp'}/download?file=${encodeURIComponent(saved.publicUrl)}&name=${encodeURIComponent(name || 'sticker')}`,
          format: stickerResult.format,
          width: stickerResult.width,
          height: stickerResult.height,
          fileSize: stickerResult.fileSize,
          settings,
          savedToAccount: Boolean(savedStickerDoc),
        },
      });
    } catch (err: any) {
      logger.error('Sticker creation failed:', err);
      res.status(500).json({
        success: false,
        message: `Sticker creation failed: ${err.message}`,
      });
    }
  }

  /**
   * Save an existing generated sticker to user's account
   */
  async saveStickerToAccount(req: AuthRequest, res: Response): Promise<void> {
    if (!req.userId) {
      res.status(401).json({ success: false, message: 'Please log in to save stickers' });
      return;
    }

    const { name, originalUrl, processedUrl, stickerUrl, format, width, height, fileSize, settings } = req.body;

    try {
      const sticker = await Sticker.create({
        userId: req.userId,
        name: name || 'Saved Sticker',
        originalImage: originalUrl,
        processedImage: processedUrl || null,
        stickerImage: stickerUrl,
        format: format || 'webp',
        width: width || 512,
        height: height || 512,
        fileSize: fileSize || 0,
        settings: settings || {},
      });

      res.status(201).json({
        success: true,
        message: 'Sticker saved to your collection',
        data: sticker,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to save sticker', error: err.message });
    }
  }

  /**
   * Get user stickers
   */
  async getStickers(req: AuthRequest, res: Response): Promise<void> {
    if (!req.userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    try {
      const stickers = await Sticker.find({ userId: req.userId }).sort({ createdAt: -1 });
      res.json({
        success: true,
        data: stickers,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to load stickers', error: err.message });
    }
  }

  /**
   * Get sticker by ID
   */
  async getStickerById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const sticker = await Sticker.findById(req.params.id);
      if (!sticker) {
        res.status(404).json({ success: false, message: 'Sticker not found' });
        return;
      }

      res.json({
        success: true,
        data: sticker,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Error retrieving sticker', error: err.message });
    }
  }

  /**
   * Delete sticker
   */
  async deleteSticker(req: AuthRequest, res: Response): Promise<void> {
    if (!req.userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    try {
      const sticker = await Sticker.findOne({ _id: req.params.id, userId: req.userId });
      if (!sticker) {
        res.status(404).json({ success: false, message: 'Sticker not found or unauthorized' });
        return;
      }

      // Delete files from storage
      await storageService.deleteFile(sticker.stickerImage);
      if (sticker.processedImage) {
        await storageService.deleteFile(sticker.processedImage);
      }
      await storageService.deleteFile(sticker.originalImage);

      await sticker.deleteOne();

      res.json({
        success: true,
        message: 'Sticker deleted successfully',
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to delete sticker', error: err.message });
    }
  }

  /**
   * Direct download endpoint for a sticker
   */
  async downloadSticker(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    let filePath: string | null = null;
    let fileName: string = 'sticker';
    let format: string = 'webp';

    try {
      if (id !== 'temp') {
        const sticker = await Sticker.findById(id);
        if (sticker) {
          filePath = sticker.stickerImage;
          fileName = sticker.name;
          format = sticker.format;
        }
      }

      // Fallback query parameters for guest downloads
      if (!filePath && req.query.file) {
        filePath = req.query.file as string;
        fileName = (req.query.name as string) || 'sticker';
        format = filePath.endsWith('.png') ? 'png' : 'webp';
      }

      if (!filePath) {
        res.status(404).json({ success: false, message: 'Sticker file not found' });
        return;
      }

      const buffer = await storageService.readFile(filePath);
      const safeName = fileName.toLowerCase().replace(/[^a-z0-9_-]/g, '_');

      res.setHeader('Content-Disposition', `attachment; filename="${safeName}.${format}"`);
      res.setHeader('Content-Type', format === 'png' ? 'image/png' : 'image/webp');
      res.send(buffer);
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Error downloading sticker', error: err.message });
    }
  }
}

export const stickerController = new StickerController();
