export type ApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'additional_info_needed'
  | 'approved'
  | 'rejected';

export type PermitType =
  | 'construction'
  | 'zoning_variance'
  | 'event_permit'
  | 'demolition'
  | 'renovation'
  | 'signage';

export interface SiteAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface PermitApplication {
  id: string;
  reference_number: string;
  applicant_id: string;
  reviewer_id?: string;
  status: ApplicationStatus;
  permit_type: PermitType;
  project_description: string;
  site_street: string;
  site_city: string;
  site_state: string;
  site_zip: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  estimated_start_date?: string;
  estimated_value?: number;
  additional_notes?: string;
  submitted_at?: string;
  info_request_note?: string;
  info_request_at?: string;
  info_response_note?: string;
  info_response_at?: string;
  decision_outcome?: 'approved' | 'rejected';
  decision_reason?: string;
  decision_at?: string;
  decided_by?: string;
  // Reviewer-visible fields (returned only when caller role is REVIEWER or ADMIN)
  applicant_email?: string;
  applicant_phone?: string;
  created_at: string;
  updated_at: string;
}

export interface LifecycleStage {
  id: string;
  application_id: string;
  stage: ApplicationStatus;
  entered_at: string;
  actor_id?: string;
}

export interface ReviewQueueItem {
  id: string;
  referenceNumber: string;
  status: ApplicationStatus;
  permitType: string;
  applicantName: string;
  siteAddressSummary: string;
  submittedAt: string;
  updatedAt: string;
  unreadMessageCount: number;
  assignedReviewerId: string | null;
  daysSinceSubmitted: number;
}

export interface PaginatedPermits {
  data: PermitApplication[];
  nextCursor: string | null;
  totalCount: number;
}

export interface ReviewQueueResponse {
  data: ReviewQueueItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreatePermitPayload {
  permitType: PermitType;
  projectDescription: string;
  siteAddress: SiteAddress;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  estimatedStartDate?: string;
  estimatedValue?: number;
  additionalNotes?: string;
}

export type UpdatePermitPayload = Partial<CreatePermitPayload>;
