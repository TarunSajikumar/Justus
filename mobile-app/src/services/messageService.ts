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
   * GET /api/messages/:coupleId
   * Returns chat history for the couple (oldest first).
   */
  getHistory: async (coupleId: string, before?: string): Promise<ChatMessage[]> => {
    const params: any = { limit: 50 };
    if (before) params.before = before;
    const response = await api.get(`/messages/${coupleId}`, { params });
    return response.data.messages ?? [];
  },

  /**
   * POST /api/messages
   * Persists a new message to the database.
   */
  sendMessage: async (coupleId: string, message: string): Promise<ChatMessage> => {
    const response = await api.post('/messages', { coupleId, message });
    return response.data.message;
  },
};
