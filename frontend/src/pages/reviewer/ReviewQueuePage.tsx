import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { permitsApi } from '../../api/permits.api';
import type { ReviewQueueItem } from '../../types/permit.types';
import type { ApplicationStatus } from '../../types/permit.types';
import { PermitStatusBadge } from '../../components/permit/PermitStatusBadge';
import { AppShell } from '../../components/layout/AppShell';

// ─── Skeleton loading ─────────────────────────────────────────────────────────

function QueueRowSkeleton() {
  return (
    <tr className="animate-pulse">
      <td className="px-4 py-3">
        <div className="h-4 w-28 bg-gray-100 rounded" />
      </td>
      <td className="px-4 py-3">
        <div className="h-4 w-24 bg-gray-100 rounded" />
      </td>
      <td className="px-4 py-3">
        <div className="h-4 w-32 bg-gray-100 rounded" />
      </td>
      <td className="px-4 py-3">
        <div className="h-4 w-40 bg-gray-100 rounded" />
      </td>
      <td className="px-4 py-3">
        <div className="h-5 w-20 bg-gray-100 rounded" />
      </td>
      <td className="px-4 py-3">
        <div className="h-4 w-12 bg-gray-100 rounded" />
      </td>
      <td className="px-4 py-3">
        <div className="h-4 w-8 bg-gray-100 rounded" />
      </td>
    </tr>
  );
}

// ─── Tab definitions ──────────────────────────────────────────────────────────

type FilterTab = 'all' | 'needs_action' | 'awaiting_applicant' | 'done';

const TABS: { id: FilterTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'needs_action', label: 'Needs Action' },
  { id: 'awaiting_applicant', label: 'Awaiting Applicant' },
  { id: 'done', label: 'Done' },
];

function getStatusFilterForTab(tab: FilterTab): string | undefined {
  switch (tab) {
    case 'needs_action':
      return 'submitted,under_review';
    case 'awaiting_applicant':
      return 'additional_info_needed';
    case 'done':
      return 'approved,rejected';
    default:
      return undefined;
  }
}

const PERMIT_TYPE_LABELS: Record<string, string> = {
  construction: 'Construction',
  zoning_variance: 'Zoning Variance',
  event_permit: 'Event Permit',
  demolition: 'Demolition',
  renovation: 'Renovation',
  signage: 'Signage',
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export function ReviewQueuePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [assignment, setAssignment] = useState<'mine' | 'all'>('all');
  const [items, setItems] = useState<ReviewQueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQueue = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const tabStatus = getStatusFilterForTab(activeTab);
      const params: Record<string, string | number | undefined> = {
        page: 1,
        limit: 25,
        assignment: assignment === 'mine' ? 'Mine' : 'AllAvailable',
      };
      if (tabStatus) {
        params.status = tabStatus;
      } else if (statusFilter) {
        params.status = statusFilter;
      }
      const result = await permitsApi.getReviewQueue(params);
      setItems(result.data);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
        'Failed to load review queue.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, statusFilter, assignment]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const handleTabChange = (tab: FilterTab) => {
    setActiveTab(tab);
    setStatusFilter(''); // reset manual status filter when tab changes
  };

  return (
    <AppShell title="Review Queue">
      <div className="max-w-7xl mx-auto" data-testid="review-queue-page">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text-primary">Review Queue</h1>
          <p className="text-text-secondary mt-1 text-sm">
            Applications assigned to you and awaiting review
          </p>
        </div>

        {/* Quick-filter tabs */}
        <div className="border-b border-border-default mb-4" role="tablist" aria-label="Filter applications">
          <div className="flex gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                data-testid={`tab-${tab.id}`}
                onClick={() => handleTabChange(tab.id)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary rounded-t-md ${
                  activeTab === tab.id
                    ? 'border-brand-primary text-brand-primary'
                    : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border-default'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary filter bar */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-2">
            <label htmlFor="status-filter" className="text-sm text-text-secondary">
              Status:
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm border border-border-default rounded-md px-2 py-1 text-text-primary bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
            >
              <option value="">All</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="additional_info_needed">Additional Info Needed</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-text-secondary">Assignment:</label>
            <div className="flex rounded-md border border-border-default overflow-hidden">
              <button
                onClick={() => setAssignment('mine')}
                className={`px-3 py-1 text-sm transition-colors focus:outline-none ${
                  assignment === 'mine'
                    ? 'bg-brand-primary text-white'
                    : 'bg-white text-text-secondary hover:bg-surface-sidebar'
                }`}
              >
                Mine
              </button>
              <button
                onClick={() => setAssignment('all')}
                className={`px-3 py-1 text-sm border-l border-border-default transition-colors focus:outline-none ${
                  assignment === 'all'
                    ? 'bg-brand-primary text-white'
                    : 'bg-white text-text-secondary hover:bg-surface-sidebar'
                }`}
              >
                All Available
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-border-default overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-testid="review-queue-table">
              <thead>
                <tr className="border-b border-border-default bg-surface-sidebar">
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">Reference #</th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">Type</th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">Applicant</th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">Site</th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">Age</th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">Messages</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default">
                {isLoading ? (
                  Array.from({ length: 5 }, (_, i) => <QueueRowSkeleton key={i} />)
                ) : error ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-feedback-error">
                      {error}
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-text-secondary">
                      No applications found.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => {
                    const isOverdue = item.daysSinceSubmitted > 5;
                    return (
                      <tr
                        key={item.id}
                        data-testid="queue-row"
                        data-application-id={item.id}
                        onClick={() => navigate(`/review/${item.id}`)}
                        className={`cursor-pointer transition-colors hover:bg-surface-sidebar ${
                          isOverdue ? 'bg-amber-50' : ''
                        }`}
                      >
                        <td className="px-4 py-3 font-mono text-text-primary font-medium">
                          {item.referenceNumber}
                        </td>
                        <td className="px-4 py-3 text-text-secondary">
                          {PERMIT_TYPE_LABELS[item.permitType] ?? item.permitType}
                        </td>
                        <td className="px-4 py-3 text-text-primary">{item.applicantName}</td>
                        <td className="px-4 py-3 text-text-secondary truncate max-w-xs">
                          {item.siteAddressSummary}
                        </td>
                        <td className="px-4 py-3">
                          <PermitStatusBadge status={item.status as ApplicationStatus} />
                        </td>
                        <td className="px-4 py-3">
                          {isOverdue ? (
                            <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
                              <span aria-hidden="true">⏱</span>
                              {item.daysSinceSubmitted}d
                            </span>
                          ) : (
                            <span className="text-text-secondary">{item.daysSinceSubmitted}d</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {item.unreadMessageCount > 0 ? (
                            <span
                              className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold"
                              aria-label={`${item.unreadMessageCount} unread messages`}
                            >
                              {item.unreadMessageCount > 9 ? '9+' : item.unreadMessageCount}
                            </span>
                          ) : (
                            <span className="text-text-disabled">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
