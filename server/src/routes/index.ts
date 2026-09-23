import { Router } from 'express';
import authRoutes from './auth.routes';
import imageRoutes from './image.routes';
import stickerRoutes from './sticker.routes';
import packRoutes from './pack.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/images', imageRoutes);
router.use('/stickers', stickerRoutes);
router.use('/packs', packRoutes);

export default router;
