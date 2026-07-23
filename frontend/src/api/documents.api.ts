import { apiClient } from './client';
import { toSnakeKeys } from './normalize';
import type { PermitDocument, UploadUrlResponse } from '../types/document.types';

// API returns document entities in camelCase; components read snake_case.
const toDoc = (raw: unknown) => toSnakeKeys<PermitDocument>(raw);

export const documentsApi = {
  // Direct multipart upload straight to the API (browser -> same-origin /api ->
  // backend -> object store). Replaces the presigned-URL + client-PUT flow,
  // which fails whenever the browser can't reach the object store directly
  // (e.g. behind a preview proxy where the presigned host is internal).
  uploadDocument: (
    applicationId: string,
    file: File,
    onProgress?: (pct: number) => void,
  ): Promise<PermitDocument> => {
    const form = new FormData();
    form.append('file', file);
    return apiClient
      .post<PermitDocument>(`/permits/${applicationId}/documents/upload`, form, {
        onUploadProgress: (e) => {
          if (onProgress && e.total) {
            onProgress(Math.round((e.loaded / e.total) * 100));
          }
        },
      })
      .then((r) => toDoc(r.data));
  },

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

  listDocuments: (applicationId: string): Promise<PermitDocument[]> =>
    apiClient
      .get<PermitDocument[]>(`/permits/${applicationId}/documents`)
      .then((r) => (r.data ?? []).map(toDoc)),

  getDocumentUrl: (applicationId: string, docId: string) =>
    apiClient.get<{ url: string; expiresAt: string }>(
      `/permits/${applicationId}/documents/${docId}/url`,
    ),

  deleteDocument: (applicationId: string, docId: string) =>
    apiClient.delete(`/permits/${applicationId}/documents/${docId}`),
};
