import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Clock, Inbox, MessageSquare } from 'lucide-react';
import { useDashboard } from '../../hooks/useDashboard';
import { useAuthStore } from '../../store/auth.store';
import { StatCard } from '../../components/dashboard/StatCard';
import { ActivityFeedItem } from '../../components/dashboard/ActivityFeedItem';
import { StatusDonutChart } from '../../components/dashboard/StatusDonutChart';
import type { PriorityQueueItem, StatusDistributionItem } from '../../types/dashboard.types';

function getGreeting(): string {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

function ageHeatClass(days: number): string {
  if (days < 3) return 'text-green-600 bg-green-50';
  if (days <= 5) return 'text-amber-600 bg-amber-50';
  return 'text-red-600 bg-red-50';
}

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  submitted:              { label: 'Submitted',    className: 'bg-blue-100 text-blue-700' },
  under_review:           { label: 'Under Review', className: 'bg-yellow-100 text-yellow-700' },
  additional_info_needed: { label: 'Info Needed',  className: 'bg-orange-100 text-orange-700' },
};

function PriorityQueueRow({ item, onView }: { item: PriorityQueueItem; onView: (id: string) => void }) {
  const badge = STATUS_BADGE[item.status] ?? { label: item.status, className: 'bg-gray-100 text-gray-600' };
  const heat = ageHeatClass(item.daysSinceSubmission);
  return (
    <tr className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3">
        <p className="text-sm font-medium text-gray-900">{item.permitType}</p>
        <p className="text-xs text-gray-400">#{item.referenceNumber || item.id.slice(0, 8).toUpperCase()}</p>
      </td>
      <td className="px-4 py-3 text-sm text-gray-700">{item.applicantName}</td>
      <td className="px-4 py-3">
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${badge.className}`}>{badge.label}</span>
      </td>
      <td className="px-4 py-3">
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${heat}`}>
          {item.daysSinceSubmission}d
        </span>
      </td>
      <td className="px-4 py-3">
        {item.unreadMessageCount > 0 && (
          <span className="flex items-center gap-1 text-xs text-brand-primary font-semibold">
            <MessageSquare className="w-3.5 h-3.5" />
            {item.unreadMessageCount}
          </span>
        )}
      </td>
      <td className="px-4 py-3">
        <button
          onClick={() => onView(item.id)}
          className="text-xs text-brand-primary hover:underline focus:outline-none focus:ring-2 focus:ring-brand-primary"
        >
          Review →
        </button>
      </td>
    </tr>
  );
}

export function ReviewerDashboard() {
  useEffect(() => { document.title = 'Dashboard — Permit Management System'; }, []);
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const firstName = user?.fullName?.split(' ')[0] ?? 'Reviewer';
  const { data, isLoading, error, refetch } = useDashboard('reviewer');

  const needsActionCount = (data?.priorityQueue?.filter(
    a => a.status === 'additional_info_needed'
  ).length ?? 0) + (data?.summaryCards?.awaitingResponse ?? 0);

  // Build statusDistribution from priorityQueue for the donut
  const statusDistribution: StatusDistributionItem[] = (() => {
    if (!data?.priorityQueue?.length) return [];
    const counts: Record<string, number> = {};
    data.priorityQueue.forEach(a => { counts[a.status] = (counts[a.status] || 0) + 1; });
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
      {/* Contextual greeting */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {getGreeting()}, {firstName}.{' '}
          {needsActionCount > 0
            ? `You have ${needsActionCount} application${needsActionCount !== 1 ? 's' : ''} needing action today.`
            : 'Everything is up to date.'}
        </h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={ClipboardList}
          value={data?.summaryCards.assignedApplications ?? 0}
          label="Assigned Applications"
          isLoading={isLoading}
        />
        <StatCard
          icon={Clock}
          value={data?.summaryCards.awaitingResponse ?? 0}
          label="Awaiting Response"
          accentWhen={data?.summaryCards.awaitingResponse}
          accentColor="orange"
          isLoading={isLoading}
        />
        <StatCard
          icon={Inbox}
          value={data?.summaryCards.unassignedInPool ?? 0}
          label="Unassigned In Pool"
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
        {/* Priority Queue — main panel */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Priority Queue</h2>
            <button
              onClick={() => navigate('/review/queue')}
              className="text-sm text-brand-primary hover:underline focus:outline-none focus:ring-2 focus:ring-brand-primary"
            >
              View All Queue →
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Application</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Applicant</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Age</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Msgs</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-t border-gray-100 animate-pulse">
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 bg-gray-200 rounded" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : data?.priorityQueue.length ? (
                  data.priorityQueue.map(item => (
                    <PriorityQueueRow
                      key={item.id}
                      item={item}
                      onView={(id) => navigate(`/review/${id}`)}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-400">
                      No applications assigned. Check the submission pool for new applications.{' '}
                      <button onClick={() => navigate('/review/queue')} className="text-brand-primary hover:underline">
                        View queue
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Status Distribution Donut */}
          {statusDistribution.length > 0 && (
            <div className="px-5 pb-5 pt-2 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Your Queue Distribution</h3>
              <StatusDonutChart
                data={statusDistribution}
                title="Reviewer Queue Status Distribution"
              />
            </div>
          )}
        </div>

        {/* Activity Feed */}
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
                  <ActivityFeedItem item={item} />
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
