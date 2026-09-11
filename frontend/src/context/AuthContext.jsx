import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('nlc_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('nlc_token');
    if (!token) {
      setLoading(false);
      return;
    }
    authService
      .me()
      .then(({ user: freshUser }) => {
        setUser(freshUser);
        localStorage.setItem('nlc_user', JSON.stringify(freshUser));
      })
      .catch(() => {
        localStorage.removeItem('nlc_token');
        localStorage.removeItem('nlc_user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const { user: loggedInUser, token } = await authService.login(email, password);
    localStorage.setItem('nlc_token', token);
    localStorage.setItem('nlc_user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const register = useCallback(async (payload) => {
    const { user: newUser, token } = await authService.register(payload);
    localStorage.setItem('nlc_token', token);
    localStorage.setItem('nlc_user', JSON.stringify(newUser));
    setUser(newUser);
    return newUser;
  }, []);

  const logout = useCallback(() => {
    authService.logout().catch(() => {});
    localStorage.removeItem('nlc_token');
    localStorage.removeItem('nlc_user');
    setUser(null);
  }, []);

  const hasRole = useCallback((...roles) => !!user && roles.includes(user.role), [user]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
