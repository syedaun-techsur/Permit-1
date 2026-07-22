import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Document } from './entities/document.entity';
import { PermitApplication } from '../permits/entities/permit-application.entity';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { S3Service } from './s3.service';

@Module({
  imports: [TypeOrmModule.forFeature([Document, PermitApplication])],
  controllers: [DocumentsController],
  providers: [DocumentsService, S3Service],
  exports: [DocumentsService],
})
export class DocumentsModule {}
