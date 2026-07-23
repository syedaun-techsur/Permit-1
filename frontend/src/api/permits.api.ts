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

// The API serializes entity responses in camelCase (permitType, siteStreet,
// updatedAt, ...), but the frontend PermitApplication / LifecycleStage types and
// every component read snake_case (permit_type, site_street, updated_at, ...).
// Left unconverted, every field is `undefined` at runtime — which crashed date
// formatting on the permit list (`new Date(undefined)` → "Invalid time value")
// and blanked loaded edit forms (so autosave then PATCHed empty required fields
// → 400). Normalize each entity object's keys to snake_case here, once, so no
// component change is needed. Permit/stage objects are flat, so a shallow key
// rewrite is sufficient.
function toSnakeKeys<T>(raw: unknown): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries((raw ?? {}) as Record<string, unknown>)) {
    out[k.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`)] = v;
  }
  return out as T;
}

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
