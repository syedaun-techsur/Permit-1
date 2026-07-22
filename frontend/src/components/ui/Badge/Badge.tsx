import React from 'react';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' |
  'draft' | 'submitted' | 'under_review' | 'additional_info' | 'approved' | 'rejected';

export interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default:         'bg-surface-sidebar text-text-secondary',
  primary:         'bg-blue-100 text-brand-primary',
  success:         'bg-green-100 text-status-approved',
  warning:         'bg-amber-100 text-status-under_review',
  error:           'bg-red-100 text-feedback-error',
  info:            'bg-blue-100 text-brand-primary',
  draft:           'bg-slate-100 text-status-draft',
  submitted:       'bg-blue-100 text-status-submitted',
  under_review:    'bg-amber-100 text-status-under_review',
  additional_info: 'bg-orange-100 text-status-additional_info',
  approved:        'bg-green-100 text-status-approved',
  rejected:        'bg-red-100 text-status-rejected',
};

export const Badge: React.FC<BadgeProps> = ({ variant = 'default', children, className = '' }) => (
  <span
    className={`inline-flex items-center px-2 py-0.5 rounded-sm text-caption font-medium ${variantClasses[variant]} ${className}`}
  >
    {children}
  </span>
);
