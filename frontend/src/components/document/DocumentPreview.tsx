import React, { useState, useEffect, useCallback } from 'react';
import { FileText, X, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import { documentsApi } from '../../api/documents.api';
import { triggerBlobDownload } from '../../lib/download';
import { Skeleton } from '../ui/Skeleton';
import type { PermitDocument } from '../../types/document.types';

// Configure pdf.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

interface DocumentPreviewProps {
  document: PermitDocument;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({ document }) => {
  const [presignedUrl, setPresignedUrl] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);

  const mimeType = document.mime_type;
  const isImage = mimeType === 'image/jpeg' || mimeType === 'image/png';
  const isPdf = mimeType === 'application/pdf';
  const isDocx =
    mimeType ===
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

  // For images: fetch the bytes as a blob on mount and preview via object URL.
  useEffect(() => {
    if (!isImage) return;
    let cancelled = false;
    setIsLoadingUrl(true);
    documentsApi
      .downloadDocumentBlob(document.application_id, document.id)
      .then((blob) => {
        if (!cancelled) setPresignedUrl(URL.createObjectURL(blob));
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setIsLoadingUrl(false);
      });
    return () => {
      cancelled = true;
    };
  }, [document.id, document.application_id, isImage]);

  // Revoke the object URL when it changes or on unmount to avoid leaks.
  useEffect(() => {
    return () => {
      if (presignedUrl && presignedUrl.startsWith('blob:')) {
        URL.revokeObjectURL(presignedUrl);
      }
    };
  }, [presignedUrl]);

  const fetchPdfUrl = useCallback(async () => {
    if (presignedUrl) return; // already fetched
    setIsLoadingUrl(true);
    try {
      const blob = await documentsApi.downloadDocumentBlob(
        document.application_id,
        document.id,
      );
      setPresignedUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error('Failed to fetch document:', err);
    } finally {
      setIsLoadingUrl(false);
    }
  }, [document.id, document.application_id, presignedUrl]);

  const handlePdfToggle = async () => {
    if (!pdfOpen) {
      await fetchPdfUrl();
    }
    setPdfOpen((prev) => !prev);
    setPageNumber(1);
  };

  const handleDownload = async () => {
    try {
      const blob = await documentsApi.downloadDocumentBlob(
        document.application_id,
        document.id,
      );
      triggerBlobDownload(blob, document.filename);
    } catch (err) {
      console.error('Failed to download document:', err);
    }
  };

  if (isImage) {
    return (
      <>
        {/* Thumbnail */}
        <div className="mt-2">
          {isLoadingUrl ? (
            <Skeleton height="h-20" className="w-24" />
          ) : presignedUrl ? (
            <button
              onClick={() => setLightboxOpen(true)}
              className="focus:outline-none focus:ring-2 focus:ring-brand-primary rounded"
              aria-label={`Preview ${document.filename}`}
            >
              <img
                src={presignedUrl}
                alt={document.filename}
                className="max-h-20 object-cover rounded border border-border-default cursor-pointer hover:opacity-80 transition-opacity"
              />
            </button>
          ) : null}
        </div>

        {/* Lightbox */}
        {lightboxOpen && presignedUrl && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
            onClick={() => setLightboxOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label={`Full size preview: ${document.filename}`}
          >
            <button
              className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 focus:outline-none"
              onClick={() => setLightboxOpen(false)}
              aria-label="Close lightbox"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={presignedUrl}
              alt={document.filename}
              className="max-h-[90vh] max-w-[90vw] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </>
    );
  }

  if (isPdf) {
    return (
      <div className="mt-2">
        <button
          onClick={handlePdfToggle}
          className="text-body-sm text-brand-primary hover:underline focus:outline-none"
        >
          {pdfOpen ? 'Hide PDF' : 'View PDF'}
        </button>

        {pdfOpen && (
          <div className="mt-2 border border-border-default rounded overflow-hidden">
            {isLoadingUrl && (
              <div className="p-4">
                <Skeleton lines={3} />
              </div>
            )}
            {presignedUrl && (
              <>
                <Document
                  file={presignedUrl}
                  onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                  loading={
                    <div className="p-4">
                      <Skeleton lines={3} />
                    </div>
                  }
                  className="flex justify-center bg-surface-sidebar p-2"
                >
                  <Page pageNumber={pageNumber} width={400} />
                </Document>
                {numPages > 1 && (
                  <div className="flex items-center justify-center gap-3 p-2 border-t border-border-default bg-surface-sidebar">
                    <button
                      onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                      disabled={pageNumber <= 1}
                      className="text-text-secondary hover:text-text-primary disabled:opacity-40"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-body-sm text-text-secondary">
                      {pageNumber} / {numPages}
                    </span>
                    <button
                      onClick={() =>
                        setPageNumber((p) => Math.min(numPages, p + 1))
                      }
                      disabled={pageNumber >= numPages}
                      className="text-text-secondary hover:text-text-primary disabled:opacity-40"
                      aria-label="Next page"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  if (isDocx) {
    return (
      <div className="mt-2 flex items-center gap-2">
        <FileText className="w-5 h-5 text-text-secondary" aria-hidden="true" />
        <button
          onClick={handleDownload}
          className="text-body-sm text-brand-primary hover:underline flex items-center gap-1"
        >
          Download to view
          <ExternalLink className="w-3 h-3" aria-hidden="true" />
        </button>
      </div>
    );
  }

  return null;
};
