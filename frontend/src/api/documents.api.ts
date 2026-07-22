import { apiClient } from './client';
import type { PermitDocument, UploadUrlResponse } from '../types/document.types';

export const documentsApi = {
  getUploadUrl: (
    applicationId: string,
    payload: { filename: string; mimeType: string; sizeBytes: number },
  ) =>
    apiClient.post<UploadUrlResponse>(
      `/permits/${applicationId}/documents/upload-url`,
      payload,
    ),

  registerDocument: (
    applicationId: string,
    payload: {
      filename: string;
      mimeType: string;
      sizeBytes: number;
      documentType?: string;
      storageKey: string;
    },
  ) =>
    apiClient.post<PermitDocument>(`/permits/${applicationId}/documents`, payload),

  listDocuments: (applicationId: string) =>
    apiClient.get<PermitDocument[]>(`/permits/${applicationId}/documents`),

  getDocumentUrl: (applicationId: string, docId: string) =>
    apiClient.get<{ url: string; expiresAt: string }>(
      `/permits/${applicationId}/documents/${docId}/url`,
    ),

  deleteDocument: (applicationId: string, docId: string) =>
    apiClient.delete(`/permits/${applicationId}/documents/${docId}`),
};
