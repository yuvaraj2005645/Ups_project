import api from './api';
import { ApiResponse, User } from '../types';

export const userService = {
  getAll: async (params?: { role?: string; active?: boolean; search?: string }): Promise<User[]> => {
    const res = await api.get<ApiResponse<User[]>>('/users', { params });
    return res.data.data;
  },

  getById: async (id: string): Promise<User> => {
    const res = await api.get<ApiResponse<User>>(`/users/${id}`);
    return res.data.data;
  },

  create: async (data: {
    name: string;
    email: string;
    password?: string;
    role: string;
    phone: string;
  }): Promise<User> => {
    const res = await api.post<ApiResponse<User>>('/users', data);
    return res.data.data;
  },

  update: async (id: string, data: Partial<User>): Promise<User> => {
    const res = await api.put<ApiResponse<User>>(`/users/${id}`, data);
    return res.data.data;
  },

  toggleStatus: async (id: string, active: boolean): Promise<User> => {
    const res = await api.patch<ApiResponse<User>>(`/users/${id}/status`, { active });
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete<ApiResponse<void>>(`/users/${id}`);
  },
};
