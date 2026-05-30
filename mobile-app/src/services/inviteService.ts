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
   * POST /api/invite/join
   * Validates invite code, creates couple, links both users.
   */
  joinInvite: async (inviteCode: string) => {
    const response = await api.post('/invite/join', { inviteCode });
    // After joining, it's best to refresh the profile to get all linked data
    // This updates the Zustand store automatically via authService.me()
    await authService.me();
    return response.data;
  },
};
