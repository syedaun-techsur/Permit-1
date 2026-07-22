import { formatDistanceToNow } from 'date-fns';
import type { AuditLogEntry } from '../../types/dashboard.types';

interface ActivityFeedItemProps {
  item: AuditLogEntry;
}

// Map action strings to border/accent colors
const ACTION_COLOR: Record<string, string> = {
  'permit.submitted':      'border-blue-400',
  'permit.approved':       'border-green-400',
  'permit.rejected':       'border-red-400',
  'permit.under_review':   'border-yellow-400',
  'permit.info_requested': 'border-orange-400',
  'permit.resubmitted':    'border-purple-400',
};

function actionLabel(action: string): string {
  return action.replace(/\./g, ' › ').replace(/_/g, ' ');
}

export function ActivityFeedItem({ item }: ActivityFeedItemProps) {
  const borderColor = ACTION_COLOR[item.action] ?? 'border-gray-300';
  return (
    <div className={`border-l-4 ${borderColor} pl-3 py-2`}>
      <p className="text-sm text-gray-800 capitalize">{actionLabel(item.action)}</p>
      <p className="text-xs text-gray-400">
        {item.actorName} · {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
      </p>
    </div>
  );
}
