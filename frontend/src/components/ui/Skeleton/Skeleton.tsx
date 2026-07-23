import React from 'react';

export interface SkeletonProps {
  className?: string;
  lines?: number;
  height?: string;
  /** Accessible label describing what is loading; defaults to "Loading..." */
  label?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  lines = 1,
  height = 'h-4',
  label = 'Loading...',
}) => {
  if (lines > 1) {
    return (
      <div
        className={`flex flex-col gap-2 ${className}`}
        aria-busy="true"
        aria-label={label}
        role="status"
      >
        {Array.from({ length: lines }, (_, i) => (
          <div
            key={i}
            className={`skeleton-shimmer motion-reduce:animate-none rounded-sm ${height} ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
            aria-hidden="true"
          />
        ))}
      </div>
    );
  }
  return (
    <div
      className={`skeleton-shimmer motion-reduce:animate-none rounded-sm ${height} ${className}`}
      aria-busy="true"
      aria-label={label}
      role="status"
    />
  );
};
