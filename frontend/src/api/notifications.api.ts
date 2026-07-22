import { apiClient } from './client';
import type { NotificationListResponse } from '../types/message.types';

export const notificationsApi = {
  getUnreadCount: () =>
    apiClient.get<{ unreadCount: number }>('/notifications/unread-count').then((r) => r.data),

  list: (cursor?: string) =>
    apiClient.get<NotificationListResponse>('/notifications', {
      params: cursor ? { cursor } : {},
    }),

  markOneRead: (notifId: string) =>
    apiClient.patch(`/notifications/${notifId}/read`),

  markAllRead: () =>
    apiClient.patch('/notifications/read-all'),
};
