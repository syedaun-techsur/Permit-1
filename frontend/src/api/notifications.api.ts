import { apiClient } from './client';

export const notificationsApi = {
  getUnreadCount: () =>
    apiClient.get<{ unreadCount: number }>('/notifications/unread-count').then((r) => r.data),
};
