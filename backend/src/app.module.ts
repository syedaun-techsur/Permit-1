import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { DocumentsModule } from './documents/documents.module';
import { HealthController } from './health/health.controller';
import { PermitsModule } from './permits/permits.module';
import { LifecycleModule } from './lifecycle/lifecycle.module';
import { AuditModule } from './audit/audit.module';
import { NotificationsModule } from './notifications/notifications.module';
import { MessagesModule } from './messages/messages.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    DatabaseModule,
    AuthModule,
    DocumentsModule,
    PermitsModule,
    LifecycleModule,
    AuditModule,
    NotificationsModule,
    MessagesModule,
    DashboardModule,
    AdminModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
