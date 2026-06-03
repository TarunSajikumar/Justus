import { Router } from 'express';
import {
  getMessages,
  createMessage,
  markMessagesRead,
  deleteMessage,
  searchMessages,
  addReaction,
} from '../controllers/messages.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// NOTE: /search must be declared before /:partnerId to avoid route conflicts
router.get('/search', authMiddleware, searchMessages);
router.get('/:partnerId', authMiddleware, getMessages);
router.post('/', authMiddleware, createMessage);
router.patch('/:partnerId/read', authMiddleware, markMessagesRead);
router.delete('/:messageId', authMiddleware, deleteMessage);
router.post('/:messageId/reaction', authMiddleware, addReaction);

export default router;
