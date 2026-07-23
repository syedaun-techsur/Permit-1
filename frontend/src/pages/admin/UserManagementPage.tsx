import { useState, useEffect, useRef } from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { CreateUserModal } from '../../components/admin/CreateUserModal';
import { DeactivateConfirmDialog } from '../../components/admin/DeactivateConfirmDialog';
import { useAdminUsers, useUpdateUser } from '../../hooks/useAdmin';
import { useUiStore } from '../../store/ui.store';
import { AppShell } from '../../components/layout/AppShell';
import type { AdminUser, AdminUsersQuery } from '../../types/admin.types';

const ROLE_BADGE: Record<string, 'primary' | 'warning' | 'error' | 'default'> = {
  admin: 'error',
  reviewer: 'warning',
  applicant: 'primary',
};

const PAGE_SIZE = 25;

export function UserManagementPage() {
  const [filters, setFilters] = useState<AdminUsersQuery>({
    page: 1,
    limit: PAGE_SIZE,
  });
  const [searchInput, setSearchInput] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState<AdminUser | null>(null);
  const [openRoleMenuId, setOpenRoleMenuId] = useState<string | null>(null);

  const addToast = useUiStore((s) => s.addToast);
  const { update: updateUser } = useUpdateUser();
  const { users, total, page, loading, error, setPage, refetch } = useAdminUsers(filters);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Debounce search
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearch = (value: string) => {
    setSearchInput(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: value || undefined, page: 1 }));
    }, 300);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, []);

  const handleRoleChange = async (user: AdminUser, role: 'applicant' | 'reviewer' | 'admin') => {
    setOpenRoleMenuId(null);
    try {
      await updateUser(user.id, { role });
      addToast('success', `Role updated to ${role}`);
      void refetch();
    } catch {
      addToast('error', 'Failed to update role');
    }
  };

  const handleReactivate = async (user: AdminUser) => {
    try {
      await updateUser(user.id, { isActive: true });
      addToast('success', 'User reactivated');
      void refetch();
    } catch {
      addToast('error', 'Failed to reactivate user');
    }
  };

  return (
    <AppShell bare title="User Management">
      <title>User Management — Permit Management System</title>

      <div className="min-h-screen bg-surface-base">
        <div className="max-w-screen-xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-heading-xl text-text-primary">User Management</h1>
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
              + Add User
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-4">
            <div>
              <label htmlFor="filter-role" className="sr-only">Role</label>
              <select
                id="filter-role"
                aria-label="Role"
                className="px-3 py-2 rounded-sm border border-border-default bg-surface-card text-body-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-border-focus"
                value={filters.role ?? ''}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    role: e.target.value || undefined,
                    page: 1,
                  }))
                }
              >
                <option value="">All roles</option>
                <option value="applicant">Applicant</option>
                <option value="reviewer">Reviewer</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label htmlFor="filter-status" className="sr-only">Status</label>
              <select
                id="filter-status"
                aria-label="Status"
                className="px-3 py-2 rounded-sm border border-border-default bg-surface-card text-body-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-border-focus"
                value={filters.isActive === undefined ? '' : String(filters.isActive)}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    isActive:
                      e.target.value === ''
                        ? undefined
                        : e.target.value === 'true',
                    page: 1,
                  }))
                }
              >
                <option value="">All statuses</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            <input
              type="text"
              placeholder="Search by name or email…"
              aria-label="Search users"
              className="px-3 py-2 rounded-sm border border-border-default bg-surface-card text-body-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-border-focus"
              value={searchInput}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-feedback-error rounded-sm p-4 mb-4">
              <p className="text-body-sm text-feedback-error">{error}</p>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto rounded-sm border border-border-default bg-surface-card">
            <table className="w-full text-body-sm">
              <thead>
                <tr className="border-b border-border-default bg-surface-sidebar">
                  <th className="text-left px-4 py-3 text-label text-text-secondary font-medium">Name</th>
                  <th className="text-left px-4 py-3 text-label text-text-secondary font-medium">Email</th>
                  <th className="text-left px-4 py-3 text-label text-text-secondary font-medium">Role</th>
                  <th className="text-left px-4 py-3 text-label text-text-secondary font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-label text-text-secondary font-medium">Created</th>
                  <th className="text-left px-4 py-3 text-label text-text-secondary font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 8 }, (_, i) => (
                    <tr key={i} className="border-b border-border-default">
                      <td colSpan={6} className="px-4 py-3">
                        <Skeleton height="h-5" />
                      </td>
                    </tr>
                  ))
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-text-secondary">
                      <p className="text-body-md">No users found</p>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-border-default hover:bg-surface-sidebar transition-colors"
                    >
                      <td className="px-4 py-3 text-text-primary font-medium">{user.fullName}</td>
                      <td className="px-4 py-3 text-text-secondary">{user.email}</td>
                      <td className="px-4 py-3">
                        <Badge variant={ROLE_BADGE[user.role] ?? 'default'}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {user.isActive ? (
                          <span className="flex items-center gap-1 text-status-approved">
                            <span className="w-2 h-2 rounded-full bg-status-approved inline-block" />
                            Active
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-feedback-error">
                            <span className="text-sm">✗</span>
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        {user.isActive ? (
                          <div className="flex items-center gap-2">
                            {/* Role change dropdown */}
                            <div className="relative">
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() =>
                                  setOpenRoleMenuId(
                                    openRoleMenuId === user.id ? null : user.id,
                                  )
                                }
                                aria-haspopup="menu"
                                aria-expanded={openRoleMenuId === user.id}
                              >
                                Edit Role ▾
                              </Button>
                              {openRoleMenuId === user.id && (
                                <div
                                  role="menu"
                                  className="absolute left-0 mt-1 bg-surface-card border border-border-default rounded-sm shadow-md z-10 min-w-[140px]"
                                >
                                  {(['applicant', 'reviewer', 'admin'] as const).map(
                                    (role) => (
                                      <button
                                        key={role}
                                        role="menuitem"
                                        className={`block w-full text-left px-4 py-2 text-body-sm hover:bg-surface-sidebar transition-colors ${
                                          user.role === role
                                            ? 'font-medium text-brand-primary'
                                            : 'text-text-primary'
                                        }`}
                                        onClick={() => void handleRoleChange(user, role)}
                                      >
                                        {role.charAt(0).toUpperCase() + role.slice(1)}
                                      </button>
                                    ),
                                  )}
                                </div>
                              )}
                            </div>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => setDeactivateTarget(user)}
                            >
                              Deactivate
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => void handleReactivate(user)}
                          >
                            Reactivate
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-body-sm text-text-secondary">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false);
          void refetch();
        }}
      />

      {/* Deactivate Confirm Dialog */}
      {deactivateTarget && (
        <DeactivateConfirmDialog
          isOpen={!!deactivateTarget}
          onClose={() => setDeactivateTarget(null)}
          user={deactivateTarget}
          onSuccess={() => {
            setDeactivateTarget(null);
            void refetch();
          }}
        />
      )}
    </AppShell>
  );
}
