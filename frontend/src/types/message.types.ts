export interface MessageAttachment {
  id: string;
  messageId: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  storageKey: string;
  uploadedAt: string;
}

export interface Message {
  id: string;
  applicationId: string;
  senderId: string;
  senderName: string;
  senderRole: 'applicant' | 'reviewer' | 'admin';
  body: string;
  attachments: MessageAttachment[];
  sentAt: string;   // ISO string
  readBy: string[]; // array of user UUIDs
}

export interface MessageListResponse {
  data: Message[];
  nextCursor: string | null;
}

export interface Notification {
  id: string;
  applicationId: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationListResponse {
  data: Notification[];
  nextCursor: string | null;
}
