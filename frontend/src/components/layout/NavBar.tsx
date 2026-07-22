import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Bell, ClipboardList, LogOut, Menu, Plus, User, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import { UserRole } from '../../types/auth.types';
import { NotificationPanel } from '../notifications/NotificationPanel';

export const NavBar: React.FC = () => {
  const { user, handleLogout } = useAuth();
  const { unreadCount } = useNotifications();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const desktopNotifRef = useRef<HTMLDivElement>(null);
  const mobileNotifRef = useRef<HTMLDivElement>(null);

  // Click-outside handler to close notification panel
  useEffect(() => {
    if (!notifOpen) return;

    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const inDesktop = desktopNotifRef.current?.contains(target);
      const inMobile = mobileNotifRef.current?.contains(target);
      if (!inDesktop && !inMobile) {
        setNotifOpen(false);
      }
    };

    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [notifOpen]);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-3 py-2 rounded-md text-body-sm font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brand-primary active:opacity-80 ${
      isActive
        ? 'bg-brand-primary text-white'
        : 'text-text-secondary hover:bg-surface-sidebar hover:text-text-primary'
    }`;

  const notificationBadge = unreadCount > 0 ? (
    <span
      className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center leading-none"
      aria-label={`${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
    >
      {unreadCount > 9 ? '9+' : unreadCount}
    </span>
  ) : null;

  return (
    <header className="bg-surface-card border-b border-border-default">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link
            to="/"
            className="text-heading-md text-text-primary font-semibold hover:text-brand-primary transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary rounded-sm"
          >
            PermitFlow
          </Link>

          {/* Desktop nav */}
          <nav
            className="hidden lg:flex items-center gap-2"
            aria-label="Main navigation"
            data-testid="desktop-nav"
          >
            {/* Reviewer/Admin: Review Queue link */}
            {(user?.role === UserRole.REVIEWER || user?.role === UserRole.ADMIN) && (
              <NavLink
                to="/review/queue"
                data-testid="nav-review-queue"
                className={({ isActive }) =>
                  navLinkClass({ isActive: isActive || window.location.pathname.startsWith('/review/') })
                }
              >
                <ClipboardList className="w-4 h-4" aria-hidden="true" />
                Review Queue
              </NavLink>
            )}

            {/* Applicant links */}
            {(!user?.role || user.role === UserRole.APPLICANT) && (
              <>
                <NavLink to="/permits" className={navLinkClass}>
                  My Applications
                </NavLink>
                <NavLink to="/permits/new" className={navLinkClass}>
                  <Plus className="w-4 h-4" aria-hidden="true" />
                  New Application
                </NavLink>
              </>
            )}
          </nav>

          {/* Desktop right side */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Notification bell with dropdown */}
            <div className="relative" ref={desktopNotifRef}>
              <button
                type="button"
                data-testid="notification-bell"
                onClick={() => setNotifOpen((o) => !o)}
                className="relative p-2 text-text-secondary hover:text-text-primary hover:bg-surface-sidebar rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary active:opacity-80"
                aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
                aria-expanded={notifOpen}
                aria-haspopup="dialog"
              >
                <Bell className="w-5 h-5" aria-hidden="true" />
                {notificationBadge}
              </button>
              {notifOpen && (
                <NotificationPanel onClose={() => setNotifOpen(false)} />
              )}
            </div>

            {/* User info */}
            <div className="flex items-center gap-2 text-body-sm text-text-secondary">
              <User className="w-4 h-4" aria-hidden="true" />
              <span>{user?.fullName}</span>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-body-sm text-text-secondary hover:bg-surface-sidebar hover:text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary active:opacity-80"
              aria-label="Log out"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
              Log out
            </button>
          </div>

          {/* Mobile right: bell + hamburger */}
          <div className="flex lg:hidden items-center gap-2">
            {/* Notification bell (always visible on mobile) */}
            <div className="relative" ref={mobileNotifRef}>
              <button
                type="button"
                data-testid="notification-bell"
                onClick={() => setNotifOpen((o) => !o)}
                className="relative p-2 text-text-secondary hover:text-text-primary hover:bg-surface-sidebar rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary active:opacity-80"
                aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
                aria-expanded={notifOpen}
                aria-haspopup="dialog"
              >
                <Bell className="w-5 h-5" aria-hidden="true" />
                {notificationBadge}
              </button>
              {notifOpen && (
                <NotificationPanel onClose={() => setNotifOpen(false)} />
              )}
            </div>

            {/* Hamburger button */}
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface-sidebar rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary active:opacity-80"
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              data-testid="hamburger-button"
            >
              {mobileOpen ? (
                <X className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Menu className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          id="mobile-menu"
          className="lg:hidden border-t border-border-default bg-surface-card"
          role="navigation"
          aria-label="Mobile navigation"
        >
          <div className="max-w-7xl mx-auto px-4 py-3 space-y-1">
            {/* Reviewer/Admin: Review Queue link */}
            {(user?.role === UserRole.REVIEWER || user?.role === UserRole.ADMIN) && (
              <NavLink
                to="/review/queue"
                data-testid="nav-review-queue"
                className={navLinkClass}
                onClick={() => setMobileOpen(false)}
              >
                <ClipboardList className="w-4 h-4" aria-hidden="true" />
                Review Queue
              </NavLink>
            )}

            {/* Applicant links */}
            {(!user?.role || user.role === UserRole.APPLICANT) && (
              <>
                <NavLink
                  to="/permits"
                  className={navLinkClass}
                  onClick={() => setMobileOpen(false)}
                >
                  My Applications
                </NavLink>
                <NavLink
                  to="/permits/new"
                  className={navLinkClass}
                  onClick={() => setMobileOpen(false)}
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                  New Application
                </NavLink>
              </>
            )}

            {/* Divider */}
            <div className="border-t border-border-default pt-3 mt-3">
              <div className="flex items-center gap-2 px-3 py-2 text-body-sm text-text-secondary">
                <User className="w-4 h-4" aria-hidden="true" />
                <span>{user?.fullName}</span>
              </div>
              <button
                onClick={() => {
                  setMobileOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-body-sm text-text-secondary hover:bg-surface-sidebar hover:text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary active:opacity-80"
              >
                <LogOut className="w-4 h-4" aria-hidden="true" />
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
