import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
  ) {}

  async createEntry(
    action: string,
    actorId: string,
    applicationId: string | null,
    details: Record<string, unknown>,
    ipAddress?: string,
  ): Promise<AuditLog> {
    try {
      const entry = this.auditRepo.create({
        action,
        actorId,
        applicationId: applicationId ?? null,
        details,
        ipAddress: ipAddress ?? null,
        occurredAt: new Date(),
      });
      return await this.auditRepo.save(entry);
    } catch (_err) {
      // Audit log failures must not block the main flow
      return null as unknown as AuditLog;
    }
  }
}
