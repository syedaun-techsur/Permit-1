import React from 'react';
import type { ApplicationStatus } from '../../types/permit.types';

interface PermitStatusBadgeProps {
  status: ApplicationStatus;
  className?: string;
}

const statusConfig: Record<ApplicationStatus, { label: string; classes: string }> = {
  draft: {
    label: 'Draft',
    classes: 'bg-gray-100 text-gray-700',
  },
  submitted: {
    label: 'Submitted',
    classes: 'bg-blue-100 text-blue-700',
  },
  under_review: {
    label: 'Under Review',
    classes: 'bg-yellow-100 text-yellow-700',
  },
  additional_info_needed: {
    label: 'Info Needed',
    classes: 'bg-orange-100 text-orange-700',
  },
  approved: {
    label: 'Approved',
    classes: 'bg-green-100 text-green-700',
  },
  rejected: {
    label: 'Rejected',
    classes: 'bg-red-100 text-red-700',
  },
};

export const PermitStatusBadge: React.FC<PermitStatusBadgeProps> = ({ status, className = '' }) => {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-sm text-caption font-medium ${config.classes} ${className}`}
      data-testid="permit-status-badge"
      data-status={status}
    >
      {config.label}
    </span>
  );
};
