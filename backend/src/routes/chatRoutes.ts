import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Mock endpoint for message history
router.get('/messages/:partnerId', authenticateToken, (req, res) => {
  res.json([]);
});

export default router;
