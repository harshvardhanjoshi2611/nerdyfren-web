import { useCallback, useEffect, useMemo, useState } from 'react';
import { AUTH_TOKEN_KEY, authApi, clearAuthSession } from '../lib/api';
import { AuthContext } from './authState';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [activeRole, setActiveRole] = useState(null);
  const [loading, setLoading] = useState(Boolean(localStorage.getItem(AUTH_TOKEN_KEY)));

  const applySession = useCallback((result) => {
    localStorage.setItem(AUTH_TOKEN_KEY, result.token);
    setUser(result.user);
    setRoles(result.roles || result.user?.roles || []);
    setActiveRole(result.activeRole || result.user?.role || null);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }

    authApi.me()
      .then(applySession)
      .catch(() => {
        clearAuthSession();
        setUser(null);
        setRoles([]);
        setActiveRole(null);
      })
      .finally(() => setLoading(false));
  }, [applySession]);

  useEffect(() => {
    const clearState = () => {
      setUser(null);
      setRoles([]);
      setActiveRole(null);
    };
    const refreshRevokedRole = () => {
      authApi.me()
        .then(applySession)
        .catch(() => {
          clearAuthSession();
          clearState();
        });
    };
    window.addEventListener('nerdyfren:auth-cleared', clearState);
    window.addEventListener('nerdyfren:role-revoked', refreshRevokedRole);
    return () => {
      window.removeEventListener('nerdyfren:auth-cleared', clearState);
      window.removeEventListener('nerdyfren:role-revoked', refreshRevokedRole);
    };
  }, [applySession]);

  const value = useMemo(() => ({
    user,
    roles,
    activeRole,
    loading,
    isAuthenticated: Boolean(user),
    startSession: applySession,
    async switchRole(role) {
      const result = await authApi.switchRole(role);
      applySession(result);
      return result;
    },
    async endSession() {
      try {
        await authApi.logout();
      } finally {
        clearAuthSession();
        setUser(null);
        setRoles([]);
        setActiveRole(null);
      }
    },
  }), [activeRole, applySession, loading, roles, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
