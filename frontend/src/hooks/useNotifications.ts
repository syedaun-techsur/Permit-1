import { useState, useEffect } from 'react';
import { notificationsApi } from '../api/notifications.api';
import { useAuthStore } from '../store/auth.store';

interface UseNotificationsResult {
  unreadCount: number;
}

export function useNotifications(): UseNotificationsResult {
  const { isAuthenticated } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }

    const fetchUnreadCount = async () => {
      try {
        const data = await notificationsApi.getUnreadCount();
        setUnreadCount(data.unreadCount);
      } catch {
        // Silently ignore errors — unread count is non-critical
        setUnreadCount(0);
      }
    };

    void fetchUnreadCount();

    const intervalId = setInterval(() => {
      void fetchUnreadCount();
    }, 30000);

    return () => clearInterval(intervalId);
  }, [isAuthenticated]);

  return { unreadCount };
}
