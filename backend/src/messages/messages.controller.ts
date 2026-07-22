import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';
import { MessagesService } from './messages.service';
import { SendMessageDto } from './dto/send-message.dto';
import { MessageAttachmentUploadUrlDto } from './dto/upload-url-request.dto';
import { RegisterMessageAttachmentDto } from './dto/register-attachment.dto';

interface AuthenticatedRequest {
  user: { id: string; email: string; role: UserRole };
}

@Controller('permits/:appId/messages')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  /**
   * GET /permits/:appId/messages
   * Returns cursor-paginated list of messages newest-first
   */
  @Get()
  async listMessages(
    @Param('appId', ParseUUIDPipe) appId: string,
    @Query('cursor') cursor: string | undefined,
    @Query('limit') limit: string | undefined,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.messagesService.listMessages(
      appId,
      req.user.id,
      req.user.role,
      cursor,
      limit ? parseInt(limit, 10) : 50,
    );
  }

  /**
   * POST /permits/:appId/messages
   * Send a message on an application (applicant or reviewer)
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.APPLICANT, UserRole.REVIEWER, UserRole.ADMIN)
  async sendMessage(
    @Param('appId', ParseUUIDPipe) appId: string,
    @Body() dto: SendMessageDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.messagesService.sendMessage(appId, req.user.id, req.user.role, dto);
  }

  /**
   * GET /permits/:appId/messages/unread-count
   * IMPORTANT: Must be declared BEFORE /:msgId routes
   */
  @Get('unread-count')
  async getUnreadCount(
    @Param('appId', ParseUUIDPipe) appId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.messagesService.getUnreadCount(appId, req.user.id, req.user.role);
  }

  /**
   * POST /permits/:appId/messages/:msgId/read
   * Mark a message as read for the authenticated user
   */
  @Post(':msgId/read')
  @HttpCode(HttpStatus.OK)
  async markRead(
    @Param('msgId', ParseUUIDPipe) msgId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    await this.messagesService.markRead(msgId, req.user.id);
    return { success: true };
  }

  /**
   * POST /permits/:appId/messages/:msgId/attachments/upload-url
   * Reviewer only — returns presigned PUT URL
   */
  @Post(':msgId/attachments/upload-url')
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.REVIEWER, UserRole.ADMIN)
  async getAttachmentUploadUrl(
    @Param('msgId', ParseUUIDPipe) msgId: string,
    @Body() dto: MessageAttachmentUploadUrlDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.messagesService.getAttachmentUploadUrl(msgId, req.user.id, dto);
  }

  /**
   * POST /permits/:appId/messages/:msgId/attachments
   * Reviewer only — registers attachment metadata
   */
  @Post(':msgId/attachments')
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.REVIEWER, UserRole.ADMIN)
  async registerAttachment(
    @Param('msgId', ParseUUIDPipe) msgId: string,
    @Body() dto: RegisterMessageAttachmentDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.messagesService.registerAttachment(msgId, req.user.id, dto);
  }
}
