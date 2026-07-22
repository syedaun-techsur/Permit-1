import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum ApplicationStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  ADDITIONAL_INFO_NEEDED = 'additional_info_needed',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum PermitType {
  CONSTRUCTION = 'construction',
  ZONING_VARIANCE = 'zoning_variance',
  EVENT_PERMIT = 'event_permit',
  DEMOLITION = 'demolition',
  RENOVATION = 'renovation',
  SIGNAGE = 'signage',
}

@Entity('permit_applications')
@Index('idx_pa_applicant_id', ['applicantId'])
@Index('idx_pa_reviewer_id', ['reviewerId'])
@Index('idx_pa_status', ['status'])
@Index('idx_pa_submitted_at', ['submittedAt'])
@Index('idx_pa_reference_number', ['referenceNumber'])
export class PermitApplication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'reference_number', type: 'varchar', length: 20, unique: true })
  referenceNumber: string;

  @Column({ name: 'applicant_id', type: 'uuid' })
  applicantId: string;

  @Column({ name: 'reviewer_id', type: 'uuid', nullable: true })
  reviewerId: string | null;

  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    enumName: 'application_status_enum',
    default: ApplicationStatus.DRAFT,
  })
  status: ApplicationStatus;

  @Column({
    name: 'permit_type',
    type: 'enum',
    enum: PermitType,
    enumName: 'permit_type_enum',
  })
  permitType: PermitType;

  @Column({ name: 'project_description', type: 'text' })
  projectDescription: string;

  @Column({ name: 'site_street', type: 'varchar', length: 200 })
  siteStreet: string;

  @Column({ name: 'site_city', type: 'varchar', length: 100 })
  siteCity: string;

  @Column({ name: 'site_state', type: 'char', length: 2 })
  siteState: string;

  @Column({ name: 'site_zip', type: 'varchar', length: 10 })
  siteZip: string;

  @Column({ name: 'contact_name', type: 'varchar', length: 100 })
  contactName: string;

  @Column({ name: 'contact_phone', type: 'varchar', length: 30 })
  contactPhone: string;

  @Column({ name: 'contact_email', type: 'varchar', length: 255 })
  contactEmail: string;

  @Column({ name: 'estimated_start_date', type: 'date', nullable: true })
  estimatedStartDate: Date | null;

  @Column({ name: 'estimated_value', type: 'numeric', precision: 12, scale: 2, nullable: true })
  estimatedValue: number | null;

  @Column({ name: 'additional_notes', type: 'text', nullable: true })
  additionalNotes: string | null;

  @Column({ name: 'submitted_at', type: 'timestamptz', nullable: true })
  submittedAt: Date | null;

  @Column({ name: 'under_review_at', type: 'timestamptz', nullable: true })
  underReviewAt: Date | null;

  @Column({ name: 'info_request_note', type: 'text', nullable: true })
  infoRequestNote: string | null;

  @Column({ name: 'info_request_at', type: 'timestamptz', nullable: true })
  infoRequestAt: Date | null;

  @Column({ name: 'info_response_note', type: 'text', nullable: true })
  infoResponseNote: string | null;

  @Column({ name: 'info_response_at', type: 'timestamptz', nullable: true })
  infoResponseAt: Date | null;

  @Column({ name: 'decision_outcome', type: 'varchar', length: 10, nullable: true })
  decisionOutcome: string | null;

  @Column({ name: 'decision_reason', type: 'text', nullable: true })
  decisionReason: string | null;

  @Column({ name: 'decision_at', type: 'timestamptz', nullable: true })
  decisionAt: Date | null;

  @Column({ name: 'decided_by', type: 'uuid', nullable: true })
  decidedBy: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
