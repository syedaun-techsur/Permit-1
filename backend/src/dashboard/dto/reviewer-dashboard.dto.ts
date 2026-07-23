export class ReviewerSummaryCardsDto {
  assignedApplications: number;
  awaitingResponse: number;
  unassignedInPool: number;
  unreadMessages: number;
}

export class PriorityQueueItemDto {
  id: string;
  referenceNumber: string;
  permitType: string;
  applicantName: string;
  status: string;
  daysSinceSubmission: number;
  unreadMessageCount: number;
}

export class ReviewerDashboardDto {
  summaryCards: ReviewerSummaryCardsDto;
  priorityQueue: PriorityQueueItemDto[];
  atRiskApplications: PriorityQueueItemDto[];
  activityFeed: object[]; // AuditLog objects
}
