import { Response } from 'express';
import { z } from 'zod';
import { StickerPack } from '../models/StickerPack';
import { Sticker } from '../models/Sticker';
import { zipService } from '../services/zip.service';
import { AuthRequest } from '../middleware/auth.middleware';

export const createPackSchema = z.object({
  name: z.string().min(1, 'Pack name is required').max(100),
  description: z.string().max(300).optional(),
  stickers: z.array(z.string()).optional().default([]),
});

export const addStickerSchema = z.object({
  stickerId: z.string().min(1, 'Sticker ID is required'),
});

export class PackController {
  async getPacks(req: AuthRequest, res: Response): Promise<void> {
    if (!req.userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    try {
      const packs = await StickerPack.find({ userId: req.userId })
        .populate('stickers')
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        data: packs,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch packs', error: err.message });
    }
  }

  async createPack(req: AuthRequest, res: Response): Promise<void> {
    if (!req.userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { name, description, stickers } = req.body;

    try {
      const pack = await StickerPack.create({
        userId: req.userId,
        name,
        description: description || '',
        stickers: stickers || [],
      });

      const populated = await pack.populate('stickers');

      res.status(201).json({
        success: true,
        message: 'Sticker pack created successfully',
        data: populated,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to create pack', error: err.message });
    }
  }

  async getPackById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const pack = await StickerPack.findById(req.params.id).populate('stickers');
      if (!pack) {
        res.status(404).json({ success: false, message: 'Pack not found' });
        return;
      }

      res.json({
        success: true,
        data: pack,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to get pack', error: err.message });
    }
  }

  async addStickerToPack(req: AuthRequest, res: Response): Promise<void> {
    if (!req.userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { stickerId } = req.body;

    try {
      const pack = await StickerPack.findOne({ _id: req.params.id, userId: req.userId });
      if (!pack) {
        res.status(404).json({ success: false, message: 'Pack not found or unauthorized' });
        return;
      }

      // Check if sticker exists
      const sticker = await Sticker.findById(stickerId);
      if (!sticker) {
        res.status(404).json({ success: false, message: 'Sticker not found' });
        return;
      }

      // Avoid duplicates
      const exists = pack.stickers.some((s: any) => s.toString() === stickerId);
      if (!exists) {
        pack.stickers.push(stickerId as any);
        await pack.save();
      }

      const updated = await StickerPack.findById(pack._id).populate('stickers');

      res.json({
        success: true,
        message: 'Sticker added to pack',
        data: updated,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to add sticker to pack', error: err.message });
    }
  }

  async removeStickerFromPack(req: AuthRequest, res: Response): Promise<void> {
    if (!req.userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { id, stickerId } = req.params;

    try {
      const pack = await StickerPack.findOne({ _id: id, userId: req.userId });
      if (!pack) {
        res.status(404).json({ success: false, message: 'Pack not found' });
        return;
      }

      pack.stickers = pack.stickers.filter((s: any) => s.toString() !== stickerId);
      await pack.save();

      const updated = await StickerPack.findById(pack._id).populate('stickers');

      res.json({
        success: true,
        message: 'Sticker removed from pack',
        data: updated,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to remove sticker', error: err.message });
    }
  }

  async deletePack(req: AuthRequest, res: Response): Promise<void> {
    if (!req.userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    try {
      const pack = await StickerPack.findOneAndDelete({ _id: req.params.id, userId: req.userId });
      if (!pack) {
        res.status(404).json({ success: false, message: 'Pack not found or unauthorized' });
        return;
      }

      res.json({
        success: true,
        message: 'Pack deleted successfully',
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to delete pack', error: err.message });
    }
  }

  async downloadPack(req: AuthRequest, res: Response): Promise<void> {
    try {
      const pack = await StickerPack.findById(req.params.id).populate('stickers');
      if (!pack) {
        res.status(404).json({ success: false, message: 'Pack not found' });
        return;
      }

      if (!pack.stickers || pack.stickers.length === 0) {
        res.status(400).json({ success: false, message: 'This pack contains no stickers yet' });
        return;
      }

      const stickers = pack.stickers as any[];
      await zipService.streamPackZip(pack.name, stickers, res);
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to download pack', error: err.message });
    }
  }
}

export const packController = new PackController();
