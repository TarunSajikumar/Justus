import { Router } from 'express';
import {
  getTimelineEvents,
  createTimelineEvent,
  updateTimelineEvent,
  deleteTimelineEvent,
} from '../controllers/timeline.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authMiddleware, getTimelineEvents);
router.post('/', authMiddleware, createTimelineEvent);
router.put('/:id', authMiddleware, updateTimelineEvent);
router.delete('/:id', authMiddleware, deleteTimelineEvent);

export default router;
