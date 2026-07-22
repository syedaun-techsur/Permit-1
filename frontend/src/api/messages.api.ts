import { apiClient } from './client';
import type { Message, MessageAttachment, MessageListResponse } from '../types/message.types';

export const messagesApi = {
  list: (applicationId: string, cursor?: string) =>
    apiClient.get<MessageListResponse>(`/permits/${applicationId}/messages`, {
      params: cursor ? { cursor } : {},
    }),

  send: (applicationId: string, body: string) =>
    apiClient.post<Message>(`/permits/${applicationId}/messages`, { body }),

  markRead: (applicationId: string, messageId: string) =>
    apiClient.post(`/permits/${applicationId}/messages/${messageId}/read`),

  getUnreadCount: (applicationId: string) =>
    apiClient.get<{ unreadCount: number }>(`/permits/${applicationId}/messages/unread-count`),

  getAttachmentUploadUrl: (
    applicationId: string,
    messageId: string,
    payload: { filename: string; mimeType: string; sizeBytes: number },
  ) =>
    apiClient.post<{ uploadUrl: string; storageKey: string; expiresAt: string }>(
      `/permits/${applicationId}/messages/${messageId}/attachments/upload-url`,
      payload,
    ),

  registerAttachment: (
    applicationId: string,
    messageId: string,
    payload: { filename: string; mimeType: string; sizeBytes: number; storageKey: string },
  ) =>
    apiClient.post<MessageAttachment>(
      `/permits/${applicationId}/messages/${messageId}/attachments`,
      payload,
    ),
};
