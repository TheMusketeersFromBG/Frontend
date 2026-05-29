import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'aisi_auth_session';

export interface AuthSession {
  name: string;
  email: string;
  isLoggedIn: boolean;
}

const ADMIN = { email: 'admin', password: 'admin' };

export function useAuth() {
  const [session, setSession]   = useState<AuthSession | null>(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then(raw => {
      if (raw) setSession(JSON.parse(raw));
      setLoading(false);
    });
  }, []);

  const login = async (email: string, password: string): Promise<string | null> => {
    if (email === ADMIN.email && password === ADMIN.password) {
      const s: AuthSession = { name: 'Admin', email: 'admin', isLoggedIn: true };
      setSession(s);
      await AsyncStorage.setItem(KEY, JSON.stringify(s));
      return null;
    }
    return 'Невалиден имейл или парола';
  };

  const signup = async (name: string, email: string): Promise<void> => {
    const s: AuthSession = { name, email, isLoggedIn: true };
    setSession(s);
    await AsyncStorage.setItem(KEY, JSON.stringify(s));
  };

  const logout = async () => {
    setSession(null);
    await AsyncStorage.multiRemove([KEY, 'aisi_onboarding']);
  };

  return { session, loading, login, signup, logout };
}
