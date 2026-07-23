import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { useAuditLog } from '../../hooks/useAdmin';
import { adminApi } from '../../api/admin.api';
import { useUiStore } from '../../store/ui.store';
import { AppShell } from '../../components/layout/AppShell';
import type { AuditLogQuery } from '../../types/admin.types';

const KNOWN_ACTIONS = [
  'USER_CREATED',
  'USER_DEACTIVATED',
  'USER_REACTIVATED',
  'USER_ROLE_CHANGED',
  'REVIEWER_ASSIGNED',
  'STATUS_CHANGED',
  'REVIEW_STARTED',
  'INFO_REQUESTED',
  'INFO_RESPONDED',
  'PERMIT_DECIDED',
  'PERMIT_SUBMITTED',
];

const ACTOR_ROLE_BADGE: Record<string, 'primary' | 'warning' | 'error' | 'default'> = {
  admin: 'error',
  reviewer: 'warning',
  applicant: 'primary',
};

function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60_000);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hrs > 0) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
  if (mins > 0) return `${mins} minute${mins > 1 ? 's' : ''} ago`;
  return 'just now';
}

export function AuditLogPage() {
  const [filters, setFilters] = useState<AuditLogQuery>({ limit: 50 });
  const addToast = useUiStore((s) => s.addToast);

  const { entries, nextCursor, loading, error, loadMore, setFilters: applyFilters } =
    useAuditLog(filters);

  const handleFilterChange = (patch: Partial<AuditLogQuery>) => {
    const updated = { ...filters, ...patch };
    setFilters(updated);
    applyFilters(updated);
  };

  const handleExportCsv = async () => {
    try {
      const res = await adminApi.exportAuditLogCsv(filters);
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      addToast('error', 'Failed to export CSV');
    }
  };

  return (
    <AppShell bare title="Audit Log">
      <title>Audit Log — Permit Management System</title>

      <div className="min-h-screen bg-surface-base">
        <div className="max-w-screen-xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-heading-xl text-text-primary">Audit Log</h1>
            <Button
              variant="secondary"
              onClick={() => void handleExportCsv()}
              aria-label="Export CSV"
            >
              Export CSV
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-4">
            <div>
              <label htmlFor="filter-action" className="sr-only">Action</label>
              <select
                id="filter-action"
                aria-label="Action"
                className="px-3 py-2 rounded-sm border border-border-default bg-surface-card text-body-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-border-focus"
                value={filters.action ?? ''}
                onChange={(e) =>
                  handleFilterChange({ action: e.target.value || undefined })
                }
              >
                <option value="">All actions</option>
                {KNOWN_ACTIONS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
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

            <input
              type="text"
              placeholder="Actor ID…"
              aria-label="Actor ID"
              className="px-3 py-2 rounded-sm border border-border-default bg-surface-card text-body-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-border-focus"
              value={filters.actorId ?? ''}
              onChange={(e) =>
                handleFilterChange({ actorId: e.target.value || undefined })
              }
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
                  <th className="text-left px-4 py-3 text-label text-text-secondary font-medium">Timestamp</th>
                  <th className="text-left px-4 py-3 text-label text-text-secondary font-medium">Actor</th>
                  <th className="text-left px-4 py-3 text-label text-text-secondary font-medium">Action</th>
                  <th className="text-left px-4 py-3 text-label text-text-secondary font-medium">Application</th>
                  <th className="text-left px-4 py-3 text-label text-text-secondary font-medium">Details</th>
                  <th className="text-left px-4 py-3 text-label text-text-secondary font-medium">IP Address</th>
                </tr>
              </thead>
              <tbody>
                {loading && entries.length === 0 ? (
                  Array.from({ length: 8 }, (_, i) => (
                    <tr key={i} className="border-b border-border-default">
                      <td colSpan={6} className="px-4 py-3">
                        <Skeleton height="h-5" />
                      </td>
                    </tr>
                  ))
                ) : entries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-text-secondary">
                      <p className="text-body-md">No audit log entries found</p>
                    </td>
                  </tr>
                ) : (
                  entries.map((entry) => (
                    <tr
                      key={entry.id}
                      className="border-b border-border-default hover:bg-surface-sidebar transition-colors"
                    >
                      <td className="px-4 py-3 text-text-secondary whitespace-nowrap">
                        <span title={entry.occurredAt}>
                          {formatRelativeTime(entry.occurredAt)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-text-primary">{entry.actorName}</span>
                          <Badge variant={ACTOR_ROLE_BADGE[entry.actorRole] ?? 'default'}>
                            {entry.actorRole}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <code className="text-caption bg-surface-sidebar px-1.5 py-0.5 rounded">
                          {entry.action}
                        </code>
                      </td>
                      <td className="px-4 py-3">
                        {entry.applicationId ? (
                          <Link
                            to={`/permits/${entry.applicationId}`}
                            className="text-brand-primary hover:underline"
                          >
                            {entry.applicationRef ?? entry.applicationId.slice(0, 8)}
                          </Link>
                        ) : (
                          <span className="text-text-disabled">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 max-w-[200px]">
                        {/* Render details as escaped JSON — NEVER dangerouslySetInnerHTML (T-05-10) */}
                        <pre className="text-caption text-text-secondary whitespace-pre-wrap break-all overflow-hidden max-h-16">
                          {JSON.stringify(entry.details, null, 2)}
                        </pre>
                      </td>
                      <td className="px-4 py-3 text-text-secondary font-mono text-caption">
                        {entry.ipAddress}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Load More */}
          {nextCursor && (
            <div className="flex justify-center mt-4">
              <Button
                variant="secondary"
                onClick={loadMore}
                loading={loading}
                disabled={loading}
              >
                Load More
              </Button>
            </div>
          )}

          {!loading && entries.length === 0 ? null : !nextCursor && entries.length > 0 ? (
            <p className="text-center text-text-secondary text-body-sm mt-4">
              All entries loaded ({entries.length} total)
            </p>
          ) : null}
        </div>
      </div>
    </AppShell>
  );
}
