import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { DocumentPreview } from './DocumentPreview';
import { useDocumentUpload } from '../../hooks/useDocumentUpload';
import type { ApplicationStatus, PermitDocument } from '../../types/document.types';

interface DocumentListProps {
  applicationId: string;
  applicationStatus: ApplicationStatus;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

const canModify = (status: ApplicationStatus) =>
  status === 'draft' || status === 'additional_info_needed';

export const DocumentList: React.FC<DocumentListProps> = ({
  applicationId,
  applicationStatus,
}) => {
  const { documents, removeDocument } = useDocumentUpload({ applicationId });
  const [confirmDoc, setConfirmDoc] = useState<PermitDocument | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleRemoveConfirm = async () => {
    if (!confirmDoc) return;
    setIsDeleting(true);
    try {
      await removeDocument(confirmDoc.id);
      setConfirmDoc(null);
    } catch (err) {
      console.error('Failed to delete document:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!documents.length) {
    return (
      <p className="text-body-sm text-text-secondary mt-2">
        No documents uploaded yet.
      </p>
    );
  }

  return (
    <>
      <ul className="mt-3 space-y-3" aria-label="Uploaded documents">
        {documents.map((doc) => (
          <li
            key={doc.id}
            className="p-3 bg-surface-card border border-border-default rounded-md"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-body-sm font-medium text-text-primary truncate">
                  {doc.filename}
                </p>
                <p className="text-body-sm text-text-secondary">
                  {formatFileSize(doc.size_bytes)} ·{' '}
                  {formatRelativeTime(doc.uploaded_at)}
                </p>
                <DocumentPreview document={doc} />
              </div>

              {/* Remove button — only shown for draft/additional_info_needed */}
              {canModify(applicationStatus) && (
                <button
                  onClick={() => setConfirmDoc(doc)}
                  className="shrink-0 p-1.5 text-text-secondary hover:text-feedback-error rounded focus:outline-none focus:ring-2 focus:ring-feedback-error transition-colors"
                  aria-label={`Remove ${doc.filename}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>

      {/* Remove confirmation dialog */}
      <Modal
        open={!!confirmDoc}
        onClose={() => setConfirmDoc(null)}
        title="Remove Document"
        size="sm"
      >
        <p className="text-body-md text-text-primary mb-4">
          Remove &quot;{confirmDoc?.filename}&quot;? This cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={() => setConfirmDoc(null)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleRemoveConfirm}
            loading={isDeleting}
          >
            Remove
          </Button>
        </div>
      </Modal>
    </>
  );
};
