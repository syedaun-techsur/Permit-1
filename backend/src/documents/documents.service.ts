import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { Document, DocumentStatus } from './entities/document.entity';
import { PermitApplication, ApplicationStatus } from '../permits/entities/permit-application.entity';
import { S3Service } from './s3.service';
import { UploadUrlRequestDto } from './dto/upload-url-request.dto';
import { RegisterDocumentDto } from './dto/register-document.dto';

const UPLOAD_ALLOWED_STATUSES: ApplicationStatus[] = [
  ApplicationStatus.DRAFT,
  ApplicationStatus.ADDITIONAL_INFO_NEEDED,
];

const MAX_DOCUMENTS_PER_APPLICATION = 20;
const MAX_TOTAL_SIZE_BYTES = 104857600; // 100 MB
const PRESIGNED_URL_EXPIRY_SECONDS = 900; // 15 minutes

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepo: Repository<Document>,
    @InjectRepository(PermitApplication)
    private readonly permitRepo: Repository<PermitApplication>,
    private readonly s3Service: S3Service,
  ) {}

  private async findApplicationAndVerifyOwner(
    applicationId: string,
    userId: string,
  ): Promise<PermitApplication> {
    const application = await this.permitRepo.findOne({
      where: { id: applicationId },
    });
    if (!application || application.applicantId !== userId) {
      throw new ForbiddenException(
        'You do not have access to this application',
      );
    }
    return application;
  }

  async getUploadUrl(
    userId: string,
    applicationId: string,
    dto: UploadUrlRequestDto,
  ): Promise<{ uploadUrl: string; storageKey: string; expiresAt: string }> {
    const application = await this.findApplicationAndVerifyOwner(
      applicationId,
      userId,
    );

    if (!UPLOAD_ALLOWED_STATUSES.includes(application.status)) {
      throw new UnprocessableEntityException(
        'Documents can only be uploaded when application is in draft or additional_info_needed status',
      );
    }

    // Count active documents
    const activeDocs = await this.documentRepo.find({
      where: { applicationId, status: DocumentStatus.UPLOADED },
    });

    if (activeDocs.length >= MAX_DOCUMENTS_PER_APPLICATION) {
      throw new UnprocessableEntityException('MAX_DOCUMENTS_REACHED');
    }

    // Check total size
    const totalSize = activeDocs.reduce((sum, doc) => sum + doc.sizeBytes, 0);
    if (totalSize + dto.sizeBytes > MAX_TOTAL_SIZE_BYTES) {
      throw new UnprocessableEntityException('MAX_TOTAL_SIZE_EXCEEDED');
    }

    // Generate storageKey server-side to prevent path traversal
    const sanitizedFilename = dto.filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storageKey = `${applicationId}/${randomUUID()}-${sanitizedFilename}`;

    const uploadUrl = await this.s3Service.getPresignedPutUrl(
      storageKey,
      PRESIGNED_URL_EXPIRY_SECONDS,
    );
    const expiresAt = new Date(
      Date.now() + PRESIGNED_URL_EXPIRY_SECONDS * 1000,
    ).toISOString();

    return { uploadUrl, storageKey, expiresAt };
  }

  async registerDocument(
    userId: string,
    applicationId: string,
    dto: RegisterDocumentDto,
  ): Promise<Document> {
    const application = await this.findApplicationAndVerifyOwner(
      applicationId,
      userId,
    );

    if (!UPLOAD_ALLOWED_STATUSES.includes(application.status)) {
      throw new UnprocessableEntityException(
        'Documents can only be registered when application is in draft or additional_info_needed status',
      );
    }

    const document = this.documentRepo.create({
      applicationId,
      uploadedBy: userId,
      filename: dto.filename,
      mimeType: dto.mimeType,
      sizeBytes: dto.sizeBytes,
      documentType: dto.documentType ?? null,
      storageKey: dto.storageKey,
      status: DocumentStatus.UPLOADED,
      uploadedAt: new Date(),
    });

    return this.documentRepo.save(document);
  }

  async listDocuments(
    userId: string,
    applicationId: string,
  ): Promise<Document[]> {
    await this.findApplicationAndVerifyOwner(applicationId, userId);

    return this.documentRepo
      .createQueryBuilder('doc')
      .where('doc.applicationId = :applicationId', { applicationId })
      .andWhere('doc.status != :deletedStatus', {
        deletedStatus: DocumentStatus.DELETED,
      })
      .orderBy('doc.uploadedAt', 'ASC')
      .getMany();
  }

  async getDocumentUrl(
    userId: string,
    applicationId: string,
    docId: string,
  ): Promise<{ url: string; expiresAt: string }> {
    await this.findApplicationAndVerifyOwner(applicationId, userId);

    const document = await this.documentRepo.findOne({
      where: { id: docId, applicationId },
    });

    if (!document || document.status === DocumentStatus.DELETED) {
      throw new NotFoundException('Document not found');
    }

    const url = await this.s3Service.getPresignedGetUrl(
      document.storageKey,
      PRESIGNED_URL_EXPIRY_SECONDS,
    );
    const expiresAt = new Date(
      Date.now() + PRESIGNED_URL_EXPIRY_SECONDS * 1000,
    ).toISOString();

    return { url, expiresAt };
  }

  async softDelete(
    userId: string,
    applicationId: string,
    docId: string,
  ): Promise<void> {
    const application = await this.findApplicationAndVerifyOwner(
      applicationId,
      userId,
    );

    if (!UPLOAD_ALLOWED_STATUSES.includes(application.status)) {
      throw new ForbiddenException('Cannot modify submitted application');
    }

    const document = await this.documentRepo.findOne({
      where: { id: docId, applicationId },
    });

    if (!document || document.status === DocumentStatus.DELETED) {
      throw new NotFoundException('Document not found');
    }

    document.status = DocumentStatus.DELETED;
    document.deletedAt = new Date();
    await this.documentRepo.save(document);

    // Fire-and-forget: schedule MinIO object deletion for audit window
    this.s3Service.scheduleDelete(document.storageKey).catch(() => {});
  }
}
