import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Card } from '../ui/Card';
import { PermitStatusBadge } from './PermitStatusBadge';
import type { PermitApplication } from '../../types/permit.types';

interface PermitCardProps {
  permit: PermitApplication;
}

const PERMIT_TYPE_LABELS: Record<string, string> = {
  construction: 'Construction',
  zoning_variance: 'Zoning Variance',
  event_permit: 'Event Permit',
  demolition: 'Demolition',
  renovation: 'Renovation',
  signage: 'Signage',
};

export const PermitCard: React.FC<PermitCardProps> = ({ permit }) => {
  const isAdditionalInfoNeeded = permit.status === 'additional_info_needed';
  const isDraft = permit.status === 'draft';

  const actionPath = isDraft
    ? `/permits/${permit.id}/edit`
    : `/permits/${permit.id}`;
  const actionLabel = isDraft ? 'Continue' : 'View';

  const updatedAt = new Date(permit.updated_at);
  const relativeTime = formatDistanceToNow(updatedAt, { addSuffix: true });

  return (
    <Card
      padding="md"
      className={`hover:shadow-md transition-shadow duration-150 ${
        isAdditionalInfoNeeded ? 'border-l-4 border-orange-400' : ''
      }`}
      data-testid="permit-card"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        {/* Left: permit info */}
        <div className="flex-1 min-w-0">
          <p
            className="font-mono font-bold text-body-md text-text-primary truncate"
            data-testid="permit-reference"
          >
            {permit.reference_number}
          </p>
          <p className="text-body-sm text-text-secondary capitalize mt-0.5">
            {PERMIT_TYPE_LABELS[permit.permit_type] ?? permit.permit_type}
          </p>
          <p className="text-body-sm text-text-secondary mt-0.5 truncate">
            {permit.site_street}, {permit.site_city}
          </p>
        </div>

        {/* Right: status badge + time */}
        <div className="flex flex-row sm:flex-col items-start sm:items-end gap-2 sm:gap-1 shrink-0">
          <PermitStatusBadge status={permit.status} />
          <p className="text-caption text-text-secondary whitespace-nowrap">{relativeTime}</p>
        </div>
      </div>

      {/* Action button */}
      <div className="mt-3 flex justify-end">
        <Link
          to={actionPath}
          className="inline-flex items-center justify-center gap-2 font-medium rounded-md text-body-sm px-3 py-1.5 h-8 bg-surface-card text-text-primary hover:bg-surface-sidebar active:bg-surface-sidebar border border-border-default transition-all duration-150 ease-in-out active:scale-[0.98]"
          data-testid={isDraft ? 'continue-button' : 'view-button'}
        >
          {actionLabel}
        </Link>
      </div>
    </Card>
  );
};
