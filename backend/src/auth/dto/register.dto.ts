import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Please enter a valid email address.' })
  email: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  fullName: string;

  @IsString()
  @MinLength(8, { message: 'Password must be 8–128 characters.' })
  @MaxLength(128)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d])/, {
    message: 'Password must contain uppercase, lowercase, digit, and special character.',
  })
  password: string;

  @IsString()
  confirmPassword: string;
}
