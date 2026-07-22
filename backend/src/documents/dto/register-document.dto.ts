import { IsString, Length, IsNumber, Min, Max, IsOptional } from 'class-validator';

export class RegisterDocumentDto {
  @IsString()
  @Length(1, 255)
  filename: string;

  @IsString()
  mimeType: string;

  @IsNumber()
  @Min(1)
  @Max(26214400) // max 25 MB
  sizeBytes: number;

  @IsOptional()
  @IsString()
  documentType?: string;

  @IsString()
  storageKey: string;
}
