import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshMe = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.fetchMe();
      setUser(data?.user ?? null);
    } catch (err) {
      if (err?.status !== 401) {
        setError(err?.message || 'Errore durante il caricamento utente.');
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.login(payload);
      setUser(data?.user ?? null);
      return { ok: true };
    } catch (err) {
      setUser(null);
      setError(err?.message || 'Login non riuscito.');
      return { ok: false, message: err?.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await api.logout();
    } catch (err) {
      setError(err?.message || 'Logout non riuscito.');
    } finally {
      setUser(null);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshMe();
  }, [refreshMe]);

  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      login,
      logout,
      refreshMe,
    }),
    [user, loading, error, login, logout, refreshMe]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
