import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { randomUUID } from 'crypto';
import * as path from 'path';
import { Message } from './entities/message.entity';
import { MessageRead } from './entities/message-read.entity';
import { MessageAttachment } from './entities/message-attachment.entity';
import { PermitApplication, ApplicationStatus } from '../permits/entities/permit-application.entity';
import { User } from '../users/users.entity';
import { UserRole } from '../common/enums/role.enum';
import { S3Service } from '../documents/s3.service';
import { NotificationsService } from '../notifications/notifications.service';
import { SendMessageDto } from './dto/send-message.dto';
import { MessageAttachmentUploadUrlDto } from './dto/upload-url-request.dto';
import { RegisterMessageAttachmentDto } from './dto/register-attachment.dto';

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const MAX_SIZE_BYTES = 26214400; // 25MB
const MAX_ATTACHMENTS_PER_MESSAGE = 5;
const PRESIGNED_URL_EXPIRY_SECONDS = 900; // 15 minutes

export interface MessageObject {
  id: string;
  applicationId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  body: string;
  attachments: MessageAttachment[];
  sentAt: Date;
  readBy: string[];
}

export interface PaginatedMessages {
  data: MessageObject[];
  nextCursor: string | null;
}

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
    @InjectRepository(MessageRead)
    private readonly messageReadRepo: Repository<MessageRead>,
    @InjectRepository(MessageAttachment)
    private readonly attachmentRepo: Repository<MessageAttachment>,
    @InjectRepository(PermitApplication)
    private readonly permitRepo: Repository<PermitApplication>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly s3Service: S3Service,
    private readonly notificationsService: NotificationsService,
    private readonly dataSource: DataSource,
  ) {}

  private async verifyUserAccessToApplication(
    applicationId: string,
    userId: string,
    userRole: UserRole,
  ): Promise<PermitApplication> {
    const application = await this.permitRepo.findOne({ where: { id: applicationId } });
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const isApplicant = application.applicantId === userId;
    const isAssignedReviewer = application.reviewerId === userId;
    const isAdmin = userRole === UserRole.ADMIN;

    if (!isApplicant && !isAssignedReviewer && !isAdmin) {
      throw new ForbiddenException('You do not have access to this application');
    }

    return application;
  }

  async sendMessage(
    applicationId: string,
    senderId: string,
    senderRole: UserRole,
    dto: SendMessageDto,
  ): Promise<MessageObject> {
    const application = await this.verifyUserAccessToApplication(applicationId, senderId, senderRole);

    if (application.status === ApplicationStatus.DRAFT) {
      throw new ForbiddenException('Messaging is not allowed on draft applications');
    }

    const sender = await this.userRepo.findOne({ where: { id: senderId } });
    if (!sender) {
      throw new NotFoundException('Sender not found');
    }

    const message = this.messageRepo.create({
      applicationId,
      senderId,
      body: dto.body,
      sentAt: new Date(),
    });

    const saved = await this.messageRepo.save(message);

    // Trigger notification to recipient (the other party)
    let recipientId: string | null = null;
    if (application.applicantId === senderId) {
      // Sender is applicant — notify assigned reviewer if any
      recipientId = application.reviewerId ?? null;
    } else {
      // Sender is reviewer/admin — notify applicant
      recipientId = application.applicantId;
    }

    if (recipientId) {
      try {
        await this.notificationsService.createNotification(
          recipientId,
          applicationId,
          `New message on application #${application.referenceNumber} from ${sender.fullName}.`,
        );
      } catch {
        // Non-blocking — notification failure should not abort message send
      }
    }

    return {
      id: saved.id,
      applicationId: saved.applicationId,
      senderId: saved.senderId,
      senderName: sender.fullName,
      senderRole: sender.role,
      body: saved.body,
      attachments: [],
      sentAt: saved.sentAt,
      readBy: [],
    };
  }

  async listMessages(
    applicationId: string,
    userId: string,
    userRole: UserRole,
    cursor?: string,
    limit = 50,
  ): Promise<PaginatedMessages> {
    await this.verifyUserAccessToApplication(applicationId, userId, userRole);

    const effectiveLimit = Math.min(limit, 50);

    let qb = this.messageRepo
      .createQueryBuilder('msg')
      .leftJoinAndSelect('msg.reads', 'reads')
      .leftJoinAndSelect('msg.attachments', 'attachments')
      .leftJoinAndSelect('msg.sender', 'sender')
      .where('msg.applicationId = :applicationId', { applicationId })
      .orderBy('msg.sentAt', 'ASC')
      .take(effectiveLimit + 1);

    if (cursor) {
      try {
        const cursorId = Buffer.from(cursor, 'base64').toString('utf-8');
        qb = qb.andWhere('msg.id > :cursorId', { cursorId });
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

    const data: MessageObject[] = rows.map((msg) => ({
      id: msg.id,
      applicationId: msg.applicationId,
      senderId: msg.senderId,
      senderName: msg.sender?.fullName ?? 'Unknown',
      senderRole: msg.sender?.role ?? UserRole.APPLICANT,
      body: msg.body,
      attachments: msg.attachments ?? [],
      sentAt: msg.sentAt,
      readBy: (msg.reads ?? []).map((r) => r.userId),
    }));

    return { data, nextCursor };
  }

  async markRead(messageId: string, userId: string): Promise<void> {
    // Upsert into message_reads using raw query for ON CONFLICT DO NOTHING
    await this.dataSource.query(
      `INSERT INTO message_reads (message_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [messageId, userId],
    );
  }

  async getUnreadCount(applicationId: string, userId: string, userRole: UserRole): Promise<{ unreadCount: number }> {
    await this.verifyUserAccessToApplication(applicationId, userId, userRole);

    const result = await this.dataSource.query(
      `SELECT COUNT(*) AS count
       FROM messages m
       WHERE m.application_id = $1
         AND NOT EXISTS (
           SELECT 1 FROM message_reads mr
           WHERE mr.message_id = m.id AND mr.user_id = $2
         )`,
      [applicationId, userId],
    );

    return { unreadCount: parseInt(result[0].count, 10) };
  }

  async getAttachmentUploadUrl(
    messageId: string,
    reviewerId: string,
    dto: MessageAttachmentUploadUrlDto,
  ): Promise<{ uploadUrl: string; storageKey: string; expiresAt: string }> {
    const message = await this.messageRepo.findOne({ where: { id: messageId } });
    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(dto.mimeType)) {
      throw new UnprocessableEntityException(
        `Invalid MIME type. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`,
      );
    }

    // Validate size
    if (dto.sizeBytes > MAX_SIZE_BYTES) {
      throw new UnprocessableEntityException('File size exceeds 25MB limit');
    }

    // Check existing attachment count
    const existingCount = await this.attachmentRepo.count({
      where: { messageId },
    });
    if (existingCount >= MAX_ATTACHMENTS_PER_MESSAGE) {
      throw new UnprocessableEntityException(
        `Maximum ${MAX_ATTACHMENTS_PER_MESSAGE} attachments per message`,
      );
    }

    const ext = path.extname(dto.filename).toLowerCase();
    const storageKey = `message-attachments/${message.applicationId}/${messageId}/${randomUUID()}${ext}`;

    const uploadUrl = await this.s3Service.getPresignedPutUrl(storageKey, PRESIGNED_URL_EXPIRY_SECONDS);
    const expiresAt = new Date(Date.now() + PRESIGNED_URL_EXPIRY_SECONDS * 1000).toISOString();

    return { uploadUrl, storageKey, expiresAt };
  }

  async registerAttachment(
    messageId: string,
    reviewerId: string,
    dto: RegisterMessageAttachmentDto,
  ): Promise<MessageAttachment> {
    const message = await this.messageRepo.findOne({ where: { id: messageId } });
    if (!message) {
      throw new NotFoundException('Message not found');
    }

    const attachment = this.attachmentRepo.create({
      messageId,
      filename: dto.filename,
      mimeType: dto.mimeType,
      sizeBytes: dto.sizeBytes,
      storageKey: dto.storageKey,
      uploadedAt: new Date(),
    });

    return this.attachmentRepo.save(attachment);
  }
}
