import { api, getAssetUrl } from './api';
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
   * Helper to trigger a direct download in browser.
   * Resolves the full backend URL and fetches the binary Blob, preventing Vercel SPA routing
   * from returning an HTML white screen.
   */
  async triggerDownload(url: string, filename: string): Promise<void> {
    const fullUrl = getAssetUrl(url);

    try {
      const token = localStorage.getItem('stickerforge_token');
      const headers: Record<string, string> = {
        Accept: 'image/png, image/webp, image/*, */*',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(fullUrl, { headers });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Failed to download sticker file`);
      }

      const blob = await res.blob();
      const mimeType = filename.toLowerCase().endsWith('.png') ? 'image/png' : 'image/webp';
      const fileBlob = new Blob([blob], { type: mimeType });
      const objectUrl = window.URL.createObjectURL(fileBlob);

      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setTimeout(() => window.URL.revokeObjectURL(objectUrl), 3000);
    } catch (err) {
      console.warn('Direct blob download failed, falling back to anchor navigation:', err);
      const a = document.createElement('a');
      a.href = fullUrl;
      a.download = filename;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  },
};
