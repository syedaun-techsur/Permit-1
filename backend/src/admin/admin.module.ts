import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/users.entity';
import { PermitApplication } from '../permits/entities/permit-application.entity';
import { AuditLog } from '../audit/entities/audit-log.entity';
import { RefreshToken } from '../users/refresh-token.entity';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, PermitApplication, AuditLog, RefreshToken]),
    AuthModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
