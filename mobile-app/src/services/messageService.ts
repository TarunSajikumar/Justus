import { api } from './api';

export interface ChatMessage {
  id: string;
  couple_id?: string;
  sender_id: string;
  message: string;
  read: boolean;
  created_at: string;
  status?: 'sent' | 'delivered' | 'read';
  media_url?: string;
  media_type?: 'photo' | 'video';
  reaction?: string | null;
  reply_to?: string | null;
  isTemp?: boolean;
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
  sendMessage: async (
    partnerId: string,
    message: string,
    replyToId?: string | null
  ): Promise<ChatMessage> => {
    const response = await api.post('/messages', {
      partnerId,
      message,
      reply_to: replyToId || null,
    });
    return response.data.message;
  },

  /**
   * POST /api/messages/media
   * Upload and send a media message.
   */
  sendMedia: async (
    partnerId: string,
    uri: string,
    mediaType: 'photo' | 'video'
  ): Promise<ChatMessage> => {
    const formData = new FormData();
    formData.append('partnerId', partnerId);
    formData.append('mediaType', mediaType);
    const filename = uri.split('/').pop() || `media_${Date.now()}`;
    const mimeType = mediaType === 'photo' ? 'image/jpeg' : 'video/mp4';
    formData.append('file', { uri, name: filename, type: mimeType } as any);

    const response = await api.post('/messages/media', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.message;
  },

  /**
   * PATCH /api/messages/:partnerId/read
   * Marks all messages from partner as read.
   */
  markAsRead: async (partnerId: string): Promise<void> => {
    await api.patch(`/messages/${partnerId}/read`);
  },

  /**
   * @deprecated Use markAsRead instead
   */
  markRead: async (partnerId: string): Promise<void> => {
    await api.patch(`/messages/${partnerId}/read`);
  },

  /**
   * DELETE /api/messages/:messageId
   * Deletes a message for everyone.
   */
  deleteMessage: async (messageId: string): Promise<void> => {
    await api.delete(`/messages/${messageId}`);
  },

  /**
   * GET /api/messages/search
   * Search messages by query.
   */
  searchMessages: async (partnerId: string, query: string): Promise<ChatMessage[]> => {
    const response = await api.get('/messages/search', {
      params: { partnerId, q: query },
    });
    return response.data.messages ?? [];
  },

  /**
   * POST /api/messages/:messageId/reaction
   * Add or remove an emoji reaction to a message.
   */
  addReaction: async (messageId: string, reaction: string): Promise<void> => {
    await api.post(`/messages/${messageId}/reaction`, { reaction });
  },
};
