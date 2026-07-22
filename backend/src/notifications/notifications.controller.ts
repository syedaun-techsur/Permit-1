import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('unread-count')
  async getUnreadCount(@Request() req: Express.Request & { user: { id: string } }): Promise<{ unreadCount: number }> {
    const unreadCount = await this.notificationsService.getUnreadCount(req.user.id);
    return { unreadCount };
  }
}
