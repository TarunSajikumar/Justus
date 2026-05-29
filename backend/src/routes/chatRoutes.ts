import { Router, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { supabase } from '../config/supabase';

const router = Router();

/**
 * GET /api/chat/messages/:partnerId
 * Returns full message history between the logged-in user and their partner,
 * ordered oldest → newest.
 */
router.get('/messages/:partnerId', authMiddleware, async (req: any, res: Response) => {
  const userId: string = req.userId;
  const { partnerId } = req.params;

  const { data: messages, error } = await supabase
    .from('messages')
    .select('id, sender_id, receiver_id, message, read, created_at')
    .or(
      `and(sender_id.eq.${userId},receiver_id.eq.${partnerId}),` +
      `and(sender_id.eq.${partnerId},receiver_id.eq.${userId})`
    )
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Failed to fetch messages:', error);
    return res.status(500).json({ message: 'Failed to load messages' });
  }

  return res.json(messages);
});

/**
 * PATCH /api/chat/messages/:partnerId/read
 * Marks all unread messages FROM the partner TO the current user as read.
 */
router.patch('/messages/:partnerId/read', authMiddleware, async (req: any, res: Response) => {
  const userId: string = req.userId;
  const { partnerId } = req.params;

  const { error } = await supabase
    .from('messages')
    .update({ read: true })
    .eq('sender_id', partnerId)
    .eq('receiver_id', userId)
    .eq('read', false);

  if (error) {
    console.error('Failed to mark messages as read:', error);
    return res.status(500).json({ message: 'Failed to mark messages as read' });
  }

  return res.json({ message: 'Messages marked as read' });
});

export default router;
