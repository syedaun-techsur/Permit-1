import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
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
      const response = await documentsApi.listDocuments(applicationId);
      setDocuments(response.data);
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

      // a) Set status: uploading
      updateQueueItem(filename, { status: 'uploading', progress: 0 });

      try {
        // b) POST /permits/:id/documents/upload-url → get { uploadUrl, storageKey }
        const uploadUrlResponse = await documentsApi.getUploadUrl(applicationId, {
          filename,
          mimeType: file.type,
          sizeBytes: file.size,
        });
        const { uploadUrl, storageKey } = uploadUrlResponse.data;

        // c) PUT uploadUrl with file binary using plain axios (NOT apiClient)
        // MinIO presigned URL includes auth in query params — adding JWT Authorization header would break it
        await axios.put(uploadUrl, file, {
          headers: { 'Content-Type': file.type },
          onUploadProgress: (e) => {
            const progress = e.total
              ? Math.round((e.loaded / e.total) * 100)
              : 0;
            updateQueueItem(filename, { progress });
          },
        });

        // d) POST /permits/:id/documents to register document metadata
        const registerResponse = await documentsApi.registerDocument(applicationId, {
          filename,
          mimeType: file.type,
          sizeBytes: file.size,
          storageKey,
        });
        const doc = registerResponse.data;

        // e) Set status: uploaded, add to documents array
        updateQueueItem(filename, { status: 'uploaded', progress: 100, document: doc });
        setDocuments((prev) => [...prev, doc]);
        onUploadComplete?.(doc);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Upload failed';
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
