import api from './api';
import { ApiResponse, Notification } from '../types';

export const notificationService = {
  getAll: async (params?: { read?: boolean; type?: string }): Promise<Notification[]> => {
    const res = await api.get<ApiResponse<Notification[]>>('/notifications', { params });
    return res.data.data;
  },

  markAsRead: async (id: string): Promise<Notification> => {
    const res = await api.patch<ApiResponse<Notification>>(`/notifications/${id}/read`);
    return res.data.data;
  },

  markAllAsRead: async (): Promise<void> => {
    await api.patch<ApiResponse<void>>('/notifications/read-all');
  },

  getUnreadCount: async (): Promise<number> => {
    const res = await api.get<ApiResponse<{ count: number }>>('/notifications/unread-count');
    return res.data.data.count;
  },
};
