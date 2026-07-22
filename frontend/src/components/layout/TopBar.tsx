import React from 'react';
import { LogOut, User } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';

export const TopBar: React.FC = () => {
  const { user, handleLogout } = useAuth();

  return (
    <header className="h-14 bg-surface-card border-b border-border-default flex items-center justify-between px-6 flex-shrink-0">
      <span className="text-heading-md text-text-primary font-semibold">PermitFlow</span>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-body-sm text-text-secondary">
          <User className="w-4 h-4" aria-hidden="true" />
          <span>{user?.fullName}</span>
          <span className="text-text-disabled">·</span>
          <span className="capitalize">{user?.role}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout} leftIcon={<LogOut className="w-4 h-4" />}>
          Log out
        </Button>
      </div>
    </header>
  );
};
