import { useState, useEffect, useCallback } from 'react';
import { notificationsApi } from '../api/notifications.api';
import { useAuthStore } from '../store/auth.store';
import type { Notification } from '../types/message.types';

interface UseNotificationsResult {
  unreadCount: number;
  notifications: Notification[];
  notifLoading: boolean;
  loadNotifications: () => Promise<void>;
  markOneRead: (notifId: string) => Promise<void>;
  markAllRead: () => Promise<void>;
}

export function useNotifications(): UseNotificationsResult {
  const { isAuthenticated } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const data = await notificationsApi.getUnreadCount();
      setUnreadCount(data.unreadCount);
    } catch {
      // Silently ignore errors — unread count is non-critical
      setUnreadCount(0);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }

    void fetchUnreadCount();

    const intervalId = setInterval(() => {
      void fetchUnreadCount();
    }, 30000);

    return () => clearInterval(intervalId);
  }, [isAuthenticated, fetchUnreadCount]);

  const loadNotifications = useCallback(async () => {
    setNotifLoading(true);
    try {
      const res = await notificationsApi.list();
      setNotifications(res.data.data);
    } finally {
      setNotifLoading(false);
    }
  }, []);

  const markOneRead = useCallback(
    async (notifId: string) => {
      await notificationsApi.markOneRead(notifId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, isRead: true } : n)),
      );
      // Refresh unread count
      void fetchUnreadCount();
    },
    [fetchUnreadCount],
  );

  const markAllRead = useCallback(async () => {
    await notificationsApi.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }, []);

  return { unreadCount, notifications, notifLoading, loadNotifications, markOneRead, markAllRead };
}
