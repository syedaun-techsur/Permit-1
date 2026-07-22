import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';
import { UserRole } from '../common/enums/role.enum';

interface AuthenticatedRequest {
  user: { id: string; email: string; role: UserRole };
}

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * GET /notifications
   * Returns cursor-paginated notifications for the authenticated user (newest first).
   */
  @Get()
  async listNotifications(
    @Query('cursor') cursor: string | undefined,
    @Query('limit') limit: string | undefined,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.notificationsService.listNotifications(
      req.user.id,
      cursor,
      limit ? parseInt(limit, 10) : 50,
    );
  }

  /**
   * GET /notifications/unread-count
   * Returns the number of unread notifications for the authenticated user.
   */
  @Get('unread-count')
  async getUnreadCount(@Request() req: AuthenticatedRequest): Promise<{ unreadCount: number }> {
    const unreadCount = await this.notificationsService.getUnreadCount(req.user.id);
    return { unreadCount };
  }

  /**
   * PATCH /notifications/read-all
   * Marks all unread notifications as read for the authenticated user.
   * IMPORTANT: Must be declared BEFORE /:notifId/read to prevent NestJS from
   * treating "read-all" as a notifId param.
   */
  @Patch('read-all')
  @HttpCode(HttpStatus.OK)
  async markAllRead(@Request() req: AuthenticatedRequest) {
    return this.notificationsService.markAllRead(req.user.id);
  }

  /**
   * PATCH /notifications/:notifId/read
   * Marks one notification as read for the owning user.
   */
  @Patch(':notifId/read')
  @HttpCode(HttpStatus.OK)
  async markOneRead(
    @Param('notifId', ParseUUIDPipe) notifId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    await this.notificationsService.markOneRead(notifId, req.user.id);
    return { success: true };
  }
}
