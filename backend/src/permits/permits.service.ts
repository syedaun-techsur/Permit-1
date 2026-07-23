import {
  Injectable,
  ForbiddenException,
  ConflictException,
  UnprocessableEntityException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { PermitApplication, ApplicationStatus } from './entities/permit-application.entity';
import { Document, DocumentStatus } from '../documents/entities/document.entity';
import { LifecycleService } from '../lifecycle/lifecycle.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';
import { CreatePermitDto } from './dto/create-permit.dto';
import { UpdatePermitDto } from './dto/update-permit.dto';
import { RequestInfoDto } from './dto/request-info.dto';
import { RespondToInfoDto } from './dto/respond-to-info.dto';
import { DecideDto } from './dto/decide.dto';
import { UserRole } from '../common/enums/role.enum';

export interface PaginatedResult {
  data: PermitApplication[];
  nextCursor: string | null;
  totalCount: number;
}

export interface ListQuery {
  status?: ApplicationStatus;
  cursor?: string;
  limit?: number;
}

export interface ReviewQueueItem {
  id: string;
  referenceNumber: string;
  status: ApplicationStatus;
  permitType: string;
  applicantName: string;
  siteAddressSummary: string;
  submittedAt: Date | null;
  updatedAt: Date;
  unreadMessageCount: number;
  assignedReviewerId: string | null;
  daysSinceSubmitted: number;
}

export interface ReviewQueueQuery {
  status?: ApplicationStatus;
  permitType?: string;
  assignment?: string;
  page?: number;
  limit?: number;
}

export interface ReviewQueueResult {
  data: ReviewQueueItem[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

@Injectable()
export class PermitsService {
  constructor(
    @InjectRepository(PermitApplication)
    private readonly permitRepo: Repository<PermitApplication>,
    @InjectRepository(Document)
    private readonly documentRepo: Repository<Document>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly lifecycleService: LifecycleService,
    private readonly auditService: AuditService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createDraft(userId: string, dto: CreatePermitDto): Promise<PermitApplication> {
    // Generate reference number using the permit_reference_seq sequence
    const seqResult = await this.dataSource.query(
      `SELECT nextval('permit_reference_seq') AS seq`,
    );
    const seqVal = seqResult[0].seq as number;
    const referenceNumber = `PA-${String(seqVal).padStart(6, '0')}`;

    const app = this.permitRepo.create({
      referenceNumber,
      applicantId: userId,
      status: ApplicationStatus.DRAFT,
      permitType: dto.permitType,
      projectDescription: dto.projectDescription,
      siteStreet: dto.siteAddress.street,
      siteCity: dto.siteAddress.city,
      siteState: dto.siteAddress.state,
      siteZip: dto.siteAddress.zipCode,
      contactName: dto.contactName,
      contactPhone: dto.contactPhone,
      contactEmail: dto.contactEmail,
      estimatedStartDate: dto.estimatedStartDate ? new Date(dto.estimatedStartDate) : null,
      estimatedValue: dto.estimatedValue ?? null,
      additionalNotes: dto.additionalNotes ?? null,
    });

    const saved = await this.permitRepo.save(app);

    // Record lifecycle stage and audit entry (non-blocking)
    await Promise.all([
      this.lifecycleService.createStage(saved.id, ApplicationStatus.DRAFT, userId),
      this.auditService.createEntry('APPLICATION_CREATED', userId, saved.id, { permit_type: dto.permitType }),
    ]);

    return saved;
  }

  async updateDraft(userId: string, id: string, dto: UpdatePermitDto): Promise<PermitApplication> {
    const app = await this.permitRepo.findOne({ where: { id } });
    if (!app || app.applicantId !== userId) {
      throw new ForbiddenException('Access denied');
    }
    if (app.status !== ApplicationStatus.DRAFT) {
      throw new ConflictException('INVALID_STATUS_TRANSITION');
    }

    // Build partial update from DTO
    const updates: Partial<PermitApplication> = {};
    if (dto.permitType !== undefined) updates.permitType = dto.permitType;
    if (dto.projectDescription !== undefined) updates.projectDescription = dto.projectDescription;
    if (dto.siteAddress !== undefined) {
      if (dto.siteAddress.street !== undefined) updates.siteStreet = dto.siteAddress.street;
      if (dto.siteAddress.city !== undefined) updates.siteCity = dto.siteAddress.city;
      if (dto.siteAddress.state !== undefined) updates.siteState = dto.siteAddress.state;
      if (dto.siteAddress.zipCode !== undefined) updates.siteZip = dto.siteAddress.zipCode;
    }
    if (dto.contactName !== undefined) updates.contactName = dto.contactName;
    if (dto.contactPhone !== undefined) updates.contactPhone = dto.contactPhone;
    if (dto.contactEmail !== undefined) updates.contactEmail = dto.contactEmail;
    if (dto.estimatedStartDate !== undefined) {
      updates.estimatedStartDate = dto.estimatedStartDate ? new Date(dto.estimatedStartDate) : null;
    }
    if (dto.estimatedValue !== undefined) updates.estimatedValue = dto.estimatedValue ?? null;
    if (dto.additionalNotes !== undefined) updates.additionalNotes = dto.additionalNotes ?? null;

    Object.assign(app, updates);
    return this.permitRepo.save(app);
  }

  async submitApplication(userId: string, id: string): Promise<PermitApplication> {
    const app = await this.permitRepo.findOne({ where: { id } });
    if (!app || app.applicantId !== userId) {
      throw new ForbiddenException('Access denied');
    }
    if (app.status !== ApplicationStatus.DRAFT) {
      throw new ConflictException('INVALID_STATUS_TRANSITION');
    }

    // Check at least one uploaded document exists
    const docCount = await this.documentRepo.count({
      where: { applicationId: id, status: DocumentStatus.UPLOADED },
    });
    if (docCount === 0) {
      throw new UnprocessableEntityException('DOCUMENTS_REQUIRED');
    }

    app.status = ApplicationStatus.SUBMITTED;
    app.submittedAt = new Date();
    const saved = await this.permitRepo.save(app);

    // Record lifecycle stage and audit entry (non-blocking)
    await Promise.all([
      this.lifecycleService.createStage(saved.id, ApplicationStatus.SUBMITTED, userId),
      this.auditService.createEntry('APPLICATION_SUBMITTED', userId, saved.id, {}),
    ]);

    return saved;
  }

  async listApplications(userId: string, query: ListQuery): Promise<PaginatedResult> {
    const limit = Math.min(query.limit ?? 20, 100);

    const qb = this.permitRepo
      .createQueryBuilder('pa')
      .where('pa.applicant_id = :userId', { userId })
      .orderBy('pa.updated_at', 'DESC')
      .take(limit + 1);

    if (query.status) {
      qb.andWhere('pa.status = :status', { status: query.status });
    }

    if (query.cursor) {
      // Cursor is base64-encoded updated_at ISO string
      try {
        const cursorDate = Buffer.from(query.cursor, 'base64').toString('utf-8');
        qb.andWhere('pa.updated_at < :cursorDate', { cursorDate });
      } catch {
        // Invalid cursor — ignore and return from start
      }
    }

    const totalCount = await this.permitRepo.count({
      where: { applicantId: userId, ...(query.status ? { status: query.status } : {}) },
    });

    const rows = await qb.getMany();
    let nextCursor: string | null = null;

    if (rows.length > limit) {
      rows.pop();
      const last = rows[rows.length - 1];
      nextCursor = Buffer.from(last.updatedAt.toISOString()).toString('base64');
    }

    return { data: rows, nextCursor, totalCount };
  }

  // A permit is readable by its applicant, or by any reviewer/admin (who need
  // to see every submitted application to review it).
  private canRead(app: PermitApplication, userId: string, role?: UserRole): boolean {
    return (
      app.applicantId === userId ||
      role === UserRole.REVIEWER ||
      role === UserRole.ADMIN
    );
  }

  async getById(
    userId: string,
    id: string,
    role?: UserRole,
  ): Promise<PermitApplication> {
    const app = await this.permitRepo.findOne({ where: { id } });
    if (!app) {
      throw new NotFoundException('Application not found');
    }
    if (!this.canRead(app, userId, role)) {
      throw new ForbiddenException('Access denied');
    }
    return app;
  }

  async getLifecycleStages(userId: string, id: string, role?: UserRole) {
    const app = await this.permitRepo.findOne({ where: { id } });
    if (!app) {
      throw new NotFoundException('Application not found');
    }
    if (!this.canRead(app, userId, role)) {
      throw new ForbiddenException('Access denied');
    }
    return this.lifecycleService.getStages(id);
  }

  // Reviewer/admin queue: every non-draft application (optionally scoped to the
  // reviewer's own assignments), with the projected fields the ReviewQueuePage
  // renders (applicant name, address summary, age, unread message count).
  async listReviewQueue(
    reviewerId: string,
    query: ReviewQueueQuery,
  ): Promise<ReviewQueueResult> {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(query.limit) || 25, 1), 100);
    const offset = (page - 1) * limit;

    // Filters shared by the count and data queries. Each query owns its own
    // param array (and $-numbering): the data query reserves $1 for the
    // reviewer id (unread-message subquery), while the count query has no such
    // placeholder — so they cannot share one param list.
    const buildFilters = (params: unknown[]): string => {
      const filters: string[] = [`pa.status <> 'draft'`];
      if (query.status) {
        params.push(query.status);
        filters.push(`pa.status = $${params.length}`);
      }
      if (query.permitType) {
        params.push(query.permitType);
        filters.push(`pa.permit_type = $${params.length}`);
      }
      if (query.assignment === 'Mine') {
        params.push(reviewerId);
        filters.push(`pa.reviewer_id = $${params.length}`);
      }
      return filters.join(' AND ');
    };

    const countParams: unknown[] = [];
    const countWhere = buildFilters(countParams);
    const countRows = await this.dataSource.query(
      `SELECT COUNT(*)::int AS count FROM permit_applications pa WHERE ${countWhere}`,
      countParams,
    );
    const total: number = countRows[0]?.count ?? 0;

    // $1 = reviewer id (unread-message subquery); filters start at $2.
    const dataParams: unknown[] = [reviewerId];
    const dataWhere = buildFilters(dataParams);
    dataParams.push(limit);
    const limitParam = dataParams.length;
    dataParams.push(offset);
    const offsetParam = dataParams.length;

    const rows = await this.dataSource.query(
      `SELECT pa.id,
              pa.reference_number AS "referenceNumber",
              pa.status,
              pa.permit_type AS "permitType",
              u.full_name AS "applicantName",
              concat_ws(', ', pa.site_street, pa.site_city, pa.site_state) AS "siteAddressSummary",
              pa.submitted_at AS "submittedAt",
              pa.updated_at AS "updatedAt",
              pa.reviewer_id AS "assignedReviewerId",
              (
                SELECT COUNT(*) FROM messages m
                WHERE m.application_id = pa.id
                  AND NOT EXISTS (
                    SELECT 1 FROM message_reads mr
                    WHERE mr.message_id = m.id AND mr.user_id = $1
                  )
              )::int AS "unreadMessageCount"
       FROM permit_applications pa
       LEFT JOIN users u ON u.id = pa.applicant_id
       WHERE ${dataWhere}
       ORDER BY pa.submitted_at DESC NULLS LAST, pa.updated_at DESC
       LIMIT $${limitParam} OFFSET $${offsetParam}`,
      dataParams,
    );

    const now = Date.now();
    const data: ReviewQueueItem[] = rows.map((r: Record<string, unknown>) => {
      const submittedAt = r.submittedAt ? new Date(r.submittedAt as string) : null;
      return {
        id: r.id as string,
        referenceNumber: r.referenceNumber as string,
        status: r.status as ApplicationStatus,
        permitType: r.permitType as string,
        applicantName: (r.applicantName as string) ?? '',
        siteAddressSummary: (r.siteAddressSummary as string) ?? '',
        submittedAt,
        updatedAt: new Date(r.updatedAt as string),
        unreadMessageCount: Number(r.unreadMessageCount ?? 0),
        assignedReviewerId: (r.assignedReviewerId as string) ?? null,
        daysSinceSubmitted: submittedAt
          ? Math.floor((now - submittedAt.getTime()) / 86_400_000)
          : 0,
      };
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: total === 0 ? 0 : Math.ceil(total / limit),
      },
    };
  }

  // ── Phase 3 lifecycle action methods ──────────────────────────────────

  private async findPermitOrFail(id: string): Promise<PermitApplication> {
    const app = await this.permitRepo.findOne({ where: { id } });
    if (!app) {
      throw new NotFoundException('Application not found');
    }
    return app;
  }

  async beginReview(id: string, reviewerId: string): Promise<PermitApplication> {
    const permit = await this.findPermitOrFail(id);

    if (
      permit.status !== ApplicationStatus.SUBMITTED &&
      permit.status !== ApplicationStatus.ADDITIONAL_INFO_NEEDED
    ) {
      throw new ConflictException('INVALID_STATUS_TRANSITION');
    }

    // Assign reviewer if not already assigned
    const previousReviewerId = permit.reviewerId;
    if (!permit.reviewerId) {
      permit.reviewerId = reviewerId;
    }
    permit.status = ApplicationStatus.UNDER_REVIEW;
    permit.underReviewAt = new Date();

    const saved = await this.permitRepo.save(permit);

    const auditEntries: Promise<unknown>[] = [
      this.lifecycleService.createStage(id, ApplicationStatus.UNDER_REVIEW, reviewerId),
      this.auditService.createEntry('REVIEW_STARTED', reviewerId, id, {}),
    ];

    // Write REVIEWER_ASSIGNED audit entry when reviewer is first assigned
    if (!previousReviewerId) {
      auditEntries.push(
        this.auditService.createEntry('REVIEWER_ASSIGNED', reviewerId, id, {
          reviewerId,
          previousReviewerId: null,
        }),
      );
    }

    await Promise.all(auditEntries);

    // Notify applicant
    await this.notificationsService.createNotification(
      saved.applicantId,
      id,
      `Your permit application #${saved.referenceNumber} is now under review.`,
      NotificationType.REVIEWER_ASSIGNED,
    );

    return saved;
  }

  async requestInfo(id: string, reviewerId: string, dto: RequestInfoDto): Promise<PermitApplication> {
    const permit = await this.findPermitOrFail(id);

    if (permit.status !== ApplicationStatus.UNDER_REVIEW) {
      throw new ConflictException('INVALID_STATUS_TRANSITION');
    }

    permit.status = ApplicationStatus.ADDITIONAL_INFO_NEEDED;
    permit.infoRequestNote = dto.infoRequestNote;
    permit.infoRequestAt = new Date();

    const saved = await this.permitRepo.save(permit);

    await Promise.all([
      this.lifecycleService.createStage(id, ApplicationStatus.ADDITIONAL_INFO_NEEDED, reviewerId),
      this.auditService.createEntry('INFO_REQUESTED', reviewerId, id, {}),
    ]);

    // Notify applicant with excerpt
    const excerpt = dto.infoRequestNote.substring(0, 100);
    await this.notificationsService.createNotification(
      saved.applicantId,
      id,
      `Additional information needed for #${saved.referenceNumber}: "${excerpt}"`,
      NotificationType.INFO_REQUEST,
    );

    return saved;
  }

  async respondToInfo(
    id: string,
    applicantId: string,
    dto: RespondToInfoDto,
    hasNewDocuments: boolean,
  ): Promise<PermitApplication> {
    const permit = await this.findPermitOrFail(id);

    if (permit.status !== ApplicationStatus.ADDITIONAL_INFO_NEEDED) {
      throw new ConflictException('INVALID_STATUS_TRANSITION');
    }

    // Verify ownership — applicant can only respond to their own permit
    if (permit.applicantId !== applicantId) {
      throw new ForbiddenException('Access denied');
    }

    if (!dto.responseNote && !hasNewDocuments) {
      throw new UnprocessableEntityException('RESPONSE_OR_DOCUMENTS_REQUIRED');
    }

    permit.status = ApplicationStatus.UNDER_REVIEW;
    permit.infoResponseNote = dto.responseNote ?? null;
    permit.infoResponseAt = new Date();

    const saved = await this.permitRepo.save(permit);

    await Promise.all([
      this.lifecycleService.createStage(id, ApplicationStatus.UNDER_REVIEW, applicantId),
      this.auditService.createEntry('INFO_PROVIDED', applicantId, id, {}),
    ]);

    // Notify reviewer if assigned
    if (saved.reviewerId) {
      await this.notificationsService.createNotification(
        saved.reviewerId,
        id,
        `Applicant has responded to your information request on #${saved.referenceNumber}.`,
        NotificationType.INFO_RESPONSE,
      );
    }

    return saved;
  }

  async decide(
    id: string,
    reviewerId: string,
    dto: DecideDto,
    isAdmin: boolean,
  ): Promise<PermitApplication> {
    const permit = await this.findPermitOrFail(id);

    if (permit.status !== ApplicationStatus.UNDER_REVIEW) {
      throw new ConflictException('INVALID_STATUS_TRANSITION');
    }

    // Only the assigned reviewer or an admin can decide
    if (!isAdmin && permit.reviewerId !== reviewerId) {
      throw new ForbiddenException('Only the assigned reviewer can make a decision');
    }

    const outcomeStatus =
      dto.outcome === 'approved'
        ? ApplicationStatus.APPROVED
        : ApplicationStatus.REJECTED;

    permit.status = outcomeStatus;
    permit.decisionOutcome = dto.outcome;
    permit.decisionReason = dto.decisionReason;
    permit.decisionAt = new Date();
    permit.decidedBy = reviewerId;

    const saved = await this.permitRepo.save(permit);

    const auditAction =
      dto.outcome === 'approved' ? 'APPLICATION_APPROVED' : 'APPLICATION_REJECTED';

    await Promise.all([
      this.lifecycleService.createStage(id, outcomeStatus, reviewerId),
      this.auditService.createEntry(auditAction, reviewerId, id, { outcome: dto.outcome }),
    ]);

    // Notify applicant
    const excerpt = dto.decisionReason.substring(0, 100);
    const notifBody =
      dto.outcome === 'approved'
        ? `Your permit application #${saved.referenceNumber} has been approved.`
        : `Your permit application #${saved.referenceNumber} has been rejected: ${excerpt}`;

    await this.notificationsService.createNotification(
      saved.applicantId,
      id,
      notifBody,
      NotificationType.DECISION_MADE,
    );

    return saved;
  }
}
