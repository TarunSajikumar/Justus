import { api } from './api';
import * as FileSystem from 'expo-file-system';

export interface Memory {
  id: string;
  couple_id: string;
  image_url: string;
  caption: string | null;
  created_at: string;
}

export const memoryService = {
  /**
   * GET /api/memories/:coupleId
   * Returns all memories for the couple, newest first.
   */
  getMemories: async (coupleId: string): Promise<Memory[]> => {
    const response = await api.get(`/memories/${coupleId}`);
    return response.data.memories ?? [];
  },

  /**
   * Upload a memory photo + caption.
   * Reads the local image URI → converts to base64 → POST to backend.
   */
  uploadMemory: async (coupleId: string, imageUri: string, caption: string): Promise<Memory> => {
    // Read image as base64
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Detect mime type from URI extension
    const ext = imageUri.split('.').pop()?.toLowerCase() || 'jpg';
    const mimeMap: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      heic: 'image/heic',
    };
    const mimeType = mimeMap[ext] || 'image/jpeg';

    const response = await api.post('/memories', {
      coupleId,
      imageBase64: base64,
      mimeType,
      caption,
    });

    return response.data.memory;
  },
};
