import type { Notification } from './message.types';
import type { ApplicationStatus } from './permit.types';

// ─── Shared ──────────────────────────────────────────────────────────────────

export interface StatusDistributionItem {
  status: ApplicationStatus | string;
  count: number;
}

export interface ReviewerWorkloadItem {
  reviewerId: string;
  reviewerName: string;
  assigned: number;
  underReview: number;
  additionalInfoNeeded: number;
  decidedThisWeek: number;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  applicationId: string | null;
  actorName: string;
  actorRole: string;
}

// ─── Applicant Dashboard ─────────────────────────────────────────────────────

export interface ApplicantSummaryCards {
  activeApplications: number;
  actionRequired: number;
  unreadMessages: number;
}

export interface RecentApplication {
  id: string;
  referenceNumber: string;
  permitType: string;
  status: ApplicationStatus;
  updatedAt: string;
  unreadMessageCount: number;
}

export interface PendingAction {
  id: string;
  referenceNumber: string;
  infoRequestNote: string | null;
  updatedAt: string;
}

export interface ApplicantDashboard {
  summaryCards: ApplicantSummaryCards;
  recentApplications: RecentApplication[];
  pendingActions: PendingAction[];
  activityFeed: Notification[];
}

// ─── Reviewer Dashboard ───────────────────────────────────────────────────────

export interface ReviewerSummaryCards {
  assignedApplications: number;
  awaitingResponse: number;
  unassignedInPool: number;
  unreadMessages: number;
}

export interface PriorityQueueItem {
  id: string;
  referenceNumber: string;
  permitType: string;
  applicantName: string;
  status: ApplicationStatus;
  daysSinceSubmission: number;
  unreadMessageCount: number;
}

export interface ReviewerDashboard {
  summaryCards: ReviewerSummaryCards;
  priorityQueue: PriorityQueueItem[];
  atRiskApplications: PriorityQueueItem[];
  activityFeed: AuditLogEntry[];
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────

export interface AdminSummaryCards {
  totalApplications: number;
  activeApplications: number;
  submittedThisWeek: number;
  decisionsThisWeek: number;
}

export interface AdminDashboard {
  summaryCards: AdminSummaryCards;
  statusDistribution: StatusDistributionItem[];
  reviewerWorkload: ReviewerWorkloadItem[];
  recentActivity: AuditLogEntry[];
}

// ─── Hook Return Types ────────────────────────────────────────────────────────

export type DashboardData = ApplicantDashboard | ReviewerDashboard | AdminDashboard;

export interface DashboardState<T extends DashboardData> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}
