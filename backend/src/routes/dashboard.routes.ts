import { Router, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { supabase } from '../config/supabase';

const router = Router();

/**
 * GET /api/dashboard
 * Returns the logged-in user's profile, their partner (if linked),
 * the last 10 messages, and unread count.
 */
router.get('/', authMiddleware, async (req: any, res: Response) => {
  const userId: string = req.userId;

  // 1. Fetch current user
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, name, email, phone, partner_id, created_at')
    .eq('id', userId)
    .single();

  if (userError || !user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // 2. Fetch partner (if linked)
  let partner = null;
  if (user.partner_id) {
    const { data: partnerData } = await supabase
      .from('users')
      .select('id, name, email, phone')
      .eq('id', user.partner_id)
      .single();
    partner = partnerData;
  }

  // 3. Fetch last 10 messages (both directions)
  let recentMessages: any[] = [];
  let unreadCount = 0;

  if (user.partner_id) {
    const { data: messages } = await supabase
      .from('messages')
      .select('id, sender_id, receiver_id, message, read, created_at')
      .or(
        `and(sender_id.eq.${userId},receiver_id.eq.${user.partner_id}),` +
        `and(sender_id.eq.${user.partner_id},receiver_id.eq.${userId})`
      )
      .order('created_at', { ascending: false })
      .limit(10);

    recentMessages = (messages ?? []).reverse(); // oldest first for display

    // 4. Unread count — messages FROM partner that I haven't read
    const { count } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('sender_id', user.partner_id)
      .eq('receiver_id', userId)
      .eq('read', false);

    unreadCount = count ?? 0;
  }

  return res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      createdAt: user.created_at,
    },
    partner,
    recentMessages,
    unreadCount,
  });
});

export default router;
