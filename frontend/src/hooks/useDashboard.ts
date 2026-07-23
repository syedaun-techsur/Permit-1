import { useState, useEffect, useCallback, useRef } from 'react';
import { dashboardApi } from '../api/dashboard.api';
import type { ApplicantDashboard, ReviewerDashboard, AdminDashboard, DashboardState } from '../types/dashboard.types';

const POLL_INTERVAL_MS = 30_000;

type Role = 'applicant' | 'reviewer' | 'admin';

// Overload signatures for type inference
export function useDashboard(role: 'applicant'): DashboardState<ApplicantDashboard>;
export function useDashboard(role: 'reviewer'): DashboardState<ReviewerDashboard>;
export function useDashboard(role: 'admin'): DashboardState<AdminDashboard>;
export function useDashboard(role: Role): DashboardState<ApplicantDashboard | ReviewerDashboard | AdminDashboard> {
  const [data, setData] = useState<ApplicantDashboard | ReviewerDashboard | AdminDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchFn = role === 'applicant'
    ? dashboardApi.fetchApplicantDashboard
    : role === 'reviewer'
    ? dashboardApi.fetchReviewerDashboard
    : dashboardApi.fetchAdminDashboard;

  const fetch = useCallback(async () => {
    try {
      const result = await fetchFn();
      setData(result);
      setError(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load dashboard';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [fetchFn]);

  const startPolling = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (document.visibilityState !== 'hidden') {
        fetch();
      }
    }, POLL_INTERVAL_MS);
  }, [fetch]);

  useEffect(() => {
    setIsLoading(true);
    fetch();
    startPolling();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetch();        // immediate refresh on tab focus
        startPolling(); // restart interval
      } else {
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [role]); // re-run if role changes

  return { data, isLoading, error, refetch: fetch };
}
