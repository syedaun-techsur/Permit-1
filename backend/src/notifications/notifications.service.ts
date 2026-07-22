import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';

export interface PaginatedNotifications {
  data: Notification[];
  nextCursor: string | null;
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notifRepo: Repository<Notification>,
  ) {}

  async getUnreadCount(userId: string): Promise<number> {
    return this.notifRepo.count({
      where: { userId, read: false },
    });
  }

  /**
   * Creates a notification for a user. Called by lifecycle transitions and messaging.
   */
  async createNotification(
    userId: string,
    applicationId: string | null,
    body: string,
    type: NotificationType = NotificationType.STATUS_CHANGE,
  ): Promise<Notification> {
    const notif = this.notifRepo.create({
      userId,
      applicationId: applicationId ?? undefined,
      body,
      type,
      read: false,
      readAt: null,
    });
    return this.notifRepo.save(notif);
  }

  /**
   * Returns cursor-paginated notifications for a user (newest first).
   */
  async listNotifications(
    userId: string,
    cursor?: string,
    limit = 50,
  ): Promise<PaginatedNotifications> {
    const effectiveLimit = Math.min(limit, 50);

    let qb = this.notifRepo
      .createQueryBuilder('notif')
      .where('notif.userId = :userId', { userId })
      .orderBy('notif.createdAt', 'DESC')
      .take(effectiveLimit + 1);

    if (cursor) {
      try {
        const cursorId = Buffer.from(cursor, 'base64').toString('utf-8');
        qb = qb.andWhere('notif.id < :cursorId', { cursorId });
      } catch {
        // Invalid cursor — ignore
      }
    }

    const rows = await qb.getMany();
    let nextCursor: string | null = null;

    if (rows.length > effectiveLimit) {
      rows.pop();
      const last = rows[rows.length - 1];
      nextCursor = Buffer.from(last.id).toString('base64');
    }

    return { data: rows, nextCursor };
  }

  /**
   * Marks one notification as read for the owning user.
   * Throws 404 if not found or not owned (prevents oracle-style enumeration).
   */
  async markOneRead(notifId: string, userId: string): Promise<void> {
    const notif = await this.notifRepo.findOne({
      where: { id: notifId, userId },
    });

    if (!notif) {
      throw new NotFoundException('Notification not found');
    }

    notif.read = true;
    notif.readAt = new Date();
    await this.notifRepo.save(notif);
  }

  /**
   * Marks all unread notifications as read for a user.
   */
  async markAllRead(userId: string): Promise<{ updated: number }> {
    const result = await this.notifRepo.update(
      { userId, read: false },
      { read: true, readAt: new Date() },
    );
    return { updated: result.affected ?? 0 };
  }
}
