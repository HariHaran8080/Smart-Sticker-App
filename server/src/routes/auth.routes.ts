import { Router } from 'express';
import { authController, registerSchema, loginSchema } from '../controllers/auth.controller';
import { validateBody } from '../middleware/validate.middleware';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', validateBody(registerSchema), (req, res) => authController.register(req, res));
router.post('/login', validateBody(loginSchema), (req, res) => authController.login(req, res));
router.post('/logout', (req, res) => authController.logout(req, res));
router.get('/me', requireAuth, (req, res) => authController.getMe(req, res));

export default router;
