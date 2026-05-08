import axios from 'axios';
import { API_BASE_URL, TOKEN_KEY } from '@/utils/constants';

/**
 * Axios instance pre-configured with the CleanRoute API base URL.
 * Automatically attaches JWT and handles 401 redirects.
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request Interceptor: attach token ─────────────────────────────────────
api.interceptors.request.use(config => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response Interceptor: handle 401 ─────────────────────────────────────
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default api;
