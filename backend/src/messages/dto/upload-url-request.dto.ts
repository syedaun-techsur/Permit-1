import { IsString, IsNumber } from 'class-validator';

export class MessageAttachmentUploadUrlDto {
  @IsString()
  filename: string;

  @IsString()
  mimeType: string;

  @IsNumber()
  sizeBytes: number;
}
