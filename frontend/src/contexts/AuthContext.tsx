import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (role: Role | Role[]) => boolean;
  updateUser: (user: User) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('fleetops_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('fleetops_token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('fleetops_token');
      if (storedToken) {
        try {
          const freshUser = await authService.getCurrentUser();
          setUser(freshUser);
          localStorage.setItem('fleetops_user', JSON.stringify(freshUser));
        } catch (error) {
          console.warn('Failed to refresh user profile:', error);
          // If token expired or invalid, response interceptor will clear or keep stored
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await authService.login({ email, password });
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('fleetops_token', res.token);
      localStorage.setItem('fleetops_user', JSON.stringify(res.user));
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('fleetops_token');
    localStorage.removeItem('fleetops_user');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('fleetops_user', JSON.stringify(updatedUser));
  };

  const hasRole = (role: Role | Role[]): boolean => {
    if (!user) return false;
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    return user.role === role;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token && !!user,
        hasRole,
        updateUser,
        isLoading,
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
