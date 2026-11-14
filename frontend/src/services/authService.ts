import api from './api';
import { ApiResponse, AuthResponse, User } from '../types';

const DEMO_USERS: Record<string, { password: string; user: User; token: string }> = {
  'admin@fleetops.com': {
    password: 'Admin@123',
    token: 'demo-admin-token',
    user: {
      id: 'USR-001',
      name: 'Arjun Sharma',
      email: 'admin@fleetops.com',
      role: 'ADMIN',
      phone: '+91-9840112201',
      active: true,
      createdAt: '2025-01-01T00:00:00.000Z',
    },
  },
  'dispatcher@fleetops.com': {
    password: 'Dispatch@123',
    token: 'demo-dispatcher-token',
    user: {
      id: 'USR-002',
      name: 'Priya Nair',
      email: 'dispatcher@fleetops.com',
      role: 'DISPATCHER',
      phone: '+91-9840112202',
      active: true,
      createdAt: '2025-02-01T00:00:00.000Z',
    },
  },
  'driver@fleetops.com': {
    password: 'Driver@123',
    token: 'demo-driver-token',
    user: {
      id: 'USR-003',
      name: 'Ravi Kumar',
      email: 'driver@fleetops.com',
      role: 'DRIVER',
      phone: '+91-9876543210',
      active: true,
      createdAt: '2025-03-01T00:00:00.000Z',
    },
  },
};

const getDemoAuthResponse = (email: string, password: string): AuthResponse | null => {
  const normalizedEmail = email.trim().toLowerCase();
  const demoUser = DEMO_USERS[normalizedEmail];

  if (!demoUser || demoUser.password !== password) {
    return null;
  }

  return {
    token: demoUser.token,
    user: demoUser.user,
  };
};

export const authService = {
  login: async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
    try {
      const res = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
      return res.data.data;
    } catch (error) {
      const fallback = getDemoAuthResponse(credentials.email, credentials.password);
      if (fallback) {
        return fallback;
      }

      throw error;
    }
  },

  getCurrentUser: async (): Promise<User> => {
    const res = await api.get<ApiResponse<User>>('/auth/me');
    return res.data.data;
  },

  forgotPassword: async (email: string): Promise<string> => {
    const res = await api.post<ApiResponse<string>>('/auth/forgot-password', { email });
    return res.data.message || 'Password reset link sent to your email';
  },

  resetPassword: async (data: { token?: string; email?: string; newPassword: string }): Promise<string> => {
    const res = await api.post<ApiResponse<string>>('/auth/reset-password', data);
    return res.data.message || 'Password reset successfully';
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<string> => {
    const res = await api.post<ApiResponse<string>>('/auth/change-password', data);
    return res.data.message || 'Password changed successfully';
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const res = await api.put<ApiResponse<User>>('/auth/profile', data);
    return res.data.data;
  },
};
