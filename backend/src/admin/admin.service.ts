import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcryptjs from 'bcryptjs';
import { Response } from 'express';
import { User } from '../users/users.entity';
import { UserRole } from '../common/enums/role.enum';
import { PermitApplication } from '../permits/entities/permit-application.entity';
import { AuditLog } from '../audit/entities/audit-log.entity';
import { RefreshToken } from '../users/refresh-token.entity';
import { AdminPermitsQueryDto } from './dto/admin-permits-query.dto';
import { AuditLogQueryDto } from './dto/audit-log-query.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUsersQueryDto } from './dto/get-users-query.dto';

// Whitelist of allowed sortBy columns for permit queries
const ALLOWED_PERMIT_SORT_COLUMNS = [
  'submittedAt',
  'updatedAt',
  'referenceNumber',
  'permitType',
  'status',
];

// Column mapping: camelCase → DB column aliases
const PERMIT_SORT_MAP: Record<string, string> = {
  submittedAt: 'pa.submitted_at',
  updatedAt: 'pa.updated_at',
  referenceNumber: 'pa.reference_number',
  permitType: 'pa.permit_type',
  status: 'pa.status',
};

function escapeCsvCell(value: unknown): string {
  const str = value == null ? '' : String(value);
  // Neutralize formula injection: prefix cells starting with formula chars
  const formulaChars = ['=', '+', '-', '@', '\t', '\r'];
  const needsPrefix = formulaChars.some((c) => str.startsWith(c));
  const safe = needsPrefix ? `\t${str}` : str;
  // Wrap in double-quotes and escape internal double-quotes
  return `"${safe.replace(/"/g, '""')}"`;
}

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(PermitApplication)
    private readonly permitRepo: Repository<PermitApplication>,
    @InjectRepository(AuditLog)
    private readonly auditLogRepo: Repository<AuditLog>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepo: Repository<RefreshToken>,
    private readonly dataSource: DataSource,
  ) {}

  // ──────────────────────────────────────────────────────────────────────────
  // PERM-07: Admin all-permits view
  // ──────────────────────────────────────────────────────────────────────────

  async getAllPermits(
    query: AdminPermitsQueryDto,
  ): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 25;
    const sortBy = ALLOWED_PERMIT_SORT_COLUMNS.includes(query.sortBy ?? '')
      ? query.sortBy!
      : 'submittedAt';
    const sortOrder = query.sortOrder ?? 'DESC';
    const dbSortColumn = PERMIT_SORT_MAP[sortBy];

    const qb = this.permitRepo
      .createQueryBuilder('pa')
      .leftJoin('users', 'applicant', 'applicant.id = pa.applicant_id')
      .leftJoin('users', 'reviewer', 'reviewer.id = pa.reviewer_id')
      .select([
        'pa.id AS id',
        'pa.reference_number AS "referenceNumber"',
        'pa.permit_type AS "permitType"',
        'pa.status AS status',
        'pa.applicant_id AS "applicantId"',
        'applicant.full_name AS "applicantName"',
        'applicant.email AS "applicantEmail"',
        'pa.reviewer_id AS "reviewerId"',
        'reviewer.full_name AS "assignedReviewerName"',
        'pa.submitted_at AS "submittedAt"',
        'pa.updated_at AS "updatedAt"',
        'pa.project_description AS "projectDescription"',
        'pa.site_city AS "siteCity"',
        'pa.site_state AS "siteState"',
      ]);

    // Filter: status (comma-separated)
    if (query.status) {
      const statuses = query.status.split(',').map((s) => s.trim());
      qb.andWhere('pa.status IN (:...statuses)', { statuses });
    }

    // Filter: permitType
    if (query.permitType) {
      qb.andWhere('pa.permit_type = :permitType', {
        permitType: query.permitType,
      });
    }

    // Filter: reviewerId ('unassigned' = IS NULL)
    if (query.reviewerId) {
      if (query.reviewerId === 'unassigned') {
        qb.andWhere('pa.reviewer_id IS NULL');
      } else {
        qb.andWhere('pa.reviewer_id = :reviewerId', {
          reviewerId: query.reviewerId,
        });
      }
    }

    // Filter: date range on submitted_at
    if (query.from) {
      qb.andWhere('pa.submitted_at >= :from', { from: query.from });
    }
    if (query.to) {
      qb.andWhere('pa.submitted_at <= :to', { to: query.to });
    }

    // Count total matching rows
    const countQb = qb.clone().select('COUNT(*) AS count');
    const countResult = await countQb.getRawOne();
    const total = parseInt(countResult?.count ?? '0', 10);

    // Apply ordering and pagination
    qb.orderBy(dbSortColumn, sortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    const data = await qb.getRawMany();

    return { data, total, page, limit };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // ADMN-01: User account management
  // ──────────────────────────────────────────────────────────────────────────

  async getUsers(
    query: GetUsersQueryDto,
  ): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 25;

    const qb = this.userRepo
      .createQueryBuilder('u')
      .select([
        'u.id AS id',
        'u.full_name AS "fullName"',
        'u.email AS email',
        'u.role AS role',
        'u.is_active AS "isActive"',
        'u.created_at AS "createdAt"',
        'u.updated_at AS "updatedAt"',
      ]);

    // Filter: role
    if (query.role) {
      qb.andWhere('u.role = :role', { role: query.role });
    }

    // Filter: isActive
    if (query.isActive !== undefined) {
      const activeVal = query.isActive === 'true';
      qb.andWhere('u.is_active = :isActive', { isActive: activeVal });
    }

    // Filter: search (ILIKE on fullName OR email)
    if (query.search) {
      qb.andWhere(
        '(u.full_name ILIKE :search OR u.email ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    const countQb = qb.clone().select('COUNT(*) AS count');
    const countResult = await countQb.getRawOne();
    const total = parseInt(countResult?.count ?? '0', 10);

    qb.orderBy('u.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const data = await qb.getRawMany();

    return { data, total, page, limit };
  }

  async getUserById(userId: string): Promise<any> {
    const user = await this.userRepo
      .createQueryBuilder('u')
      .select([
        'u.id AS id',
        'u.full_name AS "fullName"',
        'u.email AS email',
        'u.role AS role',
        'u.is_active AS "isActive"',
        'u.created_at AS "createdAt"',
        'u.updated_at AS "updatedAt"',
      ])
      .where('u.id = :userId', { userId })
      .getRawOne();

    if (!user) {
      throw new NotFoundException({ code: 'USER_NOT_FOUND', message: 'User not found.' });
    }
    return user;
  }

  async createUser(dto: CreateUserDto, actorId: string): Promise<any> {
    // Check for duplicate email
    const existing = await this.userRepo.findOne({
      where: { email: dto.email.toLowerCase().trim() },
    });
    if (existing) {
      throw new ConflictException({ code: 'EMAIL_ALREADY_EXISTS', message: 'Email already exists.' });
    }

    // Generate or hash password
    const rawPassword =
      dto.temporaryPassword ?? this.generateRandomPassword();
    const passwordHash = await bcryptjs.hash(rawPassword, 12);

    // Use a transaction to create user + audit log atomically
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let newUser: User;
    try {
      const user = this.userRepo.create({
        email: dto.email.toLowerCase().trim(),
        passwordHash,
        fullName: dto.fullName.trim(),
        role: dto.role as UserRole,
        isActive: true,
      });
      newUser = await queryRunner.manager.save(User, user);

      // Write audit log in same transaction
      const auditEntry = this.auditLogRepo.create({
        action: 'USER_CREATED',
        actorId,
        actorRole: UserRole.ADMIN,
        targetUserId: newUser.id,
        applicationId: null,
        details: { email: newUser.email, role: newUser.role },
        occurredAt: new Date(),
      });
      await queryRunner.manager.save(AuditLog, auditEntry);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }

    return this.toUserObject(newUser);
  }

  async updateUser(
    userId: string,
    dto: UpdateUserDto,
    actorId: string,
  ): Promise<any> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException({ code: 'USER_NOT_FOUND', message: 'User not found.' });
    }

    // Guard: self-deactivation
    if (dto.isActive === false && userId === actorId) {
      throw new ConflictException({ code: 'SELF_DEACTIVATION', message: 'Admin cannot deactivate their own account.' });
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Handle isActive change
      if (dto.isActive !== undefined && dto.isActive !== user.isActive) {
        user.isActive = dto.isActive;

        if (dto.isActive === false) {
          // Revoke all refresh tokens
          await queryRunner.manager.delete(RefreshToken, { userId });

          const auditEntry = this.auditLogRepo.create({
            action: 'USER_DEACTIVATED',
            actorId,
            actorRole: UserRole.ADMIN,
            targetUserId: userId,
            applicationId: null,
            details: { userId },
            occurredAt: new Date(),
          });
          await queryRunner.manager.save(AuditLog, auditEntry);
        } else {
          const auditEntry = this.auditLogRepo.create({
            action: 'USER_REACTIVATED',
            actorId,
            actorRole: UserRole.ADMIN,
            targetUserId: userId,
            applicationId: null,
            details: { userId },
            occurredAt: new Date(),
          });
          await queryRunner.manager.save(AuditLog, auditEntry);
        }
      }

      // Handle role change
      if (dto.role !== undefined && dto.role !== user.role) {
        const oldRole = user.role;
        user.role = dto.role as UserRole;

        const auditEntry = this.auditLogRepo.create({
          action: 'USER_ROLE_CHANGED',
          actorId,
          actorRole: UserRole.ADMIN,
          targetUserId: userId,
          applicationId: null,
          details: { oldRole, newRole: dto.role },
          occurredAt: new Date(),
        });
        await queryRunner.manager.save(AuditLog, auditEntry);
      }

      await queryRunner.manager.save(User, user);
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }

    return this.toUserObject(user);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // ADMN-03: Audit log (cursor-paginated)
  // ──────────────────────────────────────────────────────────────────────────

  async getAuditLog(
    query: AuditLogQueryDto,
  ): Promise<{ data: any[]; nextCursor: string | null; totalCount: number }> {
    const limit = query.limit ?? 50;

    const qb = this.auditLogRepo
      .createQueryBuilder('al')
      .leftJoin('users', 'actor', 'actor.id = al.actor_id')
      .leftJoin('permit_applications', 'pa', 'pa.id = al.application_id')
      .select([
        'al.id AS id',
        'al.action AS action',
        'al.actor_id AS "actorId"',
        'actor.full_name AS "actorName"',
        'actor.role AS "actorRole"',
        'al.application_id AS "applicationId"',
        'pa.reference_number AS "applicationRef"',
        'al.target_user_id AS "targetUserId"',
        'al.details AS details',
        'al.ip_address AS "ipAddress"',
        'al.occurred_at AS "occurredAt"',
      ]);

    // Apply filters
    if (query.action) {
      const actions = query.action.split(',').map((a) => a.trim());
      qb.andWhere('al.action IN (:...actions)', { actions });
    }
    if (query.actorId) {
      qb.andWhere('al.actor_id = :actorId', { actorId: query.actorId });
    }
    if (query.applicationId) {
      qb.andWhere('al.application_id = :applicationId', {
        applicationId: query.applicationId,
      });
    }
    if (query.from) {
      qb.andWhere('al.occurred_at >= :from', { from: query.from });
    }
    if (query.to) {
      qb.andWhere('al.occurred_at <= :to', { to: query.to });
    }

    // Total count (separate query without cursor/limit)
    const countQb = qb.clone().select('COUNT(*) AS count');
    const countResult = await countQb.getRawOne();
    const totalCount = parseInt(countResult?.count ?? '0', 10);

    // Apply cursor
    if (query.cursor) {
      try {
        const decoded = JSON.parse(
          Buffer.from(query.cursor, 'base64').toString('utf8'),
        );
        qb.andWhere(
          '(al.occurred_at < :cursorOccurredAt OR (al.occurred_at = :cursorOccurredAt AND al.id < :cursorId))',
          {
            cursorOccurredAt: decoded.occurredAt,
            cursorId: decoded.id,
          },
        );
      } catch {
        // Invalid cursor — ignore
      }
    }

    // Fetch limit+1 rows to determine if there are more
    qb.orderBy('al.occurred_at', 'DESC')
      .addOrderBy('al.id', 'DESC')
      .limit(limit + 1);

    const rows = await qb.getRawMany();

    let nextCursor: string | null = null;
    if (rows.length > limit) {
      const lastRow = rows[limit];
      nextCursor = Buffer.from(
        JSON.stringify({ occurredAt: lastRow.occurredAt, id: lastRow.id }),
      ).toString('base64');
      rows.splice(limit);
    }

    return { data: rows, nextCursor, totalCount };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // ADMN-03: Audit log CSV export
  // ──────────────────────────────────────────────────────────────────────────

  async exportAuditLogCsv(
    query: AuditLogQueryDto,
    res: Response,
  ): Promise<void> {
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="audit-log.csv"',
    );

    // CSV header
    const header = 'id,action,actorId,actorName,actorRole,applicationId,applicationRef,details,ipAddress,occurredAt\n';
    res.write(header);

    const qb = this.auditLogRepo
      .createQueryBuilder('al')
      .leftJoin('users', 'actor', 'actor.id = al.actor_id')
      .leftJoin('permit_applications', 'pa', 'pa.id = al.application_id')
      .select([
        'al.id AS id',
        'al.action AS action',
        'al.actor_id AS "actorId"',
        'actor.full_name AS "actorName"',
        'actor.role AS "actorRole"',
        'al.application_id AS "applicationId"',
        'pa.reference_number AS "applicationRef"',
        'al.details AS details',
        'al.ip_address AS "ipAddress"',
        'al.occurred_at AS "occurredAt"',
      ])
      .orderBy('al.occurred_at', 'DESC')
      .addOrderBy('al.id', 'DESC');

    // Apply filters (same as getAuditLog but no cursor/limit)
    if (query.action) {
      const actions = query.action.split(',').map((a) => a.trim());
      qb.andWhere('al.action IN (:...actions)', { actions });
    }
    if (query.actorId) {
      qb.andWhere('al.actor_id = :actorId', { actorId: query.actorId });
    }
    if (query.applicationId) {
      qb.andWhere('al.application_id = :applicationId', {
        applicationId: query.applicationId,
      });
    }
    if (query.from) {
      qb.andWhere('al.occurred_at >= :from', { from: query.from });
    }
    if (query.to) {
      qb.andWhere('al.occurred_at <= :to', { to: query.to });
    }

    // Stream in batches of 500
    const batchSize = 500;
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const rows = await qb.clone().skip(offset).take(batchSize).getRawMany();
      if (rows.length === 0) {
        hasMore = false;
        break;
      }

      for (const row of rows) {
        const detailsStr =
          row.details != null ? JSON.stringify(row.details) : '';
        const line = [
          escapeCsvCell(row.id),
          escapeCsvCell(row.action),
          escapeCsvCell(row.actorId),
          escapeCsvCell(row.actorName),
          escapeCsvCell(row.actorRole),
          escapeCsvCell(row.applicationId),
          escapeCsvCell(row.applicationRef),
          escapeCsvCell(detailsStr),
          escapeCsvCell(row.ipAddress),
          escapeCsvCell(row.occurredAt),
        ].join(',');
        res.write(line + '\n');
      }

      if (rows.length < batchSize) {
        hasMore = false;
      } else {
        offset += batchSize;
      }
    }

    res.end();
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Private helpers
  // ──────────────────────────────────────────────────────────────────────────

  private toUserObject(user: User): Record<string, unknown> {
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private generateRandomPassword(): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$';
    let result = '';
    for (let i = 0; i < 16; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
