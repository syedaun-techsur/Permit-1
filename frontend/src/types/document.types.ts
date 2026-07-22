import type { ApplicationStatus } from './permit.types';

export type DocumentMimeType =
  | 'application/pdf'
  | 'image/jpeg'
  | 'image/png'
  | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

export type DocumentStatus = 'uploaded' | 'deleted' | 'superseded';

export interface PermitDocument {
  id: string;
  application_id: string;
  uploaded_by: string;
  filename: string;
  mime_type: string;
  size_bytes: number;
  document_type?: string;
  storage_key: string;
  status: DocumentStatus;
  superseded_by?: string;
  uploaded_at: string;
  deleted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface UploadUrlResponse {
  uploadUrl: string;
  storageKey: string;
  expiresAt: string;
}

export type UploadStatus = 'queued' | 'uploading' | 'uploaded' | 'error';

export interface UploadFileState {
  file: File;
  filename: string;
  status: UploadStatus;
  progress: number; // 0-100
  error?: string;
  document?: PermitDocument;
}

// Re-export for document-related contexts
export type { ApplicationStatus };
