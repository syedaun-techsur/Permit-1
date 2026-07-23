import { IsBoolean, IsIn, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional() @IsIn(['applicant', 'reviewer', 'admin']) role?: 'applicant' | 'reviewer' | 'admin';
}
