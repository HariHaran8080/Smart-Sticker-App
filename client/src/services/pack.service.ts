import { api } from './api';
import { StickerPack } from '../types';

export const packService = {
  async getPacks(): Promise<StickerPack[]> {
    const res = await api.get('/api/packs');
    return res.data.data;
  },

  async createPack(data: { name: string; description?: string; stickers?: string[] }): Promise<StickerPack> {
    const res = await api.post('/api/packs', data);
    return res.data.data;
  },

  async getPackById(id: string): Promise<StickerPack> {
    const res = await api.get(`/api/packs/${id}`);
    return res.data.data;
  },

  async addStickerToPack(packId: string, stickerId: string): Promise<StickerPack> {
    const res = await api.post(`/api/packs/${packId}/stickers`, { stickerId });
    return res.data.data;
  },

  async removeStickerFromPack(packId: string, stickerId: string): Promise<StickerPack> {
    const res = await api.delete(`/api/packs/${packId}/stickers/${stickerId}`);
    return res.data.data;
  },

  async deletePack(id: string): Promise<void> {
    await api.delete(`/api/packs/${id}`);
  },

  getPackDownloadUrl(packId: string): string {
    return `/api/packs/${packId}/download`;
  },
};
