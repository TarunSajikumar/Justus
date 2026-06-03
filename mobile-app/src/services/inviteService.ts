import { api } from './api';
import { authService } from './authService';

export const inviteService = {
  /**
   * POST /api/invite/create
   * Returns the 6-char invite code string.
   */
  createInvite: async (): Promise<string> => {
    const response = await api.post('/invite/create');
    return response.data.code;
  },

  /**
   * GET /api/invite/my-invites
   * Returns a list of invites created by the current user.
   */
  getMyInvites: async () => {
    const response = await api.get('/invite/my-invites');
    return response.data;
  },

  /**
   * POST /api/invite/join
   * Validates invite code, creates couple, links both users.
   */
  joinInvite: async (inviteCode: string) => {
    const response = await api.post('/invite/join', { inviteCode });
    // After joining, refresh the profile to get all linked data
    await authService.me();
    return response.data;
  },
};
