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
import { CreatePermitDto } from './dto/create-permit.dto';
import { UpdatePermitDto } from './dto/update-permit.dto';

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

  async getById(userId: string, id: string): Promise<PermitApplication> {
    const app = await this.permitRepo.findOne({ where: { id } });
    if (!app) {
      throw new NotFoundException('Application not found');
    }
    if (app.applicantId !== userId) {
      throw new ForbiddenException('Access denied');
    }
    return app;
  }

  async getLifecycleStages(userId: string, id: string) {
    // Verify ownership first
    const app = await this.permitRepo.findOne({ where: { id } });
    if (!app) {
      throw new NotFoundException('Application not found');
    }
    if (app.applicantId !== userId) {
      throw new ForbiddenException('Access denied');
    }
    return this.lifecycleService.getStages(id);
  }
}
