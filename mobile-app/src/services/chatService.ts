import { api } from './api';

export const chatService = {
  /**
   * GET /api/chat/messages/:partnerId
   * Full message history between current user and partner, oldest first.
   */
  getMessages: async (partnerId: string) => {
    const response = await api.get(`/chat/messages/${partnerId}`);
    return response.data;
  },

  /**
   * PATCH /api/chat/messages/:partnerId/read
   * Mark all messages from partner as read.
   */
  markRead: async (partnerId: string) => {
    const response = await api.patch(`/chat/messages/${partnerId}/read`);
    return response.data;
  },
};
