import { api } from './api';
import { Sticker, StickerSettings } from '../types';

export interface CreateStickerPayload {
  originalUrl: string;
  processedUrl?: string;
  name?: string;
  settings: StickerSettings;
}

export interface GeneratedStickerResponse {
  id?: string;
  name: string;
  stickerUrl: string;
  downloadUrl: string;
  format: 'png' | 'webp';
  width: number;
  height: number;
  fileSize: number;
  settings: StickerSettings;
  savedToAccount: boolean;
}

export const stickerService = {
  async removeBackground(imageUrl: string): Promise<{ processedUrl: string; provider: string }> {
    const res = await api.post('/api/stickers/remove-background', { imageUrl });
    return res.data.data;
  },

  async createSticker(payload: CreateStickerPayload): Promise<GeneratedStickerResponse> {
    const res = await api.post('/api/stickers/create', payload);
    return res.data.data;
  },

  async saveSticker(data: any): Promise<Sticker> {
    const res = await api.post('/api/stickers/save', data);
    return res.data.data;
  },

  async getStickers(): Promise<Sticker[]> {
    const res = await api.get('/api/stickers');
    return res.data.data;
  },

  async getStickerById(id: string): Promise<Sticker> {
    const res = await api.get(`/api/stickers/${id}`);
    return res.data.data;
  },

  async deleteSticker(id: string): Promise<void> {
    await api.delete(`/api/stickers/${id}`);
  },

  /**
   * Helper to trigger a direct download in browser
   */
  triggerDownload(url: string, filename: string) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  },
};
