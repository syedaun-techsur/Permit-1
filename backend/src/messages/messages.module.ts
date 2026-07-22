import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { MessageRead } from './entities/message-read.entity';
import { MessageAttachment } from './entities/message-attachment.entity';
import { PermitApplication } from '../permits/entities/permit-application.entity';
import { User } from '../users/users.entity';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { DocumentsModule } from '../documents/documents.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Message,
      MessageRead,
      MessageAttachment,
      PermitApplication,
      User,
    ]),
    DocumentsModule,
    NotificationsModule,
    AuthModule,
  ],
  controllers: [MessagesController],
  providers: [MessagesService],
  exports: [MessagesService],
})
export class MessagesModule {}
