export class AdminSummaryCardsDto {
  totalApplications: number;
  activeApplications: number;
  submittedThisWeek: number;
  decisionsThisWeek: number;
}

export class StatusDistributionItemDto {
  status: string;
  count: number;
}

export class ReviewerWorkloadItemDto {
  reviewerId: string;
  reviewerName: string;
  assigned: number;
  underReview: number;
  additionalInfoNeeded: number;
  decidedThisWeek: number;
}

export class AdminDashboardDto {
  summaryCards: AdminSummaryCardsDto;
  statusDistribution: StatusDistributionItemDto[];
  reviewerWorkload: ReviewerWorkloadItemDto[];
  recentActivity: object[]; // AuditLog objects
}
