import { Router } from 'express';
import { generateInviteCode, joinPartner } from '../controllers/inviteController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.post('/generate', authenticateToken, generateInviteCode);
router.post('/join', authenticateToken, joinPartner);

export default router;
