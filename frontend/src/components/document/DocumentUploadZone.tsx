import React, { useCallback } from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';
import { UploadCloud } from 'lucide-react';
import { useDocumentUpload } from '../../hooks/useDocumentUpload';
import { UploadProgress } from './UploadProgress';
import { DocumentList } from './DocumentList';
import type { ApplicationStatus } from '../../types/document.types';

interface DocumentUploadZoneProps {
  applicationId: string;
  applicationStatus: ApplicationStatus;
  onDocumentsChange?: () => void;
}

const ACCEPTED_MIME_TYPES = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
};

const MAX_FILE_SIZE = 26214400; // 25 MB

const isEditable = (status: ApplicationStatus) =>
  status === 'draft' || status === 'additional_info_needed';

export const DocumentUploadZone: React.FC<DocumentUploadZoneProps> = ({
  applicationId,
  applicationStatus,
  onDocumentsChange,
}) => {
  const { uploadFiles, uploadQueue } = useDocumentUpload({
    applicationId,
    onUploadComplete: () => {
      onDocumentsChange?.();
    },
  });

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      // Upload accepted files via hook (hook also does client-side validation)
      if (acceptedFiles.length > 0) {
        uploadFiles(acceptedFiles);
      }
      // For dropzone-rejected files (size/type pre-filtered by dropzone config),
      // pass them through the hook so they appear in the queue with error state
      if (rejectedFiles.length > 0) {
        uploadFiles(rejectedFiles.map((rf) => rf.file));
      }
    },
    [uploadFiles],
  );

  const disabled = !isEditable(applicationStatus);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: ACCEPTED_MIME_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: true,
    disabled,
    onDrop,
    noClick: true, // We handle click via the Browse Files button
  });

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={[
          'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
          isDragActive
            ? 'border-brand-primary bg-blue-50'
            : disabled
              ? 'border-border-default bg-surface-sidebar opacity-60 cursor-not-allowed'
              : 'border-border-default bg-surface-card hover:border-brand-primary cursor-default',
        ].join(' ')}
        data-testid="upload-zone"
        aria-disabled={disabled}
      >
        <input {...getInputProps()} aria-label="File upload input" />

        <div className="flex flex-col items-center gap-3">
          <UploadCloud
            className={`w-10 h-10 ${isDragActive ? 'text-brand-primary' : 'text-text-secondary'}`}
            aria-hidden="true"
          />

          {isDragActive ? (
            <p className="text-body-md font-medium text-brand-primary">
              Drop files here…
            </p>
          ) : (
            <>
              <p className="text-body-md text-text-secondary">
                Drag &amp; drop files here, or
              </p>
              <button
                type="button"
                onClick={disabled ? undefined : open}
                disabled={disabled}
                className={[
                  'text-body-sm font-medium px-4 py-2 rounded-md border',
                  disabled
                    ? 'border-border-default text-text-disabled cursor-not-allowed'
                    : 'border-brand-primary text-brand-primary hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-brand-primary',
                ].join(' ')}
                data-testid="browse-files-button"
              >
                Browse Files
              </button>
            </>
          )}

          <p className="text-body-sm text-text-secondary mt-1">
            Accepted: PDF, JPEG, PNG, DOCX · Max 25 MB per file · Max 20 files · Max 100 MB total
          </p>
        </div>
      </div>

      {/* Upload progress list */}
      <UploadProgress uploads={uploadQueue} />

      {/* Uploaded documents list */}
      <DocumentList
        applicationId={applicationId}
        applicationStatus={applicationStatus}
      />
    </div>
  );
};
