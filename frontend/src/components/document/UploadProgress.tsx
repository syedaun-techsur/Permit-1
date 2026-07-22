import React from 'react';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import type { UploadFileState } from '../../types/document.types';

interface UploadProgressProps {
  uploads: UploadFileState[];
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export const UploadProgress: React.FC<UploadProgressProps> = ({ uploads }) => {
  if (!uploads.length) return null;

  return (
    <ul className="mt-3 space-y-2" aria-label="Upload progress">
      {uploads.map((upload) => (
        <li
          key={upload.filename}
          className="flex flex-col gap-1 p-3 bg-surface-sidebar rounded-md border border-border-default"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-body-sm text-text-primary truncate flex-1 min-w-0">
              {upload.filename}
            </span>
            <span className="text-body-sm text-text-secondary shrink-0">
              {formatFileSize(upload.file.size)}
            </span>

            {/* Status icon */}
            {upload.status === 'queued' && (
              <Clock
                className="w-4 h-4 text-text-secondary shrink-0"
                aria-label="Queued"
              />
            )}
            {upload.status === 'uploaded' && (
              <CheckCircle
                className="w-4 h-4 text-feedback-success shrink-0"
                aria-label="Uploaded"
              />
            )}
            {upload.status === 'error' && (
              <XCircle
                className="w-4 h-4 text-feedback-error shrink-0"
                aria-label="Error"
              />
            )}
          </div>

          {/* Progress bar */}
          {upload.status === 'uploading' && (
            <div className="w-full">
              <div
                className="w-full h-1.5 bg-surface-card rounded-full overflow-hidden"
                role="progressbar"
                aria-valuenow={upload.progress}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-full bg-brand-primary rounded-full transition-all duration-200"
                  style={{ width: `${upload.progress}%` }}
                />
              </div>
              <span className="text-body-sm text-text-secondary mt-0.5 block">
                {upload.progress}%
              </span>
            </div>
          )}

          {/* Inline error message */}
          {upload.status === 'error' && upload.error && (
            <span className="text-body-sm text-feedback-error">
              {upload.error}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
};
