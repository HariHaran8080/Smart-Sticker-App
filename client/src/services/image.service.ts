import { api } from './api';

export interface ImageUploadResponse {
  url: string;
  width: number;
  height: number;
  format: string;
  size: number;
  originalName?: string;
}

export const imageService = {
  async uploadImage(file: File): Promise<ImageUploadResponse> {
    const formData = new FormData();
    formData.append('image', file);

    const res = await api.post('/api/images/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data.data;
  },

  async fetchFromUrl(url: string): Promise<ImageUploadResponse> {
    const res = await api.post('/api/images/from-url', { url });
    return res.data.data;
  },
};
