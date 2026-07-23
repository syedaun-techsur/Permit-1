export class ApplicantSummaryCardsDto {
  activeApplications: number;
  actionRequired: number;
  unreadMessages: number;
}

export class RecentApplicationDto {
  id: string;
  referenceNumber: string;
  permitType: string;
  status: string;
  updatedAt: string;
  unreadMessageCount: number;
}

export class PendingActionDto {
  id: string;
  referenceNumber: string;
  infoRequestNote: string | null;
  updatedAt: string;
}

export class ApplicantDashboardDto {
  summaryCards: ApplicantSummaryCardsDto;
  recentApplications: RecentApplicationDto[];
  pendingActions: PendingActionDto[];
  activityFeed: object[]; // Notification objects
}
