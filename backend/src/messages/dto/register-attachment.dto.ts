import { IsString, IsNumber } from 'class-validator';

export class RegisterMessageAttachmentDto {
  @IsString()
  filename: string;

  @IsString()
  mimeType: string;

  @IsNumber()
  sizeBytes: number;

  @IsString()
  storageKey: string;
}
