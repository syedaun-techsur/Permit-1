import { apiClient } from './client';
import type {
  ApplicationStatus,
  CreatePermitPayload,
  LifecycleStage,
  PaginatedPermits,
  PermitApplication,
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
};
