import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  MaxLength,
  MinLength,
  IsNumber,
  IsDateString,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';

export class EditProfileDto {
  @ApiProperty({ example: 'Jane Doe', required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name?: string;

  @ApiProperty({ example: 'en', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  locale?: string;

  @ApiProperty({ example: '+447700900000', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @ApiProperty({ example: 'GB', description: 'ISO 3166-1 alpha-2 country code', required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(2)
  countryCode?: string;

  @ApiProperty({ example: 'CA', description: 'State / Province / Region', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  state?: string;

  /** Profile picture URL (e.g. Cloudinary). Customer profile. */
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  avatarUrl?: string;

  /** e.g. male, female, other, prefer_not_to_say. Customer profile. */
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  gender?: string;

  /** ISO date string (YYYY-MM-DD). Customer profile. */
  @ApiProperty({ example: '1990-01-15', required: false })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  /** Height in cm. Customer profile. */
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(50)
  @Max(300)
  heightCm?: number;

  /** Weight in kg. Customer profile. */
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(20)
  @Max(500)
  weightKg?: number;

  /** Pre-existing medical/health conditions. Customer profile. */
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  preExistingConditions?: string;

  /** Trainer: address line 1 */
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  streetLine1?: string;

  /** Trainer: address line 2 */
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  streetLine2?: string;

  /** Trainer: city */
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  city?: string;

  /** Trainer: postal code */
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  postalCode?: string;

  /** Trainer: language(s) spoken */
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  languageSpoken?: string;

  /** Trainer: about yourself / bio */
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(3000)
  about?: string;

  /** Trainer: years of experience */
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(80)
  yearsExperience?: number;

  /** Trainer: registered for GST/HST */
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  gstRegistered?: boolean;
}
