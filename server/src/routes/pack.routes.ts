import { Router } from 'express';
import {
  packController,
  createPackSchema,
  addStickerSchema,
} from '../controllers/pack.controller';
import { requireAuth, optionalAuth } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { heavyProcessingLimiter } from '../middleware/rateLimit.middleware';

const router = Router();

router.get('/', requireAuth, (req, res) => packController.getPacks(req, res));
router.post('/', requireAuth, validateBody(createPackSchema), (req, res) => packController.createPack(req, res));
router.get('/:id', optionalAuth, (req, res) => packController.getPackById(req, res));
router.post('/:id/stickers', requireAuth, validateBody(addStickerSchema), (req, res) => packController.addStickerToPack(req, res));
router.delete('/:id/stickers/:stickerId', requireAuth, (req, res) => packController.removeStickerFromPack(req, res));
router.delete('/:id', requireAuth, (req, res) => packController.deletePack(req, res));

// Download entire pack as ZIP
router.get('/:id/download', heavyProcessingLimiter, (req, res) => packController.downloadPack(req, res));

export default router;
