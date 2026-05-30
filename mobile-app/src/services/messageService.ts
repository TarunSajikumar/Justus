import { api } from './api';

export interface ChatMessage {
  id: string;
  couple_id: string;
  sender_id: string;
  message: string;
  read: boolean;
  created_at: string;
}

export const messageService = {
  /**
   * GET /api/messages/:partnerId
   * Returns chat history with the partner (oldest first).
   */
  getHistory: async (partnerId: string, before?: string): Promise<ChatMessage[]> => {
    const params: any = { limit: 50 };
    if (before) params.before = before;
    const response = await api.get(`/messages/${partnerId}`, { params });
    return response.data.messages ?? [];
  },

  /**
   * POST /api/messages
   * Persists a new message to the database.
   */
  sendMessage: async (partnerId: string, message: string): Promise<ChatMessage> => {
    const response = await api.post('/messages', { partnerId, message });
    return response.data.message;
  },

  /**
   * PATCH /api/messages/:partnerId/read
   * Marks all messages from partner as read.
   */
  markRead: async (partnerId: string): Promise<void> => {
    await api.patch(`/messages/${partnerId}/read`);
  },
};
