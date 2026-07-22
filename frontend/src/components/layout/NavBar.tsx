import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Bell, LogOut, Menu, Plus, User, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';

export const NavBar: React.FC = () => {
  const { user, handleLogout } = useAuth();
  const { unreadCount } = useNotifications();
  const [mobileOpen, setMobileOpen] = useState(false);

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
            <NavLink to="/permits" className={navLinkClass}>
              My Applications
            </NavLink>
            <NavLink to="/permits/new" className={navLinkClass}>
              <Plus className="w-4 h-4" aria-hidden="true" />
              New Application
            </NavLink>
          </nav>

          {/* Desktop right side */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Notification bell */}
            <div className="relative">
              <button
                className="relative p-2 text-text-secondary hover:text-text-primary hover:bg-surface-sidebar rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary active:opacity-80"
                aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
              >
                <Bell className="w-5 h-5" aria-hidden="true" />
                {notificationBadge}
              </button>
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
            <div className="relative">
              <button
                className="relative p-2 text-text-secondary hover:text-text-primary hover:bg-surface-sidebar rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary active:opacity-80"
                aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
              >
                <Bell className="w-5 h-5" aria-hidden="true" />
                {notificationBadge}
              </button>
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
