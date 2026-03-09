import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional, MinLength } from 'class-validator';

export class SignupDto {
  @ApiProperty({ example: 'Jane Doe', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'password123', minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password!: string;

  @ApiProperty({ example: 'customer', required: false })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiProperty({ example: '+14155551234', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'US', required: false })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ example: 'California', required: false })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ example: 'REF123', required: false })
  @IsOptional()
  @IsString()
  referralCode?: string;
}
