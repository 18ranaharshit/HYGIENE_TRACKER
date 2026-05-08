import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '@/types';
import { TOKEN_KEY, USER_KEY } from '@/utils/constants';
import { loginUser, logoutUser, registerUser, getCurrentUser } from '@/services/authService';
import type { LoginFormData, RegisterFormData } from '@/types';

/** Auth context shape */
interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (data: LoginFormData) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * AuthProvider wraps the app and provides authentication state.
 * On mount it validates the stored token by calling GET /api/auth/me.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem(TOKEN_KEY));
  const [isLoading, setIsLoading] = useState(true);

  // Validate stored token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (!storedToken) { setIsLoading(false); return; }
    getCurrentUser()
      .then(u => setUser(u))
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (data: LoginFormData) => {
    const { token: t, user: u } = await loginUser(data);
    setToken(t);
    setUser(u);
  };

  const register = async (data: RegisterFormData) => {
    const { token: t, user: u } = await registerUser(data);
    setToken(t);
    setUser(u);
  };

  const logout = async () => {
    await logoutUser();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user, token, isLoading,
      isAdmin: user?.role === 'admin',
      login, register, logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access the authentication context.
 * @returns AuthContextValue
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
