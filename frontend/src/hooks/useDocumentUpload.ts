import { useState, useCallback, useEffect } from 'react';
import { documentsApi } from '../api/documents.api';
import type { PermitDocument, UploadFileState } from '../types/document.types';

// Allowed MIME types
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const;

type AllowedMimeType = typeof ALLOWED_MIME_TYPES[number];

// Max file size: 25 MB in bytes
const MAX_FILE_SIZE_BYTES = 26214400;

// Max filename length
const MAX_FILENAME_LENGTH = 255;

interface UseDocumentUploadOptions {
  applicationId: string;
  onUploadComplete?: (doc: PermitDocument) => void;
  onUploadError?: (filename: string, error: string) => void;
}

interface UseDocumentUploadReturn {
  uploadFiles: (files: File[]) => Promise<void>;
  documents: PermitDocument[];
  uploadQueue: UploadFileState[];
  fetchDocuments: () => Promise<void>;
  removeDocument: (docId: string) => Promise<void>;
  isLoadingDocuments: boolean;
}

export function useDocumentUpload({
  applicationId,
  onUploadComplete,
  onUploadError,
}: UseDocumentUploadOptions): UseDocumentUploadReturn {
  const [documents, setDocuments] = useState<PermitDocument[]>([]);
  const [uploadQueue, setUploadQueue] = useState<UploadFileState[]>([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);

  const fetchDocuments = useCallback(async () => {
    if (!applicationId) return;
    setIsLoadingDocuments(true);
    try {
      const docs = await documentsApi.listDocuments(applicationId);
      setDocuments(docs);
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    } finally {
      setIsLoadingDocuments(false);
    }
  }, [applicationId]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const updateQueueItem = useCallback(
    (filename: string, update: Partial<UploadFileState>) => {
      setUploadQueue((prev) =>
        prev.map((item) =>
          item.filename === filename ? { ...item, ...update } : item,
        ),
      );
    },
    [],
  );

  const uploadSingleFile = useCallback(
    async (file: File): Promise<void> => {
      const filename = file.name;

      // Client-side validation — before any network request
      if (!ALLOWED_MIME_TYPES.includes(file.type as AllowedMimeType)) {
        updateQueueItem(filename, { status: 'error', error: 'Invalid file type' });
        onUploadError?.(filename, 'Invalid file type');
        return;
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        updateQueueItem(filename, { status: 'error', error: 'File too large (max 25 MB)' });
        onUploadError?.(filename, 'File too large (max 25 MB)');
        return;
      }

      if (filename.length > MAX_FILENAME_LENGTH) {
        updateQueueItem(filename, {
          status: 'error',
          error: 'Filename too long (max 255 characters)',
        });
        onUploadError?.(filename, 'Filename too long');
        return;
      }

      // Set status: uploading
      updateQueueItem(filename, { status: 'uploading', progress: 0 });

      try {
        // Single multipart upload straight to the API; the backend stores the
        // file server-side and returns the created document record.
        const doc = await documentsApi.uploadDocument(applicationId, file, (progress) =>
          updateQueueItem(filename, { progress }),
        );

        updateQueueItem(filename, { status: 'uploaded', progress: 100, document: doc });
        setDocuments((prev) => [...prev, doc]);
        onUploadComplete?.(doc);
      } catch (err) {
        const axiosErr = err as {
          response?: { data?: { message?: string } };
          message?: string;
        };
        const errorMessage =
          axiosErr.response?.data?.message ?? axiosErr.message ?? 'Upload failed';
        updateQueueItem(filename, { status: 'error', error: errorMessage });
        onUploadError?.(filename, errorMessage);
      }
    },
    [applicationId, updateQueueItem, onUploadComplete, onUploadError],
  );

  const uploadFiles = useCallback(
    async (files: File[]) => {
      if (!files.length) return;

      // Initialize queue entries for all files
      const newQueueItems: UploadFileState[] = files.map((file) => ({
        file,
        filename: file.name,
        status: 'queued',
        progress: 0,
      }));

      setUploadQueue((prev) => [...prev, ...newQueueItems]);

      // Run all uploads in parallel; individual failures don't block others
      await Promise.allSettled(files.map((file) => uploadSingleFile(file)));
    },
    [uploadSingleFile],
  );

  const removeDocument = useCallback(
    async (docId: string) => {
      await documentsApi.deleteDocument(applicationId, docId);
      setDocuments((prev) => prev.filter((doc) => doc.id !== docId));
    },
    [applicationId],
  );

  return {
    uploadFiles,
    documents,
    uploadQueue,
    fetchDocuments,
    removeDocument,
    isLoadingDocuments,
  };
}
