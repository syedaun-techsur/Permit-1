import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { AssignReviewerModal } from '../../components/admin/AssignReviewerModal';
import { useAdminPermits } from '../../hooks/useAdmin';
import type { AdminPermit, AdminPermitsQuery } from '../../types/admin.types';

const STATUS_COLORS: Record<string, 'draft' | 'submitted' | 'under_review' | 'additional_info' | 'approved' | 'rejected' | 'default'> = {
  draft: 'draft',
  submitted: 'submitted',
  under_review: 'under_review',
  additional_info_needed: 'additional_info',
  approved: 'approved',
  rejected: 'rejected',
};

const PAGE_SIZE = 25;

export function AdminApplicationsPage() {
  const [filters, setFilters] = useState<AdminPermitsQuery>({
    page: 1,
    limit: PAGE_SIZE,
    sortOrder: 'DESC',
    sortBy: 'submittedAt',
  });
  const [assignTarget, setAssignTarget] = useState<AdminPermit | null>(null);

  const { permits, total, page, loading, error, setPage, refetch } =
    useAdminPermits(filters);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleFilterChange = (patch: Partial<AdminPermitsQuery>) => {
    setFilters((prev) => ({ ...prev, ...patch, page: 1 }));
    setPage(1);
  };

  return (
    <>
      <title>All Applications — Permit Management System</title>

      <div className="min-h-screen bg-surface-base">
        <div className="max-w-screen-xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-heading-xl text-text-primary">All Applications</h1>
            {!loading && (
              <p className="text-body-sm text-text-secondary mt-1">
                {total} application{total !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-4">
            <div>
              <label htmlFor="filter-status" className="sr-only">
                Status
              </label>
              <select
                id="filter-status"
                aria-label="Status"
                className="px-3 py-2 rounded-sm border border-border-default bg-surface-card text-body-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-border-focus"
                value={filters.status ?? ''}
                onChange={(e) =>
                  handleFilterChange({ status: e.target.value || undefined })
                }
              >
                <option value="">All statuses</option>
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="additional_info_needed">Additional Info Needed</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label htmlFor="filter-type" className="sr-only">
                Permit Type
              </label>
              <select
                id="filter-type"
                aria-label="Permit Type"
                className="px-3 py-2 rounded-sm border border-border-default bg-surface-card text-body-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-border-focus"
                value={filters.permitType ?? ''}
                onChange={(e) =>
                  handleFilterChange({ permitType: e.target.value || undefined })
                }
              >
                <option value="">All types</option>
                <option value="construction">Construction</option>
                <option value="zoning_variance">Zoning Variance</option>
                <option value="event_permit">Event Permit</option>
                <option value="demolition">Demolition</option>
                <option value="renovation">Renovation</option>
                <option value="signage">Signage</option>
              </select>
            </div>

            <div>
              <label htmlFor="filter-from" className="sr-only">From date</label>
              <input
                id="filter-from"
                type="date"
                aria-label="From date"
                className="px-3 py-2 rounded-sm border border-border-default bg-surface-card text-body-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-border-focus"
                value={filters.from ?? ''}
                onChange={(e) =>
                  handleFilterChange({ from: e.target.value || undefined })
                }
              />
            </div>

            <div>
              <label htmlFor="filter-to" className="sr-only">To date</label>
              <input
                id="filter-to"
                type="date"
                aria-label="To date"
                className="px-3 py-2 rounded-sm border border-border-default bg-surface-card text-body-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-border-focus"
                value={filters.to ?? ''}
                onChange={(e) =>
                  handleFilterChange({ to: e.target.value || undefined })
                }
              />
            </div>

            {(filters.status || filters.permitType || filters.from || filters.to) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setFilters({ page: 1, limit: PAGE_SIZE, sortOrder: 'DESC', sortBy: 'submittedAt' })
                }
              >
                Clear filters
              </Button>
            )}
          </div>

          {/* Error state */}
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
                  <th className="text-left px-4 py-3 text-label text-text-secondary font-medium">Reference #</th>
                  <th className="text-left px-4 py-3 text-label text-text-secondary font-medium">Type</th>
                  <th className="text-left px-4 py-3 text-label text-text-secondary font-medium">Applicant</th>
                  <th className="text-left px-4 py-3 text-label text-text-secondary font-medium">Reviewer</th>
                  <th className="text-left px-4 py-3 text-label text-text-secondary font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-label text-text-secondary font-medium">Submitted</th>
                  <th className="text-left px-4 py-3 text-label text-text-secondary font-medium">Updated</th>
                  <th className="text-left px-4 py-3 text-label text-text-secondary font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 8 }, (_, i) => (
                    <tr key={i} className="border-b border-border-default">
                      <td colSpan={8} className="px-4 py-3">
                        <Skeleton height="h-5" />
                      </td>
                    </tr>
                  ))
                ) : permits.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-text-secondary">
                      <p className="text-body-md mb-2">No applications found</p>
                      <button
                        className="text-brand-primary text-body-sm underline"
                        onClick={() =>
                          setFilters({
                            page: 1,
                            limit: PAGE_SIZE,
                            sortOrder: 'DESC',
                            sortBy: 'submittedAt',
                          })
                        }
                      >
                        Clear filters
                      </button>
                    </td>
                  </tr>
                ) : (
                  permits.map((permit) => (
                    <tr
                      key={permit.id}
                      className="border-b border-border-default hover:bg-surface-sidebar transition-colors"
                    >
                      <td className="px-4 py-3">
                        <Link
                          to={`/permits/${permit.id}`}
                          className="text-brand-primary hover:underline font-medium"
                        >
                          {permit.referenceNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-text-primary capitalize">
                        {permit.permitType.replace(/_/g, ' ')}
                      </td>
                      <td className="px-4 py-3 text-text-primary">{permit.applicantName}</td>
                      <td className="px-4 py-3">
                        {permit.assignedReviewerName ? (
                          <span className="text-text-primary">{permit.assignedReviewerName}</span>
                        ) : (
                          <span className="text-text-disabled">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={STATUS_COLORS[permit.status] ?? 'default'}>
                          {permit.status.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        {permit.submittedAt
                          ? new Date(permit.submittedAt).toLocaleDateString()
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        {new Date(permit.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setAssignTarget(permit)}
                        >
                          Assign Reviewer
                        </Button>
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

      {/* Assign Reviewer Modal */}
      {assignTarget && (
        <AssignReviewerModal
          isOpen={!!assignTarget}
          onClose={() => setAssignTarget(null)}
          permit={assignTarget}
          onSuccess={() => {
            setAssignTarget(null);
            void refetch();
          }}
        />
      )}
    </>
  );
}
