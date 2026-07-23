import { IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString() @MinLength(2) fullName: string;
  @IsEmail() email: string;
  @IsIn(['applicant', 'reviewer', 'admin']) role: 'applicant' | 'reviewer' | 'admin';
  @IsOptional() @IsString() @MinLength(8) temporaryPassword?: string;
}
