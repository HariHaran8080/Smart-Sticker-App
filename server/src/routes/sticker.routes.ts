import { Router } from 'express';
import {
  stickerController,
  removeBgSchema,
  createStickerSchema,
} from '../controllers/sticker.controller';
import { optionalAuth, requireAuth } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { heavyProcessingLimiter } from '../middleware/rateLimit.middleware';

const router = Router();

// Background removal
router.post(
  '/remove-background',
  heavyProcessingLimiter,
  validateBody(removeBgSchema),
  (req, res) => stickerController.removeBackground(req, res)
);

// Create sticker (open to guests, or saves directly if logged in)
router.post(
  '/create',
  heavyProcessingLimiter,
  optionalAuth,
  validateBody(createStickerSchema),
  (req, res) => stickerController.createSticker(req, res)
);

// Save generated sticker explicitly to account
router.post('/save', requireAuth, (req, res) => stickerController.saveStickerToAccount(req, res));

// User stickers
router.get('/', requireAuth, (req, res) => stickerController.getStickers(req, res));
router.get('/:id', optionalAuth, (req, res) => stickerController.getStickerById(req, res));
router.delete('/:id', requireAuth, (req, res) => stickerController.deleteSticker(req, res));

// Download
router.get('/:id/download', (req, res) => stickerController.downloadSticker(req, res));

export default router;
