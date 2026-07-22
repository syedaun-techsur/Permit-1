import { IsString, IsOptional, MaxLength } from 'class-validator';

export class RespondToInfoDto {
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  responseNote?: string;
}
