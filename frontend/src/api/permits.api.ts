import { apiClient } from './client';
import type {
  ApplicationStatus,
  CreatePermitPayload,
  LifecycleStage,
  PaginatedPermits,
  PermitApplication,
  ReviewQueueItem,
  ReviewQueueResponse,
  UpdatePermitPayload,
} from '../types/permit.types';

export const permitsApi = {
  createPermit: (data: CreatePermitPayload) =>
    apiClient.post<PermitApplication>('/permits', data).then((r) => r.data),

  updatePermit: (id: string, data: UpdatePermitPayload) =>
    apiClient.patch<PermitApplication>(`/permits/${id}`, data).then((r) => r.data),

  submitPermit: (id: string) =>
    apiClient.post<PermitApplication>(`/permits/${id}/submit`).then((r) => r.data),

  listPermits: (params?: { status?: ApplicationStatus; cursor?: string; limit?: number }) =>
    apiClient.get<PaginatedPermits>('/permits', { params }).then((r) => r.data),

  getPermit: (id: string) =>
    apiClient.get<PermitApplication>(`/permits/${id}`).then((r) => r.data),

  getLifecycle: (id: string) =>
    apiClient.get<{ stages: LifecycleStage[] }>(`/permits/${id}/lifecycle`).then((r) => r.data),

  // Reviewer queue
  getReviewQueue: (params?: {
    status?: string;
    permitType?: string;
    assignment?: string;
    page?: number;
    limit?: number;
  }) =>
    apiClient.get<ReviewQueueResponse>('/permits/review-queue', { params }).then((r) => r.data),

  // Lifecycle action endpoints
  beginReview: (id: string) =>
    apiClient.post<PermitApplication>(`/permits/${id}/actions/begin-review`).then((r) => r.data),

  requestInfo: (id: string, infoRequestNote: string) =>
    apiClient
      .post<PermitApplication>(`/permits/${id}/actions/request-info`, { infoRequestNote })
      .then((r) => r.data),

  respondToInfo: (id: string, responseNote?: string) =>
    apiClient
      .post<PermitApplication>(`/permits/${id}/actions/respond-to-info`, { responseNote })
      .then((r) => r.data),

  decide: (id: string, outcome: 'approved' | 'rejected', decisionReason: string) =>
    apiClient
      .post<PermitApplication>(`/permits/${id}/actions/decide`, { outcome, decisionReason })
      .then((r) => r.data),

  // Document archive
  getDocumentArchive: (id: string) =>
    apiClient
      .get<{ downloadUrl: string; expiresAt: string }>(`/permits/${id}/documents/archive`)
      .then((r) => r.data),
};

// Re-export types for convenience
export type { ReviewQueueItem };
