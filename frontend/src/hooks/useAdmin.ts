import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../api/admin.api';
import type {
  AdminPermit,
  AdminUser,
  AuditLogEntry,
  ReviewerOption,
  AdminPermitsQuery,
  AdminUsersQuery,
  AuditLogQuery,
  CreateUserPayload,
  UpdateUserPayload,
} from '../types/admin.types';

// ────────────────────────────────────────────────────────────────────────────
// useAdminPermits
// ────────────────────────────────────────────────────────────────────────────
export function useAdminPermits(query: AdminPermitsQuery) {
  const [permits, setPermits] = useState<AdminPermit[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(query.page ?? 1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPermits = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getAllPermits({ ...query, page });
      setPermits(res.data);
      setTotal(res.total);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message ?? 'Failed to load permits';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [query, page]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    void fetchPermits();
  }, [fetchPermits]);

  return { permits, total, page, loading, error, setPage, refetch: fetchPermits };
}

// ────────────────────────────────────────────────────────────────────────────
// useAdminUsers
// ────────────────────────────────────────────────────────────────────────────
export function useAdminUsers(query: AdminUsersQuery) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(query.page ?? 1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getUsers({ ...query, page });
      setUsers(res.data);
      setTotal(res.total);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message ?? 'Failed to load users';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [query, page]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  return { users, total, page, loading, error, setPage, refetch: fetchUsers };
}

// ────────────────────────────────────────────────────────────────────────────
// useAuditLog
// ────────────────────────────────────────────────────────────────────────────
export function useAuditLog(query: AuditLogQuery) {
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AuditLogQuery>(query);

  const fetchLog = useCallback(async (reset = true) => {
    setLoading(true);
    setError(null);
    try {
      const params: AuditLogQuery = { ...filters };
      if (!reset && nextCursor) {
        params.cursor = nextCursor;
      }
      const res = await adminApi.getAuditLog(params);
      if (reset) {
        setEntries(res.data);
      } else {
        setEntries((prev) => [...prev, ...res.data]);
      }
      setNextCursor(res.nextCursor);
      setTotalCount(res.totalCount);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message ?? 'Failed to load audit log';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [filters, nextCursor]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    void fetchLog(true);
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadMore = useCallback(() => {
    void fetchLog(false);
  }, [fetchLog]);

  return {
    entries,
    nextCursor,
    totalCount,
    loading,
    error,
    loadMore,
    setFilters,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// useAssignReviewer
// ────────────────────────────────────────────────────────────────────────────
export function useAssignReviewer() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const assign = useCallback(
    async (permitId: string, reviewerId: string | null) => {
      setLoading(true);
      setError(null);
      try {
        await adminApi.assignReviewer(permitId, { reviewerId });
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string } } }).response?.data
            ?.message ?? 'Failed to assign reviewer';
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { assign, loading, error };
}

// ────────────────────────────────────────────────────────────────────────────
// useCreateUser
// ────────────────────────────────────────────────────────────────────────────
export function useCreateUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (payload: CreateUserPayload) => {
    setLoading(true);
    setError(null);
    try {
      const user = await adminApi.createUser(payload);
      return user;
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message ?? 'Failed to create user';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { create, loading, error };
}

// ────────────────────────────────────────────────────────────────────────────
// useUpdateUser
// ────────────────────────────────────────────────────────────────────────────
export function useUpdateUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = useCallback(async (userId: string, payload: UpdateUserPayload) => {
    setLoading(true);
    setError(null);
    try {
      const user = await adminApi.updateUser(userId, payload);
      return user;
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message ?? 'Failed to update user';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { update, loading, error };
}

// ────────────────────────────────────────────────────────────────────────────
// useActiveReviewers
// ────────────────────────────────────────────────────────────────────────────
export function useActiveReviewers() {
  const [reviewers, setReviewers] = useState<ReviewerOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviewers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getActiveReviewers();
      // Map AdminUser to ReviewerOption; activeApplicationCount defaults to 0
      // (backend may return it in a future enhancement; tolerate its absence)
      setReviewers(
        res.data.map((u) => ({
          id: u.id,
          fullName: u.fullName,
          activeApplicationCount:
            (u as AdminUser & { activeApplicationCount?: number })
              .activeApplicationCount ?? 0,
        })),
      );
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message ?? 'Failed to load reviewers';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchReviewers();
  }, [fetchReviewers]);

  return { reviewers, loading, error };
}
