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

import { toSnakeKeys } from './normalize';

// The API serializes permit/lifecycle entities in camelCase but the frontend
// types + components read snake_case. Normalize each object's keys once here so
// no component change is needed. See ./normalize for details.
const toPermit = (raw: unknown) => toSnakeKeys<PermitApplication>(raw);

export const permitsApi = {
  createPermit: (data: CreatePermitPayload) =>
    apiClient.post<PermitApplication>('/permits', data).then((r) => toPermit(r.data)),

  updatePermit: (id: string, data: UpdatePermitPayload) =>
    apiClient.patch<PermitApplication>(`/permits/${id}`, data).then((r) => toPermit(r.data)),

  submitPermit: (id: string) =>
    apiClient.post<PermitApplication>(`/permits/${id}/submit`).then((r) => toPermit(r.data)),

  listPermits: (params?: { status?: ApplicationStatus; cursor?: string; limit?: number }) =>
    apiClient.get<PaginatedPermits>('/permits', { params }).then((r) => ({
      ...r.data,
      data: (r.data.data ?? []).map(toPermit),
    })),

  getPermit: (id: string) =>
    apiClient.get<PermitApplication>(`/permits/${id}`).then((r) => toPermit(r.data)),

  getLifecycle: (id: string) =>
    apiClient.get<{ stages: LifecycleStage[] }>(`/permits/${id}/lifecycle`).then((r) => ({
      stages: (r.data.stages ?? []).map((s) => toSnakeKeys<LifecycleStage>(s)),
    })),

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
    apiClient.post<PermitApplication>(`/permits/${id}/actions/begin-review`).then((r) => toPermit(r.data)),

  requestInfo: (id: string, infoRequestNote: string) =>
    apiClient
      .post<PermitApplication>(`/permits/${id}/actions/request-info`, { infoRequestNote })
      .then((r) => toPermit(r.data)),

  respondToInfo: (id: string, responseNote?: string) =>
    apiClient
      .post<PermitApplication>(`/permits/${id}/actions/respond-to-info`, { responseNote })
      .then((r) => toPermit(r.data)),

  decide: (id: string, outcome: 'approved' | 'rejected', decisionReason: string) =>
    apiClient
      .post<PermitApplication>(`/permits/${id}/actions/decide`, { outcome, decisionReason })
      .then((r) => toPermit(r.data)),

  // Document archive
  getDocumentArchive: (id: string) =>
    apiClient
      .get<{ downloadUrl: string; expiresAt: string }>(`/permits/${id}/documents/archive`)
      .then((r) => r.data),
};

// Re-export types for convenience
export type { ReviewQueueItem };
