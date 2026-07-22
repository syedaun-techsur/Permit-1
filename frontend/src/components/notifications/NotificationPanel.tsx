import React, { useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';
import { Skeleton } from '../ui/Skeleton';
import { useAuthStore } from '../../store/auth.store';
import { UserRole } from '../../types/auth.types';

function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay === 1) return 'Yesterday';
  return `${diffDay}d ago`;
}

export interface NotificationPanelProps {
  onClose: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ onClose }) => {
  const { notifications, notifLoading, loadNotifications, markOneRead, markAllRead } =
    useNotifications();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isReviewer = user?.role === UserRole.REVIEWER || user?.role === UserRole.ADMIN;

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  const handleNotificationClick = async (notifId: string, applicationId: string) => {
    await markOneRead(notifId);
    onClose();
    const path = isReviewer ? `/review/${applicationId}` : `/applications/${applicationId}`;
    navigate(path);
  };

  const handleMarkAllRead = async () => {
    await markAllRead();
  };

  return (
    <div
      data-testid="notification-panel"
      className="absolute top-full right-0 mt-2 w-80 bg-surface-card border border-border-default rounded-lg shadow-lg z-50"
      role="dialog"
      aria-label="Notifications"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-default">
        <h3 className="text-label text-text-primary font-semibold">Notifications</h3>
        <button
          type="button"
          onClick={() => { void handleMarkAllRead(); }}
          className="text-xs text-brand-primary hover:underline focus:outline-none focus:ring-2 focus:ring-brand-primary rounded"
        >
          Mark all as read
        </button>
      </div>

      {/* List */}
      <div className="max-h-[400px] overflow-y-auto">
        {notifLoading && (
          <div className="p-4 flex flex-col gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                <Skeleton lines={2} className="flex-1" />
              </div>
            ))}
          </div>
        )}

        {!notifLoading && notifications.length === 0 && (
          <div className="px-4 py-8 text-center">
            <p className="text-text-secondary text-body-sm">No notifications yet.</p>
          </div>
        )}

        {!notifLoading && notifications.length > 0 && (
          <ul>
            {notifications.map((notif) => (
              <li key={notif.id}>
                <button
                  type="button"
                  className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-surface-base transition-colors border-b border-border-default last:border-0 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-primary ${
                    !notif.isRead ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => { void handleNotificationClick(notif.id, notif.applicationId); }}
                >
                  <Bell
                    className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      notif.isRead ? 'text-text-secondary' : 'text-brand-primary'
                    }`}
                    aria-hidden="true"
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-body-sm break-words line-clamp-2 ${
                        notif.isRead ? 'text-text-secondary' : 'text-text-primary'
                      }`}
                    >
                      {notif.body}
                    </p>
                    <p className="text-caption text-text-disabled mt-0.5">
                      {formatRelativeTime(notif.createdAt)}
                    </p>
                  </div>
                  {!notif.isRead && (
                    <div className="w-2 h-2 rounded-full bg-brand-primary flex-shrink-0 mt-2" aria-hidden="true" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
