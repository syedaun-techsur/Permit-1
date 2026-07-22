import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermitApplication } from './entities/permit-application.entity';
import { Document } from '../documents/entities/document.entity';
import { PermitsController } from './permits.controller';
import { PermitsService } from './permits.service';
import { LifecycleModule } from '../lifecycle/lifecycle.module';
import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PermitApplication, Document]),
    LifecycleModule,
    AuditModule,
    AuthModule,
    NotificationsModule,
  ],
  controllers: [PermitsController],
  providers: [PermitsService],
  exports: [PermitsService],
})
export class PermitsModule {}
