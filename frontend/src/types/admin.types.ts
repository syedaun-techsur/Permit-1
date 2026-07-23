export interface AdminPermit {
  id: string;
  referenceNumber: string;
  permitType: string;
  applicantName: string;
  assignedReviewerId: string | null;
  assignedReviewerName: string | null;
  status: string;
  submittedAt: string;
  updatedAt: string;
}

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: 'applicant' | 'reviewer' | 'admin';
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  applicationId: string | null;
  applicationRef: string | null;
  details: Record<string, unknown>;
  ipAddress: string;
  occurredAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface AuditLogResponse {
  data: AuditLogEntry[];
  nextCursor: string | null;
  totalCount: number;
}

export interface AdminPermitsQuery {
  status?: string;
  permitType?: string;
  reviewerId?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface AdminUsersQuery {
  role?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AuditLogQuery {
  action?: string;
  actorId?: string;
  applicationId?: string;
  from?: string;
  to?: string;
  cursor?: string;
  limit?: number;
}

export interface CreateUserPayload {
  fullName: string;
  email: string;
  role: 'applicant' | 'reviewer' | 'admin';
  temporaryPassword?: string;
}

export interface UpdateUserPayload {
  isActive?: boolean;
  role?: 'applicant' | 'reviewer' | 'admin';
}

export interface AssignReviewerPayload {
  reviewerId: string | null;
}

export interface ReviewerOption {
  id: string;
  fullName: string;
  activeApplicationCount: number;
}
