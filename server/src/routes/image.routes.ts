import { Router } from 'express';
import { imageController, urlSchema } from '../controllers/image.controller';
import { uploadMiddleware } from '../middleware/upload.middleware';
import { validateBody } from '../middleware/validate.middleware';

const router = Router();

router.post('/upload', uploadMiddleware.single('image'), (req, res) => imageController.uploadImage(req, res));
router.post('/from-url', validateBody(urlSchema), (req, res) => imageController.fetchFromUrl(req, res));

export default router;
