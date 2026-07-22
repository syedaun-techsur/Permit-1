import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export const Card: React.FC<CardProps> = ({ padding = 'md', className = '', children, ...props }) => (
  <div
    className={`bg-surface-card rounded-md shadow-sm border border-border-default ${paddingClasses[padding]} ${className}`}
    {...props}
  >
    {children}
  </div>
);
