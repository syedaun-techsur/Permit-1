import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard } from 'lucide-react';

export const Sidebar: React.FC = () => (
  <aside className="w-60 bg-surface-sidebar border-r border-border-default flex flex-col flex-shrink-0">
    <nav className="p-4 flex-1" aria-label="Main navigation">
      <NavLink
        to="/dashboard"
        className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2 rounded-md text-body-sm transition-colors duration-150 ${
            isActive
              ? 'bg-brand-primary text-white'
              : 'text-text-secondary hover:bg-surface-card hover:text-text-primary'
          }`
        }
      >
        <LayoutDashboard className="w-4 h-4" aria-hidden="true" />
        Dashboard
      </NavLink>
    </nav>
  </aside>
);
