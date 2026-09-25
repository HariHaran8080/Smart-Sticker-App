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
      // Primary: Use axios api instance with configured base URL and authentication
      const res = await api.get(url, {
        responseType: 'blob',
        headers: {
          Accept: 'image/png, image/webp, image/*, */*',
        },
      });

      const blob: Blob = res.data;

      // Fail-safe validation: Ensure the downloaded blob is NOT an HTML error/fallback page
      if (blob.type && blob.type.includes('text/html')) {
        throw new Error('Server returned an HTML page instead of an image.');
      }

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
    } catch (err: any) {
      console.warn('Axios blob download failed, trying fetch fallback:', err);
      // Secondary fallback via direct fetch with full backend URL
      const fetchRes = await fetch(fullUrl, {
        headers: {
          Accept: 'image/png, image/webp, image/*, */*',
        },
      });

      if (!fetchRes.ok) {
        throw new Error(`Download failed with status ${fetchRes.status}`);
      }

      const blob = await fetchRes.blob();
      if (blob.type && blob.type.includes('text/html')) {
        throw new Error('Received HTML response instead of image');
      }

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
    }
  },
};
