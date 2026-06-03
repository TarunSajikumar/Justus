import { api } from './api';

export interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  type: 'milestone' | 'memory' | 'date' | 'custom';
  created_at: string;
  updated_at?: string;
}

export const timelineService = {
  /**
   * GET /api/timeline
   * Fetch all timeline events for the couple.
   */
  getEvents: async (type?: string): Promise<TimelineEvent[]> => {
    const params: any = {};
    if (type) params.type = type;
    const response = await api.get('/timeline', { params });
    return response.data.events ?? [];
  },

  /**
   * POST /api/timeline
   * Create a new timeline event.
   */
  createEvent: async (data: {
    title: string;
    description?: string;
    date: string;
    type: 'milestone' | 'memory' | 'date' | 'custom';
  }): Promise<TimelineEvent> => {
    const response = await api.post('/timeline', data);
    return response.data.event;
  },

  /**
   * PUT /api/timeline/:id
   * Update a timeline event.
   */
  updateEvent: async (
    id: string,
    data: {
      title?: string;
      description?: string;
      date?: string;
      type?: 'milestone' | 'memory' | 'date' | 'custom';
    }
  ): Promise<TimelineEvent> => {
    const response = await api.put(`/timeline/${id}`, data);
    return response.data.event;
  },

  /**
   * DELETE /api/timeline/:id
   * Delete a timeline event.
   */
  deleteEvent: async (id: string): Promise<void> => {
    await api.delete(`/timeline/${id}`);
  },
};
