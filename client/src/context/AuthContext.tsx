import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../api/client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  unreadCount: number;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  updateUser: (updatedData: Partial<User>) => void;
  refreshUserData: () => Promise<void>;
  getDefaultRouteForRole: (role: string) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const getDefaultRouteForRole = (role: string): string => {
  switch (role) {
    case 'STUDENT':
      return '/student-dashboard';
    case 'SENIOR':
      return '/senior-dashboard';
    case 'PLACEMENT_ADMIN':
      return '/admin/manage-placements';
    case 'SYSTEM_ADMIN':
      return '/admin/system';
    default:
      return '/student-dashboard';
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('cc_token'));
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUserData = async () => {
    try {
      if (!localStorage.getItem('cc_token')) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      const data = await api.getMe();
      if (data.success && data.user) {
        setUser(data.user);
        setUnreadCount(data.unreadNotificationsCount || 0);
      } else {
        logout();
      }
    } catch (err) {
      console.warn('Session verification failed, logging out:', err);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUserData();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const data = await api.login({ email, password });
      if (data.success && data.token && data.user) {
        localStorage.setItem('cc_token', data.token);
        setToken(data.token);
        setUser(data.user);
        return data.user;
      } else {
        throw new Error('Authentication failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('cc_token');
    setToken(null);
    setUser(null);
    setUnreadCount(0);
  };

  const updateUser = (updatedData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updatedData });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        unreadCount,
        login,
        logout,
        updateUser,
        refreshUserData,
        getDefaultRouteForRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
