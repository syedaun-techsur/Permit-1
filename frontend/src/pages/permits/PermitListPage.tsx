import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { permitsApi } from '../../api/permits.api';
import { usePermitsStore } from '../../store/permits.store';
import { PermitCard } from '../../components/permit/PermitCard';
import type { ApplicationStatus } from '../../types/permit.types';

type FilterTab = 'all' | ApplicationStatus;

const FILTER_TABS: Array<{ value: FilterTab; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'under_review', label: 'Under Review' },
];

const SKELETON_COUNT = 5;

function PermitCardSkeleton() {
  return (
    <div
      className="h-28 rounded-lg bg-gray-100 animate-pulse"
      aria-busy="true"
      aria-label="Loading..."
      data-testid="permit-card-skeleton"
    />
  );
}

export function PermitListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { permitList, isLoading, setPermitList, setLoading } = usePermitsStore();
  const [error, setError] = useState<string | null>(null);

  const activeFilter = (searchParams.get('status') as FilterTab) ?? 'all';

  useEffect(() => {
    const fetchPermits = async () => {
      setLoading(true);
      setError(null);
      try {
        const statusParam =
          activeFilter !== 'all' ? (activeFilter as ApplicationStatus) : undefined;
        const result = await permitsApi.listPermits({ status: statusParam });
        setPermitList(result.data, result.nextCursor, result.totalCount);
      } catch {
        setError('Failed to load applications. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    void fetchPermits();
  }, [activeFilter, setPermitList, setLoading]);

  const handleFilterChange = (tab: FilterTab) => {
    if (tab === 'all') {
      searchParams.delete('status');
    } else {
      searchParams.set('status', tab);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-heading-xl text-text-primary font-bold">My Applications</h1>
        <Link
          to="/permits/new"
          className="inline-flex items-center justify-center gap-2 font-medium rounded-md text-body-sm px-4 py-2 h-10 bg-brand-primary text-white hover:bg-blue-700 active:bg-blue-800 border border-transparent transition-all duration-150 ease-in-out active:scale-[0.98]"
          data-testid="new-application-button"
        >
          New Application
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-4 border-b border-border-default overflow-x-auto">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleFilterChange(tab.value)}
            className={`px-4 py-2 text-body-sm font-medium border-b-2 transition-colors duration-150 whitespace-nowrap -mb-px ${
              activeFilter === tab.value
                ? 'border-brand-primary text-brand-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border-default'
            }`}
            data-testid={`filter-tab-${tab.value}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Error state */}
      {error && (
        <div
          role="alert"
          className="bg-red-50 border border-red-200 rounded-md p-4 text-feedback-error text-body-sm"
        >
          {error}
        </div>
      )}

      {/* Loading state: skeleton cards */}
      {isLoading && !error && (
        <div className="space-y-3">
          {Array.from({ length: SKELETON_COUNT }, (_, i) => (
            <PermitCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && permitList.length === 0 && (
        <div
          className="text-center py-16"
          data-testid="empty-state"
        >
          <p className="text-body-lg text-text-secondary mb-4">
            No applications yet. Start your first permit application.
          </p>
          <Link
            to="/permits/new"
            className="inline-flex items-center justify-center gap-2 font-medium rounded-md text-body-sm px-4 py-2 h-10 bg-brand-primary text-white hover:bg-blue-700 active:bg-blue-800 border border-transparent transition-all duration-150 ease-in-out active:scale-[0.98]"
            data-testid="empty-state-new-button"
          >
            New Application
          </Link>
        </div>
      )}

      {/* Permit list */}
      {!isLoading && !error && permitList.length > 0 && (
        <div className="space-y-3">
          {permitList.map((permit) => (
            <PermitCard key={permit.id} permit={permit} />
          ))}
        </div>
      )}
    </div>
  );
}
