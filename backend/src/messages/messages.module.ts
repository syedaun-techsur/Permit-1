import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { MessageRead } from './entities/message-read.entity';
import { MessageAttachment } from './entities/message-attachment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Message, MessageRead, MessageAttachment])],
  exports: [TypeOrmModule],
})
export class MessagesModule {}
