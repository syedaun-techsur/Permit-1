import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ParseUUIDPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DocumentsService } from './documents.service';
import { UploadUrlRequestDto } from './dto/upload-url-request.dto';
import { RegisterDocumentDto } from './dto/register-document.dto';

@Controller('permits/:id/documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  /**
   * POST /permits/:id/documents/upload-url
   * Returns a presigned PUT URL valid for 15 minutes and a storage_key.
   */
  @Post('upload-url')
  async getUploadUrl(
    @Param('id', ParseUUIDPipe) applicationId: string,
    @Body() dto: UploadUrlRequestDto,
    @Request() req: any,
  ) {
    return this.documentsService.getUploadUrl(req.user.id, applicationId, dto);
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
    @Request() req: any,
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
    @Request() req: any,
  ) {
    return this.documentsService.listDocuments(req.user.id, applicationId);
  }

  /**
   * GET /permits/:id/documents/:docId/url
   * Returns a presigned GET URL valid for 15 minutes.
   */
  @Get(':docId/url')
  async getUrl(
    @Param('id', ParseUUIDPipe) applicationId: string,
    @Param('docId', ParseUUIDPipe) docId: string,
    @Request() req: any,
  ) {
    return this.documentsService.getDocumentUrl(
      req.user.id,
      applicationId,
      docId,
    );
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
    @Request() req: any,
  ) {
    await this.documentsService.softDelete(req.user.id, applicationId, docId);
    return { message: 'Document deleted successfully' };
  }
}
