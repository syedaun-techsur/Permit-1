import { apiClient } from './client';
import type { ApplicantDashboard, ReviewerDashboard, AdminDashboard } from '../types/dashboard.types';

export const dashboardApi = {
  fetchApplicantDashboard: (): Promise<ApplicantDashboard> =>
    apiClient.get<ApplicantDashboard>('/dashboard/applicant').then(r => r.data),

  fetchReviewerDashboard: (): Promise<ReviewerDashboard> =>
    apiClient.get<ReviewerDashboard>('/dashboard/reviewer').then(r => r.data),

  fetchAdminDashboard: (): Promise<AdminDashboard> =>
    apiClient.get<AdminDashboard>('/dashboard/admin').then(r => r.data),
};
