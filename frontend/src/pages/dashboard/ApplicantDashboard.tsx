import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, AlertCircle, MessageSquare, Plus } from 'lucide-react';
import { useDashboard } from '../../hooks/useDashboard';
import { useAuthStore } from '../../store/auth.store';
import { StatCard } from '../../components/dashboard/StatCard';
import { RecentApplicationRow } from '../../components/dashboard/RecentApplicationRow';
import { StatusDonutChart } from '../../components/dashboard/StatusDonutChart';
import { formatDistanceToNow } from 'date-fns';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function ApplicantDashboard() {
  useEffect(() => { document.title = 'Dashboard — Permit Management System'; }, []);
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const firstName = user?.fullName?.split(' ')[0] ?? 'there';
  const { data, isLoading, error, refetch } = useDashboard('applicant');

  const isEmpty = !isLoading && data &&
    data.recentApplications.length === 0 &&
    data.pendingActions.length === 0;

  // Build status distribution from recentApplications for the donut chart
  const statusDistribution = (() => {
    if (!data?.recentApplications?.length) return [];
    const counts: Record<string, number> = {};
    data.recentApplications.forEach(a => {
      counts[a.status] = (counts[a.status] || 0) + 1;
    });
    return Object.entries(counts).map(([status, count]) => ({ status, count }));
  })();

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Failed to load dashboard.{' '}
          <button onClick={refetch} className="underline hover:no-underline">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {getGreeting()}, {firstName}. Here's an overview of your permits.
          </h1>
        </div>
        <button
          onClick={() => navigate('/permits/new')}
          className="inline-flex items-center gap-2 bg-brand-primary hover:opacity-90 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary"
        >
          <Plus className="w-4 h-4" />
          New Application
        </button>
      </div>

      {/* Empty State */}
      {isEmpty && (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-6">You have no permit applications yet. Start your first application.</p>
          <button
            onClick={() => navigate('/permits/new')}
            className="inline-flex items-center gap-2 bg-brand-primary hover:opacity-90 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Start Your First Application
          </button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={FileText}
          value={data?.summaryCards.activeApplications ?? 0}
          label="Active Applications"
          isLoading={isLoading}
        />
        <StatCard
          icon={AlertCircle}
          value={data?.summaryCards.actionRequired ?? 0}
          label="Action Required"
          accentWhen={data?.summaryCards.actionRequired}
          accentColor="orange"
          isLoading={isLoading}
        />
        <StatCard
          icon={MessageSquare}
          value={data?.summaryCards.unreadMessages ?? 0}
          label="Unread Messages"
          accentWhen={data?.summaryCards.unreadMessages}
          accentColor="primary"
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pending Actions */}
          {(data?.pendingActions?.length ?? 0) > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-5">
              <h2 className="text-base font-semibold text-orange-800 mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> Pending Actions
              </h2>
              <ul className="space-y-3">
                {data!.pendingActions.map(action => (
                  <li key={action.id} className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900">#{action.referenceNumber || action.id.slice(0, 8).toUpperCase()}</p>
                      {action.infoRequestNote && (
                        <p className="text-xs text-gray-500 truncate max-w-xs">{action.infoRequestNote}</p>
                      )}
                    </div>
                    <button
                      onClick={() => navigate(`/permits/${action.id}`)}
                      className="shrink-0 text-xs font-semibold bg-orange-600 hover:bg-orange-700 text-white px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Respond
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recent Applications */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">Recent Applications</h2>
              <button
                onClick={() => navigate('/permits')}
                className="text-sm text-brand-primary hover:underline focus:outline-none focus:ring-2 focus:ring-brand-primary"
              >
                View all →
              </button>
            </div>
            <div>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex gap-4 px-5 py-3 animate-pulse border-b border-gray-50 last:border-0">
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                    </div>
                    <div className="h-5 bg-gray-200 rounded-full w-20 shrink-0" />
                  </div>
                ))
              ) : data?.recentApplications.length ? (
                data.recentApplications.map(app => (
                  <RecentApplicationRow
                    key={app.id}
                    application={app}
                    onClick={(id) => navigate(`/permits/${id}`)}
                  />
                ))
              ) : (
                <p className="px-5 py-6 text-sm text-gray-400 text-center">No recent applications.</p>
              )}
            </div>
          </div>

          {/* Status Distribution Donut (only if has applications) */}
          {statusDistribution.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Status Distribution</h2>
              <StatusDonutChart
                data={statusDistribution}
                onSliceClick={(status) => navigate(`/permits?status=${status}`)}
              />
            </div>
          )}
        </div>

        {/* Activity Feed column */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Activity Feed</h2>
          {isLoading ? (
            <div className="space-y-3 animate-pulse">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-10 bg-gray-100 rounded" />
              ))}
            </div>
          ) : data?.activityFeed.length ? (
            <ul className="space-y-4">
              {data.activityFeed.map(item => (
                <li key={item.id}>
                  <div className="border-l-4 border-brand-primary pl-3 py-1">
                    <p className="text-sm text-gray-800">{item.body}</p>
                    <p className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400">No recent activity.</p>
          )}
        </div>
      </div>
    </div>
  );
}
