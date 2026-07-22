import { IsString, Length, IsIn, IsNumber, Min, Max } from 'class-validator';

export class UploadUrlRequestDto {
  @IsString()
  @Length(1, 255)
  filename: string;

  @IsString()
  @IsIn([
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ])
  mimeType: string;

  @IsNumber()
  @Min(1)
  @Max(26214400) // max 25 MB
  sizeBytes: number;
}
