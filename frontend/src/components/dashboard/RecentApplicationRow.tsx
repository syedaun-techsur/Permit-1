import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, AlertCircle } from 'lucide-react';
import type { RecentApplication } from '../../types/dashboard.types';

interface RecentApplicationRowProps {
  application: RecentApplication;
  onClick: (id: string) => void;
}

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  draft:                   { label: 'Draft',           className: 'bg-gray-100 text-gray-600' },
  submitted:               { label: 'Submitted',       className: 'bg-blue-100 text-blue-700' },
  under_review:            { label: 'Under Review',    className: 'bg-yellow-100 text-yellow-700' },
  additional_info_needed:  { label: 'Action Required', className: 'bg-orange-100 text-orange-700' },
  approved:                { label: 'Approved',        className: 'bg-green-100 text-green-700' },
  rejected:                { label: 'Rejected',        className: 'bg-red-100 text-red-700' },
};

export function RecentApplicationRow({ application, onClick }: RecentApplicationRowProps) {
  const badge = STATUS_BADGE[application.status] ?? { label: application.status, className: 'bg-gray-100 text-gray-600' };
  const isActionRequired = application.status === 'additional_info_needed';

  return (
    <button
      onClick={() => onClick(application.id)}
      className={`w-full text-left flex items-center gap-4 px-4 py-3 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors rounded-lg ${isActionRequired ? 'border-l-4 border-orange-400' : ''}`}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {application.permitType}
          {isActionRequired && (
            <span className="ml-2 inline-flex items-center gap-1 text-orange-600 text-xs font-semibold">
              <AlertCircle className="w-3 h-3" /> Action Required
            </span>
          )}
        </p>
        <p className="text-xs text-gray-400">
          #{application.referenceNumber || application.id.slice(0, 8).toUpperCase()} · Updated {formatDistanceToNow(new Date(application.updatedAt), { addSuffix: true })}
        </p>
      </div>
      <span className={`shrink-0 text-xs font-medium px-2 py-1 rounded-full ${badge.className}`}>
        {badge.label}
      </span>
      {application.unreadMessageCount > 0 && (
        <span className="shrink-0 flex items-center gap-1 text-xs text-brand-primary font-semibold">
          <MessageSquare className="w-3.5 h-3.5" />
          {application.unreadMessageCount}
        </span>
      )}
    </button>
  );
}
