import { useState, useEffect, useCallback } from 'react';
import { apiRequest, ApiError, getAccessToken, getRefreshToken, setTokens, clearTokens, subscribeAuthChange } from '../api/client';

export interface AuthSession {
  name: string;
  email: string;
  isLoggedIn: boolean;
}

interface TokenPair {
  access_token: string;
  refresh_token: string;
}

interface MeResponse {
  name: string;
  email: string;
}

export function useAuth() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSession = useCallback(async () => {
    const token = await getAccessToken();
    if (!token) {
      setSession(null);
      return;
    }
    try {
      const me = await apiRequest<MeResponse>('/api/users/me');
      setSession({ name: me.name, email: me.email, isLoggedIn: true });
    } catch {
      setSession(null);
    }
  }, []);

  useEffect(() => {
    loadSession().finally(() => setLoading(false));
    return subscribeAuthChange(loadSession);
  }, [loadSession]);

  const login = async (email: string, password: string): Promise<string | null> => {
    try {
      const tokens = await apiRequest<TokenPair>('/api/auth/login', {
        method: 'POST',
        body: { email, password },
        auth: false,
      });
      await setTokens(tokens.access_token, tokens.refresh_token);
      return null;
    } catch (e) {
      return e instanceof ApiError ? e.message : 'Невалиден имейл или парола';
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<string | null> => {
    try {
      const tokens = await apiRequest<TokenPair>('/api/auth/register', {
        method: 'POST',
        body: { name, email, password },
        auth: false,
      });
      await setTokens(tokens.access_token, tokens.refresh_token);
      return null;
    } catch (e) {
      return e instanceof ApiError ? e.message : 'Грешка при регистрация';
    }
  };

  const logout = async () => {
    const refreshToken = await getRefreshToken();
    if (refreshToken) {
      await apiRequest('/api/auth/logout', {
        method: 'POST',
        body: { refresh_token: refreshToken },
        auth: false,
      }).catch(() => {});
    }
    await clearTokens();
  };

  return { session, loading, login, signup, logout };
}
