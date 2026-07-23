import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, LayoutList, Users, ClipboardList } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { UserRole } from '../../types/auth.types';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 px-3 py-2 rounded-md text-body-sm transition-colors duration-150 ${
    isActive
      ? 'bg-brand-primary text-white'
      : 'text-text-secondary hover:bg-surface-card hover:text-text-primary'
  }`;

export const Sidebar: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <aside className="w-60 bg-surface-sidebar border-r border-border-default flex flex-col flex-shrink-0">
      <nav className="p-4 flex-1 flex flex-col gap-1" aria-label="Main navigation">
        {/* Main nav */}
        <NavLink to="/dashboard" className={navLinkClass}>
          <LayoutDashboard className="w-4 h-4" aria-hidden="true" />
          Dashboard
        </NavLink>

        {/* Admin section — visible only to admins */}
        {user?.role === UserRole.ADMIN && (
          <>
            <div className="mt-4 mb-1 px-3">
              <span className="text-caption text-text-disabled uppercase tracking-wider font-semibold">
                Admin
              </span>
            </div>

            <NavLink to="/admin/applications" className={navLinkClass}>
              <LayoutList className="w-4 h-4" aria-hidden="true" />
              All Apps
            </NavLink>

            <NavLink to="/admin/users" className={navLinkClass}>
              <Users className="w-4 h-4" aria-hidden="true" />
              Users
            </NavLink>

            <NavLink to="/admin/audit-log" className={navLinkClass}>
              <ClipboardList className="w-4 h-4" aria-hidden="true" />
              Audit Log
            </NavLink>
          </>
        )}
      </nav>
    </aside>
  );
};
