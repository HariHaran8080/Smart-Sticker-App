import { api } from './api';
import { User } from '../types';

export const authService = {
  async register(data: { name: string; email: string; password: string }): Promise<{ user: User; token: string }> {
    const res = await api.post('/api/auth/register', data);
    if (res.data.data?.token) {
      localStorage.setItem('stickerforge_token', res.data.data.token);
    }
    return res.data.data;
  },

  async login(data: { email: string; password: string }): Promise<{ user: User; token: string }> {
    const res = await api.post('/api/auth/login', data);
    if (res.data.data?.token) {
      localStorage.setItem('stickerforge_token', res.data.data.token);
    }
    return res.data.data;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/api/auth/logout');
    } finally {
      localStorage.removeItem('stickerforge_token');
    }
  },

  async getMe(): Promise<User | null> {
    try {
      const res = await api.get('/api/auth/me');
      return res.data.data.user;
    } catch {
      localStorage.removeItem('stickerforge_token');
      return null;
    }
  },
};
