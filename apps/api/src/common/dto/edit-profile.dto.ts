import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength, MinLength } from 'class-validator';

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
}
