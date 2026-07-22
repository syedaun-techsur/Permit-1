import {
  IsString,
  IsEnum,
  IsEmail,
  IsOptional,
  IsNumber,
  IsDateString,
  Length,
  Matches,
  MaxLength,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PermitType } from '../entities/permit-application.entity';

export class SiteAddressDto {
  @IsString()
  @Length(1, 200)
  street: string;

  @IsString()
  @Length(1, 100)
  city: string;

  @IsString()
  @Length(2, 2)
  state: string;

  @Matches(/^\d{5}(-\d{4})?$/)
  zipCode: string;
}

export class CreatePermitDto {
  @IsEnum(PermitType)
  permitType: PermitType;

  @IsString()
  @Length(10, 5000)
  projectDescription: string;

  @ValidateNested()
  @Type(() => SiteAddressDto)
  siteAddress: SiteAddressDto;

  @IsString()
  @Length(1, 100)
  contactName: string;

  @IsString()
  @Length(1, 30)
  contactPhone: string;

  @IsEmail()
  contactEmail: string;

  @IsOptional()
  @IsDateString()
  estimatedStartDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(999999999)
  estimatedValue?: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  additionalNotes?: string;
}
