import { Response } from 'express';
import { supabase } from '../config/supabase';

/**
 * POST /api/invite/generate
 * Creates a unique 6-char invite code stored in the `invites` table.
 */
export const generateInviteCode = async (req: any, res: Response) => {
  const userId: string = req.user?.userId;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const code = Math.random().toString(36).substring(2, 8).toUpperCase();

  // Invalidate any previous pending invites from this user
  await supabase
    .from('invites')
    .update({ status: 'cancelled' })
    .eq('created_by', userId)
    .eq('status', 'pending');

  const { data: invite, error } = await supabase
    .from('invites')
    .insert({ code, created_by: userId, status: 'pending' })
    .select()
    .single();

  if (error) {
    console.error('generateInviteCode error:', error);
    return res.status(500).json({ message: 'Error generating invite code' });
  }

  return res.json({ inviteCode: invite.code });
};

/**
 * POST /api/invite/join
 * Body: { inviteCode: string }
 * Validates the code, marks it used, and links both users as partners.
 */
export const joinPartner = async (req: any, res: Response) => {
  const userId: string = req.user?.userId;
  const { inviteCode } = req.body;

  if (!userId) return res.status(401).json({ message: 'Unauthorized' });
  if (!inviteCode) return res.status(400).json({ message: 'inviteCode is required' });

  // 1. Find the pending invite
  const { data: invite, error: inviteError } = await supabase
    .from('invites')
    .select('id, created_by, status')
    .eq('code', inviteCode.toUpperCase())
    .eq('status', 'pending')
    .single();

  if (inviteError || !invite) {
    return res.status(404).json({ message: 'Invalid or expired invite code' });
  }

  if (invite.created_by === userId) {
    return res.status(400).json({ message: 'You cannot use your own invite code' });
  }

  const partnerId: string = invite.created_by;

  // 2. Mark invite as used
  const { error: updateInviteError } = await supabase
    .from('invites')
    .update({ status: 'used', used_by: userId })
    .eq('id', invite.id);

  if (updateInviteError) {
    console.error('invite update error:', updateInviteError);
    return res.status(500).json({ message: 'Failed to process invite' });
  }

  // 3. Link both users to each other as partners
  const [r1, r2] = await Promise.all([
    supabase.from('users').update({ partner_id: partnerId }).eq('id', userId),
    supabase.from('users').update({ partner_id: userId }).eq('id', partnerId),
  ]);

  if (r1.error || r2.error) {
    console.error('user link errors:', r1.error, r2.error);
    return res.status(500).json({ message: 'Failed to link partners' });
  }

  // 4. Return partner info
  const { data: partner } = await supabase
    .from('users')
    .select('id, name, email, phone')
    .eq('id', partnerId)
    .single();

  return res.json({
    message: 'Successfully connected with your partner! 💑',
    partner,
  });
};
