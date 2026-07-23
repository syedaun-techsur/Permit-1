import { apiClient } from './client';
import type {
  AdminPermit,
  AdminUser,
  AuditLogResponse,
  PaginatedResponse,
  AdminPermitsQuery,
  AdminUsersQuery,
  AuditLogQuery,
  CreateUserPayload,
  UpdateUserPayload,
  AssignReviewerPayload,
} from '../types/admin.types';

export const adminApi = {
  // PERM-07
  getAllPermits: (params: AdminPermitsQuery) =>
    apiClient
      .get<PaginatedResponse<AdminPermit>>('/admin/permits', { params })
      .then((r) => r.data),

  // ADMN-01
  getUsers: (params: AdminUsersQuery) =>
    apiClient
      .get<PaginatedResponse<AdminUser>>('/admin/users', { params })
      .then((r) => r.data),

  getUserById: (userId: string) =>
    apiClient.get<AdminUser>(`/admin/users/${userId}`).then((r) => r.data),

  createUser: (payload: CreateUserPayload) =>
    apiClient.post<AdminUser>('/admin/users', payload).then((r) => r.data),

  updateUser: (userId: string, payload: UpdateUserPayload) =>
    apiClient
      .patch<AdminUser>(`/admin/users/${userId}`, payload)
      .then((r) => r.data),

  // ADMN-02 — assign reviewer
  assignReviewer: (permitId: string, payload: AssignReviewerPayload) =>
    apiClient
      .patch<AdminPermit>(`/permits/${permitId}/assign-reviewer`, payload)
      .then((r) => r.data),

  // Reviewer list for dropdown (reuse GET /admin/users?role=reviewer&isActive=true)
  getActiveReviewers: () =>
    apiClient
      .get<PaginatedResponse<AdminUser>>('/admin/users', {
        params: { role: 'reviewer', isActive: true, limit: 100 },
      })
      .then((r) => r.data),

  // ADMN-03
  getAuditLog: (params: AuditLogQuery) =>
    apiClient
      .get<AuditLogResponse>('/admin/audit-log', { params })
      .then((r) => r.data),

  // CSV export via Axios blob download (keeps token in Authorization header, never in URL — T-05-08)
  exportAuditLogCsv: (params: AuditLogQuery) =>
    apiClient.get<Blob>('/admin/audit-log/export', {
      params,
      responseType: 'blob',
    }),
};
