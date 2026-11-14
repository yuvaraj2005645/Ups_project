import { useState, useEffect, useCallback } from 'react';
import { Notification } from '../types';
import { notificationService } from '../services/notificationService';
import { useAuth } from '../contexts/AuthContext';

export const useNotifications = (pollIntervalMs = 30000) => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await notificationService.getAll();
      setNotifications(data);
      const count = data.filter((n) => !n.read).length;
      setUnreadCount(count);
    } catch (err) {
      // Quietly ignore background poll failure
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchNotifications();

    const interval = setInterval(fetchNotifications, pollIntervalMs);
    return () => clearInterval(interval);
  }, [fetchNotifications, isAuthenticated, pollIntervalMs]);

  const markAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    refresh: fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
};
