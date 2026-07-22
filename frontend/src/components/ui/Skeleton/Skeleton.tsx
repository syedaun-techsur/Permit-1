import React from 'react';

export interface SkeletonProps {
  className?: string;
  lines?: number;
  height?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', lines = 1, height = 'h-4' }) => {
  if (lines > 1) {
    return (
      <div className={`flex flex-col gap-2 ${className}`} aria-busy="true" aria-label="Loading...">
        {Array.from({ length: lines }, (_, i) => (
          <div
            key={i}
            className={`skeleton-shimmer rounded-sm ${height} ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
          />
        ))}
      </div>
    );
  }
  return (
    <div
      className={`skeleton-shimmer rounded-sm ${height} ${className}`}
      aria-busy="true"
      aria-label="Loading..."
    />
  );
};
