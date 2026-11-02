import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const getStoredAuth = () => {
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const userStr = sessionStorage.getItem('user') || localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      return { token, user };
    } catch {
      return { token: null, user: null };
    }
  };

  const initialAuth = getStoredAuth();
  const [user, setUser] = useState(initialAuth.user);
  const [token, setToken] = useState(initialAuth.token);
  const [loading, setLoading] = useState(true);

  // Initialize and verify user on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const activeToken = sessionStorage.getItem('token') || localStorage.getItem('token');
      if (!activeToken) {
        setUser(null);
        setToken(null);
        setLoading(false);
        return;
      }

      try {
        // Fetch current profile from backend
        const response = await api.get('/auth/me');
        const userData = response.data?.user || response.data?.data || response.data;
        setUser(userData);
        // Persist to whichever storage currently holds the token
        if (sessionStorage.getItem('token')) {
          sessionStorage.setItem('user', JSON.stringify(userData));
        } else {
          localStorage.setItem('user', JSON.stringify(userData));
        }
      } catch (error) {
        console.warn('Failed to verify token with backend, clearing session:', error);
        // If token verification fails, clear both storages completely
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password, rememberMe = false) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const data = response.data?.data || response.data;
      const authToken = data.token || data.accessToken;
      const authUser = data.user || data;

      // Always clear both storages first to ensure clean state
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Use localStorage ONLY if user explicitly checked "Remember Me", otherwise use sessionStorage (cleared when browser/tab closes)
      const storage = rememberMe ? localStorage : sessionStorage;

      if (authToken) {
        storage.setItem('token', authToken);
        setToken(authToken);
      }
      if (authUser) {
        storage.setItem('user', JSON.stringify(authUser));
        setUser(authUser);
      }

      return { success: true, user: authUser };
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      throw new Error(message);
    }
  };

  const register = async (userData, rememberMe = false) => {
    try {
      const response = await api.post('/auth/register', userData);
      const data = response.data?.data || response.data;
      const authToken = data.token || data.accessToken;
      const authUser = data.user || data;

      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      const storage = rememberMe ? localStorage : sessionStorage;

      if (authToken) {
        storage.setItem('token', authToken);
        setToken(authToken);
      }
      if (authUser) {
        storage.setItem('user', JSON.stringify(authUser));
        setUser(authUser);
      }

      return { success: true, user: authUser };
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Registration failed';
      throw new Error(message);
    }
  };

  const logout = () => {
    // Clear ALL credentials from both session and local storage
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedData) => {
    const updated = { ...user, ...updatedData };
    setUser(updated);
    if (sessionStorage.getItem('token')) {
      sessionStorage.setItem('user', JSON.stringify(updated));
    } else if (localStorage.getItem('token')) {
      localStorage.setItem('user', JSON.stringify(updated));
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    loading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
