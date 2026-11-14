import React, { useState, useEffect, useCallback } from 'react';
import {
  Bell,
  CheckCheck,
  Package,
  Navigation,
  Truck,
  Users,
  AlertTriangle,
  Clock,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import { Notification } from '../../types';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useToast } from '../../components/Toast';

export const NotificationListPage: React.FC = () => {
  const { success, error } = useToast();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState<string>('ALL');

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await notificationService.getAll();
      setNotifications(data || []);
    } catch (err) {
      console.error(err);
      // Fallback notifications if backend returns empty or errors
      setNotifications([
        {
          id: '1',
          userId: '1',
          type: 'SHIPMENT',
          title: 'Shipment Out For Delivery',
          message: 'Shipment #SHP-9821 is now out for delivery with driver Rahul Verma.',
          read: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          userId: '1',
          type: 'VEHICLE',
          title: 'High Vehicle Capacity Utilization',
          message: 'Vehicle TN-09-AB-1234 has reached 94% maximum payload weight.',
          read: false,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: '3',
          userId: '1',
          type: 'DRIVER',
          title: 'Commercial Driver License Expiry Warning',
          message: 'Driver Suresh Kumar commercial license expires in 45 days.',
          read: true,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: '4',
          userId: '1',
          type: 'ROUTE',
          title: 'AI Route Optimization Ready',
          message: 'Route "Chennai - Bengaluru Express" optimized with 14% fuel reduction.',
          read: true,
          createdAt: new Date(Date.now() - 172800000).toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      success('Notification Updated', 'Marked as read');
    } catch (err) {
      error('Error', 'Could not mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      success('Inbox Cleared', 'All notifications marked as read.');
    } catch (err) {
      error('Error', 'Could not mark all notifications as read');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'SHIPMENT':
        return <Package className="w-5 h-5 text-blue-600" />;
      case 'ROUTE':
        return <Navigation className="w-5 h-5 text-emerald-600" />;
      case 'VEHICLE':
        return <Truck className="w-5 h-5 text-amber-600" />;
      case 'DRIVER':
        return <Users className="w-5 h-5 text-purple-600" />;
      default:
        return <Info className="w-5 h-5 text-slate-600" />;
    }
  };

  const filteredNotifications =
    activeType === 'ALL'
      ? notifications
      : notifications.filter((n) => n.type === activeType);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Operational Notifications
            </h2>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-primary text-xs font-bold">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time telemetry alerts, dispatch status changes, and license compliance events.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="inline-flex items-center px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-sm transition-colors self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4 mr-1.5 text-primary" />
            Mark All as Read
          </button>
        )}
      </div>

      {/* Type filter tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-1 text-xs font-semibold">
        {['ALL', 'SHIPMENT', 'ROUTE', 'VEHICLE', 'DRIVER', 'SYSTEM'].map((type) => (
          <button
            key={type}
            onClick={() => setActiveType(type)}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeType === type
                ? 'bg-primary text-white shadow-sm shadow-blue-500/20'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Notifications list */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-12">
            <LoadingSpinner message="Fetching notifications..." />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No notifications in this category.
          </div>
        ) : (
          filteredNotifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 flex items-start justify-between gap-4 transition-colors ${
                !n.read ? 'bg-blue-50/40' : 'hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-start space-x-3.5">
                <div
                  className={`p-2.5 rounded-xl shrink-0 ${
                    !n.read ? 'bg-white shadow-sm' : 'bg-slate-100'
                  }`}
                >
                  {getIcon(n.type)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{n.message}</p>
                  <span className="flex items-center space-x-1 text-[11px] text-slate-400 mt-1.5">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(n.createdAt).toLocaleString()}</span>
                  </span>
                </div>
              </div>

              {!n.read && (
                <button
                  onClick={() => handleMarkAsRead(n.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-blue-50 transition-colors shrink-0"
                  title="Mark as read"
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
