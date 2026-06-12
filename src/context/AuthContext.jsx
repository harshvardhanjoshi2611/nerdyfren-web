import { useEffect, useMemo, useState } from 'react';
import { authApi } from '../lib/api';
import { AuthContext } from './authState';

const TOKEN_KEY = 'nerdyfren_user_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(localStorage.getItem(TOKEN_KEY)));

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }

    authApi.me()
      .then((result) => setUser(result.user))
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    isAuthenticated: Boolean(user),
    startSession(result) {
      localStorage.setItem(TOKEN_KEY, result.token);
      setUser(result.user);
    },
    async endSession() {
      try {
        await authApi.logout();
      } finally {
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
      }
    },
  }), [loading, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
