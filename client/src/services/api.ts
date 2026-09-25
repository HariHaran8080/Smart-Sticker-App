import axios from 'axios';

const rawBaseUrl = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? 'https://smart-sticker-app-7u16.onrender.com' : '')
).trim().replace(/\/$/, '');

export const api = axios.create({
  baseURL: rawBaseUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token from localStorage if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('stickerforge_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Resolve full asset URLs (for /uploads paths)
export function getAssetUrl(path: string | undefined): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  // In development Vite proxies /uploads; in production with external backend, prefix baseUrl
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return rawBaseUrl ? `${rawBaseUrl}${cleanPath}` : cleanPath;
}
