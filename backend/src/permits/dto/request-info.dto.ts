import { IsString, MinLength, MaxLength } from 'class-validator';

export class RequestInfoDto {
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  infoRequestNote: string;
}
