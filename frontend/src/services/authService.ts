import api from './api';
import { TOKEN_KEY, USER_KEY } from '@/utils/constants';
import type { User, LoginFormData, RegisterFormData, ApiResponse } from '@/types';

interface AuthResponse {
  token: string;
  user: User;
}

/**
 * Registers a new user account.
 * @param data - RegisterFormData object
 * @returns API response with token and user
 */
export async function registerUser(data: RegisterFormData): Promise<AuthResponse> {
  const res = await api.post<ApiResponse<AuthResponse>>('/auth/register', {
    name: data.name,
    email: data.email,
    password: data.password,
  });
  const payload = res.data.data!;
  localStorage.setItem(TOKEN_KEY, payload.token);
  localStorage.setItem(USER_KEY, JSON.stringify(payload.user));
  return payload;
}

/**
 * Logs in a user and stores the JWT token.
 * @param data - LoginFormData object
 * @returns API response with token and user
 */
export async function loginUser(data: LoginFormData): Promise<AuthResponse> {
  const res = await api.post<ApiResponse<AuthResponse>>('/auth/login', {
    email: data.email,
    password: data.password,
  });
  const payload = res.data.data!;
  localStorage.setItem(TOKEN_KEY, payload.token);
  localStorage.setItem(USER_KEY, JSON.stringify(payload.user));
  return payload;
}

/**
 * Logs out the current user by clearing stored credentials.
 */
export async function logoutUser(): Promise<void> {
  try { await api.post('/auth/logout'); } catch { /* ignore */ }
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/**
 * Fetches the current authenticated user from the API.
 * @returns User object or null on failure
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const res = await api.get<ApiResponse<User>>('/auth/me');
    return res.data.data ?? null;
  } catch {
    return null;
  }
}

/**
 * Updates the current user's profile.
 * @param updates - Partial user update payload
 * @returns Updated user object
 */
export async function updateProfile(updates: Partial<Pick<User, 'name' | 'avatar'>>): Promise<User> {
  const res = await api.put<ApiResponse<User>>('/auth/me', updates);
  return res.data.data!;
}
