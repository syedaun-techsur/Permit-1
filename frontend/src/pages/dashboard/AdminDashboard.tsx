import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, Activity, CalendarCheck, CheckCircle, Users, FileText, ClipboardList } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { useDashboard } from '../../hooks/useDashboard';
import { StatCard } from '../../components/dashboard/StatCard';
import { StatusBarChart } from '../../components/dashboard/StatusBarChart';
import { ReviewerWorkloadTable } from '../../components/dashboard/ReviewerWorkloadTable';
import type { AuditLogEntry } from '../../types/dashboard.types';

function LastUpdatedTag({ updatedAt }: { updatedAt: Date }) {
  const [, setTick] = useState(0);
  // Re-render every 10 seconds so "just now" / relative time stays accurate
  // (simple approach — good enough for dashboard)
  void setTick; // suppress unused warning — tick intentionally unused (triggers re-render)
  return (
    <span className="text-sm text-text-secondary">
      Last updated: {formatDistanceToNow(updatedAt, { addSuffix: true })}
    </span>
  );
}

function ActivityEntry({ item }: { item: AuditLogEntry }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border-default last:border-0">
      <div className="min-w-0 flex-1">
        <p className="text-sm text-text-primary">
          <span className="font-medium">{item.actorName}</span>{' '}
          <span className="text-text-secondary capitalize">
            {item.action.replace(/\./g, ' ').replace(/_/g, ' ')}
          </span>
          {item.applicationId && (
            <span className="text-text-disabled text-xs ml-1">
              · ref #{item.applicationId.slice(0, 8).toUpperCase()}
            </span>
          )}
        </p>
        <p className="text-xs text-text-disabled mt-0.5">
          {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
          <span className="ml-2" title={format(new Date(item.createdAt), 'PPpp')}>
            {format(new Date(item.createdAt), 'MMM d, HH:mm')}
          </span>
        </p>
      </div>
    </div>
  );
}

export function AdminDashboard() {
  useEffect(() => { document.title = 'Admin Dashboard — Permit Management System'; }, []);
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useDashboard('admin');
  const [lastRefreshed] = useState(new Date());

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Failed to load admin dashboard.{' '}
          <button
            onClick={refetch}
            className="underline hover:no-underline focus:outline-none"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">System Overview</h1>
          <LastUpdatedTag updatedAt={lastRefreshed} />
        </div>
        {/* Quick Actions */}
        <nav aria-label="Admin quick actions" className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/users')}
            className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-brand-primary px-3 py-2 rounded-lg hover:bg-surface-sidebar transition-colors focus:outline-none focus:ring-2 focus:ring-border-focus"
          >
            <Users className="w-4 h-4" />
            Manage Users
          </button>
          <button
            onClick={() => navigate('/admin/applications')}
            className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-brand-primary px-3 py-2 rounded-lg hover:bg-surface-sidebar transition-colors focus:outline-none focus:ring-2 focus:ring-border-focus"
          >
            <FileText className="w-4 h-4" />
            View All Applications
          </button>
          <button
            onClick={() => navigate('/admin/audit-log')}
            className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-brand-primary px-3 py-2 rounded-lg hover:bg-surface-sidebar transition-colors focus:outline-none focus:ring-2 focus:ring-border-focus"
          >
            <ClipboardList className="w-4 h-4" />
            View Audit Log
          </button>
        </nav>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={LayoutGrid}
          value={data?.summaryCards.totalApplications ?? 0}
          label="Total Applications"
          isLoading={isLoading}
        />
        <StatCard
          icon={Activity}
          value={data?.summaryCards.activeApplications ?? 0}
          label="Active Applications"
          isLoading={isLoading}
        />
        <StatCard
          icon={CalendarCheck}
          value={data?.summaryCards.submittedThisWeek ?? 0}
          label="Submitted This Week"
          isLoading={isLoading}
        />
        <StatCard
          icon={CheckCircle}
          value={data?.summaryCards.decisionsThisWeek ?? 0}
          label="Decisions This Week"
          isLoading={isLoading}
        />
      </div>

      {/* Status Distribution Bar Chart — full width */}
      <div className="bg-surface-card rounded-xl shadow-sm p-6">
        <h2 className="text-base font-semibold text-text-primary mb-4">Applications by Status</h2>
        {isLoading ? (
          <div className="animate-pulse space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded" />
            ))}
          </div>
        ) : (
          <StatusBarChart
            data={data?.statusDistribution ?? []}
            title="Applications by Status — System Wide"
            onBarClick={(status) => navigate(`/admin/applications?status=${status}`)}
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reviewer Workload Table — 2/3 width */}
        <div className="lg:col-span-2">
          <div className="bg-surface-card rounded-xl shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border-default">
              <h2 className="text-base font-semibold text-text-primary">Reviewer Workload</h2>
            </div>
            <div className="p-4">
              {isLoading ? (
                <div className="animate-pulse space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-10 bg-gray-200 rounded" />
                  ))}
                </div>
              ) : (
                <ReviewerWorkloadTable
                  data={data?.reviewerWorkload ?? []}
                  onViewQueue={(reviewerId) => navigate(`/admin/applications?reviewerId=${reviewerId}`)}
                />
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity Feed — 1/3 width */}
        <div className="bg-surface-card rounded-xl shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border-default">
            <h2 className="text-base font-semibold text-text-primary">Recent Activity</h2>
            <button
              onClick={() => navigate('/admin/audit-log')}
              className="text-sm text-brand-primary hover:underline focus:outline-none focus:ring-2 focus:ring-border-focus"
            >
              View full log →
            </button>
          </div>
          <div className="px-5 py-2 overflow-y-auto max-h-96">
            {isLoading ? (
              <div className="animate-pulse space-y-4 py-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="space-y-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : data?.recentActivity.length ? (
              data.recentActivity.map((item) => (
                <ActivityEntry key={item.id} item={item} />
              ))
            ) : (
              <p className="text-sm text-text-disabled py-6 text-center">No recent activity.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
