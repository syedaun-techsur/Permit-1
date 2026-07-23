import { IsOptional, IsIn, IsUUID, IsDateString, IsInt, Min, Max, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class AdminPermitsQueryDto {
  @IsOptional() @IsString() status?: string;           // comma-separated statuses
  @IsOptional() @IsString() permitType?: string;
  @IsOptional() @IsString() reviewerId?: string;       // uuid | 'unassigned'
  @IsOptional() @IsDateString() from?: string;
  @IsOptional() @IsDateString() to?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit?: number = 25;
  @IsOptional() @IsString() sortBy?: string = 'submittedAt';
  @IsOptional() @IsIn(['ASC', 'DESC']) sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
