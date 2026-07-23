import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  Request,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  StreamableFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ParseUUIDPipe } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';
import { DocumentsService, UploadedFileLike } from './documents.service';
import { UploadUrlRequestDto } from './dto/upload-url-request.dto';
import { RegisterDocumentDto } from './dto/register-document.dto';

interface AuthenticatedRequest {
  user: { id: string; email: string; role: UserRole };
}

@Controller('permits/:id/documents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  /**
   * GET /permits/:id/documents/archive
   * Returns a presigned ZIP download URL valid for 15 minutes.
   * Reviewer/admin only. MUST be declared BEFORE /:docId/url.
   */
  @Get('archive')
  @Roles(UserRole.REVIEWER, UserRole.ADMIN)
  async getArchiveUrl(
    @Param('id', ParseUUIDPipe) applicationId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.documentsService.getArchiveUrl(applicationId, req.user.id, req.user.role);
  }

  /**
   * GET /permits/:id/documents/archive/download
   * Streams a ZIP of all documents straight to the browser (same-origin,
   * authenticated) — avoids a presigned URL to an internal object-store host.
   * Declared before the :docId routes so "archive" isn't parsed as a docId.
   */
  @Get('archive/download')
  @Roles(UserRole.REVIEWER, UserRole.ADMIN)
  async downloadArchive(
    @Param('id', ParseUUIDPipe) applicationId: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<StreamableFile> {
    const { buffer, filename } = await this.documentsService.getArchiveBuffer(
      applicationId,
      req.user.id,
      req.user.role,
    );
    return new StreamableFile(buffer, {
      type: 'application/zip',
      disposition: `attachment; filename="${filename}"`,
    });
  }

  /**
   * POST /permits/:id/documents/upload-url
   * Returns a presigned PUT URL valid for 15 minutes and a storage_key.
   */
  @Post('upload-url')
  async getUploadUrl(
    @Param('id', ParseUUIDPipe) applicationId: string,
    @Body() dto: UploadUrlRequestDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.documentsService.getUploadUrl(req.user.id, applicationId, dto);
  }

  /**
   * POST /permits/:id/documents/upload
   * Direct multipart upload: accepts the file, stores it in object storage
   * server-side, and creates the document record. Preferred over the
   * presigned-URL flow because it works even when the browser cannot reach
   * the object store directly (e.g. behind a preview proxy).
   */
  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 52428800 } }))
  async upload(
    @Param('id', ParseUUIDPipe) applicationId: string,
    @UploadedFile() file: UploadedFileLike,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.documentsService.uploadDocument(req.user.id, applicationId, file);
  }

  /**
   * POST /permits/:id/documents
   * Registers document metadata after a successful presigned PUT upload.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Param('id', ParseUUIDPipe) applicationId: string,
    @Body() dto: RegisterDocumentDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.documentsService.registerDocument(
      req.user.id,
      applicationId,
      dto,
    );
  }

  /**
   * GET /permits/:id/documents
   * Returns active (non-deleted) documents for the application.
   */
  @Get()
  async list(
    @Param('id', ParseUUIDPipe) applicationId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.documentsService.listDocuments(req.user.id, applicationId, req.user.role);
  }

  /**
   * GET /permits/:id/documents/:docId/url
   * Returns a presigned GET URL valid for 15 minutes.
   */
  @Get(':docId/url')
  async getUrl(
    @Param('id', ParseUUIDPipe) applicationId: string,
    @Param('docId', ParseUUIDPipe) docId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.documentsService.getDocumentUrl(
      req.user.id,
      applicationId,
      docId,
      req.user.role,
    );
  }

  /**
   * GET /permits/:id/documents/:docId/download
   * Streams a single document's bytes straight to the browser (same-origin,
   * authenticated). The client fetches this as a blob for preview/download.
   */
  @Get(':docId/download')
  async downloadDocument(
    @Param('id', ParseUUIDPipe) applicationId: string,
    @Param('docId', ParseUUIDPipe) docId: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<StreamableFile> {
    const { buffer, filename, mimeType } =
      await this.documentsService.getDocumentBuffer(
        req.user.id,
        applicationId,
        docId,
        req.user.role,
      );
    return new StreamableFile(buffer, {
      type: mimeType,
      disposition: `attachment; filename="${filename}"`,
    });
  }

  /**
   * DELETE /permits/:id/documents/:docId
   * Soft-deletes the document (sets status='deleted', deleted_at=now()).
   */
  @Delete(':docId')
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id', ParseUUIDPipe) applicationId: string,
    @Param('docId', ParseUUIDPipe) docId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    await this.documentsService.softDelete(req.user.id, applicationId, docId);
    return { message: 'Document deleted successfully' };
  }
}
