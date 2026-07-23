import { IsOptional, IsString, IsUUID, IsDateString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class AuditLogQueryDto {
  @IsOptional() @IsString() action?: string;           // comma-separated actions
  @IsOptional() @IsUUID() actorId?: string;
  @IsOptional() @IsUUID() applicationId?: string;
  @IsOptional() @IsDateString() from?: string;
  @IsOptional() @IsDateString() to?: string;
  @IsOptional() @IsString() cursor?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit?: number = 50;
}
