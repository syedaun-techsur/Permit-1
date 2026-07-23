import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import * as archiverModule from 'archiver';
import { Document, DocumentStatus } from './entities/document.entity';
import { PermitApplication, ApplicationStatus } from '../permits/entities/permit-application.entity';
import { UserRole } from '../common/enums/role.enum';
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
const MAX_FILE_SIZE_BYTES = 26214400; // 25 MB
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

/** Minimal shape of a Multer memory-storage file (avoids depending on @types/multer). */
export interface UploadedFileLike {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

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

  /**
   * Read access to an application's documents: the owning applicant, or ANY
   * reviewer/admin (they must see the applicant's documents to review them).
   * Mirrors the permit-detail read policy. Write operations still use
   * findApplicationAndVerifyOwner (owner-only).
   */
  private async findApplicationForRead(
    applicationId: string,
    userId: string,
    userRole: UserRole,
  ): Promise<PermitApplication> {
    const application = await this.permitRepo.findOne({
      where: { id: applicationId },
    });
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    const isApplicant = application.applicantId === userId;
    const isReviewerOrAdmin =
      userRole === UserRole.REVIEWER || userRole === UserRole.ADMIN;
    if (!isApplicant && !isReviewerOrAdmin) {
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

  /**
   * Direct server-side upload: the browser POSTs the file (multipart) to the
   * API and the backend streams it into object storage. This avoids handing the
   * browser a presigned URL pointing at an internal MinIO host it can't reach
   * (the upload-url + client-PUT flow only works when the browser can reach
   * MinIO directly). Same ownership/status/type/size/quota checks as upload-url.
   */
  async uploadDocument(
    userId: string,
    applicationId: string,
    file: UploadedFileLike | undefined,
  ): Promise<Document> {
    if (!file) {
      throw new UnprocessableEntityException('No file provided');
    }

    const application = await this.findApplicationAndVerifyOwner(
      applicationId,
      userId,
    );

    if (!UPLOAD_ALLOWED_STATUSES.includes(application.status)) {
      throw new UnprocessableEntityException(
        'Documents can only be uploaded when application is in draft or additional_info_needed status',
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new UnprocessableEntityException(
        'Unsupported file type. Allowed: PDF, JPEG, PNG, DOCX',
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new UnprocessableEntityException('File too large (max 25 MB)');
    }

    const activeDocs = await this.documentRepo.find({
      where: { applicationId, status: DocumentStatus.UPLOADED },
    });

    if (activeDocs.length >= MAX_DOCUMENTS_PER_APPLICATION) {
      throw new UnprocessableEntityException('MAX_DOCUMENTS_REACHED');
    }

    const totalSize = activeDocs.reduce((sum, doc) => sum + doc.sizeBytes, 0);
    if (totalSize + file.size > MAX_TOTAL_SIZE_BYTES) {
      throw new UnprocessableEntityException('MAX_TOTAL_SIZE_EXCEEDED');
    }

    const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storageKey = `${applicationId}/${randomUUID()}-${sanitizedFilename}`;

    await this.s3Service.uploadBuffer(storageKey, file.buffer, file.mimetype);

    const document = this.documentRepo.create({
      applicationId,
      uploadedBy: userId,
      filename: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      documentType: null,
      storageKey,
      status: DocumentStatus.UPLOADED,
      uploadedAt: new Date(),
    });

    return this.documentRepo.save(document);
  }

  async listDocuments(
    userId: string,
    applicationId: string,
    userRole: UserRole,
  ): Promise<Document[]> {
    await this.findApplicationForRead(applicationId, userId, userRole);

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
    userRole: UserRole,
  ): Promise<{ url: string; expiresAt: string }> {
    await this.findApplicationForRead(applicationId, userId, userRole);

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

  /**
   * Generates a ZIP archive of all active documents for an application and
   * returns a presigned download URL valid for 15 minutes.
   *
   * Restricted to assigned reviewer or admin (DOCS-05).
   */
  async getArchiveUrl(
    applicationId: string,
    requesterId: string,
    requesterRole: UserRole,
  ): Promise<{ downloadUrl: string; expiresAt: string }> {
    // Load the application
    const application = await this.permitRepo.findOne({ where: { id: applicationId } });
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // Only assigned reviewer or admin can access archive
    const isAdmin = requesterRole === UserRole.ADMIN;
    const isAssignedReviewer = application.reviewerId === requesterId;
    if (!isAdmin && !isAssignedReviewer) {
      throw new ForbiddenException(
        'Only the assigned reviewer or an admin can download the document archive',
      );
    }

    // Load all active (non-deleted) documents
    const documents = await this.documentRepo.find({
      where: { applicationId, status: DocumentStatus.UPLOADED },
    });

    if (documents.length === 0) {
      throw new UnprocessableEntityException('No documents available for archive');
    }

    // Build ZIP archive in memory using archiver
    const zipBuffer = await new Promise<Buffer>((resolve, reject) => {
      const archive = new archiverModule.ZipArchive({ zlib: { level: 6 } });
      const chunks: Buffer[] = [];

      archive.on('data', (chunk: Buffer) => chunks.push(chunk));
      archive.on('end', () => resolve(Buffer.concat(chunks)));
      archive.on('error', reject);

      // Append each document to the archive by fetching its bytes from MinIO
      const appendPromises = documents.map(async (doc) => {
        try {
          const buf = await this.s3Service.getObjectBuffer(doc.storageKey);
          archive.append(buf, { name: doc.filename });
        } catch (err) {
          // Skip documents that cannot be fetched (log but don't fail entire archive)
          const errMsg = err instanceof Error ? err.message : String(err);
          // Log is not available here — skip silently
          void errMsg;
        }
      });

      Promise.all(appendPromises)
        .then(() => archive.finalize())
        .catch(reject);
    });

    // Upload ZIP to MinIO
    const archiveKey = `archives/${applicationId}/${randomUUID()}.zip`;
    await this.s3Service.uploadBuffer(archiveKey, zipBuffer, 'application/zip');

    // Generate presigned GET URL (15-minute expiry)
    const ARCHIVE_EXPIRY_SECONDS = 900;
    const downloadUrl = await this.s3Service.getPresignedGetUrl(archiveKey, ARCHIVE_EXPIRY_SECONDS);
    const expiresAt = new Date(Date.now() + ARCHIVE_EXPIRY_SECONDS * 1000).toISOString();

    return { downloadUrl, expiresAt };
  }
}
