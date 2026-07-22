import { useState, useEffect, useCallback } from 'react';
import { permitsApi } from '../api/permits.api';
import { usePermitsStore } from '../store/permits.store';
import type { LifecycleStage, PermitApplication } from '../types/permit.types';
import type { PermitDocument } from '../types/document.types';

interface UsePermitResult {
  permit: PermitApplication | null;
  lifecycle: LifecycleStage[];
  documents: PermitDocument[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function usePermit(id: string): UsePermitResult {
  const { setSelectedPermit } = usePermitsStore();
  const [permit, setPermit] = useState<PermitApplication | null>(null);
  const [lifecycle, setLifecycle] = useState<LifecycleStage[]>([]);
  const [documents] = useState<PermitDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      const [permitData, lifecycleData] = await Promise.all([
        permitsApi.getPermit(id),
        permitsApi.getLifecycle(id),
      ]);
      setPermit(permitData);
      setLifecycle(lifecycleData.stages);
      setSelectedPermit(permitData);
      setError(null);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
        'Failed to load permit';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [id, setSelectedPermit]);

  useEffect(() => {
    setIsLoading(true);
    void fetchData();

    const intervalId = setInterval(() => {
      void fetchData();
    }, 15000);

    return () => clearInterval(intervalId);
  }, [fetchData]);

  return { permit, lifecycle, documents, isLoading, error, refetch: fetchData };
}
