import { Router } from 'express';
import { login, verifyOtp, getProfile } from '../controllers/authController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.post('/login', login);
router.post('/verify', verifyOtp);
router.get('/profile', authenticateToken, getProfile);

export default router;
